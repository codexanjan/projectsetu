import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { PublicProject, ProjectSector } from '@projectsetu/contracts';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { IndiaProjectMap } from '@/components/maps/IndiaProjectMap';
import { 
  Building2, 
  Globe, 
  Search, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Info,
  Calendar,
  Lock
} from 'lucide-react';

export const PublicPortalView: React.FC = () => {
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>(() => AppStorage.getPublicProjects());
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards');

  const filtered = publicProjects.filter(p => {
    if (selectedSector !== 'all' && p.sector !== selectedSector) return false;
    if (selectedState !== 'all' && p.state !== selectedState) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        p.publicLocation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const uniqueStates = Array.from(new Set(publicProjects.map(p => p.state)));

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Public Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight">ProjectSetu</span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Citizen Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">MoSPI Public Infrastructure Transparency</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition"
            >
              Officer & Agency Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-2xl text-white p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              Public Project Transparency Initiative
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Track Public Infrastructure In Your State
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore officially verified milestones, sanctioned budgets, and progress updates for major public infrastructure works. Only verified, whitelisted data is published.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <Filter className="w-4 h-4 text-slate-400" />
              Filter By:
            </div>

            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
            >
              <option value="all">All Sectors</option>
              <option value="Roads & Highways">Roads & Highways</option>
              <option value="Railways">Railways</option>
              <option value="Power & Renewable Energy">Power & Renewable Energy</option>
              <option value="Water & Sanitation">Water & Sanitation</option>
              <option value="Health & Education">Health & Education</option>
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs"
            >
              <option value="all">All States</option>
              {uniqueStates.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search project or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white w-56"
              />
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${viewMode === 'cards' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${viewMode === 'map' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'}`}
              >
                Map
              </button>
            </div>
          </div>
        </div>

        {/* View mode: Map or Cards */}
        {viewMode === 'map' ? (
          <IndiaProjectMap projects={AppStorage.getProjects()} isPublic={true} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(proj => (
              <div
                key={proj.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {proj.sector}
                    </span>
                    <span className="text-slate-400 font-mono font-semibold text-[11px]">{proj.code}</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    <Link to={`/public/projects/${proj.id}`} className="hover:text-blue-600 transition">
                      {proj.name}
                    </Link>
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {proj.publicLocation}
                  </p>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {proj.publicStatusExplanation}
                  </p>

                  {/* Progress & Financials */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Approved Physical Progress:</span>
                      <strong className="text-slate-900">{proj.approvedPhysicalProgressPct}%</strong>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${proj.approvedPhysicalProgressPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanctioned Outlay</span>
                        <strong className="text-slate-900 text-xs font-mono">
                          {formatCurrency(proj.approvedRevisedCostPaise)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Completion</span>
                        <span className="text-slate-700 text-xs font-medium">
                          {proj.revisedCompletionDate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Updated: {proj.lastApprovedReportingPeriod}
                  </span>
                  <Link
                    to={`/public/projects/${proj.id}`}
                    className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Public Transparency Glossary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
            <Info className="w-4 h-4 text-blue-600" />
            Citizen Transparency Standards & Glossary
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <strong className="text-slate-900 block">Physical Progress vs Expenditure:</strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Physical progress measures actual on-site structural works completed, which is verified independently from financial disbursement.
              </p>
            </div>
            <div>
              <strong className="text-slate-900 block">Baseline vs Revised Budgets:</strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Original baseline represents initial Cabinet/Ministry approval. Approved revisions reflect formal scope enhancements or price index adjustments.
              </p>
            </div>
            <div>
              <strong className="text-slate-900 block">Data Confidentiality:</strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Internal contractor communications, pre-decisional deliberations, and proprietary trade secrets are excluded from public disclosure under RTI rules.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <p>ProjectSetu • MoSPI Infrastructure & Project Monitoring Division (SIH26103 Prototype)</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Demonstration data for evaluation purposes. Not an official Government of India portal.
        </p>
      </footer>
    </div>
  );
};
