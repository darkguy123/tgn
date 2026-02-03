'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Shield,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useMemoFirebase, errorEmitter, FirestorePermissionError, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import type { TGNMember } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { roles } from '@/lib/data';
import { useMemberProfile } from '@/hooks/useMemberProfile';

export default function AdminUsersPage() {
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { profile } = useMemberProfile();
  const usersRef = useMemoFirebase(() => (firestore && currentUser && profile ? collection(firestore, 'users') : null), [firestore, currentUser, profile]);
  const { data: users, isLoading, error } = useCollection<TGNMember>(usersRef);
  const { toast } = useToast();

  const handleRoleChange = (userId: string, newRole: TGNMember['role']) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', userId);
    
    updateDoc(userDocRef, { role: newRole })
      .then(() => {
        toast({
          title: 'Role Updated',
          description: `User role has been changed to ${newRole}.`,
        });
      })
      .catch((serverError) => {
        console.error("Failed to update user role: ", serverError);
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'update',
          requestResourceData: { role: newRole }
        });
        errorEmitter.emit('permission-error', permissionError);
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: 'Could not update the user role.',
        });
      });
  };

  const renderTable = (userList: TGNMember[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Member ID</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {userList.map(user => (
          <TableRow key={user.id}>
            <TableCell>{user.name || user.email.split('@')[0]}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="font-mono">{user.tgnMemberId}</TableCell>
            <TableCell>
              <Badge variant="secondary">{user.role}</Badge>
            </TableCell>
            <TableCell className="text-right">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Change Role</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                {roles.map(role => (
                                    <DropdownMenuItem key={role.id} onClick={() => handleRoleChange(user.id, role.id as TGNMember['role'])}>
                                        {role.title}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
        {userList.length === 0 && (
            <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                    No users found.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage member roles and permissions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-6">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-12 w-full mt-2" />)}
            </div>}

            {error && <p className="p-6 text-destructive">Failed to load users.</p>}

            {!isLoading && users && renderTable(users)}
        </CardContent>
      </Card>
    </div>
  );
}