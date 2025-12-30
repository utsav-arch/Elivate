import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Edit, Plus, AlertTriangle, TrendingUp, Activity as ActivityIcon, FileText, Heart } from 'lucide-react';
import ActivityForm from '../components/ActivityForm';
import RiskForm from '../components/RiskForm';
import OpportunityForm from '../components/OpportunityForm';
import CustomerEditForm from '../components/CustomerEditForm';
import HealthChangeModal from '../components/HealthChangeModal';
import { toast } from 'sonner';

export default function CustomerDetail() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [risks, setRisks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showRiskForm, setShowRiskForm] = useState(false);
  const [showOpportunityForm, setShowOpportunityForm] = useState(false);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      const [customerRes, activitiesRes, risksRes, opportunitiesRes] = await Promise.all([
        axios.get(`${API}/customers/${customerId}`),
        axios.get(`${API}/activities?customer_id=${customerId}`),
        axios.get(`${API}/risks?customer_id=${customerId}`),
        axios.get(`${API}/opportunities?customer_id=${customerId}`)
      ]);

      setCustomer(customerRes.data);
      setActivities(activitiesRes.data);
      setRisks(risksRes.data);
      setOpportunities(opportunitiesRes.data);
    } catch (error) {
      toast.error('Failed to load customer data');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityAdded = () => {
    setShowActivityForm(false);
    loadCustomerData();
  };

  const handleRiskAdded = () => {
    setShowRiskForm(false);
    loadCustomerData();
  };

  const handleOpportunityAdded = () => {
    setShowOpportunityForm(false);
    loadCustomerData();
  };

  const getHealthBadgeClass = (status) => {
    switch (status) {
      case 'Healthy':
        return 'health-healthy';
      case 'At Risk':
        return 'health-at-risk';
      case 'Critical':
        return 'health-critical';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!customer) return null;

  const openRisks = risks.filter(r => r.status === 'Open' || r.status === 'In Progress');
  const activeOpportunities = opportunities.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost');

  return (
    <div className="px-6 py-8 space-y-6" data-testid="customer-detail-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/customers')}
            className="flex items-center space-x-2"
            data-testid="back-button"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{customer.company_name}</h1>
            <p className="text-slate-600 mt-1">{customer.website}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`${getHealthBadgeClass(customer.health_status)} px-3 py-1.5 text-sm`}>
            Health: {Math.round(customer.health_score)}
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              ${(customer.arr || 0).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">{customer.plan_type}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {customer.active_users} / {customer.total_licensed_users}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {customer.total_licensed_users > 0
                ? Math.round((customer.active_users / customer.total_licensed_users) * 100)
                : 0}% utilization
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Renewal Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">
              {customer.renewal_date ? new Date(customer.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {customer.renewal_date
                ? `${Math.ceil((new Date(customer.renewal_date) - new Date()) / (1000 * 60 * 60 * 24))} days`
                : 'Not set'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">CSM Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-slate-800">
              {customer.csm_owner_name || '-'}
            </div>
            <p className="text-xs text-slate-500 mt-1">{customer.onboarding_status}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="bg-white border-slate-200">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
            <TabsTrigger value="overview" className="rounded-none" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activities" className="rounded-none" data-testid="tab-activities">
              Activities ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="risks" className="rounded-none" data-testid="tab-risks">
              Risks ({openRisks.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="rounded-none" data-testid="tab-opportunities">
              Opportunities ({activeOpportunities.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-600">Industry</label>
                    <p className="text-sm font-medium text-slate-800">{customer.industry || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Region</label>
                    <p className="text-sm font-medium text-slate-800">{customer.region || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Go-Live Date</label>
                    <p className="text-sm font-medium text-slate-800">
                      {customer.go_live_date ? new Date(customer.go_live_date).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Products Purchased</h3>
                <div className="flex flex-wrap gap-2">
                  {customer.products_purchased && customer.products_purchased.length > 0 ? (
                    customer.products_purchased.map((product, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                        {product}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No products listed</p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="text-sm text-slate-600">Primary Objective</label>
                  <p className="text-sm font-medium text-slate-800 mt-1">{customer.primary_objective || '-'}</p>
                </div>
              </div>
            </div>

            {/* Stakeholders */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Stakeholders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.stakeholders && customer.stakeholders.length > 0 ? (
                  customer.stakeholders.map((stakeholder) => (
                    <Card key={stakeholder.id} className="bg-slate-50 border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{stakeholder.full_name}</p>
                            <p className="text-sm text-slate-600">{stakeholder.job_title}</p>
                            <p className="text-sm text-slate-500 mt-1">{stakeholder.email}</p>
                          </div>
                          {stakeholder.is_primary && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Primary</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 col-span-2">No stakeholders added</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Activity Timeline</h3>
              <Button
                onClick={() => setShowActivityForm(true)}
                className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
                data-testid="log-activity-button"
              >
                <Plus size={16} />
                <span>Log Activity</span>
              </Button>
            </div>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No activities logged yet</p>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id} className="bg-white border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <ActivityIcon size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{activity.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{activity.activity_type}</p>
                            </div>
                            <span className="text-sm text-slate-500">
                              {new Date(activity.activity_date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{activity.summary}</p>
                          {activity.sentiment && (
                            <Badge className="mt-2 text-xs">{activity.sentiment}</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Risk Management</h3>
              <Button
                onClick={() => setShowRiskForm(true)}
                className="bg-orange-600 hover:bg-orange-700 flex items-center space-x-2"
                data-testid="flag-risk-button"
              >
                <AlertTriangle size={16} />
                <span>Flag Risk</span>
              </Button>
            </div>

            <div className="space-y-4">
              {risks.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No risks flagged</p>
              ) : (
                risks.map((risk) => (
                  <Card key={risk.id} className="bg-white border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`px-3 py-1 rounded text-sm font-medium ${
                          risk.severity === 'Critical' ? 'risk-critical' :
                          risk.severity === 'High' ? 'risk-high' :
                          risk.severity === 'Medium' ? 'risk-medium' : 'risk-low'
                        }`}>
                          {risk.severity}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-800">{risk.title}</p>
                              <p className="text-sm text-slate-600 mt-1">{risk.category}</p>
                            </div>
                            <Badge variant="outline">{risk.status}</Badge>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">{risk.description}</p>
                          {risk.mitigation_plan && (
                            <div className="mt-3 p-3 bg-slate-50 rounded">
                              <p className="text-xs font-medium text-slate-700">Mitigation Plan:</p>
                              <p className="text-sm text-slate-600 mt-1">{risk.mitigation_plan}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-800">Opportunities</h3>
              <Button
                onClick={() => setShowOpportunityForm(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                data-testid="create-opportunity-button"
              >
                <TrendingUp size={16} />
                <span>Create Opportunity</span>
              </Button>
            </div>

            <div className="space-y-4">
              {opportunities.length === 0 ? (
                <p className="text-center text-slate-500 py-12">No opportunities created</p>
              ) : (
                opportunities.map((opp) => (
                  <Card key={opp.id} className="bg-white border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{opp.title}</p>
                          <p className="text-sm text-slate-600 mt-1">{opp.opportunity_type}</p>
                          {opp.description && (
                            <p className="text-sm text-slate-600 mt-2">{opp.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${(opp.value || 0).toLocaleString()}
                          </p>
                          <Badge className="mt-2">{opp.stage}</Badge>
                        </div>
                      </div>
                      {opp.expected_close_date && (
                        <p className="text-xs text-slate-500 mt-3">
                          Expected close: {new Date(opp.expected_close_date).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Forms */}
      {showActivityForm && (
        <ActivityForm
          customerId={customerId}
          customerName={customer.company_name}
          onClose={() => setShowActivityForm(false)}
          onSuccess={handleActivityAdded}
        />
      )}

      {showRiskForm && (
        <RiskForm
          customerId={customerId}
          customerName={customer.company_name}
          onClose={() => setShowRiskForm(false)}
          onSuccess={handleRiskAdded}
        />
      )}

      {showOpportunityForm && (
        <OpportunityForm
          customerId={customerId}
          customerName={customer.company_name}
          onClose={() => setShowOpportunityForm(false)}
          onSuccess={handleOpportunityAdded}
        />
      )}
    </div>
  );
}
