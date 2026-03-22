'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import NewEntryModal from '@/components/dashboard/NewEntryModal';
import Tutorial from '@/components/ui/Tutorial';
import { applyTheme, getStoredTheme } from '@/lib/themes';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check auth
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('cgs_authenticated') !== 'true') {
        router.push('/');
        return;
      }

      // Apply saved theme
      const theme = getStoredTheme();
      applyTheme(theme);

      // Check if tutorial should show
      if (!localStorage.getItem('cgs_tutorial_done')) {
        setTimeout(() => setShowTutorial(true), 1000);
      }

      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar onNewEntry={() => setShowNewEntry(true)} />

      <div className="ml-56">
        <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <main className="p-6">
          {children}
        </main>
      </div>

      <NewEntryModal
        isOpen={showNewEntry}
        onClose={() => setShowNewEntry(false)}
        onSaved={() => {
          // Refresh data — pages will handle this via their own state
          window.dispatchEvent(new Event('cgs-data-refresh'));
        }}
      />

      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
    </div>
  );
}
