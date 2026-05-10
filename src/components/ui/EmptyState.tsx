'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-2xl py-16 px-6 gap-3"
      style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {description && (
          <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--text-muted)', textWrap: 'balance' }}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
