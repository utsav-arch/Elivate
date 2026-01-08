import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { IndianRupee, Plus, Edit, Trash2, Download, AlertTriangle, Calendar, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const formatINR = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export default function InvoiceSection({ customerId, customerName, arr }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    billing_period_start: '',
    billing_period_end: '',
    invoice_amount: '',
    paid_amount: 0,
    due_date: '',
    status: 'Raised'
  });

  useEffect(() => {
    loadInvoices();
  }, [customerId]);

  const loadInvoices = async () => {
    try {
      const response = await axios.get(`${API}/customers/${customerId}/invoices`);
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvoice) {
        await axios.put(`${API}/customers/${customerId}/invoices/${editingInvoice.id}`, formData);
        toast.success('Invoice updated');
      } else {
        await axios.post(`${API}/customers/${customerId}/invoices`, formData);
        toast.success('Invoice created');
      }
      setShowForm(false);
      setEditingInvoice(null);
      resetForm();
      loadInvoices();
    } catch (error) {
      toast.error('Failed to save invoice');
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoice_number: invoice.invoice_number,
      invoice_date: invoice.invoice_date,
      billing_period_start: invoice.billing_period_start || '',
      billing_period_end: invoice.billing_period_end || '',
      invoice_amount: invoice.invoice_amount,
      paid_amount: invoice.paid_amount,
      due_date: invoice.due_date,
      status: invoice.status
    });
    setShowForm(true);
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await axios.delete(`${API}/customers/${customerId}/invoices/${invoiceId}`);
      toast.success('Invoice deleted');
      loadInvoices();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      await axios.put(`${API}/customers/${customerId}/invoices/${invoice.id}`, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      loadInvoices();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      invoice_number: '',
      invoice_date: new Date().toISOString().split('T')[0],
      billing_period_start: '',
      billing_period_end: '',
      invoice_amount: '',
      paid_amount: 0,
      due_date: '',
      status: 'Raised'
    });
  };

  // Calculate summary metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.invoice_amount || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const pending = totalInvoiced - totalPaid;
  const overdue = invoices.filter(inv => inv.status === 'Overdue' || (new Date(inv.due_date) < new Date() && inv.status !== 'Paid')).reduce((sum, inv) => sum + (inv.invoice_amount - inv.paid_amount), 0);

  // Overdue buckets
  const today = new Date();
  const getOverdueDays = (dueDate) => Math.ceil((today - new Date(dueDate)) / (1000 * 60 * 60 * 24));
  const overdueBuckets = {
    '0-30': invoices.filter(inv => { const days = getOverdueDays(inv.due_date); return days > 0 && days <= 30 && inv.status !== 'Paid'; }).length,
    '31-60': invoices.filter(inv => { const days = getOverdueDays(inv.due_date); return days > 30 && days <= 60 && inv.status !== 'Paid'; }).length,
    '61-90': invoices.filter(inv => { const days = getOverdueDays(inv.due_date); return days > 60 && days <= 90 && inv.status !== 'Paid'; }).length,
    '90+': invoices.filter(inv => { const days = getOverdueDays(inv.due_date); return days > 90 && inv.status !== 'Paid'; }).length
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-48 rounded"></div>;
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <p className="text-xs text-blue-600">Booked Revenue</p>
            <p className="text-lg font-bold text-blue-800">{formatINR(arr)}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="p-3">
            <p className="text-xs text-slate-600">Invoiced</p>
            <p className="text-lg font-bold text-slate-800">{formatINR(totalInvoiced)}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3">
            <p className="text-xs text-green-600">Realized</p>
            <p className="text-lg font-bold text-green-800">{formatINR(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-3">
            <p className="text-xs text-yellow-600">Pending</p>
            <p className="text-lg font-bold text-yellow-800">{formatINR(pending)}</p>
          </CardContent>
        </Card>
        <Card className={`${overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50'}`}>
          <CardContent className="p-3">
            <p className={`text-xs ${overdue > 0 ? 'text-red-600' : 'text-slate-600'}`}>Overdue</p>
            <p className={`text-lg font-bold ${overdue > 0 ? 'text-red-800' : 'text-slate-800'}`}>{formatINR(overdue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Buckets */}
      {(overdueBuckets['0-30'] > 0 || overdueBuckets['31-60'] > 0 || overdueBuckets['61-90'] > 0 || overdueBuckets['90+'] > 0) && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-3">
            <p className="text-xs font-medium text-orange-700 mb-2">Overdue Analysis</p>
            <div className="flex space-x-3 text-xs">
              <span className="px-2 py-1 bg-yellow-100 rounded">0-30d: {overdueBuckets['0-30']}</span>
              <span className="px-2 py-1 bg-orange-100 rounded">31-60d: {overdueBuckets['31-60']}</span>
              <span className="px-2 py-1 bg-red-100 rounded">61-90d: {overdueBuckets['61-90']}</span>
              <span className="px-2 py-1 bg-red-200 rounded">90+d: {overdueBuckets['90+']}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Table */}
      <Card>
        <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Invoices</CardTitle>
          <Button size="sm" onClick={() => { resetForm(); setEditingInvoice(null); setShowForm(true); }} className="h-7 text-xs bg-blue-600 hover:bg-blue-700">
            <Plus size={12} className="mr-1" /> Raise Invoice
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No invoices yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-y">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">#</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Amount</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Paid</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Due</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => {
                    const isOverdue = new Date(inv.due_date) < today && inv.status !== 'Paid';
                    const daysOverdue = isOverdue ? getOverdueDays(inv.due_date) : 0;
                    return (
                      <tr key={inv.id} className={isOverdue ? 'bg-red-50' : 'hover:bg-slate-50'}>
                        <td className="px-3 py-2 font-medium">{inv.invoice_number}</td>
                        <td className="px-3 py-2 text-slate-600">{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                        <td className="px-3 py-2 font-medium">{formatINR(inv.invoice_amount)}</td>
                        <td className="px-3 py-2 text-green-600">{formatINR(inv.paid_amount)}</td>
                        <td className="px-3 py-2">
                          <span className={isOverdue ? 'text-red-600' : ''}>
                            {new Date(inv.due_date).toLocaleDateString('en-IN')}
                            {isOverdue && <span className="text-xs ml-1">({daysOverdue}d)</span>}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={inv.status}
                            onChange={(e) => handleStatusChange(inv, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Overdue' || isOverdue ? 'bg-red-100 text-red-700' : inv.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Raised">Raised</option>
                            <option value="Partially Paid">Partially Paid</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEdit(inv)}>
                              <Edit size={12} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-600" onClick={() => handleDelete(inv.id)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
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
        <Dialog open={true} onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Raise Invoice'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600">Invoice #</label>
                  <Input value={formData.invoice_number} onChange={(e) => setFormData({...formData, invoice_number: e.target.value})} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Invoice Date</label>
                  <Input type="date" value={formData.invoice_date} onChange={(e) => setFormData({...formData, invoice_date: e.target.value})} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Amount</label>
                  <Input type="number" value={formData.invoice_amount} onChange={(e) => setFormData({...formData, invoice_amount: parseFloat(e.target.value)})} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Due Date</label>
                  <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} required className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Paid Amount</label>
                  <Input type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: parseFloat(e.target.value) || 0})} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Status</label>
                  <select className="w-full mt-1 px-3 py-2 border rounded-md text-sm" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Draft">Draft</option>
                    <option value="Raised">Raised</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">{editingInvoice ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
