'use client';

import React from 'react';
import { AlertTriangle, Check, Search } from 'lucide-react';
import { PendingApproval } from '@/types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface ResearchFindingsProps {
  approval: PendingApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRequestMore: (approval: PendingApproval) => void;
  isProcessing?: boolean;
}

export const ResearchFindings: React.FC<ResearchFindingsProps> = ({
  approval, isOpen, onClose, onApprove, onRequestMore, isProcessing = false,
}) => {
  if (!approval) return null;
  const citations = approval.citations || [];
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Research Findings — Attorney Review">
      <div className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          All citations must be verified by attorney before use in filings
        </div>
        {approval.research_query && <p className="text-xs text-mid"><strong className="text-navy">Query:</strong> {approval.research_query}</p>}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-mid"><Search className="h-3.5 w-3.5 text-gold" /> Research summary</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-dark">{approval.research_findings || approval.action_summary}</p>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-bold text-navy">Citations ({citations.length})</h4>
          {citations.length === 0 ? <p className="text-xs text-mid">No structured citations returned. Verify all authorities manually.</p> : (
            <div className="space-y-2">
              {citations.map((citation, index) => (
                <div key={`${citation.citation}-${index}`} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-navy"><span>{citation.citation}</span><span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-900">Verify before use</span></div>
                  {citation.note && <p className="mt-1 text-[11px] text-mid">{citation.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-3">
          <Button variant="danger" size="sm" onClick={() => { onClose(); onRequestMore(approval); }} disabled={isProcessing}>Request More Research</Button>
          <Button variant="success" size="sm" onClick={() => { onClose(); onApprove(approval.id); }} isLoading={isProcessing}><Check className="mr-1 h-4 w-4" /> Approve for Use in Filing</Button>
        </div>
      </div>
    </Modal>
  );
};