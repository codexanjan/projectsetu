import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { AppStorage } from '@/lib/storage';
import { AlertItem } from '@projectsetu/contracts';
import { 
  Building2, 
  Bell, 
  Search, 
  Globe, 
  LogOut, 
  User, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadAlerts = () => {
      setAlerts(AppStorage.getAlerts());
    };
    loadAlerts();
    window.addEventListener('projectsetu-update', loadAlerts);
    return () => window.removeEventListener('projectsetu-update', loadAlerts);
  }, []);

  const unreadCount = alerts.filter(a => !a.isRead).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/projects?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-[#DCE3EC] sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-[#15243A]">ProjectSetu</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                    MoSPI IPMD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Integrated Infrastructure Intelligence</p>
              </div>
            </Link>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, packages, states, agencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </form>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-800">Alerts & Overrun Notices</span>
                    <span className="text-[11px] text-slate-500">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {alerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">No active alerts</div>
                    ) : (
                      alerts.slice(0, 5).map(alert => (
                        <div 
                          key={alert.id}
                          onClick={() => {
                            AppStorage.markAlertRead(alert.id);
                            setShowAlertsMenu(false);
                            navigate(alert.actionUrl);
                          }}
                          className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition flex items-start gap-2.5 ${!alert.isRead ? 'bg-blue-50/40' : ''}`}
                        >
                          <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-500'}`} />
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800">{alert.title}</p>
                            <p className="text-slate-500 line-clamp-2 mt-0.5">{alert.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{alert.projectName}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      to="/app/alerts"
                      onClick={() => setShowAlertsMenu(false)}
                      className="text-xs text-blue-600 font-medium hover:underline"
                    >
                      View all alerts
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                  {user?.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{user?.displayName || 'Guest'}</div>
                  <div className="text-[10px] text-slate-500 capitalize">{role.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="font-semibold text-xs text-slate-800">{user?.displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                      {role.replace('_', ' ')}
                    </span>
                  </div>

                  {(role === 'admin' || role === 'auditor') && (
                    <Link
                      to="/app/admin/audit"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      Audit Trail & Logs
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link
                      to="/app/admin/system-health"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      System Health & ML Status
                    </Link>
                  )}

                  <div className="border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-blue-600 hover:bg-blue-50 font-semibold"
                    >
                      Switch Portal Desk
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
