import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Plus, TrendingUp, Filter, GripVertical, Search, RefreshCw } from 'lucide-react';
import OpportunityForm from '../components/OpportunityForm';
import { toast } from 'sonner';

// Format currency in INR
const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const STAGES = [
  { id: 'Identified', label: 'Identified', probability: 10, color: 'slate' },
  { id: 'Qualified', label: 'Qualified', probability: 25, color: 'blue' },
  { id: 'Proposal', label: 'Proposal', probability: 50, color: 'purple' },
  { id: 'Negotiation', label: 'Negotiation', probability: 75, color: 'orange' },
  { id: 'Closed Won', label: 'Closed Won', probability: 100, color: 'green' },
  { id: 'Closed Lost', label: 'Closed Lost', probability: 0, color: 'red' }
];

export default function OpportunityPipeline() {
  const [opportunities, setOpportunities] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [draggedOpp, setDraggedOpp] = useState(null);
  const [filters, setFilters] = useState({
    region: 'all',
    csm: 'all',
    am: 'all',
    search: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [oppsRes, customersRes, usersRes] = await Promise.all([
        axios.get(`${API}/opportunities`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/users`)
      ]);
      setOpportunities(oppsRes.data);
      setCustomers(customersRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const getStageOpps = (stageId) => {
    return opportunities.filter(o => {
      const matchesStage = o.stage === stageId;
      const matchesRegion = filters.region === 'all' || 
        customers.find(c => c.id === o.customer_id)?.region === filters.region;
      const matchesCSM = filters.csm === 'all' || 
        customers.find(c => c.id === o.customer_id)?.csm_owner_id === filters.csm;
      const matchesAM = filters.am === 'all' || o.owner_id === filters.am;
      const matchesSearch = !filters.search || 
        o.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        getCustomerName(o.customer_id).toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStage && matchesRegion && matchesCSM && matchesAM && matchesSearch;
    });
  };

  const getStageValue = (stageId) => getStageOpps(stageId).reduce((sum, o) => sum + (o.value || 0), 0);
  const getCustomerName = (customerId) => customers.find(c => c.id === customerId)?.company_name || 'Unknown';
  const getCustomer = (customerId) => customers.find(c => c.id === customerId);

  // Drag & Drop handlers
  const handleDragStart = (e, opp) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedOpp(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStage) => {
    e.preventDefault();
    
    if (!draggedOpp || draggedOpp.stage === targetStage) return;

    const stageConfig = STAGES.find(s => s.id === targetStage);
    
    try {
      await axios.put(`${API}/opportunities/${draggedOpp.id}`, {
        stage: targetStage,
        probability: stageConfig.probability
      });

      // Log stage change
      await axios.post(`${API}/opportunities/${draggedOpp.id}/stage-log`, {
        from_stage: draggedOpp.stage,
        to_stage: targetStage,
        changed_at: new Date().toISOString()
      }).catch(() => {}); // Ignore if audit log API not ready

      toast.success(`Moved to ${targetStage}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update opportunity');
    }
  };

  const handleOppClick = (opp) => {
    setSelectedOpp(opp);
    setSelectedCustomer(getCustomer(opp.customer_id));
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedOpp(null);
    setSelectedCustomer(null);
    setShowForm(true);
  };

  // Summary calculations
  const totalPipeline = opportunities
    .filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage))
    .reduce((sum, o) => sum + (o.value || 0), 0);
  
  const weightedPipeline = opportunities
    .filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage))
    .reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0);

  const uniqueRegions = [...new Set(customers.map(c => c.region).filter(Boolean))];

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="spinner"></div></div>;
  }

  return (
    <div className="px-6 py-8 space-y-6" data-testid="opportunity-pipeline-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={24} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Opportunity Pipeline</h1>
            <p className="text-slate-600">Drag & drop to update stages</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw size={16} />
          </Button>
          <Button onClick={handleAddNew} className="bg-green-600 hover:bg-green-700">
            <Plus size={16} className="mr-2" />
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{formatINR(totalPipeline)}</div>
            <p className="text-xs text-slate-500">
              {opportunities.filter(o => !['Closed Won', 'Closed Lost'].includes(o.stage)).length} opportunities
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Weighted Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatINR(weightedPipeline)}</div>
            <p className="text-xs text-slate-500">Based on probability</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Won</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatINR(getStageValue('Closed Won'))}</div>
            <p className="text-xs text-slate-500">{getStageOpps('Closed Won').length} deals</p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatINR(getStageValue('Closed Lost'))}</div>
            <p className="text-xs text-slate-500">{getStageOpps('Closed Lost').length} deals</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <Filter size={18} className="text-slate-500" />
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search opportunities..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
          <select
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
          >
            <option value="all">All Regions</option>
            {uniqueRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={filters.csm}
            onChange={(e) => setFilters({ ...filters, csm: e.target.value })}
          >
            <option value="all">All CSMs</option>
            {users.filter(u => u.role === 'CSM').map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={filters.am}
            onChange={(e) => setFilters({ ...filters, am: e.target.value })}
          >
            <option value="all">All AMs</option>
            {users.filter(u => u.role === 'AM' || u.role === 'ADMIN').map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          {(filters.region !== 'all' || filters.csm !== 'all' || filters.am !== 'all' || filters.search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ region: 'all', csm: 'all', am: 'all', search: '' })}
            >
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageOpps = getStageOpps(stage.id);
          const stageValue = getStageValue(stage.id);
          
          return (
            <div
              key={stage.id}
              className={`rounded-lg border-2 p-4 min-h-[500px] transition-colors ${
                draggedOpp && draggedOpp.stage !== stage.id
                  ? `border-${stage.color}-400 bg-${stage.color}-50`
                  : `border-slate-200 bg-slate-50`
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-800">{stage.label}</h3>
                  <p className="text-xs text-slate-500">{stage.probability}% probability</p>
                </div>
                <Badge variant="outline" className="font-medium">
                  {stageOpps.length}
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-600 mb-4 pb-3 border-b">
                {formatINR(stageValue)}
              </p>

              {/* Opportunity Cards */}
              <div className="space-y-3">
                {stageOpps.map(opp => {
                  const customer = getCustomer(opp.customer_id);
                  
                  return (
                    <div
                      key={opp.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, opp)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleOppClick(opp)}
                      className="bg-white rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all border border-slate-100 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <GripVertical size={16} className="text-slate-300 group-hover:text-slate-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 ml-2">
                          <p className="font-medium text-slate-800 text-sm leading-tight">{opp.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{customer?.company_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                        <span className="text-sm font-semibold text-green-600">{formatINR(opp.value)}</span>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {opp.probability}%
                        </span>
                      </div>
                      
                      {opp.expected_close_date && (
                        <p className="text-xs text-slate-400 mt-2">
                          Close: {new Date(opp.expected_close_date).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs"
                      >
                        {opp.opportunity_type}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Form */}
      {showForm && (
        <OpportunityForm
          customerId={selectedCustomer?.id || ''}
          customerName={selectedCustomer?.company_name || 'Select Customer'}
          opportunity={selectedOpp}
          onClose={() => {
            setShowForm(false);
            setSelectedOpp(null);
            setSelectedCustomer(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setSelectedOpp(null);
            setSelectedCustomer(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
