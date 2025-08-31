import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const GoogleCallback = () => {
  const { setToken } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const handleGoogleCallback = () => {
      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const auth = urlParams.get('auth');
      const name = urlParams.get('name');

      if (token && auth === 'google') {
        // Set the JWT token
        setToken(token);
        
        // Show success message
        const welcomeName = name ? decodeURIComponent(name) : 'there';
        showToast(`Welcome ${welcomeName}! Successfully signed in with Google.`, 'success');
        
        // Clean up URL parameters
        const newUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    };

    handleGoogleCallback();
  }, [setToken, showToast]);

  return null; // This component doesn't render anything
};

export default GoogleCallback;