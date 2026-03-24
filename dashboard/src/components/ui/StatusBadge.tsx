'use client';

import { LeadStatus, LEAD_STATUS_CONFIG } from '@/types';

interface StatusBadgeProps {
  status: LeadStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = LEAD_STATUS_CONFIG[status];

  return (
    <span
      className="badge"
      style={{
        background: config.bgColor,
        color: config.color,
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        padding: size === 'sm' ? '0.15rem 0.5rem' : '0.25rem 0.625rem',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0"
        style={{ background: config.color }}
      />
      {config.label}
    </span>
  );
}
