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
  HelpCircle,
  Plus,
  LogOut,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'universities', href: '/dashboard/universities', label: 'Universities', icon: GraduationCap },
  { id: 'cities', href: '/dashboard/cities', label: 'Cities', icon: MapPin },
  { id: 'pipeline', href: '/dashboard/pipeline', label: 'Pipeline', icon: GitBranch },
  { id: 'documents', href: '/dashboard/documents', label: 'Documents', icon: FileText },
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

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-56 flex flex-col z-40"
      style={{ background: 'var(--bg-sidebar)' }}
    >
      {/* Admin profile section */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'var(--bg-card)', color: 'var(--accent-primary)' }}
          >
            CGS
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              CGS Admin
            </p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
              Global Curator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.id} href={item.href}>
              <div
                id={`sidebar-${item.id}`}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group cursor-pointer"
                style={{
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'var(--accent-primary)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon size={18} style={{ opacity: isActive ? 1 : 0.7 }} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-3 space-y-1">
        <button
          id="new-entry-btn"
          onClick={onNewEntry}
          className="gradient-btn w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          New Entry
        </button>

        <Link href="/dashboard/settings">
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-200"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Settings size={18} style={{ opacity: 0.7 }} />
            <span>Settings</span>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full cursor-pointer transition-colors duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={18} style={{ opacity: 0.7 }} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
