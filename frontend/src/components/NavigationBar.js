import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useDevMode } from '../context/DevModeContext';
import LanguageSwitcher from './LanguageSwitcher';

const NavigationBar = ({ onNavigate, currentPage }) => {
  const { t } = useTranslation();
  const { isAuthed, user } = useAuth();
  const { devMode, toggleDevMode } = useDevMode();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
              <div className="w-10 h-10 bg-gradient-to-br from-soft-green to-teal rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">CP</span>
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
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {t('nav.profile')}
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {t('nav.dashboard')}
                    </button>
                    <hr className="my-2" />
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      {t('nav.logout')}
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
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  {t('nav.profile')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  {t('nav.dashboard')}
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                  {t('nav.logout')}
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