'use client';

import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number | null;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** If true, high score = good (green). If false, high score = bad (red). Default: true */
  highIsGood?: boolean;
}

export default function ScoreGauge({ score, size = 64, strokeWidth = 5, label, highIsGood = true }: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (score === null) return 'var(--text-muted)';
    if (highIsGood) {
      if (score >= 70) return 'var(--accent-green)';
      if (score >= 40) return 'var(--accent-amber)';
      return 'var(--accent-red)';
    } else {
      if (score >= 70) return 'var(--accent-red)';
      if (score >= 40) return 'var(--accent-amber)';
      return 'var(--accent-green)';
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="score-ring" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold" style={{ color: getColor() }}>
            {score !== null ? score : '--'}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
