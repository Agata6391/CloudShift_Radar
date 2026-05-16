export type Severity = "Critical" | "High" | "Medium" | "Low";

export type Confidence = "High" | "Medium" | "Low";

export type ResolutionLevel = "L1" | "L2" | "L3" | "L4" | "L5";

export type RecommendedDecision =
  | "Proceed"
  | "Proceed with caution"
  | "Prepare First"
  | "Block Migration"
  | "Requires Human Review";

export type ExpectedMigrationState =
  | "Likely working"
  | "Partially working"
  | "High risk"
  | "Blocked"
  | "Unknown";

export interface Finding {
  id: string;
  title: string;
  category: string;
  provider: string;
  service: string;
  affectedFiles: string[];
  severity: Severity;
  confidence: Confidence;
  resolutionLevel: ResolutionLevel;
  affectedFeature: string;
  featureSurvivalState: ExpectedMigrationState;
  bobRationale: string;
  businessImpact: string;
  migrationImpact: string;
  recommendedAction: string;
  requiresHumanReview: boolean;
  humanReviewReason?: string;
  suggestedReviewer?: string;
}

export interface FeatureSurvivalItem {
  feature: string;
  dependency: string;
  expectedState: ExpectedMigrationState;
  bobRationale: string;
  recommendedAction: string;
}

export interface HumanReviewItem {
  findingId: string;
  title: string;
  reason: string;
  severity: Severity;
  confidence: Confidence;
  suggestedReviewer: string;
  nextAction: string;
}

export interface ActionPlan {
  fixBeforeMigration: string[];
  validateBeforeMigration: string[];
  reviewWithSeniorEngineer: string[];
  documentBeforeMigration: string[];
  postMigrationChecks: string[];
}

export interface BobReasoningTrace {
  architectureSummary: string;
  cloudDependencyReasoning: string[];
  riskClassificationRationale: string[];
  confidenceRationale: string[];
  humanReviewRationale: string[];
  recommendedModernizationNotes: string[];
  traceTimeline: string[];
}

export interface ScanResult {
  scanId: string;
  projectName: string;
  currentProvider: string;
  targetProvider: string;
  applicationType: string;
  bobVerdict: RecommendedDecision | string;
  bobSummary: string;
  bobConfidence: string;
  readinessScore: number;
  recommendedDecision: RecommendedDecision;
  businessRiskLevel: string;
  technicalComplexity: string;
  findings: Finding[];
  featureSurvivalMap: FeatureSurvivalItem[];
  humanReviewQueue: HumanReviewItem[];
  actionPlan: ActionPlan;
  bobReasoningTrace: BobReasoningTrace;
  createdAt: string;
}

export interface MigrationContext {
  projectName: string;
  currentProvider: string;
  targetProvider: string;
  applicationType: string;
}

export interface TechnicalSignal {
  id: string;
  label: string;
  category: string;
  provider: string;
  service: string;
  files: string[];
  evidence: string[];
}

export interface EnvironmentGap {
  variable: string;
  usedIn: string[];
  documented: boolean;
  description: string;
}

export interface HardcodedInfrastructure {
  type: "url" | "ip" | "region" | "bucket" | "unknown";
  value: string;
  files: string[];
  confidence: Confidence;
}

export interface PreliminaryFinding {
  title: string;
  category: string;
  provider: string;
  service: string;
  affectedFiles: string[];
  scannerEvidence: string[];
}

export interface RepositoryScanContext {
  fileTree: string[];
  technicalSignals: TechnicalSignal[];
  environmentGaps: EnvironmentGap[];
  hardcodedInfrastructure: HardcodedInfrastructure[];
  preliminaryFindings: PreliminaryFinding[];
}
