import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Edit, Save, X, Globe, Phone, Server, Users, Cpu, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AI_FEATURE_TOGGLES = [
  { key: 'call_summary', label: 'Call Summary' },
  { key: 'entity_extraction', label: 'Entity Extraction' },
  { key: 'ai_insights', label: 'AI Insights' },
  { key: 'lead_score', label: 'Lead Score' },
  { key: 'csat_score', label: 'CSAT Score' },
  { key: 'collection_score', label: 'Collection Score' },
  { key: 'ai_auditing', label: 'AI Auditing' },
  { key: 'customer_intelligence', label: 'Customer Intelligence' },
  { key: 'ai_coaching_lms', label: 'AI Coaching & LMS' },
  { key: 'ai_disposition', label: 'AI Disposition' },
  { key: 'manual_qa', label: 'Manual QA' }
];

export default function CustomerSetupDetails({ customerId, customerName }) {
  const [setupData, setSetupData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    client_name: customerName || '',
    domain_link: '',
    process_name: '',
    integration_done_by: '',
    onboarding_done_by: '',
    delivery_spoc: '',
    telephony_name: '',
    integration_type: '',
    call_flow_type: '',
    audits_based_on: '',
    crm_integration: false,
    crm_name: '',
    languages_supported: [],
    ai_features: {}
  });

  useEffect(() => {
    loadSetupData();
  }, [customerId]);

  const loadSetupData = async () => {
    try {
      const response = await axios.get(`${API}/customers/${customerId}/setup`);
      setSetupData(response.data);
      setFormData(response.data);
    } catch (error) {
      // Initialize with defaults if not found
      const defaultData = {
        client_name: customerName || '',
        domain_link: '',
        process_name: '',
        integration_done_by: '',
        onboarding_done_by: '',
        delivery_spoc: '',
        telephony_name: '',
        integration_type: 'API',
        call_flow_type: 'Inbound',
        audits_based_on: 'Percentage',
        crm_integration: false,
        crm_name: '',
        languages_supported: ['English'],
        ai_features: AI_FEATURE_TOGGLES.reduce((acc, f) => ({ ...acc, [f.key]: false }), {})
      };
      setFormData(defaultData);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${API}/customers/${customerId}/setup`, formData);
      setSetupData(formData);
      setIsEditing(false);
      toast.success('Setup details saved');
    } catch (error) {
      toast.error('Failed to save setup details');
    }
  };

  const toggleAIFeature = (key) => {
    setFormData(prev => ({
      ...prev,
      ai_features: {
        ...prev.ai_features,
        [key]: !prev.ai_features?.[key]
      }
    }));
  };

  const handleLanguageToggle = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages_supported: prev.languages_supported?.includes(lang)
        ? prev.languages_supported.filter(l => l !== lang)
        : [...(prev.languages_supported || []), lang]
    }));
  };

  if (loading) {
    return <div className="animate-pulse bg-slate-100 h-48 rounded-lg"></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Setup & Configuration Details</h3>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(setupData || {}); }}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save size={16} className="mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Server size={18} className="mr-2 text-blue-600" />
            Basic Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Client Name</Label>
            {isEditing ? (
              <Input value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.client_name || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Domain Link</Label>
            {isEditing ? (
              <Input value={formData.domain_link} onChange={(e) => setFormData({...formData, domain_link: e.target.value})} placeholder="https://client.convin.ai" />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.domain_link || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Process Name</Label>
            {isEditing ? (
              <Input value={formData.process_name} onChange={(e) => setFormData({...formData, process_name: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.process_name || '-'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team & Ownership */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Users size={18} className="mr-2 text-green-600" />
            Team & Ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Integration Done By</Label>
            {isEditing ? (
              <Input value={formData.integration_done_by} onChange={(e) => setFormData({...formData, integration_done_by: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.integration_done_by || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Onboarding Done By</Label>
            {isEditing ? (
              <Input value={formData.onboarding_done_by} onChange={(e) => setFormData({...formData, onboarding_done_by: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.onboarding_done_by || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Delivery SPOC</Label>
            {isEditing ? (
              <Input value={formData.delivery_spoc} onChange={(e) => setFormData({...formData, delivery_spoc: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.delivery_spoc || '-'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Phone size={18} className="mr-2 text-purple-600" />
            Integration Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Telephony Name</Label>
            {isEditing ? (
              <Input value={formData.telephony_name} onChange={(e) => setFormData({...formData, telephony_name: e.target.value})} />
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.telephony_name || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Integration Type</Label>
            {isEditing ? (
              <select className="w-full px-3 py-2 border rounded-md" value={formData.integration_type} onChange={(e) => setFormData({...formData, integration_type: e.target.value})}>
                <option value="API">API</option>
                <option value="Webhook">Webhook</option>
                <option value="SDK">SDK</option>
                <option value="Manual">Manual</option>
              </select>
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.integration_type || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Call Flow Type</Label>
            {isEditing ? (
              <select className="w-full px-3 py-2 border rounded-md" value={formData.call_flow_type} onChange={(e) => setFormData({...formData, call_flow_type: e.target.value})}>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Blended">Blended</option>
              </select>
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.call_flow_type || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Audits Based On</Label>
            {isEditing ? (
              <select className="w-full px-3 py-2 border rounded-md" value={formData.audits_based_on} onChange={(e) => setFormData({...formData, audits_based_on: e.target.value})}>
                <option value="Percentage">Percentage</option>
                <option value="Random">Random</option>
                <option value="All Calls">All Calls</option>
                <option value="Custom Rules">Custom Rules</option>
              </select>
            ) : (
              <p className="text-sm font-medium text-slate-800">{formData.audits_based_on || '-'}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>CRM Integration</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <input type="checkbox" checked={formData.crm_integration} onChange={(e) => setFormData({...formData, crm_integration: e.target.checked})} className="rounded" />
                <Input value={formData.crm_name} onChange={(e) => setFormData({...formData, crm_name: e.target.value})} placeholder="CRM Name" disabled={!formData.crm_integration} className="flex-1" />
              </div>
            ) : (
              <p className="text-sm font-medium text-slate-800">
                {formData.crm_integration ? `Yes - ${formData.crm_name || 'N/A'}` : 'No'}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Globe size={18} className="mr-2 text-orange-600" />
            Languages Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'].map(lang => (
                <label key={lang} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={formData.languages_supported?.includes(lang)} onChange={() => handleLanguageToggle(lang)} className="rounded" />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.languages_supported?.map(lang => (
                <Badge key={lang} variant="secondary">{lang}</Badge>
              )) || <span className="text-slate-500">No languages configured</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Cpu size={18} className="mr-2 text-indigo-600" />
            AI & Feature Toggles (Go-Live)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AI_FEATURE_TOGGLES.map(feature => (
              <div
                key={feature.key}
                onClick={() => isEditing && toggleAIFeature(feature.key)}
                className={`p-3 rounded-lg border flex items-center justify-between ${isEditing ? 'cursor-pointer hover:bg-slate-50' : ''} ${formData.ai_features?.[feature.key] ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}
              >
                <span className="text-sm font-medium text-slate-700">{feature.label}</span>
                {formData.ai_features?.[feature.key] ? (
                  <CheckCircle size={18} className="text-green-600" />
                ) : (
                  <XCircle size={18} className="text-slate-400" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
