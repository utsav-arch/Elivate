import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Download,
  FileText,
  Heart,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Activity,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart
} from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [churnData, setChurnData] = useState(null);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, customersRes, churnRes, activitiesRes, oppsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/reports/churn`),
        axios.get(`${API}/activities`),
        axios.get(`${API}/opportunities`)
      ]);
      setStats(statsRes.data);
      setCustomers(customersRes.data);
      setChurnData(churnRes.data);
      setActivities(activitiesRes.data);
      setOpportunities(oppsRes.data);
    } catch (error) {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    toast.success(`${filename}.csv downloaded`);
  };

  // Calculate metrics
  const healthyCustomers = customers.filter(c => c.health_status === 'Healthy');
  const atRiskCustomers = customers.filter(c => c.health_status === 'At Risk');
  const criticalCustomers = customers.filter(c => c.health_status === 'Critical');
  const upcomingRenewals = customers.filter(c => {
    if (!c.renewal_date) return false;
    const days = Math.ceil((new Date(c.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 90;
  });
  const inactiveAccounts = customers.filter(c => {
    const lastActivity = activities.find(a => a.customer_id === c.id);
    if (!lastActivity) return true;
    const daysSince = Math.ceil((new Date() - new Date(lastActivity.activity_date)) / (1000 * 60 * 60 * 24));
    return daysSince > 30;
  });
  const expansionOpps = opportunities.filter(o => o.stage !== 'Closed Lost' && o.stage !== 'Closed Won');

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">Analytics and insights</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="health" className="text-xs">Account Health</TabsTrigger>
          <TabsTrigger value="billing" className="text-xs">Billing & Renewal</TabsTrigger>
          <TabsTrigger value="expansion" className="text-xs">Expansion</TabsTrigger>
          <TabsTrigger value="churn" className="text-xs">Churn Analysis</TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs">Engagement</TabsTrigger>
          <TabsTrigger value="inactive" className="text-xs">Inactive Accounts</TabsTrigger>
        </TabsList>

        {/* Account Health Report */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><Heart size={14} className="mr-1 text-green-600" /> Account Health Score Report</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(customers.map(c => ({ name: c.company_name, health: c.health_status, score: c.health_score, arr: c.arr })), 'health_report')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded text-center">
                  <p className="text-2xl font-bold text-green-700">{healthyCustomers.length}</p>
                  <p className="text-xs text-green-600">Healthy</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded text-center">
                  <p className="text-2xl font-bold text-yellow-700">{atRiskCustomers.length}</p>
                  <p className="text-xs text-yellow-600">At Risk</p>
                </div>
                <div className="p-3 bg-red-50 rounded text-center">
                  <p className="text-2xl font-bold text-red-700">{criticalCustomers.length}</p>
                  <p className="text-xs text-red-600">Critical</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customers.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <span className="font-medium">{c.company_name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">{c.health_score || 0}%</span>
                      <Badge className={c.health_status === 'Healthy' ? 'bg-green-100 text-green-700' : c.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{c.health_status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing & Renewal Report */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><IndianRupee size={14} className="mr-1 text-blue-600" /> Renewal & Billing Forecast</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(upcomingRenewals.map(c => ({ name: c.company_name, arr: c.arr, renewal_date: c.renewal_date })), 'renewal_forecast')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-600">Renewals in 90 days</p>
                  <p className="text-2xl font-bold text-blue-700">{upcomingRenewals.length}</p>
                  <p className="text-xs text-blue-500">{formatINR(upcomingRenewals.reduce((s, c) => s + (c.arr || 0), 0))} ARR</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-green-600">Total ARR</p>
                  <p className="text-2xl font-bold text-green-700">{formatINR(stats?.total_arr)}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {upcomingRenewals.map(c => {
                  const days = Math.ceil((new Date(c.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <span className="font-medium">{c.company_name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">{formatINR(c.arr)}</span>
                        <Badge variant="outline" className={days <= 30 ? 'border-red-300 text-red-600' : ''}>{days}d</Badge>
                      </div>
                    </div>
                  );
                })}
                {upcomingRenewals.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No renewals in next 90 days</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expansion Report */}
        <TabsContent value="expansion" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><TrendingUp size={14} className="mr-1 text-purple-600" /> Expansion & Upsell Opportunities</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(expansionOpps.map(o => ({ title: o.title, customer: o.customer_name, value: o.value, stage: o.stage })), 'expansion_report')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-xs text-purple-600">Pipeline Value</p>
                  <p className="text-2xl font-bold text-purple-700">{formatINR(expansionOpps.reduce((s, o) => s + (o.value || 0), 0))}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-600">Active Opportunities</p>
                  <p className="text-2xl font-bold text-blue-700">{expansionOpps.length}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {expansionOpps.slice(0, 10).map(o => (
                  <div key={o.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{o.title}</span>
                      <p className="text-xs text-slate-500">{o.customer_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{formatINR(o.value)}</span>
                      <Badge variant="outline">{o.stage}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Churn Analysis Report */}
        <TabsContent value="churn" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><TrendingDown size={14} className="mr-1 text-red-600" /> Churn & Downgrade Analysis</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(churnData?.records || [], 'churn_analysis')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded text-center">
                  <p className="text-2xl font-bold text-red-700">{churnData?.total_churns || 0}</p>
                  <p className="text-xs text-red-600">Total Churns</p>
                </div>
                <div className="p-3 bg-orange-50 rounded text-center">
                  <p className="text-2xl font-bold text-orange-700">{formatINR(churnData?.total_revenue_lost)}</p>
                  <p className="text-xs text-orange-600">Revenue Lost</p>
                </div>
                <div className="p-3 bg-slate-50 rounded text-center">
                  <p className="text-2xl font-bold text-slate-700">{churnData?.by_reason?.length || 0}</p>
                  <p className="text-xs text-slate-600">Unique Reasons</p>
                </div>
              </div>
              {churnData?.by_reason && churnData.by_reason.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Churn by Reason</p>
                  {churnData.by_reason.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <span>{r.reason}</span>
                      <Badge variant="outline">{r.count}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {(!churnData?.by_reason || churnData.by_reason.length === 0) && <p className="text-xs text-slate-500 text-center py-4">No churn data available</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Report */}
        <TabsContent value="engagement" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><Activity size={14} className="mr-1 text-green-600" /> Customer Engagement & Touchpoints</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(activities.map(a => ({ customer: a.customer_name, type: a.activity_type, date: a.activity_date })), 'engagement_report')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-green-600">Total Activities</p>
                  <p className="text-2xl font-bold text-green-700">{activities.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-blue-600">This Month</p>
                  <p className="text-2xl font-bold text-blue-700">{activities.filter(a => new Date(a.activity_date).getMonth() === new Date().getMonth()).length}</p>
                </div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activities.slice(0, 10).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{a.title}</span>
                      <p className="text-xs text-slate-500">{a.customer_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{a.activity_type}</Badge>
                      <span className="text-xs text-slate-500">{new Date(a.activity_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inactive Accounts Report */}
        <TabsContent value="inactive" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center"><AlertTriangle size={14} className="mr-1 text-orange-600" /> Inactive Accounts (No activity in 30+ days)</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(inactiveAccounts.map(c => ({ name: c.company_name, arr: c.arr, health: c.health_status })), 'inactive_accounts')}>
                <Download size={12} className="mr-1" /> Export
              </Button>
            </CardHeader>
            <CardContent className="p-3">
              <div className="p-3 bg-orange-50 rounded mb-4">
                <p className="text-xs text-orange-600">Accounts needing outreach</p>
                <p className="text-2xl font-bold text-orange-700">{inactiveAccounts.length}</p>
                <p className="text-xs text-orange-500">{formatINR(inactiveAccounts.reduce((s, c) => s + (c.arr || 0), 0))} ARR at risk</p>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {inactiveAccounts.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                    <div>
                      <span className="font-medium">{c.company_name}</span>
                      <p className="text-xs text-slate-500">{formatINR(c.arr)} ARR</p>
                    </div>
                    <Badge className={c.health_status === 'Healthy' ? 'bg-green-100 text-green-700' : c.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>{c.health_status}</Badge>
                  </div>
                ))}
                {inactiveAccounts.length === 0 && <p className="text-xs text-slate-500 text-center py-4">All accounts have recent activity</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
