'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Task, Applicant } from '@/types';
import { TASK_CATEGORIES, PRIORITY_OPTIONS } from '@/lib/constants';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import {
  CheckSquare, Square, Plus, Tag, Calendar, Filter, Trash2, GripVertical,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<string>('General');
  const [newPriority, setNewPriority] = useState<string>('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newTags, setNewTags] = useState<string[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [tasksRes, applicantsRes] = await Promise.all([
      supabase.from('tasks').select('*').order('sort_order').order('created_at', { ascending: false }),
      supabase.from('applicants').select('*').order('full_name'),
    ]);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (applicantsRes.data) setApplicants(applicantsRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleComplete = async (id: string, current: boolean) => {
    await supabase.from('tasks').update({ is_completed: !current }).eq('id', id);
    fetchData();
  };

  const deleteTask = async (id: string) => {
    await supabase.from('tasks').delete().eq('id', id);
    fetchData();
  };

  const addTask = async () => {
    await supabase.from('tasks').insert({
      title: newTitle,
      description: newDescription,
      category: newCategory,
      priority: newPriority,
      due_date: newDueDate || null,
      applicant_tags: newTags.length > 0 ? newTags : null,
      is_completed: false,
      sort_order: 0,
    });
    setShowAddModal(false);
    setNewTitle(''); setNewDescription(''); setNewCategory('General');
    setNewPriority('Medium'); setNewDueDate(''); setNewTags([]);
    fetchData();
  };

  const filtered = tasks.filter((t) => {
    if (activeCategory !== 'All' && t.category !== activeCategory) return false;
    if (!showCompleted && t.is_completed) return false;
    if (filterApplicant && (!t.applicant_tags || !t.applicant_tags.includes(filterApplicant))) return false;
    return true;
  });

  const toggleTag = (id: string) => {
    setNewTags((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Task Checklist</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Pre-departure and arrival tasks for your students.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="gradient-btn px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5">
          <Plus size={14} /> New Task
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {['All', ...TASK_CATEGORIES].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--bg-card)',
              color: activeCategory === cat ? 'var(--text-inverse)' : 'var(--text-secondary)',
            }}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <select value={filterApplicant} onChange={(e) => setFilterApplicant(e.target.value)} className="input-field py-1.5 text-xs w-40">
            <option value="">All Students</option>
            {applicants.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
          </select>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </button>
        </div>
      </div>

      {/* Tasks list */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={22} />}
          title={tasks.length === 0 ? 'No tasks yet' : 'Nothing in this view'}
          description={tasks.length === 0 ? 'Create your first task — pre-departure, arrival, documentation, or general.' : 'Try a different category or clear the applicant filter.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="surface-card p-4 flex items-start gap-3 group"
            >
              <button onClick={() => toggleComplete(task.id, task.is_completed)} className="mt-0.5 flex-shrink-0">
                {task.is_completed ? (
                  <CheckSquare size={18} style={{ color: 'var(--accent-green)' }} />
                ) : (
                  <Square size={18} style={{ color: 'var(--text-muted)' }} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)', textDecoration: task.is_completed ? 'line-through' : 'none', opacity: task.is_completed ? 0.5 : 1 }}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                    {task.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full priority-${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                  {task.due_date && (
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={10} /> {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.applicant_tags && task.applicant_tags.length > 0 && (
                    <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent-blue)' }}>
                      <Tag size={10} />
                      {task.applicant_tags.map((tagId) => applicants.find((a) => a.id === tagId)?.full_name || 'Unknown').join(', ')}
                    </span>
                  )}
                  {(!task.applicant_tags || task.applicant_tags.length === 0) && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>
                      Global
                    </span>
                  )}
                </div>
              </div>

              <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1" style={{ color: 'var(--accent-red)' }}>
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Task" maxWidth="max-w-md">
        <div className="space-y-4">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title" className="input-field" />
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Description (optional)" className="input-field min-h-[60px]" />
          <div className="grid grid-cols-2 gap-3">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="input-field">
              {TASK_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="input-field">
              {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} className="input-field" />

          {/* Applicant tags */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-semibold mb-2 block" style={{ color: 'var(--text-muted)' }}>
              Tag Students (leave empty for global task)
            </label>
            <div className="flex flex-wrap gap-2">
              {applicants.map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleTag(a.id)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all"
                  style={{
                    background: newTags.includes(a.id) ? 'var(--accent-blue)' : 'var(--bg-card)',
                    color: newTags.includes(a.id) ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {a.full_name}
                </button>
              ))}
              {applicants.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No students yet. Add some in Pipeline first.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
            <button onClick={addTask} disabled={!newTitle} className="gradient-btn px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Create Task</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
