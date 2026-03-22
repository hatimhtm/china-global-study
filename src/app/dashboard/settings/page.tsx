'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Settings } from '@/types';
import { themes, applyTheme, getStoredTheme, ThemeKey } from '@/lib/themes';
import { User, Palette, Bell, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Partial<Settings>>({
    agent_name: '',
    agency_id: '',
    email: '',
    phone: '',
    bio: '',
    theme: 'obsidian',
    mad_exchange_rate: 1.38,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeKey>('obsidian');

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from('settings').select('*').single();
    if (data) {
      setSettings(data);
      setCurrentTheme(data.theme as ThemeKey);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    setCurrentTheme(getStoredTheme());
  }, [fetchSettings]);

  const saveSettings = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from('settings').select('id').single();

    if (existing) {
      await supabase.from('settings').update({
        agent_name: settings.agent_name,
        agency_id: settings.agency_id,
        email: settings.email,
        phone: settings.phone,
        bio: settings.bio,
        theme: currentTheme,
        mad_exchange_rate: settings.mad_exchange_rate,
      }).eq('id', existing.id);
    } else {
      await supabase.from('settings').insert({
        agent_name: settings.agent_name,
        agency_id: settings.agency_id,
        email: settings.email,
        phone: settings.phone,
        bio: settings.bio,
        theme: currentTheme,
        mad_exchange_rate: settings.mad_exchange_rate,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectTheme = (key: ThemeKey) => {
    setCurrentTheme(key);
    applyTheme(key);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Settings</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your agency profile, interface, and preferences.</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-medium"
              style={{ color: 'var(--accent-green)' }}
            >
              ✓ Saved
            </motion.span>
          )}
          <button onClick={saveSettings} disabled={saving} className="gradient-btn px-5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Profile */}
        <div className="lg:col-span-3 space-y-6">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <User size={16} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Agent Profile</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input value={settings.agent_name || ''} onChange={(e) => setSettings({...settings, agent_name: e.target.value})} className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Agency ID</label>
                  <input value={settings.agency_id || ''} onChange={(e) => setSettings({...settings, agency_id: e.target.value})} className="input-field" placeholder="CGS-XXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Email</label>
                  <input value={settings.email || ''} onChange={(e) => setSettings({...settings, email: e.target.value})} className="input-field" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Phone</label>
                  <input value={settings.phone || ''} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="input-field" placeholder="+1 234 567 8900" />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Bio</label>
                <textarea value={settings.bio || ''} onChange={(e) => setSettings({...settings, bio: e.target.value})} className="input-field min-h-[80px]" placeholder="Your role and expertise..." />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 block" style={{ color: 'var(--text-muted)' }}>CNY → MAD Exchange Rate</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.mad_exchange_rate || 1.38}
                  onChange={(e) => setSettings({...settings, mad_exchange_rate: parseFloat(e.target.value)})}
                  className="input-field w-40"
                />
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>1 CNY = {settings.mad_exchange_rate} MAD</p>
              </div>
            </div>
          </div>

          {/* Notifications (UI only) */}
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell size={16} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: 'New Applicant Alerts', desc: 'When a new student is added to the pipeline' },
                { label: 'Status Change Notifications', desc: 'When an application status changes' },
                { label: 'Document Reminders', desc: 'Pending document submission reminders' },
                { label: 'Task Due Date Alerts', desc: 'Upcoming task deadline notifications' },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:rounded-full after:h-4 after:w-4 after:transition-all" style={{ background: 'var(--bg-input)' }}>
                      <div className="absolute top-0.5 left-[2px] w-4 h-4 rounded-full transition-transform" style={{ background: 'var(--accent-primary)' }} />
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Theme */}
        <div className="lg:col-span-2">
          <div className="surface-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Palette size={16} style={{ color: 'var(--accent-primary)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Interface</h2>
            </div>

            <p className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Theme Mode</p>
            <div className="space-y-2">
              {Object.values(themes).map((theme) => (
                <motion.div
                  key={theme.key}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => selectTheme(theme.key)}
                  className="p-4 rounded-xl cursor-pointer flex items-center gap-3 transition-all"
                  style={{
                    background: currentTheme === theme.key ? 'var(--bg-elevated)' : 'var(--bg-card)',
                    outline: currentTheme === theme.key ? '2px solid var(--accent-primary)' : 'none',
                    outlineOffset: '-2px',
                  }}
                >
                  <span className="text-2xl">{theme.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{theme.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{theme.description}</p>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{
                      borderColor: currentTheme === theme.key ? 'var(--accent-primary)' : 'var(--border-medium)',
                      background: currentTheme === theme.key ? 'var(--accent-primary)' : 'transparent',
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Reset tutorial */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { localStorage.removeItem('cgs_tutorial_done'); alert('Tutorial will show on next page load.'); }}
                className="text-xs font-medium"
                style={{ color: 'var(--accent-primary)' }}
              >
                Reset Tutorial Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
