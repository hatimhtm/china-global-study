export type ThemeKey = 'obsidian' | 'cream' | 'sapphire' | 'jade';

export interface ThemeDefinition {
  key: ThemeKey;
  name: string;
  description: string;
  icon: string;
  colors: Record<string, string>;
}

export const themes: Record<ThemeKey, ThemeDefinition> = {
  obsidian: {
    key: 'obsidian',
    name: 'Obsidian Dark',
    description: 'Premium dark monolith',
    icon: '🌑',
    colors: {
      '--bg-primary': '#0e0e0e',
      '--bg-secondary': '#131313',
      '--bg-card': '#191a1a',
      '--bg-elevated': '#252626',
      '--bg-hover': '#2a2b2b',
      '--bg-input': '#1a1a1a',
      '--bg-sidebar': '#0a0a0a',
      '--text-primary': '#e7e5e4',
      '--text-secondary': '#acabaa',
      '--text-muted': '#6b6a69',
      '--text-inverse': '#0e0e0e',
      '--accent-primary': '#c6c6c7',
      '--accent-gradient-from': '#c6c6c7',
      '--accent-gradient-to': '#454747',
      '--accent-green': '#34d399',
      '--accent-blue': '#60a5fa',
      '--accent-amber': '#fbbf24',
      '--accent-red': '#f87171',
      '--accent-purple': '#a78bfa',
      '--border-subtle': 'rgba(72, 72, 72, 0.15)',
      '--border-medium': 'rgba(72, 72, 72, 0.3)',
      '--glass-bg': 'rgba(37, 38, 38, 0.7)',
      '--glass-border': 'rgba(255, 255, 255, 0.05)',
      '--shadow-color': 'rgba(0, 0, 0, 0.4)',
      '--badge-bg': 'rgba(52, 211, 153, 0.15)',
      '--badge-text': '#34d399',
    },
  },
  cream: {
    key: 'cream',
    name: 'Warm Cream',
    description: 'Easy on the eyes',
    icon: '☀️',
    colors: {
      '--bg-primary': '#FAF8F5',
      '--bg-secondary': '#F0EDE8',
      '--bg-card': '#FFFFFF',
      '--bg-elevated': '#FFFFFF',
      '--bg-hover': '#F5F2EE',
      '--bg-input': '#F0EDE8',
      '--bg-sidebar': '#EDE9E3',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#5c5c5c',
      '--text-muted': '#9a9a9a',
      '--text-inverse': '#FFFFFF',
      '--accent-primary': '#2d2d2d',
      '--accent-gradient-from': '#2d2d2d',
      '--accent-gradient-to': '#5a5a5a',
      '--accent-green': '#059669',
      '--accent-blue': '#2563eb',
      '--accent-amber': '#d97706',
      '--accent-red': '#dc2626',
      '--accent-purple': '#7c3aed',
      '--border-subtle': 'rgba(0, 0, 0, 0.06)',
      '--border-medium': 'rgba(0, 0, 0, 0.12)',
      '--glass-bg': 'rgba(255, 255, 255, 0.8)',
      '--glass-border': 'rgba(0, 0, 0, 0.08)',
      '--shadow-color': 'rgba(0, 0, 0, 0.08)',
      '--badge-bg': 'rgba(5, 150, 105, 0.1)',
      '--badge-text': '#059669',
    },
  },
  sapphire: {
    key: 'sapphire',
    name: 'Midnight Sapphire',
    description: 'Deep navy futuristic',
    icon: '💎',
    colors: {
      '--bg-primary': '#0B1426',
      '--bg-secondary': '#0F1A30',
      '--bg-card': '#132040',
      '--bg-elevated': '#1a2d52',
      '--bg-hover': '#1e3460',
      '--bg-input': '#0F1A30',
      '--bg-sidebar': '#070E1C',
      '--text-primary': '#e2e8f0',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#475569',
      '--text-inverse': '#0B1426',
      '--accent-primary': '#60a5fa',
      '--accent-gradient-from': '#3b82f6',
      '--accent-gradient-to': '#1d4ed8',
      '--accent-green': '#34d399',
      '--accent-blue': '#60a5fa',
      '--accent-amber': '#fbbf24',
      '--accent-red': '#f87171',
      '--accent-purple': '#a78bfa',
      '--border-subtle': 'rgba(96, 165, 250, 0.1)',
      '--border-medium': 'rgba(96, 165, 250, 0.2)',
      '--glass-bg': 'rgba(19, 32, 64, 0.7)',
      '--glass-border': 'rgba(96, 165, 250, 0.1)',
      '--shadow-color': 'rgba(0, 0, 0, 0.5)',
      '--badge-bg': 'rgba(52, 211, 153, 0.15)',
      '--badge-text': '#34d399',
    },
  },
  jade: {
    key: 'jade',
    name: 'Jade Emperor',
    description: 'Chinese-inspired luxury',
    icon: '🐉',
    colors: {
      '--bg-primary': '#0A1A15',
      '--bg-secondary': '#0E221B',
      '--bg-card': '#132E24',
      '--bg-elevated': '#1a3d30',
      '--bg-hover': '#1e4a3a',
      '--bg-input': '#0E221B',
      '--bg-sidebar': '#071410',
      '--text-primary': '#e2e8e6',
      '--text-secondary': '#94b8a8',
      '--text-muted': '#4a7565',
      '--text-inverse': '#0A1A15',
      '--accent-primary': '#34d399',
      '--accent-gradient-from': '#10b981',
      '--accent-gradient-to': '#047857',
      '--accent-green': '#34d399',
      '--accent-blue': '#60a5fa',
      '--accent-amber': '#fbbf24',
      '--accent-red': '#f87171',
      '--accent-purple': '#a78bfa',
      '--border-subtle': 'rgba(52, 211, 153, 0.1)',
      '--border-medium': 'rgba(52, 211, 153, 0.2)',
      '--glass-bg': 'rgba(19, 46, 36, 0.7)',
      '--glass-border': 'rgba(52, 211, 153, 0.1)',
      '--shadow-color': 'rgba(0, 0, 0, 0.5)',
      '--badge-bg': 'rgba(52, 211, 153, 0.15)',
      '--badge-text': '#34d399',
    },
  },
};

export function applyTheme(themeKey: ThemeKey) {
  const theme = themes[themeKey];
  if (!theme) return;
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });
  localStorage.setItem('cgs-theme', themeKey);
}

export function getStoredTheme(): ThemeKey {
  if (typeof window === 'undefined') return 'obsidian';
  return (localStorage.getItem('cgs-theme') as ThemeKey) || 'obsidian';
}
