import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { AgentStatusInfo } from '@/types';
import { Cpu, Activity, Clock, Play } from 'lucide-react';
import { Button } from './ui/Button';

interface AgentStatusCardProps {
  name: string;
  agentInfo: AgentStatusInfo;
  onTrigger?: (name: string) => void;
  canTrigger?: boolean;
}

export const AgentStatusCard: React.FC<AgentStatusCardProps> = ({
  name,
  agentInfo,
  onTrigger,
  canTrigger = false,
}) => {
  const formattedName = name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy font-bold">
            <Cpu className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-navy">{formattedName}</h4>
            <p className="text-[11px] text-mid mt-0.5 line-clamp-1">
              {agentInfo.description || 'AI Agent'}
            </p>
          </div>
        </div>

        <Badge variant={agentInfo.status === 'running' ? 'running' : 'idle'}>
          {agentInfo.status.toUpperCase()}
        </Badge>
      </div>

      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-mid">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span>Last Run: {agentInfo.last_run ? new Date(agentInfo.last_run).toLocaleTimeString() : 'Never'}</span>
        </div>

        {canTrigger && onTrigger && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTrigger(name)}
            className="text-xs text-navy hover:text-gold p-1"
            title="Trigger Agent Run"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-current" />
            Run
          </Button>
        )}
      </div>
    </Card>
  );
};
