'use client';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type AuthContextValue = {
  isLoggedIn: boolean;
  canAccessDashboards: boolean;
  email: string | null;
  login: (accessToken: string, refreshToken?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  canAccessDashboards: false,
  email: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [canAccessDashboards, setCanAccessDashboards] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  const base64UrlDecode = (input: string) => {
    let s = input.replace(/-/g, '+').replace(/_/g, '/');
    const pad = s.length % 4;
    if (pad) s += '='.repeat(4 - pad);
    return atob(s);
  };

  const computeAccess = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) { setCanAccessDashboards(false); setEmail(null); return; }
      const payloadPart = token.split('.')[1] || '';
      const payload = JSON.parse(base64UrlDecode(payloadPart));
      const emailValue = typeof payload?.email === 'string' ? payload.email : null;
      setEmail(emailValue);
      const emailOk = !!emailValue && emailValue.length > 0;
      const isBypass = !!payload?.isBypass;
      const isApproval = !!payload?.isApproval;
      const isPhoneVerified = !!payload?.isPhoneVerified;
      setCanAccessDashboards(emailOk && (isBypass || (isPhoneVerified && isApproval)));
    } catch {
      setCanAccessDashboards(false);
      setEmail(null);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    setIsLoggedIn(!!token);
    computeAccess();

    const onAuthTokenUpdated = () => {
      const t = localStorage.getItem('accessToken');
      setIsLoggedIn(!!t);
      computeAccess();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        setIsLoggedIn(!!e.newValue);
        computeAccess();
      }
    };
    window.addEventListener('auth:token-updated', onAuthTokenUpdated as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:token-updated', onAuthTokenUpdated as EventListener);
    };
  }, []);

  const login = useCallback((accessToken: string, refreshToken?: string | null) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    setIsLoggedIn(true);
    computeAccess();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setCanAccessDashboards(false);
    setEmail(null);
  }, []);

  useEffect(() => {
    const onForceLogout = () => {
      logout();
      try {
        router.replace('/auth/login');
      } catch {
        try { window.location.href = '/auth/login'; } catch {}
      }
    };
    window.addEventListener('auth:logout', onForceLogout as EventListener);
    return () => window.removeEventListener('auth:logout', onForceLogout as EventListener);
  }, [logout, router]);

  const value = useMemo(() => ({ isLoggedIn, canAccessDashboards, email, login, logout }), [isLoggedIn, canAccessDashboards, email, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


