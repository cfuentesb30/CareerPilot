import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Stat = ({ label, value, icon, color = "soft-green" }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 text-center border-l-4 border-soft-green">
    <div className="flex items-center justify-center mb-2">
      {icon && <div className="text-soft-green mr-2">{icon}</div>}
      <div className="text-3xl font-bold text-dark-blue">{value}</div>
    </div>
    <div className="text-sm text-gray-600">{label}</div>
  </div>
);

const ListItem = ({ title, subtitle, meta, icon }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div className="flex items-start gap-3">
      {icon && <div className="text-soft-green mt-1">{icon}</div>}
      <div className="flex-1">
        <div className="font-medium text-dark-blue">{title}</div>
        {subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
        {meta && <div className="text-xs text-gray-500 mt-2">{meta}</div>}
      </div>
    </div>
  </div>
);

const DashboardPage = ({ onBack, onOpenRoadmapManager, onOpenChat }) => {
  const { isAuthed } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setError(''); 
      setLoading(true);
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

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-6 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p>You are not authenticated. Please sign up or log in to access your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-dark-blue transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Home
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <img 
              src="/athena-logo.png" 
              alt="Athena Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-dark-blue">Dashboard</h1>
              <p className="text-gray-600">Your profile, roadmap progress, and recent chats</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse opacity-50"
              />
              <div className="text-gray-600">Loading dashboard…</div>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Top Stats */}
            <div>
              <h2 className="text-xl font-semibold text-dark-blue mb-4">Overview</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <Stat 
                  label="Profile Completion" 
                  value={`${Math.round(data.profile_completion)}%`}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                />
                <Stat 
                  label="Roadmap Progress" 
                  value={`${Math.round(data.roadmap_progress?.completion_percentage || 0)}%`}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
                />
                <Stat 
                  label="Completed Items" 
                  value={data.roadmap_progress?.completed_roadmap_items || 0}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <Stat 
                  label="Total Items" 
                  value={data.roadmap_progress?.total_roadmap_items || 0}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Upcoming Roadmap Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-dark-blue flex items-center gap-2">
                      <svg className="w-6 h-6 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                      </svg>
                      Upcoming Roadmap Items
                    </h3>
                    {onOpenRoadmapManager && (
                      <button
                        onClick={onOpenRoadmapManager}
                        className="text-soft-green hover:text-green-600 text-sm font-medium"
                      >
                        View All →
                      </button>
                    )}
                  </div>
                  
                  {data.upcoming_roadmap_items?.length ? (
                    <div className="space-y-4">
                      {data.upcoming_roadmap_items.map((item) => (
                        <ListItem 
                          key={item.id} 
                          title={item.title} 
                          subtitle={item.description}
                          meta={`Status: ${item.status} • Priority: ${item.priority}${item.due_date ? ` • Due: ${new Date(item.due_date).toLocaleDateString()}` : ''}`}
                          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      <p className="text-gray-600">No upcoming roadmap items.</p>
                      <p className="text-sm text-gray-500 mt-1">Complete your assessment to get personalized recommendations!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Chats */}
              <div>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-dark-blue flex items-center gap-2">
                      <svg className="w-6 h-6 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      Recent Chats
                    </h3>
                    {onOpenChat && (
                      <button
                        onClick={onOpenChat}
                        className="text-soft-green hover:text-green-600 text-sm font-medium"
                      >
                        Chat Now →
                      </button>
                    )}
                  </div>
                  
                  {data.recent_conversations?.length ? (
                    <div className="space-y-4">
                      {data.recent_conversations.map((chat) => (
                        <ListItem 
                          key={chat.id} 
                          title={chat.title} 
                          subtitle="Last message"
                          meta={new Date(chat.last_message_at).toLocaleString()}
                          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"></path></svg>}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      <p className="text-gray-600">No recent chats.</p>
                      <p className="text-sm text-gray-500 mt-1">Start a conversation with Athena!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div>
              <h2 className="text-xl font-semibold text-dark-blue mb-4">Your Progress</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Stat 
                  label="Total Careers" 
                  value={data.stats?.total_careers || 0}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path></svg>}
                />
                <Stat 
                  label="Total Certifications" 
                  value={data.stats?.total_certifications || 0}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>}
                />
                <Stat 
                  label="Total Skills" 
                  value={data.stats?.total_skills || 0}
                  icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <img 
              src="/athena-logo.png" 
              alt="Athena Logo" 
              className="w-16 h-16 mx-auto mb-4 object-contain opacity-50"
            />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
            <p className="text-gray-500">Complete your profile and assessment to see your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;