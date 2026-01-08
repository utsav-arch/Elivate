import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Users, Phone, Activity, Clock, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Calendar } from 'lucide-react';

// Mock data for product usage
const generateMockUsageData = (customerId) => {
  const seed = customerId?.charCodeAt(customerId.length - 1) || 1;
  return {
    active_users: 45 + (seed % 50),
    licensed_users: 100,
    calls_processed: 12500 + (seed * 100),
    calls_last_period: 11800 + (seed * 80),
    login_frequency: 85 + (seed % 10),
    avg_session_duration: 25 + (seed % 15), // minutes
    feature_adoption: {
      'Call Recording': 95,
      'AI Transcription': 88,
      'Agent Scoring': 72,
      'Real-time Analytics': 65,
      'Custom Reports': 45,
      'API Integration': 30,
      'Coaching Module': 55,
      'CSAT Surveys': 40
    },
    daily_usage: [
      { day: 'Mon', users: 42, calls: 1800 },
      { day: 'Tue', users: 48, calls: 2100 },
      { day: 'Wed', users: 45, calls: 1950 },
      { day: 'Thu', users: 50, calls: 2200 },
      { day: 'Fri', users: 38, calls: 1600 },
      { day: 'Sat', users: 12, calls: 450 },
      { day: 'Sun', users: 8, calls: 200 }
    ],
    alerts: [
      { type: 'warning', message: 'Login frequency dropped 8% this week' },
      { type: 'info', message: 'New feature "AI Coaching" adoption at 55%' }
    ]
  };
};

export default function ProductUsageModule({ customerId }) {
  const [usageData, setUsageData] = useState(null);

  useEffect(() => {
    // In production, this would be an API call
    setUsageData(generateMockUsageData(customerId));
  }, [customerId]);

  if (!usageData) {
    return <div className="animate-pulse bg-slate-100 h-96 rounded-lg"></div>;
  }

  const utilizationRate = Math.round((usageData.active_users / usageData.licensed_users) * 100);
  const callsTrend = Math.round(((usageData.calls_processed - usageData.calls_last_period) / usageData.calls_last_period) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">CX-Level Product Usage</h3>
        <Badge variant="outline" className="text-xs">
          <Calendar size={12} className="mr-1" />
          Last 30 days
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Users className="text-blue-600" size={24} />
              <Badge className={utilizationRate >= 70 ? 'bg-green-100 text-green-700' : utilizationRate >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>
                {utilizationRate}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-2">
              {usageData.active_users} / {usageData.licensed_users}
            </p>
            <p className="text-sm text-blue-600">Active vs Licensed Users</p>
            <Progress value={utilizationRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Phone className="text-green-600" size={24} />
              <div className={`flex items-center text-xs ${callsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {callsTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span className="ml-1">{Math.abs(callsTrend)}%</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-green-800 mt-2">
              {usageData.calls_processed.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">Calls Processed</p>
            <p className="text-xs text-green-500 mt-1">vs {usageData.calls_last_period.toLocaleString()} last period</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="text-purple-600" size={24} />
              <Badge className="bg-purple-100 text-purple-700">{usageData.login_frequency}%</Badge>
            </div>
            <p className="text-2xl font-bold text-purple-800 mt-2">
              {usageData.login_frequency}%
            </p>
            <p className="text-sm text-purple-600">Login Frequency</p>
            <p className="text-xs text-purple-500 mt-1">Users logging in daily</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-orange-800 mt-2">
              {usageData.avg_session_duration} min
            </p>
            <p className="text-sm text-orange-600">Avg Session Duration</p>
            <p className="text-xs text-orange-500 mt-1">Per user per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {usageData.alerts && usageData.alerts.length > 0 && (
        <div className="space-y-2">
          {usageData.alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg flex items-center space-x-2 ${alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'}`}
            >
              <AlertTriangle size={16} className={alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'} />
              <span className={`text-sm ${alert.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'}`}>{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Feature Adoption Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <BarChart3 size={18} className="mr-2 text-blue-600" />
            Feature Adoption
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(usageData.feature_adoption).map(([feature, adoption]) => (
              <div key={feature} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{feature}</span>
                  <span className={`font-medium ${adoption >= 70 ? 'text-green-600' : adoption >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {adoption}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${adoption >= 70 ? 'bg-green-500' : adoption >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${adoption}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Usage Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Usage Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 space-x-2">
            {usageData.daily_usage.map((day, idx) => {
              const maxCalls = Math.max(...usageData.daily_usage.map(d => d.calls));
              const height = (day.calls / maxCalls) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-t relative" style={{ height: '120px' }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-2">{day.day}</span>
                  <span className="text-xs text-slate-400">{day.calls}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
