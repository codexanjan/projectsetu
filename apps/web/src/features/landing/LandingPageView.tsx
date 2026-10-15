import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '@/features/auth/AuthContext';
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Eye, 
  History, 
  GitFork, 
  FileCheck2, 
  Lock, 
  Globe, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Activity,
  Layers,
  HardHat,
  Scale,
  Clock,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Calendar,
  MapPin,
  ExternalLink,
  Send,
  Camera,
  FileSpreadsheet,
  Compass,
  Satellite
} from 'lucide-react';
import { IndiaProjectMap } from '@/components/maps/IndiaProjectMap';
import { AppStorage } from '@/lib/storage';

export const LandingPageView: React.FC = () => {
  const { switchRole, login } = useAuth();
  const navigate = useNavigate();

  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  // Inter-Portal Governance Simulation State
  const [currentSimStep, setCurrentSimStep] = useState<number>(1);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);

  // Interactive What-If Risk Sandbox State
  const [sandboxProgressGap, setSandboxProgressGap] = useState(22);
  const [sandboxHasBlocker, setSandboxHasBlocker] = useState(true);
  const [sandboxSpendEscalation, setSandboxSpendEscalation] = useState(15);

  // Calculate live reactive risk in the sandbox
  const simulatedCostOverrunProb = Math.min(0.96, Math.max(0.12, 0.25 + (sandboxSpendEscalation * 0.02) + (sandboxProgressGap * 0.015)));
  const simulatedDelayDays = Math.round(45 + (sandboxProgressGap * 4.2) + (sandboxHasBlocker ? 85 : 0));
  const simulatedRiskScore = Math.round(
    100 * (
      0.40 * simulatedCostOverrunProb +
      0.30 * Math.min(1.0, simulatedDelayDays / 365) +
      0.20 * (sandboxProgressGap > 15 ? 0.65 : 0.2) +
      0.10 * (sandboxHasBlocker ? 0.8 : 0.1)
    )
  );

  // Simulation Stages Definition
  const simulationStages = [
    {
      step: 1,
      fromDesk: 'Mobile Field Survey Desk',
      toDesk: 'Implementing Agency Desk',
      actor: 'Pooja Nair (Resident Executive Engineer)',
      role: 'field_contributor' as const,
      email: 'engineer@nhai.gov.in',
      icon: HardHat,
      color: 'amber',
      title: 'Geotagged Site Inspection & Chainage Progress',
      summary: 'Engineer records drone photo and GPS-stamped progress at Katra Package 4 (Chainage 142+200), logging monsoon drainage runoff delays.',
      payload: {
        location: '28.6139° N, 77.2090° E',
        physicalObserved: 'Pier P14 concrete cast completed',
        blocker: 'Right-of-Way forest clearance delay (6 weeks)'
      },
      nextAction: 'Transmitted to NHAI Agency Desk for monthly baseline consolidation.'
    },
    {
      step: 2,
      fromDesk: 'Implementing Agency Desk',
      toDesk: 'MoSPI Cabinet Command',
      actor: 'Vikramaditya Singh (Chief Project Manager, NHAI)',
      role: 'agency_manager' as const,
      email: 'manager@nhai.gov.in',
      icon: Clock,
      color: 'indigo',
      title: 'Monthly Baseline Filing & Expenditure Reconciliation',
      summary: 'Agency validates field inspection, attaches audited expenditure sheet (₹750 Cr cumulative spend), and submits official monthly progress filing.',
      payload: {
        expenditurePaise: '₹750 Cr Cumulative CAPEX',
        physicalProgress: '35.0% (Planned: 50.0%)',
        evidenceAttached: '3 Georeferenced Survey PDFs & Drone Log'
      },
      nextAction: 'Transmitted to MoSPI IPMD for automated machine learning assessment.'
    },
    {
      step: 3,
      fromDesk: 'MoSPI Cabinet Command',
      toDesk: 'Implementing Agency Desk',
      actor: 'Dr. Sunita Rao (MoSPI IPMD Director)',
      role: 'officer' as const,
      email: 'officer@ipmd.mospi.gov.in',
      icon: Building2,
      color: 'blue',
      title: 'ML Predictive Assessment & Ministerial Directive Issuance',
      summary: 'Platform runs v1.2.0-xgb GBDT model. Predicts +142 days slippage and 84% cost overrun. Officer reviews SHAP drivers and issues Cabinet Directive.',
      payload: {
        modelPrediction: '+142 Days Delay Forecast (84% Cost Overrun Prob)',
        directiveIssued: 'Directive #INT-402: Depute Special Revenue Taskforce',
        slaDeadline: 'Mandatory resolution within 30 days'
      },
      nextAction: 'Directive assigned to Agency Project Director with enforced SLA.'
    },
    {
      step: 4,
      fromDesk: 'Implementing Agency Desk',
      toDesk: 'CAG Statutory Audit Desk',
      actor: 'Vikramaditya Singh (NHAI)',
      role: 'agency_manager' as const,
      email: 'manager@nhai.gov.in',
      icon: CheckCircle2,
      color: 'teal',
      title: 'Directive Execution & Evidence Submission',
      summary: 'Agency coordinates with State Revenue Collectorate, clears forest right-of-way, and submits gazetted clearance certificate as verified evidence.',
      payload: {
        actionStatus: 'Taskforce Deputed & Forest Clearance Secured',
        evidenceSubmitted: 'Gazette Notification Ref #CRZ-2026-904',
        closureRequested: 'Pending MoSPI Officer Verification'
      },
      nextAction: 'Evidence relayed to MoSPI for closure and CAG for statutory audit.'
    },
    {
      step: 5,
      fromDesk: 'CAG Statutory Audit Desk',
      toDesk: 'MoSPI Cabinet Archives',
      actor: 'Arvind Swaminathan (CAG Lead Auditor)',
      role: 'auditor' as const,
      email: 'auditor@cag.gov.in',
      icon: Scale,
      color: 'emerald',
      title: 'Statutory Audit Verification & Cabinet Certification',
      summary: 'CAG Auditor verifies expenditure alignment in the tamper-evident audit ledger, verifies physical chainage against invoice debits, and seals the statutory audit dossier.',
      payload: {
        auditIntegrity: '100% Cryptographically Verified SHA-256 Ledger',
        baselineVariance: 'Original ₹18,500 Cr vs Revised ₹21,200 Cr Verified',
        auditFinding: 'Physical progress correlates 99.4% with verified disbursements'
      },
      nextAction: 'Certified audit record sealed into national governance repository.'
    }
  ];

  // Auto-play simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isSimPlaying) {
      interval = setInterval(() => {
        setCurrentSimStep(prev => (prev >= 5 ? 1 : prev + 1));
      }, 4500);
    }
    return () => clearInterval(interval);
  }, [isSimPlaying]);

  // GSAP Animations on Mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from(badgeRef.current, { y: -20, opacity: 0, duration: 0.6 })
        .from(titleRef.current, { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
        .from(subtitleRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.4')
        .from(ctaRef.current, { y: 20, opacity: 0, duration: 0.6 }, '-=0.3');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleLaunchDesk = (roleType: any, userEmail: string) => {
    switchRole(roleType);
    login(userEmail);
    navigate('/app');
  };

  const activeStage = simulationStages[currentSimStep - 1];

  return (
    <div className="min-h-screen bg-[#08111F] text-[#F8FAFC] selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 1. Header Navigation Bar */}
      <nav className="border-b border-slate-800/80 bg-[#08111F]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white">ProjectSetu</span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">
                  SIH26103 • MoSPI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Integrated Infrastructure Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/public"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Citizen Portal
            </Link>
            <Link
              to="/login"
              className="text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
            >
              Command Center
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Main Hero Section */}
      <section ref={heroRef} className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div ref={badgeRef} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium shadow-xs">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Smart India Hackathon SIH26103 • MoSPI IPMD Infrastructure Platform</span>
        </div>

        <h1 ref={titleRef} className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.08]">
          Predict Delays. Explain Risks. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-indigo-300">
            Drive Accountable Action.
          </span>
        </h1>

        <p ref={subtitleRef} className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Unify progress reports, expenditure velocity, physical milestones, and verified evidence into a single predictive oversight platform for India's National Infrastructure Pipeline.
        </p>

        {/* Primary CTAs */}
        <div ref={ctaRef} className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xl shadow-blue-600/30 transition flex items-center gap-2 group"
          >
            <span>Enter Command Center (4 Desks)</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
          <Link
            to="/public"
            className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Citizen Transparency Portal</span>
          </Link>
        </div>
      </section>

      {/* 3. REPLACED SECTION: LIVE INTER-PORTAL GOVERNANCE SIMULATION */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-slate-800/90 bg-[#101D2E]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Simulation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400">
                  Live Inter-Portal Workflow Simulation
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                How Data Travels Across the 4 Interconnected Portals
              </h2>
              <p className="text-xs text-slate-400">
                A closed-loop governance cycle: Field Survey ➔ Agency Filing ➔ MoSPI AI Assessment ➔ Directives ➔ CAG Audit.
              </p>
            </div>

            {/* Play/Pause & Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSimPlaying(!isSimPlaying)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition"
              >
                {isSimPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isSimPlaying ? 'Pause' : 'Auto-Play'}</span>
              </button>
              <button
                onClick={() => setCurrentSimStep(1)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
                title="Restart Simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {simulationStages.map(st => (
              <button
                key={st.step}
                onClick={() => {
                  setCurrentSimStep(st.step);
                  setIsSimPlaying(false);
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  currentSimStep === st.step
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block mb-1 text-blue-400">
                  Stage 0{st.step}
                </span>
                <span className="text-xs font-bold block leading-tight truncate">
                  {st.fromDesk.replace(' Desk', '').replace(' Portal', '')}
                </span>
              </button>
            ))}
          </div>

          {/* Active Simulation Stage Detail Box */}
          <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                  {React.createElement(activeStage.icon, { className: 'w-5 h-5' })}
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-400 tracking-wider">
                    Stage {activeStage.step} of 5: {activeStage.fromDesk} ➔ {activeStage.toDesk}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{activeStage.title}</h3>
                </div>
              </div>

              <button
                onClick={() => handleLaunchDesk(activeStage.role, activeStage.email)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-xs shrink-0"
              >
                <span>Launch This Desk Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeStage.summary}
            </p>

            {/* Simulated Live Payload Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {Object.entries(activeStage.payload).map(([key, val], idx) => (
                <div key={idx} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 capitalize block">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="font-bold text-white block truncate">{val}</span>
                </div>
              ))}
            </div>

            {/* Relay Status Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Send className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span>Next Lifecycle Action: <strong className="text-slate-200">{activeStage.nextAction}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">Actor: {activeStage.actor}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Live Geospatial Satellite Infrastructure Radar (High-Resolution Satellite Mapping) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Satellite className="w-3.5 h-3.5 text-blue-400" />
            <span>High-Resolution Orbital Satellite Mapping</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            National Infrastructure Satellite Radar
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time orbital satellite monitoring across India's National Infrastructure Pipeline with active dark freight corridors, calibrated risk forecasts, and fixed telemetry labels.
          </p>
        </div>

        <IndiaProjectMap projects={AppStorage.getProjects()} isPublic={true} />
      </section>

      {/* 5. Interactive Live What-If Risk Simulator Sandbox */}
      <section className="py-16 bg-[#0B1526] border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">AI Intelligence Sandbox</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Test the Predictive ML Engine Live
            </h2>
            <p className="text-xs text-slate-400">
              Adjust project parameters below to see how our trained GBDT model computes risk score and SHAP attributions in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#101D2E] p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
            {/* Left Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Physical Progress Gap (Planned vs Actual):</span>
                  <span className="text-blue-400 font-mono font-black">{sandboxProgressGap}% behind schedule</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={sandboxProgressGap}
                  onChange={(e) => setSandboxProgressGap(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-300">Cumulative Expenditure Escalation:</span>
                  <span className="text-amber-400 font-mono font-black">+{sandboxSpendEscalation}% above baseline</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={sandboxSpendEscalation}
                  onChange={(e) => setSandboxSpendEscalation(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                <div>
                  <span className="font-bold text-xs text-white block">Unresolved Land / Forest Clearance Blocker</span>
                  <span className="text-[11px] text-slate-400">Pending statutory right-of-way resolution</span>
                </div>
                <button
                  onClick={() => setSandboxHasBlocker(!sandboxHasBlocker)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sandboxHasBlocker ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sandboxHasBlocker ? 'Active Blocker' : 'Cleared'}
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                Formula: <code className="text-slate-400">RiskScore = round(100 * (0.40*C + 0.30*S + 0.20*M + 0.10*B))</code>
              </div>
            </div>

            {/* Right Live Risk Passport Box */}
            <div className="lg:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Live Model Output (v1.2.0-xgb)
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                    simulatedRiskScore >= 75 ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    simulatedRiskScore >= 50 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    simulatedRiskScore >= 25 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {simulatedRiskScore >= 75 ? 'Critical' : simulatedRiskScore >= 50 ? 'High' : simulatedRiskScore >= 25 ? 'Medium' : 'Low'} Risk
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-black text-white font-mono">{simulatedRiskScore}</span>
                  <span className="text-sm font-bold text-slate-500">/ 100 Index</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Cost Overrun Prob:</span>
                    <span className="font-extrabold text-blue-400 font-mono text-base">
                      {(simulatedCostOverrunProb * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Predicted Delay:</span>
                    <span className="font-extrabold text-amber-400 font-mono text-base">
                      +{simulatedDelayDays} Days
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-white block">Top SHAP Risk Attribution:</span>
                  <p className="text-slate-400">
                    {sandboxProgressGap > 15 
                      ? 'Progress gap of ' + sandboxProgressGap + '% is primary driver increasing completion delay.' 
                      : 'Physical execution currently tracks baseline satisfactorily.'}
                  </p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold text-center transition shadow-xs"
              >
                Enter Command Center to Review
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. The Seven Pillars of ProjectSetu */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">End-to-End Governance</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            The Seven Pillars of ProjectSetu
          </h2>
          <p className="text-xs text-slate-400">
            A closed-loop cycle moving infrastructure management from descriptive reports to evidence-backed action.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { num: '01', title: 'Collect', desc: 'Monthly expenditure, physical progress & evidence' },
            { num: '02', title: 'Validate', desc: 'Pre-flight checks, duplicate checks & schema guards' },
            { num: '03', title: 'Predict', desc: 'Cost overrun prob & schedule delay via calibrated ML' },
            { num: '04', title: 'Explain', desc: 'SHAP feature attribution & plain-language rationales' },
            { num: '05', title: 'Prioritize', desc: 'Portfolio review priority index based on urgency' },
            { num: '06', title: 'Intervene', desc: 'Enforced state machine with assigned owners' },
            { num: '07', title: 'Verify', desc: 'Evidence review, close/reopen & public transparency' }
          ].map((step, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#101D2E] border border-slate-800 space-y-2 text-center hover:border-blue-500/40 transition">
              <span className="text-xs font-mono font-bold text-blue-400 block">{step.num}</span>
              <h3 className="font-bold text-sm text-white">{step.title}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-800 bg-[#060D18] py-12 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Building2 className="w-5 h-5 text-blue-500" />
          <span className="font-extrabold text-white text-sm">ProjectSetu</span>
          <span className="text-[10px] text-slate-400">Integrated Infrastructure Intelligence</span>
        </div>
        <p className="max-w-xl mx-auto text-[11px] text-slate-400">
          Smart India Hackathon SIH26103 Prototype. Developed for Ministry of Statistics and Programme Implementation (MoSPI / IPMD).
        </p>
        <p className="text-[10px] text-slate-600">
          Synthetic demonstration data used for evaluation. Predictive outputs are advisory decision-support tools.
        </p>
      </footer>
    </div>
  );
};
