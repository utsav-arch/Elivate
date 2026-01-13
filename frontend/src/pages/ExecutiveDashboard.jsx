import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, IndianRupee, AlertTriangle, Heart, Target,
  Calendar, RefreshCw, Filter, Download, ChevronRight, ArrowUp, ArrowDown,
  Building2, UserCheck, FileText, Clock, Eye, BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Format INR
const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format percentage
const formatPct = (value) => `${(value || 0).toFixed(1)}%`;

// Colors
const COLORS = {
  healthy: '#10b981',
  atRisk: '#f59e0b',
  critical: '#ef4444',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  expansion: '#22c55e',
  contraction: '#f97316',
  churn: '#dc2626',
  new: '#06b6d4'
};

// Generate mock executive data
const generateMockData = (customers, opportunities, activities) => {
  // Monthly trends for last 12 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  const monthlyTrends = months.slice(0, currentMonth + 1).map((month, idx) => ({
    month,
    mrr: 5500000 + (idx * 150000) + Math.random() * 200000,
    newARR: 800000 + Math.random() * 300000,
    expansionARR: 400000 + (idx * 30000) + Math.random() * 150000,
    contractionARR: 100000 + Math.random() * 80000,
    churnARR: 150000 + Math.random() * 100000,
    nrr: 108 + (idx * 0.5) + (Math.random() * 3 - 1.5),
    grr: 92 + (idx * 0.2) + (Math.random() * 2 - 1),
    healthyPct: 78 + (idx * 0.3) + (Math.random() * 3 - 1.5),
    atRiskPct: 15 - (idx * 0.2) + (Math.random() * 2),
    criticalPct: 7 - (idx * 0.1) + Math.random()
  }));

  // Segment performance
  const segments = [
    { name: 'Enterprise', arr: 45000000, accounts: 12, nrr: 118, grr: 96, churnRate: 2, expansionRate: 22 },
    { name: 'Mid-Market', arr: 22000000, accounts: 28, nrr: 112, grr: 94, churnRate: 4, expansionRate: 16 },
    { name: 'SMB', arr: 5800000, accounts: 105, nrr: 102, grr: 88, churnRate: 10, expansionRate: 12 }
  ];

  // Product performance
  const products = [
    { name: 'AI Auditing', arr: 28000000, nrr: 122, accounts: 35, churnRate: 3 },
    { name: 'Call Analytics', arr: 18000000, nrr: 115, accounts: 42, churnRate: 5 },
    { name: 'Agent Coaching', arr: 12000000, nrr: 108, accounts: 28, churnRate: 7 },
    { name: 'Quality Management', arr: 8500000, nrr: 98, accounts: 22, churnRate: 12 },
    { name: 'Real-time Assist', arr: 6300000, nrr: 105, accounts: 18, churnRate: 8 }
  ];

  // Region performance
  const regions = [
    { name: 'North India', arr: 25000000, accounts: 38, nrr: 115, renewalRate: 92 },
    { name: 'South India', arr: 22000000, accounts: 42, nrr: 112, renewalRate: 94 },
    { name: 'West India', arr: 18000000, accounts: 35, nrr: 108, renewalRate: 88 },
    { name: 'East India', arr: 7800000, accounts: 30, nrr: 102, renewalRate: 85 }
  ];

  // CSM performance data
  const csmData = [
    { name: 'Arjun Sharma', accounts: 12, arr: 18500000, nrr: 125, grr: 98, expansionARR: 2800000, churnARR: 0, atRisk: 1, qbrRate: 92, csat: 4.8 },
    { name: 'Priya Patel', accounts: 15, arr: 15200000, nrr: 118, grr: 96, expansionARR: 2100000, churnARR: 200000, atRisk: 2, qbrRate: 88, csat: 4.6 },
    { name: 'Rajesh Kumar', accounts: 18, arr: 12800000, nrr: 112, grr: 94, expansionARR: 1500000, churnARR: 350000, atRisk: 3, qbrRate: 78, csat: 4.4 },
    { name: 'Sneha Reddy', accounts: 14, arr: 11500000, nrr: 108, grr: 92, expansionARR: 900000, churnARR: 400000, atRisk: 2, qbrRate: 85, csat: 4.5 },
    { name: 'Amit Singh', accounts: 20, arr: 9200000, nrr: 98, grr: 88, expansionARR: 400000, churnARR: 800000, atRisk: 5, qbrRate: 65, csat: 4.1 },
    { name: 'Kavita Nair', accounts: 16, arr: 5600000, nrr: 95, grr: 86, expansionARR: 200000, churnARR: 600000, atRisk: 4, qbrRate: 70, csat: 4.0 }
  ];

  // Renewal pipeline
  const renewalBuckets = [
    { bucket: '0-30 days', totalARR: 8500000, atRiskARR: 2100000, expectedChurn: 850000, accounts: 8 },
    { bucket: '31-60 days', totalARR: 12200000, atRiskARR: 2800000, expectedChurn: 1200000, accounts: 12 },
    { bucket: '61-90 days', totalARR: 15800000, atRiskARR: 3200000, expectedChurn: 1580000, accounts: 15 }
  ];

  // Churn reasons
  const churnReasons = [
    { reason: 'Price/Budget', count: 12, arr: 2800000, pct: 28 },
    { reason: 'Product Gaps', count: 8, arr: 1900000, pct: 19 },
    { reason: 'Low Usage/ROI', count: 7, arr: 1500000, pct: 15 },
    { reason: 'Competition', count: 6, arr: 1800000, pct: 18 },
    { reason: 'Org Change', count: 5, arr: 1200000, pct: 12 },
    { reason: 'Support Issues', count: 4, arr: 800000, pct: 8 }
  ];

  // Data Labs impact
  const dataLabsImpact = {
    reportsGenerated: 1245,
    accountsReceiving: 89,
    openRate: 72,
    engagementRate: 58,
    highEngagementNRR: 122,
    lowEngagementNRR: 98,
    highEngagementChurn: 3,
    lowEngagementChurn: 15
  };

  // Top accounts at risk
  const topAtRiskAccounts = customers
    .filter(c => c.health_status !== 'Healthy')
    .sort((a, b) => (b.arr || 0) - (a.arr || 0))
    .slice(0, 10)
    .map(c => ({
      ...c,
      healthDrop: Math.floor(Math.random() * 20) + 5,
      riskTag: ['Low Usage', 'Payment Overdue', 'No QBR', 'Ticket Spike', 'Key Contact Left'][Math.floor(Math.random() * 5)]
    }));

  return {
    monthlyTrends,
    segments,
    products,
    regions,
    csmData,
    renewalBuckets,
    churnReasons,
    dataLabsImpact,
    topAtRiskAccounts,
    totals: {
      arr: 72800000,
      mrr: 6066667,
      nrr: 112,
      grr: 94,
      logoChurn: 4.2,
      expansionARR: 8500000,
      churnedARR: 3200000,
      netExpansion: 5300000,
      arrAtRisk90Days: 8100000,
      avgHealthScore: 76,
      totalCustomers: customers.length,
      healthyCustomers: customers.filter(c => c.health_status === 'Healthy').length,
      atRiskCustomers: customers.filter(c => c.health_status === 'At Risk').length,
      criticalCustomers: customers.filter(c => c.health_status === 'Critical').length,
      csmCount: 6,
      arrPerCSM: 12133333
    }
  };
};

// KPI Card Component
const KPICard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'blue', onClick }) => (
  <Card className={`cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:border-blue-300' : ''}`} onClick={onClick}>
    <CardContent className="p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end">
          {Icon && <Icon size={16} className={`text-${color}-500 mb-1`} />}
          {trend !== undefined && (
            <div className={`flex items-center text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              <span>{trendValue || `${Math.abs(trend).toFixed(1)}%`}</span>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Dashboard Component
export default function ExecutiveDashboard() {
  const [customers, setCustomers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [filters, setFilters] = useState({
    dateRange: '12m',
    segment: 'all',
    product: 'all',
    region: 'all',
    csm: 'all',
    health: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [drilldownData, setDrilldownData] = useState(null);
  const [lastUpdated] = useState(new Date().toLocaleString('en-IN'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersRes, oppsRes, activitiesRes] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/opportunities`),
        axios.get(`${API}/activities`)
      ]);
      setCustomers(customersRes.data);
      setOpportunities(oppsRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const mockData = useMemo(() => 
    generateMockData(customers, opportunities, activities),
    [customers, opportunities, activities]
  );

  const handleDrilldown = (type, data) => {
    setDrilldownData({ type, data });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Executive Command Center</h1>
          <p className="text-xs text-slate-500">Last updated: {lastUpdated}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} className="mr-1" /> Filters
          </Button>
          <Button variant="outline" size="sm" onClick={loadData}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      {showFilters && (
        <Card className="bg-white">
          <CardContent className="p-3">
            <div className="grid grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-slate-500">Date Range</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})}>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="12m">Last 12 Months</option>
                  <option value="ytd">Year to Date</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Segment</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.segment} onChange={(e) => setFilters({...filters, segment: e.target.value})}>
                  <option value="all">All Segments</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="mid-market">Mid-Market</option>
                  <option value="smb">SMB</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Product</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.product} onChange={(e) => setFilters({...filters, product: e.target.value})}>
                  <option value="all">All Products</option>
                  <option value="ai-auditing">AI Auditing</option>
                  <option value="call-analytics">Call Analytics</option>
                  <option value="agent-coaching">Agent Coaching</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Region</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})}>
                  <option value="all">All Regions</option>
                  <option value="north">North India</option>
                  <option value="south">South India</option>
                  <option value="west">West India</option>
                  <option value="east">East India</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">CSM</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.csm} onChange={(e) => setFilters({...filters, csm: e.target.value})}>
                  <option value="all">All CSMs</option>
                  {mockData.csmData.map(csm => (
                    <option key={csm.name} value={csm.name}>{csm.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500">Health</label>
                <select className="w-full mt-1 px-2 py-1.5 text-sm border rounded" value={filters.health} onChange={(e) => setFilters({...filters, health: e.target.value})}>
                  <option value="all">All Health</option>
                  <option value="healthy">Healthy</option>
                  <option value="at-risk">At Risk</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-9 flex-wrap bg-white">
          <TabsTrigger value="executive" className="text-xs">Executive Summary</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">Growth & Revenue</TabsTrigger>
          <TabsTrigger value="health" className="text-xs">Health & Risk</TabsTrigger>
          <TabsTrigger value="csm" className="text-xs">CSM Performance</TabsTrigger>
          <TabsTrigger value="renewals" className="text-xs">Renewals Forecast</TabsTrigger>
          <TabsTrigger value="datalabs" className="text-xs">Data Labs Impact</TabsTrigger>
        </TabsList>

        {/* TAB 1: EXECUTIVE SUMMARY */}
        <TabsContent value="executive" className="space-y-4 mt-4">
          {/* Top KPI Strip */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            <KPICard title="Total ARR" value={formatINR(mockData.totals.arr)} icon={IndianRupee} color="blue" trend={8.5} />
            <KPICard title="NRR %" value={formatPct(mockData.totals.nrr)} icon={TrendingUp} color="green" trend={3.2} />
            <KPICard title="GRR %" value={formatPct(mockData.totals.grr)} icon={Target} color="blue" trend={1.5} />
            <KPICard title="Logo Churn" value={formatPct(mockData.totals.logoChurn)} icon={TrendingDown} color="red" trend={-0.8} />
            <KPICard title="Expansion" value={formatINR(mockData.totals.expansionARR)} subtitle="vs Churn" icon={ArrowUp} color="green" trend={12} />
            <KPICard title="ARR at Risk" value={formatINR(mockData.totals.arrAtRisk90Days)} subtitle="90 days" icon={AlertTriangle} color="orange" />
            <KPICard title="ARR/CSM" value={formatINR(mockData.totals.arrPerCSM)} icon={UserCheck} color="purple" trend={5.2} />
            <KPICard title="Avg Health" value={mockData.totals.avgHealthScore} icon={Heart} color="green" trend={2.1} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section A: Growth & Revenue Quality */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp size={14} className="mr-1 text-green-600" /> Growth & Revenue Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={mockData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} domain={[90, 130]} />
                      <Tooltip formatter={(value, name) => [name.includes('ARR') ? formatINR(value) : `${value.toFixed(1)}%`, name]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar yAxisId="left" dataKey="expansionARR" name="Expansion" fill={COLORS.expansion} stackId="a" />
                      <Bar yAxisId="left" dataKey="churnARR" name="Churn" fill={COLORS.churn} stackId="b" />
                      <Line yAxisId="right" type="monotone" dataKey="nrr" name="NRR %" stroke={COLORS.primary} strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="grr" name="GRR %" stroke={COLORS.secondary} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-green-700 font-medium">Top NRR Drivers</p>
                    {mockData.segments.slice(0, 2).map(s => (
                      <p key={s.name} className="text-green-600">{s.name}: {s.nrr}%</p>
                    ))}
                  </div>
                  <div className="p-2 bg-red-50 rounded">
                    <p className="text-red-700 font-medium">NRR Laggards</p>
                    {mockData.segments.slice(-1).map(s => (
                      <p key={s.name} className="text-red-600">{s.name}: {s.nrr}%</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section B: Risk & Renewal Outlook */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <AlertTriangle size={14} className="mr-1 text-orange-600" /> Risk & Renewal Outlook
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {mockData.renewalBuckets.map(bucket => (
                    <div key={bucket.bucket} className="p-2 bg-slate-50 rounded text-center">
                      <p className="text-xs text-slate-500">{bucket.bucket}</p>
                      <p className="text-sm font-bold text-slate-800">{formatINR(bucket.totalARR)}</p>
                      <p className="text-xs text-red-600">{formatINR(bucket.atRiskARR)} at risk</p>
                    </div>
                  ))}
                </div>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.renewalBuckets} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <YAxis dataKey="bucket" type="category" tick={{ fontSize: 10 }} width={60} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Bar dataKey="totalARR" name="Total ARR" fill={COLORS.primary} />
                      <Bar dataKey="atRiskARR" name="At Risk" fill={COLORS.atRisk} />
                      <Bar dataKey="expectedChurn" name="Expected Churn" fill={COLORS.churn} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section C: Customer Health & Engagement */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Heart size={14} className="mr-1 text-green-600" /> Customer Health & Engagement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2 bg-green-50 rounded text-center">
                    <p className="text-lg font-bold text-green-700">{mockData.totals.healthyCustomers}</p>
                    <p className="text-xs text-green-600">Healthy</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded text-center">
                    <p className="text-lg font-bold text-yellow-700">{mockData.totals.atRiskCustomers}</p>
                    <p className="text-xs text-yellow-600">At Risk</p>
                  </div>
                  <div className="p-2 bg-red-50 rounded text-center">
                    <p className="text-lg font-bold text-red-700">{mockData.totals.criticalCustomers}</p>
                    <p className="text-xs text-red-600">Critical</p>
                  </div>
                </div>
                <div className="text-xs font-medium text-slate-600 mb-2">Top At-Risk Accounts (by ARR)</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {mockData.topAtRiskAccounts.slice(0, 5).map((acc, idx) => (
                    <Link key={acc.id} to={`/customers/${acc.id}`} className="flex items-center justify-between p-1.5 bg-slate-50 rounded hover:bg-slate-100 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-400">{idx + 1}.</span>
                        <span className="font-medium">{acc.company_name}</span>
                        <Badge className="text-[10px] bg-red-100 text-red-700">{acc.riskTag}</Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-600">{formatINR(acc.arr)}</span>
                        <span className="text-red-600">↓{acc.healthDrop}%</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Section D: CS Team Effectiveness */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <UserCheck size={14} className="mr-1 text-purple-600" /> CS Team Effectiveness
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {mockData.csmData.map((csm, idx) => (
                    <div key={csm.name} className={`flex items-center justify-between p-2 rounded text-xs ${csm.nrr >= 110 ? 'bg-green-50' : csm.nrr < 100 ? 'bg-red-50' : 'bg-slate-50'}`}>
                      <div className="flex items-center space-x-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] ${csm.nrr >= 110 ? 'bg-green-500' : csm.nrr < 100 ? 'bg-red-500' : 'bg-blue-500'}`}>{idx + 1}</span>
                        <span className="font-medium">{csm.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-500">{formatINR(csm.arr)}</span>
                        <Badge className={`text-[10px] ${csm.nrr >= 110 ? 'bg-green-100 text-green-700' : csm.nrr < 100 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          NRR {csm.nrr}%
                        </Badge>
                        <span className="text-orange-600">{csm.atRisk} at risk</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: GROWTH, BILLING & REVENUE */}
        <TabsContent value="growth" className="space-y-4 mt-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-5 gap-2">
            <KPICard title="Total ARR" value={formatINR(mockData.totals.arr)} icon={IndianRupee} color="blue" />
            <KPICard title="New ARR" value={formatINR(8200000)} subtitle="This Period" icon={TrendingUp} color="green" trend={15} />
            <KPICard title="Expansion" value={formatINR(mockData.totals.expansionARR)} icon={ArrowUp} color="green" trend={22} />
            <KPICard title="Contraction" value={formatINR(1200000)} icon={ArrowDown} color="orange" trend={-5} />
            <KPICard title="Churn ARR" value={formatINR(mockData.totals.churnedARR)} icon={TrendingDown} color="red" trend={-12} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* MRR Trends */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">ARR & MRR Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="mrr" name="MRR" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
                      <Area type="monotone" dataKey="expansionARR" name="Expansion" stroke={COLORS.expansion} fill={COLORS.expansion} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Decomposition */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Decomposition</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="newARR" name="New ARR" fill={COLORS.new} stackId="a" />
                      <Bar dataKey="expansionARR" name="Expansion" fill={COLORS.expansion} stackId="a" />
                      <Bar dataKey="contractionARR" name="Contraction" fill={COLORS.contraction} stackId="b" />
                      <Bar dataKey="churnARR" name="Churn" fill={COLORS.churn} stackId="b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Segment & Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">ARR by Segment</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {mockData.segments.map(seg => (
                    <div key={seg.name} className="p-2 bg-slate-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{seg.name}</span>
                        <span className="text-sm font-bold">{formatINR(seg.arr)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{seg.accounts} accounts</span>
                        <span className={seg.nrr >= 110 ? 'text-green-600' : seg.nrr < 100 ? 'text-red-600' : 'text-blue-600'}>NRR {seg.nrr}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded mt-1">
                        <div className="h-full bg-blue-500 rounded" style={{ width: `${(seg.arr / mockData.totals.arr) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">ARR by Product</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {mockData.products.map(prod => (
                    <div key={prod.name} className="p-2 bg-slate-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium truncate">{prod.name}</span>
                        <span className="text-sm font-bold">{formatINR(prod.arr)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{prod.accounts} accounts</span>
                        <span className={prod.nrr >= 110 ? 'text-green-600' : prod.nrr < 100 ? 'text-red-600' : 'text-blue-600'}>NRR {prod.nrr}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">ARR by Region</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {mockData.regions.map(reg => (
                    <div key={reg.name} className="p-2 bg-slate-50 rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{reg.name}</span>
                        <span className="text-sm font-bold">{formatINR(reg.arr)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{reg.accounts} accounts</span>
                        <span>Renewal {reg.renewalRate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: HEALTH, RISK & CHURN */}
        <TabsContent value="health" className="space-y-4 mt-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-5 gap-2">
            <KPICard title="Healthy ARR" value={formatPct(78)} subtitle={formatINR(56800000)} icon={Heart} color="green" />
            <KPICard title="At Risk ARR" value={formatPct(15)} subtitle={formatINR(10900000)} icon={AlertTriangle} color="yellow" />
            <KPICard title="Critical ARR" value={formatPct(7)} subtitle={formatINR(5100000)} icon={AlertTriangle} color="red" />
            <KPICard title="Declining Usage" value="18" subtitle="accounts" icon={TrendingDown} color="orange" />
            <KPICard title="Logo Churn" value="8" subtitle={formatINR(mockData.totals.churnedARR)} icon={TrendingDown} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Health Distribution */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Health Distribution by ARR</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Healthy', value: 56800000, color: COLORS.healthy },
                          { name: 'At Risk', value: 10900000, color: COLORS.atRisk },
                          { name: 'Critical', value: 5100000, color: COLORS.critical }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {[COLORS.healthy, COLORS.atRisk, COLORS.critical].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatINR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Health Trend */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Health Trend Over Time</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockData.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="healthyPct" name="Healthy %" stroke={COLORS.healthy} fill={COLORS.healthy} fillOpacity={0.3} stackId="1" />
                      <Area type="monotone" dataKey="atRiskPct" name="At Risk %" stroke={COLORS.atRisk} fill={COLORS.atRisk} fillOpacity={0.3} stackId="1" />
                      <Area type="monotone" dataKey="criticalPct" name="Critical %" stroke={COLORS.critical} fill={COLORS.critical} fillOpacity={0.3} stackId="1" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Churn Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Churn Reasons Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.churnReasons} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <YAxis dataKey="reason" type="category" tick={{ fontSize: 10 }} width={80} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Bar dataKey="arr" name="ARR Lost" fill={COLORS.churn} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Churn Reasons Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="space-y-2">
                  {mockData.churnReasons.map(reason => (
                    <div key={reason.reason} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>{reason.reason}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-500">{reason.count} accounts</span>
                        <span className="font-bold">{formatINR(reason.arr)}</span>
                        <Badge variant="outline" className="text-xs">{reason.pct}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: CSM PERFORMANCE */}
        <TabsContent value="csm" className="space-y-4 mt-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-6 gap-2">
            <KPICard title="Total CSMs" value={mockData.totals.csmCount} icon={Users} color="blue" />
            <KPICard title="ARR/CSM" value={formatINR(mockData.totals.arrPerCSM)} icon={IndianRupee} color="green" />
            <KPICard title="Avg Accounts" value={Math.round(mockData.totals.totalCustomers / mockData.totals.csmCount)} icon={Building2} color="purple" />
            <KPICard title="Team NRR" value={formatPct(mockData.totals.nrr)} icon={TrendingUp} color="green" />
            <KPICard title="Expansion ARR" value={formatINR(mockData.totals.expansionARR)} icon={ArrowUp} color="green" />
            <KPICard title="Churn ARR" value={formatINR(mockData.totals.churnedARR)} icon={ArrowDown} color="red" />
          </div>

          {/* CSM Performance Table */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium">CSM Performance Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Rank</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">CSM</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Accounts</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">ARR</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">NRR %</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">GRR %</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Expansion</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Churn</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">At Risk</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">QBR Rate</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">CSAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockData.csmData.map((csm, idx) => (
                      <tr key={csm.name} className={`hover:bg-slate-50 ${csm.nrr >= 110 ? 'bg-green-50/30' : csm.nrr < 100 ? 'bg-red-50/30' : ''}`}>
                        <td className="px-2 py-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-400' : 'bg-slate-300'}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-medium">{csm.name}</td>
                        <td className="px-2 py-2 text-right">{csm.accounts}</td>
                        <td className="px-2 py-2 text-right font-medium">{formatINR(csm.arr)}</td>
                        <td className={`px-2 py-2 text-right font-bold ${csm.nrr >= 110 ? 'text-green-600' : csm.nrr < 100 ? 'text-red-600' : 'text-blue-600'}`}>{csm.nrr}%</td>
                        <td className="px-2 py-2 text-right">{csm.grr}%</td>
                        <td className="px-2 py-2 text-right text-green-600">{formatINR(csm.expansionARR)}</td>
                        <td className="px-2 py-2 text-right text-red-600">{formatINR(csm.churnARR)}</td>
                        <td className="px-2 py-2 text-right">
                          <Badge className={csm.atRisk >= 4 ? 'bg-red-100 text-red-700' : csm.atRisk >= 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {csm.atRisk}
                          </Badge>
                        </td>
                        <td className={`px-2 py-2 text-right ${csm.qbrRate >= 85 ? 'text-green-600' : csm.qbrRate < 70 ? 'text-red-600' : ''}`}>{csm.qbrRate}%</td>
                        <td className="px-2 py-2 text-right">{csm.csat}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Capacity & Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">ARR Distribution by CSM</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.csmData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Bar dataKey="arr" name="ARR" fill={COLORS.primary} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">NRR Performance by CSM</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.csmData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[90, 130]} />
                      <Tooltip />
                      <Bar dataKey="nrr" name="NRR %">
                        {mockData.csmData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.nrr >= 110 ? COLORS.healthy : entry.nrr < 100 ? COLORS.critical : COLORS.primary} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 5: RENEWALS & FORECAST */}
        <TabsContent value="renewals" className="space-y-4 mt-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-5 gap-2">
            <KPICard title="30-Day Renewals" value={formatINR(8500000)} subtitle="8 accounts" icon={Calendar} color="red" />
            <KPICard title="60-Day Renewals" value={formatINR(12200000)} subtitle="12 accounts" icon={Calendar} color="orange" />
            <KPICard title="90-Day Renewals" value={formatINR(15800000)} subtitle="15 accounts" icon={Calendar} color="yellow" />
            <KPICard title="Expected Renewal" value={formatINR(32400000)} subtitle="Probability weighted" icon={Target} color="green" />
            <KPICard title="Projected Churn" value={formatINR(3630000)} icon={TrendingDown} color="red" />
          </div>

          {/* Renewal Pipeline */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Renewal Pipeline</span>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  <Download size={12} className="mr-1" /> Export
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Account</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">CSM</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Current ARR</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Renewal Date</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Days Left</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Health</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Stage</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Probability</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Expected ARR</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Expansion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.slice(0, 15).map((customer, idx) => {
                      const daysLeft = 15 + (idx * 7);
                      const probability = customer.health_status === 'Healthy' ? 95 : customer.health_status === 'At Risk' ? 70 : 40;
                      const stage = ['Committed', 'Negotiation', 'Proposal', 'Discovery', 'Not Started'][idx % 5];
                      return (
                        <tr key={customer.id} className={`hover:bg-slate-50 ${daysLeft <= 30 ? 'bg-red-50/30' : ''}`}>
                          <td className="px-2 py-2">
                            <Link to={`/customers/${customer.id}`} className="font-medium text-blue-600 hover:underline">
                              {customer.company_name}
                            </Link>
                          </td>
                          <td className="px-2 py-2 text-slate-600">{customer.csm_owner_name || 'Unassigned'}</td>
                          <td className="px-2 py-2 text-right font-medium">{formatINR(customer.arr)}</td>
                          <td className="px-2 py-2 text-center text-slate-600">
                            {new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                          </td>
                          <td className={`px-2 py-2 text-center font-medium ${daysLeft <= 30 ? 'text-red-600' : daysLeft <= 60 ? 'text-orange-600' : 'text-green-600'}`}>
                            {daysLeft}d
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge className={`text-xs ${customer.health_status === 'Healthy' ? 'bg-green-100 text-green-700' : customer.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {customer.health_status}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge variant="outline" className="text-xs">{stage}</Badge>
                          </td>
                          <td className={`px-2 py-2 text-right font-medium ${probability >= 80 ? 'text-green-600' : probability >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {probability}%
                          </td>
                          <td className="px-2 py-2 text-right">{formatINR((customer.arr || 0) * probability / 100)}</td>
                          <td className="px-2 py-2 text-center">
                            {idx % 3 === 0 ? (
                              <Badge className="bg-purple-100 text-purple-700 text-xs">+{formatINR((customer.arr || 0) * 0.15)}</Badge>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Renewal Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Renewal Rate Trend</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { quarter: 'Q1', logoRate: 88, revenueRate: 92 },
                      { quarter: 'Q2', logoRate: 90, revenueRate: 94 },
                      { quarter: 'Q3', logoRate: 91, revenueRate: 95 },
                      { quarter: 'Q4', logoRate: 93, revenueRate: 96 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[80, 100]} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="logoRate" name="Logo Renewal %" stroke={COLORS.primary} strokeWidth={2} />
                      <Line type="monotone" dataKey="revenueRate" name="Revenue Renewal %" stroke={COLORS.expansion} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Risk by Renewal Window</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData.renewalBuckets}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                      <Tooltip formatter={(value) => formatINR(value)} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="totalARR" name="Total ARR" fill={COLORS.primary} />
                      <Bar dataKey="atRiskARR" name="At Risk ARR" fill={COLORS.atRisk} />
                      <Bar dataKey="expectedChurn" name="Expected Churn" fill={COLORS.churn} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 6: DATA LABS IMPACT */}
        <TabsContent value="datalabs" className="space-y-4 mt-4">
          {/* Top KPIs */}
          <div className="grid grid-cols-5 gap-2">
            <KPICard title="Reports Generated" value={mockData.dataLabsImpact.reportsGenerated} icon={FileText} color="blue" trend={25} />
            <KPICard title="Accounts Receiving" value={mockData.dataLabsImpact.accountsReceiving} subtitle={`of ${customers.length} total`} icon={Users} color="purple" />
            <KPICard title="Open Rate" value={formatPct(mockData.dataLabsImpact.openRate)} icon={Eye} color="green" />
            <KPICard title="Engagement Rate" value={formatPct(mockData.dataLabsImpact.engagementRate)} icon={TrendingUp} color="blue" />
            <KPICard title="High Engage NRR" value={formatPct(mockData.dataLabsImpact.highEngagementNRR)} subtitle="vs 98% low" icon={Target} color="green" />
          </div>

          {/* Impact Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Report Engagement vs Revenue Impact</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { group: 'High Engagement', nrr: mockData.dataLabsImpact.highEngagementNRR, churnRate: mockData.dataLabsImpact.highEngagementChurn },
                      { group: 'Low/No Engagement', nrr: mockData.dataLabsImpact.lowEngagementNRR, churnRate: mockData.dataLabsImpact.lowEngagementChurn }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="group" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="nrr" name="NRR %" fill={COLORS.expansion} />
                      <Bar dataKey="churnRate" name="Churn Rate %" fill={COLORS.churn} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 p-3 bg-green-50 rounded text-xs">
                  <p className="font-medium text-green-700">💡 Key Insight</p>
                  <p className="text-green-600">Accounts with high Data Labs engagement show 24% higher NRR and 12% lower churn rate.</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-medium">Report Delivery Trends</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData.monthlyTrends.map((m, i) => ({
                      month: m.month,
                      sent: 80 + i * 15,
                      opened: 55 + i * 12,
                      clicked: 35 + i * 8
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="sent" name="Reports Sent" stroke={COLORS.primary} strokeWidth={2} />
                      <Line type="monotone" dataKey="opened" name="Opened" stroke={COLORS.expansion} strokeWidth={2} />
                      <Line type="monotone" dataKey="clicked" name="Engaged" stroke={COLORS.secondary} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution & Engagement Table */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm font-medium">Report Distribution by Account (Top 15)</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Account</th>
                      <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">CSM</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">ARR</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Reports Sent</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Frequency</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Open Rate</th>
                      <th className="px-2 py-2 text-right text-xs font-medium text-slate-500">Engagement</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Last Sent</th>
                      <th className="px-2 py-2 text-center text-xs font-medium text-slate-500">Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.slice(0, 15).map((customer, idx) => {
                      const reportsSent = 12 - (idx % 5) * 2;
                      const openRate = 85 - (idx % 6) * 10;
                      const engagement = openRate > 60 ? 'High' : openRate > 30 ? 'Medium' : 'Low';
                      return (
                        <tr key={customer.id} className={`hover:bg-slate-50 ${openRate < 30 ? 'bg-yellow-50/30' : ''}`}>
                          <td className="px-2 py-2 font-medium">{customer.company_name}</td>
                          <td className="px-2 py-2 text-slate-600">{customer.csm_owner_name || 'Unassigned'}</td>
                          <td className="px-2 py-2 text-right">{formatINR(customer.arr)}</td>
                          <td className="px-2 py-2 text-right">{reportsSent}</td>
                          <td className="px-2 py-2 text-center">
                            <Badge variant="outline" className="text-xs">
                              {idx % 3 === 0 ? 'Weekly' : idx % 3 === 1 ? 'Monthly' : 'Ad-hoc'}
                            </Badge>
                          </td>
                          <td className={`px-2 py-2 text-right ${openRate >= 70 ? 'text-green-600' : openRate < 40 ? 'text-red-600' : 'text-yellow-600'}`}>
                            {openRate}%
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge className={`text-xs ${engagement === 'High' ? 'bg-green-100 text-green-700' : engagement === 'Low' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {engagement}
                            </Badge>
                          </td>
                          <td className="px-2 py-2 text-center text-slate-500 text-xs">
                            {new Date(Date.now() - (idx * 3 + 1) * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-2 py-2 text-center">
                            <Badge className={`text-xs ${customer.health_status === 'Healthy' ? 'bg-green-100 text-green-700' : customer.health_status === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {customer.health_status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drilldown Modal */}
      {drilldownData && (
        <Dialog open={true} onOpenChange={() => setDrilldownData(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Drilldown: {drilldownData.type}</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-sm text-slate-600">Detailed view for {drilldownData.type}</p>
              {/* Add detailed drilldown content here */}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
