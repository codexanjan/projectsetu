import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  PlusCircle, 
  FileSpreadsheet, 
  ClipboardCheck, 
  Bell, 
  Users, 
  Cpu, 
  ScrollText, 
  Activity,
  Sliders,
  Sparkles,
  HardHat,
  Scale,
  Building2,
  Clock,
  ArrowRightLeft,
  Camera,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-[#DCE3EC] flex flex-col shrink-0 min-h-[calc(100vh-4rem)] no-print">
      <div className="p-4 flex-1 space-y-6 overflow-y-auto">
        {/* Active Portal Header Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block mb-0.5">
            Active Desk
          </span>
          <div className="flex items-center gap-2">
            {role === 'officer' && <Building2 className="w-4 h-4 text-blue-600" />}
            {role === 'agency_manager' && <Clock className="w-4 h-4 text-indigo-600" />}
            {role === 'field_contributor' && <HardHat className="w-4 h-4 text-amber-600" />}
            {role === 'auditor' && <Scale className="w-4 h-4 text-emerald-600" />}
            {role === 'admin' && <Sliders className="w-4 h-4 text-purple-600" />}

            <div className="truncate">
              <span className="text-xs font-extrabold text-slate-800 capitalize block leading-tight">
                {role === 'officer' && 'MoSPI Executive'}
                {role === 'agency_manager' && 'Agency Construction'}
                {role === 'field_contributor' && 'Field Survey Desk'}
                {role === 'auditor' && 'CAG Statutory Audit'}
                {role === 'admin' && 'Platform Admin'}
                {role === 'citizen' && 'Guest Portal'}
              </span>
              <span className="text-[10px] text-slate-500 truncate block">
                {user?.organizationName || 'Central Operations'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. MoSPI IPMD Executive Oversight Navigation */}
        {role === 'officer' && (
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              National Oversight Desk
            </span>
            <nav className="space-y-1">
              <NavLink to="/app" end className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                National Radar Command
              </NavLink>
              <NavLink to="/app/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4" />
                All Infrastructure Projects
              </NavLink>
              <NavLink to="/app/interventions" className={navItemClass}>
                <ClipboardCheck className="w-4 h-4" />
                Intervention Directives
              </NavLink>
              <NavLink to="/app/alerts" className={navItemClass}>
                <Bell className="w-4 h-4" />
                Overrun Early Warnings
              </NavLink>
            </nav>
          </div>
        )}

        {/* 2. Implementing Agency Manager Navigation */}
        {role === 'agency_manager' && (
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Construction Execution Desk
            </span>
            <nav className="space-y-1">
              <NavLink to="/app" end className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                Agency Package Command
              </NavLink>
              <NavLink to="/app/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4" />
                Assigned Packages
              </NavLink>
              <NavLink to="/app/projects/new" className={navItemClass}>
                <PlusCircle className="w-4 h-4" />
                Register New Package
              </NavLink>
              <NavLink to="/app/imports" className={navItemClass}>
                <FileSpreadsheet className="w-4 h-4" />
                Bulk CSV Data Importer
              </NavLink>
              <NavLink to="/app/interventions" className={navItemClass}>
                <ClipboardCheck className="w-4 h-4" />
                MoSPI Directives Response
              </NavLink>
              <NavLink to="/app/alerts" className={navItemClass}>
                <Bell className="w-4 h-4" />
                Construction Alerts
              </NavLink>
            </nav>
          </div>
        )}

        {/* 3. Field Contributor / Engineer Navigation */}
        {role === 'field_contributor' && (
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Field Engineering Desk
            </span>
            <nav className="space-y-1">
              <NavLink to="/app" end className={navItemClass}>
                <Camera className="w-4 h-4" />
                Site Survey Terminal
              </NavLink>
              <NavLink to="/app/projects" className={navItemClass}>
                <MapPin className="w-4 h-4" />
                Site Chainage & Photos
              </NavLink>
              <NavLink to="/app/alerts" className={navItemClass}>
                <Bell className="w-4 h-4" />
                Site Obstruction Alerts
              </NavLink>
            </nav>
          </div>
        )}

        {/* 4. CAG Auditor Navigation */}
        {role === 'auditor' && (
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              CAG Statutory Audit Desk
            </span>
            <nav className="space-y-1">
              <NavLink to="/app" end className={navItemClass}>
                <Scale className="w-4 h-4" />
                Audit Variance Workspace
              </NavLink>
              <NavLink to="/app/admin/audit" className={navItemClass}>
                <ScrollText className="w-4 h-4" />
                Tamper-Evident CAG Log
              </NavLink>
              <NavLink to="/app/projects" className={navItemClass}>
                <FolderKanban className="w-4 h-4" />
                Project Review Dossiers
              </NavLink>
              <NavLink to="/app/alerts" className={navItemClass}>
                <Bell className="w-4 h-4" />
                Compliance Warnings
              </NavLink>
            </nav>
          </div>
        )}

        {/* 5. Platform Admin ONLY Navigation */}
        {role === 'admin' && (
          <div>
            <span className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Platform Administration
            </span>
            <nav className="space-y-1">
              <NavLink to="/app" end className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                Admin Overview
              </NavLink>
              <NavLink to="/app/admin/users" className={navItemClass}>
                <Users className="w-4 h-4" />
                User & Org Access
              </NavLink>
              <NavLink to="/app/admin/models" className={navItemClass}>
                <Cpu className="w-4 h-4" />
                ML Model Registry
              </NavLink>
              <NavLink to="/app/admin/risk-policies" className={navItemClass}>
                <Sliders className="w-4 h-4" />
                Risk Policy Weights
              </NavLink>
              <NavLink to="/app/admin/audit" className={navItemClass}>
                <ScrollText className="w-4 h-4" />
                Master Audit Log
              </NavLink>
              <NavLink to="/app/admin/system-health" className={navItemClass}>
                <Activity className="w-4 h-4" />
                System Health & Specs
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Switch Portal Button in Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 m-2 rounded-2xl space-y-2">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-2xs transition group"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
          <span>Switch Portal Desk</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center font-mono">
          Engine: <strong className="text-slate-700">v1.2.0-xgb (Calibrated)</strong>
        </div>
      </div>
    </aside>
  );
};
