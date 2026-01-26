"use client";
import type { ReactNode } from 'react';
import RequireApproval from '../_guards/RequireApproval';

import React, { useState } from 'react';
import Link from 'next/link';

type MenuItem = {
  title: string;
  href: string;
  submenu?: { title: string; href: string }[];
  disableLink?: boolean;
};

const menuItems: MenuItem[] = [
  {
    title: 'Master',
    href: '/dashboard_02',
    disableLink: true,
    submenu: [
      { title: 'Main', href: '/dashboard_02/master/main' },
      { title: 'LBANK', href: '/dashboard_02/master/results' },
      { title: 'Balance by date', href: '/dashboard_02/master/balance_by_date' },
      { title: 'History', href: '/dashboard_02/master/history' },
    ],
  },
  {
    title: 'User',
    href: '/dashboard_02',
    disableLink: true,
    submenu: [
      { title: 'Main', href: '/dashboard_02/user/main' },
      { title: 'Results', href: '/dashboard_02/user/results' },
    ],
  },
  {
    title: 'Setting',
    href: '/dashboard_02',
    disableLink: true,
  },
  {
    title: '호가설정',
    href: '/dashboard_02',
    disableLink: true,
    submenu: [
      { title: '뎁스', href: '/dashboard_02/menu3/sub1' },
      { title: '그리드', href: '/dashboard_02/menu3/sub1' },
      { title: '블링크', href: '/dashboard_02/menu3/sub1' },
    ],
  },
  {
    title: '거래설정',
    href: '/dashboard_02',
    disableLink: true,
    submenu: [
      { title: '자전', href: '/dashboard_02/menu3/sub1' },
      { title: '스왑', href: '/dashboard_02/menu3/sub1' },
      { title: '벽뚫기', href: '/dashboard_02/menu3/sub1' },
      { title: '조건거래', href: '/dashboard_02/menu3/sub1' },
    ],
  },
  {
    title: '기타설정',
    href: '/dashboard_02',
  },
];

function SidebarMenu({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <li style={{ marginBottom: '0.5rem' }}>
      <div
        onClick={item.submenu ? toggleOpen : undefined}
        style={{ cursor: item.submenu ? 'pointer' : 'default', userSelect: 'none', display: 'flex', alignItems: 'center' }}
      >
        {item.disableLink ? (
          <span
            style={{ color: 'white', textDecoration: 'none', flexGrow: 1, cursor: 'default' }}
            aria-disabled="true"
          >
            {item.title}
          </span>
        ) : (
          <Link
            href={item.href}
            style={{ color: 'white', textDecoration: 'none', flexGrow: 1 }}
          >
            {item.title}
          </Link>
        )}
        {item.submenu && (
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleOpen();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              marginLeft: '8px',
              padding: 0,
              fontSize: '0.8rem',
            }}
            aria-label={open ? 'Collapse submenu' : 'Expand submenu'}
          >
            {open ? '▲' : '▼'}
          </button>
        )}
      </div>
      {open && item.submenu && (
        <ul style={{ paddingLeft: '1rem', marginTop: '0.25rem' }}>
          {item.submenu.map((sub, index) => (
            <li key={sub.href + index} style={{ marginBottom: '0.25rem' }}>
              <Link
                href={sub.href}
                style={{ color: '#ccc', textDecoration: 'none' }}
              >
                {sub.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireApproval>
      <div style={{ display: 'flex', height: '100vh' }}>
        {/* 사이드바 */}
        <nav style={{ width: '240px', backgroundColor: '#333', color: 'white', padding: '1rem' }}>
          <h2>
            <Link href="/dashboard_02" style={{ color: 'white', textDecoration: 'none' }}>
              DashBoard Home
            </Link>
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '1rem' }}>
            {menuItems.map((item, index) => (
              <SidebarMenu key={item.href + index} item={item} />
            ))}
          </ul>
        </nav>

        {/* 메인 콘텐츠 영역 */}
        <main style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#111827', color: '#e5e7eb' }}>
          {children}
        </main>
      </div>
    </RequireApproval>
  );
}
