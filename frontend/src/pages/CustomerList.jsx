import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import CustomerForm from '../components/CustomerForm';
import { toast } from 'sonner';

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    healthStatus: 'all',
    onboardingStatus: 'all'
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchTerm, filters]);

  const loadCustomers = async () => {
    try {
      const response = await axios.get(`${API}/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = [...customers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.website && c.website.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Health status filter
    if (filters.healthStatus !== 'all') {
      filtered = filtered.filter(c => c.health_status === filters.healthStatus);
    }

    // Onboarding status filter
    if (filters.onboardingStatus !== 'all') {
      filtered = filtered.filter(c => c.onboarding_status === filters.onboardingStatus);
    }

    setFilteredCustomers(filtered);
  };

  const handleCustomerCreated = () => {
    setShowForm(false);
    loadCustomers();
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

  const getOnboardingBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'In Progress':
        return 'status-in-progress';
      case 'Not Started':
        return 'status-not-started';
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

  return (
    <div className="px-6 py-8 space-y-6" data-testid="customer-list-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Customers</h1>
          <p className="text-slate-600">{filteredCustomers.length} total customers</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2"
          data-testid="add-customer-button"
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-customers-input"
            />
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.healthStatus}
              onChange={(e) => setFilters({ ...filters, healthStatus: e.target.value })}
              data-testid="filter-health-status"
            >
              <option value="all">All Health Status</option>
              <option value="Healthy">Healthy</option>
              <option value="At Risk">At Risk</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.onboardingStatus}
              onChange={(e) => setFilters({ ...filters, onboardingStatus: e.target.value })}
              data-testid="filter-onboarding-status"
            >
              <option value="all">All Onboarding Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setFilters({ healthStatus: 'all', onboardingStatus: 'all' });
            }}
            className="flex items-center space-x-2"
          >
            <Filter size={18} />
            <span>Clear Filters</span>
          </Button>
        </div>
      </Card>

      {/* Customer Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ARR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Plan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Onboarding
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  CSM Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Renewal Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No customers found
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    data-testid={`customer-row-${customer.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{customer.company_name}</div>
                      <div className="text-xs text-slate-500">{customer.region}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${getHealthBadgeClass(customer.health_status)} px-2 py-1 text-xs`}>
                          {customer.health_status}
                        </Badge>
                        <span className="text-sm text-slate-600">{Math.round(customer.health_score)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800">
                      ${(customer.arr || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {customer.plan_type || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${getOnboardingBadgeClass(customer.onboarding_status)} px-2 py-1 text-xs`}>
                        {customer.onboarding_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {customer.csm_owner_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {customer.renewal_date ? new Date(customer.renewal_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          onClose={() => setShowForm(false)}
          onSuccess={handleCustomerCreated}
        />
      )}
    </div>
  );
}
