'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Application, Applicant, Program, University } from '@/types';
import { APPLICATION_STATUSES, PRIORITY_OPTIONS } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import SlideDrawer from '@/components/ui/SlideDrawer';
import {
  LayoutGrid, List, Plus, Search, User, GraduationCap, ChevronRight, GripVertical, Trash2
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  'Inquiry': 'var(--accent-blue)',
  'Documents Collecting': 'var(--accent-amber)',
  'Submitted': 'var(--accent-purple)',
  'Under Review': 'var(--accent-amber)',
  'Accepted': 'var(--accent-green)',
  'Visa Processing': 'var(--accent-blue)',
  'Enrolled': 'var(--accent-green)',
  'Rejected': 'var(--accent-red)',
};

export default function PipelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [programs, setPrograms] = useState<(Program & { university?: University })[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // New application/applicant form
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantEmail, setNewApplicantEmail] = useState('');
  const [newApplicantPhone, setNewApplicantPhone] = useState('');
  const [newApplicantNationality, setNewApplicantNationality] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');
  const [customProgram, setCustomProgram] = useState('');
  const [isCustomUni, setIsCustomUni] = useState(false);
  const [programSearch, setProgramSearch] = useState('');
  const [selectedApplicantId, setSelectedApplicantId] = useState('');
  const [isNewApplicant, setIsNewApplicant] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [appsRes, applicantsRes, programsRes] = await Promise.all([
      supabase.from('applications').select('*').order('created_at', { ascending: false }),
      supabase.from('applicants').select('*').order('full_name'),
      supabase.from('programs').select('*, university:universities(*)').order('title'),
    ]);
    if (applicantsRes.data) setApplicants(applicantsRes.data);
    if (programsRes.data) setPrograms(programsRes.data as (Program & { university?: University })[]);
    if (appsRes.data) {
      const enriched = appsRes.data.map((app: Application) => ({
        ...app,
        applicant: applicantsRes.data?.find((a: Applicant) => a.id === app.applicant_id),
        program: programsRes.data?.find((p: Program) => p.id === app.program_id),
      }));
      setApplications(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredPrograms = programs.filter((p) => {
    if (!programSearch) return true;
    const q = programSearch.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.university?.name?.toLowerCase().includes(q);
  });

  const updateStatus = async (appId: string, status: string) => {
    await supabase.from('applications').update({ status, status_updated_at: new Date().toISOString() }).eq('id', appId);
    fetchData();
  };

  const addApplication = async () => {
    try {
      let applicantId = selectedApplicantId;

      if (isNewApplicant) {
        const appId = `CGS-${Math.floor(10000 + Math.random() * 90000)}`;
        const { data: newApplicant, error } = await supabase.from('applicants').insert({
          full_name: newApplicantName,
          email: newApplicantEmail,
          phone: newApplicantPhone,
          nationality: newApplicantNationality,
          application_id: appId,
          passport_number: '',
          notes: '',
        }).select().single();
        if (error) throw error;
        applicantId = newApplicant.id;
      }

      await supabase.from('applications').insert({
        applicant_id: applicantId,
        program_id: isCustomUni ? null : selectedProgramId || null,
        custom_university: isCustomUni ? customUniversity : null,
        custom_program: isCustomUni ? customProgram : null,
        status: 'Inquiry',
        priority: 'Medium',
        notes: '',
      });

      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteApplication = async (appId: string, applicantId: string) => {
    if (!confirm('Are you sure you want to delete this application? \n\nClicking OK will permanently delete this student record.')) return;
    
    // As per user request, deleting the application shouldn't just delete the application,
    // it should basically delete the student "so it is never brought up again".
    // We start by deleting the applicant. Since foreign keys are defined typically with cascade or restrict,
    // explicitly deleting both is safer. First applications, then applicant.
    await supabase.from('applications').delete().eq('id', appId);
    await supabase.from('applicants').delete().eq('id', applicantId);
    
    setDrawerOpen(false);
    setSelectedApp(null);
    fetchData();
  };

  const resetForm = () => {
    setNewApplicantName(''); setNewApplicantEmail(''); setNewApplicantPhone('');
    setNewApplicantNationality(''); setSelectedProgramId(''); setCustomUniversity('');
    setCustomProgram(''); setIsCustomUni(false); setProgramSearch('');
    setSelectedApplicantId(''); setIsNewApplicant(true);
  };

  const openDrawer = (app: Application) => {
    setSelectedApp(app);
    setDrawerOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Application Pipeline</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{applications.length} application{applications.length !== 1 ? 's' : ''} in progress.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)' }}>
            <button onClick={() => setView('kanban')} className="px-4 py-2 text-xs font-medium flex items-center gap-1.5" style={{ background: view === 'kanban' ? 'var(--accent-primary)' : 'transparent', color: view === 'kanban' ? 'var(--text-inverse)' : 'var(--text-secondary)' }}>
              <LayoutGrid size={14} /> Kanban
            </button>
            <button onClick={() => setView('list')} className="px-4 py-2 text-xs font-medium flex items-center gap-1.5" style={{ background: view === 'list' ? 'var(--accent-primary)' : 'transparent', color: view === 'list' ? 'var(--text-inverse)' : 'var(--text-secondary)' }}>
              <List size={14} /> List
            </button>
          </div>
          <button onClick={() => setShowAddModal(true)} className="gradient-btn px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5">
            <Plus size={14} /> New Application
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : view === 'kanban' ? (
        /* ===== KANBAN ===== */
        // Stretch the min-height to fill remaining vertical window height space
        <div className="flex gap-4 overflow-x-auto pb-4">
          {APPLICATION_STATUSES.map((status) => {
            const items = applications.filter((a) => a.status === status);
            return (
              <div key={status} className="min-w-[280px] flex-shrink-0">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[status] }} />
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{status}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    {items.length}
                  </span>
                </div>
                <div className="space-y-2 min-h-[calc(100vh-220px)] p-2 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)' }}>
                  {items.map((app) => (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={() => openDrawer(app)}
                      className="surface-card p-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <User size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {app.applicant?.full_name || 'Unknown'}
                        </span>
                      </div>
                      <p className="text-[10px] mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {app.program?.title || app.custom_program || 'No program'}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {app.program?.university?.name || app.custom_university || ''}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full priority-${app.priority.toLowerCase()}`}>
                          {app.priority}
                        </span>
                        <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ===== LIST VIEW ===== */
        <div className="surface-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--bg-elevated)' }}>
                {['Applicant', 'Program', 'University', 'Status', 'Priority', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app, i) => (
                <tr key={app.id} onClick={() => openDrawer(app)} className="cursor-pointer transition-colors" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td className="px-4 py-3 text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{app.applicant?.full_name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{app.program?.title || app.custom_program || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{app.program?.university?.name || app.custom_university || '—'}</td>
                  <td className="px-4 py-3"><span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${STATUS_COLORS[app.status]}20`, color: STATUS_COLORS[app.status] }}>{app.status}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-medium px-2 py-0.5 rounded-full priority-${app.priority.toLowerCase()}`}>{app.priority}</span></td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(app.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Application Modal */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }} title="New Application" subtitle="Assign a student to a program offer.">
        <div className="space-y-5">
          {/* Applicant */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => setIsNewApplicant(true)} className="text-xs font-medium px-3 py-1 rounded-full transition-colors" style={{ background: isNewApplicant ? 'var(--accent-primary)' : 'var(--bg-card)', color: isNewApplicant ? 'var(--text-inverse)' : 'var(--text-secondary)' }}>
                New Student
              </button>
              <button onClick={() => setIsNewApplicant(false)} className="text-xs font-medium px-3 py-1 rounded-full transition-colors" style={{ background: !isNewApplicant ? 'var(--accent-primary)' : 'var(--bg-card)', color: !isNewApplicant ? 'var(--text-inverse)' : 'var(--text-secondary)' }}>
                Existing Student
              </button>
            </div>
            {isNewApplicant ? (
              <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <input placeholder="Full name *" value={newApplicantName} onChange={(e) => setNewApplicantName(e.target.value)} className="input-field" autoFocus />
                <div className="grid grid-cols-2 gap-3">
                   <input placeholder="Email (optional)" value={newApplicantEmail} onChange={(e) => setNewApplicantEmail(e.target.value)} className="input-field" />
                   <input placeholder="Phone (optional)" value={newApplicantPhone} onChange={(e) => setNewApplicantPhone(e.target.value)} className="input-field" />
                   <input placeholder="Nationality (optional)" value={newApplicantNationality} onChange={(e) => setNewApplicantNationality(e.target.value)} className="input-field col-span-2" />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <select value={selectedApplicantId} onChange={(e) => setSelectedApplicantId(e.target.value)} className="input-field">
                  <option value="">Select student...</option>
                  {applicants.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Program selection */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
            <label className="text-[10px] uppercase tracking-widest font-semibold mb-3 block" style={{ color: 'var(--text-muted)' }}>Program Allocation</label>
            {!isCustomUni ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input value={programSearch} onChange={(e) => setProgramSearch(e.target.value)} placeholder="Type to search existing programs..." className="input-field pl-10" />
                </div>
                {programSearch && (
                  <div className="max-h-40 overflow-y-auto rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                    {filteredPrograms.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedProgramId(p.id); setProgramSearch(`${p.title} — ${p.university?.name}`); }}
                        className="px-3 py-2 cursor-pointer text-xs transition-colors hover:bg-white/5"
                        style={{ color: selectedProgramId === p.id ? 'var(--accent-primary)' : 'var(--text-secondary)', background: selectedProgramId === p.id ? 'var(--bg-elevated)' : 'transparent' }}
                      >
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</span>
                        <span className="ml-2" style={{ color: 'var(--text-muted)' }}>— {p.university?.name}</span>
                      </div>
                    ))}
                    {filteredPrograms.length === 0 && <div className="p-3 text-xs text-center text-muted">No programs found</div>}
                  </div>
                )}
                <button type="button" onClick={() => setIsCustomUni(true)} className="text-xs font-medium" style={{ color: 'var(--accent-green)' }}>
                  + Manual entry for non-partnered university
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Non-Partnered Record</span>
                  <button type="button" onClick={() => setIsCustomUni(false)} className="text-xs transition-colors hover:text-red-400" style={{ color: 'var(--accent-red)' }}>Cancel</button>
                </div>
                <input placeholder="University name" value={customUniversity} onChange={(e) => setCustomUniversity(e.target.value)} className="input-field" autoFocus />
                <input placeholder="Program name" value={customProgram} onChange={(e) => setCustomProgram(e.target.value)} className="input-field" />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              * = required
            </span>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="px-4 py-2 rounded-xl text-sm transition-colors hover:text-white" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
              <button 
                onClick={addApplication} 
                disabled={(!isNewApplicant && !selectedApplicantId) || (isNewApplicant && !newApplicantName) || (!isCustomUni && !selectedProgramId && !isNewApplicant)} 
                className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Detail Drawer */}
      <SlideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedApp?.applicant?.full_name || ''} subtitle={`Application ${selectedApp?.applicant?.application_id || ''}`}>
        {selectedApp && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'EMAIL', value: selectedApp.applicant?.email || '—' },
                { label: 'PHONE', value: selectedApp.applicant?.phone || '—' },
                { label: 'NATIONALITY', value: selectedApp.applicant?.nationality || '—' },
                { label: 'PRIORITY', value: selectedApp.priority },
                { label: 'PROGRAM', value: selectedApp.program?.title || selectedApp.custom_program || '—' },
                { label: 'UNIVERSITY', value: selectedApp.program?.university?.name || selectedApp.custom_university || '—' },
              ].map((item) => (
                <div key={item.label}>
                  <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {APPLICATION_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedApp.id, s)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all hover:scale-105"
                    style={{
                      background: `${STATUS_COLORS[s]}20`,
                      color: STATUS_COLORS[s],
                      outline: selectedApp.status === s ? `2px solid ${STATUS_COLORS[s]}` : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-widest font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Update Priority</h4>
              <div className="flex gap-2">
                {PRIORITY_OPTIONS.map((pr) => (
                  <button
                    key={pr}
                    onClick={async () => {
                      await supabase.from('applications').update({ priority: pr }).eq('id', selectedApp.id);
                      fetchData();
                      setSelectedApp({ ...selectedApp, priority: pr });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 priority-${pr.toLowerCase()}`}
                    style={{
                      outline: selectedApp.priority === pr ? '2px solid var(--accent-primary)' : 'none',
                      outlineOffset: '2px',
                    }}
                  >
                    {pr}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="pt-6 mt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
               <button
                  onClick={() => deleteApplication(selectedApp.id, selectedApp.applicant_id)}
                  className="px-4 py-2 w-full rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors hover:bg-red-500/10"
                  style={{ color: 'var(--accent-red)', border: '1px solid rgba(248, 113, 113, 0.3)' }}
                >
                  <Trash2 size={14} /> Delete Student Record
                </button>
                <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
                  This will permanently delete the student and their application.
                </p>
            </div>
          </div>
        )}
      </SlideDrawer>
    </div>
  );
}
