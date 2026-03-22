'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full ${maxWidth} max-h-[85vh] overflow-y-auto z-[61] rounded-2xl`}
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
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

            {/* Body */}
            <div className="p-6 pt-5">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
