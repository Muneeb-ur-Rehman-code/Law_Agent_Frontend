'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { StatsCard } from '@/components/StatsCard';
import { DeadlineAlert } from '@/components/DeadlineAlert';
import { ApprovalCard } from '@/components/ApprovalCard';
import { AuditLogRow } from '@/components/AuditLogRow';
import { getDashboard, getApprovals, getDeadlineAlerts, approveAction, rejectAction, getSystemStats, triggerAgent, runMarketingAgent, runMedicalCheck } from '@/lib/api';
import { useDashboardWebSocket } from '@/lib/websocket';
import { DashboardStats, PendingApproval, AgentAction } from '@/types';
import { CheckCircle2, Folder, Clock, Cpu, ArrowRight, CalendarClock } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Toast } from '@/components/ui/Toast';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [deadlineAlerts, setDeadlineAlerts] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [systemStats, setSystemStats] = useState<Awaited<ReturnType<typeof getSystemStats>> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Reject Modal State
  const [rejectingApproval, setRejectingApproval] = useState<PendingApproval | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const { data: wsData } = useDashboardWebSocket();
  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    fetchInitialData();
  }, [router]);

  // Live WebSocket updates listener
  useEffect(() => {
    if (wsData) {
      if (wsData.pending_approvals !== undefined) {
        setStats((prev) =>
          prev ? { ...prev, pending_approvals_count: wsData.pending_approvals! } : prev
        );
      }
      if (wsData.new_actions) {
        setStats((prev) =>
          prev ? { ...prev, recent_agent_actions: wsData.new_actions as AgentAction[] } : prev
        );
      }
    }
  }, [wsData]);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [dashData, approvalsData, deadlineData, systemData] = await Promise.all([
        getDashboard(),
        getApprovals().catch(() => []), // non-attorneys will fail 403 gracefully
        getDeadlineAlerts().catch(() => []),
        getSystemStats().catch(() => null),
      ]);
      setStats(dashData);
      setApprovals(approvalsData);
      setDeadlineAlerts(deadlineData);
      setSystemStats(systemData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveAction(id);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_approvals_count: Math.max(0, prev.pending_approvals_count - 1),
            }
          : prev
      );
    } catch (err) {
      console.error('Approve failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenRejectModal = (approval: PendingApproval) => {
    setRejectingApproval(approval);
    setRejectFeedback('');
  };

  const handleConfirmReject = async () => {
    if (!rejectingApproval) return;
    setProcessingId(rejectingApproval.id);
    try {
      await rejectAction(rejectingApproval.id, rejectFeedback);
      setApprovals((prev) => prev.filter((a) => a.id !== rejectingApproval.id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_approvals_count: Math.max(0, prev.pending_approvals_count - 1),
            }
          : prev
      );
      setRejectingApproval(null);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const isAttorneyOrAdmin = user ? ['attorney', 'admin'].includes(user.role) : false;
  const runQuick = async (agent: string) => { try { setToast('Agent is running...'); if (agent === 'marketing_agent') await runMarketingAgent(); else if (agent === 'medical_monitoring_agent') await runMedicalCheck(); else await triggerAgent(agent); } catch { setToast('Something went wrong. Try again.'); } };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar pendingCount={stats?.pending_approvals_count || 0} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title="Main Dashboard" />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Deadline Alert Banner */}
          {stats && (
            <DeadlineAlert
              count={stats.deadlines_this_week}
              details={stats.deadline_details}
            />
          )}

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {isLoading ? [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-28" />) : <>
            <StatsCard
              title="Pending Approvals"
              value={stats?.pending_approvals_count ?? '-'}
              icon={CheckCircle2}
              href="/approvals"
              highlight={stats ? stats.pending_approvals_count > 0 : false}
              color="warning"
            />
            <StatsCard
              title="Active Cases"
              value={stats?.active_cases_count ?? '-'}
              icon={Folder}
              href="/cases"
              color="default"
            />
            <StatsCard
              title="Deadlines This Week"
              value={stats?.deadlines_this_week ?? '-'}
              icon={Clock}
              href="/cases"
              color={stats && stats.deadlines_this_week > 0 ? 'danger' : 'default'}
            />
            <StatsCard
              title="Agents Active"
              value={
                stats?.agent_status
                  ? Object.values(stats.agent_status).filter((s) => s === 'running').length || 12
                  : 12
              }
              icon={Cpu}
              href="/agents"
              color="success"
            />
            </>}
          </div>

          {/* Deadline Alerts */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-base font-bold text-navy"><CalendarClock className="h-4 w-4 text-gold" /> Deadline Alerts</h3>
                <p className="text-xs text-mid">Open cases with a filing deadline in the next 30 days</p>
              </div>
              <Link href="/calendar" className="text-xs font-bold text-navy hover:text-gold">Open Calendar <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>
            </div>
            {deadlineAlerts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-xs font-semibold text-emerald-800 shadow-sm">No upcoming deadlines — all clear ✓</div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {deadlineAlerts.map((alert) => {
                  const days = alert.days_remaining ?? 30;
                  const tone = days <= 7 ? 'border-l-red-500 bg-red-50/40' : days <= 14 ? 'border-l-orange-500 bg-orange-50/40' : 'border-l-yellow-500 bg-yellow-50/40';
                  const date = alert.deadline_date || (alert as PendingApproval & { last_date_to_file_claim?: string }).last_date_to_file_claim;
                  return (
                    <div key={alert.id} className={`flex flex-col gap-3 border-b border-gray-100 border-l-4 p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between ${tone}`}>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-navy">{alert.action_summary.split(':')[0] || `Case #${alert.case_id}`}</p>
                        <p className="mt-1 text-xs text-mid">Deadline: {date ? new Date(date).toLocaleDateString() : 'Date pending'} </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="whitespace-nowrap text-xs font-bold text-navy">{days} {days === 1 ? 'day' : 'days'} remaining</span>
                        <Link href={`/cases/${alert.case_id}`} className="whitespace-nowrap rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white hover:bg-navy-light">View Case</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Pending Approvals Section */}
          {isAttorneyOrAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-navy">Priority Approvals Required</h3>
                  <p className="text-xs text-mid">Actions generated by AI awaiting attorney review</p>
                </div>
                <Link
                  href="/approvals"
                  className="text-xs font-bold text-navy hover:text-gold flex items-center gap-1"
                >
                  View All ({approvals.length}) <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {isLoading ? (
                <div className="p-8 text-center bg-white rounded-xl text-xs text-mid animate-pulse">
                  Loading pending approvals...
                </div>
              ) : approvals.length === 0 ? (
                <div className="p-6 text-center bg-white rounded-xl border border-gray-200">
                  <p className="text-xs font-semibold text-emerald-800">
                    ✓ All clear! No pending attorney approvals at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvals.slice(0, 3).map((app) => (
                    <ApprovalCard
                      key={app.id}
                      approval={app}
                      onApprove={handleApprove}
                      onReject={handleOpenRejectModal}
                      isProcessing={processingId === app.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Agent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-navy">Recent Agent Activity</h3>
                <p className="text-xs text-mid">Real-time audit log of multi-agent operations</p>
              </div>
              {isAttorneyOrAdmin && (
                <Link
                  href="/audit-log"
                  className="text-xs font-bold text-navy hover:text-gold flex items-center gap-1"
                >
                  Full Audit Log <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Agent</th>
                    <th className="py-3 px-4">Case</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Authorized By</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_agent_actions && stats.recent_agent_actions.length > 0 ? (
                    stats.recent_agent_actions.map((act) => (
                      <AuditLogRow key={act.id} action={act} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-xs text-mid">
                        No recent agent activity logged.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <section className="space-y-4"><h3 className="text-base font-bold text-navy">System Stats</h3><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{['Total Actions Today', 'Agents Active Today', 'Cases Updated Today', 'Approvals Resolved Today'].map((label, index) => <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"><p className="text-xs text-mid">{label}</p><p className="mt-2 text-2xl font-bold text-navy">{systemStats ? [systemStats.total_agent_actions_today, systemStats.agents_ran_today.length, '—', '—'][index] : '—'}</p></div>)}</div></section>

          {user?.role === 'admin' && <section className="rounded-xl border border-gold/40 bg-gold-light/30 p-5"><h3 className="mb-3 text-base font-bold text-navy">Quick Trigger</h3><div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => runQuick('scheduling_agent')}>Run Scheduling</Button><Button size="sm" onClick={() => runQuick('email_agent')}>Run Email Check</Button><Button size="sm" onClick={() => runQuick('medical_monitoring_agent')}>Run Medical Check</Button><Button size="sm" onClick={() => runQuick('marketing_agent')}>Run Marketing</Button></div></section>}
        </main>
      </div>
      <Toast message={toast} kind={toast === 'Something went wrong. Try again.' ? 'error' : 'info'} onClose={() => setToast(null)} />

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingApproval}
        onClose={() => setRejectingApproval(null)}
        title={rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Why are you rejecting this?' : `Reject Action — Case #${rejectingApproval?.case_id}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-mid leading-relaxed">
            {rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Please explain why this document needs revision.' : <>Please provide revision feedback for the <span className="font-semibold text-navy">{rejectingApproval?.agent_name}</span>. This feedback will be routed back to the agent thread.</>}
          </p>

          <Input
            label={rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Why are you rejecting this?' : 'Rejection Reason / Feedback'}
            placeholder="e.g., Redraft section 3 to include original medical expense receipts..."
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRejectingApproval(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              isLoading={!!processingId}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
