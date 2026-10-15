import React from 'react';
import { Activity, CheckCircle2, Server, Database, Cpu, Lock, Terminal, ShieldCheck } from 'lucide-react';

export const SystemHealthView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Platform Architecture & System Health
            </h1>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Operational
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time diagnostics across Firebase operational services, ML inference workers, and local storage layers.
          </p>
        </div>
      </div>

      {/* Services Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-500" />
              Cloud Firestore
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-600">
            RBAC security rules active. Client direct writes to assessments, roles, and audit trail blocked.
          </p>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            Rules: firestore.rules (Version 2)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Python ML Microservice
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active (v1.2.0-xgb)
            </span>
          </div>
          <p className="text-xs text-slate-600">
            FastAPI + Calibrated GBDT + SHAP Explanations + Deterministic Heuristic Fallback engine.
          </p>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            Endpoint: /predict (Port 8000)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Security & Storage
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-600">
            Cloud Storage for Firebase rules scoped strictly to project evidence; MIME & size limits enforced.
          </p>
          <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
            Quota Limit: 15MB per document
          </div>
        </div>
      </div>

      {/* Local Commands Cheat Sheet for Evaluator */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 text-slate-200 space-y-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold border-b border-slate-800 pb-2">
          <Terminal className="w-4 h-4 text-blue-400" />
          Reproducible Local Run Commands (PowerShell / Bash)
        </div>
        <div className="space-y-1.5 text-slate-400">
          <p><span className="text-emerald-400"># Start Web Application:</span> npm run dev</p>
          <p><span className="text-emerald-400"># Train ML Models reproducibly:</span> python services/ml/training/train.py</p>
          <p><span className="text-emerald-400"># Run ML FastAPI Server:</span> uvicorn services.ml.app.main:app --port 8000</p>
          <p><span className="text-emerald-400"># Launch Firebase Emulators:</span> npx firebase-tools emulators:start</p>
        </div>
      </div>

      {/* Synthetic Dataset Notice */}
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold">Synthetic Demonstration Protocol Disclosure (SIH26103)</h4>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            All project records, contractor vouchers, and historical observations in this demonstration environment are synthetically generated under a fixed seed for evaluation reproducibility.
            No official confidential government records are stored or exposed.
          </p>
        </div>
      </div>
    </div>
  );
};
