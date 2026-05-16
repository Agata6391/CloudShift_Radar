import type {
  ActionPlan,
  BobReasoningTrace,
  FeatureSurvivalItem,
  Finding,
  HumanReviewItem,
  MigrationContext,
  ScanResult
} from "@cloudshift-radar/shared";
import {
  coerceStringArray,
  confidences,
  expectedStates,
  featureStatuses,
  isRecord,
  recommendedDecisions,
  resolutionLevels,
  riskValues,
  severities
} from "./bobResponseSchema";

const PARSE_ERROR = "Bob returned output that could not be parsed as ScanResult JSON.";

function extractFencedJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  return null;
}

function extractFirstJsonObject(text: string): string {
  const fenced = extractFencedJson(text);
  if (fenced) {
    return fenced;
  }

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = inString;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        return text.slice(start, index + 1);
      }
    }
  }

  throw new Error(PARSE_ERROR);
}

function parseBobPayload(rawResponse: unknown): Record<string, unknown> {
  if (typeof rawResponse !== "string") {
    throw new Error(PARSE_ERROR);
  }

  const jsonText = extractFirstJsonObject(rawResponse.trim());
  const parsed = JSON.parse(jsonText) as unknown;

  if (!isRecord(parsed)) {
    throw new Error(PARSE_ERROR);
  }

  return parsed;
}

function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(PARSE_ERROR);
  }

  return value;
}

function optionalString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function requireNumber(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(PARSE_ERROR);
  }

  return Math.max(0, Math.min(100, Math.round(parsed)));
}

function requireArray(record: Record<string, unknown>, key: string): unknown[] {
  const value = record[key];
  if (!Array.isArray(value)) {
    throw new Error(PARSE_ERROR);
  }

  return value;
}

function requireRecord(record: Record<string, unknown>, key: string): Record<string, unknown> {
  const value = record[key];
  if (!isRecord(value)) {
    throw new Error(PARSE_ERROR);
  }

  return value;
}

function requireEnum<T extends string>(record: Record<string, unknown>, key: string, allowed: readonly T[]): T {
  const value = record[key];
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(PARSE_ERROR);
  }

  return value as T;
}

function findFeatureImpact(item: Record<string, unknown>, featureSurvivalMap: FeatureSurvivalItem[]) {
  const searchable = [
    optionalString(item, "title"),
    optionalString(item, "category"),
    optionalString(item, "service"),
    optionalString(item, "provider")
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return featureSurvivalMap.find((feature) => {
    const featureText = `${feature.feature} ${feature.dependency}`.toLowerCase();
    return featureText
      .split(/\s+|\/+/)
      .filter((token) => token.length > 2)
      .some((token) => searchable.includes(token));
  });
}

function featureStatusFromExpectedState(value: string | undefined) {
  if (value === "Likely working") return "Ready";
  if (value === "Partially working") return "Needs changes";
  if (value === "High risk") return "At risk";
  if (value === "Blocked") return "Blocked";
  return "Needs human review";
}

function riskFromSeverity(severity: Finding["severity"]) {
  return severity === "Low" ? "Low" : severity;
}

function normalizeFindings(value: unknown, featureSurvivalMap: FeatureSurvivalItem[]): Finding[] {
  if (!Array.isArray(value)) {
    throw new Error(PARSE_ERROR);
  }

  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(PARSE_ERROR);
    }

    const item = entry;
    const severity = requireEnum(item, "severity", severities);
    const confidence = requireEnum(item, "confidence", confidences);
    const featureImpact = findFeatureImpact(item, featureSurvivalMap);
    const featureSurvivalState =
      typeof item.featureSurvivalState === "string" && (expectedStates as readonly string[]).includes(item.featureSurvivalState)
        ? (item.featureSurvivalState as Finding["featureSurvivalState"])
        : featureImpact?.expectedState;
    const bobRationale = requireString(item, "bobRationale");
    const migrationImpact = requireString(item, "migrationImpact");
    return {
      id: typeof item.id === "string" && item.id.trim() ? item.id : `finding_${String(index + 1).padStart(3, "0")}`,
      title: requireString(item, "title"),
      category: requireString(item, "category"),
      provider: requireString(item, "provider"),
      service: requireString(item, "service"),
      affectedFiles: coerceStringArray(item.affectedFiles),
      detectedFiles: coerceStringArray(item.detectedFiles).length > 0 ? coerceStringArray(item.detectedFiles) : coerceStringArray(item.affectedFiles),
      severity,
      confidence,
      resolutionLevel: requireEnum(item, "resolutionLevel", resolutionLevels),
      risk:
        typeof item.risk === "string" && (riskValues as readonly string[]).includes(item.risk)
          ? (item.risk as Finding["risk"])
          : riskFromSeverity(severity),
      affectedFeature: optionalString(item, "affectedFeature") || featureImpact?.feature || "Unknown feature area",
      featureStatus:
        typeof item.featureStatus === "string" && (featureStatuses as readonly string[]).includes(item.featureStatus)
          ? (item.featureStatus as Finding["featureStatus"])
          : featureStatusFromExpectedState(featureSurvivalState),
      featureSurvivalState,
      shortSummary: optionalString(item, "shortSummary") || migrationImpact,
      technicalIssue: optionalString(item, "technicalIssue") || requireString(item, "title"),
      bobNotes: optionalString(item, "bobNotes") || bobRationale,
      bobRationale,
      businessImpact: requireString(item, "businessImpact"),
      migrationImpact,
      featureImpact: optionalString(item, "featureImpact") || migrationImpact,
      recommendedAction: requireString(item, "recommendedAction"),
      requiresHumanReview:
        typeof item.requiresHumanReview === "boolean"
          ? item.requiresHumanReview
          : (severity === "High" || severity === "Critical") && confidence === "Low",
      humanReviewReason: optionalString(item, "humanReviewReason"),
      suggestedReviewer: optionalString(item, "suggestedReviewer")
    };
  });
}

function normalizeFeatureSurvival(value: unknown): FeatureSurvivalItem[] {
  if (!Array.isArray(value)) {
    throw new Error(PARSE_ERROR);
  }

  return value.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error(PARSE_ERROR);
    }

    return {
      feature: requireString(entry, "feature"),
      dependency: requireString(entry, "dependency"),
      expectedState: requireEnum(entry, "expectedState", expectedStates),
      bobRationale: requireString(entry, "bobRationale"),
      recommendedAction: requireString(entry, "recommendedAction")
    };
  });
}

function normalizeHumanReview(value: unknown): HumanReviewItem[] {
  if (!Array.isArray(value)) {
    throw new Error(PARSE_ERROR);
  }

  return value.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new Error(PARSE_ERROR);
    }

    return {
      findingId: typeof entry.findingId === "string" && entry.findingId.trim() ? entry.findingId : `review_${index + 1}`,
      title: requireString(entry, "title"),
      reason: requireString(entry, "reason"),
      severity: requireEnum(entry, "severity", severities),
      confidence: requireEnum(entry, "confidence", confidences),
      affectedFeature: optionalString(entry, "affectedFeature"),
      suggestedReviewer: requireString(entry, "suggestedReviewer"),
      nextAction: requireString(entry, "nextAction"),
      recommendedValidation: optionalString(entry, "recommendedValidation") || requireString(entry, "nextAction")
    };
  });
}

function normalizeActionPlan(value: unknown): ActionPlan {
  if (!isRecord(value)) {
    throw new Error(PARSE_ERROR);
  }

  const item: Record<string, unknown> = value;

  return {
    fixBeforeMigration: coerceStringArray(item.fixBeforeMigration),
    validateBeforeMigration: coerceStringArray(item.validateBeforeMigration),
    reviewWithSeniorEngineer: coerceStringArray(item.reviewWithSeniorEngineer),
    documentBeforeMigration: coerceStringArray(item.documentBeforeMigration),
    postMigrationChecks: coerceStringArray(item.postMigrationChecks)
  };
}

function normalizeTrace(value: unknown): BobReasoningTrace {
  if (!isRecord(value)) {
    throw new Error(PARSE_ERROR);
  }

  const item: Record<string, unknown> = value;
  return {
    architectureSummary: requireString(item, "architectureSummary"),
    cloudDependencyReasoning: coerceStringArray(item.cloudDependencyReasoning),
    riskClassificationRationale: coerceStringArray(item.riskClassificationRationale),
    confidenceRationale: coerceStringArray(item.confidenceRationale),
    humanReviewRationale: coerceStringArray(item.humanReviewRationale),
    recommendedModernizationNotes: coerceStringArray(item.recommendedModernizationNotes),
    traceTimeline: coerceStringArray(item.traceTimeline)
  };
}

export function normalizeBobResponse(
  rawResponse: unknown,
  context: MigrationContext,
  scanId: string
): ScanResult {
  let payload: Record<string, unknown>;

  try {
    payload = parseBobPayload(rawResponse);
  } catch (error) {
    throw new Error(PARSE_ERROR);
  }

  const featureSurvivalMap = normalizeFeatureSurvival(requireArray(payload, "featureSurvivalMap"));

  return {
    scanId,
    projectName: context.projectName,
    currentProvider: context.currentProvider,
    targetProvider: context.targetProvider,
    applicationType: context.applicationType,
    bobVerdict: requireString(payload, "bobVerdict"),
    bobSummary: requireString(payload, "bobSummary"),
    bobConfidence: requireString(payload, "bobConfidence"),
    readinessScore: requireNumber(payload, "readinessScore"),
    recommendedDecision: requireEnum(payload, "recommendedDecision", recommendedDecisions),
    businessRiskLevel: requireString(payload, "businessRiskLevel"),
    technicalComplexity: requireString(payload, "technicalComplexity"),
    findings: normalizeFindings(requireArray(payload, "findings"), featureSurvivalMap),
    featureSurvivalMap,
    humanReviewQueue: normalizeHumanReview(requireArray(payload, "humanReviewQueue")),
    actionPlan: normalizeActionPlan(requireRecord(payload, "actionPlan")),
    bobReasoningTrace: normalizeTrace(requireRecord(payload, "bobReasoningTrace")),
    createdAt: new Date().toISOString()
  };
}
