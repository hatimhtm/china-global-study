'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  MapPin,
  GitBranch,
  FileText,
  CheckSquare,
  Settings,
  Plus,
  LogOut,
  HelpCircle,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'universities', href: '/dashboard/universities', label: 'Universities', icon: GraduationCap },
  { id: 'pipeline', href: '/dashboard/pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'documents', href: '/dashboard/documents', label: 'Documents', icon: FileText },
  { id: 'cities', href: '/dashboard/cities', label: 'City Guides', icon: MapPin },
  { id: 'tasks', href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
];

interface SidebarProps {
  onNewEntry: () => void;
}

export default function Sidebar({ onNewEntry }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('cgs_authenticated');
    window.location.href = '/';
  };

  const resetTutorial = () => {
    localStorage.removeItem('cgs_tutorial_done');
    window.location.reload();
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-40"
      style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)' }}
    >
      {/* Brand */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--bg-card)', color: 'var(--accent-primary)', border: '1px solid var(--border-subtle)' }}
          >
            CGS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
              CGS Admin
            </p>
            <div className="flex items-center gap-1.5">
              <div className="pulse-dot" />
              <p className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Entry button */}
      <div className="px-3 mb-4">
        <button
          id="new-entry-btn"
          onClick={onNewEntry}
          className="gradient-btn w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
        >
          <Plus size={15} />
          New Program Offer
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] uppercase tracking-[0.15em] font-semibold px-3 mb-2" style={{ color: 'var(--text-muted)' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href}>
              <div
                id={`sidebar-${item.id}`}
                className="relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 cursor-pointer"
                style={{
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-subtle)' : '1px solid transparent',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                  />
                )}
                <Icon size={16} style={{ opacity: isActive ? 1 : 0.6 }} />
                <span className={isActive ? 'font-semibold' : 'font-medium'}>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 space-y-0.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <Link href="/dashboard/settings">
          <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Settings size={16} style={{ opacity: 0.6 }} />
            <span className="font-medium">Settings</span>
          </div>
        </Link>

        <button
          onClick={resetTutorial}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] w-full cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <HelpCircle size={16} style={{ opacity: 0.6 }} />
          <span>Tutorial</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] w-full cursor-pointer transition-colors"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={16} style={{ opacity: 0.6 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
