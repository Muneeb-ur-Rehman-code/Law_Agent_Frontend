'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Megaphone, Plug, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toast } from '@/components/ui/Toast';
import { getApprovals, runMarketingAgent } from '@/lib/api';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';
import { MarketingReport, PendingApproval } from '@/types';

export default function MarketingPage() {
  const router = useRouter();
  const [report, setReport] = useState<MarketingReport | null>(null);
  const [approval, setApproval] = useState<PendingApproval | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const user = getCurrentUser();

  const load = async () => {
    try { setLoading(true); setError(null); const approvals = await getApprovals(); setApproval(approvals.find((item) => item.agent_name === 'marketing_agent') || null); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to load marketing report.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (!isAuthenticated() || !user || !['admin', 'attorney'].includes(user.role)) { router.push('/dashboard'); return; } load(); }, [router]);
  const generate = async () => { try { setRunning(true); setError(null); setReport(await runMarketingAgent()); setToast('Marketing report generated for approval'); } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Try again.'); } finally { setRunning(false); } };
  const reportText = report?.report || approval?.action_summary;
  return <div className="flex min-h-screen bg-light-gray"><Sidebar /><div className="min-w-0 flex-1"><Navbar title="Marketing" /><main className="mx-auto max-w-7xl space-y-6 p-6">
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</div>}
    <Card title="Weekly Marketing Report" subtitle="California State Bar-compliant marketing review" action={<Button variant="secondary" size="sm" onClick={generate} isLoading={running}><RefreshCw className="mr-1 h-4 w-4" /> Generate Report</Button>}>
      {loading ? <div className="space-y-3"><Skeleton className="h-5 w-40" /><Skeleton className="h-28 w-full" /></div> : <div className="space-y-4"><div className="flex items-center gap-2 text-xs font-bold text-navy"><span className={`rounded-full px-2 py-1 ${report?.status === 'pending_approval' || approval ? 'bg-amber-100 text-amber-800' : report ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>{report?.status === 'pending_approval' || approval ? 'Pending Approval' : report ? 'Approved' : 'Not Generated'}</span>{report?.ran_at && <span className="text-mid">Generated {new Date(report.ran_at).toLocaleString()}</span>}</div>{reportText ? <pre className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 font-sans text-sm leading-relaxed text-dark">{reportText}</pre> : <p className="text-sm text-mid">Generate the weekly report to review recommendations.</p>}</div>}
    </Card>
    <div><h2 className="mb-3 flex items-center gap-2 text-base font-bold text-navy"><BarChart3 className="h-4 w-4 text-gold" /> Platform Status</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">{[['Google Business Profile', 'Rating: -- · Reviews: --', 'Not Connected'], ['Google Ads', 'Leads this week: -- · Cost per lead: --', 'Not Connected'], ['Facebook / Instagram', 'Followers: -- · Posts this week: --', 'Not Connected'], ['LinkedIn', 'Followers: --', 'Not Connected']].map(([name, detail, status]) => <Card key={name}><div className="space-y-3"><h3 className="font-bold text-navy">{name}</h3><p className="text-xs text-mid">{detail}</p><p className="text-[10px] font-bold uppercase text-gray-500">{status}</p><Button variant="ghost" size="sm" disabled><Plug className="mr-1 h-3.5 w-3.5" /> Connect</Button></div></Card>)}</div></div>
    <Card title="Content Calendar" subtitle="Approved suggestions for next week"><div className="space-y-2"><div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="font-bold text-navy">Educational FAQ</span><span className="text-mid">PI / Lemon Law explainer</span><span className="ml-auto text-emerald-700">Approved</span></div><div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs"><Megaphone className="h-4 w-4 text-gold" /><span className="font-bold text-navy">Client process update</span><span className="text-mid">Attorney-reviewed educational content</span><span className="ml-auto text-mid">Suggested</span></div></div></Card>
  </main></div><Toast message={toast} kind="success" onClose={() => setToast(null)} /></div>;
}
