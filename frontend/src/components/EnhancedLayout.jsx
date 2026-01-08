import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  CheckSquare,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Bell,
  HelpCircle,
  X,
  Search,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  BookOpen
} from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_42a82ed4-eddd-49b7-b6ed-5a95616485f8/artifacts/gs1pa8a0_Convin.png';

// Help content for slide-out panel
const HELP_SECTIONS = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    articles: [
      { title: 'Overview Metrics', content: 'View total customers, ARR, health distribution, and pipeline value at a glance.' },
      { title: 'Health Distribution', content: 'Monitor customers by health: Healthy, At Risk, Critical.' }
    ]
  },
  {
    id: 'customers',
    title: 'Customer Management',
    articles: [
      { title: 'Adding Customers', content: 'Click Add Customer, fill details, assign CSM.' },
      { title: 'Bulk Upload', content: 'Import via CSV using the Bulk Upload feature.' },
      { title: 'Health Changes', content: 'Change health status from customer overview.' }
    ]
  },
  {
    id: 'invoices',
    title: 'Invoice & Revenue',
    articles: [
      { title: 'Creating Invoices', content: 'Raise Invoice button to create new invoices.' },
      { title: 'Tracking Payments', content: 'Monitor paid, pending, and overdue amounts.' }
    ]
  },
  {
    id: 'tasks',
    title: 'Task Management',
    articles: [
      { title: 'Creating Tasks', content: 'Add tasks with type, priority, and due date.' },
      { title: 'Task Status', content: 'Track: Not Started, In Progress, Completed.' }
    ]
  },
  {
    id: 'reports',
    title: 'Reports',
    articles: [
      { title: 'Available Reports', content: 'Health, Revenue, Churn, Engagement reports.' },
      { title: 'Exporting', content: 'Export reports as CSV or PDF.' }
    ]
  }
];

export default function EnhancedLayout({ children, user, onLogout }) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpSearch, setHelpSearch] = useState('');
  const [expandedHelp, setExpandedHelp] = useState(['dashboard']);

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', testId: 'nav-dashboard' },
    { path: '/customers', icon: Users, label: 'Customers', testId: 'nav-customers' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', testId: 'nav-tasks' },
    { path: '/opportunities', icon: TrendingUp, label: 'Pipeline', testId: 'nav-opportunities' },
    { path: '/reports', icon: BarChart3, label: 'Reports', testId: 'nav-reports' },
    { path: '/data-labs-reports', icon: FileText, label: 'Data Labs', testId: 'nav-datalabs' },
    { path: '/settings', icon: Settings, label: 'Settings', testId: 'nav-settings' },
  ];

  const filteredHelp = HELP_SECTIONS.filter(section => 
    !helpSearch || 
    section.title.toLowerCase().includes(helpSearch.toLowerCase()) ||
    section.articles.some(a => a.title.toLowerCase().includes(helpSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-56'} bg-white border-r border-slate-200 fixed left-0 top-0 h-full transition-all duration-200 z-40 flex flex-col`}>
        {/* Logo */}
        <div className="h-14 border-b border-slate-100 flex items-center px-3">
          {!sidebarCollapsed ? (
            <Link to="/" className="flex items-center space-x-2">
              <img src={LOGO_URL} alt="Convin" className="w-7 h-7 object-contain" />
              <span className="text-base font-semibold text-slate-800">Convin Elevate</span>
            </Link>
          ) : (
            <img src={LOGO_URL} alt="Convin" className="w-7 h-7 mx-auto object-contain" />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-3'} py-2 mx-2 my-0.5 rounded-md transition-colors text-sm ${active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                data-testid={item.testId}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span className="ml-2">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="border-t border-slate-100 p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center h-8"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-100 p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} w-full p-2 rounded-md hover:bg-slate-50 transition-colors`}>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                {!sidebarCollapsed && (
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{user?.name}</div>
                    <div className="text-xs text-slate-500">{user?.role}</div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} data-testid="logout-button">
                <LogOut size={14} className="mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-16' : 'ml-56'} transition-all duration-200`}>
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-12">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Welcome, <span className="font-medium text-slate-800">{user?.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Link to="/notifications">
                <Button variant="ghost" size="sm" className="relative h-8 w-8 p-0">
                  <Bell size={16} />
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowHelp(true)}>
                <HelpCircle size={16} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-3rem)]">
          {children}
        </div>
      </main>

      {/* Help Slide-out Panel */}
      {showHelp && (
        <>
          <div className="fixed inset-0 bg-black/20 z-50" onClick={() => setShowHelp(false)} />
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="font-semibold text-slate-800">Help Center</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowHelp(false)} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>
            
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <Input
                  placeholder="Search help..."
                  value={helpSearch}
                  onChange={(e) => setHelpSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredHelp.map(section => (
                <div key={section.id} className="mb-1">
                  <button
                    onClick={() => setExpandedHelp(prev => prev.includes(section.id) ? prev.filter(s => s !== section.id) : [...prev, section.id])}
                    className="w-full p-2 flex items-center justify-between hover:bg-slate-50 rounded text-sm"
                  >
                    <span className="font-medium text-slate-700">{section.title}</span>
                    {expandedHelp.includes(section.id) ? <ChevronDown size={14} /> : <ChevronRightIcon size={14} />}
                  </button>
                  {expandedHelp.includes(section.id) && (
                    <div className="pl-3 space-y-1">
                      {section.articles.map((article, idx) => (
                        <div key={idx} className="p-2 bg-slate-50 rounded text-xs">
                          <p className="font-medium text-slate-700 mb-1">{article.title}</p>
                          <p className="text-slate-500">{article.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-3 border-t bg-slate-50">
              <p className="text-xs text-slate-500 text-center">Need more help? Contact support@convin.ai</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
