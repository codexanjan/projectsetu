import React, { useState } from 'react';
import { Sliders, RotateCcw, TrendingDown, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/formatting';

interface RecoveryScenarioWorkspaceProps {
  originalCostPaise: number;
  originalDurationDays: number;
  currentDelayDays: number;
  currentOverrunProb: number;
}

export const RecoveryScenarioWorkspace: React.FC<RecoveryScenarioWorkspaceProps> = ({
  originalCostPaise,
  originalDurationDays,
  currentDelayDays,
  currentOverrunProb
}) => {
  // Scenario levers (inputs)
  const [fundingSpeed, setFundingSpeed] = useState<number>(0); // -30 to +30 days
  const [clearanceFastTrack, setClearanceFastTrack] = useState<number>(0); // 0 to 45 days saved
  const [workforceScaling, setWorkforceScaling] = useState<number>(0); // 0% to +50% augmentation

  // Calculated scenario projections
  const daysSavedFromClearance = clearanceFastTrack;
  const daysSavedFromWorkforce = Math.round((workforceScaling / 100) * 0.4 * currentDelayDays);
  const daysImpactFromFunding = fundingSpeed < 0 ? Math.abs(fundingSpeed) : -Math.round(fundingSpeed * 0.5);

  const netDaysSaved = Math.max(0, daysSavedFromClearance + daysSavedFromWorkforce - daysImpactFromFunding);
  const projectedDelayDays = Math.max(0, currentDelayDays - netDaysSaved);
  
  // Cost impact: workforce augmentation costs additional money, but saves delay liquidated damages
  const additionalWorkforceCost = Math.round(originalCostPaise * (workforceScaling / 100) * 0.04);
  const costSavingsFromDelay = Math.round((netDaysSaved / 30) * (originalCostPaise * 0.005));
  const netFinancialImpactPaise = additionalWorkforceCost - costSavingsFromDelay;

  const projectedOverrunProb = Math.max(0.12, Math.min(0.95, currentOverrunProb - (netDaysSaved / 250)));

  const handleReset = () => {
    setFundingSpeed(0);
    setClearanceFastTrack(0);
    setWorkforceScaling(0);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Recovery Feasibility Workspace</h3>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Interactive What-If Simulation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate administrative interventions: Test assumed acceleration from statutory clearance fast-tracking, funding disbursement, and contractor workforce scaling.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Levers
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Simulation Sliders */}
        <div className="space-y-5 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Assumed Policy Levers
          </h4>

          {/* Lever 1: Statutory Clearances Fast-Track */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Statutory / Forest Clearance Acceleration</span>
              <strong className="text-blue-700 font-mono">+{clearanceFastTrack} days saved</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={clearanceFastTrack}
              onChange={(e) => setClearanceFastTrack(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Standard (0d)</span>
              <span>Single Window Fast-track (60d)</span>
            </div>
          </div>

          {/* Lever 2: Contractor Workforce & Shift Augmentation */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Contractor Resource Augmentation (Double Shift)</span>
              <strong className="text-blue-700 font-mono">+{workforceScaling}% capacity</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="10"
              value={workforceScaling}
              onChange={(e) => setWorkforceScaling(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Baseline 1 Shift</span>
              <span>Extended +50% Shifts</span>
            </div>
          </div>

          {/* Lever 3: Milestone Fund Release Turnaround */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-700">Treasury Bill Settlement Cycle</span>
              <strong className="text-blue-700 font-mono">
                {fundingSpeed < 0 ? `${Math.abs(fundingSpeed)} days delay` : `${fundingSpeed} days faster`}
              </strong>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              step="5"
              value={fundingSpeed}
              onChange={(e) => setFundingSpeed(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-30d Liquidity Crunch</span>
              <span>+30d Advance Mobilization</span>
            </div>
          </div>
        </div>

        {/* Right Column: Simulated Outcomes */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Projected Recovery Trajectory
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Baseline Forecast Delay</span>
              <span className="text-xl font-bold text-slate-400 line-through">+{currentDelayDays} days</span>
              <div className="mt-1 flex items-baseline gap-1 text-emerald-700 font-bold">
                <span className="text-2xl">+{projectedDelayDays}</span>
                <span className="text-xs">days</span>
              </div>
              <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                ▼ {netDaysSaved} days recoverable
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] text-slate-500 block">Cost Overrun Probability</span>
              <span className="text-xl font-bold text-slate-400 line-through">
                {(currentOverrunProb * 100).toFixed(0)}%
              </span>
              <div className="mt-1 flex items-baseline gap-1 text-blue-700 font-bold">
                <span className="text-2xl">{(projectedOverrunProb * 100).toFixed(0)}</span>
                <span className="text-xs">%</span>
              </div>
              <span className="text-[10px] text-blue-600 block mt-0.5 font-medium">
                Risk Tier: {projectedOverrunProb > 0.75 ? 'Critical' : projectedOverrunProb > 0.5 ? 'High' : 'Medium'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-600">Additional Acceleration Resource Cost:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(Math.max(0, netFinancialImpactPaise))}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Estimated Return on Intervention (ROI):</span>
              <span className="text-emerald-700 font-bold">2.4x delay damage mitigation</span>
            </div>
          </div>

          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              <strong>Simulation Disclosure:</strong> What-if recovery scenario figures represent heuristic policy approximations under user-defined assumptions. They do not constitute a contractual warranty or legal guarantee of delivery dates.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
