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

function extractLastFencedJson(text: string): string | null {
  const matches = [...text.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)];
  const lastMatch = matches[matches.length - 1];

  if (lastMatch?.[1]?.trim()) {
    return lastMatch[1].trim();
  }

  return null;
}

function extractJsonObject(text: string): string {
  const normalized = text.replace(/\r/g, "").trim();

  const lastOutputMarker = normalized.lastIndexOf("---output---");
  const searchText =
    lastOutputMarker >= 0
      ? normalized.slice(lastOutputMarker + "---output---".length).trim()
      : normalized;

  const fenced = extractLastFencedJson(searchText);
  if (fenced) {
    return fenced;
  }

  let start = -1;
  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastCompleteObject = "";

  for (let index = 0; index < searchText.length; index += 1) {
    const char = searchText[index];

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
      continue;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0 && start >= 0) {
        lastCompleteObject = searchText.slice(start, index + 1);
        start = -1;
      }
    }
  }

  if (lastCompleteObject) {
    return lastCompleteObject.trim();
  }

  throw new Error(PARSE_ERROR);
}

function parseBobPayload(rawResponse: unknown): Record<string, unknown> {
  if (typeof rawResponse !== "string") {
    throw new Error(PARSE_ERROR);
  }

  const jsonText = extractJsonObject(rawResponse.trim());
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

function requireEnum<T extends string>(
  record: Record<string, unknown>,
  key: string,
  allowed: readonly T[]
): T {
  const value = record[key];

  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(PARSE_ERROR);
  }

  return value as T;
}

function normalizeExpectedState(value: unknown): FeatureSurvivalItem["expectedState"] {
  if (typeof value !== "string") {
    return "Partially working";
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "blocked" ||
    normalized.includes("blocked") ||
    normalized.includes("not survive") ||
    normalized.includes("will not survive")
  ) {
    return "Blocked";
  }

  if (
    normalized === "high risk" ||
    normalized === "at risk" ||
    normalized.includes("high risk") ||
    normalized.includes("at risk") ||
    normalized.includes("architecture replacement") ||
    normalized.includes("requires refactoring") ||
    normalized.includes("requires architecture")
  ) {
    return "High risk";
  }

  if (
    normalized === "partially working" ||
    normalized === "needs changes" ||
    normalized === "needs change" ||
    normalized.includes("medium risk") ||
    normalized.includes("configuration change") ||
    normalized.includes("needs changes") ||
    normalized.includes("needs change")
  ) {
    return "Partially working";
  }

  if (
    normalized === "likely working" ||
    normalized === "ready" ||
    normalized.includes("survives") ||
    normalized.includes("cloud-agnostic") ||
    normalized.includes("no cloud-specific")
  ) {
    return "Likely working";
  }

  if ((expectedStates as readonly string[]).includes(value)) {
    return value as FeatureSurvivalItem["expectedState"];
  }

  return "Partially working";
}

function featureStatusFromExpectedState(
  value: FeatureSurvivalItem["expectedState"] | undefined
): Finding["featureStatus"] {
  if (value === "Likely working") return "Ready";
  if (value === "Partially working") return "Needs changes";
  if (value === "High risk") return "At risk";
  if (value === "Blocked") return "Blocked";

  return "Needs human review";
}

function normalizeFeatureStatus(
  value: unknown,
  fallbackExpectedState?: FeatureSurvivalItem["expectedState"]
): Finding["featureStatus"] {
  if (typeof value === "string" && (featureStatuses as readonly string[]).includes(value)) {
    return value as Finding["featureStatus"];
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "ready") return "Ready";
    if (normalized === "blocked") return "Blocked";
    if (normalized === "at risk") return "At risk";
    if (normalized === "needs changes" || normalized === "needs change") return "Needs changes";
    if (normalized === "needs human review") return "Needs human review";
  }

  return featureStatusFromExpectedState(fallbackExpectedState);
}

function findFeatureImpact(
  item: Record<string, unknown>,
  featureSurvivalMap: FeatureSurvivalItem[]
): FeatureSurvivalItem | undefined {
  const searchable = [
    optionalString(item, "title"),
    optionalString(item, "category"),
    optionalString(item, "service"),
    optionalString(item, "provider"),
    optionalString(item, "affectedFeature")
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

function normalizeTechnicalComplexity(value: unknown): Finding["technicalComplexity"] {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "low" || normalized.includes("low") || normalized.includes("simple")) {
    return "low";
  }

  if (
    normalized === "high" ||
    normalized.includes("high") ||
    normalized.includes("very high") ||
    normalized.includes("complex") ||
    normalized.includes("architecture")
  ) {
    return "high";
  }

  if (normalized === "medium" || normalized.includes("medium") || normalized.includes("moderate")) {
    return "medium";
  }

  // Unknown or invalid values return undefined
  return undefined;
}

function riskFromSeverity(severity: Finding["severity"]): Finding["risk"] {
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

    const featureSurvivalState = item.featureSurvivalState
      ? normalizeExpectedState(item.featureSurvivalState)
      : normalizeExpectedState(featureImpact?.expectedState);

    const bobRationale = requireString(item, "bobRationale");
    const migrationImpact = requireString(item, "migrationImpact");

    return {
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id
          : `finding_${String(index + 1).padStart(3, "0")}`,
      title: requireString(item, "title"),
      category: requireString(item, "category"),
      provider: requireString(item, "provider"),
      service: requireString(item, "service"),
      affectedFiles: coerceStringArray(item.affectedFiles),
      detectedFiles:
        coerceStringArray(item.detectedFiles).length > 0
          ? coerceStringArray(item.detectedFiles)
          : coerceStringArray(item.affectedFiles),
      severity,
      confidence,
      resolutionLevel: requireEnum(item, "resolutionLevel", resolutionLevels),
      risk:
        typeof item.risk === "string" && (riskValues as readonly string[]).includes(item.risk)
          ? (item.risk as Finding["risk"])
          : riskFromSeverity(severity),
      affectedFeature:
        optionalString(item, "affectedFeature") || featureImpact?.feature || "Unknown feature area",
      featureStatus: normalizeFeatureStatus(item.featureStatus, featureSurvivalState),
      featureSurvivalState,
      shortSummary: optionalString(item, "shortSummary") || migrationImpact,
      technicalIssue: optionalString(item, "technicalIssue") || requireString(item, "title"),
      bobNotes: optionalString(item, "bobNotes") || bobRationale,
      bobRationale,
      businessImpact: requireString(item, "businessImpact"),
      migrationImpact,
      featureImpact: optionalString(item, "featureImpact") || migrationImpact,
      technicalComplexity: normalizeTechnicalComplexity(item.technicalComplexity),
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
      expectedState: normalizeExpectedState(entry.expectedState),
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
      findingId:
        typeof entry.findingId === "string" && entry.findingId.trim()
          ? entry.findingId
          : `review_${index + 1}`,
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

  return {
    fixBeforeMigration: coerceStringArray(value.fixBeforeMigration),
    validateBeforeMigration: coerceStringArray(value.validateBeforeMigration),
    reviewWithSeniorEngineer: coerceStringArray(value.reviewWithSeniorEngineer),
    documentBeforeMigration: coerceStringArray(value.documentBeforeMigration),
    postMigrationChecks: coerceStringArray(value.postMigrationChecks)
  };
}

function normalizeTrace(value: unknown): BobReasoningTrace {
  if (!isRecord(value)) {
    throw new Error(PARSE_ERROR);
  }

  return {
    architectureSummary: requireString(value, "architectureSummary"),
    cloudDependencyReasoning: coerceStringArray(value.cloudDependencyReasoning),
    riskClassificationRationale: coerceStringArray(value.riskClassificationRationale),
    confidenceRationale: coerceStringArray(value.confidenceRationale),
    humanReviewRationale: coerceStringArray(value.humanReviewRationale),
    recommendedModernizationNotes: coerceStringArray(value.recommendedModernizationNotes),
    traceTimeline: coerceStringArray(value.traceTimeline)
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
    throw new Error(
      [
        PARSE_ERROR,
        error instanceof Error ? error.message : String(error),
        typeof rawResponse === "string" ? rawResponse.slice(0, 3000) : ""
      ]
        .filter(Boolean)
        .join("\n")
    );
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