import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import ChurnForm from './ChurnForm';
import { toast } from 'sonner';

const ACCOUNT_STATUSES = [
  { value: 'POC/Pilot', label: 'POC/Pilot', color: 'bg-orange-100 text-orange-700', description: 'Proof of concept or pilot phase' },
  { value: 'Onboarding', label: 'Onboarding', color: 'bg-blue-100 text-blue-700', description: 'Customer is being onboarded' },
  { value: 'UAT', label: 'UAT', color: 'bg-purple-100 text-purple-700', description: 'User acceptance testing' },
  { value: 'Live', label: 'Live', color: 'bg-green-100 text-green-700', description: 'Active and live customer' },
  { value: 'Hold', label: 'Hold', color: 'bg-yellow-100 text-yellow-700', description: 'Account temporarily on hold' },
  { value: 'Churn', label: 'Churned', color: 'bg-red-100 text-red-700', description: 'Customer has churned' }
];

export default function AccountStatusChange({ customer, onClose, onSuccess }) {
  const [selectedStatus, setSelectedStatus] = useState(customer?.account_status || 'Live');
  const [loading, setLoading] = useState(false);
  const [showChurnForm, setShowChurnForm] = useState(false);

  const currentStatus = ACCOUNT_STATUSES.find(s => s.value === customer?.account_status) || ACCOUNT_STATUSES[3];

  const handleStatusChange = async () => {
    if (selectedStatus === 'Churn') {
      // Show churn form instead of direct status change
      setShowChurnForm(true);
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${API}/customers/${customer.id}`, {
        account_status: selectedStatus
      });
      toast.success(`Account status changed to ${selectedStatus}`);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change status');
    } finally {
      setLoading(false);
    }
  };

  const handleChurnSuccess = () => {
    setShowChurnForm(false);
    onSuccess();
  };

  if (showChurnForm) {
    return (
      <ChurnForm
        customer={customer}
        onClose={() => setShowChurnForm(false)}
        onSuccess={handleChurnSuccess}
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Account Status - {customer?.company_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-4 bg-slate-50 rounded-lg">
            <Label className="text-slate-600">Current Status</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={`${currentStatus.color} px-3 py-1`}>
                {currentStatus.label}
              </Badge>
              <span className="text-sm text-slate-500">{currentStatus.description}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-3">
            <Label>Select New Status</Label>
            <div className="space-y-2">
              {ACCOUNT_STATUSES.map((status) => (
                <div
                  key={status.value}
                  onClick={() => setSelectedStatus(status.value)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    selectedStatus === status.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${status.value === 'Churn' ? 'border-red-200 hover:border-red-300' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="status"
                        checked={selectedStatus === status.value}
                        onChange={() => setSelectedStatus(status.value)}
                        className="text-blue-600"
                      />
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    {status.value === 'Churn' && (
                      <AlertTriangle size={16} className="text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 ml-7">{status.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Warning for Churn */}
          {selectedStatus === 'Churn' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-700">Churn requires additional information</p>
                  <p className="text-sm text-red-600 mt-1">
                    You will be required to fill out a churn form with mandatory fields before the status can be changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={loading || selectedStatus === customer?.account_status}
              className={selectedStatus === 'Churn' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {loading ? 'Updating...' : (selectedStatus === 'Churn' ? 'Proceed to Churn Form' : 'Change Status')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
