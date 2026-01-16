'use client';

import { useParams, notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin,
  Calendar,
  Star,
  Users,
  Mail,
  MoreHorizontal,
} from 'lucide-react';
import { members } from '@/lib/data';
import placeholderImages from '@/lib/placeholder-images.json';
import { Separator } from '@/components/ui/separator';

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function ProfilePage() {
  const params = useParams();
  const memberId = params.memberId as string;

  const member = members.find((m) => m.id === memberId);

  if (!member) {
    return notFound();
  }

  const avatarImg = getImage(member.imageId);
  const bannerImg = getImage(member.bannerImageId || 'profile-banner-default');

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        {/* Banner and Avatar */}
        <div className="relative">
          {bannerImg && (
            <Image
              src={bannerImg.imageUrl}
              alt="Profile banner"
              width={1200}
              height={300}
              className="h-48 w-full object-cover"
              data-ai-hint={bannerImg.imageHint}
            />
          )}
          <div className="absolute -bottom-16 left-6">
            <Avatar className="h-32 w-32 rounded-full border-4 border-card">
              <AvatarImage src={avatarImg?.imageUrl} alt={member.name} />
              <AvatarFallback className="text-4xl">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Actions */}
        <div className="flex justify-end p-4 pt-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Message
            </Button>
            <Button variant="default">Follow</Button>
          </div>
        </div>

        {/* Profile Info */}
        <CardContent className="pt-0 pb-6 px-6">
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{member.name}</h1>
            <p className="text-sm text-muted-foreground">@{member.tgnId}</p>
          </div>

          <p className="mt-4 text-foreground/90">{member.profile}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{member.location}</span>
            </div>
            {member.joinDate && (
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {member.joinDate}</span>
                </div>
            )}
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4" />
              <span>Badge Level {member.badge}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">
                {member.connections}
              </span>
              <span className="text-muted-foreground">Connections</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-foreground">128</span>
              <span className="text-muted-foreground">Following</span>
            </div>
          </div>
        </CardContent>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="px-6 border-b-0 rounded-none w-full justify-start bg-transparent">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>
          <TabsContent value="activity" className="p-6 pt-4">
            <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                No recent activity to show.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="mentorship" className="p-6 pt-4">
            <h3 className="font-semibold text-lg mb-4">Mentorship Journey</h3>
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Mentorship details will appear here.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="achievements" className="p-6 pt-4">
            <h3 className="font-semibold text-lg mb-4">
              Badges & Certifications
            </h3>
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Achievements will be displayed here.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="posts" className="p-6 pt-4">
            <h3 className="font-semibold text-lg mb-4">Member Posts</h3>
            <div className="border rounded-lg p-6 text-center">
              <p className="text-muted-foreground">
                Posts by {member.name} will be shown here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
