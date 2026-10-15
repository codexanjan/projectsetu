import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { Project, RiskTier, Observation, Intervention, AuditEvent } from '@projectsetu/contracts';
import { formatCurrency, paiseToCrores, formatDate } from '@/lib/formatting';
import { IndiaProjectMap } from '@/components/maps/IndiaProjectMap';
import { useAuth } from '@/features/auth/AuthContext';
import { NewObservationModal } from '@/features/observations/NewObservationModal';
import { 
  Building2, 
  AlertTriangle, 
  Clock, 
  ClipboardCheck, 
  ArrowUpRight, 
  Map, 
  List, 
  Filter, 
  Search,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  FileSpreadsheet,
  Upload,
  Camera,
  ShieldCheck,
  ScrollText,
  Printer,
  ChevronRight,
  Activity,
  Send,
  RefreshCw,
  HardHat,
  Scale,
  Users,
  Cpu,
  Sliders,
  ArrowRightLeft
} from 'lucide-react';

export const PortfolioDashboardView: React.FC = () => {
  const { user, role, permissions, switchRole } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>(() => AppStorage.getProjects());
  const [interventions, setInterventions] = useState<Intervention[]>(() => AppStorage.getInterventions());
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() => AppStorage.getAuditEvents());
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // Active portal perspective derived directly from user role
  const activePortalTab: 'officer' | 'agency' | 'field' | 'auditor' | 'admin' = 
    role === 'agency_manager' ? 'agency' :
    role === 'field_contributor' ? 'field' :
    role === 'auditor' ? 'auditor' :
    role === 'admin' ? 'admin' : 'officer';

  // Modals & Field inspection state
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [selectedProjectForObs, setSelectedProjectForObs] = useState<string>('');
  const [fieldSiteLogSuccess, setFieldSiteLogSuccess] = useState(false);
  const [fieldLogForm, setFieldLogForm] = useState({
    projectId: 'proj-nhai-001',
    gpsLocation: '28.6139° N, 77.2090° E (Katra Package 4 Chainage 142+200)',
    weather: 'Clear (Monsoon Runoff Cleared)',
    laborHeadcount: 142,
    machineryAvailable: '18 Excavators, 6 Pavers active',
    remarks: 'Retaining wall concrete casting underway on viaduct pier P14.',
    photoName: 'site_survey_drone_14oct.jpg'
  });

  const loadData = () => {
    setProjects(AppStorage.getProjects());
    setInterventions(AppStorage.getInterventions());
    setAuditEvents(AppStorage.getAuditEvents());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  // Filter projects
  const filtered = projects.filter(p => {
    if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
    if (selectedTier !== 'all' && p.lastAssessment?.riskTier !== selectedTier) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.state.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Calculate high-level KPIs
  const totalCostPaise = projects.reduce((acc, p) => acc + p.currentApprovedCostPaise, 0);
  const criticalCount = projects.filter(p => p.lastAssessment?.riskTier === 'critical').length;
  const highCount = projects.filter(p => p.lastAssessment?.riskTier === 'high').length;
  const staleCount = projects.filter(p => p.freshnessDays > 30).length;
  const activeInterventionsCount = interventions.filter(i => i.status !== 'closed').length;

  // Field engineer submission handler
  const handleFieldLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    AppStorage.logAuditEvent({
      id: `aud-${Date.now()}`,
      actorUid: user?.uid || 'user-field-01',
      actorName: user?.displayName || 'Pooja Nair (Field Engineer)',
      actorRole: 'field_contributor',
      action: 'FIELD_SURVEY_INSPECTION_SUBMITTED',
      resourceType: 'observation',
      resourceId: fieldLogForm.projectId,
      timestamp: new Date().toISOString(),
      requestId: `req-${Math.random().toString(36).substring(2, 9)}`,
      changeSummary: `Logged geotagged field survey report: ${fieldLogForm.remarks.slice(0, 60)}... with GPS: ${fieldLogForm.gpsLocation}`
    });
    setFieldSiteLogSuccess(true);
    setTimeout(() => setFieldSiteLogSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Specialized Active Portal Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${
                activePortalTab === 'officer' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                activePortalTab === 'agency' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                activePortalTab === 'field' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                activePortalTab === 'auditor' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {activePortalTab === 'officer' && 'MoSPI Executive Oversight Desk'}
                {activePortalTab === 'agency' && 'Agency Construction Execution Desk'}
                {activePortalTab === 'field' && 'Mobile Field Survey & Engineering Terminal'}
                {activePortalTab === 'auditor' && 'CAG Statutory Audit & Integrity Desk'}
                {activePortalTab === 'admin' && 'Platform Administration & System Console'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium font-mono">
                SIH26103 • {new Date().toLocaleDateString('en-IN')}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {activePortalTab === 'officer' && 'National Infrastructure Project Command Center'}
              {activePortalTab === 'agency' && 'Assigned Construction Packages & Progress Hub'}
              {activePortalTab === 'field' && 'On-Ground Chainage & Geotagged Survey Terminal'}
              {activePortalTab === 'auditor' && 'Statutory Expenditure & Variance Audit Workspace'}
              {activePortalTab === 'admin' && 'Platform Administration & ML Operations Console'}
            </h1>
            <p className="text-xs text-slate-500">
              {activePortalTab === 'officer' && 'Portfolio-wide early warning radar, SHAP risk attributions, and ministerial cabinet directives.'}
              {activePortalTab === 'agency' && 'Direct execution management for NHAI & RVNL packages, monthly filings, and directive responses.'}
              {activePortalTab === 'field' && 'Direct on-site engineering reporting, GPS-stamped photo logs, and labor/machinery tracking.'}
              {activePortalTab === 'auditor' && 'Uncompromising audit variance analysis, baseline reconciliation, and tamper-evident ledger validation.'}
              {activePortalTab === 'admin' && 'System health telemetry, ML model registry, risk policy weights, and institutional tenant controls.'}
            </p>
          </div>

          {/* User badge and Switch Desk Button */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden sm:block text-xs">
              <span className="font-extrabold text-slate-800 block">{user?.displayName || 'Authorized User'}</span>
              <span className="text-[10px] text-slate-400 font-mono">{user?.organizationName || 'Central Operations'}</span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 group shrink-0"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-180 transition-transform duration-300" />
              <span>Switch Portal Desk</span>
            </button>
          </div>
        </div>

        {/* 2. Specialized Role-Based KPI Metrics */}
        {activePortalTab === 'officer' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Portfolio Outlay</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">
                ₹{paiseToCrores(totalCostPaise).toLocaleString('en-IN')} Cr
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{projects.length} Monitored Projects</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Critical Overrun Warnings</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-red-600 font-mono">{criticalCount}</span>
                <span className="text-xs font-bold text-orange-600">+{highCount} High</span>
              </div>
              <span className="text-[10px] text-red-600 font-medium">Urgent review required</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Interventions</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">{activeInterventionsCount}</span>
              <span className="text-[10px] text-emerald-700 font-medium">Enforced lifecycle</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reporting Freshness</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-amber-600 font-mono">{staleCount}</span>
                <span className="text-xs text-slate-400">stale</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium">&gt;30 days elapsed</span>
            </div>
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block">ML Predictive Engine</span>
              <span className="text-base font-black text-blue-900 mt-1 block">v1.2.0-xgb</span>
              <span className="text-[10px] text-blue-700 font-medium">Calibrated ROC: 0.8037</span>
            </div>
          </div>
        )}

        {activePortalTab === 'agency' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigned Packages</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">3 Active</span>
              <span className="text-[10px] text-slate-400 font-medium">NHAI & Rail Corridors</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Disbursed Expenditure</span>
              <span className="text-xl font-black text-indigo-700 mt-1 block font-mono">₹750 Cr</span>
              <span className="text-[10px] text-indigo-600 font-medium">Cumulative spend filed</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Physical Progress Avg</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">55.0%</span>
              <span className="text-[10px] text-emerald-700 font-medium">Milestones verified</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Directives Pending</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">2 Directives</span>
              <span className="text-[10px] text-amber-700 font-medium">SLA countdown active</span>
            </div>
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-indigo-800 font-bold uppercase tracking-wider block">Next Filing Deadline</span>
              <span className="text-base font-black text-indigo-900 mt-1 block">5 Days</span>
              <span className="text-[10px] text-indigo-700 font-medium">Monthly observation</span>
            </div>
          </div>
        )}

        {activePortalTab === 'field' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Inspection Section</span>
              <span className="text-base font-black text-slate-900 mt-1 block font-mono">Ch. 142+200</span>
              <span className="text-[10px] text-slate-400 font-medium">Package 4 Viaduct</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Monthly Surveys</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">18 Logs</span>
              <span className="text-[10px] text-amber-700 font-medium">GPS Geotagged</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Site Photos Uploaded</span>
              <span className="text-xl font-black text-blue-600 mt-1 block font-mono">42 Photos</span>
              <span className="text-[10px] text-blue-700 font-medium">Drone & ground evidence</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Active Workforce</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">142 Labor</span>
              <span className="text-[10px] text-slate-500 font-medium">18 heavy machines</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">Site Conditions</span>
              <span className="text-base font-black text-amber-900 mt-1 block">Nominal</span>
              <span className="text-[10px] text-amber-700 font-medium">Drainage diversion clear</span>
            </div>
          </div>
        )}

        {activePortalTab === 'auditor' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Audited Baseline</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">₹21,200 Cr</span>
              <span className="text-[10px] text-slate-400 font-medium">Approved revised sum</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Baseline Cost Variance</span>
              <span className="text-xl font-black text-red-600 mt-1 block font-mono">+₹2,700 Cr</span>
              <span className="text-[10px] text-red-600 font-medium">+14.6% escalation</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tamper-Evident Ledger</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">100% Valid</span>
              <span className="text-[10px] text-emerald-700 font-medium">SHA-256 hash verified</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Decoupling Alerts</span>
              <span className="text-xl font-black text-amber-600 mt-1 block font-mono">1 Flag</span>
              <span className="text-[10px] text-amber-700 font-medium">Disbursement &gt; progress</span>
            </div>
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">Statutory Audit Gate</span>
              <span className="text-base font-black text-emerald-900 mt-1 block">Active</span>
              <span className="text-[10px] text-emerald-700 font-medium">Certified Dossiers</span>
            </div>
          </div>
        )}

        {activePortalTab === 'admin' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Model In Production</span>
              <span className="text-base font-black text-purple-900 mt-1 block font-mono">v1.2.0-xgb</span>
              <span className="text-[10px] text-purple-700 font-medium">XGBoost Classifier</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Model ROC-AUC</span>
              <span className="text-xl font-black text-slate-900 mt-1 block font-mono">0.8037</span>
              <span className="text-[10px] text-slate-400 font-medium">Brier score 0.1412</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tenant Organizations</span>
              <span className="text-xl font-black text-blue-600 mt-1 block font-mono">4 Tenants</span>
              <span className="text-[10px] text-blue-700 font-medium">MoSPI, NHAI, RVNL, CAG</span>
            </div>
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Audit Ledger Hash</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block font-mono">Sealed</span>
              <span className="text-[10px] text-emerald-700 font-medium">Tamper verification OK</span>
            </div>
            <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200/80 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-purple-800 font-bold uppercase tracking-wider block">System Health</span>
              <span className="text-base font-black text-purple-900 mt-1 block">Nominal (42ms)</span>
              <span className="text-[10px] text-purple-700 font-medium">All APIs Operational</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. TAB CONTENT 1: MoSPI OFFICER NATIONAL COMMAND */}
      {activePortalTab === 'officer' && (
        <div className="space-y-6">
          {/* View Toggle Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-800">Officer Tools:</span>
              <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition ${
                    viewMode === 'map' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Map className="w-3.5 h-3.5" />
                  Geospatial Radar
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1.5 transition ${
                    viewMode === 'table' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  Prioritized Registry
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/app/interventions"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Review Interventions ({activeInterventionsCount})
              </Link>
            </div>
          </div>

          {/* Interactive Real Map or Prioritized Table */}
          {viewMode === 'map' ? (
            <IndiaProjectMap projects={filtered} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Portfolio Review Prioritization Index</h3>
                  <p className="text-xs text-slate-500">Sorted by risk score, public utility impact, and milestone urgency</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  {filtered.length} Projects Ranked
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rank / Code</th>
                      <th className="p-3">Infrastructure Project Name</th>
                      <th className="p-3">Sector & State</th>
                      <th className="p-3 text-right">Approved Outlay</th>
                      <th className="p-3 text-center">Risk Tier</th>
                      <th className="p-3 text-right">Predicted Delay</th>
                      <th className="p-3 text-center">Priority Index</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered
                      .sort((a, b) => b.priorityIndex - a.priorityIndex)
                      .map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3 font-mono font-semibold text-slate-400">
                            #{String(idx + 1).padStart(2, '0')} <span className="text-slate-600 text-[11px] block">{p.code}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-900">
                            <Link to={`/app/projects/${p.id}`} className="hover:text-blue-600">
                              {p.name}
                            </Link>
                            <span className="text-[10px] text-slate-500 block font-normal">{p.implementingAgencyName}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-700 block">{p.sector}</span>
                            <span className="text-[11px] text-slate-500">{p.state}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-800">
                            {formatCurrency(p.currentApprovedCostPaise)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              p.lastAssessment?.riskTier === 'critical' ? 'bg-red-100 text-red-800' :
                              p.lastAssessment?.riskTier === 'high' ? 'bg-orange-100 text-orange-800' :
                              p.lastAssessment?.riskTier === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.lastAssessment?.riskTier || 'Low'} ({p.lastAssessment?.riskScore || 20})
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-amber-600">
                            +{p.lastAssessment?.predictedDelayDays || 15}d
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-block font-black text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                              {p.priorityIndex}/100
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Link
                              to={`/app/projects/${p.id}`}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition inline-flex items-center gap-1 shadow-2xs"
                            >
                              Inspect <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TAB CONTENT 2: IMPLEMENTING AGENCY DESK (NHAI / RVNL / METRO) */}
      {activePortalTab === 'agency' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded border border-blue-400/30">
                Agency Project Execution Command
              </span>
              <h2 className="text-xl font-extrabold mt-1">National Highways & Rail Implementation Desk</h2>
              <p className="text-xs text-blue-200/80 mt-1">
                Manage assigned construction packages, submit monthly physical progress observations, and upload verified survey dossiers.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  setSelectedProjectForObs(projects[0]?.id || 'proj-nhai-001');
                  setIsObsModalOpen(true);
                }}
                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Monthly Progress Filing
              </button>
              <Link
                to="/app/imports"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Bulk CSV Importer
              </Link>
            </div>
          </div>

          {/* Agency Assigned Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 3).map(p => (
              <div key={p.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {p.sector}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">{p.code}</span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{p.name}</h4>
                <div className="text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Approved Budget:</span>
                    <strong className="text-slate-800 font-mono">₹{paiseToCrores(p.currentApprovedCostPaise)} Cr</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical Progress:</span>
                    <strong className="text-blue-600 font-mono">55.0%</strong>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedProjectForObs(p.id);
                      setIsObsModalOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    File Update <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/app/projects/${p.id}`}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium"
                  >
                    Workspace
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pending MoSPI Interventions Table for Agency */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Pending MoSPI Corrective Directives</h3>
                <p className="text-xs text-slate-500">Official ministerial interventions requiring agency follow-up evidence</p>
              </div>
              <Link to="/app/interventions" className="text-xs text-blue-600 font-bold hover:underline">
                View All Directives
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {interventions.filter(i => i.status !== 'closed').map(intv => (
                <div key={intv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{intv.title}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">{intv.description}</p>
                    <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1 inline-block">
                      Due: {intv.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                      {intv.status.replace('_', ' ')}
                    </span>
                    <Link
                      to={`/app/projects/${intv.projectId}?tab=interventions`}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
                    >
                      Submit Evidence
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 3: MOBILE FIELD ENGINEERING & SURVEY DESK */}
      {activePortalTab === 'field' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-900 to-slate-900 p-6 rounded-2xl text-white shadow-md">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30">
              Mobile Field Inspection & Geotagged Survey
            </span>
            <h2 className="text-xl font-extrabold mt-1">Resident Executive Engineer Site Reporting</h2>
            <p className="text-xs text-amber-200/80 mt-1">
              File on-ground verified survey milestones, GPS-stamped photo logs, and geological/weather delay notices directly to the Agency Manager.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Field Log Entry Form */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-600" />
                File Daily Site Survey & Geotagged Progress
              </h3>

              {fieldSiteLogSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Field report filed successfully! Synced to Agency Manager & Audit Trail.</span>
                </div>
              )}

              <form onSubmit={handleFieldLogSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Infrastructure Project</label>
                  <select
                    value={fieldLogForm.projectId}
                    onChange={(e) => setFieldLogForm({ ...fieldLogForm, projectId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800"
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GPS Coordinates (Auto-Geotagged)</label>
                    <input
                      type="text"
                      value={fieldLogForm.gpsLocation}
                      onChange={(e) => setFieldLogForm({ ...fieldLogForm, gpsLocation: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[11px] bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Weather & Site Conditions</label>
                    <input
                      type="text"
                      value={fieldLogForm.weather}
                      onChange={(e) => setFieldLogForm({ ...fieldLogForm, weather: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Labor Headcount on Site</label>
                    <input
                      type="number"
                      value={fieldLogForm.laborHeadcount}
                      onChange={(e) => setFieldLogForm({ ...fieldLogForm, laborHeadcount: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Active Heavy Machinery</label>
                    <input
                      type="text"
                      value={fieldLogForm.machineryAvailable}
                      onChange={(e) => setFieldLogForm({ ...fieldLogForm, machineryAvailable: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Site Inspection Engineering Remarks</label>
                  <textarea
                    rows={3}
                    value={fieldLogForm.remarks}
                    onChange={(e) => setFieldLogForm({ ...fieldLogForm, remarks: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                    placeholder="Describe chainage, pier casting, earthwork progress or utility obstructions..."
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Upload Geotagged Drone / Site Inspection Photo</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold text-blue-600">Simulate file selection (JPG, PNG, PDF up to 15MB)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Attached: {fieldLogForm.photoName}</p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Transmit Field Log to Agency Manager
                </button>
              </form>
            </div>

            {/* Field Activity Log stream */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Recent Verified Field Transmissions
              </h3>
              <div className="space-y-3">
                {[
                  {
                    project: 'Delhi-Amritsar-Katra (Pkg 4)',
                    time: 'Today, 14:30 IST',
                    engineer: 'Pooja Nair',
                    status: 'Pier P14 Casting complete; monsoon drain diversion dug',
                    tag: 'Milestone 4.2'
                  },
                  {
                    project: 'Coastal Water Supply Expansion',
                    time: 'Yesterday, 11:15 IST',
                    engineer: 'K. S. Raman',
                    status: 'Pipeline trenching completed 8.2 km; CRZ clearance pending',
                    tag: 'Chainage 12+400'
                  },
                  {
                    project: 'Pune Metro Line 3 Extension',
                    time: '12 Oct, 16:45 IST',
                    engineer: 'Amit Deshpande',
                    status: 'Tunnel Boring Machine breakthrough at Civil Court station',
                    tag: 'Milestone 2.1'
                  }
                ].map((item, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900">{item.project}</strong>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-slate-600">{item.status}</p>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                      <span>Engineer: {item.engineer}</span>
                      <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{item.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 4: CAG STATUTORY OVERSIGHT & INTEGRITY DESK */}
      {activePortalTab === 'auditor' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-400/30">
                CAG Statutory Oversight & Integrity Portal
              </span>
              <h2 className="text-xl font-extrabold mt-1">Comptroller and Auditor General of India</h2>
              <p className="text-xs text-slate-300 mt-1">
                Unalterable audit trail inspection, expenditure vs physical verification, baseline cost revision checks.
              </p>
            </div>
            <Link
              to="/app/admin/audit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
            >
              <ScrollText className="w-4 h-4" />
              Open Full Audit Log (CAG Stream)
            </Link>
          </div>

          {/* Audit Variance Check Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Baseline Cost Escalation Variance Audit</h3>
            <p className="text-xs text-slate-500">Comparing original approved cabinet cost with approved revised baseline</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Project Code</th>
                    <th className="p-2.5">Project Name</th>
                    <th className="p-2.5 text-right">Original Cost</th>
                    <th className="p-2.5 text-right">Revised Cost</th>
                    <th className="p-2.5 text-right">Escalation</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map(p => {
                    const diff = p.currentApprovedCostPaise - p.originalCostPaise;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-2.5 font-mono text-slate-600">{p.code}</td>
                        <td className="p-2.5 font-bold text-slate-900">{p.name}</td>
                        <td className="p-2.5 text-right font-mono text-slate-600">{formatCurrency(p.originalCostPaise)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">{formatCurrency(p.currentApprovedCostPaise)}</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${diff > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                          {diff > 0 ? `+${formatCurrency(diff)}` : 'Nil'}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            diff > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {diff > 0 ? 'Revised' : 'Original Baseline'}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <Link
                            to={`/app/projects/${p.id}?tab=report`}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            Dossier
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live CAG Audit Events Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900">Unalterable CAG Event Stream</h3>
            <p className="text-xs text-slate-500">Live tamper-evident ledger tracking sensitive mutations across all organizations</p>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {auditEvents.slice(0, 6).map(evt => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-slate-800">{evt.action}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatDate(evt.timestamp)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">{evt.changeSummary}</p>
                    <span className="text-[10px] text-slate-400">Actor: <strong>{evt.actorName}</strong> ({evt.actorRole})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB CONTENT 5: PLATFORM ADMINISTRATION & SYSTEM CONSOLE */}
      {activePortalTab === 'admin' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-400/30">
                Root Platform Administration Console
              </span>
              <h2 className="text-xl font-extrabold mt-1">Infrastructure Platform & ML Operations</h2>
              <p className="text-xs text-purple-200/80 mt-1">
                Oversee production machine learning model calibrations, tenant role-based access, risk scoring policies, and cryptographic ledger health.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/app/admin/models"
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Cpu className="w-4 h-4" />
                Model Registry
              </Link>
              <Link
                to="/app/admin/users"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-300" />
                Tenant Users
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Model Registry Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active ML Model</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Production Active
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">v1.2.0-xgb (Calibrated)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Gradient Boosted Decision Tree with Platt probability scaling for cost overrun & schedule slippage.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">ROC-AUC:</span>
                  <strong className="text-blue-700">0.8037</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Brier Score:</span>
                  <strong className="text-emerald-700">0.1412</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Inference Latency:</span>
                  <strong className="text-slate-800">42ms</strong>
                </div>
              </div>
              <Link
                to="/app/admin/models"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Inspect Model Registry</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Risk Policy Weights Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Risk Policy Weights</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Active Formula
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Heuristic Risk Scoring</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Weighted multi-factor score determining automated project prioritization and intervention thresholds.
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Cost Overrun Risk:</span>
                  <strong className="font-mono text-slate-900">40%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Schedule Delay Days:</span>
                  <strong className="font-mono text-slate-900">30%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Reporting Freshness:</span>
                  <strong className="font-mono text-slate-900">20%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Critical Issues & Blockers:</span>
                  <strong className="font-mono text-slate-900">10%</strong>
                </div>
              </div>
              <Link
                to="/app/admin/risk-policies"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Calibrate Risk Weights</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Tenant Organizations & Access */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institutional Tenants</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                  4 Active Orgs
                </span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Role-Based Access Control</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enforces strict tenant boundaries between MoSPI, NHAI, RVNL, and CAG auditor accounts.
                </p>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="font-bold text-slate-800">MoSPI IPMD Central</span>
                  <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">National Oversight</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="font-bold text-slate-800">NHAI & Rail RVNL</span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-mono">Executing Agencies</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex justify-between items-center">
                  <span className="font-bold text-slate-800">CAG Statutory Audit</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">External Auditor</span>
                </div>
              </div>
              <Link
                to="/app/admin/users"
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Manage Users & Keys</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Master Audit Log & System Specs Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">System Health & Telemetry</h3>
                <Link to="/app/admin/system-health" className="text-xs text-blue-600 font-bold hover:underline">
                  View Specs
                </Link>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Cloud Firestore Sync:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Nominal (Synchronized)
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Audit Ledger Hash Chain:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cryptographic Match
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Prediction Inference Time:</span>
                  <span className="font-mono font-bold text-slate-800">42ms avg</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-sm">Master Administrative Audit Trail</h3>
                <Link to="/app/admin/audit" className="text-xs text-blue-600 font-bold hover:underline">
                  Open Master Stream
                </Link>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {auditEvents.slice(0, 4).map(evt => (
                  <div key={evt.id} className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-mono font-bold text-slate-800">{evt.action}</span>
                      <span className="text-slate-400 font-mono">{formatDate(evt.timestamp)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate">{evt.changeSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Observation Modal */}
      {isObsModalOpen && (
        <NewObservationModal
          project={selectedProjectForObs ? AppStorage.getProjectById(selectedProjectForObs) || projects[0] : projects[0]}
          isOpen={isObsModalOpen}
          onClose={() => setIsObsModalOpen(false)}
          onSuccess={() => {
            loadData();
            setIsObsModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
