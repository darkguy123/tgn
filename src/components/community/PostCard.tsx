'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useMemberProfile } from '@/hooks/useMemberProfile';
import { Separator } from '@/components/ui/separator';
import type { Post, Comment as CommentType } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, updateDoc, doc, increment, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function PostComments({ post }: { post: Post }) {
  const { profile } = useMemberProfile();
  const firestore = useFirestore();
  const { toast } = useToast();

  const commentsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, 'posts', post.id, 'comments'), orderBy('createdAt', 'asc')) : null,
    [firestore, post.id]
  );
  const { data: comments, isLoading: commentsLoading } = useCollection<CommentType>(commentsQuery);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<{ content: string }>();

  const handleCommentSubmit = (data: { content: string }) => {
    if (!profile || !firestore || !data.content.trim()) return;

    const postRef = doc(firestore, 'posts', post.id);
    const commentsColRef = collection(postRef, 'comments');
    const dataToSave = {
        content: data.content,
        authorId: profile.id,
        authorName: profile.name || profile.email?.split('@')[0] || 'Member',
        authorAvatarUrl: profile.avatarUrl || '',
        createdAt: serverTimestamp(),
    };
    
    addDoc(commentsColRef, dataToSave)
      .then(() => {
        // Increment the commentsCount on the post
        updateDoc(postRef, { commentsCount: increment(1) });
        reset();
      })
      .catch((e) => {
        console.error("Error submitting comment: ", e);
        const permissionError = new FirestorePermissionError({
            path: commentsColRef.path,
            operation: 'create',
            requestResourceData: dataToSave
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post your comment.'})
      });
  };

  return (
    <div className="pt-4 mt-4 border-t">
      <form onSubmit={handleSubmit(handleCommentSubmit)} className="flex items-start gap-3 mb-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile?.avatarUrl} />
          <AvatarFallback>{profile?.email?.charAt(0) || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
            <Textarea 
                placeholder="Write a comment..." 
                className="bg-muted border-none min-h-[40px]"
                {...register('content', { required: true })}
            />
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
        </div>
      </form>

      <div className="space-y-4">
        {commentsLoading && <p className="text-sm text-muted-foreground">Loading comments...</p>}
        {comments?.map(comment => (
           <div key={comment.id} className="flex items-start gap-3">
             <Avatar className="h-8 w-8">
                <AvatarImage src={comment.authorAvatarUrl} />
                <AvatarFallback>{comment.authorName?.charAt(0) || '?'}</AvatarFallback>
             </Avatar>
             <div className="bg-muted p-3 rounded-lg flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{comment.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                        {comment.createdAt?.toDate ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : 'just now'}
                    </p>
                </div>
                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
             </div>
           </div>
        ))}
        {!commentsLoading && comments?.length === 0 && (
          <p className="text-sm text-center text-muted-foreground py-4">Be the first to comment.</p>
        )}
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { profile } = useMemberProfile();
  const { toast } = useToast();

  // Safety check: ensure likes are treated as an array
  const likesArr = Array.isArray(post.likes) ? post.likes : [];

  const isLiked = useMemo(() => likesArr.includes(currentUser?.uid ?? ''), [likesArr, currentUser]);
  const isAuthor = currentUser?.uid === post.authorId;
  
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const handleReportPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !currentUser || !reportReason.trim()) return;
    
    setIsSubmittingReport(true);
    try {
      const reportsRef = collection(firestore, 'reports');
      await addDoc(reportsRef, {
        postId: post.id,
        postAuthorId: post.authorId,
        reportedBy: currentUser.uid,
        reason: reportReason,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Report Submitted', description: 'Thank you for keeping TGN safe.' });
      setIsReportOpen(false);
      setReportReason('');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit report.' });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleLike = () => {
    if (!firestore || !currentUser) {
        toast({ variant: 'destructive', title: 'You must be logged in to like posts.'});
        return;
    };
    const postRef = doc(firestore, 'posts', post.id);
    const payload = {
        likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
    };

    updateDoc(postRef, payload)
      .catch((error) => {
        console.error("Error liking post: ", error);
        const permissionError = new FirestorePermissionError({
            path: postRef.path,
            operation: 'update',
            requestResourceData: payload
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update like.' });
      });
  };



  const handleDelete = () => {
    if (!firestore || !currentUser || !isAuthor) return;
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const postRef = doc(firestore, 'posts', post.id);
    deleteDoc(postRef)
      .then(() => {
        toast({ title: 'Success', description: 'Post deleted.' });
      })
      .catch((error) => {
        console.error("Error deleting post: ", error);
        const permissionError = new FirestorePermissionError({
            path: postRef.path,
            operation: 'delete'
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete post.' });
      });
  };

  const likesCount = likesArr.length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={post.authorAvatarUrl} />
              <AvatarFallback>{post.authorName?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/member/${post.authorTgnMemberId || post.authorId}`}>
                <h4 className="font-semibold hover:underline">{post.authorName}</h4>
              </Link>
              <p className="text-xs text-muted-foreground">
                {post.createdAt?.toDate ? formatDistanceToNow(post.createdAt.toDate(), { addSuffix: true }) : 'just now'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthor && (
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Post
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setIsReportOpen(true)}>Report Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {post.content && <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>}
        {post.media && post.media.length > 0 && (
          <div className={`grid gap-2 grid-cols-${post.media.length > 1 ? 2 : 1} mb-4`}>
            {post.media.map(mediaItem => (
                <div key={mediaItem.url} className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-muted">
                  {mediaItem.type.startsWith('video/') ? (
                    <video src={mediaItem.url} controls className="object-cover w-full h-full bg-black" />
                  ) : (
                    <Image
                      src={mediaItem.url}
                      alt="Post content"
                      fill
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
              ))}
          </div>
        )}
        <Collapsible>
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                    {likesCount > 0 && (
                        <>
                        <ThumbsUp className="h-4 w-4 text-blue-500" />
                        <span>{Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(likesCount)}</span>
                        </>
                    )}
                </div>
                 <CollapsibleTrigger asChild>
                    <button className="hover:underline">{(post.commentsCount || 0)} Comments</button>
                 </CollapsibleTrigger>
            </div>
            <Separator className="mb-2" />
            <div className="flex justify-around">
                 <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground" onClick={handleLike}>
                    <ThumbsUp className={cn("h-5 w-5", isLiked && "fill-blue-500 text-blue-500")} /> Like
                </Button>
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-5 w-5" /> Comment
                    </Button>
                </CollapsibleTrigger>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex-1 flex items-center gap-2 text-muted-foreground">
                        <Share2 className="h-5 w-5" /> Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => {
                      const url = window ? `${window.location.origin}/community/post/${post.id}` : '';
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Check out this post on TGN! ' + url)}`, '_blank');
                    }}>WhatsApp</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const url = window ? `${window.location.origin}/community/post/${post.id}` : '';
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}>Facebook</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      const url = window ? `${window.location.origin}/community/post/${post.id}` : '';
                      navigator.clipboard.writeText(url);
                      toast({ title: 'Link copied to clipboard' });
                    }}>Copy Link</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <CollapsibleContent>
                <PostComments post={post} />
            </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <Dialog open={isReportOpen} onOpenChange={(open) => {
        setIsReportOpen(open);
        if (!open) {
          setTimeout(() => {
            document.body.style.pointerEvents = 'auto';
          }, 100);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Post</DialogTitle>
            <DialogDescription>
              Please provide a reason for reporting this post. Our team will review it.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReportPost}>
            <Textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this content?"
              className="mt-4 mb-4"
              required
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsReportOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={isSubmittingReport}>
                {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
