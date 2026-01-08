import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { FileText, ExternalLink, Download, Calendar, User, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function DataLabsCustomerReports({ customerId, customerName }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [customerId]);

  const loadReports = async () => {
    try {
      const response = await axios.get(`${API}/datalabs-reports?customer_id=${customerId}`);
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Generated': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-48 rounded-lg"></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Data Labs Reports</h3>
        <Badge variant="outline">{reports.length} reports</Badge>
      </div>

      {reports.length === 0 ? (
        <Card className="bg-slate-50">
          <CardContent className="p-8 text-center">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">No Data Labs reports available for this customer</p>
            <p className="text-sm text-slate-400 mt-1">Reports created in Data Labs will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Report Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Generated</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-blue-600" />
                      <span className="font-medium text-slate-800">{report.report_title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{report.report_type}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{new Date(report.report_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {report.frequency || 'One-time'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusBadgeClass(report.status || 'Generated')}>
                      {report.status || 'Generated'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {report.report_link && (
                        <>
                          <a href={report.report_link} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                          </a>
                          <a href={report.report_link} download>
                            <Button variant="ghost" size="sm">
                              <Download size={14} />
                            </Button>
                          </a>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
