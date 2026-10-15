import React from 'react';
import { Project, Assessment, Milestone, Intervention } from '@projectsetu/contracts';
import { formatCurrency, formatDate } from '@/lib/formatting';
import { Download, Printer, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';

interface ProjectReportExportProps {
  project: Project;
  assessment?: Assessment;
  milestones: Milestone[];
  interventions: Intervention[];
}

export const ProjectReportExport: React.FC<ProjectReportExportProps> = ({
  project,
  assessment,
  milestones,
  interventions
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Downloadable Official Review Report</h3>
          <p className="text-xs text-slate-500">
            Export comprehensive MoSPI IPMD Project Intelligence Dossier (PDF/Print)
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* Styled Printable Dossier */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6 text-slate-800 font-sans print:border-none print:shadow-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-700 text-white rounded-lg flex items-center justify-center font-bold">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Government of India • Ministry of Statistics & Programme Implementation
              </span>
              <h1 className="text-xl font-extrabold text-slate-900">
                ProjectSetu — Official Project Review Dossier
              </h1>
              <span className="text-xs text-slate-600">
                Infrastructure and Project Monitoring Division (IPMD) • SIH26103
              </span>
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="font-mono text-slate-500 block">REPORT ID: {project.code}-RPT</span>
            <span className="text-slate-500 block">Generated: {new Date().toLocaleDateString('en-IN')}</span>
            <span className="inline-block mt-1 bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
              CONFIDENTIAL • IPMD REVIEW
            </span>
          </div>
        </div>

        {/* Section 1: Executive Summary & Baselines */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            1. Project Profile & Baseline Comparison
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 block">Project Name:</span>
              <strong className="text-slate-900 text-sm block mt-0.5">{project.name}</strong>
              <span className="text-slate-500 text-[11px] font-mono">{project.code}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Sector & Location:</span>
              <strong className="text-slate-900 block mt-0.5">{project.sector}</strong>
              <span className="text-slate-500 text-[11px]">{project.publicLocation}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Implementing Agency:</span>
              <strong className="text-slate-900 block mt-0.5">{project.implementingAgencyName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Status:</span>
              <span className="inline-block mt-1 capitalize px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-semibold">
                {project.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Baseline Financials & Timeline Table */}
          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2.5 text-left">Parameter</th>
                <th className="p-2.5 text-right">Original Approved Baseline</th>
                <th className="p-2.5 text-right">Current Approved Revision</th>
                <th className="p-2.5 text-right">Variance / Escalation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 font-medium">Approved Capital Cost</td>
                <td className="p-2.5 text-right font-mono">{formatCurrency(project.originalCostPaise)}</td>
                <td className="p-2.5 text-right font-mono">{formatCurrency(project.currentApprovedCostPaise)}</td>
                <td className="p-2.5 text-right font-mono text-red-600 font-bold">
                  +{formatCurrency(project.currentApprovedCostPaise - project.originalCostPaise)}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium">Planned Completion Date</td>
                <td className="p-2.5 text-right">{project.originalEndDate}</td>
                <td className="p-2.5 text-right">{project.currentPlannedEndDate}</td>
                <td className="p-2.5 text-right text-amber-600 font-bold">Baseline Adjusted</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Predictive Risk Assessment (Risk Passport) */}
        {assessment && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
              2. Machine Learning Predictive Risk Assessment (Risk Passport)
            </h2>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">Composite Risk Index</span>
                <span className="text-2xl font-extrabold text-slate-900 block mt-1">
                  {assessment.riskScore} / 100
                </span>
                <span className="text-[10px] font-bold text-red-700 uppercase">
                  {assessment.riskTier} Risk
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">Cost Overrun Probability</span>
                <span className="text-2xl font-extrabold text-blue-700 block mt-1">
                  {(assessment.costOverrunProbability * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500">
                  Est. Escalation: {formatCurrency(assessment.predictedCostEscalationPaise)}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-slate-500 block">Predicted Delay</span>
                <span className="text-2xl font-extrabold text-amber-600 block mt-1">
                  +{assessment.predictedDelayDays} days
                </span>
                <span className="text-[10px] text-slate-500">
                  80% Confidence: {assessment.predictionInterval.lowerDays}–{assessment.predictionInterval.upperDays} days
                </span>
              </div>
            </div>

            {/* Drivers */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-700 block">Top Predictive Risk Drivers (SHAP Attribution):</span>
              {assessment.topDrivers.map((d, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">{d.featureLabel}</strong>: {d.plainLanguageSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Milestone Audit */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            3. Milestone Execution Status
          </h2>
          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-2 text-left">Milestone Title</th>
                <th className="p-2 text-center">Weight</th>
                <th className="p-2 text-center">Planned End</th>
                <th className="p-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {milestones.map(m => (
                <tr key={m.id}>
                  <td className="p-2 font-medium">{m.title}</td>
                  <td className="p-2 text-center font-mono">{m.weightPct}%</td>
                  <td className="p-2 text-center">{m.plannedEndDate}</td>
                  <td className="p-2 text-center">
                    <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100">
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 4: Corrective Interventions Log */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 border-b border-slate-200 pb-1">
            4. Assigned Corrective Interventions
          </h2>
          {interventions.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No interventions logged for this project.</p>
          ) : (
            <div className="space-y-2">
              {interventions.map(intv => (
                <div key={intv.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-900">{intv.title}</strong>
                    <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {intv.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-600">{intv.description}</p>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Owner: <strong>{intv.ownerName}</strong></span>
                    <span>Deadline: {intv.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mandatory SIH & Prototype Disclosures */}
        <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
          <p>
            <strong>Statutory Disclosure:</strong> This document was automatically compiled by the ProjectSetu Integrated Infrastructure Intelligence platform for the Smart India Hackathon SIH26103.
          </p>
          <p>
            Demonstration datasets, synthetic records, and model projections are calibrated prototypes and do not constitute an official legal determination by the Government of India or MoSPI.
          </p>
        </div>
      </div>
    </div>
  );
};
