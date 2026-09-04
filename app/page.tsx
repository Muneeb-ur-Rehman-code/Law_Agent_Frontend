'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center text-white">
      <div className="animate-pulse font-semibold text-gold">Loading Marjiya Law AI Dashboard...</div>
    </div>
  );
}
