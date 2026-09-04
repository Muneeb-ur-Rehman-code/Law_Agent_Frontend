'use client';

import React from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import { LogOut, User as UserIcon, Shield, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardWebSocket } from '@/lib/websocket';

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Dashboard' }) => {
  const router = useRouter();
  const user = getCurrentUser();
  const { isConnected } = useDashboardWebSocket();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-navy text-white h-16 border-b border-navy-light sticky top-0 z-30 flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
        
        {/* Real-time Connection Indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-navy-dark border border-navy-light">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-400 font-mono text-[11px]">LIVE</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-amber-300 font-mono text-[11px]">CONNECTING</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3 bg-navy-dark/60 border border-navy-light px-3 py-1.5 rounded-lg">
            <div className="w-7 h-7 rounded-full bg-gold text-navy flex items-center justify-center font-bold text-xs">
              {user.first_name?.[0] || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-[10px] text-gold uppercase tracking-wider font-semibold">
                {user.role}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-navy-light transition-colors border border-transparent hover:border-navy-light"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
