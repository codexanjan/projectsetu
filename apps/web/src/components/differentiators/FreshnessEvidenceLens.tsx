import React from 'react';
import { Clock, FileCheck2, AlertCircle, ShieldAlert } from 'lucide-react';

interface FreshnessEvidenceLensProps {
  freshnessDays: number;
  evidenceCompletenessPct: number;
  riskScore: number;
  riskTier: string;
}

export const FreshnessEvidenceLens: React.FC<FreshnessEvidenceLensProps> = ({
  freshnessDays,
  evidenceCompletenessPct,
  riskScore,
  riskTier
}) => {
  // Freshness status
  let freshnessStatus = { label: 'Fresh (Active)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (freshnessDays > 30) {
    freshnessStatus = { label: 'Stale (> 30 days)', color: 'text-red-700 bg-red-50 border-red-200' };
  } else if (freshnessDays > 15) {
    freshnessStatus = { label: 'Due for Review', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }

  // Evidence completeness status
  let evidenceStatus = { label: 'Robust Evidence', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (evidenceCompletenessPct < 60) {
    evidenceStatus = { label: 'Substantially Incomplete', color: 'text-red-700 bg-red-50 border-red-200' };
  } else if (evidenceCompletenessPct < 85) {
    evidenceStatus = { label: 'Partial Documents', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Freshness & Evidence Lens
          </h4>
          <p className="text-[11px] text-slate-500">
            Decoupled Reporting Uncertainty vs Calculated Project Risk
          </p>
        </div>
        <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
          MoSPI Governance Standard
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
        {/* Dimension 1: Reporting Freshness */}
        <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Reporting Freshness
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${freshnessStatus.color}`}>
              {freshnessStatus.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">{freshnessDays}</span>
            <span className="text-xs text-slate-500">days since last update</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {freshnessDays > 30 
              ? 'Warning: Stale data flags review notice without artificially distorting model duration inputs.' 
              : 'Observation frequency conforms to monthly IPMD guidelines.'}
          </p>
        </div>

        {/* Dimension 2: Evidence Completeness */}
        <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              Evidence Verification
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${evidenceStatus.color}`}>
              {evidenceStatus.label}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">{evidenceCompletenessPct}%</span>
            <span className="text-xs text-slate-500">milestones verified</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full rounded-full ${evidenceCompletenessPct < 60 ? 'bg-red-500' : evidenceCompletenessPct < 85 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${evidenceCompletenessPct}%` }}
            />
          </div>
        </div>

        {/* Dimension 3: Intrinsic Project Risk */}
        <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-200/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              Intrinsic Project Risk
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-slate-200 text-slate-800">
              {riskTier}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-800">{riskScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Calculated strictly from structural physical progress, contractual velocity, and blocker severity.
          </p>
        </div>
      </div>
    </div>
  );
};
