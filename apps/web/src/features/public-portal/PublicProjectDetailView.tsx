import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { formatCurrency } from '@/lib/formatting';
import { 
  Building2, 
  MapPin, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar, 
  Globe, 
  ShieldCheck, 
  Info,
  Clock
} from 'lucide-react';

export const PublicProjectDetailView: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? AppStorage.getPublicProjectById(projectId) : undefined;

  if (!project) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] p-8 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center max-w-md">
          <h2 className="font-bold text-slate-800 text-sm">Project Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">This project has not been approved for public disclosure or does not exist.</p>
          <Link to="/public" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
            Return to Public Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/public" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Public Projects
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Official MoSPI Publication</span>
            <Link to="/login" className="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg">
              Officer Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
          {/* Title Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                {project.sector}
              </span>
              <span className="font-mono text-slate-400 font-semibold text-xs">{project.code}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-600">{project.implementingAgency}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {project.publicLocation}
            </p>
          </div>

          {/* Official Status Explanation */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 space-y-1">
            <span className="font-bold text-blue-900 block uppercase tracking-wider text-[10px]">
              Latest Official Status Statement:
            </span>
            <p className="leading-relaxed">{project.publicStatusExplanation}</p>
          </div>

          {/* Key Public Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Sanctioned Outlay</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {formatCurrency(project.approvedRevisedCostPaise)}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original Sanction: {formatCurrency(project.originalCostPaise)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved Progress</span>
              <span className="text-xl font-black text-blue-700 mt-1 block">
                {project.approvedPhysicalProgressPct}%
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${project.approvedPhysicalProgressPct}%` }} />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Completion Date</span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {project.revisedCompletionDate}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Original Date: {project.originalCompletionDate}
              </span>
            </div>
          </div>

          {/* Public Milestones Summary */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Public Milestone Progress ({project.completedMilestoneCount} of {project.publishedMilestoneCount} Complete)
              </h3>
            </div>

            <div className="space-y-2">
              {project.publicMilestones.map((m, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 block">{m.title}</span>
                    <span className="text-[10px] text-slate-400">Scheduled: {m.plannedDate}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    m.status === 'delayed' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {m.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Publishing Seal */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Verification Seal:</strong> Approved for public release by <strong className="text-slate-800">{project.approvedByOfficerName}</strong> on {project.publishedAt.split('T')[0]}.
              </p>
              <p className="text-[11px] text-slate-400">
                {project.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
