import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import InteractiveQuiz from './components/InteractiveQuiz';
import ResultsDashboard from './components/ResultsDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';

// Hero Section Component
const HeroSection = ({ onStartQuiz }) => {
  const { t } = useTranslation();
  
  return (
    <section className="gradient-bg text-white min-h-screen flex items-center relative overflow-hidden">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <LanguageSwitcher />
      </div>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-soft-green/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {t('hero.title')} 
              <span className="text-soft-green block mt-2">{t('hero.titleHighlight')}</span>
              <span className="text-2xl sm:text-3xl lg:text-4xl font-normal mt-4 block">{t('hero.titleSuffix')}</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
              {t('hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              >
                {t('hero.startNowBtn')}
              </button>
              <button 
                onClick={onStartQuiz}
                className="btn-secondary text-lg px-8 py-4"
              >
                {t('hero.assessmentBtn')}
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-blue-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm">{t('hero.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm">{t('hero.aiPowered')}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="text-sm">{t('hero.instantResults')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-soft-green/20 to-teal/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 float-animation">
                <div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/30">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-soft-green rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{t('hero.aiAnalysis')}</h3>
                    <p className="text-blue-100">{t('hero.smartRecommendations')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
const BenefitsSection = ({ onStartQuiz }) => {
  const { t } = useTranslation();
  
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
            
            <div className="mt-8">
              <button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              >
                {t('benefits.startBtn')}
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-dark-blue/5 to-soft-green/5 rounded-3xl p-8 lg:p-12">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
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
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);

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

  return (
    <div className="App">
      <HeroSection onStartQuiz={handleStartQuiz} />
      <HowItWorksSection />
      <BenefitsSection onStartQuiz={handleStartQuiz} />
      <TechnologySection onStartQuiz={handleStartQuiz} />
      <Footer />
      
      {/* Interactive Components */}
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
        />
      )}
    </div>
  );
}

export default App;