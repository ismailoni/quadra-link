// app/auth/reset-password/page.tsx
'use client';

import { Suspense } from 'react';
import ResetPasswordForm from '@/components/ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading reset form...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
