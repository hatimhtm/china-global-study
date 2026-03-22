'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Document, Application, Applicant } from '@/types';
import { DOCUMENT_TYPES } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import {
  FileText, User, Search, Plus, Filter, CheckCircle, Clock, AlertCircle, XCircle,
} from 'lucide-react';

const STATUS_ICON: Record<string, typeof CheckCircle> = {
  Pending: Clock,
  Received: AlertCircle,
  Verified: CheckCircle,
  Expired: XCircle,
};

const nextStatus = (s: string) => {
  const order = ['Pending', 'Received', 'Verified', 'Expired'];
  const i = order.indexOf(s);
  return order[(i + 1) % order.length];
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<(Document & { application?: Application & { applicant?: Applicant } })[]>([]);
  const [applications, setApplications] = useState<(Application & { applicant?: Applicant })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newDocType, setNewDocType] = useState('Passport');
  const [newDocLabel, setNewDocLabel] = useState('');
  const [newDocAppId, setNewDocAppId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [docsRes, appsRes, applicantsRes] = await Promise.all([
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('applications').select('*'),
      supabase.from('applicants').select('*'),
    ]);

    const apps = (appsRes.data || []).map((a: Application) => ({
      ...a,
      applicant: applicantsRes.data?.find((ap: Applicant) => ap.id === a.applicant_id),
    }));
    setApplications(apps);

    if (docsRes.data) {
      const enriched = docsRes.data.map((d: Document) => ({
        ...d,
        application: apps.find((a: Application) => a.id === d.application_id),
      }));
      setDocuments(enriched);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleStatus = async (docId: string, currentStatus: string) => {
    const newStatus = nextStatus(currentStatus);
    await supabase.from('documents').update({ status: newStatus }).eq('id', docId);
    fetchData();
  };

  const addDocument = async () => {
    if (!newDocAppId) return;
    await supabase.from('documents').insert({
      application_id: newDocAppId,
      document_type: newDocType,
      label: newDocLabel || newDocType,
      status: 'Pending',
      notes: '',
    });
    setShowAddModal(false);
    setNewDocType('Passport');
    setNewDocLabel('');
    setNewDocAppId('');
    fetchData();
  };

  const filtered = documents.filter((d) => {
    if (filterApplicant && d.application?.applicant_id !== filterApplicant) return false;
    if (filterStatus && d.status !== filterStatus) return false;
    return true;
  });

  const uniqueApplicants = [...new Map(applications.map((a) => [a.applicant_id, a.applicant])).values()].filter(Boolean);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Document Tracking</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track submission status for all applicants. Click status to cycle.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="gradient-btn px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5">
          <Plus size={14} /> Add Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <select value={filterApplicant} onChange={(e) => setFilterApplicant(e.target.value)} className="input-field py-2 text-xs w-48">
          <option value="">All Applicants</option>
          {uniqueApplicants.map((a) => a && <option key={a.id} value={a.id}>{a.full_name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field py-2 text-xs w-36">
          <option value="">All Statuses</option>
          {['Pending', 'Received', 'Verified', 'Expired'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group by applicant */}
          {[...new Set(filtered.map((d) => d.application?.applicant_id))].map((applicantId) => {
            const applicantDocs = filtered.filter((d) => d.application?.applicant_id === applicantId);
            const applicant = applicantDocs[0]?.application?.applicant;
            return (
              <motion.div
                key={applicantId || 'unknown'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="surface-card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User size={14} style={{ color: 'var(--accent-primary)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{applicant?.full_name || 'Unknown'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full ml-2" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                    {applicantDocs.length} documents
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {applicantDocs.map((doc) => {
                    const Icon = STATUS_ICON[doc.status] || Clock;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleStatus(doc.id, doc.status)}
                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                        style={{ background: 'var(--bg-secondary)' }}
                      >
                        <Icon size={16} className={`status-${doc.status.toLowerCase()}`} style={{ color: doc.status === 'Pending' ? 'var(--accent-amber)' : doc.status === 'Received' ? 'var(--accent-blue)' : doc.status === 'Verified' ? 'var(--accent-green)' : 'var(--accent-red)' }} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{doc.label || doc.document_type}</p>
                          <span className={`text-[10px] font-semibold uppercase status-${doc.status.toLowerCase()}`}>{doc.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Document Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Document" subtitle="Track a document for an application." maxWidth="max-w-md">
        <div className="space-y-4">
          <select value={newDocAppId} onChange={(e) => setNewDocAppId(e.target.value)} className="input-field">
            <option value="">Select application...</option>
            {applications.map((a) => <option key={a.id} value={a.id}>{a.applicant?.full_name || 'Unknown'}</option>)}
          </select>
          <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="input-field">
            {DOCUMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input value={newDocLabel} onChange={(e) => setNewDocLabel(e.target.value)} placeholder="Custom label (optional)" className="input-field" />
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={addDocument} disabled={!newDocAppId} className="gradient-btn px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Add</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
