'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

interface SlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: string;
}

export default function SlideDrawer({ isOpen, onClose, title, subtitle, children, width = 'max-w-lg' }: SlideDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: EASE_OUT }}
            className={`fixed top-0 right-0 h-full ${width} w-full z-[61] overflow-y-auto`}
            style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-subtle)', boxShadow: '-8px 0 40px rgba(0,0,0,0.3)' }}
          >
            <div className="sticky top-0 z-10 px-6 py-4 flex items-start justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
