'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { ApprovalCard } from '@/components/ApprovalCard';
import { getApprovals, approveAction, rejectAction } from '@/lib/api';
import { PendingApproval } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { Filter, CheckCircle } from 'lucide-react';

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [filteredApprovals, setFilteredApprovals] = useState<PendingApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter State
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  // Reject Modal State
  const [rejectingApproval, setRejectingApproval] = useState<PendingApproval | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const user = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (user && !['attorney', 'admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    loadApprovals();
  }, [router]);

  useEffect(() => {
    let result = [...approvals];

    if (priorityFilter !== 'all') {
      result = result.filter((a) => a.priority === priorityFilter);
    }
    if (agentFilter !== 'all') {
      result = result.filter((a) => a.agent_name === agentFilter);
    }

    setFilteredApprovals(result);
  }, [approvals, priorityFilter, agentFilter]);

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getApprovals();
      setApprovals(data);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setLoadError(err instanceof Error ? err.message : 'Unable to load approvals.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveAction(id);
      setApprovals((prev) => prev.filter((a) => a.id !== id));
      setToast('Action approved successfully');
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
      setToast('Action rejected');
      setRejectingApproval(null);
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const uniqueAgents = Array.from(new Set(approvals.map((a) => a.agent_name)));

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar pendingCount={approvals.length} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title="Attorney Approvals Queue" />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-navy">Pending Attorney Approvals</h2>
              <p className="text-xs text-mid mt-0.5">
                California Bar Compliance: Review AI agent generated work before release.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-navy font-semibold">
                <Filter className="w-4 h-4 text-gold" /> Filter:
              </div>

              {[
                ['document_agent', 'Documents'],
                ['medical_monitoring_agent', 'Medical'],
                ['litigation_agent', 'Litigation'],
                ['lemon_law_agent', 'Lemon Law'],
                ['research_agent', 'Research'],
                ['client_comms_agent', 'Client Updates'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAgentFilter(agentFilter === value ? 'all' : value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${agentFilter === value ? 'border-navy bg-navy text-white' : 'border-gray-200 bg-white text-navy hover:border-gold'}`}
                >
                  {label}
                </button>
              ))}

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs px-3 py-1.5 border rounded-lg bg-white text-navy focus:outline-none focus:ring-1 focus:ring-navy font-medium"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="routine">Routine</option>
              </select>

              <select
                value={agentFilter}
                onChange={(e) => setAgentFilter(e.target.value)}
                className="text-xs px-3 py-1.5 border rounded-lg bg-white text-navy focus:outline-none focus:ring-1 focus:ring-navy font-medium"
              >
                <option value="all">All Agents</option>
                {uniqueAgents.map((ag) => (
                  <option key={ag} value={ag}>
                    {ag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Approvals List */}
          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-xs font-semibold text-red-800">{loadError}</div>
          ) : isLoading ? (
            <div className="space-y-3 rounded-xl bg-white p-8">
              <Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" />
            </div>
          ) : filteredApprovals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy">No Pending Approvals — All Clear ✓</h3>
              <p className="text-xs text-mid mt-1">
                There are no AI agent actions waiting for attorney review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApprovals.map((app) => (
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
        </main>
      </div>
      <Toast message={toast} kind={toast === 'Action rejected' ? 'info' : 'success'} onClose={() => setToast(null)} />

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingApproval}
        onClose={() => setRejectingApproval(null)}
        title={rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Why are you rejecting this?' : `Reject Action — Case #${rejectingApproval?.case_id}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-mid leading-relaxed">
            {rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Please explain why this document needs revision.' : <>Please enter your feedback for the <span className="font-semibold text-navy">{rejectingApproval?.agent_name}</span>.</>}
          </p>

          <Input
            label={rejectingApproval?.agent_name.toLowerCase().includes('document') ? 'Why are you rejecting this?' : 'Rejection Feedback'}
            placeholder="Specify missing details or instructions for redrafting..."
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setRejectingApproval(null)}>
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
