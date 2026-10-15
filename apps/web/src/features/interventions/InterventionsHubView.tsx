import React, { useState, useEffect } from 'react';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Intervention, InterventionStatus, UserRole } from '@projectsetu/contracts';
import { formatDate } from '@/lib/formatting';
import { 
  ClipboardCheck, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Upload, 
  UserCheck, 
  X,
  History,
  FileText
} from 'lucide-react';

export const InterventionsHubView: React.FC = () => {
  const { user, role, permissions } = useAuth();
  const [interventions, setInterventions] = useState<Intervention[]>(() => AppStorage.getInterventions());
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [actionReason, setActionReason] = useState<string>('');
  const [transitioningStatus, setTransitioningStatus] = useState<InterventionStatus | null>(null);

  const loadData = () => {
    setInterventions(AppStorage.getInterventions());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  const filtered = interventions.filter(i => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'proposed':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'evidence_submitted':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'verified':
      case 'closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
      case 'returned':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleExecuteTransition = (target: Intervention, nextStatus: InterventionStatus) => {
    const reason = actionReason.trim() || `Administrative transition to ${nextStatus.replace('_', ' ')}`;
    AppStorage.transitionIntervention(target.id, nextStatus, reason, ['ev-completion-voucher']);
    setActionReason('');
    setTransitioningStatus(null);
    setSelectedIntervention(null);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Intervention Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforced state machine: Proposed → Approved → Assigned → In Progress → Evidence Submitted → Verified → Closed.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white"
          >
            <option value="all">All States</option>
            <option value="proposed">Proposed</option>
            <option value="approved">Approved</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="evidence_submitted">Evidence Submitted</option>
            <option value="closed">Closed / Verified</option>
          </select>
        </div>
      </div>

      {/* Interventions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Intervention Title & Scope</th>
                <th className="p-3">Category</th>
                <th className="p-3">Assigned Owner</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Priority</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">State Machine Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(intv => {
                const project = AppStorage.getProjectById(intv.projectId);
                return (
                  <tr key={intv.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3">
                      <span className="font-bold text-slate-900 block">{intv.title}</span>
                      <span className="text-[11px] text-slate-500">{project?.name || 'Project'}</span>
                    </td>
                    <td className="p-3 text-slate-600 capitalize">
                      {intv.category.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3">
                      <span className="font-semibold text-slate-800 block">{intv.ownerName}</span>
                      <span className="text-[10px] text-slate-400">{intv.ownerOrganization}</span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      {formatDate(intv.dueDate)}
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        intv.priority === 'critical' ? 'bg-red-100 text-red-800' :
                        intv.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {intv.priority}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize border ${getStatusBadge(intv.status)}`}>
                        {intv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedIntervention(intv)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold text-xs transition border border-blue-200"
                      >
                        Inspect & Transition
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* State Machine Transition & Audit History Drawer */}
      {selectedIntervention && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  State Machine Enforcement
                </span>
                <h3 className="font-bold text-slate-900 text-base">{selectedIntervention.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedIntervention(null);
                  setTransitioningStatus(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p><strong>Description:</strong> {selectedIntervention.description}</p>
                <p><strong>Expected Change:</strong> {selectedIntervention.expectedIndicatorChanges}</p>
                <p><strong>Current Status:</strong> <span className="font-bold uppercase text-blue-700">{selectedIntervention.status.replace('_', ' ')}</span></p>
              </div>

              {/* Transition Actions depending on current status and role */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Authorized State Transitions
                </h4>

                <div className="flex flex-wrap gap-2">
                  {selectedIntervention.status === 'proposed' && (role === 'officer' || role === 'admin') && (
                    <>
                      <button
                        onClick={() => handleExecuteTransition(selectedIntervention, 'approved')}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Approve Intervention
                      </button>
                      <button
                        onClick={() => handleExecuteTransition(selectedIntervention, 'rejected')}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {selectedIntervention.status === 'approved' && (role === 'officer' || role === 'admin') && (
                    <button
                      onClick={() => handleExecuteTransition(selectedIntervention, 'assigned')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Assign to Agency Owner ({selectedIntervention.ownerName})
                    </button>
                  )}

                  {selectedIntervention.status === 'assigned' && (
                    <button
                      onClick={() => handleExecuteTransition(selectedIntervention, 'in_progress')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Begin Implementation (Mark In Progress)
                    </button>
                  )}

                  {selectedIntervention.status === 'in_progress' && (
                    <button
                      onClick={() => handleExecuteTransition(selectedIntervention, 'evidence_submitted')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Submit Completion Evidence & Request Verification
                    </button>
                  )}

                  {selectedIntervention.status === 'evidence_submitted' && (role === 'officer' || role === 'admin') && (
                    <>
                      <button
                        onClick={() => handleExecuteTransition(selectedIntervention, 'verified')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verify Evidence & Mark Completed
                      </button>
                      <button
                        onClick={() => handleExecuteTransition(selectedIntervention, 'returned')}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Return for Incomplete Evidence
                      </button>
                    </>
                  )}

                  {(selectedIntervention.status === 'verified' || selectedIntervention.status === 'closed') && (role === 'officer' || role === 'admin') && (
                    <button
                      onClick={() => handleExecuteTransition(selectedIntervention, 'reopened')}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reopen Intervention
                    </button>
                  )}
                </div>

                <div className="pt-2">
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    Transition Justification Note:
                  </label>
                  <input
                    type="text"
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="Enter official decision rationale for audit record..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* State Machine Audit Log */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" />
                  Chronological State Transition Audit
                </h4>

                <div className="space-y-2">
                  {selectedIntervention.history.map((h, hi) => (
                    <div key={hi} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex justify-between items-center text-slate-500 text-[11px]">
                        <span>
                          <strong className="text-slate-800">{h.actorName}</strong> ({h.actorRole})
                        </span>
                        <span>{formatDate(h.timestamp)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className="capitalize">{h.fromStatus}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="capitalize text-blue-700">{h.toStatus}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 italic">"{h.reason}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
