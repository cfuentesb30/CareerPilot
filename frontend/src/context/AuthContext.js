import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken as _getToken, setToken as _setToken, clearToken as _clearToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTokenState(_getToken());
    setLoading(false);
  }, []);

  const setToken = (t) => {
    _setToken(t);
    setTokenState(t);
  };

  const clearToken = () => {
    _clearToken();
    setTokenState(null);
  };

  const fetchDevToken = async () => {
    const data = await api.post('/api/auth/dev-token');
    if (data?.access_token) setToken(data.access_token);
    return data;
  };

  const value = useMemo(() => ({ token, loading, setToken, clearToken, fetchDevToken, isAuthed: !!token }), [token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);