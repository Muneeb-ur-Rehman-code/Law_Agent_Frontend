import React from 'react';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Case } from '@/types';
import { Calendar, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface CaseCardProps {
  caseData: Case;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseData }) => {
  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card className="hover:border-navy hover:shadow-md transition-all cursor-pointer group h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-bold text-navy bg-navy/5 px-2.5 py-1 rounded-md">
              Case #{caseData.case_number || caseData.id}
            </span>
            {caseData.closed_date ? (
              <Badge variant="idle">Closed</Badge>
            ) : (
              <Badge variant="running">Active</Badge>
            )}
          </div>

          <h4 className="font-bold text-base text-navy group-hover:text-gold transition-colors line-clamp-2 mb-2">
            {caseData.title || `Case #${caseData.id}`}
          </h4>

          {caseData.description && (
            <p className="text-xs text-mid line-clamp-2 mb-4">
              {caseData.description}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
          {caseData.last_date_to_file_claim && (
            <div className="flex items-center justify-between text-amber-800 font-semibold bg-amber-50 p-2 rounded-md border border-amber-100">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                Statute Deadline:
              </span>
              <span>{caseData.last_date_to_file_claim}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-mid pt-1">
            <span>Bill Type: {caseData.bill_type || 'Standard'}</span>
            <span className="flex items-center text-navy font-semibold group-hover:translate-x-1 transition-transform">
              View Case <ChevronRight className="w-4 h-4 ml-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
