'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays, CheckCircle2, CircleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CalendarView } from '@/components/CalendarView';
import { DayEventsModal } from '@/components/DayEventsModal';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { getCalendarEvents, getSchedulerStatus } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import { CalendarEventItem } from '@/types';

export default function CalendarPage() {
  const router = useRouter();
  const [month, setMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ connected: boolean; lastSync: string | null }>({ connected: false, lastSync: null });

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    loadCalendar(month);
  }, [router, month]);

  const loadCalendar = async (visibleMonth: Date) => {
    setIsLoading(true);
    setLoadError(null);
    const monthKey = format(visibleMonth, 'yyyy-MM');
    try {
      const [calendar, scheduler] = await Promise.all([
        getCalendarEvents(monthKey),
        getSchedulerStatus().catch(() => ({ last_run: null, last_error: null })),
      ]);
      setEvents(calendar.events || []);
      setSyncStatus({
        connected: calendar.google_calendar_connected ?? Boolean(scheduler.last_run && !scheduler.last_error),
        lastSync: calendar.last_sync || scheduler.last_run || null,
      });
    } catch (error) {
      console.error('Failed to load calendar:', error);
      setLoadError(error instanceof Error ? error.message : 'Unable to load calendar events.');
      setEvents([]);
      setSyncStatus({ connected: false, lastSync: null });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-light-gray">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Navbar title="Firm Calendar" />
        <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-gold" />
                <h1 className="text-lg font-bold text-navy">Case & Court Calendar</h1>
              </div>
              <p className="mt-1 text-xs text-mid">Deadlines, hearings, depositions, and medical appointments.</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
              {syncStatus.connected ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <CircleAlert className="h-4 w-4 text-amber-600" />}
              <span className={syncStatus.connected ? 'font-semibold text-emerald-800' : 'font-semibold text-amber-800'}>
                {syncStatus.connected ? 'Synced with Google Calendar' : 'Google Calendar not connected'}
              </span>
              {syncStatus.lastSync && <span className="hidden text-mid sm:inline">Last sync {new Date(syncStatus.lastSync).toLocaleString()}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs text-mid shadow-sm">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Deadlines</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Court dates & hearings</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Depositions</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Trial dates</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Medical appointments</span>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-xs font-semibold text-red-800">{loadError}</div>
          ) : isLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-16 text-center text-xs text-mid shadow-sm">Loading calendar...</div>
          ) : (
            <CalendarView month={month} events={events} onMonthChange={setMonth} onSelectDate={setSelectedDate} />
          )}
        </main>
      </div>
      <DayEventsModal date={selectedDate} events={selectedDate ? events.filter((event) => event.date.slice(0, 10) === format(selectedDate, 'yyyy-MM-dd')) : []} onClose={() => setSelectedDate(null)} />
    </div>
  );
}
