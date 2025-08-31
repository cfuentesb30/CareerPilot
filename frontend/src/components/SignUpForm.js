import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const SignUpForm = ({ onClose, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form', 'success', 'verification'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain letters and numbers';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/api/auth/register', {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password
      });

      showToast('Account created successfully! Check your email for verification.', 'success');
      setStep('success');

    } catch (error) {
      const message = error.message || 'Failed to create account';
      showToast(message, 'error');
      
      if (message.includes('already exists')) {
        setErrors({ email: 'An account with this email already exists' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await api.post('/api/auth/resend-verification', { email: formData.email });
      showToast('Verification email sent!', 'success');
    } catch (error) {
      showToast('Failed to resend verification email', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Welcome to CareerPilot!</h2>
              <button onClick={onClose} className="text-white hover:text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Success Content */}
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h3 className="text-2xl font-bold text-dark-blue mb-4">Account Created Successfully!</h3>
            
            <p className="text-gray-600 mb-6">
              We've sent a verification email to <strong>{formData.email}</strong>. 
              Please click the link in your email to verify your account and start your career journey with Athena.
            </p>

            <div className="space-y-4">
              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="w-full btn-secondary"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={onSwitchToLogin}
                className="w-full btn-primary"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Join CareerPilot</h2>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <p className="text-blue-200 mt-2">Start your AI-powered career journey with Athena</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-soft-green focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John"
                disabled={loading}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-soft-green focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Doe"
                disabled={loading}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-soft-green focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="john@example.com"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-soft-green focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="At least 8 characters with letters & numbers"
              disabled={loading}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-soft-green focus:border-transparent ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
              disabled={loading}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>

          {/* Login Link */}
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-soft-green hover:underline font-medium"
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpForm;