import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'cp_dev_mode';
const DevModeContext = createContext(null);

export const DevModeProvider = ({ children }) => {
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setDevMode(raw === '1');
    } catch (e) {}
  }, []);

  const toggle = () => {
    setDevMode((prev) => {
      const next = !prev;
      try { localStorage.setItem(KEY, next ? '1' : '0'); } catch (e) {}
      return next;
    });
  };

  const value = useMemo(() => ({ devMode, toggleDevMode: toggle, setDevMode }), [devMode]);
  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
};

export const useDevMode = () => useContext(DevModeContext);