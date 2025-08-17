import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './App.css';
import InteractiveQuiz from './components/InteractiveQuiz';
import ResultsDashboard from './components/ResultsDashboard';
import LanguageSwitcher from './components/LanguageSwitcher';
import AuthPlaceholder from './components/AuthPlaceholder';
import ProfilePreview from './components/ProfilePreview';
import RoadmapPreview from './components/RoadmapPreview';

// Hero Section Component
const HeroSection = ({ onStartQuiz, onOpenAuth, onOpenProfile }) =&gt; {
  const { t } = useTranslation();
  
  return (
    &lt;section className="gradient-bg text-white min-h-screen flex items-center relative overflow-hidden"&gt;
      {/* Header with Logo and Language Switcher */}
      &lt;div className="absolute top-0 left-0 right-0 z-30 p-6"&gt;
        &lt;div className="flex justify-between items-center"&gt;
          
          {/* Logo Placeholder - Replace with your actual logo */}
          &lt;div className="flex items-center gap-3"&gt;
            &lt;div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30"&gt;
              &lt;span className="text-2xl font-bold text-white"&gt;CP&lt;/span&gt;
            &lt;/div&gt;
            &lt;div className="text-white"&gt;
              &lt;div className="text-xl font-bold"&gt;CareerPilot&lt;/div&gt;
              &lt;div className="text-sm text-blue-200"&gt;powered by Athena&lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          
          {/* Language Switcher */}
          &lt;div className="flex items-center gap-3"&gt;
            &lt;button onClick={() =&gt; onOpenProfile &amp;&amp; onOpenProfile()} className="hidden sm:inline-flex btn-secondary py-2 px-4"&gt;
              {t('profilePreview.title')}
            &lt;/button&gt;
            &lt;button onClick={() =&gt; onOpenAuth &amp;&amp; onOpenAuth('signup')} className="hidden sm:inline-flex btn-primary py-2 px-4"&gt;
              {t('auth.signupCTA')}
            &lt;/button&gt;
            &lt;LanguageSwitcher /&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
      
      {/* Background decoration */}
      &lt;div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent"&gt;&lt;/div&gt;
      &lt;div className="absolute top-0 right-0 w-96 h-96 bg-soft-green/10 rounded-full blur-3xl"&gt;&lt;/div&gt;
      &lt;div className="absolute bottom-0 left-0 w-80 h-80 bg-teal/10 rounded-full blur-3xl"&gt;&lt;/div&gt;
      
      &lt;div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-20"&gt;
        &lt;div className="grid lg:grid-cols-2 gap-12 items-center"&gt;
          &lt;div className="text-center lg:text-left"&gt;
            &lt;h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight"&gt;
              {t('hero.title')} 
              &lt;span className="text-soft-green block mt-2"&gt;{t('hero.titleHighlight')}&lt;/span&gt;
              &lt;span className="text-2xl sm:text-3xl lg:text-4xl font-normal mt-4 block"&gt;{t('hero.titleSuffix')}&lt;/span&gt;
            &lt;/h1&gt;
            
            &lt;p className="text-xl sm:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0"&gt;
              {t('hero.subtitle')}
            &lt;/p&gt;
            
            &lt;div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"&gt;
              &lt;button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              &gt;
                {t('hero.startNowBtn')}
              &lt;/button&gt;
              &lt;button 
                onClick={onStartQuiz}
                className="btn-secondary text-lg px-8 py-4"
              &gt;
                {t('hero.assessmentBtn')}
              &lt;/button&gt;
            &lt;/div&gt;
            
            &lt;div className="mt-8 flex items-center gap-6 justify-center lg:justify-start text-blue-200"&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20"&gt;
                  &lt;path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"&gt;&lt;/path&gt;
                &lt;/svg&gt;
                &lt;span className="text-sm"&gt;{t('hero.free')}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20"&gt;
                  &lt;path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"&gt;&lt;/path&gt;
                &lt;/svg&gt;
                &lt;span className="text-sm"&gt;{t('hero.aiPowered')}&lt;/span&gt;
              &lt;/div&gt;
              &lt;div className="flex items-center gap-2"&gt;
                &lt;svg className="w-5 h-5 text-soft-green" fill="currentColor" viewBox="0 0 20 20"&gt;
                  &lt;path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"&gt;&lt;/path&gt;
                &lt;/svg&gt;
                &lt;span className="text-sm"&gt;{t('hero.instantResults')}&lt;/span&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          
          &lt;div className="flex justify-center lg:justify-end"&gt;
            &lt;div className="relative"&gt;
              &lt;div className="w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br from-soft-green/20 to-teal/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 float-animation"&gt;
                &lt;div className="w-64 h-64 lg:w-80 lg:h-80 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center border border-white/30"&gt;
                  &lt;div className="text-center"&gt;
                    &lt;div className="w-16 h-16 mx-auto mb-4 bg-soft-green rounded-full flex items-center justify-center"&gt;
                      &lt;svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                        &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"&gt;&lt;/path&gt;
                      &lt;/svg&gt;
                    &lt;/div&gt;
                    &lt;h3 className="text-xl font-semibold mb-2"&gt;{t('hero.aiAnalysis')}&lt;/h3&gt;
                    &lt;p className="text-blue-100"&gt;{t('hero.smartRecommendations')}&lt;/p&gt;
                  &lt;/div&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/section&gt;
  );
};

// How It Works Section Component
const HowItWorksSection = () =&gt; {
  const { t } = useTranslation();
  
  const steps = [
    {
      id: 1,
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      icon: (
        &lt;svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
          &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"&gt;&lt;/path&gt;
        &lt;/svg&gt;
      )
    },
    {
      id: 2,
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      icon: (
        &lt;svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
          &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"&gt;&lt;/path&gt;
        &lt;/svg&gt;
      )
    },
    {
      id: 3,
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      icon: (
        &lt;svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
          &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"&gt;&lt;/path&gt;
        &lt;/svg&gt;
      )
    }
  ];

  return (
    &lt;section className="section-padding bg-light-gray"&gt;
      &lt;div className="container mx-auto"&gt;
        &lt;div className="text-center mb-16"&gt;
          &lt;h2 className="text-4xl lg:text-5xl font-bold text-dark-blue mb-6"&gt;
            {t('howItWorks.title')}
          &lt;/h2&gt;
          &lt;p className="text-xl text-gray-600 max-w-2xl mx-auto"&gt;
            {t('howItWorks.subtitle')}
          &lt;/p&gt;
        &lt;/div&gt;
        
        &lt;div className="grid md:grid-cols-3 gap-8 lg:gap-12"&gt;
          {steps.map((step, index) =&gt; (
            &lt;div key={step.id} className="relative"&gt;
              {/* Connection line */}
              {index &lt; steps.length - 1 &amp;&amp; (
                &lt;div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-soft-green to-teal transform -translate-y-1/2 z-0"&gt;&lt;/div&gt;
              )}
              
              &lt;div className="relative z-10 text-center"&gt;
                &lt;div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-soft-green to-teal rounded-full flex items-center justify-center text-white shadow-lg"&gt;
                  {step.icon}
                &lt;/div&gt;
                
                &lt;div className="absolute -top-2 -right-2 w-8 h-8 bg-dark-blue rounded-full flex items-center justify-center text-white font-bold text-sm"&gt;
                  {step.id}
                &lt;/div&gt;
                
                &lt;h3 className="text-2xl font-bold text-dark-blue mb-4"&gt;
                  {step.title}
                &lt;/h3&gt;
                
                &lt;p className="text-gray-600 leading-relaxed"&gt;
                  {step.description}
                &lt;/p&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          ))}
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/section&gt;
  );
};

//Benefits Section Component
const BenefitsSection = ({ onStartQuiz, onOpenProfile, onOpenAuth }) =&gt; {
  const { t } = useTranslation();
  
  const benefits = [
    t('benefits.benefit1'),
    t('benefits.benefit2'),
    t('benefits.benefit3'),
    t('benefits.benefit4')
  ];

  return (
    &lt;section className="section-padding bg-white"&gt;
      &lt;div className="container mx-auto"&gt;
        &lt;div className="grid lg:grid-cols-2 gap-12 items-center"&gt;
          &lt;div&gt;
            &lt;h2 className="text-4xl lg:text-5xl font-bold text-dark-blue mb-8"&gt;
              {t('benefits.title')}
              &lt;span className="text-soft-green block mt-2"&gt;{t('benefits.titleHighlight')}&lt;/span&gt;
            &lt;/h2&gt;
            
            &lt;div className="space-y-6"&gt;
              {benefits.map((benefit, index) =&gt; (
                &lt;div key={index} className="flex items-start gap-4"&gt;
                  &lt;div className="flex-shrink-0 w-6 h-6 bg-soft-green rounded-full flex items-center justify-center mt-1"&gt;
                    &lt;svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                      &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"&gt;&lt;/path&gt;
                    &lt;/svg&gt;
                  &lt;/div&gt;
                  &lt;p className="text-lg text-gray-700 leading-relaxed"&gt;
                    {benefit}
                  &lt;/p&gt;
                &lt;/div&gt;
              ))}
            &lt;/div&gt;
            
            &lt;div className="mt-8 flex gap-4"&gt;
              &lt;button 
                onClick={onStartQuiz}
                className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300"
              &gt;
                {t('benefits.startBtn')}
              &lt;/button&gt;
              &lt;button onClick={onOpenProfile} className="btn-secondary"&gt;{t('profilePreview.title')}&lt;/button&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          
          &lt;div className="relative"&gt;
            &lt;div className="bg-gradient-to-br from-dark-blue/5 to-soft-green/5 rounded-3xl p-8 lg:p-12"&gt;
              {/* Why Create an Account Section */}
              &lt;div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 mb-8"&gt;
                &lt;h4 className="text-2xl font-bold text-dark-blue mb-4"&gt;{t('auth.whyTitle')}&lt;/h4&gt;
                &lt;ul className="space-y-2 text-gray-700"&gt;
                  {t('auth.whyPoints', { returnObjects: true }).map((point, idx) =&gt; (
                    &lt;li key={idx} className="flex items-start gap-3"&gt;
                      &lt;span className="text-soft-green mt-1"&gt;•&lt;/span&gt;
                      &lt;span&gt;{point}&lt;/span&gt;
                    &lt;/li&gt;
                  ))}
                &lt;/ul&gt;
                &lt;button onClick={onOpenAuth} className="btn-primary mt-4"&gt;{t('auth.signupCTA')}&lt;/button&gt;
              &lt;/div&gt;
              &lt;div className="grid grid-cols-2 gap-6"&gt;
                &lt;div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover"&gt;
                  &lt;div className="w-12 h-12 bg-soft-green/10 rounded-lg flex items-center justify-center mb-4"&gt;
                    &lt;svg className="w-6 h-6 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                      &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"&gt;&lt;/path&gt;
                    &lt;/svg&gt;
                  &lt;/div&gt;
                  &lt;h4 className="font-semibold text-dark-blue mb-2"&gt;{t('benefits.fastResults')}&lt;/h4&gt;
                  &lt;p className="text-sm text-gray-600"&gt;{t('benefits.fastResultsDesc')}&lt;/p&gt;
                &lt;/div&gt;
                
                &lt;div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover"&gt;
                  &lt;div className="w-12 h-12 bg-teal/10 rounded-lg flex items-center justify-center mb-4"&gt;
                    &lt;svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                      &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"&gt;&lt;/path&gt;
                    &lt;/svg&gt;
                  &lt;/div&gt;
                  &lt;h4 className="font-semibold text-dark-blue mb-2"&gt;{t('benefits.accurate')}&lt;/h4&gt;
                  &lt;p className="text-sm text-gray-600"&gt;{t('benefits.accurateDesc')}&lt;/p&gt;
                &lt;/div&gt;
                
                &lt;div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover"&gt;
                  &lt;div className="w-12 h-12 bg-dark-blue/10 rounded-lg flex items-center justify-center mb-4"&gt;
                    &lt;svg className="w-6 h-6 text-dark-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                      &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"&gt;&lt;/path&gt;
                    &lt;/svg&gt;
                  &lt;/div&gt;
                  &lt;h4 className="font-semibold text-dark-blue mb-2"&gt;{t('benefits.trusted')}&lt;/h4&gt;
                  &lt;p className="text-sm text-gray-600"&gt;{t('benefits.trustedDesc')}&lt;/p&gt;
                &lt;/div&gt;
                
                &lt;div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 card-hover"&gt;
                  &lt;div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"&gt;
                    &lt;svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                      &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"&gt;&lt;/path&gt;
                    &lt;/svg&gt;
                  &lt;/div&gt;
                  &lt;h4 className="font-semibold text-dark-blue mb-2"&gt;{t('benefits.supportive')}&lt;/h4&gt;
                  &lt;p className="text-sm text-gray-600"&gt;{t('benefits.supportiveDesc')}&lt;/p&gt;
                &lt;/div&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/section&gt;
  );
};

// Technology Section Component
const TechnologySection = ({ onStartQuiz }) =&gt; {
  const { t } = useTranslation();
  
  return (
    &lt;section className="section-padding gradient-bg text-white"&gt;
      &lt;div className="container mx-auto"&gt;
        &lt;div className="text-center max-w-4xl mx-auto"&gt;
          &lt;h2 className="text-4xl lg:text-5xl font-bold mb-8"&gt;
            {t('technology.title')}
          &lt;/h2&gt;
          
          &lt;p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed"&gt;
            {t('technology.subtitle')}
          &lt;/p&gt;
          
          &lt;div className="grid md:grid-cols-3 gap-8 mb-12"&gt;
            &lt;div className="text-center p-6"&gt;
              &lt;div className="w-16 h-16 mx-auto mb-4 bg-soft-green/20 rounded-full flex items-center justify-center"&gt;
                &lt;svg className="w-8 h-8 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                  &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"&gt;&lt;/path&gt;
                &lt;/svg&gt;
              &lt;/div&gt;
              &lt;h3 className="text-lg font-semibold mb-2"&gt;{t('technology.machineLearning')}&lt;/h3&gt;
              &lt;p className="text-blue-100"&gt;{t('technology.machineLearningDesc')}&lt;/p&gt;
            &lt;/div&gt;
            
            &lt;div className="text-center p-6"&gt;
              &lt;div className="w-16 h-16 mx-auto mb-4 bg-teal/20 rounded-full flex items-center justify-center"&gt;
                &lt;svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                  &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"&gt;&lt;/path&gt;
                &lt;/svg&gt;
              &lt;/div&gt;
              &lt;h3 className="text-lg font-semibold mb-2"&gt;{t('technology.realData')}&lt;/h3&gt;
              &lt;p className="text-blue-100"&gt;{t('technology.realDataDesc')}&lt;/p&gt;
            &lt;/div&gt;
            
            &lt;div className="text-center p-6"&gt;
              &lt;div className="w-16 h-16 mx-auto mb-4 bg-yellow-400/20 rounded-full flex items-center justify-center"&gt;
                &lt;svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"&gt;
                  &lt;path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"&gt;&lt;/path&gt;
                &lt;/svg&gt;
              &lt;/div&gt;
              &lt;h3 className="text-lg font-semibold mb-2"&gt;{t('technology.instantResults')}&lt;/h3&gt;
              &lt;p className="text-blue-100"&gt;{t('technology.instantResultsDesc')}&lt;/p&gt;
            &lt;/div&gt;
          &lt;/div&gt;
          
          &lt;button 
            onClick={onStartQuiz}
            className="btn-primary text-lg px-10 py-4 mx-auto transform hover:scale-105 transition-all duration-300"
          &gt;
            {t('technology.experienceBtn')}
          &lt;/button&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/section&gt;
  );
};

// Footer Component
const Footer = () =&gt; {
  const { t } = useTranslation();
  
  return (
    &lt;footer className="bg-dark-blue text-white py-12"&gt;
      &lt;div className="container mx-auto px-4 sm:px-6 lg:px-8"&gt;
        &lt;div className="grid md:grid-cols-3 gap-8 mb-8"&gt;
          &lt;div&gt;
            &lt;h3 className="text-xl font-bold mb-4"&gt;{t('footer.title')}&lt;/h3&gt;
            &lt;p className="text-blue-200"&gt;
              {t('footer.description')}
            &lt;/p&gt;
          &lt;/div&gt;
          
          &lt;div&gt;
            &lt;h4 className="text-lg font-semibold mb-4"&gt;{t('footer.howItWorksTitle')}&lt;/h4&gt;
            &lt;ul className="space-y-2 text-blue-200"&gt;
              &lt;li&gt;{t('footer.step1')}&lt;/li&gt;
              &lt;li&gt;{t('footer.step2')}&lt;/li&gt;
              &lt;li&gt;{t('footer.step3')}&lt;/li&gt;
              &lt;li&gt;{t('footer.step4')}&lt;/li&gt;
            &lt;/ul&gt;
          &lt;/div&gt;
          
          &lt;div&gt;
            &lt;h4 className="text-lg font-semibold mb-4"&gt;{t('footer.contactTitle')}&lt;/h4&gt;
            &lt;div className="space-y-2 text-blue-200"&gt;
              &lt;p&gt;{t('footer.email')}&lt;/p&gt;
              &lt;div className="flex space-x-4 mt-4"&gt;
                &lt;a href="#" className="hover:text-soft-green transition-colors"&gt;{t('footer.twitter')}&lt;/a&gt;
                &lt;a href="#" className="hover:text-soft-green transition-colors"&gt;{t('footer.linkedin')}&lt;/a&gt;
                &lt;a href="#" className="hover:text-soft-green transition-colors"&gt;{t('footer.facebook')}&lt;/a&gt;
              &lt;/div&gt;
            &lt;/div&gt;
          &lt;/div&gt;
        &lt;/div&gt;
        
        &lt;div className="border-t border-blue-700 pt-8 text-center text-blue-200"&gt;
          &lt;p&gt;{t('footer.copyright')}&lt;/p&gt;
        &lt;/div&gt;
      &lt;/div&gt;
    &lt;/footer&gt;
  );
};

// Main App Component
function App() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const [showAuth, setShowAuth] = useState(null); // 'signup' or 'login'
  const [showProfile, setShowProfile] = useState(false);

  const handleStartQuiz = () =&gt; {
    setShowQuiz(true);
    setShowResults(false);
  };

  const handleQuizComplete = (id, analysisData) =&gt; {
    setAssessmentId(id);
    setShowQuiz(false);
    setShowResults(true);
  };

  const handleCloseQuiz = () =&gt; {
    setShowQuiz(false);
  };

  const handleCloseResults = () =&gt; {
    setShowResults(false);
    setAssessmentId(null);
  };

  const handleStartNew = () =&gt; {
    setShowResults(false);
    setAssessmentId(null);
    setShowQuiz(true);
  };

  return (
    &lt;div className="App"&gt;
      &lt;HeroSection onStartQuiz={handleStartQuiz} onOpenAuth={(mode) =&gt; setShowAuth(mode)} onOpenProfile={() =&gt; setShowProfile(true)} /&gt;
      &lt;HowItWorksSection /&gt;
      &lt;BenefitsSection onStartQuiz={handleStartQuiz} onOpenProfile={() =&gt; setShowProfile(true)} onOpenAuth={() =&gt; setShowAuth('signup')} /&gt;
      &lt;TechnologySection onStartQuiz={handleStartQuiz} /&gt;
      &lt;Footer /&gt;
      
      {/* Interactive Components */}
      {showQuiz &amp;&amp; (
        &lt;InteractiveQuiz 
          onComplete={handleQuizComplete}
          onClose={handleCloseQuiz}
        /&gt;
      )}
      
      {showResults &amp;&amp; assessmentId &amp;&amp; (
        &lt;ResultsDashboard
          assessmentId={assessmentId}
          onClose={handleCloseResults}
          onStartNew={handleStartNew}
        /&gt;
      )}

      {showAuth &amp;&amp; (
        &lt;AuthPlaceholder type={showAuth} onClose={() =&gt; setShowAuth(null)} /&gt;
      )}

      {showProfile &amp;&amp; (
        &lt;ProfilePreview onClose={() =&gt; setShowProfile(false)} onOpenSignUp={() =&gt; setShowAuth('signup')} /&gt;
      )}
    &lt;/div&gt;
  );
}

export default App;