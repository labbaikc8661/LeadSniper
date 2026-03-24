'use client';

import { motion } from 'framer-motion';
import { Search, Calendar, MapPin, Tag, Hash, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useSearches, useLeads } from '@/lib/hooks';
import { formatDateTime, timeAgo } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';

export default function SearchHistoryPage() {
  const { searches, loading } = useSearches();
  const { leads } = useLeads();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 shimmer rounded-xl w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shimmer h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Search History</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          All your scraping sessions and their results.
        </p>
      </motion.div>

      {searches.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No searches yet"
          description="Run the scraper from your terminal to start finding leads."
        />
      ) : (
        <div className="space-y-3">
          {searches.map((search, i) => {
            const searchLeads = leads.filter((l) => l.search_id === search.id);
            const emailsFound = searchLeads.filter((l) => l.emails.length > 0).length;
            const withWebsite = searchLeads.filter((l) => l.has_website).length;

            const statusConfig = {
              completed: { icon: CheckCircle2, color: 'var(--accent-green)', label: 'Completed' },
              failed: { icon: XCircle, color: 'var(--accent-red)', label: 'Failed' },
              running: { icon: Loader2, color: 'var(--accent-blue)', label: 'Running' },
              pending: { icon: Loader2, color: 'var(--text-muted)', label: 'Pending' },
            }[search.status];

            const StatusIcon = statusConfig.icon;

            return (
              <motion.div
                key={search.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="surface-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))' }}
                    >
                      <Search size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">
                        {search.niche} <span style={{ color: 'var(--text-muted)' }}>in</span> {search.city}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Calendar size={11} /> {timeAgo(search.created_at)}
                        </div>
                        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Hash size={11} /> {search.total_results} results
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] font-medium" style={{ color: 'var(--accent-blue)' }}>
                          {emailsFound} emails
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: 'var(--accent-green)' }}>
                          {withWebsite} websites
                        </span>
                        <span className="text-[11px] font-medium" style={{ color: 'var(--accent-amber)' }}>
                          {searchLeads.length - withWebsite} no site
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: `${statusConfig.color}15`, color: statusConfig.color }}
                  >
                    <StatusIcon size={12} className={search.status === 'running' ? 'animate-spin' : ''} />
                    {statusConfig.label}
                  </div>
                </div>

                {search.error_message && (
                  <div className="mt-3 p-2.5 rounded-lg text-xs" style={{ background: 'rgba(248, 113, 113, 0.08)', color: 'var(--accent-red)' }}>
                    {search.error_message}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
