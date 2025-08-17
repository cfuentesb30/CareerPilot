import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDevMode } from '../context/DevModeContext';
import { useToast } from '../context/ToastContext';

const DevTools = () => {
  const { token, fetchDevToken, clearToken } = useAuth();
  const { devMode } = useDevMode();
  const { showToast } = useToast();
  const [busy, setBusy] = useState(false);

  if (!devMode) return null;

  const handleGetToken = async () => {
    setBusy(true);
    try {
      await fetchDevToken();
      showToast('Dev token acquired', 'success');
    } catch (e) {
      showToast(e?.message || 'Failed to get dev token', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    clearToken();
    showToast('Token cleared', 'success');
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <button onClick={handleGetToken} disabled={busy} className="btn-secondary py-2 px-3">
        {busy ? 'Working…' : (token ? 'Refresh Dev Token' : 'Use Dev Token')}
      </button>
      {token && (
        <button onClick={handleClear} className="btn-secondary py-2 px-3">Clear Token</button>
      )}
    </div>
  );
};

export default DevTools;