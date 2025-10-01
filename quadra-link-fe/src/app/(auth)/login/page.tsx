// app/auth/login/page.tsx
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
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof formSchema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post<{ token?: string; message?: string }>('/auth/login', data);
      // api.post here returns the parsed response (data). prefer backend message when available.
      const token = (response as any)?.token ?? null;
      const message = (response as any)?.message ?? null;
      if (token) {
        setToken(token);
        localStorage.setItem('token', token);
      }
      toast.success(message ?? 'Login successful!');
      router.push('/dashboard');
    } catch (err: any) {
      // Prefer backend error fields if provided
      const backendMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'An error occurred';
      toast.error(String(backendMsg));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <header className="mb-6 text-center z-10">
        <h1 className="text-3xl font-extrabold text-blue-600">Quadra Link</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Connect, share, and grow with your community</p>
      </header>

      <div className="z-10">
        <Card className="w-[420px] card">
          <div className="card-header-accent" />
          <CardHeader>
            <CardTitle className="text-lg">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input placeholder="Email" type="email" className="input-focus" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
              </div>
              <div>
                <Input placeholder="Password" type="password" className="input-focus" {...register('password')} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full btn-primary">Login</Button>
              <Button variant="link" onClick={() => router.push('/forgot-password')} className="w-full mt-1 text-sm">
                Forgot Password?
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}