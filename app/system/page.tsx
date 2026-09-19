'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { getHealth } from '@/lib/api';
import { HealthResponse } from '@/types';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

const labels: Record<string, string> = { intake: 'Intake', email: 'Email', scheduling: 'Scheduling', pre_litigation: 'Pre-Litigation', medical_monitoring: 'Medical Monitoring', litigation: 'Litigation', lemon_law: 'Lemon Law', document: 'Document', client_comms: 'Client Communications', research: 'Research', marketing: 'Marketing', supervisor: 'Supervisor' };

export default function SystemPage() {
  const router = useRouter();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = getCurrentUser();
  useEffect(() => { if (!isAuthenticated() || user?.role !== 'admin') { router.push('/dashboard'); return; } const load = async () => { try { setHealth(await getHealth()); } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load system health.'); } finally { setLoading(false); } }; load(); }, [router]);
  const indicator = (name: string, value?: string) => <div className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${value === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} /> <span className="text-sm font-bold text-navy">{name}</span><span className="ml-auto text-xs text-mid">{value || 'unknown'}</span></div>;
  return <div className="flex min-h-screen bg-light-gray"><Sidebar /><div className="min-w-0 flex-1"><Navbar title="System Health" /><main className="mx-auto max-w-7xl space-y-6 p-6">{error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</div>}<Card title="Infrastructure" subtitle="Live connectivity checks"><div className="grid gap-4 md:grid-cols-3">{loading ? [1, 2, 3].map((item) => <Skeleton key={item} className="h-8" />) : <>{indicator('MySQL', health?.mysql)}{indicator('PostgreSQL', health?.postgres)}{indicator('Dropbox', health?.dropbox)}</>}</div></Card><Card title="Agents" subtitle={`Last cron run: ${health?.last_cron_run ? new Date(health.last_cron_run).toLocaleString() : 'No cron run recorded'}`}><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{loading ? [1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-16" />) : Object.entries(health?.agents || {}).map(([name, status]) => <div key={name} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"><Activity className="h-4 w-4 text-gold" /><div><p className="text-xs font-bold text-navy">{labels[name] || name}</p><p className="text-[10px] text-mid">{status}</p></div>{status === 'active' ? <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" /> : <XCircle className="ml-auto h-4 w-4 text-red-600" />}</div>)}</div></Card></main></div></div>;
}
