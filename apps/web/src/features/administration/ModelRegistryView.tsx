import React, { useState } from 'react';
import { Cpu, CheckCircle2, RotateCcw, AlertCircle, ShieldCheck, TrendingUp, BarChart2 } from 'lucide-react';

interface ModelEntry {
  version: string;
  type: string;
  status: 'active' | 'candidate' | 'archived';
  trainedDate: string;
  samples: number;
  rocAuc: number;
  prAuc: number;
  brierScore: number;
  maeDays: number;
  medianAeDays: number;
  notes: string;
}

export const ModelRegistryView: React.FC = () => {
  const [models, setModels] = useState<ModelEntry[]>([
    {
      version: 'v1.2.0-xgb',
      type: 'Calibrated Gradient Boosting Classifier & Regressor',
      status: 'active',
      trainedDate: '2026-10-14',
      samples: 2502,
      rocAuc: 0.8037,
      prAuc: 0.8172,
      brierScore: 0.2001,
      maeDays: 158.8,
      medianAeDays: 98.4,
      notes: 'Calibrated using Sigmoid CV across 90 train projects with project-level split.'
    },
    {
      version: 'v1.0.0-logistic',
      type: 'Logistic Regression & Ridge Baseline',
      status: 'archived',
      trainedDate: '2026-08-01',
      samples: 2502,
      rocAuc: 0.8253,
      prAuc: 0.8010,
      brierScore: 0.2350,
      maeDays: 152.6,
      medianAeDays: 112.0,
      notes: 'Initial linear baseline model.'
    },
    {
      version: 'v1.3.0-rf',
      type: 'Random Forest Ensemble with Quantile Intervals',
      status: 'candidate',
      trainedDate: '2026-10-10',
      samples: 2502,
      rocAuc: 0.8115,
      prAuc: 0.8240,
      brierScore: 0.1980,
      maeDays: 155.2,
      medianAeDays: 95.0,
      notes: 'Evaluation in staging. Under review for prospective deployment.'
    }
  ]);

  const handleActivate = (version: string) => {
    if (confirm(`Activate model version ${version} as the primary inference engine?`)) {
      setModels(prev => prev.map(m => ({
        ...m,
        status: m.version === version ? 'active' : m.status === 'active' ? 'archived' : m.status
      })));
      alert(`Model ${version} successfully activated.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Machine Learning Model Registry & Governance
            </h1>
            <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
              Reproducible Evaluation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track trained models, holdout performance metrics, calibration curves, and activation lifecycles.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {models.map(m => (
          <div
            key={m.version}
            className={`bg-white rounded-xl border p-5 shadow-2xs space-y-4 transition ${
              m.status === 'active' ? 'border-blue-300 ring-2 ring-blue-500/10' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{m.version}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    m.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'candidate' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.status}
                  </span>
                </div>
                <h3 className="font-semibold text-xs text-slate-700 mt-1">{m.type}</h3>
              </div>

              {m.status !== 'active' && (
                <button
                  onClick={() => handleActivate(m.version)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition self-start"
                >
                  Activate Version
                </button>
              )}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ROC-AUC (Cost)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{m.rocAuc.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">PR-AUC (Cost)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{m.prAuc.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Brier Score</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{m.brierScore.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">MAE Delay</span>
                <span className="font-bold text-amber-700 font-mono text-sm">{m.maeDays.toFixed(1)} days</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Median Absolute Error</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{m.medianAeDays.toFixed(1)} days</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">"{m.notes}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};
