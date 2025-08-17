import React from 'react';
import { useTranslation } from 'react-i18next';

const AuthPlaceholder = ({ type = 'signup', onClose }) => {
  const { t } = useTranslation();
  const isSignup = type === 'signup';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isSignup ? t('auth.signupTitle') : t('auth.loginTitle')}
            </h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏳</span>
          </div>
          <h3 className="text-xl font-semibold text-center text-dark-blue mb-2">
            {isSignup ? t('auth.signupComingSoon') : t('auth.loginTemporarilyDisabled')}
          </h3>
          <p className="text-gray-600 text-center mb-6">
            {isSignup ? t('auth.signupDescription') : t('auth.loginDescription')}
          </p>
          <div className="space-y-3">
            <button disabled className="w-full btn-primary opacity-50 cursor-not-allowed">
              {isSignup ? t('auth.createAccount') : t('auth.logIn')}
            </button>
            <button onClick={onClose} className="w-full btn-secondary">
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPlaceholder;
