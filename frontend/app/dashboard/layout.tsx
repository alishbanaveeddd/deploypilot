'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Menu, Wifi, HardDrive, ShieldCheck, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [namespace, setNamespace] = useState('default');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const readNamespace = () => setNamespace(localStorage.getItem('k8sNamespace') || 'default');
      readNamespace();

      // Update when another tab changes localStorage
      const onStorage = (e: StorageEvent) => {
        if (e.key === 'k8sNamespace') readNamespace();
      };
      window.addEventListener('storage', onStorage);

      // Re-read when user navigates back from settings (same tab)
      const onVisibility = () => {
        if (document.visibilityState === 'visible') readNamespace();
      };
      document.addEventListener('visibilitychange', onVisibility);

      // Also poll on focus to catch same-tab navigations within the SPA
      const onFocus = () => readNamespace();
      window.addEventListener('focus', onFocus);

      return () => {
        window.removeEventListener('storage', onStorage);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', onFocus);
      };
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 relative">
      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Desktop & Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-transform duration-300 z-50 shrink-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={(val) => {
            setSidebarCollapsed(val);
            setMobileMenuOpen(false);
          }}
        />
      </div>

      {/* Main shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          {/* Left: Mobile trigger & context */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-200 hover:bg-slate-905 rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>

            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="hidden md:flex text-slate-500 hover:text-slate-350 hover:bg-slate-900 p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4.5 w-4.5" />
              </button>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Context</span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-350 px-2 py-0.5 rounded-md font-mono">
                minikube/{namespace}
              </span>
            </div>
          </div>

          {/* Right: Metrics / Status Indicators */}
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Backend Connected</span>
            </div>

            {/* Cluster health */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 px-3 py-1 rounded-full text-xs text-slate-350 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Cluster: Healthy</span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
