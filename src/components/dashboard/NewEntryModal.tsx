'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { University } from '@/types';
import { DEGREE_LEVELS, INTAKE_SEASONS, DEFAULT_MAD_RATE } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function NewEntryModal({ isOpen, onClose, onSaved }: NewEntryModalProps) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [isNewUniversity, setIsNewUniversity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // University fields
  const [uniName, setUniName] = useState('');
  const [uniCity, setUniCity] = useState('');
  const [uniProvince, setUniProvince] = useState('');
  const [uniRanking, setUniRanking] = useState('');
  const [uniLanguages, setUniLanguages] = useState<string[]>(['English']);
  const [uniIsFeatured, setUniIsFeatured] = useState(false);

  // Program fields — all optional except title
  const [title, setTitle] = useState('');
  const [degreeLevel, setDegreeLevel] = useState('Master');
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [tuitionCny, setTuitionCny] = useState('');
  const [dormFeeCny, setDormFeeCny] = useState('');
  const [serviceFeeCny, setServiceFeeCny] = useState('');
  const [scholarshipPercentage, setScholarshipPercentage] = useState('');
  const [durationYears, setDurationYears] = useState('');
  const [intakeSeason, setIntakeSeason] = useState('Fall');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUniversities();
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const fetchUniversities = async () => {
    const { data } = await supabase.from('universities').select('*').order('name');
    if (data) {
      setUniversities(data);
      // If no universities exist, default to new university mode
      if (data.length === 0) setIsNewUniversity(true);
    }
  };

  const totalCny = (Number(tuitionCny) || 0) + (Number(dormFeeCny) || 0) + (Number(serviceFeeCny) || 0);
  const totalMad = Math.round(totalCny * DEFAULT_MAD_RATE * 100) / 100;

  const resetForm = () => {
    setSelectedUniversityId('');
    setIsNewUniversity(universities.length === 0);
    setUniName(''); setUniCity(''); setUniProvince(''); setUniRanking('');
    setUniLanguages(['English']); setUniIsFeatured(false);
    setTitle(''); setDegreeLevel('Master'); setFieldOfStudy('');
    setTuitionCny(''); setDormFeeCny(''); setServiceFeeCny('');
    setScholarshipPercentage(''); setDurationYears(''); setIntakeSeason('Fall');
    setRequirements(''); setError(''); setSuccess(false);
  };

  const handleSave = async () => {
    setError('');

    // Validation — only university name and program title are truly required
    if (isNewUniversity && !uniName.trim()) {
      setError('Please enter a university name.');
      return;
    }
    if (!isNewUniversity && !selectedUniversityId) {
      setError('Please select a university or add a new one.');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a program title.');
      return;
    }

    setSaving(true);
    try {
      let universityId = selectedUniversityId;

      if (isNewUniversity) {
        const { data: newUni, error: uniError } = await supabase
          .from('universities')
          .insert({
            name: uniName.trim(),
            city: uniCity.trim() || 'Not specified',
            province: uniProvince.trim() || '',
            china_ranking: uniRanking ? Number(uniRanking) : null,
            scholarship_percentage: Number(scholarshipPercentage) || 0,
            instruction_languages: uniLanguages,
            intake_seasons: [intakeSeason],
            is_featured: uniIsFeatured,
          })
          .select()
          .single();

        if (uniError) {
          console.error('University insert error:', uniError);
          setError(`Failed to create university: ${uniError.message}`);
          setSaving(false);
          return;
        }
        universityId = newUni.id;
      }

      const { error: progError } = await supabase.from('programs').insert({
        university_id: universityId,
        title: title.trim(),
        degree_level: degreeLevel,
        field_of_study: fieldOfStudy.trim() || '',
        tuition_cny: Number(tuitionCny) || 0,
        dorm_fee_cny: Number(dormFeeCny) || 0,
        service_fee_cny: Number(serviceFeeCny) || 0,
        total_fee_cny: totalCny,
        total_fee_mad: totalMad,
        scholarship_percentage: Number(scholarshipPercentage) || 0,
        duration_years: Number(durationYears) || 1,
        intake_season: intakeSeason,
        status: 'Available',
        requirements: requirements.trim() || '',
      });

      if (progError) {
        console.error('Program insert error:', progError);
        setError(`Failed to create program: ${progError.message}`);
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        resetForm();
        onSaved();
        onClose();
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Save error:', err);
      setError(`Something went wrong: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); }} title="Add Program Offer" subtitle="Select or create a university, then fill in the program details.">
      <div className="space-y-5">
        {/* Error / Success messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium"
              style={{ background: 'rgba(248, 113, 113, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(248, 113, 113, 0.2)' }}
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-medium"
              style={{ background: 'rgba(52, 211, 153, 0.1)', color: 'var(--accent-green)', border: '1px solid rgba(52, 211, 153, 0.2)' }}
            >
              <CheckCircle size={14} />
              Program saved successfully!
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ UNIVERSITY SECTION ═══════ */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-3 block" style={{ color: 'var(--text-muted)' }}>
            University *
          </label>

          {!isNewUniversity ? (
            <div className="space-y-3">
              <select
                value={selectedUniversityId}
                onChange={(e) => setSelectedUniversityId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a partnered university...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}{u.city ? ` — ${u.city}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsNewUniversity(true)}
                className="text-xs font-medium transition-opacity hover:opacity-80"
                style={{ color: 'var(--accent-green)' }}
              >
                + Add a new university instead
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>New University</span>
                {universities.length > 0 && (
                  <button type="button" onClick={() => setIsNewUniversity(false)} className="text-xs transition-opacity hover:opacity-80" style={{ color: 'var(--accent-red)' }}>
                    Select existing instead
                  </button>
                )}
              </div>
              <input placeholder="University name *" value={uniName} onChange={(e) => setUniName(e.target.value)} className="input-field" autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="City (optional)" value={uniCity} onChange={(e) => setUniCity(e.target.value)} className="input-field" />
                <input placeholder="Province (optional)" value={uniProvince} onChange={(e) => setUniProvince(e.target.value)} className="input-field" />
              </div>
              <div className="flex items-center gap-4">
                <input placeholder="Ranking (optional)" value={uniRanking} onChange={(e) => setUniRanking(e.target.value)} className="input-field" type="number" style={{ maxWidth: '180px' }} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uniIsFeatured}
                    onChange={(e) => setUniIsFeatured(e.target.checked)}
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Featured</span>
                </label>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase tracking-widest font-semibold self-center mr-1" style={{ color: 'var(--text-muted)' }}>Language:</span>
                {['English', 'Chinese'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => {
                      setUniLanguages(prev =>
                        prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
                      );
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: uniLanguages.includes(lang) ? 'var(--accent-primary)' : 'var(--bg-input)',
                      color: uniLanguages.includes(lang) ? 'var(--text-inverse)' : 'var(--text-secondary)',
                      border: `1px solid ${uniLanguages.includes(lang) ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ═══════ PROGRAM SECTION ═══════ */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-3 block" style={{ color: 'var(--text-muted)' }}>
            Program Details *
          </label>
          <div className="space-y-3">
            <input placeholder="Program title * (e.g. MSc Computer Science)" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
            <div className="grid grid-cols-2 gap-3">
              <select value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value)} className="input-field">
                {DEGREE_LEVELS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <input placeholder="Field of study" value={fieldOfStudy} onChange={(e) => setFieldOfStudy(e.target.value)} className="input-field" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={intakeSeason} onChange={(e) => setIntakeSeason(e.target.value)} className="input-field">
                {INTAKE_SEASONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="Duration (years)" value={durationYears} onChange={(e) => setDurationYears(e.target.value)} className="input-field" type="number" step="0.5" />
            </div>
          </div>
        </div>

        {/* ═══════ FINANCIAL SECTION ═══════ */}
        <div className="p-4 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-3 block" style={{ color: 'var(--text-muted)' }}>
            Financial Details (optional)
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Tuition (CNY/yr)</span>
                <input value={tuitionCny} onChange={(e) => setTuitionCny(e.target.value)} className="input-field" type="number" placeholder="0" />
              </div>
              <div>
                <span className="text-[10px] block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Dorm Fee (CNY/yr)</span>
                <input value={dormFeeCny} onChange={(e) => setDormFeeCny(e.target.value)} className="input-field" type="number" placeholder="0" />
              </div>
              <div>
                <span className="text-[10px] block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Service Fee (CNY)</span>
                <input value={serviceFeeCny} onChange={(e) => setServiceFeeCny(e.target.value)} className="input-field" type="number" placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] block mb-1.5 font-medium" style={{ color: 'var(--text-muted)' }}>Scholarship %</span>
                <input value={scholarshipPercentage} onChange={(e) => setScholarshipPercentage(e.target.value)} className="input-field" type="number" min="0" max="100" placeholder="0" />
              </div>
              <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>Total Fee</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>¥{totalCny.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] block font-medium" style={{ color: 'var(--text-muted)' }}>≈ MAD</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--accent-green)' }}>{totalMad.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Requirements (optional) — e.g. IELTS 6.5, GPA 3.0+"
          className="input-field min-h-[70px] resize-y"
        />

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            * = required
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { resetForm(); onClose(); }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || success}
              className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              {saving ? 'Saving...' : success ? '✓ Saved!' : 'Save Program'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
