import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Plus, Filter, GripVertical, DollarSign, Calendar, User, Building2, ArrowRight, History } from 'lucide-react';
import OpportunityForm from '../components/OpportunityForm';
import { toast } from 'sonner';

const PIPELINE_STAGES = [
  { id: 'Identified', label: 'Identified', color: 'bg-slate-100 border-slate-300', probability: 10 },
  { id: 'Qualified', label: 'Qualified', color: 'bg-blue-100 border-blue-300', probability: 25 },
  { id: 'Proposal', label: 'Proposal', color: 'bg-purple-100 border-purple-300', probability: 50 },
  { id: 'Negotiation', label: 'Negotiation', color: 'bg-orange-100 border-orange-300', probability: 75 },
  { id: 'Closed Won', label: 'Closed Won', color: 'bg-green-100 border-green-300', probability: 100 },
  { id: 'Closed Lost', label: 'Closed Lost', color: 'bg-red-100 border-red-300', probability: 0 },
  { id: 'Hold', label: 'Hold', color: 'bg-yellow-100 border-yellow-300', probability: 0 }
];

const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function OpportunityPipeline() {
  const [opportunities, setOpportunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [draggedOpp, setDraggedOpp] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(null);
  const [filters, setFilters] = useState({
    region: '',
    product: '',
    am: '',
    csm: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [oppsRes, usersRes] = await Promise.all([
        axios.get(`${API}/opportunities`),
        axios.get(`${API}/users`)
      ]);
      setOpportunities(oppsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, opp) => {
    setDraggedOpp(opp);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStage) => {
    e.preventDefault();
    if (!draggedOpp || draggedOpp.stage === newStage) {
      setDraggedOpp(null);
      return;
    }

    const stageInfo = PIPELINE_STAGES.find(s => s.id === newStage);
    const oldStage = draggedOpp.stage;

    try {
      await axios.put(`${API}/opportunities/${draggedOpp.id}`, {
        stage: newStage,
        probability: stageInfo?.probability || draggedOpp.probability,
        stage_change_log: [
          ...(draggedOpp.stage_change_log || []),
          {
            from: oldStage,
            to: newStage,
            changed_at: new Date().toISOString(),
            probability_before: draggedOpp.probability,
            probability_after: stageInfo?.probability
          }
        ]
      });
      toast.success(`Moved to ${newStage}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update stage');
    }
    setDraggedOpp(null);
  };

  const getOpportunitiesByStage = (stage) => {
    return opportunities.filter(opp => {
      if (opp.stage !== stage) return false;
      if (filters.region && opp.region !== filters.region) return false;
      if (filters.am && opp.owner_id !== filters.am) return false;
      return true;
    });
  };

  const getTotalValue = (stage) => {
    return getOpportunitiesByStage(stage).reduce((sum, opp) => sum + (opp.value || 0), 0);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingOpp(null);
    loadData();
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Opportunity Pipeline</h1>
          <p className="text-slate-600 mt-1">Drag and drop opportunities between stages</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="mb-6 bg-white">
          <CardContent className="p-4">
            <div className="grid grid-cols-6 gap-4">
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Region</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={filters.region}
                  onChange={(e) => setFilters({...filters, region: e.target.value})}
                >
                  <option value="">All Regions</option>
                  <option value="North India">North India</option>
                  <option value="South India">South India</option>
                  <option value="West India">West India</option>
                  <option value="East India">East India</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Account Manager</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={filters.am}
                  onChange={(e) => setFilters({...filters, am: e.target.value})}
                >
                  <option value="">All AMs</option>
                  {users.filter(u => u.role === 'AM').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">CSM</label>
                <select
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  value={filters.csm}
                  onChange={(e) => setFilters({...filters, csm: e.target.value})}
                >
                  <option value="">All CSMs</option>
                  {users.filter(u => u.role === 'CSM').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => setFilters({ region: '', product: '', am: '', csm: '', dateFrom: '', dateTo: '' })}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Kanban Board */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageOpps = getOpportunitiesByStage(stage.id);
          const totalValue = getTotalValue(stage.id);

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-72 ${stage.color} border-2 rounded-lg`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className="p-3 border-b bg-white/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{stage.label}</h3>
                  <Badge variant="outline" className="bg-white">
                    {stageOpps.length}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {formatINR(totalValue)} total
                </p>
              </div>

              {/* Stage Content */}
              <div className="p-2 min-h-[400px] space-y-2">
                {stageOpps.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp)}
                    className={`bg-white rounded-lg p-3 shadow-sm border cursor-move hover:shadow-md transition-shadow ${draggedOpp?.id === opp.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <GripVertical size={14} className="text-slate-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 ml-2">
                        <h4 className="font-medium text-slate-800 text-sm line-clamp-2">{opp.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center">
                          <Building2 size={12} className="mr-1" />
                          {opp.customer_name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-medium flex items-center">
                          <DollarSign size={12} className="mr-1" />
                          {formatINR(opp.value)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {opp.probability}%
                        </Badge>
                      </div>
                      {opp.expected_close_date && (
                        <p className="text-xs text-slate-500 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {new Date(opp.expected_close_date).toLocaleDateString('en-IN')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-slate-500 flex items-center">
                          <User size={12} className="mr-1" />
                          {opp.owner_name || 'Unassigned'}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => setShowAuditLog(opp)}
                        >
                          <History size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {stageOpps.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">
                    Drop opportunities here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Form Modal */}
      {showForm && (
        <OpportunityForm
          customerId={editingOpp?.customer_id}
          customerName={editingOpp?.customer_name}
          opportunity={editingOpp}
          onClose={() => {
            setShowForm(false);
            setEditingOpp(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Audit Log Modal */}
      {showAuditLog && (
        <Dialog open={true} onOpenChange={() => setShowAuditLog(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Stage Change History - {showAuditLog.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {showAuditLog.stage_change_log && showAuditLog.stage_change_log.length > 0 ? (
                showAuditLog.stage_change_log.map((log, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm">
                      <Badge variant="outline">{log.from}</Badge>
                      <ArrowRight size={14} className="text-slate-400" />
                      <Badge variant="outline">{log.to}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(log.changed_at).toLocaleString('en-IN')}
                    </p>
                    {log.probability_before !== log.probability_after && (
                      <p className="text-xs text-slate-600 mt-1">
                        Probability: {log.probability_before}% → {log.probability_after}%
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-4">No stage changes recorded</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
