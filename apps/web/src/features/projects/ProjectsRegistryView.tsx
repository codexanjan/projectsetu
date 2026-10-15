import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Project, ProjectSector, RiskTier } from '@projectsetu/contracts';
import { formatCurrency, paiseToCrores } from '@/lib/formatting';
import { 
  FolderKanban, 
  PlusCircle, 
  Search, 
  Filter, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

export const ProjectsRegistryView: React.FC = () => {
  const { permissions } = useAuth();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';

  const [projects, setProjects] = useState<Project[]>(() => AppStorage.getProjects());
  const [search, setSearch] = useState(queryParam);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = () => {
    setProjects(AppStorage.getProjects());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  const filtered = projects.filter(p => {
    if (sectorFilter !== 'all' && p.sector !== sectorFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.implementingAgencyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Central Infrastructure Project Registry
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, inspect, and track approved project baselines, physical progress, and risk profiles.
          </p>
        </div>

        {permissions.canCreateProject && (
          <Link
            to="/app/projects/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Project
          </Link>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            Filter:
          </div>

          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <option value="all">All Sectors</option>
            <option value="Roads & Highways">Roads & Highways</option>
            <option value="Railways">Railways</option>
            <option value="Power & Renewable Energy">Power & Renewable Energy</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Urban Infrastructure">Urban Infrastructure</option>
            <option value="Health & Education">Health & Education</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <option value="all">All Operational Statuses</option>
            <option value="approved">Approved</option>
            <option value="in_progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="substantially_completed">Substantially Completed</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, title, state, agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white w-64"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(proj => (
          <div
            key={proj.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  {proj.sector}
                </span>
                <span className="font-mono text-slate-400 text-[11px] font-semibold">{proj.code}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-2 leading-snug">
                <Link to={`/app/projects/${proj.id}`} className="hover:text-blue-600 transition">
                  {proj.name}
                </Link>
              </h3>

              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {proj.publicLocation}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Approved Budget</span>
                  <span className="font-bold text-slate-900 text-xs font-mono mt-0.5 block">
                    {formatCurrency(proj.currentApprovedCostPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Completion</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
                    {proj.currentPlannedEndDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                proj.lastAssessment?.riskTier === 'critical' ? 'bg-red-100 text-red-800' :
                proj.lastAssessment?.riskTier === 'high' ? 'bg-orange-100 text-orange-800' :
                proj.lastAssessment?.riskTier === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {proj.lastAssessment?.riskTier || 'Low'} Risk ({proj.lastAssessment?.riskScore || 20}/100)
              </span>

              <Link
                to={`/app/projects/${proj.id}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Inspect <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
