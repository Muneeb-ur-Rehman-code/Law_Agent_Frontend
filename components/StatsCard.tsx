import React from 'react';
import { Card } from './ui/Card';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  highlight?: boolean;
  color?: 'default' | 'danger' | 'warning' | 'success';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  href,
  highlight = false,
  color = 'default',
}) => {
  const iconColors = {
    default: 'bg-navy/10 text-navy',
    danger: 'bg-red-100 text-danger',
    warning: 'bg-amber-100 text-amber-700',
    success: 'bg-emerald-100 text-emerald-700',
  };

  const cardContent = (
    <Card
      className={clsx(
        'transition-all hover:shadow-md cursor-pointer relative overflow-hidden',
        highlight && 'border-l-4 border-l-gold'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-mid uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-navy mt-1">{value}</h3>
        </div>

        <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center font-bold', iconColors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );

  if (href) {
    return <Link href={href}>{cardContent}</Link>;
  }

  return cardContent;
};
