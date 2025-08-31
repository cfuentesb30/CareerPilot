import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import InteractiveQuiz from './components/InteractiveQuiz';
import ResultsDashboard from './components/ResultsDashboard';
import NavigationBar from './components/NavigationBar';
import PricingSection from './components/PricingSection';
import DevTools from './components/DevTools';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DevModeProvider, useDevMode } from './context/DevModeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import DevToggle from './components/DevToggle';
import AuthPlaceholder from './components/AuthPlaceholder';
import ProfilePreview from './components/ProfilePreview';
import RoadmapPreview from './components/RoadmapPreview';
import ChatUI from './components/ChatUI';
import ProfileEditor from './components/ProfileEditor';
import SkillsManager from './components/SkillsManager';
import CareersManager from './components/CareersManager';
import CertificationsManager from './components/CertificationsManager';
import RoadmapManager from './components/RoadmapManager';
import DashboardModal from './components/DashboardModal';
import DashboardPreview from './components/DashboardPreview';

// Hero Section Component
const HeroSection = ({ onStartQuiz }) => {
  const { t } = useTranslation();
  
  return (
    <section className="gradient-bg text-white min-h-screen flex items-center relative overflow-hidden pt-16">
      <div className="container mx-auto px-6 lg:px-8 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              {t('hero.title')}{' '}
              <span className="text-soft-green block lg:inline">
                {t('hero.titleHighlight')}
              </span>
              <div className="text-3xl lg:text-5xl font-light mt-2 text-blue-200">
                {t('hero.subtitle')}
              </div>
            </h1>
            
            <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t('hero.description')}
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              >
                {t('hero.startBtn')}
              </button>
              <button 
                onClick={onStartQuiz}
                className="btn-secondary text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-dark-blue"
              >
                {t('hero.assessmentBtn')}
              </button>
            </div>
            
            {/* Features */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm">
              <div className="flex items-center gap-2">
                <span className="text-soft-green">✓</span>
                <span>{t('hero.feature1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-soft-green">✓</span>
                <span>{t('hero.feature2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-soft-green">✓</span>
                <span>{t('hero.feature3')}</span>
              </div>
            </div>
          </div>
          
          {/* Visual */}
          <div className="relative">
            <div className="relative z-10">
              <div className="w-80 h-80 lg:w-96 lg:h-96 mx-auto bg-gradient-to-br from-soft-green/20 to-teal/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <div className="w-60 h-60 lg:w-72 lg:h-72 bg-gradient-to-br from-soft-green to-teal rounded-full flex items-center justify-center shadow-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💡</div>
                    <div className="text-xl font-bold">Athena Analysis</div>
                    <div className="text-sm text-blue-200 mt-2">Smart career recommendations by Athena</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="absolute top-20 right-8 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float-delayed">
              <span className="text-xl">📊</span>
            </div>
            <div className="absolute bottom-20 left-8 w-14 h-14 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20 flex items-center justify-center animate-float">
              <span className="text-xl">🚀</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-soft-green rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-teal rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-blue-400 rounded-full blur-2xl"></div>
      </div>
    </section>
  );
};

// How It Works Section Component
const HowItWorksSection = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      id: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
    {
      id: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
      )
    },
    {
      id: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="section-padding bg-light-gray">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-dark-blue mb-6">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-soft-green to-teal transform -translate-y-1/2 z-0"></div>
              )}
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-soft-green to-teal rounded-full flex items-center justify-center text-white shadow-lg">
                  {step.icon}
                </div>
                
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-dark-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {step.id}
                </div>
                
                <h3 className="text-2xl font-bold text-dark-blue mb-4">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

//Benefits Section Component
const BenefitsSection = ({ onStartQuiz, onOpenProfile, onOpenProfileEditor, onOpenAuth, onOpenRoadmap, onOpenChat, onOpenSkills, onOpenCareers, onOpenCerts, onOpenRoadmapManager, onOpenDashboard, onOpenDashboardPreview }) => {
  const { t } = useTranslation();
  const { isAuthed } = useAuth();
  const { devMode } = useDevMode();
  
  const benefits = [
    t('benefits.benefit1'),
    t('benefits.benefit2'),
    t('benefits.benefit3'),
    t('benefits.benefit4')
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold text-dark-blue mb-8">
              {t('benefits.title')}
              <span className="text-soft-green block mt-2">{t('benefits.titleHighlight')}</span>
            </h2>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 bg-soft-green rounded-full flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex gap-4 flex-wrap">
              <button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              >
                {t('benefits.startBtn')}
              </button>
              {isAuthed && devMode ? (
                <button onClick={onOpenProfileEditor} className="btn-secondary">Edit Profile (Dev)</button>
              ) : (
                <button onClick={onOpenProfile} className="btn-secondary">{t('profilePreview.title')}</button>
              )}
              <button onClick={onOpenRoadmap} className="btn-secondary">Roadmap Preview</button>
              <button onClick={onOpenDashboardPreview} className="btn-secondary">Dashboard Preview</button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-dark-blue/5 to-soft-green/5 rounded-3xl p-8 lg:p-12">
              {/* Why Create an Account Section */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
                <h4 className="text-2xl font-bold text-dark-blue mb-4">{t('auth.whyTitle')}</h4>
                <ul className="space-y-2 text-gray-700">
                  {t('auth.whyPoints', { returnObjects: true }).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-soft-green mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3 mt-4 flex-wrap">
                  <button onClick={onOpenAuth} className="btn-primary">{t('auth.signupCTA')}</button>
                  <button onClick={onOpenChat} className="btn-secondary">Chat with Athena</button>
                  {isAuthed && devMode && (
                    <>
                      <button onClick={onOpenDashboard} className="btn-secondary">Dashboard (Dev)</button>
                      <button onClick={onOpenSkills} className="btn-secondary">Skills (Dev)</button>
                      <button onClick={onOpenCareers} className="btn-secondary">Careers (Dev)</button>
                      <button onClick={onOpenCerts} className="btn-secondary">Certs (Dev)</button>
                      <button onClick={onOpenRoadmapManager} className="btn-secondary">Roadmap (Dev)</button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
                  <div className="w-12 h-12 bg-soft-green/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-dark-blue mb-2">{t('benefits.fastResults')}</h4>
                  <p className="text-sm text-gray-600">{t('benefits.fastResultsDesc')}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
                  <div className="w-12 h-12 bg-teal/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-dark-blue mb-2">{t('benefits.accurate')}</h4>
                  <p className="text-sm text-gray-600">{t('benefits.accurateDesc')}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
                  <div className="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-dark-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-dark-blue mb-2">{t('benefits.trusted')}</h4>
                  <p className="text-sm text-gray-600">{t('benefits.trustedDesc')}</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                  </div>
                  <h4 className="font-semibold text-dark-blue mb-2">{t('benefits.supportive')}</h4>
                  <p className="text-sm text-gray-600">{t('benefits.supportiveDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Technology Section Component
const TechnologySection = ({ onStartQuiz }) => {
  const { t } = useTranslation();
  
  return (
    <section className="section-padding gradient-bg text-white">
      <div className="container mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold mb-8">
            {t('technology.title')}
          </h2>
          
          <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed">
            {t('technology.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-soft-green/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('technology.machineLearning')}</h3>
              <p className="text-blue-100">{t('technology.machineLearningDesc')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-teal/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('technology.realData')}</h3>
              <p className="text-blue-100">{t('technology.realDataDesc')}</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('technology.instantResults')}</h3>
              <p className="text-blue-100">{t('technology.instantResultsDesc')}</p>
            </div>
          </div>
          
          <button 
            onClick={onStartQuiz}
            className="btn-primary text-lg px-10 py-4 mx-auto transform hover:scale-105 transition-all duration-300"
          >
            {t('technology.experienceBtn')}
          </button>
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-dark-blue text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.title')}</h3>
            <p className="text-blue-200">
              {t('footer.description')}
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.howItWorksTitle')}</h4>
            <ul className="space-y-2 text-blue-200">
              <li>{t('footer.step1')}</li>
              <li>{t('footer.step2')}</li>
              <li>{t('footer.step3')}</li>
              <li>{t('footer.step4')}</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contactTitle')}</h4>
            <div className="space-y-2 text-blue-200">
              <p>{t('footer.email')}</p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="hover:text-soft-green transition-colors">{t('footer.twitter')}</a>
                <a href="#" className="hover:text-soft-green transition-colors">{t('footer.linkedin')}</a>
                <a href="#" className="hover:text-soft-green transition-colors">{t('footer.facebook')}</a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-blue-700 pt-8 text-center text-blue-200">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [showAuth, setShowAuth] = useState(null); // 'signup' or 'login'
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showChatUI, setShowChatUI] = useState(false);
  const [showSkills, setShowSkills] = useState(false);
  const [showCareers, setShowCareers] = useState(false);
  const [showCerts, setShowCerts] = useState(false);
  const [showRoadmapManager, setShowRoadmapManager] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDashboardPreview, setShowDashboardPreview] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
  };

  const handleQuizComplete = (id, analysisData) => {
    setAssessmentId(id);
    setShowQuiz(false);
    setShowResults(true);
  };

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setAssessmentId(null);
  };

  const handleStartNew = () => {
    setShowResults(false);
    setAssessmentId(null);
    setShowQuiz(true);
  };

  const handleOpenRoadmapFromResults = () => {
    setShowResults(false);
    setShowRoadmapManager(true);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    
    // Handle special page navigation
    switch(page) {
      case 'pricing':
        setShowPricing(true);
        break;
      case 'login':
        setShowAuth('login');
        break;
      case 'signup':
        setShowAuth('signup');
        break;
      default:
        break;
    }
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'home':
        return (
          <>
            <HeroSection onStartQuiz={handleStartQuiz} />
            <HowItWorksSection />
            <BenefitsSection 
              onStartQuiz={handleStartQuiz}
              onOpenProfile={() => setShowProfile(true)}
              onOpenProfileEditor={() => setShowProfileEditor(true)}
              onOpenAuth={(mode) => setShowAuth(mode)}
              onOpenRoadmap={() => setShowRoadmap(true)}
              onOpenChat={() => setShowChat(true)}
              onOpenSkills={() => setShowSkills(true)}
              onOpenCareers={() => setShowCareers(true)}
              onOpenCerts={() => setShowCerts(true)}
              onOpenRoadmapManager={() => setShowRoadmapManager(true)}
              onOpenDashboard={() => setShowDashboard(true)}
              onOpenDashboardPreview={() => setShowDashboardPreview(true)}
            />
            <TechnologySection />
            <Footer />
          </>
        );
      case 'about':
        return (
          <div className="pt-16 min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-16 text-center">
              <h1 className="text-4xl font-bold text-dark-blue mb-8">About CareerPilot</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                CareerPilot is revolutionizing career guidance with AI-powered insights from Athena. 
                We help professionals make informed decisions about their career paths through 
                personalized recommendations and expert guidance.
              </p>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="pt-16 min-h-screen bg-gray-50">
            <div className="container mx-auto px-6 py-16 text-center">
              <h1 className="text-4xl font-bold text-dark-blue mb-8">Contact Us</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Have questions? We'd love to hear from you. Get in touch with our team.
              </p>
              <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
                <div className="space-y-4">
                  <div>
                    <strong className="text-dark-blue">Email:</strong>
                    <p className="text-gray-600">support@careerpilot.com</p>
                  </div>
                  <div>
                    <strong className="text-dark-blue">Response Time:</strong>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DevModeProvider>
      <ToastProvider>
        <AuthProvider>
          <div className="App">
            <NavigationBar 
              onNavigate={handleNavigate} 
              currentPage={currentPage}
              onOpenProfile={() => setShowProfileEditor(true)}
              onOpenDashboard={() => setShowDashboard(true)}
            />
            
            {/* Dev Tools - floating when dev mode is enabled */}
            <DevTools />
            
            {renderCurrentPage()}

            {/* Modals and Overlays */}
            {showQuiz && (
              <InteractiveQuiz 
                onComplete={handleQuizComplete}
                onClose={handleCloseQuiz}
              />
            )}
            
            {showResults && assessmentId && (
              <ResultsDashboard
                assessmentId={assessmentId}
                onClose={handleCloseResults}
                onStartNew={handleStartNew}
                onOpenRoadmap={handleOpenRoadmapFromResults}
              />
            )}

            {showPricing && (
              <PricingSection onClose={() => setShowPricing(false)} />
            )}

            {showAuth && (
              <AuthPlaceholder type={showAuth} onClose={() => setShowAuth(null)} />
            )}

            {showProfile && (
              <ProfilePreview onClose={() => setShowProfile(false)} onOpenSignUp={() => setShowAuth('signup')} />
            )}

            {showProfileEditor && (
              <ProfileEditor onClose={() => setShowProfileEditor(false)} />
            )}

            {showRoadmap && (
              <RoadmapPreview onClose={() => setShowRoadmap(false)} onOpenSignUp={() => setShowAuth('signup')} />
            )}

            {showRoadmapManager && (
              <RoadmapManager onClose={() => setShowRoadmapManager(false)} />
            )}

            {showChat && (
              <ChatUI onClose={() => setShowChat(false)} />
            )}

            {showSkills && (
              <SkillsManager onClose={() => setShowSkills(false)} />
            )}

            {showCareers && (
              <CareersManager onClose={() => setShowCareers(false)} />
            )}

            {showCerts && (
              <CertificationsManager onClose={() => setShowCerts(false)} />
            )}

            {showDashboard && (
              <DashboardModal onClose={() => setShowDashboard(false)} />
            )}

            {showDashboardPreview && (
              <DashboardPreview onClose={() => setShowDashboardPreview(false)} />
            )}
          </div>
        </AuthProvider>
      </ToastProvider>
    </DevModeProvider>
  );
}

export default App;