'use client';

import { motion } from 'framer-motion';
import { Star, Mail, Phone, Globe, Target, Smartphone } from 'lucide-react';
import { Lead } from '@/types';

interface LeadHoverCardProps {
  lead: Lead;
  position: { x: number; y: number };
}

export default function LeadHoverCard({ lead, position }: LeadHoverCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 5 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="fixed z-[100] w-72 p-4 rounded-xl pointer-events-none"
      style={{
        left: Math.min(position.x, window.innerWidth - 310),
        top: position.y + 10,
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(24px)',
      }}
    >
      <div className="space-y-3">
        {/* Name + Rating */}
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lead.business_name}</h4>
            {lead.address && (
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{lead.address}</p>
            )}
          </div>
          {lead.rating && (
            <div className="flex items-center gap-1">
              <Star size={12} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--accent-amber)' }}>{lead.rating}</span>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {lead.opportunity_score !== null && (
            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <Target size={12} className="mx-auto mb-1" style={{ color: 'var(--accent-primary)' }} />
              <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>{lead.opportunity_score}</span>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Score</p>
            </div>
          )}
          {lead.page_speed_score !== null && (
            <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
              <Globe size={12} className="mx-auto mb-1" style={{ color: lead.page_speed_score >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }} />
              <span className="text-xs font-bold" style={{ color: lead.page_speed_score >= 50 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{lead.page_speed_score}</span>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Speed</p>
            </div>
          )}
          <div className="text-center p-2 rounded-lg" style={{ background: 'var(--bg-input)' }}>
            <Smartphone size={12} className="mx-auto mb-1" style={{ color: lead.has_mobile_app ? 'var(--accent-green)' : 'var(--accent-red)' }} />
            <span className="text-xs font-bold" style={{ color: lead.has_mobile_app ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {lead.has_mobile_app ? 'Yes' : 'No'}
            </span>
            <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>App</p>
          </div>
        </div>

        {/* Contact availability */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Mail size={11} style={{ color: lead.emails?.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }} />
            <span className="text-[10px]" style={{ color: lead.emails?.length > 0 ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
              {lead.emails?.length > 0 ? lead.emails[0] : 'No email'}
            </span>
          </div>
          {lead.phone && (
            <div className="flex items-center gap-1">
              <Phone size={11} style={{ color: 'var(--accent-green)' }} />
              <span className="text-[10px]" style={{ color: 'var(--accent-green)' }}>{lead.phone}</span>
            </div>
          )}
        </div>

        {/* Pitch summary preview */}
        {lead.pitch_summary && (
          <p className="text-[10px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {lead.pitch_summary}
          </p>
        )}
      </div>
    </motion.div>
  );
}
