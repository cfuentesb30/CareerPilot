import React from 'react';
import { useTranslation } from 'react-i18next';

const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <div className="mt-1 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-700">
      {value || '-'}
    </div>
  </div>
);

const ProfilePreview = ({ onClose, onOpenSignUp }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t('profilePreview.title')}</h2>
            <p className="text-blue-100">{t('profilePreview.subtitle')}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-4">{t('profilePreview.basicInfo')}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label={t('profilePreview.firstName')} value={null} />
              <Field label={t('profilePreview.lastName')} value={null} />
              <Field label={t('profilePreview.currentRole')} value={null} />
              <Field label={t('profilePreview.yearsExperience')} value={null} />
              <Field label={t('profilePreview.location')} value={null} />
              <Field label={t('profilePreview.website')} value={null} />
            </div>
          </div>

          {/* Experience snapshot */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-2">{t('profilePreview.experience')}</h3>
            <p className="text-gray-600">{t('profilePreview.experienceHint')}</p>
          </div>

          {/* Skills snapshot */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-dark-blue mb-2">{t('profilePreview.skills')}</h3>
            <p className="text-gray-600">{t('profilePreview.skillsHint')}</p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button className="btn-secondary" onClick={onClose}>{t('common.close')}</button>
            <button className="btn-primary" onClick={onOpenSignUp}>{t('auth.signupCTA')}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePreview;