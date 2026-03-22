'use client';

import { Search, Bell, Settings } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  return (
    <header
      className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 glass"
    >
      {/* Left: brand tabs */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold tracking-tight mr-6" style={{ color: 'var(--text-primary)' }}>
          China Global Study
        </span>
      </div>

      {/* Right: search + actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search programs..."
            className="input-field pl-9 py-1.5 text-xs w-64"
            style={{ background: 'var(--bg-input)' }}
          />
        </div>
        <button className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
