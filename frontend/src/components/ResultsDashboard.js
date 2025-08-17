import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ResultsDashboard = ({ assessmentId, onClose, onStartNew }) => {
  const { t } = useTranslation();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recommendations');

  const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    if (assessmentId) {
      fetchResults();
    }
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Poll for results (they might still be processing)
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds max wait time
      
      while (attempts < maxAttempts) {
        const response = await fetch(`${API_BASE}/api/results/${assessmentId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        
        if (data.status === 'completed' && data.results) {
          setResults(data.results);
          setLoading(false);
          return;
        } else if (data.status === 'failed') {
          throw new Error('Analysis failed. Please try again.');
        }
        
        // Wait 1 second before next attempt
        await new Promise(resolve => setTimeout(resolve, 1000));
        attempts++;
      }
      
      throw new Error('Analysis is taking longer than expected. Please try again later.');
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-soft-green mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-soft-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-dark-blue mb-4">Analyzing Your Career Path</h2>
          <p className="text-gray-600 mb-2">Our AI is processing your assessment...</p>
          <p className="text-sm text-gray-500">This usually takes 30-60 seconds</p>
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
          <h2 className="text-2xl font-bold text-red-600 mb-4">Analysis Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={fetchResults} className="btn-primary">Try Again</button>
            <button onClick={onClose} className="btn-secondary">Close</button>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 text-center">
          <p className="text-gray-600">No results available.</p>
          <button onClick={onClose} className="btn-primary mt-4">Close</button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'recommendations', label: 'Career Recommendations', icon: '🎯' },
    { id: 'skills', label: 'Skill Analysis', icon: '🔧' },
    { id: 'personality', label: 'Personality Insights', icon: '🧠' },
    { id: 'action', label: 'Action Plan', icon: '📋' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-2">🎉 Your Career Analysis Results</h2>
              <p className="text-blue-200">Personalized recommendations powered by AI</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-soft-green border-b-2 border-soft-green bg-soft-green/5'
                    : 'text-gray-600 hover:text-soft-green hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-dark-blue mb-6">🎯 Recommended Career Paths</h3>
              {results.career_recommendations.map((career, index) => (
                <div key={index} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-dark-blue">{career.career_title}</h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-soft-green">{career.match_percentage}%</div>
                      <div className="text-sm text-gray-500">match</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">{career.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="font-semibold text-dark-blue mb-2">💰 Salary Range</h5>
                      <p className="text-gray-600">{career.salary_range}</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-dark-blue mb-2">📈 Job Outlook</h5>
                      <p className="text-gray-600">{career.job_outlook}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-dark-blue mb-2">🎓 Education Requirements</h5>
                    <p className="text-gray-600">{career.education_requirements}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-semibold text-dark-blue mb-2">🔧 Key Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {career.key_skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className="bg-soft-green/10 text-soft-green px-3 py-1 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-dark-blue mb-2">🚀 Next Steps</h5>
                    <ul className="space-y-1">
                      {career.next_steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2 text-gray-600">
                          <span className="text-soft-green mt-1">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-dark-blue mb-6">🔧 Skill Gap Analysis</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
                    ✅ Current Strengths
                  </h4>
                  <div className="space-y-2">
                    {results.skill_gap_analysis.current_skills.map((skill, index) => (
                      <div key={index} className="bg-white px-3 py-2 rounded-lg border border-green-200 text-green-700 font-medium">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                    🎯 Skills to Develop
                  </h4>
                  <div className="space-y-2">
                    {results.skill_gap_analysis.skill_gaps.map((skill, index) => (
                      <div key={index} className="bg-white px-3 py-2 rounded-lg border border-orange-200 text-orange-700 font-medium">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h4 className="text-lg font-bold text-blue-700 mb-4 flex items-center gap-2">
                  💡 Development Recommendations
                </h4>
                <ul className="space-y-3">
                  {results.skill_gap_analysis.development_recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 text-blue-700">
                      <span className="text-blue-500 mt-1">📚</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'personality' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-dark-blue mb-6">🧠 Personality Insights</h3>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
                <div className="space-y-4">
                  {Object.entries(results.personality_insights).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="text-lg font-semibold text-purple-700 capitalize mb-2">
                        {key.replace('_', ' ')}
                      </h4>
                      <div className="text-gray-700">
                        {Array.isArray(value) ? (
                          <ul className="space-y-1">
                            {value.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-dark-blue mb-6">📋 Your Action Plan</h3>
              
              <div className="space-y-4">
                {results.action_plan.map((action, index) => (
                  <div key={index} className="flex items-start gap-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300">
                    <div className="w-8 h-8 bg-soft-green rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-3xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Analysis completed on {new Date(results.generated_at).toLocaleDateString()}
            </p>
            <div className="flex gap-4">
              <button
                onClick={onStartNew}
                className="btn-secondary"
              >
                Take New Assessment
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                📄 Save Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;