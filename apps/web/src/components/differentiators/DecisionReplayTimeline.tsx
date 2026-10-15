import React, { useState } from 'react';
import { Observation, Assessment, Intervention } from '@projectsetu/contracts';
import { formatDate, formatCurrency } from '@/lib/formatting';
import { 
  History, 
  HelpCircle, 
  Cpu, 
  CheckCircle, 
  Play, 
  ArrowRight, 
  ChevronRight,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface DecisionReplayItem {
  period: string;
  date: string;
  knownInfo: {
    progress: number;
    spendPaise: number;
    blockers: string[];
    evidenceCount: number;
  };
  predicted: {
    delayDays: number;
    costOverrunProb: number;
    riskTier: string;
  };
  officerDecision: {
    officer: string;
    actionTaken: string;
    timestamp: string;
  };
  actionFollowed: {
    interventionTitle: string;
    assignedOwner: string;
    status: string;
  };
  whatChangedAfterward: string;
}

interface DecisionReplayTimelineProps {
  projectId: string;
  projectName: string;
}

export const DecisionReplayTimeline: React.FC<DecisionReplayTimelineProps> = ({
  projectId,
  projectName
}) => {
  // Demonstration decision history records
  const historyNodes: DecisionReplayItem[] = [
    {
      period: '2026-02',
      date: '2026-02-15',
      knownInfo: {
        progress: 52.2,
        spendPaise: 948600000000, // 948.6 Cr
        blockers: ['Coastal Zone Management (CRZ) right-of-way amendment'],
        evidenceCount: 8
      },
      predicted: {
        delayDays: 142,
        costOverrunProb: 0.82,
        riskTier: 'Critical'
      },
      officerDecision: {
        officer: 'Priya Sharma, IAS (MoSPI)',
        actionTaken: 'Approved monthly observation; initiated statutory escalation intervention',
        timestamp: '2026-02-16 11:30'
      },
      actionFollowed: {
        interventionTitle: 'Inter-Departmental Taskforce for CRZ Right-of-Way Clearance',
        assignedOwner: 'Sanjay Deshmukh (GWIL / NHAI)',
        status: 'In Progress'
      },
      whatChangedAfterward: 'Joint site survey scheduled with State Forest Department; revised alignment proposed saving 40 days.'
    },
    {
      period: '2025-10',
      date: '2025-10-20',
      knownInfo: {
        progress: 41.0,
        spendPaise: 680000000000,
        blockers: ['Intake subsea microtunneling seabed survey pending'],
        evidenceCount: 5
      },
      predicted: {
        delayDays: 85,
        costOverrunProb: 0.64,
        riskTier: 'High'
      },
      officerDecision: {
        officer: 'Priya Sharma, IAS (MoSPI)',
        actionTaken: 'Authorized specialized marine geotechnical subcontractor mobilization',
        timestamp: '2025-10-22 14:15'
      },
      actionFollowed: {
        interventionTitle: 'Emergency Marine Geotechnical Mobilization',
        assignedOwner: 'Marine Works Contractor',
        status: 'Completed'
      },
      whatChangedAfterward: 'Subsea acoustic survey finished ahead of monsoon; microtunneling path finalized.'
    }
  ];

  const [selectedIdx, setSelectedIdx] = useState<number>(0);
  const active = historyNodes[selectedIdx];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Decision Replay Timeline</h3>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
              Auditable Accountability Replay
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconstruct historical decision context: Information Available → Machine Prediction → Human Officer Action → Measured Outcome.
          </p>
        </div>

        {/* Reporting Period Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Reporting Cycle:</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {historyNodes.map((node, i) => (
              <button
                key={node.period}
                onClick={() => setSelectedIdx(i)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  selectedIdx === i 
                    ? 'bg-white text-blue-700 shadow-2xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {node.period}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5-Step Narrative Sequence */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {/* Step 1: What was known? */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">1</span>
            What was known?
          </div>
          <div className="text-xs space-y-1.5 text-slate-600 pt-1">
            <p>Physical: <strong className="text-slate-800">{active.knownInfo.progress}%</strong></p>
            <p>Spend: <strong className="text-slate-800">{formatCurrency(active.knownInfo.spendPaise)}</strong></p>
            <p>Evidence: <strong className="text-slate-800">{active.knownInfo.evidenceCount} verified files</strong></p>
            <p className="text-[11px] text-red-600 font-medium">
              Blocker: {active.knownInfo.blockers[0]}
            </p>
          </div>
        </div>

        {/* Step 2: What did system predict? */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
            <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px]">2</span>
            What was predicted?
          </div>
          <div className="text-xs space-y-1.5 text-blue-950 pt-1">
            <p>Risk: <strong className="text-red-700 font-bold">{active.predicted.riskTier}</strong></p>
            <p>Est. Delay: <strong className="text-amber-700 font-bold">+{active.predicted.delayDays} days</strong></p>
            <p>Cost Overrun: <strong className="text-blue-800 font-bold">{(active.predicted.costOverrunProb * 100).toFixed(0)}% prob</strong></p>
            <span className="text-[10px] text-blue-600 block mt-1">v1.2.0-xgb Calibrated</span>
          </div>
        </div>

        {/* Step 3: What did officer decide? */}
        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
            <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px]">3</span>
            Officer Decision
          </div>
          <div className="text-xs space-y-1.5 text-amber-950 pt-1">
            <p className="font-semibold text-slate-800">{active.officerDecision.officer}</p>
            <p className="text-[11px] text-slate-600">{active.officerDecision.actionTaken}</p>
            <span className="text-[10px] text-slate-400 block">{active.officerDecision.timestamp}</span>
          </div>
        </div>

        {/* Step 4: What action followed? */}
        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900">
            <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-[10px]">4</span>
            Action Followed
          </div>
          <div className="text-xs space-y-1.5 text-purple-950 pt-1">
            <p className="font-semibold text-slate-800">{active.actionFollowed.interventionTitle}</p>
            <p className="text-[11px] text-slate-600">Owner: {active.actionFollowed.assignedOwner}</p>
            <span className="inline-block text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-semibold">
              {active.actionFollowed.status}
            </span>
          </div>
        </div>

        {/* Step 5: What changed afterward? */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">5</span>
            Outcome & Change
          </div>
          <div className="text-xs text-emerald-950 pt-1">
            <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
              {active.whatChangedAfterward}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-2 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified in Follow-up
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
