import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Stat = ({ label, value }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
    <div className="text-3xl font-bold text-dark-blue">{value}</div>
    <div className="text-sm text-gray-600 mt-1">{label}</div>
  </div>
);

const ListItem = ({ title, subtitle, meta }) => (
  <div className="border border-gray-200 rounded-xl px-4 py-3">
    <div className="font-medium text-dark-blue">{title}</div>
    {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
    {meta && <div className="text-xs text-gray-500 mt-1">{meta}</div>}
  </div>
);

const DashboardModal = ({ onClose }) => {
  const { isAuthed } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(''); setLoading(true);
      try {
        const d = await api.get('/api/user/dashboard');
        if (active) setData(d);
      } catch (e) {
        const msg = e?.message || 'Failed to load dashboard';
        setError(msg);
        showToast(msg, 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    if (isAuthed) load();
    return () => { active = false; };
  }, [isAuthed, showToast]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/athena-logo.png" 
              alt="Athena Logo" 
              className="w-8 h-8 object-contain brightness-0 invert"
            />
            <div>
              <h2 className="text-2xl font-bold">Dashboard (Dev)</h2>
              <p className="text-blue-100">Roadmap progress, profile completion, recent chats</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 bg-gray-50">
          {!isAuthed && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-4 text-sm">
              You are not authenticated. Please sign up or log in to access your dashboard.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-8">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-12 h-12 mx-auto mb-4 object-contain animate-pulse opacity-50"
              />
              <div className="text-gray-600">Loading dashboard…</div>
            </div>
          ) : data ? (
            <>
              {/* Top stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <Stat label="Profile completion" value={`${Math.round(data.profile_completion)}%`} />
                <Stat label="Roadmap completion" value={`${Math.round(data.roadmap_progress?.completion_percentage || 0)}%`} />
                <Stat label="Completed items" value={data.roadmap_progress?.completed_roadmap_items || 0} />
                <Stat label="Total items" value={data.roadmap_progress?.total_roadmap_items || 0} />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Roadmap */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <img 
                      src="/athena-logo.png" 
                      alt="Athena Logo" 
                      className="w-5 h-5 object-contain"
                    />
                    Upcoming roadmap items
                  </div>
                  {data.upcoming_roadmap_items?.length ? (
                    <div className="space-y-3">
                      {data.upcoming_roadmap_items.map((it) => (
                        <ListItem key={it.id} title={it.title} subtitle={it.description} meta={`Status: ${it.status} • Priority ${it.priority}${it.due_date ? ` • Due ${new Date(it.due_date).toISOString().slice(0,10)}` : ''}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No upcoming items.</div>
                  )}
                </div>

                {/* Recent Chats */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                  <div className="text-lg font-semibold text-dark-blue mb-3 flex items-center gap-2">
                    <img 
                      src="/athena-logo.png" 
                      alt="Athena Logo" 
                      className="w-5 h-5 object-contain"
                    />
                    Recent chats
                  </div>
                  {data.recent_conversations?.length ? (
                    <div className="space-y-3">
                      {data.recent_conversations.map((c) => (
                        <ListItem key={c.id} title={c.title} subtitle={`Last message`} meta={new Date(c.last_message_at).toLocaleString()} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 text-sm">No recent chats.</div>
                  )}
                </div>
              </div>

              {/* Stats summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <Stat label="Total careers" value={data.stats?.total_careers || 0} />
                <Stat label="Total certs" value={data.stats?.total_certifications || 0} />
                <Stat label="Total skills" value={data.stats?.total_skills || 0} />
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-12 h-12 mx-auto mb-4 object-contain opacity-50"
              />
              <div className="text-gray-600">No data available.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardModal;