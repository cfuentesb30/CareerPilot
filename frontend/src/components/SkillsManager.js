import React, { useEffect, useState } from 'react';
import { api } from '../api/client';

const levels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

const SkillsManager = ({ onClose }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ skill_name: '', level: 'beginner', years_of_experience: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setError(''); setLoading(true);
    try {
      const data = await api.get('/api/user/skills');
      setSkills(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addSkill = async () => {
    if (!form.skill_name) return;
    setSaving(true); setError('');
    try {
      const payload = {
        skill_name: form.skill_name,
        level: form.level,
        years_of_experience: form.years_of_experience ? parseInt(form.years_of_experience, 10) : null,
      };
      await api.post('/api/user/skills', payload);
      setForm({ skill_name: '', level: 'beginner', years_of_experience: '' });
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to add skill');
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (id) => {
    if (!id) return;
    try {
      await api.del(`/api/user/skills/${id}`);
      await load();
    } catch (e) {
      setError(e?.message || 'Failed to delete skill');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Skills (Dev)</h2>
            <p className="text-blue-100">Add and remove your skills. Editing level/years via delete + re-add for now.</p>
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
          <div className="grid md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600 mb-1 block">Skill name</label>
              <input value={form.skill_name} onChange={(e) => setForm({ ...form, skill_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" placeholder="e.g., Python" />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Level</label>
              <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200">
                {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Years</label>
              <input type="number" value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200" placeholder="e.g., 3" />
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" onClick={addSkill} disabled={saving || !form.skill_name}>{saving ? 'Adding…' : 'Add Skill'}</button>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-3">
              {skills.length === 0 && <div className="text-gray-500">No skills yet.</div>}
              {skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
                  <div>
                    <div className="font-medium text-dark-blue">{s.skill_name}</div>
                    <div className="text-sm text-gray-600">Level: {s.level} {s.years_of_experience ? `• ${s.years_of_experience} yrs` : ''}</div>
                  </div>
                  <button className="text-red-600 hover:underline" onClick={() => deleteSkill(s.id)}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;