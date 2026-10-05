'use client';

import React from 'react';
import { Sidebar, Header } from './Navbar';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50/70">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}