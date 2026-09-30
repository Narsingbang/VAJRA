import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-8">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="hidden md:block py-6 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} KisanMitra AI. Empowering Indian Agriculture.</p>
          <p className="text-slate-400">Practical • Region-Aware • Safety-First</p>
        </div>
      </footer>
      <MobileBottomNav />
    </div>
  );
}
