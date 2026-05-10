'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Program, University } from '@/types';
import { DEFAULT_MAD_RATE, DEGREE_LEVELS, INTAKE_SEASONS } from '@/lib/constants';
import SlideDrawer from '@/components/ui/SlideDrawer';
import EmptyState from '@/components/ui/EmptyState';
import { GridSkeleton } from '@/components/ui/Skeleton';
import {
  LayoutGrid,
  List,
  TrendingUp,
  GraduationCap,
  Globe,
  Award,
  MapPin,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Star,
  Edit3,
  Trash2,
  X,
  Save,
} from 'lucide-react';

export default function DashboardPage() {
  const [programs, setPrograms] = useState<(Program & { university: University })[]>([]);
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<(Program & { university: University }) | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Filters
  const [cityFilter, setCityFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Edit state
  const [editForm, setEditForm] = useState<Partial<Program>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('programs')
      .select('*, university:universities(*)')
      .order('created_at', { ascending: false });

    if (data) setPrograms(data as (Program & { university: University })[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPrograms();
    const handler = () => fetchPrograms();
    window.addEventListener('cgs-data-refresh', handler);
    return () => window.removeEventListener('cgs-data-refresh', handler);
  }, [fetchPrograms]);

  const filteredPrograms = programs.filter((p) => {
    if (cityFilter && p.university?.city !== cityFilter) return false;
    if (degreeFilter && p.degree_level !== degreeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.university?.name?.toLowerCase().includes(q) ||
        p.field_of_study?.toLowerCase().includes(q) ||
        p.university?.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueCities = [...new Set(programs.map((p) => p.university?.city).filter(Boolean))];
  const uniqueDegrees = [...new Set(programs.map((p) => p.degree_level).filter(Boolean))];

  // Stats
  const totalOffers = programs.length;
  const fullyFundedCount = programs.filter((p) => p.scholarship_percentage >= 100).length;
  const avgScholarship = programs.length > 0
    ? Math.round(programs.reduce((acc, p) => acc + (p.scholarship_percentage || 0), 0) / programs.length)
    : 0;
  const uniqueUniCount = new Set(programs.map((p) => p.university_id)).size;

  const openDrawer = (program: Program & { university: University }) => {
    setSelectedProgram(program);
    setEditForm(program);
    setIsEditing(false);
    setDrawerOpen(true);
  };

  const updateProgramStatus = async (id: string, status: string) => {
    await supabase.from('programs').update({ status }).eq('id', id);
    fetchPrograms();
    if (selectedProgram?.id === id) {
      setSelectedProgram({ ...selectedProgram, status: status as Program['status'] });
    }
  };

  const saveProgramEdits = async () => {
    if (!selectedProgram) return;
    setSavingEdit(true);
    
    // Auto calculate totals (excluding service fee which goes to agency)
    const totalCny = (Number(editForm.tuition_cny) || 0) + (Number(editForm.dorm_fee_cny) || 0);
    const totalMad = Math.round(totalCny * DEFAULT_MAD_RATE * 100) / 100;

    const updates = {
      ...editForm,
      total_fee_cny: totalCny,
      total_fee_mad: totalMad,
    };

    // Remove joined university data before saving
    delete (updates as Partial<Program> & { university?: unknown }).university;

    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', selectedProgram.id)
      .select('*, university:universities(*)')
      .single();

    if (data) {
      setSelectedProgram(data as (Program & { university: University }));
      fetchPrograms();
      setIsEditing(false);
    }
    setSavingEdit(false);
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program offer?')) return;
    await supabase.from('programs').delete().eq('id', id);
    setDrawerOpen(false);
    setSelectedProgram(null);
    fetchPrograms();
  };

  const handleEditChange = (field: keyof Program, value: Program[keyof Program]) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Institutional Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Managing {totalOffers} active study program{totalOffers !== 1 ? 's' : ''} across {uniqueUniCount} partner{uniqueUniCount !== 1 ? 's' : ''}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'ACTIVE OFFERS', value: totalOffers, icon: TrendingUp, sub: 'Programs listed' },
          { label: 'FULLY FUNDED', value: fullyFundedCount, icon: Award, sub: 'Full scholarship' },
          { label: 'AVG. SCHOLARSHIP', value: `${avgScholarship}%`, icon: GraduationCap, sub: 'Coverage rate' },
          { label: 'PARTNER UNIVERSITIES', value: uniqueUniCount, icon: Globe, sub: 'Institutions' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="surface-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>
                {stat.label}
              </span>
              <stat.icon size={16} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
            </div>
            <p className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              {stat.value}
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters + View toggle */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search programs..."
              className="input-field pl-10 py-2 text-xs w-52"
            />
          </div>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="input-field py-2 text-xs w-36">
            <option value="">All Cities</option>
            {uniqueCities.map((c) => <option key={c} value={c!}>{c}</option>)}
          </select>
          <select value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)} className="input-field py-2 text-xs w-36">
            <option value="">All Degrees</option>
            {uniqueDegrees.map((d) => <option key={d} value={d!}>{d}</option>)}
          </select>
        </div>

        <div id="view-toggle" className="flex items-center rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
          <button
            onClick={() => setView('cards')}
            className="px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{
              background: view === 'cards' ? 'var(--accent-primary)' : 'transparent',
              color: view === 'cards' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            <LayoutGrid size={14} /> Cards
          </button>
          <button
            onClick={() => setView('table')}
            className="px-4 py-2 text-xs font-medium flex items-center gap-1.5 transition-all"
            style={{
              background: view === 'table' ? 'var(--accent-primary)' : 'transparent',
              color: view === 'table' ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            <List size={14} /> Spreadsheet
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <GridSkeleton count={8} columns={4} />
      ) : filteredPrograms.length === 0 ? (
        <EmptyState
          icon={<GraduationCap size={22} />}
          title={programs.length === 0 ? 'No programs yet' : 'No programs match your filters'}
          description={programs.length === 0 ? 'Add your first program offer to start tracking universities and intake seasons.' : 'Try clearing the search or filter chips to see everything.'}
        />
      ) : view === 'cards' ? (
        /* ===== SIMPLIFIED: CARD GRID ===== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPrograms.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openDrawer(p)}
              className="surface-card p-5 cursor-pointer group relative"
            >
              {/* Status + Featured */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full status-${p.status.toLowerCase()}`}>
                  {p.status}
                </span>
                {p.university?.is_featured && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                    <Star size={10} className="inline mr-1" />Featured
                  </span>
                )}
              </div>

              {/* University info */}
              <h3 className="text-sm font-bold mb-1 group-hover:underline" style={{ color: 'var(--text-primary)' }}>
                {p.university?.name || 'Unknown University'}
              </h3>
              <div className="flex items-center gap-1 mb-3">
                <MapPin size={12} style={{ color: 'var(--accent-primary)' }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{p.university?.city}</span>
              </div>

              {/* Program title */}
              <p className="text-xs font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>{p.title}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.field_of_study && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {p.field_of_study}
                  </span>
                )}
                {p.scholarship_percentage > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--badge-bg)', color: 'var(--badge-text)' }}>
                    {p.scholarship_percentage}% Scholarship
                  </span>
                )}
              </div>

              {/* Pricing - always visible in simplified view */}
              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>Total Fee</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>¥{p.total_fee_cny?.toLocaleString()}</span>
                  <span className="text-[10px] block" style={{ color: 'var(--accent-green)' }}>≈ {p.total_fee_mad?.toLocaleString()} MAD</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* ===== COMPLEX: SPREADSHEET TABLE ===== */
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  {['University', 'Program', 'Degree', 'City', 'Field', 'Intake', 'Scholarship', 'Tuition', 'Dorm', 'Service', 'Total (CNY)', 'Total (MAD)', 'Duration', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((p, i) => (
                  <tr
                    key={p.id}
                    onClick={() => openDrawer(p)}
                    className="cursor-pointer transition-colors"
                    style={{
                      background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                    }}
                  >
                    <td className="px-4 py-3 text-xs font-medium whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                      {p.university?.name}
                      {p.university?.is_featured && <Star size={10} className="inline ml-1" style={{ color: 'var(--accent-amber)' }} />}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.title}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.degree_level}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.university?.city}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.field_of_study || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.intake_season}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--accent-green)' }}>{p.scholarship_percentage}%</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>¥{p.tuition_cny?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>¥{p.dorm_fee_cny?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>¥{p.service_fee_cny?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>¥{p.total_fee_cny?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--accent-green)' }}>{p.total_fee_mad?.toLocaleString()} MAD</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.duration_years}yr</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full status-${p.status.toLowerCase()}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <SlideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedProgram?.university?.name || ''}
        subtitle={selectedProgram ? `${selectedProgram.title} · ${selectedProgram.degree_level}` : ''}
      >
        {selectedProgram && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center gap-2">
                <div className="pulse-dot" />
                <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full status-${selectedProgram.status.toLowerCase()}`}>
                  {selectedProgram.status}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{ background: isEditing ? 'var(--bg-elevated)' : 'transparent', color: isEditing ? 'var(--text-primary)' : 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
              >
                {isEditing ? <><X size={14}/> Cancel</> : <><Edit3 size={14}/> Edit Program</>}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4 animate-in fade-in">
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Program Details</h4>
                  <input value={editForm.title || ''} onChange={(e) => handleEditChange('title', e.target.value)} placeholder="Program Title" className="input-field" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={editForm.degree_level || ''} onChange={(e) => handleEditChange('degree_level', e.target.value)} className="input-field">
                      {DEGREE_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input value={editForm.field_of_study || ''} onChange={(e) => handleEditChange('field_of_study', e.target.value)} placeholder="Field of Study" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={editForm.intake_season || ''} onChange={(e) => handleEditChange('intake_season', e.target.value)} className="input-field">
                      {INTAKE_SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input type="number" step="0.5" value={editForm.duration_years || ''} onChange={(e) => handleEditChange('duration_years', Number(e.target.value))} placeholder="Duration (years)" className="input-field" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>Financial & Requirements</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-[10px] block mb-1">Tuition CNY</span>
                      <input type="number" value={editForm.tuition_cny || 0} onChange={(e) => handleEditChange('tuition_cny', Number(e.target.value))} className="input-field" />
                    </div>
                    <div>
                      <span className="text-[10px] block mb-1">Dorm CNY</span>
                      <input type="number" value={editForm.dorm_fee_cny || 0} onChange={(e) => handleEditChange('dorm_fee_cny', Number(e.target.value))} className="input-field" />
                    </div>
                    <div>
                      <span className="text-[10px] block mb-1">Service CNY</span>
                      <input type="number" value={editForm.service_fee_cny || 0} onChange={(e) => handleEditChange('service_fee_cny', Number(e.target.value))} className="input-field" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] block mb-1">Scholarship %</span>
                    <input type="number" value={editForm.scholarship_percentage || 0} onChange={(e) => handleEditChange('scholarship_percentage', Number(e.target.value))} className="input-field" />
                  </div>
                  <textarea value={editForm.requirements || ''} onChange={(e) => handleEditChange('requirements', e.target.value)} placeholder="Requirements" className="input-field min-h-[60px]" />
                </div>
                
                <button onClick={saveProgramEdits} disabled={savingEdit} className="gradient-btn w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 mt-4">
                  {savingEdit ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 animate-in fade-in">
                  {[
                    { label: 'UNIVERSITY', value: selectedProgram.university?.name },
                    { label: 'CITY', value: `${selectedProgram.university?.city}, ${selectedProgram.university?.province}` },
                    { label: 'PROGRAM', value: selectedProgram.title },
                    { label: 'DEGREE', value: selectedProgram.degree_level },
                    { label: 'FIELD', value: selectedProgram.field_of_study || 'Not specified' },
                    { label: 'INTAKE', value: selectedProgram.intake_season },
                    { label: 'DURATION', value: `${selectedProgram.duration_years} year${selectedProgram.duration_years !== 1 ? 's' : ''}` },
                    { label: 'CHINA RANKING', value: selectedProgram.university?.china_ranking ? `#${selectedProgram.university.china_ranking}` : 'Unranked' },
                    { label: 'LANGUAGE', value: selectedProgram.university?.instruction_languages?.join(', ') || 'Not specified' },
                    { label: 'SCHOLARSHIP', value: `${selectedProgram.scholarship_percentage}%` },
                  ].map((item) => (
                    <div key={item.label}>
                      <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Financial summary */}
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                  <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
                    Financial Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Tuition</span>
                      <span style={{ color: 'var(--text-primary)' }}>¥{selectedProgram.tuition_cny?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Dorm Fee</span>
                      <span style={{ color: 'var(--text-primary)' }}>¥{selectedProgram.dorm_fee_cny?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: 'var(--text-secondary)' }}>Service Fee</span>
                      <span style={{ color: 'var(--text-primary)' }}>¥{selectedProgram.service_fee_cny?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>Total</span>
                      <div className="text-right">
                        <span style={{ color: 'var(--text-primary)' }}>¥{selectedProgram.total_fee_cny?.toLocaleString()}</span>
                        <span className="block text-xs font-medium" style={{ color: 'var(--accent-green)' }}>≈ {selectedProgram.total_fee_mad?.toLocaleString()} MAD</span>
                      </div>
                    </div>
                    {selectedProgram.scholarship_percentage > 0 && (
                      <div className="mt-2 p-2 rounded-lg text-center" style={{ background: 'var(--badge-bg)' }}>
                        <span className="text-xs font-bold" style={{ color: 'var(--badge-text)' }}>
                          {selectedProgram.scholarship_percentage}% Scholarship Coverage
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Requirements */}
                {selectedProgram.requirements && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                      Requirements
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {selectedProgram.requirements}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Status change */}
            {!isEditing && (
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
                  Update Status
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {['Available', 'Expired', 'Full'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateProgramStatus(selectedProgram.id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all status-${s.toLowerCase()}`}
                      style={{
                        outline: selectedProgram.status === s ? '2px solid var(--accent-primary)' : 'none',
                        outlineOffset: '2px',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => deleteProgram(selectedProgram.id)}
                className="px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors hover:bg-red-500/10"
                style={{ color: 'var(--accent-red)' }}
              >
                <Trash2 size={14} /> Delete Offer
              </button>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
