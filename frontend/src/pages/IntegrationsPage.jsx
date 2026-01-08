import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Link2, Check, X, Settings, RefreshCw, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const INTEGRATIONS = [
  {
    id: 'intercom',
    name: 'Intercom',
    description: 'Customer messaging platform for sales, marketing, and support',
    icon: '💬',
    category: 'Communication',
    status: 'inactive',
    features: ['Sync conversations', 'Customer data enrichment', 'Auto-tagging']
  },
  {
    id: 'jira',
    name: 'Jira',
    description: 'Project tracking and issue management',
    icon: '📋',
    category: 'Project Management',
    status: 'active',
    features: ['Create issues from risks', 'Sync task status', 'Sprint integration']
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email communication and calendar sync',
    icon: '📧',
    category: 'Communication',
    status: 'inactive',
    features: ['Email sync', 'Calendar events', 'Contact sync']
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Schedule meetings and sync events',
    icon: '📅',
    category: 'Productivity',
    status: 'active',
    features: ['Meeting sync', 'Auto-scheduling', 'Reminders']
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    description: 'Customer support ticketing system',
    icon: '🎫',
    category: 'Support',
    status: 'inactive',
    features: ['Ticket sync', 'Customer history', 'SLA tracking']
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💼',
    category: 'Communication',
    status: 'active',
    features: ['Notifications', 'Channel updates', 'Slash commands']
  },
  {
    id: 'cliq',
    name: 'Zoho Cliq',
    description: 'Team messaging for Zoho ecosystem',
    icon: '💭',
    category: 'Communication',
    status: 'inactive',
    features: ['Team messaging', 'Bot integration', 'Workflow triggers']
  }
];

const SYNC_LOGS = [
  { integration: 'Slack', action: 'Notification sent', timestamp: '2025-01-08 10:30:00', status: 'success' },
  { integration: 'Jira', action: 'Issue created', timestamp: '2025-01-08 10:25:00', status: 'success' },
  { integration: 'Calendar', action: 'Meeting synced', timestamp: '2025-01-08 10:20:00', status: 'success' },
  { integration: 'Slack', action: 'Channel update', timestamp: '2025-01-08 10:15:00', status: 'failed' },
  { integration: 'Jira', action: 'Status updated', timestamp: '2025-01-08 10:10:00', status: 'success' }
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showLogs, setShowLogs] = useState(false);

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

  const activeCount = integrations.filter(i => i.status === 'active').length;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Integrations</h1>
          <p className="text-slate-600 mt-1">
            {activeCount} of {integrations.length} integrations active
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowLogs(true)}>
          <Clock size={16} className="mr-2" />
          Sync Logs
        </Button>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id} className={`hover:shadow-md transition-shadow ${integration.status === 'active' ? 'border-green-200 bg-green-50/30' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">{integration.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">{integration.category}</Badge>
                  </div>
                </div>
                <Badge className={integration.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                  {integration.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mt-3">{integration.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {integration.features.slice(0, 2).map((f, idx) => (
                  <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{f}</span>
                ))}
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => toggleIntegration(integration.id)}
                  className={integration.status === 'active' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {integration.status === 'active' ? (
                    <><X size={14} className="mr-1" /> Disconnect</>
                  ) : (
                    <><Link2 size={14} className="mr-1" /> Connect</>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedIntegration(integration)}>
                  <Settings size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Settings Modal */}
      {selectedIntegration && (
        <Dialog open={true} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <span className="text-2xl">{selectedIntegration.icon}</span>
                <span>{selectedIntegration.name} Settings</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={selectedIntegration.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}>
                    {selectedIntegration.status === 'active' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Features</label>
                <div className="mt-2 space-y-2">
                  {selectedIntegration.features.map((feature, idx) => (
                    <label key={idx} className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Permissions</label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-600">Read access</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm text-slate-600">Write access</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedIntegration(null)}>Close</Button>
                <Button className="bg-blue-600 hover:bg-blue-700">Save Settings</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Sync Logs Modal */}
      {showLogs && (
        <Dialog open={true} onOpenChange={() => setShowLogs(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <RefreshCw size={18} />
                <span>Sync Logs</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {SYNC_LOGS.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{log.integration} - {log.action}</p>
                    <p className="text-xs text-slate-500">{log.timestamp}</p>
                  </div>
                  {log.status === 'success' ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600" />
                  )}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
