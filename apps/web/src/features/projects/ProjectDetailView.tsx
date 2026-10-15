import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Project, Observation, Milestone, Intervention, Assessment } from '@projectsetu/contracts';
import { formatCurrency, formatDate, paiseToCrores } from '@/lib/formatting';

// Differentiators & Charts
import { RiskPassportModal } from '@/components/differentiators/RiskPassportModal';
import { FreshnessEvidenceLens } from '@/components/differentiators/FreshnessEvidenceLens';
import { DecisionReplayTimeline } from '@/components/differentiators/DecisionReplayTimeline';
import { DependencyRadarGraph } from '@/components/differentiators/DependencyRadarGraph';
import { EvidenceDiscrepancyQueue } from '@/components/differentiators/EvidenceDiscrepancyQueue';
import { RecoveryScenarioWorkspace } from '@/components/differentiators/RecoveryScenarioWorkspace';
import { ProgressSCurve } from '@/components/charts/ProgressSCurve';
import { SpendBreakdownChart } from '@/components/charts/SpendBreakdownChart';
import { NewObservationModal } from '@/features/observations/NewObservationModal';
import { ProjectReportExport } from '@/features/projects/ProjectReportExport';

import { 
  Building2, 
  MapPin, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Upload, 
  Sparkles, 
  History, 
  Network, 
  Sliders, 
  Globe, 
  Printer, 
  PlusCircle, 
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Clock
} from 'lucide-react';

export const ProjectDetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user, role, permissions } = useAuth();

  const [project, setProject] = useState<Project | null>(() => {
    return projectId ? AppStorage.getProjectById(projectId) || null : null;
  });
  const [assessment, setAssessment] = useState<Assessment | undefined>(() => {
    return projectId ? AppStorage.getAssessment(projectId) : undefined;
  });
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    return projectId ? AppStorage.getMilestones(projectId) : [];
  });
  const [observations, setObservations] = useState<Observation[]>(() => {
    return projectId ? AppStorage.getObservations(projectId) : [];
  });
  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    return projectId ? AppStorage.getInterventions(projectId) : [];
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'milestones' | 'risk' | 'interventions' | 'replay' | 'dependencies' | 'scenarios' | 'report'>('overview');
  const [isPassportOpen, setIsPassportOpen] = useState(false);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAssessing, setIsAssessing] = useState(false);

  const reloadData = () => {
    if (!projectId) return;
    setProject(AppStorage.getProjectById(projectId) || null);
    setAssessment(AppStorage.getAssessment(projectId));
    setMilestones(AppStorage.getMilestones(projectId));
    setObservations(AppStorage.getObservations(projectId));
    setInterventions(AppStorage.getInterventions(projectId));
  };

  useEffect(() => {
    reloadData();
    window.addEventListener('projectsetu-update', reloadData);
    return () => window.removeEventListener('projectsetu-update', reloadData);
  }, [projectId]);

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested project ID does not exist in registry.</p>
        <Link to="/app/projects" className="mt-4 inline-block text-xs text-blue-600 font-semibold hover:underline">
          Return to Project Registry
        </Link>
      </div>
    );
  }

  const handleRerunAssessment = () => {
    setIsAssessing(true);
    setTimeout(() => {
      AppStorage.runAssessmentOnProject(project.id);
      setIsAssessing(false);
      reloadData();
    }, 600);
  };

  const handlePublishToCitizenPortal = () => {
    const summary = prompt('Enter official citizen summary text for publication:', `${project.name} is progressing under approved MoSPI monitoring framework.`);
    if (summary) {
      AppStorage.publishProject(project.id, summary);
      alert('Published to Citizen Portal successfully!');
      reloadData();
    }
  };

  const handleApproveObservation = (obsId: string) => {
    if (confirm('Approve this monthly update and trigger server-side ML risk assessment?')) {
      AppStorage.approveObservation(project.id, obsId, 'Approved by IPMD officer following data verification.');
      reloadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                {project.sector}
              </span>
              <span className="text-xs font-mono font-semibold text-slate-500">
                {project.code}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600 font-medium">
                {project.implementingAgencyName}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {project.publicLocation}
            </p>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {permissions.canSubmitObservation && (
              <button
                onClick={() => setIsObsModalOpen(true)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <PlusCircle className="w-4 h-4" />
                Submit Monthly Update
              </button>
            )}

            {permissions.canRerunAssessment && (
              <button
                onClick={handleRerunAssessment}
                disabled={isAssessing}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-2xs transition"
              >
                <RotateCw className={`w-3.5 h-3.5 text-blue-600 ${isAssessing ? 'animate-spin' : ''}`} />
                {isAssessing ? 'Assessing...' : 'Rerun Assessment'}
              </button>
            )}

            {permissions.canPublishPublic && (
              <button
                onClick={handlePublishToCitizenPortal}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-1.5 shadow-2xs transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                Publish to Citizen Portal
              </button>
            )}

            <button
              onClick={() => setActiveTab('report')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Export Review Dossier
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-6 border-b border-slate-200 overflow-x-auto text-xs font-medium no-print">
          {[
            { id: 'overview', label: 'Overview & Baselines' },
            { id: 'financials', label: 'Financials & S-Curve' },
            { id: 'milestones', label: 'Milestones (100%)' },
            { id: 'risk', label: 'Risk Passport & SHAP' },
            { id: 'interventions', label: `Interventions (${interventions.length})` },
            { id: 'replay', label: 'Decision Replay' },
            { id: 'dependencies', label: 'Dependency Radar' },
            { id: 'scenarios', label: 'Recovery Scenarios' },
            { id: 'report', label: 'Report Dossier' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & BASELINES */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Baseline Comparison Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
              Baseline vs Revised Execution Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Original Baseline Cost</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatCurrency(project.originalCostPaise)}
                </span>
                <span className="text-[10px] text-slate-500">Sanctioned Date: {project.originalStartDate}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Approved Cost</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {formatCurrency(project.currentApprovedCostPaise)}
                </span>
                {project.currentApprovedCostPaise > project.originalCostPaise ? (
                  <span className="text-[10px] text-red-600 font-semibold">
                    +{formatCurrency(project.currentApprovedCostPaise - project.originalCostPaise)} escalation
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-600 font-semibold">Within sanctioned baseline</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Original Completion</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {project.originalEndDate}
                </span>
                <span className="text-[10px] text-slate-500">Contractual duration</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Revised Target Completion</span>
                <span className="text-lg font-bold text-amber-700 mt-1 block">
                  {project.currentPlannedEndDate}
                </span>
                <span className="text-[10px] text-amber-600 font-medium">Extension approved by MoSPI</span>
              </div>
            </div>
          </div>

          {/* Differentiator B: Freshness and Evidence Lens */}
          <FreshnessEvidenceLens
            freshnessDays={project.freshnessDays}
            evidenceCompletenessPct={project.evidenceCompletenessPct}
            riskScore={assessment?.riskScore || 45}
            riskTier={assessment?.riskTier || 'medium'}
          />

          {/* Progress S-Curve */}
          <ProgressSCurve currentProgressPct={55.0} />

          {/* Evidence Discrepancy Queue */}
          <EvidenceDiscrepancyQueue />
        </div>
      )}

      {/* TAB 2: FINANCIALS & S-CURVE */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProgressSCurve currentProgressPct={55.0} />
            <SpendBreakdownChart totalBudgetCr={paiseToCrores(project.originalCostPaise)} />
          </div>

          {/* Historical Observations List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-sm">Monthly Progress Filing History</h3>
              <span className="text-xs text-slate-500">{observations.length} updates logged</span>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Period</th>
                  <th className="p-2.5 text-right">Cumulative Spend</th>
                  <th className="p-2.5 text-right">Physical Progress</th>
                  <th className="p-2.5">Blockers</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {observations.map(obs => (
                  <tr key={obs.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-bold text-slate-800">{obs.reportingPeriod}</td>
                    <td className="p-2.5 text-right font-mono">{formatCurrency(obs.cumulativeExpenditurePaise)}</td>
                    <td className="p-2.5 text-right font-bold text-slate-900">{obs.physicalProgressPct}%</td>
                    <td className="p-2.5 text-slate-600">
                      {obs.blockerCategories.length > 0 ? (
                        <span className="text-red-600 font-medium">{obs.blockerCategories.join(', ')}</span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        obs.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {obs.approvalStatus}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      {obs.approvalStatus === 'submitted' && (role === 'officer' || role === 'admin') && (
                        <button
                          onClick={() => handleApproveObservation(obs.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold transition"
                        >
                          Approve Observation
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MILESTONES (100% WEIGHTED) */}
      {activeTab === 'milestones' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Project Milestones & Critical Path</h3>
              <p className="text-xs text-slate-500">
                Total Allocated Weight: <strong className="text-blue-700 font-bold">100%</strong> (MoSPI Constraint Enforced)
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {milestones.map(m => (
              <div key={m.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{m.title}</span>
                    <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-200">
                      Weight: {m.weightPct}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{m.description}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>Owner: <strong>{m.ownerName}</strong></span>
                    <span>Target Date: {m.plannedEndDate}</span>
                    {m.dependencyIds.length > 0 && (
                      <span className="text-indigo-600 font-medium">Prerequisites: {m.dependencyIds.join(', ')}</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'delayed' ? 'bg-red-100 text-red-800' :
                    m.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RISK PASSPORT & SHAP EXPLANATIONS */}
      {activeTab === 'risk' && assessment && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Risk Passport #{assessment.id.slice(-8)}</h3>
                  <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Reproducible Record
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Engine: <strong className="text-slate-700">{assessment.modelVersion}</strong> • Policy: <strong className="text-slate-700">{assessment.policyVersion}</strong> • Fingerprint: <span className="font-mono text-slate-600">{assessment.inputSnapshotHash.slice(0, 16)}...</span>
                </p>
              </div>

              <button
                onClick={() => setIsPassportOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Open Full Risk Passport Dossier
              </button>
            </div>

            {/* Metric Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Composite Risk Score</span>
                <span className="text-3xl font-extrabold text-slate-900 block mt-1">
                  {assessment.riskScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </span>
                <span className="text-[10px] font-bold text-red-700 uppercase mt-1 inline-block">
                  {assessment.riskTier} Risk
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Predicted Cost Overrun Probability</span>
                <span className="text-3xl font-extrabold text-blue-700 block mt-1">
                  {(assessment.costOverrunProbability * 100).toFixed(0)}%
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Est. Escalation: {formatCurrency(assessment.predictedCostEscalationPaise)}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Predicted Positive Delay</span>
                <span className="text-3xl font-extrabold text-amber-600 block mt-1">
                  +{assessment.predictedDelayDays} <span className="text-sm font-normal text-slate-400">days</span>
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  80% Interval: {assessment.predictionInterval.lowerDays} – {assessment.predictionInterval.upperDays} days
                </span>
              </div>
            </div>

            {/* Drivers */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Primary Predictive Factors (SHAP Contributions)
              </h4>
              {assessment.topDrivers.map((driver, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${driver.direction === 'increases_risk' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900">{driver.featureLabel}</strong>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        driver.direction === 'increases_risk' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        SHAP: {driver.impactScore > 0 ? '+' : ''}{driver.impactScore.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{driver.plainLanguageSummary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INTERVENTIONS */}
      {activeTab === 'interventions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Corrective Interventions Log</h3>
              <p className="text-xs text-slate-500">Enforced state machine lifecycle tracking</p>
            </div>
          </div>

          <div className="space-y-3">
            {interventions.map(intv => (
              <div key={intv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{intv.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{intv.description}</p>
                  </div>
                  <span className="capitalize text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                    {intv.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Owner: <strong>{intv.ownerName}</strong> ({intv.ownerOrganization})</span>
                  <span>Deadline: <strong>{intv.dueDate}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: DECISION REPLAY */}
      {activeTab === 'replay' && (
        <DecisionReplayTimeline projectId={project.id} projectName={project.name} />
      )}

      {/* TAB 7: DEPENDENCY RADAR */}
      {activeTab === 'dependencies' && (
        <DependencyRadarGraph milestones={milestones} />
      )}

      {/* TAB 8: RECOVERY SCENARIO WORKSPACE */}
      {activeTab === 'scenarios' && (
        <RecoveryScenarioWorkspace
          originalCostPaise={project.originalCostPaise}
          originalDurationDays={720}
          currentDelayDays={assessment?.predictedDelayDays || 90}
          currentOverrunProb={assessment?.costOverrunProbability || 0.65}
        />
      )}

      {/* TAB 9: REPORT EXPORT DOSSIER */}
      {activeTab === 'report' && (
        <ProjectReportExport
          project={project}
          assessment={assessment}
          milestones={milestones}
          interventions={interventions}
        />
      )}

      {/* Risk Passport Full Modal */}
      {assessment && (
        <RiskPassportModal
          assessment={assessment}
          projectName={project.name}
          projectCode={project.code}
          isOpen={isPassportOpen}
          onClose={() => setIsPassportOpen(false)}
        />
      )}

      {/* New Observation Modal */}
      <NewObservationModal
        project={project}
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onSuccess={() => {
          alert('Observation submitted successfully! Pending officer approval.');
          reloadData();
        }}
      />
    </div>
  );
};
