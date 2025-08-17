import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DevTools = () => {
  const { token, fetchDevToken, clearToken } = useAuth();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const handleGetToken = async () => {
    setBusy(true); setMsg('');
    try {
      await fetchDevToken();
      setMsg('Dev token acquired.');
    } catch (e) {
      setMsg(e?.message || 'Failed to get dev token');
    } finally {
      setBusy(false);
    }
  };

  const handleClear = () => {
    clearToken();
    setMsg('Token cleared.');
  };

  return (
    <div className="hidden md:flex items-center gap-2">
      <button onClick={handleGetToken} disabled={busy} className="btn-secondary py-2 px-3">
        {busy ? 'Working…' : (token ? 'Refresh Dev Token' : 'Use Dev Token')}
      </button>
      {token && (
        <button onClick={handleClear} className="btn-secondary py-2 px-3">Clear Token</button>
      )}
      {msg && <span className="text-xs text-blue-200 ml-2">{msg}</span>}
    </div>
  );
};

export default DevTools;