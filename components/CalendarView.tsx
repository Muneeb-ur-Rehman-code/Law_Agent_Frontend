'use client';

import React, { useMemo } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEventItem } from '@/types';
import { CalendarEvent } from './CalendarEvent';
import { eventDateKey } from './DayEventsModal';
import { Button } from './ui/Button';

interface CalendarViewProps {
  month: Date;
  events: CalendarEventItem[];
  onMonthChange: (month: Date) => void;
  onSelectDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ month, events, onMonthChange, onSelectDate }) => {
  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  }), [month]);

  const eventsByDate = useMemo(() => events.reduce<Record<string, CalendarEventItem[]>>((grouped, event) => {
    const key = eventDateKey(event);
    grouped[key] = grouped[key] || [];
    grouped[key].push(event);
    return grouped;
  }, {}), [events]);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 sm:px-6">
        <h2 className="text-base font-bold text-navy">{format(month, 'MMMM yyyy')}</h2>
        <div className="flex items-center gap-1">
          <Button aria-label="Previous month" title="Previous month" variant="ghost" size="sm" onClick={() => onMonthChange(subMonths(month, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onMonthChange(new Date())}>Today</Button>
          <Button aria-label="Next month" title="Next month" variant="ghost" size="sm" onClick={() => onMonthChange(addMonths(month, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-mid">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[key] || [];
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(day)}
              className="min-h-[108px] border-b border-r border-gray-100 p-1.5 text-left align-top transition-colors hover:bg-gold-light/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gold sm:min-h-[132px] sm:p-2"
            >
              <span className={isToday(day) ? 'inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy text-xs font-bold text-white' : `inline-flex h-6 w-6 items-center justify-center text-xs font-semibold ${isSameMonth(day, month) ? 'text-navy' : 'text-gray-300'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 3).map((event) => <CalendarEvent key={event.id} event={event} compact />)}
                {dayEvents.length > 3 && <span className="block px-1 text-[10px] font-semibold text-mid">+{dayEvents.length - 3} more</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
