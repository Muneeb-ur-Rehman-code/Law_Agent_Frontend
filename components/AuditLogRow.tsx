import React from 'react';
import { AgentAction } from '@/types';
import { Badge } from './ui/Badge';
import { Clock, UserCheck, Cpu } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AuditLogRowProps {
  action: AgentAction;
}

export const AuditLogRow: React.FC<AuditLogRowProps> = ({ action }) => {
  const formattedTime = action.created_at
    ? formatDistanceToNow(new Date(action.created_at), { addSuffix: true })
    : 'Recently';

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors text-xs text-dark">
      <td className="py-3 px-4 font-mono text-gray-500 whitespace-nowrap">
        {action.created_at ? new Date(action.created_at).toLocaleString() : 'N/A'}
      </td>
      <td className="py-3 px-4 font-medium text-navy">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-navy/5 text-navy font-semibold">
          <Cpu className="w-3 h-3 text-gold" />
          {action.agent_name}
        </span>
      </td>
      <td className="py-3 px-4 font-mono font-semibold text-navy">
        {action.case_id ? `#${action.case_id}` : 'Global'}
      </td>
      <td className="py-3 px-4 font-medium">
        <div className="font-semibold text-dark">{action.action_type}</div>
      </td>
      <td className="py-3 px-4">
        <Badge
          variant={
            action.status === 'completed'
              ? 'completed'
              : action.status === 'rejected'
              ? 'rejected'
              : 'pending'
          }
        >
          {action.status.toUpperCase()}
        </Badge>
      </td>
      <td className="py-3 px-4 text-mid whitespace-nowrap">
        {action.approved_by ? (
          <span className="flex items-center gap-1 text-emerald-800 font-medium">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            {action.approved_by}
          </span>
        ) : (
          <span className="text-gray-400 italic">Automated</span>
        )}
      </td>
    </tr>
  );
};
