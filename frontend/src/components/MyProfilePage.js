import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const MyProfilePage = ({ onBack, onOpenProfileEditor }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [certifications, setCertifications] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Load user dashboard data
        const dashboardResponse = await api.get('/api/user/dashboard');
        setUser(dashboardResponse.user);
        setStats(dashboardResponse.stats);

        // Load profile data
        const profileResponse = await api.get('/api/user/profile');
        setProfile(profileResponse);

        // Load careers, skills, and certifications
        const [careersResponse, skillsResponse, certificationsResponse] = await Promise.all([
          api.get('/api/user/careers').catch(() => []),
          api.get('/api/user/skills').catch(() => []),
          api.get('/api/user/certifications').catch(() => [])
        ]);

        setCareers(careersResponse || []);
        setSkills(skillsResponse || []);
        setCertifications(certificationsResponse || []);

      } catch (error) {
        console.error('Failed to load user data:', error);
        showToast('Failed to load profile data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadUserData();
    }
  }, [token, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-soft-green border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading profile...</span>
            </div>
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
          <button
            onClick={onOpenProfileEditor}
            className="flex items-center gap-2 px-4 py-2 bg-soft-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Edit Profile
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-soft-green to-teal rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-dark-blue mb-1">
                  {user?.first_name} {user?.last_name}
                </h1>
                <p className="text-gray-600 mb-2">{user?.email}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    Verified
                  </span>
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Free Plan
                  </span>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-dark-blue mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-semibold text-soft-green">{stats?.profile_completion || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Assessments Taken</span>
                  <span className="font-semibold">{stats?.assessments_completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Career Goals</span>
                  <span className="font-semibold">{stats?.career_goals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-sm text-gray-500">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2">
            {/* Basic Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                  <p className="text-dark-blue font-medium">{profile?.current_role || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <p className="text-dark-blue font-medium">{profile?.years_of_experience || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-dark-blue font-medium">{profile?.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <p className="text-dark-blue font-medium">{profile?.website || 'Not specified'}</p>
                </div>
              </div>
              {profile?.career_goals && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                  <p className="text-gray-600 leading-relaxed">{profile.career_goals}</p>
                </div>
              )}
            </div>

            {/* Career History */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-dark-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                </svg>
                Career History
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                  {careers.length} positions
                </span>
              </h3>
              {careers.length > 0 ? (
                <div className="space-y-4">
                  {careers.map((career, index) => (
                    <div key={index} className="border-l-4 border-soft-green pl-4">
                      <h4 className="font-semibold text-dark-blue">{career.job_title}</h4>
                      <p className="text-gray-600">{career.company_name}</p>
                      <p className="text-sm text-gray-500">
                        {career.start_date} - {career.is_current ? 'Present' : (career.end_date || 'Unknown')}
                      </p>
                      {career.description && (
                        <p className="text-gray-600 mt-1">{career.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No career history added yet.</p>
              )}
            </div>

            {/* Skills and Certifications */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skills */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-dark-blue mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  Skills
                  <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                    {skills.length}
                  </span>
                </h3>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-soft-green/10 text-soft-green rounded-full text-sm">
                        {skill.skill_name} {skill.level && `(${skill.level})`}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No skills added yet.</p>
                )}
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-dark-blue mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
                  </svg>
                  Certifications
                  <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                    {certifications.length}
                  </span>
                </h3>
                {certifications.length > 0 ? (
                  <div className="space-y-3">
                    {certifications.map((cert, index) => (
                      <div key={index} className="border-l-4 border-teal pl-3">
                        <h4 className="font-medium text-dark-blue">{cert.name}</h4>
                        <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                        {cert.issue_date && (
                          <p className="text-xs text-gray-500">Issued: {cert.issue_date}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No certifications added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;