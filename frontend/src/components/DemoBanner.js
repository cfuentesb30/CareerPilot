import React, { useState } from 'react';

const DemoBanner = () => {
  const [isVisible, setIsVisible] = useState(!sessionStorage.getItem('demo_banner_dismissed'));

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('demo_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-soft-green to-teal text-white px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🎭</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              Demo Mode Active
            </p>
            <p className="text-xs text-white/90">
              You're viewing a demonstration version with sample data. All features are fully functional!
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/your-repo/careerpilot" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-white/90 hover:text-white underline hidden sm:inline"
          >
            View on GitHub
          </a>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;