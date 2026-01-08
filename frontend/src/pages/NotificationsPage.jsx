import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Bell, Check, X, Settings, Mail, MessageSquare, Smartphone, Filter, MoreHorizontal } from 'lucide-react';

// Mock notifications
const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'risk', title: 'High Risk Alert', message: 'Swiggy account flagged as Critical due to low usage', time: '5 min ago', read: false, channel: 'in-app' },
  { id: 2, type: 'task', title: 'Task Due Tomorrow', message: 'QBR preparation for Zomato is due tomorrow', time: '1 hour ago', read: false, channel: 'email' },
  { id: 3, type: 'invoice', title: 'Invoice Overdue', message: 'Invoice INV-2025-001 for PhonePe is 30 days overdue', time: '2 hours ago', read: false, channel: 'in-app' },
  { id: 4, type: 'opportunity', title: 'Opportunity Update', message: 'HDFC Bank expansion moved to Negotiation stage', time: '3 hours ago', read: true, channel: 'slack' },
  { id: 5, type: 'activity', title: 'Meeting Logged', message: 'Weekly sync with ICICI Bank completed by Priya Sharma', time: '5 hours ago', read: true, channel: 'in-app' },
  { id: 6, type: 'churn', title: 'Churn Alert', message: 'Customer Tech Mahindra has initiated churn process', time: '1 day ago', read: true, channel: 'email' },
  { id: 7, type: 'renewal', title: 'Renewal Reminder', message: 'Axis Bank renewal in 30 days - ₹40L ARR', time: '1 day ago', read: true, channel: 'in-app' },
  { id: 8, type: 'health', title: 'Health Score Change', message: 'PolicyBazaar health improved from At Risk to Healthy', time: '2 days ago', read: true, channel: 'slack' }
];

const NOTIFICATION_SETTINGS = [
  { key: 'risk_alerts', label: 'Risk Alerts', description: 'Get notified when accounts are flagged at risk', email: true, inApp: true, push: true, slack: true },
  { key: 'task_reminders', label: 'Task Reminders', description: 'Reminders for upcoming and overdue tasks', email: true, inApp: true, push: true, slack: false },
  { key: 'invoice_alerts', label: 'Invoice Alerts', description: 'Overdue invoice notifications', email: true, inApp: true, push: false, slack: true },
  { key: 'opportunity_updates', label: 'Opportunity Updates', description: 'Stage changes and opportunity wins', email: false, inApp: true, push: false, slack: true },
  { key: 'health_changes', label: 'Health Score Changes', description: 'Customer health status changes', email: true, inApp: true, push: false, slack: false },
  { key: 'renewal_reminders', label: 'Renewal Reminders', description: 'Upcoming contract renewals', email: true, inApp: true, push: true, slack: true },
  { key: 'churn_alerts', label: 'Churn Alerts', description: 'Customer churn notifications', email: true, inApp: true, push: true, slack: true }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [settings, setSettings] = useState(NOTIFICATION_SETTINGS);
  const [activeTab, setActiveTab] = useState('notifications');
  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toggleSetting = (key, channel) => {
    setSettings(prev => prev.map(s => {
      if (s.key === key) {
        return { ...s, [channel]: !s[channel] };
      }
      return s;
    }));
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'risk': return '⚠️';
      case 'task': return '✅';
      case 'invoice': return '💰';
      case 'opportunity': return '📈';
      case 'activity': return '📝';
      case 'churn': return '🚨';
      case 'renewal': return '🔄';
      case 'health': return '💚';
      default: return '🔔';
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'email': return <Mail size={12} className="text-blue-600" />;
      case 'slack': return <MessageSquare size={12} className="text-purple-600" />;
      case 'push': return <Smartphone size={12} className="text-green-600" />;
      default: return <Bell size={12} className="text-slate-600" />;
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read)
      : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
          <p className="text-slate-600 mt-1">
            {unreadCount} unread notifications
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} className="mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'notifications' ? (
        <>
          {/* Filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-slate-500" />
              <select
                className="px-3 py-1.5 border rounded-md text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="risk">Risk Alerts</option>
                <option value="task">Tasks</option>
                <option value="invoice">Invoices</option>
                <option value="opportunity">Opportunities</option>
                <option value="churn">Churn</option>
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check size={14} className="mr-1" />
              Mark all as read
            </Button>
          </div>

          {/* Notification List */}
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-slate-500">{notification.time}</span>
                          <div className="flex items-center space-x-1">
                            {getChannelIcon(notification.channel)}
                            <span className="text-xs text-slate-400 capitalize">{notification.channel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          <Check size={14} />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">No notifications to show</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Settings Tab */
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Channel Headers */}
              <div className="grid grid-cols-5 gap-4 pb-2 border-b">
                <div className="col-span-1"></div>
                <div className="text-center text-sm font-medium text-slate-600">In-App</div>
                <div className="text-center text-sm font-medium text-slate-600">Email</div>
                <div className="text-center text-sm font-medium text-slate-600">Push</div>
                <div className="text-center text-sm font-medium text-slate-600">Slack</div>
              </div>

              {settings.map((setting) => (
                <div key={setting.key} className="grid grid-cols-5 gap-4 items-center py-2">
                  <div>
                    <p className="font-medium text-slate-800">{setting.label}</p>
                    <p className="text-xs text-slate-500">{setting.description}</p>
                  </div>
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={setting.inApp}
                      onChange={() => toggleSetting(setting.key, 'inApp')}
                      className="rounded"
                    />
                  </div>
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={setting.email}
                      onChange={() => toggleSetting(setting.key, 'email')}
                      className="rounded"
                    />
                  </div>
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={setting.push}
                      onChange={() => toggleSetting(setting.key, 'push')}
                      className="rounded"
                    />
                  </div>
                  <div className="text-center">
                    <input
                      type="checkbox"
                      checked={setting.slack}
                      onChange={() => toggleSetting(setting.key, 'slack')}
                      className="rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
