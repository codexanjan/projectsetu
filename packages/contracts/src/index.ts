import { z } from 'zod';

// ==========================================
// ROLES & PERSONAS
// ==========================================
export type UserRole = 
  | 'admin'              // Platform Administrator
  | 'officer'            // MoSPI/IPMD Officer
  | 'agency_manager'     // Implementing Agency Manager
  | 'field_contributor'  // Field Contributor
  | 'auditor'            // Auditor
  | 'citizen';           // Citizen / Public Visitor

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  department?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
}

// ==========================================
// SECTOR & GEOGRAPHY
// ==========================================
export type ProjectSector =
  | 'Roads & Highways'
  | 'Railways'
  | 'Power & Renewable Energy'
  | 'Water & Sanitation'
  | 'Urban Infrastructure'
  | 'Health & Education'
  | 'Ports & Shipping'
  | 'Telecom';

export type RiskTier = 'low' | 'medium' | 'high' | 'critical';

// ==========================================
// BASELINE CONTRACTS
// ==========================================
export interface Baseline {
  id: string;
  projectId: string;
  originalOrRevised: 'original' | 'revised';
  approvedCostPaise: number; // Stored in integer paise (1 crore = 10,000,000 INR = 1,000,000,000 paise)
  plannedStartDate: string; // ISO date YYYY-MM-DD
  plannedEndDate: string;   // ISO date YYYY-MM-DD
  plannedDurationDays: number;
  reason?: string;
  approvalReference?: string;
  approvedBy?: string;
  approvedAt?: string;
  version: number;
}

// ==========================================
// MILESTONE CONTRACTS
// ==========================================
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  ownerName: string;
  weightPct: number; // Sum of weightPct for a project must equal 100%
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: MilestoneStatus;
  dependencyIds: string[]; // IDs of predecessor milestones
  evidenceRequired: boolean;
  evidenceIds: string[];
}

// ==========================================
// OBSERVATION CONTRACTS
// ==========================================
export type ObservationApprovalStatus = 'draft' | 'submitted' | 'approved' | 'returned';

export interface BlockerDetail {
  category: 'land_acquisition' | 'environmental_clearance' | 'utility_shifting' | 'fund_delay' | 'contractor_dispute' | 'weather_calamity' | 'design_revision';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  loggedDate: string;
  mitigationPlanned: string;
}

export interface Observation {
  id: string;
  projectId: string;
  reportingPeriod: string; // Format: YYYY-MM
  cumulativeExpenditurePaise: number; // Integer paise
  physicalProgressPct: number; // Float [0, 100]
  monthlyExpenditurePaise: number;
  progressIncrementPct: number;
  milestoneUpdates: Record<string, { status: MilestoneStatus; progressPct: number }>;
  blockerCategories: string[];
  blockerDetails: BlockerDetail[];
  evidenceIds: string[];
  source: 'web_form' | 'csv_import' | 'field_mobile';
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  approvalStatus: ObservationApprovalStatus;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  revisionOf?: string;
  dataQualityFlags: string[]; // e.g., 'expenditure_progression_discrepancy', 'stale_reporting'
}

// ==========================================
// EVIDENCE CONTRACTS
// ==========================================
export interface EvidenceItem {
  id: string;
  projectId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  category: 'site_photo' | 'inspection_report' | 'invoice_voucher' | 'geo_survey' | 'clearance_certificate';
  description: string;
  verificationStatus: 'unverified' | 'verified' | 'discrepant';
  reviewerNotes?: string;
  geoCoordinates?: { lat: number; lng: number };
}

// ==========================================
// RISK ASSESSMENT & EXPLAINABILITY (RISK PASSPORT)
// ==========================================
export interface FeatureDriver {
  featureKey: string;
  featureLabel: string;
  featureValue: string | number;
  impactScore: number; // SHAP value (positive increases risk, negative decreases)
  direction: 'increases_risk' | 'decreases_risk' | 'neutral';
  plainLanguageSummary: string;
  evidenceReference?: string;
}

export interface RiskComponents {
  calibratedCostOverrunProb: number; // C in [0, 1]
  scheduleDelayIndex: number;        // S in [0, 1]
  milestoneSlippageFraction: number; // M in [0, 1]
  blockerSeverityIndex: number;      // B in [0, 1]
}

export interface Assessment {
  id: string;
  projectId: string;
  asOfDate: string; // ISO date
  reportingPeriod: string;
  inputSnapshotHash: string; // SHA-256 fingerprint of input observations & baselines
  observationIds: string[];
  baselineId: string;
  modelVersion: string; // e.g., 'v1.2.0-xgb'
  featureSchemaVersion: string;
  policyVersion: string; // e.g., 'v1.0.0-mospi'
  assessmentMode: 'ml_calibrated' | 'deterministic_rule_fallback';
  costOverrunProbability: number; // [0, 1]
  predictedDelayDays: number;     // Days beyond approved end date
  predictionInterval: { lowerDays: number; upperDays: number; confidenceLevel: number };
  predictedCostEscalationPaise: number;
  riskScore: number; // Composite [0, 100]
  riskTier: RiskTier;
  riskComponents: RiskComponents;
  topDrivers: FeatureDriver[];
  dataQualityStatus: 'reliable' | 'caution' | 'insufficient_data';
  dataQualityNotes: string[];
  outOfDistributionWarnings: string[];
  createdAt: string;
}

// ==========================================
// INTERVENTION CONTRACTS (STATE MACHINE)
// ==========================================
export type InterventionStatus =
  | 'proposed'
  | 'approved'
  | 'assigned'
  | 'in_progress'
  | 'evidence_submitted'
  | 'verified'
  | 'closed'
  | 'rejected'
  | 'returned'
  | 'reopened';

export interface InterventionHistoryItem {
  id: string;
  fromStatus: InterventionStatus | 'none';
  toStatus: InterventionStatus;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  reason: string;
  attachedEvidenceIds?: string[];
}

export interface Intervention {
  id: string;
  projectId: string;
  assessmentId: string;
  title: string;
  description: string;
  category: 
    | 'inter_ministerial_coordination'
    | 'land_acquisition_escalation'
    | 'contractor_performance_cure'
    | 'fund_release_acceleration'
    | 'design_modification_approval'
    | 'statutory_clearance_fast_track';
  priority: 'routine' | 'high' | 'critical';
  ownerUid: string;
  ownerName: string;
  ownerOrganization: string;
  status: InterventionStatus;
  dueDate: string; // YYYY-MM-DD
  expectedIndicatorChanges: string;
  approvalDecision?: 'approved' | 'rejected';
  approvedBy?: string;
  approvedByName?: string;
  completionEvidenceIds: string[];
  verificationDecision?: 'verified' | 'returned';
  verifiedBy?: string;
  verifiedByName?: string;
  verificationNotes?: string;
  history: InterventionHistoryItem[];
  createdAt: string;
  updatedAt: string;
  version: number;
}

// ==========================================
// PROJECT REGISTRY CONTRACT
// ==========================================
export type ProjectStatus = 'approved' | 'in_progress' | 'delayed' | 'substantially_completed' | 'on_hold';

export interface Project {
  id: string;
  code: string; // e.g. "NH-2026-081"
  name: string;
  description: string;
  sector: ProjectSector;
  organizationId: string;
  organizationName: string;
  implementingAgencyId: string;
  implementingAgencyName: string;
  state: string;
  district: string;
  publicLocation: string;
  coordinates: { lat: number; lng: number };
  originalCostPaise: number;
  currentApprovedCostPaise: number;
  originalStartDate: string;
  originalEndDate: string;
  currentPlannedEndDate: string;
  currentBaselineId: string;
  currentObservationId?: string;
  status: ProjectStatus;
  visibility: 'internal' | 'published';
  lastAssessment?: Assessment;
  freshnessDays: number;
  evidenceCompletenessPct: number;
  priorityIndex: number; // 0-100 portfolio review priority
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// PUBLIC TRANSPARENCY PROJECTION
// ==========================================
export interface PublicProject {
  id: string;
  code: string;
  name: string;
  sector: ProjectSector;
  state: string;
  district: string;
  publicLocation: string;
  coordinates: { lat: number; lng: number };
  implementingAgency: string;
  originalCostPaise: number;
  approvedRevisedCostPaise: number;
  originalCompletionDate: string;
  revisedCompletionDate: string;
  approvedPhysicalProgressPct: number;
  cumulativeExpenditurePaise: number;
  publicStatusExplanation: string;
  lastApprovedReportingPeriod: string;
  publishedMilestoneCount: number;
  completedMilestoneCount: number;
  publicMilestones: Array<{
    title: string;
    plannedDate: string;
    status: MilestoneStatus;
  }>;
  activeInterventionsCount: number;
  publishedAt: string;
  approvedByOfficerName: string;
  disclaimer: string;
}

// ==========================================
// AUDIT EVENT
// ==========================================
export interface AuditEvent {
  id: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action: string; // e.g., 'PROJECT_CREATE', 'OBSERVATION_APPROVE', 'INTERVENTION_VERIFY', 'PUBLIC_PUBLISH'
  resourceType: 'project' | 'observation' | 'baseline' | 'intervention' | 'publicProject' | 'user' | 'importJob';
  resourceId: string;
  projectId?: string;
  projectName?: string;
  timestamp: string;
  requestId: string;
  changeSummary: string;
  metadata?: Record<string, unknown>;
}

// ==========================================
// ALERT
// ==========================================
export interface AlertItem {
  id: string;
  recipientUid: string;
  projectId: string;
  projectName: string;
  type: 'critical_risk' | 'overdue_milestone' | 'overdue_intervention' | 'missing_observation' | 'evidence_discrepancy' | 'review_assigned';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
  actionUrl: string;
}

// ==========================================
// CSV IMPORT JOB
// ==========================================
export interface ImportRowError {
  rowNumber: number;
  column: string;
  value: string;
  message: string;
}

export interface ImportJob {
  id: string;
  projectId: string;
  fileName: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'previewing' | 'validating' | 'committed' | 'failed';
  errors: ImportRowError[];
  parsedDataPreview: Record<string, string | number>[];
  createdBy: string;
  createdAt: string;
  committedAt?: string;
}

// ==========================================
// HELPER FUNCTIONS FOR MONEY & DATES
// ==========================================

/**
 * 1 Rupee = 100 Paise
 * 1 Lakh = 100,000 INR = 10,000,000 Paise
 * 1 Crore = 10,000,000 INR = 1,000,000,000 Paise (10^9 Paise)
 */
export const PAISE_PER_RUPEE = 100;
export const PAISE_PER_LAKH = 10_000_000;
export const PAISE_PER_CRORE = 1_000_000_000;

export function paiseToCrores(paise: number): number {
  return Number((paise / PAISE_PER_CRORE).toFixed(2));
}

export function croresToPaise(crores: number): number {
  return Math.round(crores * PAISE_PER_CRORE);
}

export function formatIndianCurrency(paise: number, unitPreference: 'crores' | 'lakhs' | 'auto' = 'auto'): string {
  if (isNaN(paise) || paise == null) return '₹ 0.00 Cr';
  
  if (unitPreference === 'crores' || (unitPreference === 'auto' && Math.abs(paise) >= PAISE_PER_CRORE)) {
    const cr = paise / PAISE_PER_CRORE;
    return `₹ ${cr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  }
  
  if (unitPreference === 'lakhs' || (unitPreference === 'auto' && Math.abs(paise) >= PAISE_PER_LAKH)) {
    const lk = paise / PAISE_PER_LAKH;
    return `₹ ${lk.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  }

  const inr = paise / PAISE_PER_RUPEE;
  return `₹ ${inr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function calculateRiskPolicyScore(
  costOverrunProb: number,     // C in [0, 1]
  predictedDelayDays: number,  // Positive delay days
  plannedDurationDays: number, // Total planned days
  milestoneSlippageFrac: number, // M in [0, 1]
  blockerSeverityIndex: number   // B in [0, 1]
): { riskScore: number; riskTier: RiskTier; components: RiskComponents } {
  // S = clamp(predictedPositiveDelayDays / max(90, 0.25 * originalPlannedDurationDays), 0, 1)
  const normDenominator = Math.max(90, 0.25 * Math.max(plannedDurationDays, 1));
  const s = Math.min(Math.max(predictedDelayDays / normDenominator, 0), 1);
  const c = Math.min(Math.max(costOverrunProb, 0), 1);
  const m = Math.min(Math.max(milestoneSlippageFrac, 0), 1);
  const b = Math.min(Math.max(blockerSeverityIndex, 0), 1);

  // Policy: 40% Cost, 30% Schedule, 20% Milestones, 10% Blockers
  const composite = 100 * (0.40 * c + 0.30 * s + 0.20 * m + 0.10 * b);
  const score = Math.round(composite);

  let tier: RiskTier = 'low';
  if (score >= 75) tier = 'critical';
  else if (score >= 50) tier = 'high';
  else if (score >= 25) tier = 'medium';

  return {
    riskScore: score,
    riskTier: tier,
    components: {
      calibratedCostOverrunProb: Number(c.toFixed(3)),
      scheduleDelayIndex: Number(s.toFixed(3)),
      milestoneSlippageFraction: Number(m.toFixed(3)),
      blockerSeverityIndex: Number(b.toFixed(3))
    }
  };
}
