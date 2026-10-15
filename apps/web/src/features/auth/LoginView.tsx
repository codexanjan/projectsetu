import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  HardHat, 
  Scale, 
  Clock, 
  Sliders, 
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, switchRole } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'portals' | 'custom'>('portals');
  const [email, setEmail] = useState('officer.delhi@mospi.gov.in');
  const [password, setPassword] = useState('ProjectSetu2026!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 4 Primary Interconnected Portals
  const portals = [
    {
      id: 'officer',
      role: 'officer' as const,
      email: 'officer@ipmd.mospi.gov.in',
      name: 'Dr. Sunita Rao',
      designation: 'MoSPI IPMD Director',
      portalTitle: 'MoSPI Executive Oversight Desk',
      description: 'National Infrastructure Pipeline monitoring, calibrated AI early warnings, and cabinet intervention directives.',
      badge: 'Executive Oversight',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Building2,
      accentColor: 'border-blue-500/40 hover:border-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'agency',
      role: 'agency_manager' as const,
      email: 'manager@nhai.gov.in',
      name: 'Vikramaditya Singh',
      designation: 'Chief Project Manager (NHAI / RVNL)',
      portalTitle: 'Implementing Agency Desk',
      description: 'Construction package progress, cumulative expenditure filings, milestone tracking, and bulk CSV data ingestion.',
      badge: 'Execution Desk',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Clock,
      accentColor: 'border-indigo-500/40 hover:border-indigo-600',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      id: 'field',
      role: 'field_contributor' as const,
      email: 'engineer@nhai.gov.in',
      name: 'Pooja Nair',
      designation: 'Resident Executive Engineer',
      portalTitle: 'Mobile Field Survey Desk',
      description: 'On-ground geotagged chainage inspection, drone photo evidence, and site weather/strata delay reporting.',
      badge: 'Site Engineering',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: HardHat,
      accentColor: 'border-amber-500/40 hover:border-amber-600',
      buttonBg: 'bg-amber-600 hover:bg-amber-700'
    },
    {
      id: 'auditor',
      role: 'auditor' as const,
      email: 'auditor@cag.gov.in',
      name: 'Arvind Swaminathan',
      designation: 'CAG Lead Auditor',
      portalTitle: 'CAG Statutory Audit Desk',
      description: 'Baseline escalation checks, spend vs physical decoupling detector, and tamper-evident audit dossier verification.',
      badge: 'Statutory Audit',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Scale,
      accentColor: 'border-emerald-500/40 hover:border-emerald-600',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-700'
    }
  ];

  const handlePortalSelect = (portal: typeof portals[0]) => {
    switchRole(portal.role);
    login(portal.email);
    navigate('/app');
  };

  const handleAdminSelect = () => {
    switchRole('admin');
    login('admin@mospi.gov.in');
    navigate('/app');
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/app');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white">
      {/* Back to landing */}
      <div className="max-w-4xl mx-auto w-full mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-4xl mx-auto w-full text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800/80 text-blue-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>MoSPI IPMD Command Center Authentication Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Select Your Institutional Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Authenticate directly into one of the four interconnected project governance portals, each customized for specific administrative responsibilities.
        </p>

        {/* Tab switch between Portals and Custom Login */}
        <div className="pt-2 flex justify-center">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 inline-flex text-xs font-bold">
            <button
              onClick={() => setActiveTab('portals')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'portals' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Direct Portal Access (4 Desks)
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-1.5 rounded-lg transition ${
                activeTab === 'custom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Custom Credentials / NIC Sign-In
            </button>
          </div>
        </div>
      </div>

      {/* Portal Selection Grid */}
      {activeTab === 'portals' ? (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {portals.map(portal => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  className={`bg-slate-950/80 p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 hover:shadow-xl ${portal.accentColor}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow-xs">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                        {portal.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-white leading-tight">
                        {portal.portalTitle}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {portal.description}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs">
                      <div className="text-slate-400 text-[11px]">Authorized Officer:</div>
                      <div className="font-bold text-white mt-0.5">{portal.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">{portal.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePortalSelect(portal)}
                    className={`w-full py-2.5 px-4 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 group ${portal.buttonBg}`}
                  >
                    <span>Access {portal.portalTitle.split(' ')[0]} Desk</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Platform Administrator Access link */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-center flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-left text-xs">
              <span className="font-bold text-slate-300 block">Platform Administrator System Console</span>
              <span className="text-slate-500 text-[11px]">Configure ML model activation, risk policies, and tenant access</span>
            </div>
            <button
              onClick={handleAdminSelect}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold text-xs rounded-xl border border-purple-500/30 transition flex items-center justify-center gap-2 shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              Launch Admin Console
            </button>
          </div>
        </div>
      ) : (
        /* Custom Credentials Form */
        <div className="max-w-md mx-auto w-full bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-red-950/60 text-red-300 rounded-xl border border-red-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleCustomLogin} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Government Official Email (NIC / Agency):
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                Secret Password:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[11px] text-slate-500 text-center">
            Session authenticated with Firebase Auth & Scoped Role Claims.
          </p>
        </div>
      )}
    </div>
  );
};
