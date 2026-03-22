'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { TUTORIAL_STEPS } from '@/lib/constants';

export default function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const current = TUTORIAL_STEPS[step];

  useEffect(() => {
    const el = document.querySelector(current.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [step, current.target]);

  const next = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem('cgs_tutorial_done', 'true');
      onComplete();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const skip = () => {
    localStorage.setItem('cgs_tutorial_done', 'true');
    onComplete();
  };

  const tooltipStyle: React.CSSProperties = targetRect
    ? {
        top: current.placement === 'bottom' ? targetRect.bottom + 12 : 
             current.placement === 'top' ? targetRect.top - 12 : 
             targetRect.top,
        left: current.placement === 'right' ? targetRect.right + 12 :
              targetRect.left,
        ...(current.placement === 'top' && { transform: 'translateY(-100%)' }),
      }
    : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div className="tutorial-overlay" onClick={skip} />

      {/* Highlight the target element */}
      {targetRect && (
        <div
          className="fixed z-[9999] rounded-lg pointer-events-none"
          style={{
            top: targetRect.top - 4,
            left: targetRect.left - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
            border: '2px solid var(--accent-primary)',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="tutorial-tooltip"
          style={tooltipStyle}
        >
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {current.title}
            </h3>
            <button onClick={skip} className="p-0.5 rounded" style={{ color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>

          <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
            {current.content}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              {step + 1} of {TUTORIAL_STEPS.length}
            </span>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="p-1.5 rounded-lg text-xs"
                  style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
                >
                  <ChevronLeft size={14} />
                </button>
              )}
              <button onClick={next} className="gradient-btn px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                {step === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: i === step ? 'var(--accent-primary)' : 'var(--border-medium)',
                  width: i === step ? '12px' : '6px',
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
