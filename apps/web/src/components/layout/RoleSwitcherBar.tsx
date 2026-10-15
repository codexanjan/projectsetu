import React from 'react';
import { useAuth } from '@/features/auth/AuthContext';
import { UserRole } from '@projectsetu/contracts';
import { AppStorage } from '@/lib/storage';
import { Shield, RefreshCw, UserCheck, Eye, Terminal } from 'lucide-react';

export const RoleSwitcherBar: React.FC = () => {
  const { user, role, switchRole } = useAuth();

  const roles: { role: UserRole; label: string; desc: string; badge: string }[] = [
    { role: 'officer', label: 'MoSPI Officer', desc: 'Central Monitoring & Approval', badge: 'bg-blue-600' },
    { role: 'agency_manager', label: 'Agency Manager', desc: 'NHAI / Project Submissions', badge: 'bg-emerald-600' },
    { role: 'field_contributor', label: 'Field Contributor', desc: 'Site Observations & Evidence', badge: 'bg-purple-600' },
    { role: 'admin', label: 'Platform Admin', desc: 'Governance, Policies & ML', badge: 'bg-slate-800' },
    { role: 'auditor', label: 'Auditor (CAG)', desc: 'Read-Only Audit Trail', badge: 'bg-amber-600' },
    { role: 'citizen', label: 'Citizen View', desc: 'Public Portal Only', badge: 'bg-gray-600' },
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs text-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none no-print">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-semibold text-slate-100 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          SIH26103 Evaluator Mode
        </span>
        <span className="hidden md:inline text-slate-400">
          Acting as: <strong className="text-white">{user?.displayName || 'Citizen'}</strong> ({user?.organizationName || 'Public'})
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 hidden lg:inline mr-1">Switch Persona:</span>
        {roles.map(r => {
          const isActive = role === r.role;
          return (
            <button
              key={r.role}
              onClick={() => switchRole(r.role)}
              className={`px-2.5 py-1 rounded font-medium transition-all flex items-center gap-1 ${
                isActive
                  ? `${r.badge} text-white shadow-sm ring-1 ring-white/30 font-semibold`
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
              }`}
              title={r.desc}
            >
              {isActive ? <UserCheck className="w-3 h-3" /> : null}
              {r.label}
            </button>
          );
        })}

        <button
          onClick={() => {
            if (confirm('Reset demonstration data back to original seeded state?')) {
              AppStorage.resetToSeed();
            }
          }}
          className="ml-2 px-2 py-1 rounded bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-400 border border-slate-700 flex items-center gap-1 transition"
          title="Reset local changes and restore 6 seed projects"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Demo Data
        </button>
      </div>
    </div>
  );
};
