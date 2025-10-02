// app/auth/reset-password/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import { useState, useMemo } from 'react';

const formSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const passwordScore = useMemo(() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    return score;
  }, [newPassword]);
  const passwordStrengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordScore];
  const passwordStrengthColor = ['bg-red-400','bg-red-300','bg-yellow-300','bg-blue-300','bg-blue-600'][passwordScore];

  const onSubmit = async (data: FormData) => {
    if (!email || !token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ message?: string }>('/auth/reset-password', { email, token, newPassword: data.newPassword });
      const message = (res as any)?.message ?? 'Password reset successful! Please log in.';
      toast.success(message);
      router.push('/login');
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'An error occurred';
      toast.error(String(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Card className="w-full max-w-md border border-blue-100 shadow">
        <CardHeader>
          <CardTitle className="text-blue-700">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-live="polite">
            <div>
              <label className="block text-sm font-medium mb-1">New password</label>
              <div className="relative">
                <Input
                  placeholder="New Password"
                  type={showPassword ? 'text' : 'password'}
                  // keep the react-hook-form registration but also update local state for strength meter
                  {...register('newPassword', { onChange: (e) => setNewPassword((e.target as HTMLInputElement).value) })}
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={loading}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full bg-slate-100 rounded overflow-hidden">
                  <div className={`h-2 ${passwordStrengthColor} rounded`} style={{ width: `${(passwordScore/4)*100}%` }} />
                </div>
                <p className="text-xs mt-1">{newPassword ? `Strength: ${passwordStrengthLabel}` : 'Password strength will appear here'}</p>
              </div>
              {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}