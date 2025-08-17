import React from 'react';
import { useDevMode } from '../context/DevModeContext';

const DevToggle = () => {
  const { devMode, toggleDevMode } = useDevMode();
  return (
    <button onClick={toggleDevMode} title="Toggle Dev Mode" className={`text-xs px-2 py-1 rounded-full border ${devMode ? 'bg-purple-600 text-white border-purple-600' : 'bg-transparent text-white border-white/40'} hover:opacity-90`}>
      Dev{devMode ? ' • on' : ''}
    </button>
  );
};

export default DevToggle;