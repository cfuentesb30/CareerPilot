import React from 'react';
import { useTranslation } from 'react-i18next';

const RoadmapItem = ({ index, title, description, category, eta }) => (
  <div className="flex items-start gap-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4">
    <div className="w-8 h-8 bg-soft-green text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
      {index}
    </div>
    <div>
      <div className="flex items-center gap-2">
        <h4 className="text-dark-blue font-semibold">{title}</h4>
        <span className="text-xs px-2 py-1 rounded-full bg-soft-green/10 text-soft-green">{category}</span>
      </div>
      <p className="text-gray-600 mt-1">{description}</p>
      <div className="text-xs text-gray-500 mt-2">~{eta}h</div>
    </div>
  </div>
);

const RoadmapPreview = ({ onClose, onOpenSignUp }) => {
  const { t } = useTranslation();

  const sample = [
    { title: 'Complete a Python fundamentals course', description: 'Strengthen core programming concepts and problem solving', category: 'skill_development', eta: 12 },
    { title: 'Build a portfolio project', description: 'Create a small end-to-end app to showcase skills', category: 'portfolio', eta: 16 },
    { title: 'Optimize your LinkedIn profile', description: 'Align headline, summary, and projects to target roles', category: 'networking', eta: 2 },
    { title: 'Mock interview practice', description: 'Prepare with common technical and behavioral questions', category: 'job_search', eta: 6 }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Roadmap Preview</h2>
            <p className="text-blue-100">Personalized steps generated from your assessment</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {sample.map((it, i) => (
            <RoadmapItem key={i} index={i + 1} {...it} />
          ))}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700 text-sm">
            This is a preview. Sign up to save your personalized roadmap and track progress.
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={onOpenSignUp}>Sign up (Coming soon)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPreview;
