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
  const { user, loading, setUser, updateUser, deleteUser } = useUser();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    bio: user?.bio || '',
  });

  // Handle form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Edit profile handler using useUser hook
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await updateUser(formData);
      setUser(updatedUser); // update global user state
      setOpen(false);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete user handler using useUser hook
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteUser();
      setUser(null); // clear user state
      window.location.href = '/login';
    } catch (err) {
      alert('Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

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
                  Update your profile information. Changes will be saved to your account.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <Input
                    name="department"
                    placeholder={user.department || 'e.g., Computer Science'}
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <Textarea
                    name="bio"
                    placeholder={user.bio || 'A short bio about yourself'}
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {/* Delete Account Button */}
          <Button
            variant="destructive"
            className="w-full mt-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
