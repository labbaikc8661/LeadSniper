'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Search, Loader2, CheckCircle2, XCircle, Clock,
  Bookmark, BookmarkPlus, Trash2, Globe2, Zap, Settings2,
} from 'lucide-react';
import { useSearchRequests, useSearchPresets, createSearchRequest, saveSearchPreset, deleteSearchPreset } from '@/lib/hooks';
import { timeAgo } from '@/lib/utils';

export default function SnipePage() {
  const { requests, loading: reqLoading } = useSearchRequests();
  const { presets, refetch: refetchPresets } = useSearchPresets();
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [maxResults, setMaxResults] = useState(100);
  const [skipCrawl, setSkipCrawl] = useState(false);
  const [skipAnalysis, setSkipAnalysis] = useState(false);
  const [skipAi, setSkipAi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !city.trim()) return;
    setSubmitting(true);
    await createSearchRequest(niche.trim(), city.trim(), {
      maxResults,
      skipCrawl,
      skipAnalysis,
      skipAi,
    });
    setSubmitting(false);
  };

  const handleLoadPreset = (preset: typeof presets[0]) => {
    setNiche(preset.niche);
    setCity(preset.city);
    setMaxResults(preset.max_results);
  };

  const handleSavePreset = async () => {
    if (!presetName.trim() || !niche.trim() || !city.trim()) return;
    await saveSearchPreset(presetName.trim(), niche.trim(), city.trim(), undefined, maxResults);
    setPresetName('');
    setShowSavePreset(false);
    refetchPresets();
  };

  const handleDeletePreset = async (id: string) => {
    await deleteSearchPreset(id);
    refetchPresets();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />;
      case 'failed': return <XCircle size={14} style={{ color: 'var(--accent-red)' }} />;
      case 'running': return <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />;
      default: return <Clock size={14} style={{ color: 'var(--accent-amber)' }} />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Snipe</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Launch searches from here. Make sure the scraper is running in watch mode.
        </p>
      </motion.div>

      {/* Search form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="surface-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Rocket size={18} style={{ color: 'var(--accent-primary)' }} />
          <h2 className="text-sm font-semibold">New Search</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Business Type / Niche</label>
            <input
              type="text"
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="e.g. Avocat, Dental Clinic, Real Estate"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>City</label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Paris, Dubai, Casablanca"
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Advanced options */}
        <button type="button" onClick={() => setShowOptions(!showOptions)}
          className="flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}>
          <Settings2 size={12} /> Advanced Options
        </button>

        <AnimatePresence>
          {showOptions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 overflow-hidden"
            >
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--text-secondary)' }}>Max Results</label>
                <input type="number" value={maxResults} onChange={e => setMaxResults(parseInt(e.target.value) || 100)}
                  className="input-field w-32" min={1} max={500} />
              </div>
              <div className="flex gap-4">
                {[
                  { label: 'Skip Crawl', checked: skipCrawl, set: setSkipCrawl },
                  { label: 'Skip Analysis', checked: skipAnalysis, set: setSkipAnalysis },
                  { label: 'Skip AI', checked: skipAi, set: setSkipAi },
                ].map(opt => (
                  <label key={opt.label} className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={opt.checked} onChange={e => opt.set(e.target.checked)} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={submitting || !niche.trim() || !city.trim()}
            className="gradient-btn flex items-center gap-2">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
              : <><Rocket size={14} /> Launch Search</>}
          </button>
          <button type="button" onClick={() => setShowSavePreset(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
            <BookmarkPlus size={13} /> Save Preset
          </button>
        </div>

        {/* Save preset input */}
        <AnimatePresence>
          {showSavePreset && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden">
              <input type="text" value={presetName} onChange={e => setPresetName(e.target.value)}
                placeholder="Preset name" className="input-field flex-1 text-xs" />
              <button onClick={handleSavePreset} className="gradient-btn text-xs">Save</button>
              <button onClick={() => setShowSavePreset(false)} className="text-xs px-2" style={{ color: 'var(--text-muted)' }}>Cancel</button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Presets */}
      {presets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="surface-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Bookmark size={15} style={{ color: 'var(--accent-amber)' }} />
            <h3 className="text-sm font-semibold">Presets</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, i) => (
              <motion.div key={preset.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer group transition-all hover:scale-[1.02]"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}
                onClick={() => handleLoadPreset(preset)}>
                <Globe2 size={12} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{preset.name}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {preset.niche} - {preset.city}
                </span>
                <button onClick={e => { e.stopPropagation(); handleDeletePreset(preset.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                  style={{ color: 'var(--accent-red)' }}>
                  <Trash2 size={10} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="surface-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} style={{ color: 'var(--accent-blue)' }} />
          <h3 className="text-sm font-semibold">Recent Requests</h3>
        </div>

        {requests.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: 'var(--text-muted)' }}>
            No search requests yet. Launch your first search above.
          </p>
        ) : (
          <div className="space-y-2">
            {requests.map((req, i) => (
              <motion.div key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(req.status)}
                  <div>
                    <span className="text-sm font-medium">{req.niche} in {req.city}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{timeAgo(req.created_at)}</span>
                      {req.max_results && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                          max {req.max_results}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full capitalize"
                  style={{
                    background: req.status === 'completed' ? 'rgba(52, 211, 153, 0.12)' :
                      req.status === 'failed' ? 'rgba(248, 113, 113, 0.12)' :
                      req.status === 'running' ? 'rgba(96, 165, 250, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                    color: req.status === 'completed' ? 'var(--accent-green)' :
                      req.status === 'failed' ? 'var(--accent-red)' :
                      req.status === 'running' ? 'var(--accent-blue)' : 'var(--accent-amber)',
                  }}>
                  {req.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
