'use client';

import React from 'react';
import { CalendarEventItem } from '@/types';
import { clsx } from 'clsx';

interface CalendarEventProps {
  event: CalendarEventItem;
  compact?: boolean;
}

const eventStyles: Record<CalendarEventItem['type'], string> = {
  deadline: 'bg-red-100 text-red-800 border-red-200',
  hearing: 'bg-blue-100 text-blue-800 border-blue-200',
  deposition: 'bg-purple-100 text-purple-800 border-purple-200',
  trial: 'bg-rose-100 text-rose-900 border-rose-300',
  medical: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const CalendarEvent: React.FC<CalendarEventProps> = ({ event, compact = false }) => (
  <div
    title={`${event.title} — ${event.type.replace('_', ' ')}`}
    className={clsx(
      'truncate border rounded px-1.5 py-1 text-[10px] font-semibold leading-tight',
      eventStyles[event.type] || eventStyles.other,
      compact ? 'max-w-full' : 'text-xs'
    )}
  >
    {event.start_time && <span className="font-normal mr-1">{event.start_time}</span>}
    {event.title}
  </div>
);
