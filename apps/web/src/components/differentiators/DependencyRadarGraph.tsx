import React from 'react';
import { Milestone } from '@projectsetu/contracts';
import { 
  GitFork, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Network
} from 'lucide-react';

interface DependencyRadarGraphProps {
  milestones: Milestone[];
}

export const DependencyRadarGraph: React.FC<DependencyRadarGraphProps> = ({ milestones }) => {
  // Identify exposed downstream milestones
  const blockedOrDelayedIds = new Set(
    milestones.filter(m => m.status === 'blocked' || m.status === 'delayed').map(m => m.id)
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">Dependency Cascade Radar</h3>
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              Prerequisite Network Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Structural chain: Statutory Clearances → Land Acquisition → Civil Works → Commissioning.
            Identifies downstream exposure when upstream bottlenecks remain unresolved.
          </p>
        </div>
      </div>

      {/* Visual Workflow Chain */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          {milestones.slice(0, 4).map((m, idx) => {
            const hasUnresolvedDependency = m.dependencyIds.some(depId => blockedOrDelayedIds.has(depId));
            const isCritical = m.status === 'delayed' || m.status === 'blocked' || hasUnresolvedDependency;

            return (
              <div 
                key={m.id}
                className={`p-4 rounded-xl border relative transition ${
                  isCritical 
                    ? 'border-red-300 bg-red-50/40 shadow-xs' 
                    : m.status === 'completed'
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    STAGE 0{idx + 1}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'delayed' ? 'bg-red-100 text-red-800' :
                    m.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="font-semibold text-xs text-slate-900 leading-snug">{m.title}</h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{m.description}</p>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Weight: <strong>{m.weightPct}%</strong></span>
                  <span className="text-slate-500">End: {m.plannedEndDate}</span>
                </div>

                {/* Cascade exposure badge */}
                {hasUnresolvedDependency && m.status !== 'completed' && (
                  <div className="mt-2.5 flex items-center gap-1 text-[10px] text-red-700 bg-red-100/80 px-2 py-1 rounded font-medium">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Cascade Exposure from Stage 0{idx}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <GitFork className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Methodology note:</strong> Upstream slippage creates downstream scheduling exposure along the critical path. Downstream exposure is flagged as structural risk, not an automatic guarantee of delay.
          </span>
        </div>
      </div>
    </div>
  );
};
