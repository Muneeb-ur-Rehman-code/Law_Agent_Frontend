import React from 'react';
import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface DeadlineAlertProps {
  count: number;
  details?: { id: number; title: string; case_number: number; last_date_to_file_claim: string }[];
}

export const DeadlineAlert: React.FC<DeadlineAlertProps> = ({ count, details = [] }) => {
  if (count <= 0) return null;

  return (
    <div className="bg-red-50 border-l-4 border-danger p-4 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-red-100 text-danger flex-shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-red-950 flex items-center gap-2">
            <span>Critical Action Required:</span>
            <span className="bg-danger text-white text-xs px-2 py-0.5 rounded-full font-extrabold">
              {count} {count === 1 ? 'Deadline' : 'Deadlines'} This Week
            </span>
          </h4>
          <p className="text-xs text-red-800 mt-1">
            Statute of limitations deadline approaching within the next 7 days.
            {details.length > 0 && ` Upcoming cases: ${details.map(d => `#${d.case_number || d.id}`).join(', ')}`}
          </p>
        </div>
      </div>

      <Link
        href="/cases"
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-red-700 transition-colors flex-shrink-0 self-start sm:self-auto shadow-sm"
      >
        Review Cases <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};
