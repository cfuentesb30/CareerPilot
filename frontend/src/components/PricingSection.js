import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const PricingSection = ({ onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(null);

  // Pricing data with bilingual support
  const pricingPlans = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      nameSpanish: 'Gratis',
      price: '$0',
      period: t('pricing.free.period'),
      periodSpanish: 'siempre',
      popular: false,
      features: [
        t('pricing.free.feature1'),
        t('pricing.free.feature2'), 
        t('pricing.free.feature3'),
        t('pricing.free.feature4')
      ],
      featuresSpanish: [
        'Evaluación básica',
        '1 sugerencia de carrera',
        'Acceso básico a preguntas de Athena',
        'Sin guardado de progreso'
      ],
      buttonText: t('pricing.free.button'),
      buttonTextSpanish: 'Empezar Gratis',
      buttonStyle: 'btn-secondary'
    },
    {
      id: 'starter',
      name: t('pricing.starter.name'),
      nameSpanish: 'Iniciador',
      price: '$4.99',
      period: t('pricing.starter.period'),
      periodSpanish: '/mes',
      popular: false,
      features: [
        t('pricing.starter.feature1'),
        t('pricing.starter.feature2'),
        t('pricing.starter.feature3')
      ],
      featuresSpanish: [
        'Evaluación completa',
        'Hasta 3 sugerencias de carrera',
        'Seguimiento de progreso limitado'
      ],
      buttonText: t('pricing.starter.button'),
      buttonTextSpanish: 'Empezar Plan Iniciador',
      buttonStyle: 'btn-primary'
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      nameSpanish: 'Profesional',
      price: '$9.99',
      period: t('pricing.pro.period'),
      periodSpanish: '/mes',
      popular: true,
      features: [
        t('pricing.pro.feature1'),
        t('pricing.pro.feature2'),
        t('pricing.pro.feature3')
      ],
      featuresSpanish: [
        'Evaluaciones y sugerencias ilimitadas',
        'Panel de progreso completo',
        'Consejos avanzados de Athena'
      ],
      buttonText: t('pricing.pro.button'),
      buttonTextSpanish: 'Mejorar a Pro',
      buttonStyle: 'btn-primary'
    },
    {
      id: 'student',
      name: t('pricing.student.name'),
      nameSpanish: 'Estudiante',
      price: '$5.99',
      period: t('pricing.student.period'),
      periodSpanish: '/mes',
      popular: false,
      features: [
        t('pricing.student.feature1'),
        t('pricing.student.feature2')
      ],
      featuresSpanish: [
        'Lo mismo que Pro',
        'Tarifa con descuento para estudiantes'
      ],
      buttonText: t('pricing.student.button'),
      buttonTextSpanish: 'Plan Estudiante',
      buttonStyle: 'btn-primary',
      badge: t('pricing.student.badge'),
      badgeSpanish: 'Descuento'
    },
    {
      id: 'lifetime',
      name: t('pricing.lifetime.name'),
      nameSpanish: 'Acceso de Por Vida',
      price: '$49.99',
      period: t('pricing.lifetime.period'),
      periodSpanish: 'pago único',
      popular: false,
      features: [
        t('pricing.lifetime.feature1'),
        t('pricing.lifetime.feature2')
      ],
      featuresSpanish: [
        'Todas las características Pro',
        'Pago único en lugar de suscripción'
      ],
      buttonText: t('pricing.lifetime.button'),
      buttonTextSpanish: 'Comprar de Por Vida',
      buttonStyle: 'btn-primary',
      badge: t('pricing.lifetime.badge'),
      badgeSpanish: 'Mejor Valor'
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      showToast(t('pricing.free.message'), 'success');
      return;
    }

    setProcessingPlan(planId);
    setLoading(true);

    try {
      const originUrl = window.location.origin;
      
      const response = await api.post('/api/payments/checkout', {
        plan_id: planId,
        origin_url: originUrl
      });

      if (response.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast(`Failed to start checkout: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setProcessingPlan(null);
    }
  };

  // Check for payment status on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const status = urlParams.get('status');

    if (sessionId && status === 'success') {
      checkPaymentStatus(sessionId);
    } else if (status === 'cancelled') {
      showToast(t('pricing.messages.cancelled'), 'info');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    const pollInterval = 2000; // 2 seconds

    if (attempts >= maxAttempts) {
      showToast(t('pricing.messages.timeout'), 'error');
      return;
    }

    try {
      const response = await api.get(`/api/payments/status/${sessionId}`);
      
      if (response.payment_status === 'paid') {
        showToast(t('pricing.messages.success'), 'success');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      } else if (response.status === 'expired') {
        showToast(t('pricing.messages.expired'), 'error');
        return;
      }

      // Continue polling if payment is still processing
      setTimeout(() => checkPaymentStatus(sessionId, attempts + 1), pollInterval);
    } catch (error) {
      console.error('Error checking payment status:', error);
      showToast(t('pricing.messages.error'), 'error');
    }
  };

  const { i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-8 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-bold mb-4">
                {isSpanish ? 'Explora el plan que encaja con tu camino' : 'Explore the plan that fits your journey'}
              </h2>
              <p className="text-xl text-blue-200">
                {isSpanish ? 'Potencia tu viaje con Athena' : 'Unlock more with Athena'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? 'border-soft-green shadow-lg scale-105 bg-gradient-to-br from-soft-green/5 to-green-50'
                    : 'border-gray-200 hover:border-soft-green/50'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-soft-green to-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {isSpanish ? 'Más Popular' : 'Most Popular'}
                    </span>
                  </div>
                )}

                {/* Custom Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 right-4">
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {isSpanish ? plan.badgeSpanish : plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-dark-blue mb-2 text-center">
                  {isSpanish ? plan.nameSpanish : plan.name}
                </h3>

                {/* Price */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold text-dark-blue">{plan.price}</span>
                  <span className="text-gray-500 ml-1">
                    {isSpanish ? plan.periodSpanish : plan.period}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {(isSpanish ? plan.featuresSpanish : plan.features).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-soft-green mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading && processingPlan === plan.id}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-300 ${
                    plan.id === 'free'
                      ? 'border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white'
                      : plan.buttonStyle === 'btn-primary'
                      ? 'bg-gradient-to-r from-soft-green to-green-600 hover:from-green-600 hover:to-soft-green text-white shadow-lg hover:shadow-xl'
                      : 'border-2 border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white'
                  } ${loading && processingPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && processingPlan === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {isSpanish ? 'Procesando...' : 'Processing...'}
                    </div>
                  ) : (
                    isSpanish ? plan.buttonTextSpanish : plan.buttonText
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              {isSpanish 
                ? '✨ Todos los planes incluyen acceso completo a Athena AI y soporte 24/7'
                : '✨ All plans include full access to Athena AI and 24/7 support'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <span>
                {isSpanish ? '🔒 Pago seguro con Stripe' : '🔒 Secure payment with Stripe'}
              </span>
              <span>
                {isSpanish ? '📱 Acceso en móvil y escritorio' : '📱 Mobile and desktop access'}
              </span>
              <span>
                {isSpanish ? '🌍 Soporte bilingüe' : '🌍 Bilingual support'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;