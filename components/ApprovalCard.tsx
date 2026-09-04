import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { PendingApproval } from '@/types';
import { Check, X, FileText, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
  const formattedTime = approval.created_at
    ? formatDistanceToNow(new Date(approval.created_at), { addSuffix: true })
    : 'Recently';

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-gold">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-navy text-gold">
              {approval.agent_name}
            </span>
            <Badge variant={approval.priority}>{approval.priority.toUpperCase()}</Badge>
            <span className="text-xs text-mid flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              {formattedTime}
            </span>
          </div>

          <div className="text-xs font-semibold text-navy">
            Case #{approval.case_id}
          </div>

          <p className="text-sm text-dark font-medium leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
            {approval.action_summary}
          </p>

          {approval.document_url && (
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
            Approve
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
    </Card>
  );
};
