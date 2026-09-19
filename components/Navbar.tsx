'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getCurrentUser, logout } from '@/lib/auth';
import { Bell, LogOut, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardWebSocket } from '@/lib/websocket';
import { getApprovals, searchWorkspace } from '@/lib/api';
import { PendingApproval, SearchResult } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NavbarProps {
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ title = 'Dashboard' }) => {
  const router = useRouter();
  const user = getCurrentUser();
  const { isConnected, data: wsData } = useDashboardWebSocket();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) { setResults(null); return; }
      try { setResults(await searchWorkspace(query.trim())); setSearchOpen(true); } catch { setResults({ cases: [], clients: [] }); }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const load = async () => { try { setApprovals(await getApprovals()); } catch { setApprovals([]); } };
    load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [wsData?.pending_approvals]);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!searchRef.current?.contains(event.target as Node)) setSearchOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setSearchOpen(false); setQuery(''); } };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-navy text-white h-16 border-b border-navy-light sticky top-0 z-30 flex items-center justify-between px-6 shadow-md">
      <div ref={searchRef} className="relative hidden max-w-xl flex-1 px-8 md:block">
        <div className="flex items-center rounded-lg border border-navy-light bg-navy-dark/60 px-3">
          <Search className="h-4 w-4 text-gold" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={() => results && setSearchOpen(true)} placeholder="Search cases or clients..." className="w-full bg-transparent px-2 py-2 text-xs text-white outline-none placeholder:text-gray-400" />
          {query && <button type="button" title="Clear search" onClick={() => { setQuery(''); setSearchOpen(false); }}><X className="h-4 w-4 text-gray-400" /></button>}
        </div>
        {searchOpen && results && <div className="absolute left-8 right-8 top-12 z-50 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-2xl">
          {results.cases.length > 0 && <><p className="px-3 py-2 text-[10px] font-bold uppercase text-mid">Cases</p>{results.cases.map((item) => <Link key={`case-${item.id}`} href={`/cases/${item.id}`} onClick={() => setSearchOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gold-light"><span className="block text-xs font-bold text-navy">{item.title}</span><span className="text-[10px] text-mid">Case #{item.case_number} · {item.case_type || 'PI'}</span></Link>)}</>}
          {results.clients.length > 0 && <><p className="px-3 py-2 text-[10px] font-bold uppercase text-mid">Clients</p>{results.clients.map((item) => <Link key={`client-${item.id}`} href={`/cases/${item.case_id || ''}`} onClick={() => setSearchOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gold-light text-xs font-semibold text-navy">{item.first_name} {item.last_name}<span className="ml-2 text-[10px] text-mid">Case #{item.case_id || '—'}</span></Link>)}</>}
          {results.cases.length === 0 && results.clients.length === 0 && <p className="p-4 text-center text-xs text-mid">No results found</p>}
        </div>}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button type="button" title="Notifications" onClick={() => setNotificationsOpen((open) => !open)} className="relative rounded-lg p-2 text-gray-300 hover:bg-navy-light hover:text-white"><Bell className="h-5 w-5" />{approvals.length > 0 && <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[9px] font-bold text-white">{approvals.length > 99 ? '99+' : approvals.length}</span>}</button>
          {notificationsOpen && <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-2xl">
            <p className="border-b border-gray-100 px-3 py-2 text-xs font-bold text-navy">Pending approvals</p>
            {approvals.slice(0, 5).map((approval) => <Link key={approval.id} href="/approvals" onClick={() => setNotificationsOpen(false)} className="block rounded-lg px-3 py-2 hover:bg-gold-light"><span className="block text-xs font-semibold text-navy">{approval.agent_name} · Case #{approval.case_id}</span><span className="text-[10px] text-mid">{formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })}</span></Link>)}
            {approvals.length === 0 && <p className="p-3 text-xs text-mid">No pending approvals.</p>}
            <Link href="/approvals" onClick={() => setNotificationsOpen(false)} className="block border-t border-gray-100 px-3 py-2 text-xs font-bold text-navy hover:text-gold">View All Approvals</Link>
          </div>}
        </div>
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
