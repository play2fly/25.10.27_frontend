'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

// Ensure static export generates /auth/callback/index.html
export const dynamic = 'force-static';

export default function AuthCallback() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackClient />
    </Suspense>
  );
}

function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');
  const error = searchParams.get('error');

  const decodeJwtPayload = (jwt?: string): any | null => {
    if (!jwt) return null;
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) b64 += '=';
    try {
      const json = atob(b64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (error) {
      router.replace(`/auth/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const resolvedAccessToken = token ?? accessToken;

    if (resolvedAccessToken) {
      localStorage.setItem('accessToken', resolvedAccessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      // Notify app that tokens are updated (same-tab; storage event won't fire here)
      try { window.dispatchEvent(new Event('auth:token-updated')); } catch {}
      // 토큰 payload 디코드 후 단계에 맞게 라우팅
      const payload = decodeJwtPayload(resolvedAccessToken) || {};
      const isPhoneVerified =
        !!(payload.phoneVerified ?? payload.isPhoneVerified ?? payload.phone_verified);
      const isApproval = !!(payload.isApproval ?? payload.approval ?? payload.is_approval);
      const isBypass = !!(payload.isBypass ?? payload.bypass ?? payload.is_bypass);

      if (isBypass) {
        router.replace('/dashboard_01');
        return;
      }
      if (!isPhoneVerified) {
        router.replace('/auth/phone');
        return;
      }
      if (!isApproval) {
        router.replace('/auth/pending');
        return;
      }
      router.replace('/dashboard_01');
    } else {
      router.replace('/auth/login');
    }
  }, [token, accessToken, refreshToken, error, router]);

  return <p>Authenticating...</p>;
}
