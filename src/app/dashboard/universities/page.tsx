'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { University, Program } from '@/types';
import SlideDrawer from '@/components/ui/SlideDrawer';
import {
  GraduationCap, MapPin, Star, Search, Edit3, Trash2, Save, X, GitCompare, ChevronRight,
} from 'lucide-react';

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<(University & { programs?: Program[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUni, setSelectedUni] = useState<(University & { programs?: Program[] }) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<University>>({});
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: unis } = await supabase.from('universities').select('*').order('name');
    if (unis) {
      const { data: progs } = await supabase.from('programs').select('*');
      const merged = unis.map((u: University) => ({
        ...u,
        programs: progs?.filter((p: Program) => p.university_id === u.id) || [],
      }));
      setUniversities(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = universities.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.province?.toLowerCase().includes(q);
  });

  const openDrawer = (uni: University & { programs?: Program[] }) => {
    setSelectedUni(uni);
    setEditData(uni);
    setEditMode(false);
    setDrawerOpen(true);
  };

  const saveEdit = async () => {
    if (!selectedUni) return;
    await supabase.from('universities').update({
      name: editData.name, city: editData.city, province: editData.province,
      china_ranking: editData.china_ranking, is_featured: editData.is_featured,
      instruction_languages: editData.instruction_languages,
    }).eq('id', selectedUni.id);
    setEditMode(false);
    fetchData();
  };

  const deleteUni = async (id: string) => {
    if (!confirm('Delete this university and all its programs?')) return;
    await supabase.from('programs').delete().eq('university_id', id);
    await supabase.from('universities').delete().eq('id', id);
    setDrawerOpen(false);
    fetchData();
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  };

  const compareUnis = universities.filter((u) => compareIds.includes(u.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Universities</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage partnered institutions.</p>
        </div>
        <button
          onClick={() => { setCompareMode(!compareMode); setCompareIds([]); }}
          className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
          style={{
            background: compareMode ? 'var(--accent-primary)' : 'var(--bg-card)',
            color: compareMode ? 'var(--text-inverse)' : 'var(--text-secondary)',
          }}
        >
          <GitCompare size={14} /> {compareMode ? 'Exit Compare' : 'Compare'}
        </button>
      </div>

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search universities..." className="input-field pl-9 py-2 text-xs w-72" />
      </div>

      {/* Comparison table */}
      {compareMode && compareIds.length >= 2 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5 mb-6 overflow-x-auto">
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Comparison</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Metric</th>
                {compareUnis.map((u) => (
                  <th key={u.id} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'City', fn: (u: University & { programs?: Program[] }) => u.city },
                { label: 'Province', fn: (u: University & { programs?: Program[] }) => u.province || '—' },
                { label: 'China Ranking', fn: (u: University & { programs?: Program[] }) => u.china_ranking ? `#${u.china_ranking}` : 'Unranked' },
                { label: 'Programs', fn: (u: University & { programs?: Program[] }) => `${u.programs?.length || 0}` },
                { label: 'Avg. Scholarship', fn: (u: University & { programs?: Program[] }) => { const progs = u.programs || []; return progs.length ? `${Math.round(progs.reduce((a, p) => a + p.scholarship_percentage, 0) / progs.length)}%` : '—'; }},
                { label: 'Languages', fn: (u: University & { programs?: Program[] }) => u.instruction_languages?.join(', ') || '—' },
                { label: 'Intake', fn: (u: University & { programs?: Program[] }) => u.intake_seasons?.join(', ') || '—' },
              ].map((row, i) => (
                <tr key={row.label} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td className="px-3 py-2.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{row.label}</td>
                  {compareUnis.map((u) => (
                    <td key={u.id} className="px-3 py-2.5 text-xs" style={{ color: 'var(--text-primary)' }}>{row.fn(u)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((uni, i) => (
            <motion.div
              key={uni.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => compareMode ? toggleCompare(uni.id) : openDrawer(uni)}
              className="surface-card p-5 cursor-pointer group"
              style={{
                outline: compareIds.includes(uni.id) ? '2px solid var(--accent-primary)' : 'none',
                outlineOffset: '-2px',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{uni.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{uni.city}, {uni.province}</span>
                  </div>
                </div>
                {uni.is_featured && <Star size={14} style={{ color: 'var(--accent-amber)' }} />}
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{uni.programs?.length || 0} programs</span>
                {uni.china_ranking && (
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Rank #{uni.china_ranking}</span>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap mt-3">
                {uni.instruction_languages?.map((l) => (
                  <span key={l} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{l}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <SlideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedUni?.name || ''} subtitle={`${selectedUni?.city}, ${selectedUni?.province}`}>
        {selectedUni && (
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-3">
                <input value={editData.name || ''} onChange={(e) => setEditData({...editData, name: e.target.value})} className="input-field" placeholder="Name" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={editData.city || ''} onChange={(e) => setEditData({...editData, city: e.target.value})} className="input-field" placeholder="City" />
                  <input value={editData.province || ''} onChange={(e) => setEditData({...editData, province: e.target.value})} className="input-field" placeholder="Province" />
                </div>
                <input value={editData.china_ranking || ''} onChange={(e) => setEditData({...editData, china_ranking: Number(e.target.value) || null})} className="input-field" placeholder="China Ranking" type="number" />
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editData.is_featured || false} onChange={(e) => setEditData({...editData, is_featured: e.target.checked})} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Featured</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="gradient-btn px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1"><Save size={14} /> Save</button>
                  <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-xl text-xs" style={{ color: 'var(--text-secondary)' }}><X size={14} /></button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'CITY', value: selectedUni.city },
                    { label: 'PROVINCE', value: selectedUni.province },
                    { label: 'RANKING', value: selectedUni.china_ranking ? `#${selectedUni.china_ranking}` : 'Unranked' },
                    { label: 'LANGUAGES', value: selectedUni.instruction_languages?.join(', ') },
                    { label: 'INTAKE', value: selectedUni.intake_seasons?.join(', ') },
                    { label: 'PROGRAMS', value: String(selectedUni.programs?.length || 0) },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Programs list */}
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Programs at this university</h4>
                  <div className="space-y-2">
                    {(selectedUni.programs || []).map((p) => (
                      <div key={p.id} className="p-3 rounded-lg flex items-center justify-between" style={{ background: 'var(--bg-card)' }}>
                        <div>
                          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.degree_level} · {p.scholarship_percentage}% scholarship</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>¥{p.total_fee_cny?.toLocaleString()}</p>
                          <span className={`text-[10px] font-semibold uppercase status-${p.status.toLowerCase()}`}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                    {(selectedUni.programs || []).length === 0 && (
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No programs yet.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => setEditMode(true)} className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}>
                    <Edit3 size={14} /> Edit
                  </button>
                  <button onClick={() => deleteUni(selectedUni.id)} className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--accent-red)' }}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
