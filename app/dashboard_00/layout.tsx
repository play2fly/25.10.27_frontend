import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* 사이드바 */}
      <nav style={{ width: '240px', backgroundColor: '#333', color: 'white', padding: '1rem' }}>
        <h2><Link href="/dashboard_00">Dashboard Sidebar</Link></h2>
        <ul>
          <li><Link href="/dashboard_00">Menu 1</Link></li>
          <li><Link href="/dashboard_00">Menu 2</Link></li>
          <li><Link href="/dashboard_00">Menu 3</Link></li>
        </ul>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main style={{ flex: 1, padding: '1rem' }}>
        {children}
      </main>
    </div>
  );
}
