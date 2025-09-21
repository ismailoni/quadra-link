'use client';
import React, { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProfilePage: React.FC = () => {
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="w-full max-w-md p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center mt-20">
        <Card className="w-full max-w-md p-6 text-center">
          <p className="text-muted-foreground text-lg">
            Please log in to view your profile.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2">
              <AvatarImage src={user.avatar || '/default-avatar.png'} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <span className="text-sm text-blue-600 font-medium">{user.school}</span>
            </div>
          </div>

          <div className="space-y-2 text-base">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            {user.department && (
              <p>
                <strong>Department:</strong> {user.department}
              </p>
            )}
            {user.bio && (
              <p>
                <strong>Bio:</strong> {user.bio}
              </p>
            )}
          </div>

          {/* Edit Profile Modal */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your profile information. Changes will reflect once saved.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  alert('Profile updated (frontend only for now)!');
                }}
                className="space-y-4 mt-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input defaultValue={user.name} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Input defaultValue={user.department || ''} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea defaultValue={user.bio || ''} />
                </div>
                <DialogFooter>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
