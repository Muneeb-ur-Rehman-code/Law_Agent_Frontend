'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Info, XCircle } from 'lucide-react';

export type ToastKind = 'success' | 'error' | 'info';

export const Toast: React.FC<{ message: string | null; kind?: ToastKind; onClose: () => void }> = ({ message, kind = 'info', onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, 3000);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  const Icon = kind === 'success' ? CheckCircle2 : kind === 'error' ? XCircle : Info;
  const colors = kind === 'success' ? 'bg-emerald-700' : kind === 'error' ? 'bg-red-700' : 'bg-navy';
  return <div role="status" className={`fixed bottom-5 right-5 z-[60] flex max-w-sm items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white shadow-xl ${colors}`}><Icon className="h-4 w-4 shrink-0" />{message}</div>;
};