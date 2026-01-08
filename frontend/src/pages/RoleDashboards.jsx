import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CheckSquare,
  Target,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  IndianRupee,
  Clock,
  UserCheck,
  Building2,
  Heart,
  RefreshCw
} from 'lucide-react';

const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// CSM Dashboard Component
function CSMDashboard({ stats, tasks, customers }) {
  const myCustomers = customers?.filter(c => c.csm_owner_id === stats?.user_id) || [];
  const myTasks = tasks?.filter(t => t.assigned_to_id === stats?.user_id) || [];
  const overdueTasks = myTasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) < new Date());
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Building2 className="text-blue-600" size={24} />
              <Badge className="bg-blue-600">{myCustomers.length}</Badge>
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-2">{myCustomers.length}</p>
            <p className="text-sm text-blue-600">My Accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Heart className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-green-800 mt-2">
              {myCustomers.filter(c => c.health_status === 'Healthy').length}
            </p>
            <p className="text-sm text-green-600">Healthy Accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckSquare className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-orange-800 mt-2">
              {myTasks.filter(t => t.status !== 'Completed').length}
            </p>
            <p className="text-sm text-orange-600">Open Tasks</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${overdueTasks.length > 0 ? 'from-red-50 to-red-100' : 'from-slate-50 to-slate-100'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className={overdueTasks.length > 0 ? 'text-red-600' : 'text-slate-600'} size={24} />
            </div>
            <p className={`text-2xl font-bold mt-2 ${overdueTasks.length > 0 ? 'text-red-800' : 'text-slate-800'}`}>
              {overdueTasks.length}
            </p>
            <p className={`text-sm ${overdueTasks.length > 0 ? 'text-red-600' : 'text-slate-600'}`}>Overdue Tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* At Risk Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 text-orange-600" size={20} />
            At Risk Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {myCustomers.filter(c => c.health_status !== 'Healthy').slice(0, 5).map(customer => (
              <div key={customer.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{customer.company_name}</p>
                  <p className="text-sm text-slate-500">ARR: {formatINR(customer.arr)}</p>
                </div>
                <Badge className={customer.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                  {customer.health_status}
                </Badge>
              </div>
            ))}
            {myCustomers.filter(c => c.health_status !== 'Healthy').length === 0 && (
              <p className="text-center text-slate-500 py-4">No at-risk accounts 🎉</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Renewals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 text-blue-600" size={20} />
            Upcoming Renewals (90 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {myCustomers.filter(c => {
              if (!c.renewal_date) return false;
              const days = Math.ceil((new Date(c.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
              return days > 0 && days <= 90;
            }).map(customer => (
              <div key={customer.id} className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">{customer.company_name}</p>
                  <p className="text-sm text-slate-500">{formatINR(customer.arr)} ARR</p>
                </div>
                <Badge variant="outline">
                  {Math.ceil((new Date(customer.renewal_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// AM Dashboard Component
function AMDashboard({ stats, opportunities }) {
  const totalPipeline = opportunities?.reduce((sum, o) => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost' ? sum + (o.value || 0) : sum, 0) || 0;
  const wonValue = opportunities?.filter(o => o.stage === 'Closed Won').reduce((sum, o) => sum + (o.value || 0), 0) || 0;
  const activeOpps = opportunities?.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost') || [];
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <IndianRupee className="text-green-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-green-800 mt-2">{formatINR(totalPipeline)}</p>
            <p className="text-sm text-green-600">Pipeline Value</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-blue-800 mt-2">{activeOpps.length}</p>
            <p className="text-sm text-blue-600">Active Opportunities</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Target className="text-purple-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-purple-800 mt-2">{formatINR(wonValue)}</p>
            <p className="text-sm text-purple-600">Closed Won (YTD)</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <p className="text-2xl font-bold text-orange-800 mt-2">
              {activeOpps.filter(o => o.stage === 'Negotiation').length}
            </p>
            <p className="text-sm text-orange-600">In Negotiation</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline by Stage */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline by Stage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['Identified', 'Qualified', 'Proposal', 'Negotiation'].map(stage => {
              const stageOpps = activeOpps.filter(o => o.stage === stage);
              const stageValue = stageOpps.reduce((sum, o) => sum + (o.value || 0), 0);
              const percentage = totalPipeline > 0 ? (stageValue / totalPipeline) * 100 : 0;
              
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">{stage} ({stageOpps.length})</span>
                    <span className="font-medium">{formatINR(stageValue)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Leadership Dashboard Component
function LeadershipDashboard({ stats, customers, risks }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <Users className="text-blue-600" size={24} />
            <p className="text-2xl font-bold text-blue-800 mt-2">{stats?.total_customers || 0}</p>
            <p className="text-sm text-blue-600">Total Customers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <IndianRupee className="text-green-600" size={24} />
            <p className="text-2xl font-bold text-green-800 mt-2">{formatINR(stats?.total_arr)}</p>
            <p className="text-sm text-green-600">Total ARR</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardContent className="p-4">
            <Heart className="text-emerald-600" size={24} />
            <p className="text-2xl font-bold text-emerald-800 mt-2">{stats?.healthy_customers || 0}</p>
            <p className="text-sm text-emerald-600">Healthy</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <AlertTriangle className="text-orange-600" size={24} />
            <p className="text-2xl font-bold text-orange-800 mt-2">{stats?.at_risk_customers || 0}</p>
            <p className="text-sm text-orange-600">At Risk</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <AlertTriangle className="text-red-600" size={24} />
            <p className="text-2xl font-bold text-red-800 mt-2">{stats?.critical_customers || 0}</p>
            <p className="text-sm text-red-600">Critical</p>
          </CardContent>
        </Card>
      </div>

      {/* Health Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Health Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-8">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">Healthy</span>
                <span>{stats?.healthy_customers || 0} ({Math.round((stats?.healthy_customers / stats?.total_customers) * 100) || 0}%)</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(stats?.healthy_customers / stats?.total_customers) * 100 || 0}%` }} />
              </div>

              <div className="flex justify-between text-sm mt-4">
                <span className="text-yellow-700">At Risk</span>
                <span>{stats?.at_risk_customers || 0}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500" style={{ width: `${(stats?.at_risk_customers / stats?.total_customers) * 100 || 0}%` }} />
              </div>

              <div className="flex justify-between text-sm mt-4">
                <span className="text-red-700">Critical</span>
                <span>{stats?.critical_customers || 0}</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${(stats?.critical_customers / stats?.total_customers) * 100 || 0}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Open Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{stats?.open_risks || 0}</p>
            <p className="text-sm text-slate-500 mt-1">{stats?.critical_risks || 0} critical</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{formatINR(stats?.pipeline_value)}</p>
            <p className="text-sm text-slate-500 mt-1">{stats?.active_opportunities || 0} active opportunities</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function RoleDashboards() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('leadership');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, customersRes, tasksRes, oppsRes, risksRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/tasks`),
        axios.get(`${API}/opportunities`),
        axios.get(`${API}/risks`)
      ]);
      setStats(statsRes.data);
      setCustomers(customersRes.data);
      setTasks(tasksRes.data);
      setOpportunities(oppsRes.data);
      setRisks(risksRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-800">Role-Based Dashboards</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="leadership">Leadership Dashboard</TabsTrigger>
          <TabsTrigger value="csm">CSM Dashboard</TabsTrigger>
          <TabsTrigger value="am">AM Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="leadership">
          <LeadershipDashboard stats={stats} customers={customers} risks={risks} />
        </TabsContent>

        <TabsContent value="csm">
          <CSMDashboard stats={stats} tasks={tasks} customers={customers} />
        </TabsContent>

        <TabsContent value="am">
          <AMDashboard stats={stats} opportunities={opportunities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
