'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { AuditLogRow } from '@/components/AuditLogRow';
import { getAuditLog } from '@/lib/api';
import { AuditLogResponse, AgentAction } from '@/types';
import { History, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export default function AuditLogPage() {
  const router = useRouter();
  const [auditData, setAuditData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters
  const [agentFilter, setAgentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

    loadAuditLog();
  }, [page, agentFilter, statusFilter, router]);

  const loadAuditLog = async () => {
    try {
      setIsLoading(true);
      const data = await getAuditLog(page, 20, {
        agent_name: agentFilter || undefined,
        status: statusFilter || undefined,
      });
      setAuditData(data);
    } catch (err) {
      console.error('Failed to load audit log:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-light-gray overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar title="System Audit Log" />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-navy flex items-center gap-2">
                <History className="w-5 h-5 text-gold" />
                Immutable Agent Action Trail
              </h2>
              <p className="text-xs text-mid mt-0.5">
                Complete audit history of agent decisions, executions, and attorney approvals
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="w-44">
                <Input
                  placeholder="Filter by agent..."
                  value={agentFilter}
                  onChange={(e) => {
                    setAgentFilter(e.target.value);
                    setPage(1);
                  }}
                  className="py-1 text-xs"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs px-3 py-1.5 border rounded-lg bg-white text-navy focus:outline-none focus:ring-1 focus:ring-navy font-medium"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Audit Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-navy uppercase tracking-wider">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Agent</th>
                    <th className="py-3 px-4">Case #</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-mid animate-pulse">
                        Loading audit log records...
                      </td>
                    </tr>
                  ) : auditData?.items && auditData.items.length > 0 ? (
                    auditData.items.map((act) => <AuditLogRow key={act.id} action={act} />)
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-xs text-mid">
                        No audit records match the current criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {auditData && auditData.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-mid bg-gray-50/50">
                <div>
                  Page <span className="font-bold text-navy">{auditData.page}</span> of{' '}
                  <span className="font-bold text-navy">{auditData.pages}</span> ({auditData.total} total items)
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-navy"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page >= auditData.pages}
                    onClick={() => setPage((p) => Math.min(auditData.pages, p + 1))}
                    className="p-1.5 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-navy"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
