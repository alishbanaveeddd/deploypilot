'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Layers, 
  Cpu, 
  Settings, 
  LogOut, 
  Terminal,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Deploy Application',
      href: '/dashboard/deploy',
      icon: PlusCircle,
    },
    {
      name: 'Applications',
      href: '/dashboard/applications',
      icon: Layers,
    },
    {
      name: 'Cluster Status',
      href: '/dashboard/cluster',
      icon: Cpu,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        'bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-350 z-30 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand logo section */}
      <div>
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
          <div className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center w-full')}>
            <div className="h-9 w-9 shrink-0 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                DeployPilot
              </span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="text-slate-500 hover:text-slate-350 hover:bg-slate-850 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500 rounded-l-none pl-2.5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
                )}
              >
                <Icon className={cn('h-5 w-5 shrink-0 transition-transform group-hover:scale-105', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                {!collapsed && <span>{item.name}</span>}
                {collapsed && (
                  <div className="absolute left-18 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="p-3 border-t border-slate-800">
        {!collapsed ? (
          <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center shrink-0 text-sm">
                DP
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-slate-250 truncate">Pilot Admin</span>
                <span className="text-[10px] text-slate-500 truncate">admin@deploypilot.com</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <div className="h-9 w-9 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold flex items-center justify-center shrink-0 text-sm">
              DP
            </div>
          </div>
        )}
        
        <Link
          href="/login"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/10 transition-all group relative cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-400 transition-colors" />
          {!collapsed && <span>Sign Out</span>}
          {collapsed && (
            <div className="absolute left-18 bg-slate-900 border border-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-50">
              Sign Out
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
