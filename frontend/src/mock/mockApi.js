// Mock API for GitHub Pages deployment
import { mockData } from './mockData';

class MockAPI {
  constructor() {
    this.baseURL = '';
    this.isDemo = true;
    this.currentUser = null;
    this.authToken = null;
    
    // Initialize demo data in localStorage if not exists
    this.initializeDemoData();
  }

  initializeDemoData() {
    if (!localStorage.getItem('careerpilot_demo_initialized')) {
      // Set up initial demo data
      localStorage.setItem('careerpilot_users', JSON.stringify(mockData.users));
      localStorage.setItem('careerpilot_organizations', JSON.stringify(mockData.organizations));
      localStorage.setItem('careerpilot_assessments', JSON.stringify(mockData.assessments));
      localStorage.setItem('careerpilot_roadmaps', JSON.stringify(mockData.roadmaps));
      localStorage.setItem('careerpilot_chats', JSON.stringify(mockData.chats));
      localStorage.setItem('careerpilot_demo_initialized', 'true');
    }
  }

  // Simulate network delay
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication endpoints
  async post(endpoint, data) {
    await this.delay();

    switch(endpoint) {
      case '/api/auth/register':
        return this.handleRegister(data);
      case '/api/auth/login':
        return this.handleLogin(data);
      case '/api/auth/google/callback':
        return this.handleGoogleAuth(data);
      case '/api/enterprise/roles/assign':
        return this.handleRoleAssign(data);
      case '/api/enterprise/organizations':
        return this.handleCreateOrganization(data);
      case '/api/chat/start':
        return this.handleChatStart(data);
      case '/api/chat/message':
        return this.handleChatMessage(data);
      case '/api/assessment/start':
        return this.handleAssessmentStart();
      case '/api/assessment/submit':
        return this.handleAssessmentSubmit(data);
      case '/api/enterprise/organizations/' + (data?.organization_id || 'demo-org') + '/bulk-operations':
        return this.handleBulkOperations(data);
      default:
        return { message: `Mock POST ${endpoint} - Success` };
    }
  }

  async get(endpoint) {
    await this.delay();

    switch(endpoint) {
      case '/api/':
        return { message: 'CareerPilot API Demo - All systems operational' };
      case '/api/user/dashboard':
        return this.getUserDashboard();
      case '/api/user/profile':
        return this.getUserProfile();
      case '/api/auth/google/login':
        return this.getGoogleAuthURL();
      case '/api/oauth/profile':
        return this.getOAuthProfile();
      case '/api/enterprise/my/permissions':
        return this.getUserPermissions();
      case '/api/enterprise/organizations':
        return this.getOrganizations();
      case '/api/enterprise/organizations/demo-org':
        return this.getOrganization('demo-org');
      case '/api/enterprise/organizations/demo-org/branding':
        return this.getOrganizationBranding('demo-org');
      case '/api/enterprise/organizations/demo-org/teams':
        return this.getOrganizationTeams('demo-org');
      case '/api/enterprise/organizations/demo-org/analytics':
        return this.getOrganizationAnalytics('demo-org');
      case '/api/assessment/questions':
        return this.getAssessmentQuestions();
      case '/api/payment/plans':
        return this.getPaymentPlans();
      default:
        if (endpoint.includes('/api/users/') && endpoint.includes('/roles')) {
          return this.getUserRoles(endpoint);
        }
        return { message: `Mock GET ${endpoint} - Success` };
    }
  }

  async put(endpoint, data) {
    await this.delay();

    switch(endpoint) {
      case '/api/user/profile':
        return this.updateUserProfile(data);
      default:
        if (endpoint.includes('/branding')) {
          return this.updateOrganizationBranding(data);
        }
        return { message: `Mock PUT ${endpoint} - Success` };
    }
  }

  async delete(endpoint) {
    await this.delay();
    return { message: `Mock DELETE ${endpoint} - Success` };
  }

  // Mock Authentication
  handleRegister(data) {
    const users = JSON.parse(localStorage.getItem('careerpilot_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }

    const newUser = {
      id: 'user_' + Date.now(),
      email: data.email,
      first_name: data.first_name || data.firstName,
      last_name: data.last_name || data.lastName,
      is_verified: true, // Auto-verify in demo
      created_at: new Date().toISOString(),
      subscription_plan: 'free',
      profile_picture: null
    };

    users.push(newUser);
    localStorage.setItem('careerpilot_users', JSON.stringify(users));

    // Create auth token
    this.authToken = 'demo_token_' + newUser.id;
    this.currentUser = newUser;
    localStorage.setItem('careerpilot_auth_token', this.authToken);
    localStorage.setItem('careerpilot_current_user', JSON.stringify(newUser));

    return {
      message: 'Registration successful',
      user: newUser,
      token: this.authToken
    };
  }

  handleLogin(data) {
    const users = JSON.parse(localStorage.getItem('careerpilot_users') || '[]');
    const user = users.find(u => u.email === data.email);

    if (!user) {
      throw new Error('User not found');
    }

    // Create auth token
    this.authToken = 'demo_token_' + user.id;
    this.currentUser = user;
    localStorage.setItem('careerpilot_auth_token', this.authToken);
    localStorage.setItem('careerpilot_current_user', JSON.stringify(user));

    return {
      message: 'Login successful',
      user: user,
      token: this.authToken
    };
  }

  handleGoogleAuth(data) {
    // Simulate Google OAuth success
    const mockGoogleUser = {
      id: 'google_user_' + Date.now(),
      email: 'demo@google.com',
      first_name: 'Demo',
      last_name: 'User',
      is_verified: true,
      profile_picture: 'https://via.placeholder.com/100',
      created_at: new Date().toISOString(),
      subscription_plan: 'free'
    };

    this.authToken = 'demo_token_' + mockGoogleUser.id;
    this.currentUser = mockGoogleUser;
    localStorage.setItem('careerpilot_auth_token', this.authToken);
    localStorage.setItem('careerpilot_current_user', JSON.stringify(mockGoogleUser));

    return {
      message: 'Google OAuth successful',
      user: mockGoogleUser,
      session_token: this.authToken
    };
  }

  getUserDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('careerpilot_current_user') || '{}');
    
    return {
      user: currentUser,
      profile_completion: 75,
      stats: {
        assessments_completed: 3,
        roadmaps_created: 2,
        chat_sessions: 12,
        skills_identified: 15
      },
      recent_chats: mockData.chats.slice(0, 3),
      upcoming_roadmap_items: mockData.roadmaps[0]?.items.slice(0, 3) || []
    };
  }

  getUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('careerpilot_current_user') || '{}');
    
    return {
      id: currentUser.id,
      user_id: currentUser.id,
      email: currentUser.email,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      current_role: 'Senior Developer',
      years_experience: 5,
      location: 'San Francisco, CA',
      website: 'https://example.com',
      bio: 'Passionate about technology and career development.',
      career_goals: 'Advance to technical leadership role within 2 years.',
      created_at: currentUser.created_at,
      updated_at: new Date().toISOString()
    };
  }

  getGoogleAuthURL() {
    return {
      auth_url: '#demo-google-oauth',
      state: 'demo_state'
    };
  }

  getOAuthProfile() {
    const currentUser = JSON.parse(localStorage.getItem('careerpilot_current_user') || '{}');
    
    return {
      user: currentUser,
      profile: this.getUserProfile(),
      session_valid: true
    };
  }

  getUserPermissions() {
    const currentUser = JSON.parse(localStorage.getItem('careerpilot_current_user') || '{}');
    
    // Demo user gets enterprise admin permissions
    return {
      user_id: currentUser.id,
      organization_id: 'demo-org',
      role: 'enterprise_admin',
      permissions: [
        'create_users',
        'edit_users',
        'delete_users',
        'view_all_users',
        'assign_roles',
        'manage_organization',
        'view_organization_analytics',
        'manage_custom_branding',
        'manage_billing',
        'view_billing',
        'bulk_operations',
        'advanced_reporting'
      ]
    };
  }

  getOrganizations() {
    return {
      organizations: mockData.organizations
    };
  }

  getOrganization(orgId) {
    const org = mockData.organizations.find(o => o.id === orgId) || mockData.organizations[0];
    return {
      organization: org
    };
  }

  getOrganizationBranding(orgId) {
    return {
      branding: {
        logo_url: '/athena-logo.png',
        primary_color: '#17a2b8',
        secondary_color: '#20c997',
        company_name: 'Demo Company',
        tagline: 'Powered by AI',
        hide_pricing: false
      }
    };
  }

  getOrganizationTeams(orgId) {
    return {
      teams: mockData.teams
    };
  }

  getOrganizationAnalytics(orgId) {
    return {
      analytics: {
        organization_id: orgId,
        period: 'monthly',
        total_users: 150,
        active_users: 120,
        new_users: 25,
        assessments_completed: 200,
        roadmaps_created: 85,
        chat_sessions: 450,
        avg_profile_completion: 78.5,
        avg_roadmap_progress: 65.2,
        teams_count: 8,
        feature_usage: {
          assessments: 85,
          roadmaps: 70,
          chat: 95,
          profiles: 88
        },
        generated_at: new Date().toISOString()
      }
    };
  }

  getAssessmentQuestions() {
    return {
      questions: mockData.assessmentQuestions
    };
  }

  getPaymentPlans() {
    return {
      plans: mockData.pricingPlans
    };
  }

  handleChatStart() {
    return {
      session_id: 'chat_' + Date.now(),
      message: 'Hello! I\'m Athena, your AI career advisor. How can I help you today?'
    };
  }

  handleChatMessage(data) {
    // Simple AI response simulation
    const responses = [
      "That's a great question! Based on your background, I'd recommend focusing on developing your leadership skills.",
      "I understand your career goals. Let me suggest some specific steps you can take.",
      "Your experience in that area is valuable. Have you considered exploring related fields?",
      "That's an excellent career move. Here are some resources that might help:",
      "I can see you're passionate about growth. Let's create a roadmap for your next steps."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      response: randomResponse,
      suggestions: [
        'Tell me more about your current role',
        'What are your long-term career goals?',
        'Would you like help creating a career roadmap?'
      ]
    };
  }

  handleAssessmentStart() {
    return {
      assessment_id: 'assessment_' + Date.now(),
      message: 'Assessment started successfully'
    };
  }

  handleAssessmentSubmit(data) {
    // Mock AI-powered career analysis
    return {
      analysis: {
        career_matches: [
          { role: 'Senior Software Engineer', match_percentage: 92 },
          { role: 'Technical Lead', match_percentage: 88 },
          { role: 'Product Manager', match_percentage: 75 }
        ],
        strengths: ['Problem Solving', 'Technical Skills', 'Communication'],
        recommendations: [
          'Consider pursuing advanced certifications',
          'Develop leadership experience',
          'Expand network in target industry'
        ],
        next_steps: [
          'Complete skills assessment',
          'Create detailed career roadmap',
          'Schedule regular progress reviews'
        ]
      }
    };
  }

  // Additional mock methods
  updateUserProfile(data) {
    const currentUser = JSON.parse(localStorage.getItem('careerpilot_current_user') || '{}');
    const updatedUser = { ...currentUser, ...data, updated_at: new Date().toISOString() };
    localStorage.setItem('careerpilot_current_user', JSON.stringify(updatedUser));
    
    return {
      message: 'Profile updated successfully',
      profile: updatedUser
    };
  }

  handleRoleAssign(data) {
    return {
      message: `Role ${data.role} assigned successfully to user ${data.user_id}`
    };
  }

  handleCreateOrganization(data) {
    return {
      message: 'Organization created successfully',
      organization_id: 'org_' + Date.now(),
      admin_user_id: 'admin_' + Date.now()
    };
  }

  updateOrganizationBranding(data) {
    return {
      message: 'Branding updated successfully'
    };
  }

  getUserRoles(endpoint) {
    return {
      roles: [
        {
          id: 'role_1',
          user_id: 'user_1',
          role: 'enterprise_admin',
          organization_id: 'demo-org',
          assigned_at: new Date().toISOString(),
          is_active: true
        }
      ]
    };
  }

  handleBulkOperations(data) {
    return {
      message: `Bulk operation ${data.operation} completed`,
      results: data.user_data.map((_, index) => ({
        status: 'success',
        user_id: `bulk_user_${index + 1}`
      }))
    };
  }
}

// Create singleton instance
export const mockApi = new MockAPI();

// Export for use in components
export default mockApi;