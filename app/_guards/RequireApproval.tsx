'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RequireApproval({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) { router.replace('/'); return; }
      const payload = JSON.parse(atob((token.split('.')[1] || '')));
      const isBypass = !!payload?.isBypass;
      const isApproval = !!payload?.isApproval;
      const isPhoneVerified = !!payload?.isPhoneVerified;

      if (isBypass || (isPhoneVerified && isApproval)) {
        setReady(true);
      } else if (!isPhoneVerified) {
        router.replace('/auth/phone');
      } else if (!isApproval) {
        router.replace('/auth/pending');
      } else {
        router.replace('/auth/login');
      }
    } catch {
      router.replace('/auth/login');
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}


