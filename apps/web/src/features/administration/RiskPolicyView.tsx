import React, { useState } from 'react';
import { Sliders, ShieldCheck, CheckCircle2, RotateCcw, AlertCircle } from 'lucide-react';

export const RiskPolicyView: React.FC = () => {
  const [costWeight, setCostWeight] = useState(40);
  const [scheduleWeight, setScheduleWeight] = useState(30);
  const [milestoneWeight, setMilestoneWeight] = useState(20);
  const [blockerWeight, setBlockerWeight] = useState(10);
  const [saved, setSaved] = useState(false);

  const total = costWeight + scheduleWeight + milestoneWeight + blockerWeight;

  const handleSave = () => {
    if (total !== 100) {
      alert(`Weights must total exactly 100%. Current sum: ${total}%`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setCostWeight(40);
    setScheduleWeight(30);
    setMilestoneWeight(20);
    setBlockerWeight(10);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Risk Scoring Policy & Formula Configuration
            </h1>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Policy Version v1.0.0-mospi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure transparent composite weights across Cost Overrun, Schedule Delay, Milestone Slippage, and Blocker Severity.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Standard Weights
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Composite Index Weights</h3>
            <p className="text-xs text-slate-500">Weights must sum to exactly 100%</p>
          </div>
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
            total === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            Sum: {total}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Cost Overrun Probability (C):</span>
              <strong className="text-blue-700 font-mono">{costWeight}%</strong>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              value={costWeight}
              onChange={(e) => setCostWeight(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Calibrated probability of exceeding approved baseline</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Schedule Delay Factor (S):</span>
              <strong className="text-blue-700 font-mono">{scheduleWeight}%</strong>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              value={scheduleWeight}
              onChange={(e) => setScheduleWeight(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Normalized forecast positive delay beyond contractual target</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Milestone Slippage Fraction (M):</span>
              <strong className="text-blue-700 font-mono">{milestoneWeight}%</strong>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={milestoneWeight}
              onChange={(e) => setMilestoneWeight(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Weighted fraction of incomplete overdue milestones</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-700">Blocker Severity Index (B):</span>
              <strong className="text-blue-700 font-mono">{blockerWeight}%</strong>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={blockerWeight}
              onChange={(e) => setBlockerWeight(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">Reviewed land acquisition and statutory clearance hurdles</span>
          </div>
        </div>

        {/* Tier Boundaries */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Policy Risk Tiers
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="font-bold text-emerald-800 block">Low Risk</span>
              <span className="font-mono text-emerald-700">0 – 24</span>
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
              <span className="font-bold text-amber-800 block">Medium Risk</span>
              <span className="font-mono text-amber-700">25 – 49</span>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <span className="font-bold text-orange-800 block">High Risk</span>
              <span className="font-mono text-orange-700">50 – 74</span>
            </div>
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <span className="font-bold text-red-800 block">Critical Risk</span>
              <span className="font-mono text-red-700">75 – 100</span>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            {saved ? 'Policy Saved Successfully!' : 'Apply Policy Weights'}
          </button>
        </div>
      </div>
    </div>
  );
};
