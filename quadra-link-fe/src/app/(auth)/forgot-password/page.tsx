// app/auth/forgot-password/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof formSchema>;

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<{ message?: string }>('/auth/forgot-password', data);
      const message = (res as any)?.message ?? 'Reset email sent! Check your inbox.';
      toast.success(message);
      router.push('/login');
    } catch (err: any) {
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred';
      toast.error(String(backendMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <Card className="w-full max-w-md border border-blue-100 shadow">
        <CardHeader>
          <CardTitle className="text-blue-700">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-live="polite">
            <div>
              <label className="block text-sm font-medium mb-1">Enter your institutional email</label>
              <Input placeholder="Email" type="email" {...register('email')} disabled={loading} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-60" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">We will send a password reset link to your registered institutional email.</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}