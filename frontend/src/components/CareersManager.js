import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const toISO = (d) => (d ? new Date(d).toISOString() : null);
const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const CareersManager = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    company_name: '',
    job_title: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  });

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const data = await api.get('/api/user/careers');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load careers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!form.company_name || !form.job_title || !form.start_date) return;
    setSaving(true); setError('');
    try {
      const payload = {
        company_name: form.company_name,
        job_title: form.job_title,
        start_date: toISO(form.start_date),
        end_date: form.end_date ? toISO(form.end_date) : null,
        is_current: !!form.is_current,
        description: form.description || null,
      };
      await api.post('/api/user/careers', payload);
    } catch (e) {
      setError(e?.message || 'Failed to add career');
    } finally {
      setSaving(false);
      setForm({ company_name: '', job_title: '', start_date: '', end_date: '', is_current: false, description: '' });
      await load();
    }
  };

  const updateItem = async (id, changes) => {
    try {
      const payload = { ...changes };
      if (payload.start_date) payload.start_date = toISO(payload.start_date);
      if (payload.end_date) payload.end_date = toISO(payload.end_date);
      await api.put(`/api/user/careers/${id}`, payload);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to update career');
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.del(`/api/user/careers/${id}`);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to delete career');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Careers (Dev)</h2>
            <p className="text-blue-100">Add, edit, or remove your career entries.</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">{error}</div>}

          {/* Add form */}
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Company</label>
              <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Job title</label>
              <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Start date</label>
              <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">End date</label>
              <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="is_current" type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} />
              <label htmlFor="is_current" className="text-sm text-gray-700">Current role</label>
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-gray-600 mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" rows={3} />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={addItem} disabled={saving || !form.company_name || !form.job_title || !form.start_date}>{saving ? 'Adding…' : 'Add Career'}</button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              {items.length === 0 && <div className="text-gray-500">No careers yet.</div>}
              {items.map((it) => (
                <CareerRow key={it.id} item={it} onSave={updateItem} onDelete={deleteItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CareerRow = ({ item, onSave, onDelete }) => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    company_name: item.company_name,
    job_title: item.job_title,
    start_date: toInput(item.start_date),
    end_date: toInput(item.end_date),
    is_current: item.is_current,
    description: item.description || ''
  });

  const handleSave = async () => {
    await onSave(item.id, form);
    setEdit(false);
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      {!edit ? (
        <div className="flex items-start justify-between">
          <div>
            <div className="font-medium text-dark-blue">{item.job_title} @ {item.company_name}</div>
            <div className="text-sm text-gray-600">{toInput(item.start_date)} - {item.is_current ? 'Present' : toInput(item.end_date) || '—'}</div>
            {item.description && <div className="text-sm text-gray-700 mt-1">{item.description}</div>}
          </div>
          <div className="flex gap-3">
            <button className="text-blue-600 hover:underline" onClick={() => setEdit(true)}>Edit</button>
            <button className="text-red-600 hover:underline" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          <input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_current} onChange={(e) => setForm({ ...form, is_current: e.target.checked })} /> Current</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="px-3 py-2 rounded-lg border border-gray-200 md:col-span-3" />
          <div className="flex gap-3 justify-end md:col-span-3">
            <button className="btn-secondary" onClick={() => setEdit(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersManager;