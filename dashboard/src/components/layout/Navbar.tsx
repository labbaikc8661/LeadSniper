'use client';

import { useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 gap-4"
      style={{
        background: 'rgba(8, 8, 13, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search leads, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          title="Refresh data"
          onClick={() => window.dispatchEvent(new Event('ms-data-refresh'))}
        >
          <RefreshCw size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>
      </div>
    </header>
  );
}
