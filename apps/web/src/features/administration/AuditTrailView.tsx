import React, { useState, useEffect } from 'react';
import { AppStorage } from '@/lib/storage';
import { AuditEvent } from '@projectsetu/contracts';
import { formatDate } from '@/lib/formatting';
import { ScrollText, Search, ShieldCheck, Filter, Clock, Hash } from 'lucide-react';

export const AuditTrailView: React.FC = () => {
  const [events, setEvents] = useState<AuditEvent[]>(() => AppStorage.getAuditEvents());
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadData = () => {
    setEvents(AppStorage.getAuditEvents());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  const filtered = events.filter(e => {
    if (actionFilter !== 'all' && e.action !== actionFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.action.toLowerCase().includes(q) ||
        e.actorName.toLowerCase().includes(q) ||
        e.changeSummary.toLowerCase().includes(q) ||
        (e.projectName && e.projectName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Audit Trail & Decision Ledger
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              CAG Oversight Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Server-written, auditable log of sensitive mutations: baseline alterations, approvals, interventions, and public disclosures.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <Filter className="w-4 h-4 text-slate-400" />
            Action Type:
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50"
          >
            <option value="all">All Mutation Actions</option>
            <option value="PROJECT_CREATE">PROJECT_CREATE</option>
            <option value="OBSERVATION_SUBMIT">OBSERVATION_SUBMIT</option>
            <option value="OBSERVATION_APPROVE">OBSERVATION_APPROVE</option>
            <option value="INTERVENTION_APPROVE">INTERVENTION_APPROVE</option>
            <option value="INTERVENTION_TRANSITION">INTERVENTION_TRANSITION</option>
            <option value="PUBLIC_PUBLISH">PUBLIC_PUBLISH</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search actor, project, summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:bg-white w-64"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Timestamp & Request ID</th>
                <th className="p-3">Actor & Persona</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">Change Summary & Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition">
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800 block">{formatDate(e.timestamp)}</span>
                    <span className="font-mono text-[10px] text-slate-400">{e.requestId}</span>
                  </td>
                  <td className="p-3">
                    <strong className="text-slate-900 block">{e.actorName}</strong>
                    <span className="capitalize text-[10px] text-slate-500 font-medium">
                      {e.actorRole.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-700 text-[11px]">
                    {e.action}
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800 block capitalize">{e.resourceType}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{e.resourceId}</span>
                  </td>
                  <td className="p-3 text-slate-700 max-w-md">
                    {e.changeSummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
