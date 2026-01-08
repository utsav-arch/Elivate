import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { IndianRupee, Download, Plus, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

// Format currency in INR
const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const INVOICE_STATUSES = ['Draft', 'Raised', 'Partially Paid', 'Paid', 'Overdue'];

export default function InvoiceSection({ customerId, customerName, arr }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    billing_period_start: '',
    billing_period_end: '',
    invoice_amount: '',
    paid_amount: '0',
    due_date: '',
    status: 'Draft'
  });

  useEffect(() => {
    loadInvoices();
  }, [customerId]);

  const loadInvoices = async () => {
    try {
      const response = await axios.get(`${API}/customers/${customerId}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      // If no invoices endpoint yet, use empty array
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/customers/${customerId}/invoices`, {
        ...formData,
        invoice_amount: parseFloat(formData.invoice_amount),
        paid_amount: parseFloat(formData.paid_amount) || 0
      });
      toast.success('Invoice created successfully');
      setShowForm(false);
      setFormData({
        invoice_number: '',
        invoice_date: new Date().toISOString().split('T')[0],
        billing_period_start: '',
        billing_period_end: '',
        invoice_amount: '',
        paid_amount: '0',
        due_date: '',
        status: 'Draft'
      });
      loadInvoices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create invoice');
    }
  };

  // Calculate summary metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.invoice_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const pendingReceivables = totalInvoiced - totalPaid;
  const overdueAmount = invoices
    .filter(inv => inv.status === 'Overdue' || (new Date(inv.due_date) < new Date() && inv.status !== 'Paid'))
    .reduce((sum, inv) => sum + ((inv.invoice_amount || 0) - (inv.paid_amount || 0)), 0);

  // Overdue buckets
  const getOverdueDays = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const overdueBuckets = {
    '0-30': invoices.filter(inv => {
      const days = getOverdueDays(inv.due_date);
      return days > 0 && days <= 30 && inv.status !== 'Paid';
    }).length,
    '31-60': invoices.filter(inv => {
      const days = getOverdueDays(inv.due_date);
      return days > 30 && days <= 60 && inv.status !== 'Paid';
    }).length,
    '61-90': invoices.filter(inv => {
      const days = getOverdueDays(inv.due_date);
      return days > 60 && days <= 90 && inv.status !== 'Paid';
    }).length,
    '90+': invoices.filter(inv => {
      const days = getOverdueDays(inv.due_date);
      return days > 90 && inv.status !== 'Paid';
    }).length
  };

  const getStatusBadgeClass = (status, dueDate) => {
    if (status === 'Paid') return 'bg-green-100 text-green-700';
    if (status === 'Partially Paid') return 'bg-blue-100 text-blue-700';
    if (status === 'Overdue' || (new Date(dueDate) < new Date() && status !== 'Paid')) return 'bg-red-100 text-red-700';
    if (status === 'Raised') return 'bg-orange-100 text-orange-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">Booked Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatINR(arr)}</div>
            <p className="text-xs text-blue-600">Total ARR</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700">Invoiced Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{formatINR(totalInvoiced)}</div>
            <p className="text-xs text-purple-600">{invoices.length} invoices raised</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">Realized Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatINR(totalPaid)}</div>
            <p className="text-xs text-green-600">Paid invoices</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-orange-700">Pending Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{formatINR(pendingReceivables)}</div>
            <p className="text-xs text-orange-600">Invoiced but unpaid</p>
          </CardContent>
        </Card>

        <Card className={`${overdueAmount > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm ${overdueAmount > 0 ? 'text-red-700' : 'text-slate-700'}`}>Overdue Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overdueAmount > 0 ? 'text-red-800' : 'text-slate-800'}`}>{formatINR(overdueAmount)}</div>
            <p className={`text-xs ${overdueAmount > 0 ? 'text-red-600' : 'text-slate-600'}`}>Beyond due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Buckets */}
      {(overdueBuckets['0-30'] > 0 || overdueBuckets['31-60'] > 0 || overdueBuckets['61-90'] > 0 || overdueBuckets['90+'] > 0) && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700 flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>Overdue Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-orange-600">{overdueBuckets['0-30']}</div>
                <div className="text-xs text-slate-600">0-30 days</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-orange-700">{overdueBuckets['31-60']}</div>
                <div className="text-xs text-slate-600">31-60 days</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-red-600">{overdueBuckets['61-90']}</div>
                <div className="text-xs text-slate-600">61-90 days</div>
              </div>
              <div className="text-center p-2 bg-white rounded">
                <div className="text-lg font-bold text-red-700">{overdueBuckets['90+']}</div>
                <div className="text-xs text-slate-600">90+ days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Table */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={16} className="mr-2" />
            Raise Invoice
          </Button>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <IndianRupee size={48} className="mx-auto mb-4 opacity-50" />
              <p>No invoices raised yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Billing Period</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((invoice) => {
                    const balance = (invoice.invoice_amount || 0) - (invoice.paid_amount || 0);
                    const overdueDays = getOverdueDays(invoice.due_date);
                    const isOverdue = overdueDays > 0 && invoice.status !== 'Paid';
                    
                    return (
                      <tr key={invoice.id} className={`hover:bg-slate-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                        <td className="px-4 py-3 font-medium text-slate-800">{invoice.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(invoice.invoice_date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {invoice.billing_period_start && invoice.billing_period_end ? (
                            `${new Date(invoice.billing_period_start).toLocaleDateString('en-IN')} - ${new Date(invoice.billing_period_end).toLocaleDateString('en-IN')}`
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{formatINR(invoice.invoice_amount)}</td>
                        <td className="px-4 py-3 text-green-600">{formatINR(invoice.paid_amount)}</td>
                        <td className="px-4 py-3 font-medium text-orange-600">{formatINR(balance)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}>
                            {new Date(invoice.due_date).toLocaleDateString('en-IN')}
                          </span>
                          {isOverdue && (
                            <span className="block text-xs text-red-500">{overdueDays} days overdue</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusBadgeClass(invoice.status, invoice.due_date)}>
                            {isOverdue && invoice.status !== 'Paid' ? 'Overdue' : invoice.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm">
                            <Download size={16} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Form Modal */}
      {showForm && (
        <Dialog open={true} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Raise Invoice - {customerName}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number *</Label>
                  <Input
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    placeholder="INV-2025-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Invoice Date *</Label>
                  <Input
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Billing Period Start</Label>
                  <Input
                    type="date"
                    value={formData.billing_period_start}
                    onChange={(e) => setFormData({ ...formData, billing_period_start: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Period End</Label>
                  <Input
                    type="date"
                    value={formData.billing_period_end}
                    onChange={(e) => setFormData({ ...formData, billing_period_end: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Amount (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.invoice_amount}
                    onChange={(e) => setFormData({ ...formData, invoice_amount: e.target.value })}
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Paid Amount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.paid_amount}
                    onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date *</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status *</Label>
                  <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    required
                  >
                    {INVOICE_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Raise Invoice
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
