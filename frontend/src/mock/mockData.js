// Mock data for GitHub Pages demo
export const mockData = {
  users: [
    {
      id: 'user_1',
      email: 'demo@careerpilot.com',
      first_name: 'Demo',
      last_name: 'User',
      is_verified: true,
      profile_picture: null,
      created_at: '2024-01-01T00:00:00Z',
      subscription_plan: 'enterprise',
      role: 'enterprise_admin'
    },
    {
      id: 'user_2',
      email: 'john.doe@company.com',
      first_name: 'John',
      last_name: 'Doe',
      is_verified: true,
      profile_picture: null,
      created_at: '2024-02-15T00:00:00Z',
      subscription_plan: 'pro',
      role: 'manager'
    },
    {
      id: 'user_3',
      email: 'sarah.wilson@company.com',
      first_name: 'Sarah',
      last_name: 'Wilson',
      is_verified: true,
      profile_picture: null,
      created_at: '2024-03-10T00:00:00Z',
      subscription_plan: 'starter',
      role: 'team_lead'
    }
  ],

  organizations: [
    {
      id: 'demo-org',
      name: 'Demo Corporation',
      domain: 'democorp.com',
      subscription_plan: 'enterprise',
      max_users: 500,
      active_users: 150,
      custom_branding: {
        logo_url: '/athena-logo.png',
        primary_color: '#17a2b8',
        secondary_color: '#20c997',
        company_name: 'Demo Corporation',
        tagline: 'Innovation Through AI'
      },
      settings: {
        sso_enabled: true,
        custom_domain: 'careers.democorp.com'
      },
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
      is_active: true
    }
  ],

  teams: [
    {
      id: 'team_1',
      organization_id: 'demo-org',
      name: 'Engineering Team',
      description: 'Software development and technical innovation',
      manager_id: 'user_2',
      team_lead_id: 'user_3',
      member_ids: ['user_4', 'user_5', 'user_6', 'user_7'],
      created_at: '2024-02-01T00:00:00Z',
      is_active: true
    },
    {
      id: 'team_2',
      organization_id: 'demo-org',
      name: 'Product Team',
      description: 'Product management and strategy',
      manager_id: 'user_2',
      member_ids: ['user_8', 'user_9', 'user_10'],
      created_at: '2024-02-15T00:00:00Z',
      is_active: true
    }
  ],

  assessments: [
    {
      id: 'assessment_1',
      user_id: 'user_1',
      responses: {
        current_role: 'Software Engineer',
        experience_years: '5',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        interests: ['AI', 'Web Development', 'Leadership'],
        goals: 'Advance to senior technical role'
      },
      analysis: {
        career_matches: [
          { role: 'Senior Software Engineer', match_percentage: 95 },
          { role: 'Technical Lead', match_percentage: 88 },
          { role: 'Solutions Architect', match_percentage: 82 }
        ],
        strengths: ['Technical Skills', 'Problem Solving', 'Communication'],
        recommendations: [
          'Pursue cloud architecture certification',
          'Develop team leadership experience',
          'Contribute to open source projects'
        ]
      },
      completed_at: '2024-06-01T00:00:00Z'
    }
  ],

  roadmaps: [
    {
      id: 'roadmap_1',
      user_id: 'user_1',
      title: 'Path to Senior Engineer',
      description: 'Comprehensive roadmap for advancing to senior engineering role',
      items: [
        {
          id: 'item_1',
          title: 'Complete AWS Solutions Architect Certification',
          description: 'Gain cloud expertise with industry-recognized certification',
          status: 'completed',
          target_date: '2024-03-15',
          order_index: 1
        },
        {
          id: 'item_2',
          title: 'Lead Technical Project',
          description: 'Take ownership of a significant technical initiative',
          status: 'in_progress',
          target_date: '2024-08-30',
          order_index: 2
        },
        {
          id: 'item_3',
          title: 'Mentor Junior Developers',
          description: 'Guide and support 2-3 junior team members',
          status: 'pending',
          target_date: '2024-10-15',
          order_index: 3
        },
        {
          id: 'item_4',
          title: 'Present at Tech Conference',
          description: 'Share expertise through public speaking',
          status: 'pending',
          target_date: '2024-12-01',
          order_index: 4
        }
      ],
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z'
    }
  ],

  chats: [
    {
      id: 'chat_1',
      user_id: 'user_1',
      session_id: 'session_1',
      messages: [
        {
          role: 'user',
          content: 'I want to become a senior engineer. What should I focus on?',
          timestamp: '2024-06-01T10:00:00Z'
        },
        {
          role: 'assistant',
          content: 'Great goal! Based on your current experience, I recommend focusing on three key areas: 1) Technical depth - master advanced concepts in your primary technology stack, 2) Leadership skills - start mentoring junior developers and leading small projects, and 3) Business impact - learn to communicate technical decisions in business terms. Would you like me to create a detailed roadmap for any of these areas?',
          timestamp: '2024-06-01T10:00:15Z'
        }
      ],
      created_at: '2024-06-01T10:00:00Z',
      updated_at: '2024-06-01T10:05:00Z'
    },
    {
      id: 'chat_2',
      user_id: 'user_1',
      session_id: 'session_2',
      messages: [
        {
          role: 'user',
          content: 'What certifications would be most valuable for my career?',
          timestamp: '2024-06-02T14:30:00Z'
        },
        {
          role: 'assistant',
          content: 'Based on your software engineering background, I\'d recommend these high-impact certifications: 1) AWS Solutions Architect (most in-demand), 2) Google Cloud Professional Developer, 3) Certified Kubernetes Administrator if you work with containers. These align with current market demands and can increase your salary potential by 15-25%. Which cloud platform does your company primarily use?',
          timestamp: '2024-06-02T14:30:20Z'
        }
      ],
      created_at: '2024-06-02T14:30:00Z',
      updated_at: '2024-06-02T14:35:00Z'
    }
  ],

  assessmentQuestions: [
    {
      id: 'current_role',
      question: 'What is your current role or position?',
      type: 'text',
      options: null,
      category: 'background'
    },
    {
      id: 'experience_level',
      question: 'How many years of professional experience do you have?',
      type: 'radio',
      options: [
        '0-1 years (Entry level)',
        '2-4 years (Junior)',
        '5-7 years (Mid-level)',
        '8-12 years (Senior)',
        '13+ years (Expert/Lead)'
      ],
      category: 'background'
    },
    {
      id: 'industry_interest',
      question: 'Which industries interest you most?',
      type: 'checkbox',
      options: [
        'Technology & Software',
        'Finance & Banking',
        'Healthcare & Biotech',
        'Education',
        'E-commerce & Retail',
        'Manufacturing',
        'Consulting',
        'Media & Entertainment',
        'Non-profit',
        'Government'
      ],
      category: 'interests'
    },
    {
      id: 'technical_skills',
      question: 'Which technical skills do you currently have?',
      type: 'text',
      options: null,
      category: 'skills'
    },
    {
      id: 'career_goals',
      question: 'What are your primary career goals?',
      type: 'checkbox',
      options: [
        'Advance to leadership role',
        'Increase salary significantly',
        'Change industries/career path',
        'Achieve better work-life balance',
        'Start my own business',
        'Become a subject matter expert',
        'Work remotely/flexible schedule',
        'Make greater social impact'
      ],
      category: 'goals'
    },
    {
      id: 'preferred_work_style',
      question: 'What work environment do you prefer?',
      type: 'radio',
      options: [
        'Large corporation with structure',
        'Mid-size company with growth',
        'Startup with innovation',
        'Remote-first organization',
        'Consulting/freelance work',
        'Non-profit/mission-driven'
      ],
      category: 'preferences'
    },
    {
      id: 'learning_preference',
      question: 'How do you prefer to learn new skills?',
      type: 'checkbox',
      options: [
        'Online courses and tutorials',
        'Hands-on projects and practice',
        'Mentorship and coaching',
        'Reading books and documentation',
        'Attending workshops/conferences',
        'Learning from colleagues',
        'Trial and error experimentation'
      ],
      category: 'learning'
    },
    {
      id: 'timeline',
      question: 'What is your timeline for career advancement?',
      type: 'radio',
      options: [
        'Within 6 months',
        '6-12 months',
        '1-2 years',
        '2-3 years',
        '3+ years',
        'No specific timeline'
      ],
      category: 'timeline'
    }
  ],

  pricingPlans: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started with career planning',
      features: [
        'Basic career assessment',
        'Limited AI chat sessions',
        'Basic roadmap creation',
        'Profile management'
      ],
      popular: false,
      badge: null
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      period: 'month',
      description: 'Ideal for individual career development',
      features: [
        'Complete career assessment',
        'Unlimited AI chat with Athena',
        'Advanced roadmap planning',
        'Progress tracking',
        'Skills development suggestions',
        'Email support'
      ],
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      period: 'month',
      description: 'For serious career advancement',
      features: [
        'Everything in Starter',
        'Advanced analytics',
        'Custom roadmap templates',
        'Priority AI responses',
        'Industry-specific insights',
        'Career coaching sessions',
        'Priority support'
      ],
      popular: false,
      badge: 'Best Value'
    },
    {
      id: 'student',
      name: 'Student',
      price: 4.99,
      period: 'month',
      description: 'Special pricing for students',
      features: [
        'Complete career assessment',
        'AI career guidance',
        'Student-focused roadmaps',
        'Internship guidance',
        'Academic integration',
        'Student community access'
      ],
      popular: false,
      badge: 'Student Discount'
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: 199,
      period: 'one-time',
      description: 'Unlimited access forever',
      features: [
        'Everything in Pro',
        'Lifetime updates',
        'Exclusive features',
        'VIP support',
        'Beta access to new features',
        'Career coaching credits'
      ],
      popular: false,
      badge: 'Best Deal'
    }
  ]
};

export default mockData;