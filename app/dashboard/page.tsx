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
import { getDashboard, getApprovals, approveAction, rejectAction } from '@/lib/api';
import { useDashboardWebSocket } from '@/lib/websocket';
import { DashboardStats, PendingApproval, AgentAction } from '@/types';
import { CheckCircle2, Folder, Clock, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

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
      const [dashData, approvalsData] = await Promise.all([
        getDashboard(),
        getApprovals().catch(() => []), // non-attorneys will fail 403 gracefully
      ]);
      setStats(dashData);
      setApprovals(approvalsData);
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
          </div>

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
        </main>
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingApproval}
        onClose={() => setRejectingApproval(null)}
        title={`Reject Action — Case #${rejectingApproval?.case_id}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-mid leading-relaxed">
            Please provide revision feedback for the <span className="font-semibold text-navy">{rejectingApproval?.agent_name}</span>. This feedback will be routed back to the agent thread.
          </p>

          <Input
            label="Rejection Reason / Feedback"
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
