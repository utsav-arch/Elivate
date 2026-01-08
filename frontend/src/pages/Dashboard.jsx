import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Users,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  CheckSquare,
  Activity,
  Calendar,
  Building2,
  Clock,
  Heart,
  RefreshCw,
  ChevronRight,
  Target,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';

const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, customersRes, tasksRes, activitiesRes, oppsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/tasks`),
        axios.get(`${API}/activities`),
        axios.get(`${API}/opportunities`)
      ]);
      setStats(statsRes.data);
      setCustomers(customersRes.data);
      setTasks(tasksRes.data);
      setActivities(activitiesRes.data);
      setOpportunities(oppsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const myTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 5);
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && new Date(t.due_date) < new Date());
  const atRiskCustomers = customers.filter(c => c.health_status !== 'Healthy');
  const upcomingRenewals = customers.filter(c => {
    if (!c.renewal_date) return false;
    const days = Math.ceil((new Date(c.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 && days <= 90;
  });
  const recentActivities = activities.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Customer Success Overview</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Role-based Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="h-9">
          <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
          <TabsTrigger value="my-work" className="text-sm">My Work</TabsTrigger>
          <TabsTrigger value="health" className="text-sm">Account Health</TabsTrigger>
          <TabsTrigger value="billing" className="text-sm">Billing Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Users className="text-blue-600" size={18} />
                  <span className="text-xs text-slate-500">Customers</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stats?.total_customers || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <IndianRupee className="text-green-600" size={18} />
                  <span className="text-xs text-slate-500">Total ARR</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-1">{formatINR(stats?.total_arr)}</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <Heart className="text-emerald-600" size={18} />
                  <span className="text-xs text-slate-500">Healthy</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{stats?.healthy_customers || 0}</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="text-orange-600" size={18} />
                  <span className="text-xs text-slate-500">At Risk</span>
                </div>
                <p className="text-2xl font-bold text-orange-600 mt-1">{(stats?.at_risk_customers || 0) + (stats?.critical_customers || 0)}</p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <TrendingUp className="text-purple-600" size={18} />
                  <span className="text-xs text-slate-500">Pipeline</span>
                </div>
                <p className="text-2xl font-bold text-slate-800 mt-1">{formatINR(stats?.pipeline_value)}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* At Risk Accounts */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center"><AlertTriangle size={14} className="mr-1 text-orange-600" /> At Risk Accounts</span>
                  <Link to="/customers?filter=at-risk" className="text-xs text-blue-600">View all</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {atRiskCustomers.slice(0, 4).map(customer => (
                    <Link key={customer.id} to={`/customers/${customer.id}`} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${customer.health_status === 'Critical' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">{customer.company_name}</span>
                      </div>
                      <span className="text-xs text-slate-500">{formatINR(customer.arr)}</span>
                    </Link>
                  ))}
                  {atRiskCustomers.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No at-risk accounts</p>}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Renewals */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center"><RefreshCw size={14} className="mr-1 text-blue-600" /> Upcoming Renewals</span>
                  <Badge variant="outline" className="text-xs">{upcomingRenewals.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {upcomingRenewals.slice(0, 4).map(customer => {
                    const days = Math.ceil((new Date(customer.renewal_date) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <Link key={customer.id} to={`/customers/${customer.id}`} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded text-sm">
                        <span className="font-medium text-slate-700 truncate max-w-[120px]">{customer.company_name}</span>
                        <Badge variant="outline" className={`text-xs ${days <= 30 ? 'border-red-300 text-red-600' : ''}`}>{days}d</Badge>
                      </Link>
                    );
                  })}
                  {upcomingRenewals.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No renewals in 90 days</p>}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity size={14} className="mr-1 text-green-600" /> Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {recentActivities.map(activity => (
                    <div key={activity.id} className="p-2 hover:bg-slate-50 rounded text-sm">
                      <p className="font-medium text-slate-700 truncate">{activity.title}</p>
                      <p className="text-xs text-slate-500">{activity.customer_name}</p>
                    </div>
                  ))}
                  {recentActivities.length === 0 && <p className="text-xs text-slate-500 text-center py-2">No recent activities</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* My Work Tab */}
        <TabsContent value="my-work" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* My Tasks */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center"><CheckSquare size={14} className="mr-1" /> My Tasks</span>
                  <Link to="/tasks"><Button variant="ghost" size="sm" className="h-6 text-xs">View all <ChevronRight size={12} /></Button></Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {myTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <div>
                        <p className="font-medium text-slate-700">{task.title}</p>
                        <p className="text-xs text-slate-500">{task.customer_name}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs ${new Date(task.due_date) < new Date() ? 'border-red-300 text-red-600' : ''}`}>
                        {new Date(task.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </Badge>
                    </div>
                  ))}
                  {myTasks.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No pending tasks</p>}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded">
                    <p className="text-xs text-slate-500">Open Tasks</p>
                    <p className="text-xl font-bold text-slate-800">{tasks.filter(t => t.status !== 'Completed').length}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded">
                    <p className="text-xs text-red-600">Overdue</p>
                    <p className="text-xl font-bold text-red-600">{overdueTasks.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-xs text-blue-600">My Accounts</p>
                    <p className="text-xl font-bold text-blue-600">{customers.length}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <p className="text-xs text-green-600">Activities Today</p>
                    <p className="text-xl font-bold text-green-600">{activities.filter(a => new Date(a.activity_date).toDateString() === new Date().toDateString()).length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Account Health Tab */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Heart className="text-green-600" size={24} />
                  <Badge className="bg-green-100 text-green-700">Healthy</Badge>
                </div>
                <p className="text-3xl font-bold text-green-700 mt-2">{stats?.healthy_customers || 0}</p>
                <p className="text-sm text-green-600">accounts performing well</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="text-yellow-600" size={24} />
                  <Badge className="bg-yellow-100 text-yellow-700">At Risk</Badge>
                </div>
                <p className="text-3xl font-bold text-yellow-700 mt-2">{stats?.at_risk_customers || 0}</p>
                <p className="text-sm text-yellow-600">need attention</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <AlertTriangle className="text-red-600" size={24} />
                  <Badge className="bg-red-100 text-red-700">Critical</Badge>
                </div>
                <p className="text-3xl font-bold text-red-700 mt-2">{stats?.critical_customers || 0}</p>
                <p className="text-sm text-red-600">immediate action required</p>
              </CardContent>
            </Card>
          </div>

          {/* Health Distribution */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium">Health Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-green-500 h-full" style={{ width: `${(stats?.healthy_customers / stats?.total_customers) * 100 || 0}%` }} />
                <div className="bg-yellow-500 h-full" style={{ width: `${(stats?.at_risk_customers / stats?.total_customers) * 100 || 0}%` }} />
                <div className="bg-red-500 h-full" style={{ width: `${(stats?.critical_customers / stats?.total_customers) * 100 || 0}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-600">
                <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded mr-1" /> Healthy ({stats?.healthy_customers || 0})</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-yellow-500 rounded mr-1" /> At Risk ({stats?.at_risk_customers || 0})</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded mr-1" /> Critical ({stats?.critical_customers || 0})</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Health Tab */}
        <TabsContent value="billing" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-slate-500">Total ARR</p>
                <p className="text-xl font-bold text-slate-800">{formatINR(stats?.total_arr)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-slate-500">Pipeline Value</p>
                <p className="text-xl font-bold text-purple-600">{formatINR(stats?.pipeline_value)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-slate-500">Open Opportunities</p>
                <p className="text-xl font-bold text-blue-600">{stats?.active_opportunities || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <p className="text-xs text-slate-500">Renewals (90d)</p>
                <p className="text-xl font-bold text-orange-600">{upcomingRenewals.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue by Health */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                {atRiskCustomers.slice(0, 5).map(customer => (
                  <div key={customer.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Badge className={customer.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                        {customer.health_status}
                      </Badge>
                      <span className="text-sm font-medium">{customer.company_name}</span>
                    </div>
                    <span className="text-sm font-bold">{formatINR(customer.arr)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
