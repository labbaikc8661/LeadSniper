'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Download, Mail, Phone, MessageCircle,
  Globe, Star, ArrowUpDown, ExternalLink, CheckSquare, Square,
  Target, Trash2, ChevronDown,
} from 'lucide-react';
import { useLeads, bulkUpdateLeadStatus } from '@/lib/hooks';
import { Lead, LeadStatus, LEAD_STATUS_CONFIG } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import SlideDrawer from '@/components/ui/SlideDrawer';
import LeadDetail from '@/components/dashboard/LeadDetail';
import LeadHoverCard from '@/components/ui/LeadHoverCard';
import EmptyState from '@/components/ui/EmptyState';
import { getWhatsAppLink, getEmailLink, truncate, getSpeedScoreColor } from '@/lib/utils';

type SortKey = 'business_name' | 'rating' | 'review_count' | 'page_speed_score' | 'created_at' | 'opportunity_score';
type SortDir = 'asc' | 'desc';

export default function LeadsPage() {
  const { leads, loading, refetch } = useLeads();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState<boolean | null>(null);
  const [hasEmailFilter, setHasEmailFilter] = useState<boolean | null>(null);
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  // Hover preview
  const [hoveredLead, setHoveredLead] = useState<Lead | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const filteredLeads = useMemo(() => {
    let result = leads;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(l =>
        l.business_name.toLowerCase().includes(q) ||
        l.emails.some(e => e.toLowerCase().includes(q)) ||
        l.address?.toLowerCase().includes(q) ||
        l.phone?.includes(q)
      );
    }

    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter);
    if (hasWebsiteFilter !== null) result = result.filter(l => l.has_website === hasWebsiteFilter);
    if (hasEmailFilter !== null) result = result.filter(l => hasEmailFilter ? l.emails.length > 0 : l.emails.length === 0);

    result.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, search, statusFilter, sortKey, sortDir, hasWebsiteFilter, hasEmailFilter]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredLeads.map(l => l.id)));
  };

  const handleBulkAction = async (status: LeadStatus) => {
    const ids = Array.from(selectedIds);
    await bulkUpdateLeadStatus(ids, status);
    setSelectedIds(new Set());
    setShowBulkMenu(false);
    refetch();
  };

  const handleHoverEnter = useCallback((lead: Lead, e: React.MouseEvent) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      setHoveredLead(lead);
      setHoverPos({ x: e.clientX, y: e.clientY });
    }, 400);
  }, []);

  const handleHoverLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHoveredLead(null);
  }, []);

  const exportCSV = () => {
    const headers = ['Business Name', 'Rating', 'Reviews', 'Email', 'Phone', 'Website', 'Status', 'Speed Score', 'Opportunity Score', 'Tech Stack', 'Pitch Angles'];
    const rows = filteredLeads.map(l => [
      l.business_name, l.rating ?? '', l.review_count, l.emails.join('; '),
      l.phone ?? '', l.website_url ?? '', l.status, l.page_speed_score ?? '',
      l.opportunity_score ?? '', l.tech_stack.join(', '), l.pitch_angles.join(', '),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const SortHeader = ({ label, sortKeyProp }: { label: string; sortKeyProp: SortKey }) => (
    <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none"
      style={{ color: 'var(--text-muted)' }} onClick={() => toggleSort(sortKeyProp)}>
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={11} style={{ opacity: sortKey === sortKeyProp ? 1 : 0.3 }} />
      </div>
    </th>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 shimmer rounded-xl w-32" />
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer h-14 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {filteredLeads.length} of {leads.length} leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 rounded-lg"
                style={{ background: 'rgba(124, 92, 252, 0.12)', color: 'var(--accent-primary)' }}>
                {selectedIds.size} selected
              </span>
              <div className="relative">
                <button onClick={() => setShowBulkMenu(!showBulkMenu)}
                  className="gradient-btn text-xs flex items-center gap-1">
                  Bulk Action <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {showBulkMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden z-50"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-medium)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                      {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
                        <button key={key} onClick={() => handleBulkAction(key as LeadStatus)}
                          className="w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:brightness-110"
                          style={{ color: config.color }}>
                          Mark as {config.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={() => setSelectedIds(new Set())}
                className="text-xs px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                Clear
              </button>
            </motion.div>
          )}
          <button onClick={exportCSV} className="gradient-btn flex items-center gap-2 text-xs">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by name, email, phone..." value={search}
            onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as LeadStatus | 'all')} className="input-field w-auto">
          <option value="all">All Status</option>
          {Object.entries(LEAD_STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
          <Filter size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex gap-3 flex-wrap">
          {[
            { label: 'Has Website', value: hasWebsiteFilter === true, set: () => setHasWebsiteFilter(hasWebsiteFilter === true ? null : true), color: 'var(--accent-green)' },
            { label: 'No Website', value: hasWebsiteFilter === false, set: () => setHasWebsiteFilter(hasWebsiteFilter === false ? null : false), color: 'var(--accent-red)' },
            { label: 'Has Email', value: hasEmailFilter === true, set: () => setHasEmailFilter(hasEmailFilter === true ? null : true), color: 'var(--accent-blue)' },
            { label: 'No Email', value: hasEmailFilter === false, set: () => setHasEmailFilter(hasEmailFilter === false ? null : false), color: 'var(--accent-red)' },
          ].map(f => (
            <button key={f.label} onClick={f.set}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: f.value ? `${f.color}15` : 'var(--bg-input)',
                color: f.value ? f.color : 'var(--text-muted)',
                border: `1px solid ${f.value ? `${f.color}40` : 'var(--border-subtle)'}`,
              }}>
              {f.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState icon={Search} title="No leads found" description="Try adjusting your search or filters, or run the scraper to get new leads." />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="py-3 px-3 w-8">
                    <button onClick={toggleSelectAll}>
                      {selectedIds.size === filteredLeads.length && filteredLeads.length > 0
                        ? <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />
                        : <Square size={15} style={{ color: 'var(--text-muted)' }} />}
                    </button>
                  </th>
                  <SortHeader label="Business" sortKeyProp="business_name" />
                  <SortHeader label="Score" sortKeyProp="opportunity_score" />
                  <SortHeader label="Rating" sortKeyProp="rating" />
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact</th>
                  <SortHeader label="Speed" sortKeyProp="page_speed_score" />
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="text-left py-3 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => {
                  const email = lead.emails?.[0];
                  return (
                    <motion.tr key={lead.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: selectedIds.has(lead.id) ? 'rgba(124, 92, 252, 0.05)' : i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                      }}
                      onClick={() => setSelectedLead(lead)}
                      onMouseEnter={e => { handleHoverEnter(lead, e); e.currentTarget.style.background = 'var(--bg-hover)'; }}
                      onMouseLeave={e => { handleHoverLeave(); e.currentTarget.style.background = selectedIds.has(lead.id) ? 'rgba(124, 92, 252, 0.05)' : i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)'; }}
                    >
                      <td className="py-3 px-3" onClick={e => { e.stopPropagation(); toggleSelect(lead.id); }}>
                        {selectedIds.has(lead.id)
                          ? <CheckSquare size={15} style={{ color: 'var(--accent-primary)' }} />
                          : <Square size={15} style={{ color: 'var(--text-muted)' }} />}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))', color: 'white' }}>
                            {lead.business_name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium">{truncate(lead.business_name, 24)}</span>
                            {!lead.has_website && (
                              <span className="ml-1.5 text-[9px] font-semibold px-1 py-0.5 rounded" style={{ background: 'rgba(248, 113, 113, 0.12)', color: 'var(--accent-red)' }}>NO SITE</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {lead.opportunity_score !== null ? (
                          <div className="flex items-center gap-1">
                            <Target size={12} style={{ color: 'var(--accent-primary)' }} />
                            <span className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>{lead.opportunity_score}</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>--</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {lead.rating ? (
                          <div className="flex items-center gap-1">
                            <Star size={12} fill="var(--accent-amber)" style={{ color: 'var(--accent-amber)' }} />
                            <span className="text-sm font-medium">{lead.rating}</span>
                          </div>
                        ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>--</span>}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {email && <Mail size={13} style={{ color: 'var(--accent-blue)' }} />}
                          {lead.phone && <Phone size={13} style={{ color: 'var(--accent-green)' }} />}
                          {lead.has_website && <Globe size={13} style={{ color: 'var(--text-secondary)' }} />}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {lead.page_speed_score !== null ? (
                          <span className="text-sm font-medium" style={{ color: getSpeedScoreColor(lead.page_speed_score) }}>
                            {lead.page_speed_score}
                          </span>
                        ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>--</span>}
                      </td>
                      <td className="py-3 px-3"><StatusBadge status={lead.status} /></td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                          {email && (
                            <a href={getEmailLink(email, '', lead.ai_email_draft || '')} className="p-1.5 rounded-lg hover:scale-110 transition-transform" style={{ color: 'var(--accent-blue)' }}>
                              <Mail size={14} />
                            </a>
                          )}
                          {lead.phone && (
                            <a href={getWhatsAppLink(lead.phone)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:scale-110 transition-transform" style={{ color: 'var(--accent-green)' }}>
                              <MessageCircle size={14} />
                            </a>
                          )}
                          {lead.website_url && (
                            <a href={lead.website_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:scale-110 transition-transform" style={{ color: 'var(--text-muted)' }}>
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Hover preview */}
      <AnimatePresence>
        {hoveredLead && <LeadHoverCard lead={hoveredLead} position={hoverPos} />}
      </AnimatePresence>

      {/* Detail drawer */}
      <SlideDrawer isOpen={!!selectedLead} onClose={() => setSelectedLead(null)}
        title={selectedLead?.business_name || ''} width="max-w-xl">
        {selectedLead && (
          <LeadDetail lead={selectedLead} onUpdate={() => { setSelectedLead(null); refetch(); }} />
        )}
      </SlideDrawer>
    </div>
  );
}
