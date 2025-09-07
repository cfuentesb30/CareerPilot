import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useDevMode } from '../context/DevModeContext';
import LanguageSwitcher from './LanguageSwitcher';

const NavigationBar = ({ onNavigate, currentPage, onOpenProfile, onOpenDashboard }) => {
  const { t } = useTranslation();
  const { isAuthed, user, logout } = useAuth();
  const { devMode, toggleDevMode } = useDevMode();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Check if user is enterprise admin
  const isEnterpriseAdmin = user?.role === 'enterprise_admin';

  const handleUserMenuClick = (action) => {
    setShowUserMenu(false); // Close the menu
    
    switch(action) {
      case 'profile':
        if (onOpenProfile) onOpenProfile();
        break;
      case 'dashboard':
        if (onOpenDashboard) onOpenDashboard();
        break;
      case 'enterprise':
        // Handle enterprise admin navigation
        onNavigate('enterprise-admin');
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  const navigation = [
    { name: t('nav.home'), key: 'home' },
    { name: t('nav.pricing'), key: 'pricing' },
    { name: t('nav.about'), key: 'about' },
    { name: t('nav.contact'), key: 'contact' }
  ];

  const handleNavClick = (page) => {
    onNavigate(page);
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/athena-logo.png" 
                  alt="CareerPilot - Athena AI Career Advisor" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="text-dark-blue">
                <div className="text-xl font-bold">CareerPilot</div>
                <div className="text-sm text-blue-500">powered by Athena</div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.key
                    ? 'text-soft-green bg-soft-green/10 border border-soft-green/20'
                    : 'text-gray-700 hover:text-soft-green hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Dev Mode Toggle */}
            <button
              onClick={toggleDevMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                devMode 
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Dev {devMode ? 'ON' : 'OFF'}
            </button>

            {/* Auth Actions */}
            {isAuthed ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-blue text-white hover:bg-navy transition-all duration-200"
                >
                  <div className="w-6 h-6 bg-soft-green rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {user?.first_name?.[0] || 'U'}
                    </span>
                  </div>
                  <span className="text-sm">{user?.first_name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                    <button 
                      onClick={() => handleUserMenuClick('profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        {t('nav.profile')}
                      </div>
                    </button>
                    <button 
                      onClick={() => handleUserMenuClick('dashboard')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        {t('nav.dashboard')}
                      </div>
                    </button>
                    <hr className="my-2" />
                    <button 
                      onClick={() => handleUserMenuClick('logout')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        {t('nav.logout')}
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleNavClick('login')}
                  className="text-dark-blue hover:text-soft-green font-medium transition-colors"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => handleNavClick('signup')}
                  className="bg-gradient-to-r from-soft-green to-green-600 hover:from-green-600 hover:to-soft-green text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {t('nav.signup')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg text-gray-600 hover:text-soft-green hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentPage === item.key
                    ? 'text-soft-green bg-soft-green/10 border border-soft-green/20'
                    : 'text-gray-700 hover:text-soft-green hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            
            <hr className="my-4" />
            
            {isAuthed ? (
              <div className="space-y-2">
                <button 
                  onClick={() => handleUserMenuClick('profile')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {t('nav.profile')}
                  </div>
                </button>
                <button 
                  onClick={() => handleUserMenuClick('dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    {t('nav.dashboard')}
                  </div>
                </button>
                <button 
                  onClick={() => handleUserMenuClick('logout')}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    {t('nav.logout')}
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <button 
                  onClick={() => handleNavClick('login')}
                  className="w-full text-left px-3 py-2 text-dark-blue font-medium hover:bg-gray-50 rounded-lg"
                >
                  {t('nav.login')}
                </button>
                <button 
                  onClick={() => handleNavClick('signup')}
                  className="w-full bg-gradient-to-r from-soft-green to-green-600 text-white px-3 py-2 rounded-lg font-medium text-center"
                >
                  {t('nav.signup')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;