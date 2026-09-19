import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { PendingApproval } from '@/types';
import { Check, X, FileText, Clock, Mail, FileStack, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Modal } from './ui/Modal';
import { ResearchFindings } from './ResearchFindings';

interface ApprovalCardProps {
  approval: PendingApproval;
  onApprove: (id: string) => void;
  onReject: (approval: PendingApproval) => void;
  isProcessing?: boolean;
}

export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  approval,
  onApprove,
  onReject,
  isProcessing = false,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const agentName = approval.agent_name.toLowerCase();
  const isDocumentApproval = agentName.includes('document');
  const isMedicalApproval = agentName.includes('medical');
  const isLitigationApproval = agentName.includes('litigation');
  const isResearchApproval = agentName.includes('research');
  const isClientCommsApproval = agentName.includes('client_comms');
  const agentIdentity = agentName.includes('email')
    ? { label: 'Email Agent', icon: Mail, color: 'text-purple-700 bg-purple-50 border-purple-200' }
    : agentName.includes('document')
      ? { label: 'Document Agent', icon: FileStack, color: 'text-amber-800 bg-amber-50 border-amber-200' }
      : agentName.includes('medical')
        ? { label: 'Medical Monitoring Agent', icon: Clock, color: 'text-orange-700 bg-orange-50 border-orange-200' }
        : agentName.includes('litigation')
          ? { label: 'Litigation Agent', icon: FileText, color: 'text-red-700 bg-red-50 border-red-200' }
          : agentName.includes('research')
            ? { label: 'Research Agent', icon: Search, color: 'text-teal-700 bg-teal-50 border-teal-200' }
          : agentName.includes('client_comms')
            ? { label: 'Client Comms Agent', icon: Mail, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' }
          : { label: 'Scheduling Agent', icon: Clock, color: 'text-blue-700 bg-blue-50 border-blue-200' };
  const AgentIcon = agentIdentity.icon;
  const documentType = approval.document_type ||
    (approval.action_summary.toLowerCase().includes('demand') ? 'Demand Letter' :
      approval.action_summary.toLowerCase().includes('retainer') ? 'Retainer' :
        approval.action_summary.toLowerCase().includes('intake') ? 'Intake' : 'Document');
  const lemonThreshold = approval.threshold_status || (approval.action_summary.toLowerCase().includes('demand') ? 'met_demand_ready' : 'not_met');
  const approvalClient = approval.client_name || (isMedicalApproval ? approval.action_summary.match(/case #[^:]+/i)?.[0] : null);
  const medicalDays = approval.days_since_update ?? (approval.action_summary.match(/(\d+) days?/i)?.[1] ? Number(approval.action_summary.match(/(\d+) days?/i)?.[1]) : null);
  const formattedTime = approval.created_at
    ? formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })
    : 'Recently';

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-gold">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-xs font-semibold ${agentIdentity.color}`}>
              <AgentIcon className="h-3.5 w-3.5" />
              {agentIdentity.label}
            </span>
            <Badge variant={approval.priority}>{approval.priority.toUpperCase()}</Badge>
            {isDocumentApproval && <span className="rounded-full border border-gold/50 bg-gold-light px-2 py-0.5 text-[10px] font-bold text-amber-900">{documentType}</span>}
            {isMedicalApproval && <span className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-800">Medical Follow-up</span>}
            {isLitigationApproval && <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-800">{documentType}</span>}
            {isResearchApproval && <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">{approval.citations?.length || 0} citations</span>}
            {agentName.includes('lemon') && <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${lemonThreshold === 'demand_sent' ? 'bg-emerald-100 text-emerald-800' : lemonThreshold === 'met_demand_ready' ? 'bg-gold-light text-amber-900' : 'bg-gray-100 text-gray-700'}`}>{lemonThreshold === 'demand_sent' ? 'Demand Sent' : lemonThreshold === 'met_demand_ready' ? 'Met — Demand Ready' : 'Not Met'}</span>}
            <span className="text-xs text-mid flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formattedTime}
            </span>
          </div>

          <div className="text-xs font-semibold text-navy">{isMedicalApproval && approvalClient ? approvalClient : isLitigationApproval && approval.case_title ? approval.case_title : `Case #${approval.case_id}`}</div>

          {isMedicalApproval && (
            <div className="flex flex-wrap gap-3 text-xs text-mid">
              <span>Days since update: <strong className="text-navy">{medicalDays ?? 'Unknown'}</strong></span>
              <span>Provider: <strong className="text-navy">{approval.provider_name || 'Not listed'}</strong></span>
            </div>
          )}

          <p className="text-sm text-dark font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
            {isClientCommsApproval ? (approval.message || approval.action_summary).slice(0, 100) : approval.action_summary}
          </p>

          {isDocumentApproval && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              disabled={isProcessing}
              className="shadow-sm"
            >
              <FileText className="mr-1 h-4 w-4" />
              Preview Document
            </Button>
          )}

          {isResearchApproval && (
            <Button variant="secondary" size="sm" onClick={() => setIsResearchOpen(true)} disabled={isProcessing}>
              <Search className="mr-1 h-4 w-4" /> View Research
            </Button>
          )}

          {!isDocumentApproval && approval.document_url && (
            <a
              href={approval.document_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-navy font-semibold hover:text-gold transition-colors"
            >
              <FileText className="w-4 h-4 text-gold" />
              View Draft Document
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <Button
            variant="success"
            size="sm"
            onClick={() => onApprove(approval.id)}
            isLoading={isProcessing}
            className="shadow-sm"
          >
            <Check className="w-4 h-4 mr-1" />
            {isMedicalApproval ? 'Approve Follow-up' : isLitigationApproval ? 'Approve Filing' : 'Approve'}
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onReject(approval)}
            disabled={isProcessing}
            className="shadow-sm"
          >
            <X className="w-4 h-4 mr-1" />
            Reject
          </Button>
        </div>
      </div>

      {isDocumentApproval && (
        <Modal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          title={`Document Preview — Case #${approval.case_id}`}
        >
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-mid">Attorney review copy</p>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-dark">
                {approval.preview_content || approval.action_summary}
              </pre>
            </div>
            {approval.document_url && (
              <p className="break-all text-xs text-mid">Stored document: {approval.document_url}</p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => { setIsPreviewOpen(false); onReject(approval); }} disabled={isProcessing}>
                <X className="mr-1 h-4 w-4" /> Reject with feedback
              </Button>
              <Button variant="success" size="sm" onClick={() => { setIsPreviewOpen(false); onApprove(approval.id); }} isLoading={isProcessing}>
                <Check className="mr-1 h-4 w-4" /> Approve
              </Button>
            </div>
          </div>
        </Modal>
      )}
      <ResearchFindings
        approval={isResearchApproval ? approval : null}
        isOpen={isResearchOpen}
        onClose={() => setIsResearchOpen(false)}
        onApprove={onApprove}
        onRequestMore={onReject}
        isProcessing={isProcessing}
      />
    </Card>
  );
};
