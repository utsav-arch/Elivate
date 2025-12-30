import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Settings as SettingsIcon, Users, Building, Bell, Shield, Database, 
  Plus, Edit, Trash2, Key, ListTree, Tag, FileText, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CSM'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/auth/register`, userFormData);
      toast.success('User created successfully');
      setShowUserForm(false);
      setUserFormData({ name: '', email: '', password: '', role: 'CSM' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'CSM': return 'bg-blue-100 text-blue-700';
      case 'AM': return 'bg-green-100 text-green-700';
      case 'CS_LEADER': return 'bg-orange-100 text-orange-700';
      case 'CS_OPS': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Field Configuration Data
  const fieldConfigs = {
    customer: [
      { name: 'Company Name', type: 'Text', required: true, editable: false },
      { name: 'Industry', type: 'Dropdown', required: false, editable: true },
      { name: 'Region', type: 'Dropdown', required: false, editable: true },
      { name: 'ARR', type: 'Currency', required: false, editable: true },
      { name: 'One-time Setup Cost', type: 'Currency', required: false, editable: true },
      { name: 'Quarterly Consumption Cost', type: 'Currency', required: false, editable: true },
      { name: 'Health Score', type: 'Number', required: false, editable: true },
    ],
    activity: [
      { name: 'Activity Type', type: 'Dropdown', required: true, editable: true },
      { name: 'Title', type: 'Text', required: true, editable: true },
      { name: 'Summary', type: 'Long Text', required: true, editable: true },
      { name: 'Sentiment', type: 'Dropdown', required: false, editable: true },
    ],
    risk: [
      { name: 'Category', type: 'Dropdown', required: true, editable: true },
      { name: 'Severity', type: 'Dropdown', required: true, editable: true },
      { name: 'Status', type: 'Dropdown', required: true, editable: true },
      { name: 'Churn Probability', type: 'Percentage', required: false, editable: true },
    ],
    opportunity: [
      { name: 'Type', type: 'Dropdown', required: true, editable: true },
      { name: 'Stage', type: 'Dropdown', required: true, editable: true },
      { name: 'Value', type: 'Currency', required: false, editable: true },
      { name: 'Probability', type: 'Percentage', required: true, editable: true },
    ],
    task: [
      { name: 'Task Type', type: 'Dropdown', required: true, editable: true },
      { name: 'Priority', type: 'Dropdown', required: true, editable: true },
      { name: 'Status', type: 'Dropdown', required: true, editable: true },
      { name: 'Due Date', type: 'Date', required: true, editable: true },
    ],
  };

  // Dropdown Management Data
  const dropdowns = [
    { name: 'Activity Types', count: 15, values: ['Weekly Sync', 'QBR', 'MBR', 'Phone Call', 'Email', '...'] },
    { name: 'Risk Categories', count: 7, values: ['Product Usage', 'Onboarding', 'Support', 'Relationship', '...'] },
    { name: 'Opportunity Stages', count: 6, values: ['Identified', 'Qualified', 'Proposal', 'Negotiation', '...'] },
    { name: 'Task Priorities', count: 4, values: ['Critical', 'High', 'Medium', 'Low'] },
    { name: 'Industries', count: 18, values: ['Technology', 'Banking', 'Fintech', 'E-commerce', '...'] },
    { name: 'Regions', count: 5, values: ['South India', 'West India', 'North India', 'East India', 'Global'] },
  ];

  return (
    <div className="px-6 py-8 space-y-6" data-testid="settings-page">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <SettingsIcon size={24} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-600">Manage your platform configuration</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-white border-slate-200">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 flex-wrap">
            <TabsTrigger value="general" className="rounded-none flex items-center space-x-2">
              <SettingsIcon size={16} />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-none flex items-center space-x-2">
              <Users size={16} />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-none flex items-center space-x-2">
              <Key size={16} />
              <span>Roles & Permissions</span>
            </TabsTrigger>
            <TabsTrigger value="fields" className="rounded-none flex items-center space-x-2">
              <ListTree size={16} />
              <span>Field Configuration</span>
            </TabsTrigger>
            <TabsTrigger value="dropdowns" className="rounded-none flex items-center space-x-2">
              <ChevronRight size={16} />
              <span>Dropdowns</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="rounded-none flex items-center space-x-2">
              <Tag size={16} />
              <span>Tags</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="rounded-none flex items-center space-x-2">
              <FileText size={16} />
              <span>Templates</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Organization Settings</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="Convin.ai" />
                  </div>
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input defaultValue="convin.ai" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                      <option value="INR">₹ Indian Rupee (INR)</option>
                      <option value="USD">$ US Dollar (USD)</option>
                      <option value="EUR">€ Euro (EUR)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Health Score Configuration</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-sm text-green-700 font-medium">Healthy</div>
                    <div className="text-xs text-green-600 mt-1">Score ≥ 80</div>
                    <Input type="number" defaultValue={80} className="mt-2" />
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="text-sm text-orange-700 font-medium">At Risk</div>
                    <div className="text-xs text-orange-600 mt-1">Score 50-79</div>
                    <Input type="number" defaultValue={50} className="mt-2" />
                  </Card>
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="text-sm text-red-700 font-medium">Critical</div>
                    <div className="text-xs text-red-600 mt-1">Score &lt; 50</div>
                    <Input type="number" defaultValue={50} className="mt-2" disabled />
                  </Card>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Notification Settings</h4>
                <div className="space-y-4">
                  {[
                    { title: 'Health Status Changes', desc: 'Get notified when customer health changes' },
                    { title: 'Task Reminders', desc: 'Receive reminders for upcoming and overdue tasks' },
                    { title: 'Risk Alerts', desc: 'Get alerts when new risks are flagged' },
                    { title: 'Renewal Reminders', desc: 'Notifications for upcoming contract renewals' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div>
                        <div className="font-medium text-slate-800">{item.title}</div>
                        <div className="text-sm text-slate-600">{item.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Team Members</h3>
                <p className="text-sm text-slate-600">{users.length} users in your organization</p>
              </div>
              <Button
                onClick={() => setShowUserForm(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add User</span>
              </Button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleBadgeClass(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          <Edit size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {showUserForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Add New User</h3>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={userFormData.name}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role *</Label>
                      <select
                        id="role"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md"
                        value={userFormData.role}
                        onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      >
                        <option value="CSM">Customer Success Manager (CSM)</option>
                        <option value="AM">Account Manager (AM)</option>
                        <option value="CS_LEADER">CS Leadership</option>
                        <option value="CS_OPS">CS Operations</option>
                        <option value="ADMIN">Administrator</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowUserForm(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Create User
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Roles & Permissions Tab */}
          <TabsContent value="roles" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Roles & Permissions</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { role: 'ADMIN', name: 'Administrator', desc: 'Full access to all features and settings', color: 'purple' },
                  { role: 'CSM', name: 'Customer Success Manager', desc: 'Manage assigned customers, activities, tasks', color: 'blue' },
                  { role: 'AM', name: 'Account Manager', desc: 'View customers, manage opportunities and renewals', color: 'green' },
                  { role: 'CS_LEADER', name: 'CS Leadership', desc: 'View all customers, reports, team performance', color: 'orange' },
                  { role: 'CS_OPS', name: 'CS Operations', desc: 'Manage settings, configurations, reports', color: 'yellow' },
                ].map((r, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge className={`bg-${r.color}-100 text-${r.color}-700`}>{r.role}</Badge>
                          <span className="font-medium text-slate-800">{r.name}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{r.desc}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Field Configuration Tab */}
          <TabsContent value="fields" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Field Configuration</h3>
              <p className="text-sm text-slate-600">Configure fields for different entities in your CRM</p>
              
              <Tabs defaultValue="customer" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="customer">Customer Fields</TabsTrigger>
                  <TabsTrigger value="activity">Activity Fields</TabsTrigger>
                  <TabsTrigger value="risk">Risk Fields</TabsTrigger>
                  <TabsTrigger value="opportunity">Opportunity Fields</TabsTrigger>
                  <TabsTrigger value="task">Task Fields</TabsTrigger>
                </TabsList>

                {Object.entries(fieldConfigs).map(([key, fields]) => (
                  <TabsContent key={key} value={key}>
                    <Card>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Field Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Required</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Editable</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {fields.map((field, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">{field.name}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">
                                  <Badge variant="outline">{field.type}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                  {field.required ? (
                                    <span className="text-green-600">✓</span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  {field.editable ? (
                                    <span className="text-green-600">✓</span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <Button variant="ghost" size="sm">
                                    <Edit size={14} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                    <Button className="mt-4" variant="outline">
                      <Plus size={16} className="mr-2" />
                      Add Custom Field
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </TabsContent>

          {/* Dropdown Management Tab */}
          <TabsContent value="dropdowns" className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Dropdown Management</h3>
                  <p className="text-sm text-slate-600">Manage dropdown values for various fields</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Add Dropdown
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dropdowns.map((dd, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800">{dd.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{dd.count} values</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {dd.values.slice(0, 4).map((v, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Tags Management Tab */}
          <TabsContent value="tags" className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Tags Management</h3>
                  <p className="text-sm text-slate-600">Create and manage tags for organizing customers</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus size={16} className="mr-2" />
                  Add Tag
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {['Enterprise', 'SMB', 'Strategic', 'High Touch', 'Tech Touch', 'At Risk', 'Champion', 'Expansion Ready', 'Renewal Due', 'Upsell Target'].map((tag, idx) => (
                  <Badge key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200">
                    {tag}
                    <button className="ml-2 text-blue-500 hover:text-blue-700">×</button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Templates</h3>
              <p className="text-sm text-slate-600">Manage templates for activities, reports, tasks, and documents</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Activity Templates', icon: '📋', count: 5, examples: ['QBR Template', 'Weekly Sync Notes', 'Onboarding Call'] },
                  { name: 'Report Templates', icon: '📊', count: 3, examples: ['Monthly Report', 'QBR Deck', 'Health Summary'] },
                  { name: 'Task Templates', icon: '✅', count: 4, examples: ['Onboarding Checklist', 'Renewal Prep', 'Risk Mitigation'] },
                  { name: 'Document Templates', icon: '📄', count: 6, examples: ['SOW Template', 'NDA Template', 'Contract Amendment'] },
                ].map((t, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{t.icon}</span>
                          <h4 className="font-medium text-slate-800">{t.name}</h4>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{t.count} templates</p>
                        <div className="mt-2 space-y-1">
                          {t.examples.map((ex, i) => (
                            <div key={i} className="text-xs text-slate-500">• {ex}</div>
                          ))}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit size={16} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
