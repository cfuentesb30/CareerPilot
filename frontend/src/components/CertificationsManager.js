import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const toISO = (d) => (d ? new Date(d).toISOString() : null);
const toInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

const CertificationsManager = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: '',
    description: ''
  });

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const data = await api.get('/api/user/certifications');
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addItem = async () => {
    if (!form.name || !form.issuing_organization || !form.issue_date) return;
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name,
        issuing_organization: form.issuing_organization,
        issue_date: toISO(form.issue_date),
        expiration_date: form.expiration_date ? toISO(form.expiration_date) : null,
        credential_id: form.credential_id || null,
        credential_url: form.credential_url || null,
        description: form.description || null,
      };
      await api.post('/api/user/certifications', payload);
    } catch (e) {
      setError(e?.message || 'Failed to add certification');
    } finally {
      setSaving(false);
      setForm({ name: '', issuing_organization: '', issue_date: '', expiration_date: '', credential_id: '', credential_url: '', description: '' });
      await load();
    }
  };

  const updateItem = async (id, changes) => {
    try {
      const payload = { ...changes };
      if (payload.issue_date) payload.issue_date = toISO(payload.issue_date);
      if (payload.expiration_date) payload.expiration_date = toISO(payload.expiration_date);
      await api.put(`/api/user/certifications/${id}`, payload);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to update certification');
    }
  };

  const deleteItem = async (id) => {
    try {
      await api.del(`/api/user/certifications/${id}`);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to delete certification');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Certifications (Dev)</h2>
            <p className="text-blue-100">Add, edit, or remove your certifications.</p>
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
              <label className="text-sm text-gray-600 mb-1 block">Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Issuer</label>
              <input value={form.issuing_organization} onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Issue date</label>
              <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Expiration date</label>
              <input type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Credential ID</label>
              <input value={form.credential_id} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Credential URL</label>
              <input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
            <div className="md:col-span-3">
              <label className="text-sm text-gray-600 mb-1 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={addItem} disabled={saving || !form.name || !form.issuing_organization || !form.issue_date}>{saving ? 'Adding…' : 'Add Certification'}</button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              {items.length === 0 && <div className="text-gray-500">No certifications yet.</div>}
              {items.map((it) => (
                <CertRow key={it.id} item={it} onSave={updateItem} onDelete={deleteItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CertRow = ({ item, onSave, onDelete }) => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: item.name,
    issuing_organization: item.issuing_organization,
    issue_date: toInput(item.issue_date),
    expiration_date: toInput(item.expiration_date),
    credential_id: item.credential_id || '',
    credential_url: item.credential_url || '',
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
            <div className="font-medium text-dark-blue">{item.name} ({item.issuing_organization})</div>
            <div className="text-sm text-gray-600">{toInput(item.issue_date)}{item.expiration_date ? ` → ${toInput(item.expiration_date)}` : ''}</div>
            {item.description && <div className="text-sm text-gray-700 mt-1">{item.description}</div>}
          </div>
          <div className="flex gap-3">
            <a className="text-blue-600 hover:underline" href={item.credential_url || '#'} target="_blank" rel="noreferrer">Link</a>
            <button className="text-blue-600 hover:underline" onClick={() => setEdit(true)}>Edit</button>
            <button className="text-red-600 hover:underline" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input value={form.issuing_organization} onChange={(e) => setForm({ ...form, issuing_organization: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input type="date" value={form.expiration_date} onChange={(e) => setForm({ ...form, expiration_date: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" />
          <input value={form.credential_id} onChange={(e) => setForm({ ...form, credential_id: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" placeholder="Credential ID" />
          <input value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200" placeholder="Credential URL" />
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

export default CertificationsManager;