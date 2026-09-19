'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEventItem } from '@/types';
import { CalendarEvent } from './CalendarEvent';
import { Modal } from './ui/Modal';

interface DayEventsModalProps {
  date: Date | null;
  events: CalendarEventItem[];
  onClose: () => void;
}

export const DayEventsModal: React.FC<DayEventsModalProps> = ({ date, events, onClose }) => (
  <Modal
    isOpen={!!date}
    onClose={onClose}
    title={date ? format(date, 'EEEE, MMMM d, yyyy') : 'Calendar events'}
  >
    {events.length === 0 ? (
      <p className="py-4 text-center text-sm text-mid">No events scheduled for this day.</p>
    ) : (
      <div className="space-y-3">
        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-gray-200 p-3">
            <CalendarEvent event={event} />
            <div className="mt-2 flex items-center justify-between gap-3 text-xs text-mid">
              <span>{event.case_id ? `Case #${event.case_id}` : 'Firm calendar'}</span>
              {event.start_time && (
                <span>{event.start_time}{event.end_time ? ` - ${event.end_time}` : ''}</span>
              )}
            </div>
            {event.description && <p className="mt-2 text-xs leading-relaxed text-dark">{event.description}</p>}
          </div>
        ))}
      </div>
    )}
  </Modal>
);

export const eventDateKey = (event: CalendarEventItem): string => {
  try {
    return format(parseISO(event.date), 'yyyy-MM-dd');
  } catch {
    return event.date.slice(0, 10);
  }
};
