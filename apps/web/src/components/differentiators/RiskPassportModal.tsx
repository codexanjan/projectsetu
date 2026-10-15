import React from 'react';
import { Assessment, FeatureDriver } from '@projectsetu/contracts';
import { formatCurrency, formatPercent } from '@/lib/formatting';
import { 
  ShieldCheck, 
  X, 
  Hash, 
  Cpu, 
  Sliders, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  FileText, 
  CheckCircle2,
  Lock
} from 'lucide-react';

interface RiskPassportModalProps {
  assessment: Assessment;
  projectName: string;
  projectCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RiskPassportModal: React.FC<RiskPassportModalProps> = ({
  assessment,
  projectName,
  projectCode,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">Official Assessment Record</span>
                <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  Immutable Snapshot
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">Risk Passport #{assessment.id.slice(-8)}</h2>
              <p className="text-xs text-slate-300 mt-1">{projectName} ({projectCode})</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Passport Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment As-Of</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {assessment.asOfDate}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Model Engine</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                {assessment.modelVersion}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Policy Schema</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 font-mono">
                <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                {assessment.policyVersion}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Mode</span>
              <span className="font-semibold text-slate-800 capitalize mt-0.5 block">
                {assessment.assessmentMode.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Fingerprint */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2.5 text-xs">
            <Lock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-blue-900">Input Data Snapshot Fingerprint (SHA-256):</span>
              <p className="font-mono text-[11px] text-blue-700 break-all select-all mt-0.5">
                {assessment.inputSnapshotHash}
              </p>
              <p className="text-[10px] text-blue-600 mt-1">
                Guarantees zero retrospective drift. Viewing this assessment replays the exact predictions calculated from historical observation records available at cutoff date.
              </p>
            </div>
          </div>

          {/* Metric Outputs */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Predictive Outcomes & Calculated Scores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Composite Risk Index</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-slate-900">{assessment.riskScore}</span>
                  <span className="text-xs font-medium text-slate-400">/ 100</span>
                </div>
                <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  assessment.riskTier === 'critical' ? 'bg-red-100 text-red-800' :
                  assessment.riskTier === 'high' ? 'bg-orange-100 text-orange-800' :
                  assessment.riskTier === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {assessment.riskTier} Risk
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Cost Overrun Probability</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-blue-700">
                    {formatPercent(assessment.costOverrunProbability * 100, 0)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Est. Escalation: <strong className="text-slate-800">{formatCurrency(assessment.predictedCostEscalationPaise)}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                <span className="text-xs text-slate-500 block">Predicted Delay</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-amber-600">
                    +{assessment.predictedDelayDays}
                  </span>
                  <span className="text-xs font-medium text-slate-400">days</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  80% Interval: {assessment.predictionInterval.lowerDays} – {assessment.predictionInterval.upperDays} days
                </p>
              </div>
            </div>
          </div>

          {/* Policy Weight Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Formula Breakdown (MoSPI v1.0.0 Policy Weights)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-slate-400 block text-[10px]">40% Cost Overrun</span>
                <span className="font-mono font-bold text-slate-800">
                  {assessment.riskComponents.calibratedCostOverrunProb.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">30% Schedule Delay</span>
                <span className="font-mono font-bold text-slate-800">
                  {assessment.riskComponents.scheduleDelayIndex.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">20% Milestones</span>
                <span className="font-mono font-bold text-slate-800">
                  {assessment.riskComponents.milestoneSlippageFraction.toFixed(3)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">10% Blockers</span>
                <span className="font-mono font-bold text-slate-800">
                  {assessment.riskComponents.blockerSeverityIndex.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          {/* Traceable Explainability Drivers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Top Predictive Drivers & Evidence Attribution
            </h3>
            <div className="space-y-2.5">
              {assessment.topDrivers.map((driver, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${driver.direction === 'increases_risk' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{driver.featureLabel}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        driver.direction === 'increases_risk' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        SHAP Impact: {driver.impactScore > 0 ? '+' : ''}{driver.impactScore.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{driver.plainLanguageSummary}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      Observed Value: <strong className="text-slate-600">{driver.featureValue}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Synthetic Demonstration Forecast • SIH26103</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition"
          >
            Close Passport
          </button>
        </div>
      </div>
    </div>
  );
};
