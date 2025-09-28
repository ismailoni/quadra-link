'use client';
import React, { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Mail, GraduationCap, UserCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, loading, setUser, updateUser, deleteUser } = useUser();
  const [open, setOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    firstname: user?.Firstname || '',
    lastname: user?.Lastname || '',
    pseudoname: user?.Pseudoname || '',
    department: user?.department || '',
    bio: user?.bio || '',
    level: user?.level || '',
  });
  const submitCtrl = useRef<AbortController | null>(null);
  const deleteCtrl = useRef<AbortController | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    submitCtrl.current?.abort();
    submitCtrl.current = new AbortController();
    try {
      const updatedUser = await updateUser(formData, { signal: submitCtrl.current.signal, timeoutMs: 20_000 });
      setUser(updatedUser ?? null);
      setOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      if (err?.name === 'AbortError') toast.message('Update canceled');
      else toast.error(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    deleteCtrl.current?.abort();
    deleteCtrl.current = new AbortController();
    try {
      await deleteUser({ signal: deleteCtrl.current.signal, timeoutMs: 20_000 });
      setUser(null);
      toast.success('Account deleted.');
      window.location.href = '/login';
    } catch (err: any) {
      if (err?.name === 'AbortError') toast.message('Deletion canceled');
      else toast.error(err?.message || 'Failed to delete account.');
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
      <Card className="w-full max-w-lg p-8 shadow-xl border rounded-2xl">
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 ring-2 ring-blue-500">
              <AvatarImage src={user.avatar || '/default-avatar.png'} alt={user.Fullname} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl">
                {user.Firstname?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.Fullname}</h1>
              <Badge variant="outline" className="mt-1">{user.role}</Badge>
            </div>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {user.email}
            </p>
            {user.school && (
              <p className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {user.school}
              </p>
            )}
            {user.department && (
              <p className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                {user.department}
              </p>
            )}
            {user.level && (
              <p className="flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-muted-foreground" />
                Level {user.level}
              </p>
            )}
            {user.bio && (
              <p className="italic text-muted-foreground">“{user.bio}”</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {/* Edit Profile Modal */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Edit Profile</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your profile information.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <Input name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First name" />
                  <Input name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last name" />
                  <Input name="pseudoname" value={formData.pseudoname} onChange={handleChange} placeholder="Pseudoname" />
                  <Input name="department" value={formData.department} onChange={handleChange} placeholder="Department" />
                  <Input name="level" value={formData.level} onChange={handleChange} placeholder="Level" />
                  <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Write a short bio..." />
                  <DialogFooter>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Delete Account Confirmation */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Are you sure you want to permanently delete your account?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setDeleteDialog(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
