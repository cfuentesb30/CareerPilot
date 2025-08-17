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

const ProfilePreview = ({ onClose, onOpenSignUp }) =&gt; {
  const { t } = useTranslation();

  return (
    &lt;div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"&gt;
      &lt;div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl"&gt;
        &lt;div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between"&gt;
          &lt;div&gt;
            &lt;h2 className="text-2xl font-bold"&gt;{t('profilePreview.title')}&lt;/h2&gt;
            &lt;p className="text-blue-100"&gt;{t('profilePreview.subtitle')}&lt;/p&gt;
          &lt;/div&gt;
          &lt;button onClick={onClose} className="text-white/80 hover:text-white"&gt;
            &lt;svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
              &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"&gt;&lt;/path&gt;
            &lt;/svg&gt;
          &lt;/button&gt;
        &lt;/div&gt;

        &lt;div className="p-6 space-y-6"&gt;
          {/* Basic Info */}
          &lt;div className="bg-white border border-gray-200 rounded-2xl p-6"&gt;
            &lt;h3 className="text-lg font-semibold text-dark-blue mb-4"&gt;{t('profilePreview.basicInfo')}&lt;/h3&gt;
            &lt;div className="grid md:grid-cols-2 gap-4"&gt;
              &lt;Field label={t('profilePreview.firstName')} value={null} /&gt;
              &lt;Field label={t('profilePreview.lastName')} value={null} /&gt;
              &lt;Field label={t('profilePreview.currentRole')} value={null} /&gt;
              &lt;Field label={t('profilePreview.yearsExperience')} value={null} /&gt;
              &lt;Field label={t('profilePreview.location')} value={null} /&gt;
              &lt;Field label={t('profilePreview.website')} value={null} /&gt;
            &lt;/div&gt;
          &lt;/div&gt;

          {/* Experience snapshot */}
          &lt;div className="bg-white border border-gray-200 rounded-2xl p-6"&gt;
            &lt;h3 className="text-lg font-semibold text-dark-blue mb-2"&gt;{t('profilePreview.experience')}&lt;/h3&gt;
            &lt;p className="text-gray-600"&gt;{t('profilePreview.experienceHint')}&lt;/p&gt;
          &lt;/div&gt;

          {/* Skills snapshot */}
          &lt;div className="bg-white border border-gray-200 rounded-2xl p-6"&gt;
            &lt;h3 className="text-lg font-semibold text-dark-blue mb-2"&gt;{t('profilePreview.skills')}&lt;/h3&gt;
            &lt;p className="text-gray-600"&gt;{t('profilePreview.skillsHint')}&lt;/p&gt;
          &lt;/div&gt;

          {/* CTA */}
          &lt;div className="flex flex-col sm:flex-row gap-3 justify-end"&gt;
            &lt;button className="btn-secondary" onClick={onClose}&gt;{t('common.close')}&lt;/button&gt;
            &lt;button className="btn-primary" onClick={onOpenSignUp}&gt;{t('auth.signupCTA')}&lt;/button&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default ProfilePreview;