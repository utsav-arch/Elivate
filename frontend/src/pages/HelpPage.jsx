import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  LayoutDashboard, 
  CheckSquare, 
  TrendingUp, 
  FileText, 
  Settings, 
  AlertTriangle,
  IndianRupee,
  BarChart3,
  Bell,
  Link2,
  HelpCircle,
  BookOpen
} from 'lucide-react';

const HELP_SECTIONS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Overview of your customer success metrics and KPIs',
    articles: [
      { title: 'Understanding Dashboard Metrics', content: 'The dashboard provides a real-time overview of total customers, ARR, health distribution, open risks, and pipeline value. Use the quick stats cards to monitor your portfolio at a glance.' },
      { title: 'Health Score Distribution', content: 'View the breakdown of customers by health status: Healthy (green), At Risk (yellow), and Critical (red). Click on any segment to filter the customer list.' },
      { title: 'Recent Activities', content: 'Track the latest customer interactions, meetings, and touchpoints. Activities are automatically logged when CSMs record customer engagements.' }
    ]
  },
  {
    id: 'customers',
    title: 'Customer Management',
    icon: Users,
    description: 'Manage customer profiles, health scores, and account details',
    articles: [
      { title: 'Adding a New Customer', content: 'Click "Add Customer" from the Customers page. Fill in company details, ARR, plan type, and assign a CSM owner. Required fields are marked with an asterisk.' },
      { title: 'Bulk Upload Customers', content: 'Use the "Bulk Upload" feature to import multiple customers via CSV. Download the template to ensure correct formatting.' },
      { title: 'Customer Detail View', content: 'Click on any customer to view detailed information including: Overview (basic info, stakeholders), Activities, Risks, Opportunities, Documents, Invoice & Revenue, and Account Settings.' },
      { title: 'Changing Customer Health', content: 'Use the "Change Health" button to manually adjust health status. If changing to At Risk or Critical, you may be prompted to create a risk record.' },
      { title: 'Managing Stakeholders', content: 'Add key contacts under the Stakeholders section. Mark primary contacts and decision makers for easy identification.' }
    ]
  },
  {
    id: 'invoices',
    title: 'Invoice & Revenue',
    icon: IndianRupee,
    description: 'Track invoices, payments, and revenue metrics',
    articles: [
      { title: 'Revenue Summary Cards', content: 'View Booked Revenue (ARR), Invoiced Amount, Realized Revenue (paid), Pending Receivables, and Overdue Amount at a glance.' },
      { title: 'Creating Invoices', content: 'Click "Raise Invoice" to create a new invoice. Enter invoice number, date, amount, billing period, and due date. Status options: Draft, Raised, Partially Paid, Paid, Overdue.' },
      { title: 'Overdue Analysis', content: 'The overdue buckets show aging analysis: 0-30 days, 31-60 days, 61-90 days, and 90+ days. Red highlighting indicates critical overdue amounts.' },
      { title: 'Commercial Risk Auto-Creation', content: 'When an invoice becomes overdue, the system automatically creates a Commercial Risk flagging the payment issue.' }
    ]
  },
  {
    id: 'churn',
    title: 'Account Status & Churn',
    icon: AlertTriangle,
    description: 'Manage account lifecycle and record churn',
    articles: [
      { title: 'Account Status Types', content: 'Statuses include: POC/Pilot, Onboarding, UAT, Live, Hold, and Churned. Status changes can only be made from Customer → Account Settings → Status.' },
      { title: 'Recording Churn', content: 'When changing status to Churned, a mandatory Churn Form must be completed. This captures churn type, reason, revenue impact, and prevention analysis.' },
      { title: 'Churn Form Fields', content: 'Required fields: Churn Type (Logo/Partial/Downgrade), Effective Date, Revenue Impact, Primary Reason, Could Have Been Prevented, Owner Responsible.' },
      { title: 'Churn Reports', content: 'Access churn analytics from Reports → Churn Analysis. View breakdowns by reason, CSM, product, and region.' }
    ]
  },
  {
    id: 'tasks',
    title: 'Task Management',
    icon: CheckSquare,
    description: 'Create and track customer-related tasks',
    articles: [
      { title: 'Creating Tasks', content: 'Click "Add Task" and select customer, task type, priority, assignee, and due date. Task types include Follow-up Call, QBR Prep, Training, Escalation, etc.' },
      { title: 'Task Statuses', content: 'Track progress: Not Started, In Progress, Blocked, Waiting on Customer, Completed, Cancelled.' },
      { title: 'Filtering Tasks', content: 'Filter by status, priority, assignee (CSM), or customer. Use "My Tasks" quick filter to see your assignments.' },
      { title: 'Overdue Tasks', content: 'Tasks past due date are highlighted in red. Dashboard shows overdue task count for immediate attention.' }
    ]
  },
  {
    id: 'opportunities',
    title: 'Opportunity Pipeline',
    icon: TrendingUp,
    description: 'Manage upsell and expansion opportunities',
    articles: [
      { title: 'Kanban Pipeline View', content: 'Drag and drop opportunities between stages: Identified → Qualified → Proposal → Negotiation → Closed Won/Lost → Hold.' },
      { title: 'Stage Probability', content: 'Each stage has a default probability: Identified (10%), Qualified (25%), Proposal (50%), Negotiation (75%), Closed Won (100%).' },
      { title: 'Audit Log', content: 'Click the history icon on any opportunity to view stage change history with timestamps and probability changes.' },
      { title: 'Pipeline Filters', content: 'Filter by Region, Account Manager, CSM, or Date Range to focus on specific segments.' }
    ]
  },
  {
    id: 'datalabs',
    title: 'Data Labs',
    icon: FileText,
    description: 'Custom reports and analytics',
    articles: [
      { title: 'Creating Reports', content: 'Navigate to Data Labs and click "New Report". Select customer, report type, and add the report link. Reports are typically hosted externally.' },
      { title: 'Report Types', content: 'Common types: Weekly Performance, Monthly Analytics, QBR Deck, Usage Report, Custom Analysis.' },
      { title: 'Customer-Level Reports', content: 'Access Data Labs reports for specific customers via Customer → Insights → Data Labs Reports tab.' }
    ]
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    icon: BarChart3,
    description: 'Standard reports and dashboards',
    articles: [
      { title: 'Available Reports', content: 'Access: Health Score Trends, Revenue Analytics, Churn Analysis, Task Completion, Risk Overview, and Renewal Forecasts.' },
      { title: 'Exporting Data', content: 'Most reports support CSV and PDF export. Click the download icon in the report header.' },
      { title: 'Custom Date Ranges', content: 'Use date pickers to analyze specific time periods. Compare current vs previous periods for trend analysis.' }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations',
    icon: Link2,
    description: 'Connect third-party tools and services',
    articles: [
      { title: 'Available Integrations', content: 'Connect with: Intercom, Jira, Gmail, Google Calendar, Freshdesk, Slack, and Zoho Cliq.' },
      { title: 'Connecting Services', content: 'Navigate to Settings → Integrations. Click "Connect" on any integration and follow the OAuth flow to authorize access.' },
      { title: 'Sync Logs', content: 'View sync activity and troubleshoot issues via the "Sync Logs" button. Logs show recent actions and their status.' },
      { title: 'Managing Permissions', content: 'Click the settings icon on any integration to manage features and permissions (read/write access).' }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: Settings,
    description: 'Configure platform settings and preferences',
    articles: [
      { title: 'User Management', content: 'Admin users can manage team members, roles, and permissions from Settings → Users.' },
      { title: 'Organization Settings', content: 'Configure company name, currency, date format, and other organization-wide preferences.' },
      { title: 'Notifications', content: 'Set up email and in-app notification preferences. Choose which events trigger alerts.' },
      { title: 'Security', content: 'Manage password policies, session timeouts, and two-factor authentication settings.' }
    ]
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(['dashboard']);

  const toggleSection = (id) => {
    setExpandedSections(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return HELP_SECTIONS;
    
    const query = searchQuery.toLowerCase();
    return HELP_SECTIONS.map(section => ({
      ...section,
      articles: section.articles.filter(
        article => 
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      )
    })).filter(section => 
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.articles.length > 0
    );
  }, [searchQuery]);

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen size={32} className="text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-800">Help Center</h1>
        </div>
        <p className="text-slate-600">Find answers and learn how to use Convin Elevate</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <Input
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-lg"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {HELP_SECTIONS.slice(0, 5).map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => {
                setExpandedSections([section.id]);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="p-3 bg-white border rounded-lg hover:bg-slate-50 transition-colors text-center"
            >
              <Icon size={24} className="mx-auto text-blue-600 mb-2" />
              <span className="text-sm font-medium text-slate-700">{section.title}</span>
            </button>
          );
        })}
      </div>

      {/* Help Sections */}
      <div className="space-y-4">
        {filteredSections.map(section => {
          const Icon = section.icon;
          const isExpanded = expandedSections.includes(section.id);
          
          return (
            <Card key={section.id} id={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon size={24} className="text-blue-600" />
                  <div className="text-left">
                    <h2 className="font-semibold text-slate-800">{section.title}</h2>
                    <p className="text-sm text-slate-600">{section.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{section.articles.length} articles</Badge>
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
              </button>
              
              {isExpanded && (
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-3 pl-9">
                    {section.articles.map((article, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-medium text-slate-800 mb-2 flex items-center">
                          <HelpCircle size={16} className="mr-2 text-blue-500" />
                          {article.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{article.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredSections.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No articles found for "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 text-sm mt-2 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 text-center p-6 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-slate-800 mb-2">Need more help?</h3>
        <p className="text-sm text-slate-600 mb-4">Contact our support team for personalized assistance</p>
        <a href="mailto:support@convin.ai" className="text-blue-600 hover:underline">support@convin.ai</a>
      </div>
    </div>
  );
}
