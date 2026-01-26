"use client"

import Link from 'next/link';
import './globals.css';
// import 'tailwindcss/tailwind.css';
// import Auth from '../0x99_utils/Auth';
import { usePathname } from 'next/navigation';
import { Header } from '../components';
// import { RoomListProvider } from './chatting/page';
// import checkValidUser from './util/checkValidUser';
// import { Socket } from 'socket.io-client';
import React, { useState } from 'react';
import { AuthProvider } from './_providers/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [navHeight, setNavHeight] = useState(0);
  
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = new Headers(init?.headers || {});
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
        const nextInit: RequestInit = { ...init, headers };
        const res = await originalFetch(input, nextInit);
        if (res.status === 401) {
          try { window.dispatchEvent(new Event('auth:logout')); } catch {}
        }
        return res;
      } catch {
        return originalFetch(input, init as any);
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // const pathname = usePathname();

  // let SidebarComponent;

  // if (pathname.startsWith('/dashboard_01')) {
  //   SidebarComponent = Sidebar_01;
  // } else if (pathname.startsWith('/dashboard_02')) {
  //   SidebarComponent = Sidebar_02;
  // } else if (pathname.startsWith('/dashboard_03')) {
  //   SidebarComponent = Sidebar_03;
  // } else if (pathname === '/') {
  //   SidebarComponent = () => null; // 루트 경로 등 필요 시 처리
  // } else {
  //   SidebarComponent = () => null; // 나머지 기본 처리
  // }

  return (
    // <RoomListProvider>
    // <Auth>
    <html lang="en" style={{ height: '100%' }}>
      <body>
        <AuthProvider>
        <Header onHeightChange={setNavHeight} />
        {/* 글자가 맨위갔다가 순간적으로 바뀜 */}
        {/* <div className="body" style={{ paddingTop: navHeight }}> */}
        <div className="body" style={{ paddingTop: '170px' }}>
          <div className="flex flex-1 overflow-hidden">
            {/* 좌측 내비게이션 바 */}
            {/* <SidebarComponent className="w-64" /> */}
            {/* 메인 콘텐츠 영역(스크롤 가능) */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        </AuthProvider>
      </body>
    </html>
    // </Auth>
    // </RoomListProvider>
  );
}