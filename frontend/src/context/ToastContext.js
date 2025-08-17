import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let idCtr = 1;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type = 'success', timeout = 3000) => {
    const id = idCtr++;
    setToasts((arr) => [...arr, { id, message, type }]);
    if (timeout) {
      setTimeout(() => remove(id), timeout);
    }
    return id;
  }, [remove]);

  const value = useMemo(() => ({ showToast: show, removeToast: remove }), [show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`min-w-[220px] max-w-[360px] px-4 py-3 rounded-xl shadow border flex items-start gap-3 ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="mt-0.5">{t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}</div>
            <div className="flex-1 text-sm">{t.message}</div>
            <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100">✖</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);