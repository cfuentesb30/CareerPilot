import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';

const InteractiveQuiz = ({ onComplete, onClose }) => {
  const { t } = useTranslation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [assessmentId, setAssessmentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startAssessment();
  }, []);

  const startAssessment = async () => {
    try {
      setLoading(true);
      
      // Start new assessment using api client
      const startData = await api.post('/api/assessment/start', { user_email: null });
      setAssessmentId(startData.assessment_id);

      // Get all questions using api client
      const questionsData = await api.get('/api/assessment/questions');
      setQuestions(questionsData.questions);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = async () => {
    if (!assessmentId || currentQuestion >= questions.length) return;

    const question = questions[currentQuestion];
    const answer = answers[question.id];

    if (!answer) {
      alert(t('quiz.answerRequired'));
      return;
    }

    try {
      setSubmitting(true);

      // Submit answer using api client
      await api.post('/api/assessment/answer', {
        assessment_id: assessmentId,
        question_id: question.id,
        answer: answer,
      });

      // Move to next question or complete
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        await completeAssessment();
      }

      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const completeAssessment = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE}/api/assessment/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment_id: assessmentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete assessment');
      }

      const data = await response.json();
      onComplete(assessmentId, data);
      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-soft-green mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-dark-blue mb-2">{t('quiz.loading')}</h2>
          <p className="text-gray-600">{t('quiz.loadingDesc')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('quiz.error')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={startAssessment}
              className="btn-primary"
            >
              {t('quiz.tryAgain')}
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              {t('quiz.close')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center">
          <p className="text-gray-600">No questions available. Please try again later.</p>
          <button onClick={onClose} className="btn-primary mt-4">{t('quiz.close')}</button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-3xl p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-dark-blue">{t('quiz.title')}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-soft-green to-teal h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {t('quiz.questionOf', { current: currentQuestion + 1, total: questions.length })}
          </p>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-soft-green rounded-full flex items-center justify-center text-white font-bold">
                {currentQuestion + 1}
              </div>
              <span className="text-sm font-medium text-soft-green uppercase tracking-wide">
                {question.category}
              </span>
            </div>
            
            <h3 className="text-xl font-semibold text-dark-blue mb-6 leading-relaxed">
              {question.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {question.type === 'multiple_choice' && question.options ? (
                question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`block p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:border-soft-green hover:bg-soft-green/5 ${
                      answers[question.id] === option
                        ? 'border-soft-green bg-soft-green/10 text-soft-green font-medium'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswer(question.id, e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[question.id] === option ? 'border-soft-green' : 'border-gray-300'
                      }`}>
                        {answers[question.id] === option && (
                          <div className="w-2 h-2 rounded-full bg-soft-green"></div>
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </label>
                ))
              ) : question.type === 'rating_scale' && question.options ? (
                <div className="flex justify-between items-center py-4">
                  {question.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                        answers[question.id] === option ? 'text-soft-green' : 'text-gray-500'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswer(question.id, e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center mb-2 font-bold ${
                        answers[question.id] === option
                          ? 'border-soft-green bg-soft-green text-white'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-xs text-center max-w-20">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder="Please provide your answer..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-soft-green focus:outline-none resize-none"
                  rows="4"
                />
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                currentQuestion === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-dark-blue hover:bg-gray-100'
              }`}
            >
              {t('quiz.previous')}
            </button>

            <button
              onClick={nextQuestion}
              disabled={!answers[question.id] || submitting}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                !answers[question.id] || submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-soft-green hover:bg-teal text-white transform hover:scale-105'
              }`}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('quiz.processing')}
                </div>
              ) : currentQuestion === questions.length - 1 ? (
                t('quiz.complete')
              ) : (
                t('quiz.next')
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveQuiz;