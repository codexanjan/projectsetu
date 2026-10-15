import React, { useState } from 'react';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Project, Observation, croresToPaise, paiseToCrores } from '@projectsetu/contracts';
import { 
  X, 
  UploadCloud, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Paperclip,
  Calendar
} from 'lucide-react';

interface NewObservationModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewObservationModal: React.FC<NewObservationModalProps> = ({
  project,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [reportingPeriod, setReportingPeriod] = useState<string>('2026-03');
  const [spendCr, setSpendCr] = useState<number>(() => Math.round(paiseToCrores(project.originalCostPaise) * 0.58));
  const [progressPct, setProgressPct] = useState<number>(56.0);
  const [blockerCategory, setBlockerCategory] = useState<string>('none');
  const [blockerNotes, setBlockerNotes] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>(['site_inspection_photo_01.jpg', 'measurement_sheet_mar26.pdf']);
  const [validationError, setValidationError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (progressPct < 0 || progressPct > 100) {
      setValidationError('Physical progress must be between 0% and 100%.');
      return;
    }
    if (spendCr <= 0) {
      setValidationError('Cumulative expenditure must be greater than zero.');
      return;
    }

    const obs: Observation = {
      id: `obs-${project.id}-${Date.now()}`,
      projectId: project.id,
      reportingPeriod,
      cumulativeExpenditurePaise: croresToPaise(spendCr),
      physicalProgressPct: progressPct,
      monthlyExpenditurePaise: croresToPaise(spendCr * 0.08),
      progressIncrementPct: 3.8,
      milestoneUpdates: {},
      blockerCategories: blockerCategory !== 'none' ? [blockerCategory] : [],
      blockerDetails: blockerCategory !== 'none' ? [{
        category: blockerCategory as any,
        severity: 'high',
        description: blockerNotes || 'Site bottleneck reported by field engineer',
        loggedDate: new Date().toISOString().split('T')[0],
        mitigationPlanned: 'Follow up with nodal authority'
      }] : [],
      evidenceIds: attachedFiles.map((_, i) => `ev-${Date.now()}-${i}`),
      source: 'web_form',
      submittedBy: user?.uid || 'user-unknown',
      submittedByName: user?.displayName || 'Agency Engineer',
      submittedAt: new Date().toISOString(),
      approvalStatus: 'submitted',
      dataQualityFlags: []
    };

    AppStorage.submitObservation(project.id, obs);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Field Update & Progress Filing
            </span>
            <h3 className="font-bold text-slate-900 text-base">Submit Monthly Observation</h3>
            <p className="text-xs text-slate-500">{project.name} ({project.code})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reporting Period (YYYY-MM):
              </label>
              <input
                type="text"
                value={reportingPeriod}
                onChange={(e) => setReportingPeriod(e.target.value)}
                placeholder="2026-03"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Cumulative Physical Progress (%):
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={progressPct}
                onChange={(e) => setProgressPct(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Cumulative Capital Expenditure (₹ Crores):
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={spendCr}
              onChange={(e) => setSpendCr(parseFloat(e.target.value) || 0)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Original baseline budget: ₹{paiseToCrores(project.originalCostPaise)} Cr
            </span>
          </div>

          {/* Blockers Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Active Site & Administrative Blockers:</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Category:</label>
                <select
                  value={blockerCategory}
                  onChange={(e) => setBlockerCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="none">No Critical Blocker</option>
                  <option value="land_acquisition">Land Acquisition Delay</option>
                  <option value="environmental_clearance">Environmental / Forest Clearance</option>
                  <option value="utility_shifting">Utility Shifting (HT Lines/Pipes)</option>
                  <option value="fund_delay">Inter-Departmental Fund Release</option>
                  <option value="contractor_dispute">Contractor Arbitration Dispute</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Mitigation Action Notes:</label>
                <input
                  type="text"
                  value={blockerNotes}
                  onChange={(e) => setBlockerNotes(e.target.value)}
                  placeholder="e.g. Joint survey requested with district revenue officer"
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Evidence Attachments */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Attached Supporting Verification Evidence:
            </label>
            <div className="p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-slate-600 font-medium">Attached 2 verification records</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((f, i) => (
                  <span key={i} className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 flex items-center gap-1.5 shadow-2xs">
                    <FileText className="w-3 h-3 text-blue-500" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              Submit for Officer Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
