import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { setToken } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check for session_id fragment in URL (OAuth callback)
        const fragment = window.location.hash;
        const urlParams = new URLSearchParams(fragment.substring(1)); // Remove the '#'
        const sessionId = urlParams.get('session_id');

        if (sessionId) {
          // Handle OAuth callback
          console.log('Processing OAuth callback with session ID:', sessionId);
          
          try {
            // Send session ID to backend for validation
            const response = await api.post('/api/oauth/google/callback', {
              session_id: sessionId
            });

            // Set the session token for future requests
            const { session_token, user_id, email, name } = response;
            setToken(session_token); // This will be stored in localStorage
            
            showToast(`Welcome ${name || email}! Successfully signed in with Google.`, 'success');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Load user profile
            await loadUserProfile();
            
          } catch (error) {
            console.error('OAuth callback error:', error);
            showToast('Authentication failed. Please try again.', 'error');
          }
        } else {
          // Regular profile page load
          await loadUserProfile();
        }
      } catch (error) {
        console.error('Profile page error:', error);
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };

    const loadUserProfile = async () => {
      try {
        const response = await api.get('/api/oauth/profile');
        setUser(response.user);
        setProfile(response.profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // This is okay - user might not be authenticated yet
      }
    };

    handleOAuthCallback();
  }, [setToken, showToast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-soft-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-2xl font-bold text-dark-blue mb-4">Profile</h1>
          <p className="text-gray-600 mb-6">
            Please sign in to view your profile.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-6">
              {user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-soft-green to-teal rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-dark-blue mb-2">
                  {user.first_name} {user.last_name}
                </h1>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${user.is_verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    {user.is_verified ? 'Verified' : 'Unverified'}
                  </span>
                  <span>Plan: {user.subscription_plan}</span>
                  <span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-dark-blue mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-dark-blue mb-4">Account Status</h2>
              <div className="space-y-4">
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
                    {user.subscription_plan}
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

          {/* Action Buttons */}
          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary mr-4"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-secondary"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;