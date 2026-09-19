'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckCircle2, Folder, CalendarDays, Cpu, History, Scale, UserCircle, Shield, Megaphone, Activity } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { clsx } from 'clsx';

interface SidebarProps {
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ pendingCount = 0 }) => {
  const pathname = usePathname();
  const user = getCurrentUser();

  const isAttorneyOrAdmin = user ? ['attorney', 'admin'].includes(user.role) : false;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Approvals',
      href: '/approvals',
      icon: CheckCircle2,
      badge: pendingCount > 0 ? pendingCount : undefined,
      show: isAttorneyOrAdmin,
    },
    {
      name: 'Cases',
      href: '/cases',
      icon: Folder,
      show: true,
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: CalendarDays,
      show: true,
    },
    {
      name: 'Agents',
      href: '/agents',
      icon: Cpu,
      show: isAttorneyOrAdmin,
    },
    { name: 'Marketing', href: '/marketing', icon: Megaphone, show: isAttorneyOrAdmin },
    {
      name: 'Audit Log',
      href: '/audit-log',
      icon: History,
      show: isAttorneyOrAdmin,
    },
    {
      name: 'Admin', href: '/admin', icon: Shield, show: user?.role === 'admin',
    },
    { name: 'System', href: '/system', icon: Activity, show: user?.role === 'admin' },
  ];

  return (
    <aside className="w-64 bg-navy text-white min-h-screen flex flex-col border-r border-navy-light flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-navy-light flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-amber-600 flex items-center justify-center text-navy shadow-md font-bold">
          <Scale className="w-6 h-6 text-navy" />
        </div>
        <div>
          <h2 className="font-bold text-sm text-gold tracking-wide uppercase">Marjiya Law</h2>
          <p className="text-[11px] text-gray-300 font-medium">AI Operating System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          if (!item.show) return null;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-gold text-navy font-semibold shadow-sm'
                  : 'text-gray-300 hover:bg-navy-light hover:text-white'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={clsx('w-5 h-5', isActive ? 'text-navy' : 'text-gold group-hover:scale-110 transition-transform')} />
                <span>{item.name}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={clsx(
                    'px-2 py-0.5 text-xs font-bold rounded-full',
                    isActive ? 'bg-navy text-gold' : 'bg-gold text-navy'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-light p-4">
        <Link href="/profile" className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-navy-light hover:text-white">
          <UserCircle className="h-5 w-5 text-gold" /> Profile
        </Link>
        <div className="text-center text-[11px] text-gray-400">
        <p>West Covina, CA</p>
        <p className="mt-0.5 text-[10px] text-gray-500">v1.0.0 — Multi-Agent OS</p>
        </div>
      </div>
    </aside>
  );
};
