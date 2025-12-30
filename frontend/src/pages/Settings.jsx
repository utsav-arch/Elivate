import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Settings as SettingsIcon, Users, Building, Bell, Shield, Database, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger value="users" className="rounded-none flex items-center space-x-2">
              <Users size={16} />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="organization" className="rounded-none flex items-center space-x-2">
              <Building size={16} />
              <span>Organization</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-none flex items-center space-x-2">
              <Bell size={16} />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none flex items-center space-x-2">
              <Shield size={16} />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="rounded-none flex items-center space-x-2">
              <Database size={16} />
              <span>Data & Export</span>
            </TabsTrigger>
          </TabsList>

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

            {/* Users Table */}
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

            {/* Add User Form */}
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

          {/* Organization Tab */}
          <TabsContent value="organization" className="p-6">
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
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Health Score Configuration</h4>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="p-4 bg-green-50 border-green-200">
                    <div className="text-sm text-green-700 font-medium">Healthy</div>
                    <div className="text-xs text-green-600 mt-1">Score ≥ 80</div>
                  </Card>
                  <Card className="p-4 bg-orange-50 border-orange-200">
                    <div className="text-sm text-orange-700 font-medium">At Risk</div>
                    <div className="text-xs text-orange-600 mt-1">Score 50-79</div>
                  </Card>
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="text-sm text-red-700 font-medium">Critical</div>
                    <div className="text-xs text-red-600 mt-1">Score &lt; 50</div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Notification Preferences</h3>
              
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
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Security Settings</h3>
              
              <Card className="p-4 bg-slate-50">
                <h4 className="font-medium text-slate-800 mb-2">Password Policy</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Minimum 8 characters</li>
                  <li>• At least one uppercase letter</li>
                  <li>• At least one number</li>
                  <li>• Password expires every 90 days</li>
                </ul>
              </Card>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-800 mb-4">Session Management</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-800">Session Timeout</div>
                    <div className="text-sm text-slate-600">Automatically log out after inactivity</div>
                  </div>
                  <select className="px-3 py-2 border border-slate-300 rounded-md">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>8 hours</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Data Management</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Database size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">Export Customers</div>
                      <div className="text-sm text-slate-600">Download all customer data as CSV</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Database size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">Export Activities</div>
                      <div className="text-sm text-slate-600">Download all activities as CSV</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-medium text-slate-800 mb-2">Data Statistics</h4>
                <div className="grid grid-cols-4 gap-4">
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">30</div>
                    <div className="text-xs text-slate-600">Customers</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">160+</div>
                    <div className="text-xs text-slate-600">Activities</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">6</div>
                    <div className="text-xs text-slate-600">Risks</div>
                  </Card>
                  <Card className="p-3 text-center">
                    <div className="text-2xl font-bold text-slate-800">20</div>
                    <div className="text-xs text-slate-600">Opportunities</div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
