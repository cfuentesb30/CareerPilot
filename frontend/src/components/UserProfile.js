import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const UserProfile = ({ onClose, onEdit }) => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        
        // Try OAuth profile first, then fallback to regular user data
        let userData = null;
        let profileData = null;
        let statsData = null;

        try {
          // Try OAuth profile endpoint
          const oauthResponse = await api.get('/api/oauth/profile');
          userData = oauthResponse.user;
          profileData = oauthResponse.profile;
        } catch (oauthError) {
          // Fallback to regular endpoints if OAuth fails
          try {
            const [userResponse, profileResponse] = await Promise.all([
              api.get('/api/user/dashboard'),
              api.get('/api/user/profile')
            ]);
            userData = userResponse.user;
            profileData = profileResponse;
            statsData = userResponse.stats;
          } catch (fallbackError) {
            console.error('Failed to load user data:', fallbackError);
            showToast('Failed to load profile data', 'error');
            return;
          }
        }

        setUser(userData);
        setProfile(profileData);
        setStats(statsData);

      } catch (error) {
        console.error('Profile loading error:', error);
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [token, showToast]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden">
          <div className="p-8 text-center">
            <img 
              src="/athena-logo.png" 
              alt="Athena Logo" 
              className="w-16 h-16 mx-auto mb-4 object-contain animate-pulse opacity-50"
            />
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-soft-green border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden">
          <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/athena-logo.png" 
                  alt="Athena Logo" 
                  className="w-8 h-8 object-contain brightness-0 invert"
                />
                <h2 className="text-2xl font-bold">Profile</h2>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">Please sign in to view your profile.</p>
            <button onClick={onClose} className="btn-primary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/athena-logo.png" 
                alt="Athena Logo" 
                className="w-8 h-8 object-contain brightness-0 invert"
              />
              <h2 className="text-2xl font-bold">My Profile</h2>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-soft-green"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-soft-green to-teal rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-soft-green">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-dark-blue mb-2">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
                <span className="text-gray-500">|</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium capitalize">
                  {user.subscription_plan || 'free'}
                </span>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Profile Information Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-dark-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                {profile?.current_role && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Role</label>
                    <p className="text-gray-900">{profile.current_role}</p>
                  </div>
                )}
                {profile?.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">{profile.location}</p>
                  </div>
                )}
                {profile?.years_experience && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <p className="text-gray-900">{profile.years_experience} years</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-dark-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Account Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Verification Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.is_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Subscription Plan</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                    {user.subscription_plan || 'free'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Member Since</span>
                  <span className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                {user.last_login && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Login</span>
                    <span className="text-gray-900">
                      {new Date(user.last_login).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Goals & Bio */}
          {(profile?.career_goals || profile?.bio) && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-bold text-dark-blue mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                About Me
              </h3>
              {profile.career_goals && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
                  <p className="text-gray-900 leading-relaxed">{profile.career_goals}</p>
                </div>
              )}
              {profile.bio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <p className="text-gray-900 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Stats */}
          {stats && (
            <div className="bg-gradient-to-r from-soft-green/10 to-teal/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-dark-blue mb-4 flex items-center gap-2">
                <img 
                  src="/athena-logo.png" 
                  alt="Athena Logo" 
                  className="w-5 h-5 object-contain"
                />
                Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-dark-blue">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;