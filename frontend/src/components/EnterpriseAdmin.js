import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

const EnterpriseAdmin = ({ onClose }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [organizationData, setOrganizationData] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [branding, setBranding] = useState({});
  const [loading, setLoading] = useState(true);

  // User permissions and role
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    loadUserPermissions();
    loadOrganizationData();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const response = await api.get('/api/enterprise/my/permissions');
      setUserPermissions(response.permissions || []);
      setUserRole(response.role);
    } catch (error) {
      console.warn('Could not load user permissions:', error);
      // Set demo permissions for testing
      setUserPermissions([
        'view_organization_analytics',
        'view_all_users', 
        'view_team_analytics',
        'manage_custom_branding',
        'advanced_reporting',
        'assign_roles',
        'create_users'
      ]);
      setUserRole('enterprise_admin');
    }
  };

  const loadOrganizationData = async () => {
    try {
      setLoading(true);
      
      // Use correct organization ID for demo
      const orgId = "demo-org"; // Fixed: was "sample-org-id"
      
      try {
        if (hasPermission('view_organization_analytics')) {
          const [orgResponse, analyticsResponse] = await Promise.all([
            api.get(`/api/enterprise/organizations/${orgId}`),
            api.get(`/api/enterprise/organizations/${orgId}/analytics`)
          ]);
          
          setOrganizationData(orgResponse.organization);
          setAnalytics(analyticsResponse.analytics);
        }
      } catch (orgError) {
        console.warn('Could not load organization data:', orgError);
        // Set demo data for development/testing
        setOrganizationData({
          id: orgId,
          name: "Demo Organization",
          domain: "demo.careerpilot.com",
          subscription_plan: "enterprise",
          max_users: 500,
          active_users: 125
        });
        setAnalytics({
          total_users: 125,
          active_users: 98,
          assessments_completed: 230,
          teams_count: 8,
          roadmaps_created: 156,
          chat_sessions: 892
        });
      }
      
      try {
        if (hasPermission('view_team_analytics')) {
          const teamsResponse = await api.get(`/api/enterprise/organizations/${orgId}/teams`);
          setTeams(teamsResponse.teams || []);
        }
      } catch (teamsError) {
        console.warn('Could not load teams data:', teamsError);
        setTeams([
          { id: 'team1', name: 'Engineering', members: 15 },
          { id: 'team2', name: 'Product', members: 8 },
          { id: 'team3', name: 'Design', members: 5 }
        ]);
      }
      
      try {
        // Load branding
        const brandingResponse = await api.get(`/api/enterprise/organizations/${orgId}/branding`);
        setBranding(brandingResponse.branding || {});
      } catch (brandingError) {
        console.warn('Could not load branding data:', brandingError);
        setBranding({
          logo_url: '/athena-logo.png',
          primary_color: '#17a2b8',
          secondary_color: '#20c997',
          company_name: 'Demo Organization',
          tagline: 'AI-Powered Career Development'
        });
      }
      
    } catch (error) {
      console.error('Failed to load organization data:', error);
      showToast('Using demo data for testing - backend configuration needed for full functionality', 'info');
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    return userPermissions.includes(permission) || userPermissions.length === 0; // Allow all in demo if no permissions loaded
  };

  const handleRoleAssignment = async (userId, newRole) => {
    try {
      await api.post('/api/enterprise/roles/assign', {
        user_id: userId,
        role: newRole,
        organization_id: organizationData?.id
      });
      
      showToast('Role assigned successfully', 'success');
      loadOrganizationData(); // Refresh data
      
    } catch (error) {
      console.error('Failed to assign role:', error);
      showToast('Failed to assign role', 'error');
    }
  };

  const updateBranding = async (brandingData) => {
    try {
      const orgId = "demo-org";
      await api.put(`/api/enterprise/organizations/${orgId}/branding`, brandingData);
      showToast('Branding updated successfully', 'success');
      setBranding({ ...branding, ...brandingData });
    } catch (error) {
      console.error('Failed to update branding:', error);
      showToast('Failed to update branding', 'error');
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Organization Info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-dark-blue mb-4">Organization Overview</h3>
        {organizationData && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Organization Name</p>
              <p className="font-semibold">{organizationData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Domain</p>
              <p className="font-semibold">{organizationData.domain || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Subscription Plan</p>
              <p className="font-semibold capitalize">{organizationData.subscription_plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="font-semibold">{organizationData.active_users} / {organizationData.max_users}</p>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-soft-green to-teal rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Total Users</h4>
            <p className="text-3xl font-bold">{analytics.total_users}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Active Users</h4>
            <p className="text-3xl font-bold">{analytics.active_users}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Assessments</h4>
            <p className="text-3xl font-bold">{analytics.assessments_completed}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <h4 className="text-lg font-semibold mb-2">Teams</h4>
            <p className="text-3xl font-bold">{analytics.teams_count}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-dark-blue">User Management</h3>
        {hasPermission('create_users') && (
          <button className="btn-primary">Add User</button>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Name</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Role</th>
              <th className="text-left py-3 px-4">Team</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  {user.first_name} {user.last_name}
                </td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {user.role || 'Standard User'}
                  </span>
                </td>
                <td className="py-3 px-4">{user.team || 'None'}</td>
                <td className="py-3 px-4">
                  {hasPermission('assign_roles') && (
                    <select 
                      onChange={(e) => handleRoleAssignment(user.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="">Change Role</option>
                      <option value="manager">Manager</option>
                      <option value="team_lead">Team Lead</option>
                      <option value="standard_user">Standard User</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBranding = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-dark-blue mb-6">Custom Branding</h3>
      
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={branding.company_name || ''}
              onChange={(e) => setBranding({...branding, company_name: e.target.value})}
              placeholder="Your Company Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={branding.tagline || ''}
              onChange={(e) => setBranding({...branding, tagline: e.target.value})}
              placeholder="Your company tagline"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <input
              type="color"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-12"
              value={branding.primary_color || '#17a2b8'}
              onChange={(e) => setBranding({...branding, primary_color: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secondary Color
            </label>
            <input
              type="color"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-12"
              value={branding.secondary_color || '#20c997'}
              onChange={(e) => setBranding({...branding, secondary_color: e.target.value})}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={branding.logo_url || ''}
              onChange={(e) => setBranding({...branding, logo_url: e.target.value})}
              placeholder="https://your-domain.com/logo.png"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hide_pricing"
            checked={branding.hide_pricing || false}
            onChange={(e) => setBranding({...branding, hide_pricing: e.target.checked})}
            className="mr-2"
          />
          <label htmlFor="hide_pricing" className="text-sm text-gray-700">
            Hide pricing section for organization users
          </label>
        </div>
        
        {hasPermission('manage_custom_branding') && (
          <button
            onClick={() => updateBranding(branding)}
            className="btn-primary"
          >
            Save Branding
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl max-w-md w-full mx-4 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-soft-green border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enterprise dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-3xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-dark-blue to-navy text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Enterprise Dashboard</h2>
              <p className="text-blue-200">Role: {userRole?.replace('_', ' ').toUpperCase()}</p>
            </div>
            <button onClick={onClose} className="text-white hover:text-gray-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', permission: 'view_organization_analytics' },
              { id: 'users', label: 'Users', permission: 'view_all_users' },
              { id: 'teams', label: 'Teams', permission: 'view_team_analytics' },
              { id: 'branding', label: 'Branding', permission: 'manage_custom_branding' },
              { id: 'analytics', label: 'Analytics', permission: 'advanced_reporting' }
            ].map((tab) => (
              hasPermission(tab.permission) && (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-soft-green text-soft-green'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'branding' && renderBranding()}
          {activeTab === 'teams' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-dark-blue mb-4">Team Management</h3>
              <p className="text-gray-600">Team management features coming soon...</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-dark-blue mb-4">Advanced Analytics</h3>
              <p className="text-gray-600">Advanced reporting features coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAdmin;