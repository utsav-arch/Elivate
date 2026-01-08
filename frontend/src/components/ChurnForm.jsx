import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const CHURN_TYPES = ['Logo Churn', 'Partial Churn', 'Downgrade'];

const PRIMARY_CHURN_REASONS = [
  'Price',
  'Product Gaps',
  'Low Usage',
  'Support Issues',
  'Business Closure',
  'Competition',
  'Internal Change',
  'Other'
];

const SECONDARY_REASONS = [
  'Onboarding issues',
  'Feature complexity',
  'Low ROI',
  'Integration challenges',
  'Poor communication',
  'Slow response times',
  'Missing features',
  'Budget cuts'
];

const OWNER_RESPONSIBLE = ['CS', 'Sales', 'Product', 'Support', 'External'];

// Format currency in INR
const formatINR = (amount) => {
  if (!amount) return '₹0';
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function ChurnForm({ customer, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    churn_type: 'Logo Churn',
    effective_churn_date: '',
    revenue_impact: customer?.arr || '',
    contract_end_date: customer?.renewal_date || '',
    primary_reason: '',
    primary_reason_other: '',
    secondary_reasons: [],
    could_have_been_prevented: '',
    owner_responsible: '',
    action_taken_before_churn: '',
    customer_feedback: '',
    internal_notes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.churn_type) newErrors.churn_type = 'Required';
    if (!formData.effective_churn_date) newErrors.effective_churn_date = 'Required';
    if (!formData.revenue_impact) newErrors.revenue_impact = 'Required';
    if (!formData.primary_reason) newErrors.primary_reason = 'Required';
    if (formData.primary_reason === 'Other' && !formData.primary_reason_other) {
      newErrors.primary_reason_other = 'Please specify the reason';
    }
    if (!formData.could_have_been_prevented) newErrors.could_have_been_prevented = 'Required';
    if (!formData.owner_responsible) newErrors.owner_responsible = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSecondaryReasonToggle = (reason) => {
    setFormData(prev => ({
      ...prev,
      secondary_reasons: prev.secondary_reasons.includes(reason)
        ? prev.secondary_reasons.filter(r => r !== reason)
        : [...prev.secondary_reasons, reason]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill all mandatory fields');
      return;
    }

    setLoading(true);

    try {
      // Update customer status to Churn with churn data
      await axios.put(`${API}/customers/${customer.id}/churn`, {
        account_status: 'Churn',
        churn_data: {
          ...formData,
          revenue_impact: parseFloat(formData.revenue_impact),
          churned_at: new Date().toISOString(),
          customer_name: customer.company_name,
          customer_id: customer.id,
          arr_at_churn: customer.arr,
          csm_owner: customer.csm_owner_name,
          am_owner: customer.am_owner_name
        }
      });

      toast.success('Churn recorded successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to record churn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-700">
            <AlertTriangle size={24} />
            <span>Record Churn - {customer?.company_name}</span>
          </DialogTitle>
        </DialogHeader>

        {/* Account Details (Auto-filled) */}
        <Card className="p-4 bg-slate-50">
          <h4 className="font-medium text-slate-800 mb-3">Account Details</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Customer Name</span>
              <p className="font-medium">{customer?.company_name}</p>
            </div>
            <div>
              <span className="text-slate-500">Account ID</span>
              <p className="font-medium">{customer?.id?.slice(0, 8)}...</p>
            </div>
            <div>
              <span className="text-slate-500">Current ARR</span>
              <p className="font-medium text-green-600">{formatINR(customer?.arr)}</p>
            </div>
            <div>
              <span className="text-slate-500">CSM / AM</span>
              <p className="font-medium">{customer?.csm_owner_name || '-'} / {customer?.am_owner_name || '-'}</p>
            </div>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Churn Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800 border-b pb-2">Churn Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Churn Type *</Label>
                <select
                  className={`w-full px-3 py-2 border rounded-md ${errors.churn_type ? 'border-red-500' : 'border-slate-300'}`}
                  value={formData.churn_type}
                  onChange={(e) => setFormData({ ...formData, churn_type: e.target.value })}
                >
                  {CHURN_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Effective Churn Date *</Label>
                <Input
                  type="date"
                  className={errors.effective_churn_date ? 'border-red-500' : ''}
                  value={formData.effective_churn_date}
                  onChange={(e) => setFormData({ ...formData, effective_churn_date: e.target.value })}
                />
                {errors.effective_churn_date && <span className="text-xs text-red-500">{errors.effective_churn_date}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Revenue Impact (₹) *</Label>
                <Input
                  type="number"
                  className={errors.revenue_impact ? 'border-red-500' : ''}
                  value={formData.revenue_impact}
                  onChange={(e) => setFormData({ ...formData, revenue_impact: e.target.value })}
                  placeholder="Lost ARR amount"
                />
                {errors.revenue_impact && <span className="text-xs text-red-500">{errors.revenue_impact}</span>}
              </div>

              <div className="space-y-2">
                <Label>Contract End Date</Label>
                <Input
                  type="date"
                  value={formData.contract_end_date}
                  onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Churn Reasons */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800 border-b pb-2">Churn Reasons</h4>
            
            <div className="space-y-2">
              <Label>Primary Churn Reason *</Label>
              <select
                className={`w-full px-3 py-2 border rounded-md ${errors.primary_reason ? 'border-red-500' : 'border-slate-300'}`}
                value={formData.primary_reason}
                onChange={(e) => setFormData({ ...formData, primary_reason: e.target.value })}
              >
                <option value="">Select primary reason</option>
                {PRIMARY_CHURN_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              {errors.primary_reason && <span className="text-xs text-red-500">{errors.primary_reason}</span>}
            </div>

            {formData.primary_reason === 'Other' && (
              <div className="space-y-2">
                <Label>Please specify *</Label>
                <Input
                  className={errors.primary_reason_other ? 'border-red-500' : ''}
                  value={formData.primary_reason_other}
                  onChange={(e) => setFormData({ ...formData, primary_reason_other: e.target.value })}
                  placeholder="Describe the reason"
                />
                {errors.primary_reason_other && <span className="text-xs text-red-500">{errors.primary_reason_other}</span>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Secondary Reasons (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {SECONDARY_REASONS.map(reason => (
                  <label key={reason} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.secondary_reasons.includes(reason)}
                      onChange={() => handleSecondaryReasonToggle(reason)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{reason}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Ownership & Process */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800 border-b pb-2">Ownership & Process</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Could Have Been Prevented? *</Label>
                <select
                  className={`w-full px-3 py-2 border rounded-md ${errors.could_have_been_prevented ? 'border-red-500' : 'border-slate-300'}`}
                  value={formData.could_have_been_prevented}
                  onChange={(e) => setFormData({ ...formData, could_have_been_prevented: e.target.value })}
                >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Uncertain">Uncertain</option>
                </select>
                {errors.could_have_been_prevented && <span className="text-xs text-red-500">{errors.could_have_been_prevented}</span>}
              </div>

              <div className="space-y-2">
                <Label>Owner Responsible *</Label>
                <select
                  className={`w-full px-3 py-2 border rounded-md ${errors.owner_responsible ? 'border-red-500' : 'border-slate-300'}`}
                  value={formData.owner_responsible}
                  onChange={(e) => setFormData({ ...formData, owner_responsible: e.target.value })}
                >
                  <option value="">Select</option>
                  {OWNER_RESPONSIBLE.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                {errors.owner_responsible && <span className="text-xs text-red-500">{errors.owner_responsible}</span>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Action Taken Before Churn</Label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md min-h-[80px]"
                value={formData.action_taken_before_churn}
                onChange={(e) => setFormData({ ...formData, action_taken_before_churn: e.target.value })}
                placeholder="What steps were taken to prevent this churn?"
              />
            </div>
          </div>

          {/* Feedback & Learnings */}
          <div className="space-y-4">
            <h4 className="font-medium text-slate-800 border-b pb-2">Feedback & Learnings</h4>
            
            <div className="space-y-2">
              <Label>Customer Feedback</Label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md min-h-[80px]"
                value={formData.customer_feedback}
                onChange={(e) => setFormData({ ...formData, customer_feedback: e.target.value })}
                placeholder="Direct feedback from the customer"
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Notes</Label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-md min-h-[60px]"
                value={formData.internal_notes}
                onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                placeholder="Additional internal observations"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Recording...' : 'Record Churn'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
