'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { University } from '@/types';
import { DEGREE_LEVELS, INTAKE_SEASONS, DEFAULT_MAD_RATE } from '@/lib/constants';
import Modal from '@/components/ui/Modal';

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

  // University fields (only when creating new)
  const [uniName, setUniName] = useState('');
  const [uniCity, setUniCity] = useState('');
  const [uniProvince, setUniProvince] = useState('');
  const [uniRanking, setUniRanking] = useState('');
  const [uniLanguages, setUniLanguages] = useState<string[]>(['English']);
  const [uniIsFeatured, setUniIsFeatured] = useState(false);

  // Program fields
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
    if (isOpen) fetchUniversities();
  }, [isOpen]);

  const fetchUniversities = async () => {
    const { data } = await supabase.from('universities').select('*').order('name');
    if (data) setUniversities(data);
  };

  const totalCny = (Number(tuitionCny) || 0) + (Number(dormFeeCny) || 0) + (Number(serviceFeeCny) || 0);
  const totalMad = Math.round(totalCny * DEFAULT_MAD_RATE * 100) / 100;

  const resetForm = () => {
    setSelectedUniversityId('');
    setIsNewUniversity(false);
    setUniName(''); setUniCity(''); setUniProvince(''); setUniRanking('');
    setUniLanguages(['English']); setUniIsFeatured(false);
    setTitle(''); setDegreeLevel('Master'); setFieldOfStudy('');
    setTuitionCny(''); setDormFeeCny(''); setServiceFeeCny('');
    setScholarshipPercentage(''); setDurationYears(''); setIntakeSeason('Fall');
    setRequirements('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let universityId = selectedUniversityId;

      // Create new university if needed
      if (isNewUniversity) {
        const { data: newUni, error: uniError } = await supabase
          .from('universities')
          .insert({
            name: uniName,
            city: uniCity,
            province: uniProvince,
            china_ranking: uniRanking ? Number(uniRanking) : null,
            scholarship_percentage: Number(scholarshipPercentage) || 0,
            instruction_languages: uniLanguages,
            intake_seasons: [intakeSeason],
            is_featured: uniIsFeatured,
          })
          .select()
          .single();

        if (uniError) throw uniError;
        universityId = newUni.id;
      }

      // Create program
      const { error: progError } = await supabase.from('programs').insert({
        university_id: universityId,
        title,
        degree_level: degreeLevel,
        field_of_study: fieldOfStudy,
        tuition_cny: Number(tuitionCny) || 0,
        dorm_fee_cny: Number(dormFeeCny) || 0,
        service_fee_cny: Number(serviceFeeCny) || 0,
        total_fee_cny: totalCny,
        total_fee_mad: totalMad,
        scholarship_percentage: Number(scholarshipPercentage) || 0,
        duration_years: Number(durationYears) || 1,
        intake_season: intakeSeason,
        status: 'Available',
        requirements,
      });

      if (progError) throw progError;

      resetForm();
      onSaved();
      onClose();
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Program Offer" subtitle="Add a specific program at a university with scholarship details.">
      <div className="space-y-6">
        {/* University selection */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
            University
          </label>
          {!isNewUniversity ? (
            <div className="space-y-2">
              <select
                value={selectedUniversityId}
                onChange={(e) => setSelectedUniversityId(e.target.value)}
                className="input-field"
              >
                <option value="">Select a partnered university...</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.city}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsNewUniversity(true)}
                className="text-xs font-medium"
                style={{ color: 'var(--accent-primary)' }}
              >
                + Add new university
              </button>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-xl" style={{ background: 'var(--bg-card)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>New University</span>
                <button onClick={() => setIsNewUniversity(false)} className="text-xs" style={{ color: 'var(--accent-red)' }}>Cancel</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="University name" value={uniName} onChange={(e) => setUniName(e.target.value)} className="input-field col-span-2" />
                <input placeholder="City" value={uniCity} onChange={(e) => setUniCity(e.target.value)} className="input-field" />
                <input placeholder="Province" value={uniProvince} onChange={(e) => setUniProvince(e.target.value)} className="input-field" />
                <input placeholder="China Ranking (optional)" value={uniRanking} onChange={(e) => setUniRanking(e.target.value)} className="input-field" type="number" />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={uniIsFeatured}
                    onChange={(e) => setUniIsFeatured(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Featured</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {['English', 'Chinese'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      if (uniLanguages.includes(lang)) {
                        setUniLanguages(uniLanguages.filter((l) => l !== lang));
                      } else {
                        setUniLanguages([...uniLanguages, lang]);
                      }
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: uniLanguages.includes(lang) ? 'var(--accent-primary)' : 'var(--bg-input)',
                      color: uniLanguages.includes(lang) ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Program details */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Program Details
          </label>
          <div className="space-y-3">
            <input placeholder="Program title (e.g. MSc Computer Science)" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" />
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

        {/* Financials */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Financial Details
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <span className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Tuition (CNY/yr)</span>
                <input value={tuitionCny} onChange={(e) => setTuitionCny(e.target.value)} className="input-field" type="number" />
              </div>
              <div>
                <span className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Dorm Fee (CNY/yr)</span>
                <input value={dormFeeCny} onChange={(e) => setDormFeeCny(e.target.value)} className="input-field" type="number" />
              </div>
              <div>
                <span className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Service Fee (CNY)</span>
                <input value={serviceFeeCny} onChange={(e) => setServiceFeeCny(e.target.value)} className="input-field" type="number" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] block mb-1" style={{ color: 'var(--text-muted)' }}>Scholarship %</span>
                <input value={scholarshipPercentage} onChange={(e) => setScholarshipPercentage(e.target.value)} className="input-field" type="number" min="0" max="100" placeholder="0-100" />
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-card)' }}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--text-muted)' }}>Total</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>¥{totalCny.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>≈ MAD</span>
                  <span className="font-medium" style={{ color: 'var(--accent-green)' }}>{totalMad.toLocaleString()} MAD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div>
          <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
            Requirements (optional)
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="IELTS 6.5, GPA 3.0+, etc."
            className="input-field min-h-[80px] resize-y"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={() => { resetForm(); onClose(); }} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !title || (!selectedUniversityId && !uniName)}
            className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Program'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
