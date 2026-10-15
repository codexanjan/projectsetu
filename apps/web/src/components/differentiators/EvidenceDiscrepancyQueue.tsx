import React from 'react';
import { AlertCircle, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface DiscrepancyItem {
  id: string;
  projectCode: string;
  projectName: string;
  type: string;
  claimedValue: string;
  observedCrossReference: string;
  recommendedAction: string;
  severity: 'high' | 'medium' | 'low';
}

export const EvidenceDiscrepancyQueue: React.FC = () => {
  const discrepancies: DiscrepancyItem[] = [
    {
      id: 'disc-1',
      projectCode: 'JJM-GUJ-2023-014',
      projectName: 'Coastal Water Supply Expansion',
      type: 'Expenditure vs Subsea Milestone Incongruity',
      claimedValue: 'Expenditure claimed at 76.5% (₹948.6 Cr)',
      observedCrossReference: 'Marine intake pipeline milestone at 38% completion with pending CRZ clearance',
      recommendedAction: 'Officer review requested to audit contractor billing schedule against physical pipe laying logs',
      severity: 'high'
    },
    {
      id: 'disc-2',
      projectCode: 'CPWD-TN-2023-057',
      projectName: 'Urban Flood Mitigation Works',
      type: 'Tidal Regulator Sluice Progress vs Structural Precast Slump',
      claimedValue: 'Macro-drain widening reported 68% complete',
      observedCrossReference: 'Site inspection drone geotag shows excavation restricted to section 3',
      recommendedAction: 'Request agency submit updated drone orthomosaic survey for verification',
      severity: 'medium'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 text-sm">Evidence Discrepancy Queue</h3>
            <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
              Cross-Verification
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated comparative checks between financial expenditure claims, reported physical percentages, and attached verification files.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {discrepancies.map(d => (
          <div 
            key={d.id}
            className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{d.type}</span>
                <span className="font-mono text-[10px] text-slate-500">[{d.projectCode}]</span>
              </div>
              <p className="text-slate-700"><strong>Claimed:</strong> {d.claimedValue}</p>
              <p className="text-slate-700"><strong>Cross-Reference:</strong> {d.observedCrossReference}</p>
              <p className="text-[11px] text-amber-900 font-medium pt-1">
                Recommendation: {d.recommendedAction}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 italic">Discrepancy flag (Not a fraud allegation)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
