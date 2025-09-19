import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const TextInput = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-soft-green focus:border-soft-green outline-none"
    />
  </div>
);

const TextArea = ({ label, value, onChange, rows = 4, placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm text-gray-600 mb-1">{label}</label>
    <textarea
      rows={rows}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-soft-green focus:border-soft-green outline-none"
    />
  </div>
);

const ProfileEditor = ({ onClose }) => {
  const { isAuthed } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(''); setLoading(true);
      try {
        if (!isAuthed) {
          setError('You are not authenticated. Please sign up or log in to edit your profile.');
          setLoading(false);
          return;
        }
        const data = await api.get('/api/user/profile');
        if (active) setProfile(data || {});
      } catch (e) {
        if (active) setError(e?.message || 'Failed to load profile');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [isAuthed]);

  const update = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        bio: profile.bio,
        location: profile.location,
        phone: profile.phone,
        website: profile.website,
        linkedin_url: profile.linkedin_url,
        github_url: profile.github_url,
        current_role: profile.current_role,
        years_of_experience: profile.years_of_experience,
        career_goals: profile.career_goals,
        preferred_work_environment: profile.preferred_work_environment,
        salary_expectations: profile.salary_expectations,
        availability: profile.availability,
      };
      await api.put('/api/user/profile', payload);
      onClose && onClose();
    } catch (e) {
      setError(e?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/athena-logo.png" 
              alt="Athena Logo" 
              className="w-8 h-8 object-contain brightness-0 invert"
            />
            <div>
              <h2 className="text-2xl font-bold">Edit Profile (Dev)</h2>
              <p className="text-blue-100">Use the dev token to edit and save your profile.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!isAuthed && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 mb-4 text-sm">
              You are not authenticated. Click "Use Dev Token" button in the header, then reopen this editor.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 mb-4 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-12 h-12 mx-auto mb-4 object-contain animate-pulse opacity-50"
              />
              <div className="text-gray-500">Loading profile…</div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="First name" value={profile.first_name} onChange={(v) => update('first_name', v)} />
              <TextInput label="Last name" value={profile.last_name} onChange={(v) => update('last_name', v)} />
              <TextInput label="Current role" value={profile.current_role} onChange={(v) => update('current_role', v)} />
              <TextInput label="Years of experience" type="number" value={profile.years_of_experience} onChange={(v) => update('years_of_experience', v ? parseInt(v, 10) : null)} />
              <TextInput label="Location" value={profile.location} onChange={(v) => update('location', v)} />
              <TextInput label="Website" value={profile.website} onChange={(v) => update('website', v)} />
              <TextInput label="LinkedIn URL" value={profile.linkedin_url} onChange={(v) => update('linkedin_url', v)} />
              <TextInput label="GitHub URL" value={profile.github_url} onChange={(v) => update('github_url', v)} />
              <TextArea label="Bio" value={profile.bio} onChange={(v) => update('bio', v)} rows={4} />
              <TextArea label="Career goals" value={profile.career_goals} onChange={(v) => update('career_goals', v)} rows={4} />
              <TextInput label="Preferred work environment" value={profile.preferred_work_environment} onChange={(v) => update('preferred_work_environment', v)} />
              <TextInput label="Salary expectations" value={profile.salary_expectations} onChange={(v) => update('salary_expectations', v)} />
              <TextInput label="Availability" value={profile.availability} onChange={(v) => update('availability', v)} />
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={handleSave} disabled={!isAuthed || saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;