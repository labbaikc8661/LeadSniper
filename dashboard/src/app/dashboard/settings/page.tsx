'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Key, Bot, Settings2, Eye, EyeOff, Check, Loader2,
  Save, Trash2, Shield, AlertTriangle, Zap, Palette,
} from 'lucide-react';
import { getAllSettings, setSetting, deleteSetting, SETTING_DEFINITIONS, SettingConfig } from '@/lib/settings';
import { themes, applyTheme, getStoredTheme, ThemeKey } from '@/lib/themes';

const CATEGORY_CONFIG = {
  google: {
    label: 'Google APIs',
    description: 'Configure your Google Places API keys for lead discovery.',
    icon: Key,
    color: 'var(--accent-blue)',
  },
  ai: {
    label: 'AI & Personalization',
    description: 'Set up Gemini AI for email drafting and configure your sender details.',
    icon: Bot,
    color: 'var(--accent-purple)',
  },
  scraper: {
    label: 'Scraper Configuration',
    description: 'Fine-tune rate limiting and scraping behavior.',
    icon: Settings2,
    color: 'var(--accent-amber)',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [localValues, setLocalValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});
  const [activeTheme, setActiveTheme] = useState<ThemeKey>('midnight');

  useEffect(() => {
    setActiveTheme(getStoredTheme());
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getAllSettings();
    setSettings(data);
    setLocalValues(data);
    setLoading(false);
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    const value = localValues[key] || '';
    const success = await setSetting(key, value);
    if (success) {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    }
    setSaving(null);
  };

  const handleDelete = async (key: string) => {
    await deleteSetting(key);
    setSettings((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setLocalValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleChange = (key: string, value: string) => {
    setLocalValues((prev) => ({ ...prev, [key]: value }));
  };

  const isDirty = (key: string) => (localValues[key] || '') !== (settings[key] || '');

  const categories = ['google', 'ai', 'scraper'] as const;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 shimmer rounded-xl w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-[200px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Configure API keys and scraper settings. All keys are stored securely in your database.
        </p>
      </motion.div>

      {/* Security notice */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(96, 165, 250, 0.08)', border: '1px solid rgba(96, 165, 250, 0.15)' }}
      >
        <Shield size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--accent-blue)' }}>Keys stored in Supabase</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            All API keys are stored in your Supabase database and never committed to code. The scraper reads them directly from the database at runtime.
          </p>
        </div>
      </motion.div>

      {/* Settings categories */}
      {categories.map((category, catIndex) => {
        const config = CATEGORY_CONFIG[category];
        const Icon = config.icon;
        const categorySettings = SETTING_DEFINITIONS.filter((s) => s.category === category);

        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + catIndex * 0.1 }}
            className="surface-card overflow-hidden"
          >
            {/* Category header */}
            <div className="flex items-center gap-3 p-5 pb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${config.color}15`, border: `1px solid ${config.color}25` }}
              >
                <Icon size={17} style={{ color: config.color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{config.label}</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{config.description}</p>
              </div>
            </div>

            <div className="glow-line mx-5" />

            {/* Setting fields */}
            <div className="p-5 pt-4 space-y-4">
              {categorySettings.map((settingDef) => {
                const value = localValues[settingDef.key] || '';
                const isVisible = showSensitive[settingDef.key];
                const dirty = isDirty(settingDef.key);
                const isSaving = saving === settingDef.key;
                const isSaved = saved === settingDef.key;
                const hasValue = !!settings[settingDef.key];

                return (
                  <div key={settingDef.key} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {settingDef.label}
                        {hasValue && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(52, 211, 153, 0.12)', color: 'var(--accent-green)' }}>
                            Configured
                          </span>
                        )}
                      </label>
                      {hasValue && settingDef.sensitive && (
                        <button
                          onClick={() => handleDelete(settingDef.key)}
                          className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors"
                          style={{ color: 'var(--accent-red)' }}
                          title="Remove this key"
                        >
                          <Trash2 size={10} /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {settingDef.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type={settingDef.sensitive && !isVisible ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => handleChange(settingDef.key, e.target.value)}
                          placeholder={settingDef.placeholder}
                          className="input-field pr-10"
                        />
                        {settingDef.sensitive && (
                          <button
                            onClick={() => setShowSensitive((prev) => ({ ...prev, [settingDef.key]: !prev[settingDef.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => handleSave(settingDef.key)}
                        disabled={!dirty || isSaving}
                        className="px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 flex-shrink-0"
                        style={{
                          background: dirty
                            ? 'linear-gradient(135deg, var(--accent-gradient-from), var(--accent-gradient-to))'
                            : 'var(--bg-input)',
                          color: dirty ? 'white' : 'var(--text-muted)',
                          border: dirty ? 'none' : '1px solid var(--border-subtle)',
                          opacity: dirty ? 1 : 0.5,
                          cursor: dirty ? 'pointer' : 'default',
                        }}
                      >
                        {isSaving ? (
                          <><Loader2 size={12} className="animate-spin" /> Saving</>
                        ) : isSaved ? (
                          <><Check size={12} /> Saved</>
                        ) : (
                          <><Save size={12} /> Save</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Theme Picker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + categories.length * 0.1 }}
        className="surface-card overflow-hidden"
      >
        <div className="flex items-center gap-3 p-5 pb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent-primary)15', border: '1px solid var(--accent-primary)25' }}
          >
            <Palette size={17} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Appearance</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Choose your preferred visual theme</p>
          </div>
        </div>

        <div className="glow-line mx-5" />

        <div className="p-5 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(Object.keys(themes) as ThemeKey[]).map((key, i) => {
            const theme = themes[key];
            const isActive = activeTheme === key;
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
                onClick={() => { applyTheme(key); setActiveTheme(key); }}
                className="relative p-3 rounded-xl text-left transition-all group"
                style={{
                  background: isActive ? 'var(--bg-hover)' : 'var(--bg-input)',
                  border: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                }}
              >
                <div className="flex gap-1 mb-2">
                  {theme.preview.map((color, ci) => (
                    <span key={ci} className="w-4 h-4 rounded-full" style={{ background: color }} />
                  ))}
                </div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{theme.name}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{theme.description}</p>
                {isActive && (
                  <motion.div
                    layoutId="activeTheme"
                    className="absolute top-2 right-2"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check size={14} style={{ color: 'var(--accent-primary)' }} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Quick setup guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="surface-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} style={{ color: 'var(--accent-amber)' }} />
          <h3 className="text-sm font-semibold">Quick Setup Guide</h3>
        </div>
        <div className="space-y-3 text-xs" style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ background: 'var(--accent-primary)', color: 'white' }}>1</span>
            <p>Get a Google Places API key from <span style={{ color: 'var(--accent-blue)' }}>console.cloud.google.com/apis/credentials</span>. Enable the "Places API" and "Places API (New)" services. You get $200/month free credit.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ background: 'var(--accent-primary)', color: 'white' }}>2</span>
            <p>Get a Gemini API key from <span style={{ color: 'var(--accent-blue)' }}>aistudio.google.com/apikey</span>. The free tier gives you 1,000+ requests/day with Gemini 2.5 Flash.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ background: 'var(--accent-primary)', color: 'white' }}>3</span>
            <p>Fill in your name, title, and email in the AI section — this personalizes your cold email drafts.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ background: 'var(--accent-primary)', color: 'white' }}>4</span>
            <p>Run the scraper from your terminal: <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-input)', color: 'var(--accent-green)' }}>cd scraper && node src/index.js "Avocat" "Paris"</code></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
