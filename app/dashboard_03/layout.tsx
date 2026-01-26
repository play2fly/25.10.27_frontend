"use client";
import type { ReactNode } from 'react';
import RequireApproval from '../_guards/RequireApproval';

export default function Dashboard03Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-300">
      <RequireApproval>{children}</RequireApproval>
    </div>
  );
}


