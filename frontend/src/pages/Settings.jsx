import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { User, Building, Bell, Shield, Link2, Check, X, Settings as SettingsIcon, RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  { id: 'intercom', name: 'Intercom', icon: '💬', status: 'inactive', description: 'Customer messaging' },
  { id: 'jira', name: 'Jira', icon: '📋', status: 'active', description: 'Issue tracking' },
  { id: 'gmail', name: 'Gmail', icon: '📧', status: 'inactive', description: 'Email sync' },
  { id: 'calendar', name: 'Google Calendar', icon: '📅', status: 'active', description: 'Meeting sync' },
  { id: 'freshdesk', name: 'Freshdesk', icon: '🎫', status: 'inactive', description: 'Support tickets' },
  { id: 'slack', name: 'Slack', icon: '💼', status: 'active', description: 'Team notifications' },
  { id: 'cliq', name: 'Zoho Cliq', icon: '💭', status: 'inactive', description: 'Team messaging' }
];

const SYNC_LOGS = [
  { integration: 'Slack', action: 'Notification sent', timestamp: '10:30 AM', status: 'success' },
  { integration: 'Jira', action: 'Issue created', timestamp: '10:25 AM', status: 'success' },
  { integration: 'Calendar', action: 'Meeting synced', timestamp: '10:20 AM', status: 'success' },
  { integration: 'Slack', action: 'Channel update', timestamp: '10:15 AM', status: 'failed' },
];

export default function Settings() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [showLogs, setShowLogs] = useState(false);
  const [orgSettings, setOrgSettings] = useState({
    company_name: 'Convin.ai',
    currency: 'INR',
    date_format: 'DD/MM/YYYY',
    timezone: 'Asia/Kolkata'
  });
  const [notifSettings, setNotifSettings] = useState({
    email_alerts: true,
    in_app: true,
    task_reminders: true,
    risk_alerts: true,
    renewal_alerts: true
  });

  const toggleIntegration = (id) => {
    setIntegrations(prev => prev.map(int => {
      if (int.id === id) {
        const newStatus = int.status === 'active' ? 'inactive' : 'active';
        toast.success(`${int.name} ${newStatus === 'active' ? 'connected' : 'disconnected'}`);
        return { ...int, status: newStatus };
      }
      return int;
    }));
  };

  const saveSettings = (section) => {
    toast.success(`${section} settings saved`);
  };

  const activeIntegrations = integrations.filter(i => i.status === 'active').length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
        <p className="text-sm text-slate-500">Manage your preferences</p>
      </div>

      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="h-9">
          <TabsTrigger value="organization" className="text-sm"><Building size={14} className="mr-1" /> Organization</TabsTrigger>
          <TabsTrigger value="notifications" className="text-sm"><Bell size={14} className="mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="integrations" className="text-sm"><Link2 size={14} className="mr-1" /> Integrations ({activeIntegrations})</TabsTrigger>
          <TabsTrigger value="security" className="text-sm"><Shield size={14} className="mr-1" /> Security</TabsTrigger>
        </TabsList>

        {/* Organization Settings */}
        <TabsContent value="organization" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Organization Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Company Name</label>
                  <Input value={orgSettings.company_name} onChange={(e) => setOrgSettings({...orgSettings, company_name: e.target.value})} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Currency</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={orgSettings.currency} onChange={(e) => setOrgSettings({...orgSettings, currency: e.target.value})}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Date Format</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={orgSettings.date_format} onChange={(e) => setOrgSettings({...orgSettings, date_format: e.target.value})}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-600">Timezone</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={orgSettings.timezone} onChange={(e) => setOrgSettings({...orgSettings, timezone: e.target.value})}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>
              <Button onClick={() => saveSettings('Organization')} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { key: 'email_alerts', label: 'Email Alerts', desc: 'Receive important updates via email' },
                { key: 'in_app', label: 'In-App Notifications', desc: 'Show notifications in the app' },
                { key: 'task_reminders', label: 'Task Reminders', desc: 'Get reminded about upcoming tasks' },
                { key: 'risk_alerts', label: 'Risk Alerts', desc: 'Alerts when accounts become at risk' },
                { key: 'renewal_alerts', label: 'Renewal Reminders', desc: 'Upcoming renewal notifications' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notifSettings[item.key]} onChange={() => setNotifSettings({...notifSettings, [item.key]: !notifSettings[item.key]})} className="sr-only peer" />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
              <Button onClick={() => saveSettings('Notification')} className="bg-blue-600 hover:bg-blue-700 mt-2">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600">{activeIntegrations} of {integrations.length} integrations active</p>
            <Button variant="outline" size="sm" onClick={() => setShowLogs(true)}>
              <Clock size={14} className="mr-1" /> Sync Logs
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrations.map((int) => (
              <Card key={int.id} className={`${int.status === 'active' ? 'border-green-200 bg-green-50/30' : ''}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{int.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-slate-800">{int.name}</p>
                        <p className="text-xs text-slate-500">{int.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={int.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                        {int.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant={int.status === 'active' ? 'destructive' : 'default'}
                        onClick={() => toggleIntegration(int.id)}
                        className="h-7 text-xs"
                      >
                        {int.status === 'active' ? <><X size={12} className="mr-1" /> Disconnect</> : <><Link2 size={12} className="mr-1" /> Connect</>}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-medium">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Change Password</p>
                    <p className="text-xs text-slate-500">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm">Change</Button>
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Session Timeout</p>
                    <p className="text-xs text-slate-500">Auto-logout after inactivity</p>
                  </div>
                  <select className="px-3 py-1.5 border rounded text-sm">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>2 hours</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sync Logs Modal */}
      {showLogs && (
        <Dialog open={true} onOpenChange={() => setShowLogs(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center"><RefreshCw size={16} className="mr-2" /> Sync Logs</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {SYNC_LOGS.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                  <div>
                    <p className="font-medium">{log.integration} - {log.action}</p>
                    <p className="text-xs text-slate-500">{log.timestamp}</p>
                  </div>
                  {log.status === 'success' ? <Check size={14} className="text-green-600" /> : <X size={14} className="text-red-600" />}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
