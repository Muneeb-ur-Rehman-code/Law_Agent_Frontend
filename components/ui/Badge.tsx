import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'routine' | 'urgent' | 'critical' | 'completed' | 'pending' | 'rejected' | 'running' | 'idle' | 'gold' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const styles = {
    routine: 'bg-gray-100 text-gray-700 border-gray-200',
    urgent: 'bg-amber-50 text-amber-700 border-amber-200',
    critical: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    running: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold animate-pulse',
    idle: 'bg-slate-100 text-slate-600 border-slate-200',
    gold: 'bg-amber-100 text-amber-900 border-amber-300 font-medium',
    default: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
