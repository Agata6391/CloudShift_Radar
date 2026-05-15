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
  coerceEnum,
  coerceNumber,
  coerceString,
  coerceStringArray,
  confidences,
  expectedStates,
  isRecord,
  recommendedDecisions,
  resolutionLevels,
  severities
} from "./bobResponseSchema";

function extractTextFromKnownShapes(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (!isRecord(value)) {
    return null;
  }

  const directCandidates = [value.output, value.text, value.content, value.message, value.response, value.result];
  for (const candidate of directCandidates) {
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  if (Array.isArray(value.choices)) {
    for (const choice of value.choices) {
      if (isRecord(choice)) {
        const message = choice.message;
        if (isRecord(message) && typeof message.content === "string") {
          return message.content;
        }
        if (typeof choice.text === "string") {
          return choice.text;
        }
      }
    }
  }

  if (Array.isArray(value.output)) {
    const text = value.output
      .map((item) => {
        if (typeof item === "string") return item;
        if (isRecord(item) && typeof item.content === "string") return item.content;
        if (isRecord(item) && Array.isArray(item.content)) {
          return item.content
            .map((contentItem) =>
              isRecord(contentItem) && typeof contentItem.text === "string" ? contentItem.text : ""
            )
            .join("\n");
        }
        return "";
      })
      .join("\n")
      .trim();

    return text || null;
  }

  return null;
}

function extractJsonText(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return text.trim();
}

function parseBobPayload(rawResponse: unknown): Record<string, unknown> {
  if (isRecord(rawResponse) && "bobVerdict" in rawResponse) {
    return rawResponse;
  }

  const extractedText = extractTextFromKnownShapes(rawResponse);
  if (!extractedText) {
    throw new Error("Bob response did not include JSON content.");
  }

  const jsonText = extractJsonText(extractedText);
  const parsed = JSON.parse(jsonText) as unknown;

  if (!isRecord(parsed)) {
    throw new Error("Bob response JSON must be an object.");
  }

  return parsed;
}

function normalizeFindings(value: unknown): Finding[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item, index) => {
    const severity = coerceEnum(item.severity, severities, "Medium");
    const confidence = coerceEnum(item.confidence, confidences, "Medium");
    return {
      id: coerceString(item.id, `finding_${String(index + 1).padStart(3, "0")}`),
      title: coerceString(item.title, "Migration risk identified by Bob"),
      category: coerceString(item.category, "Architecture"),
      provider: coerceString(item.provider, "Unknown"),
      service: coerceString(item.service, "Unknown"),
      affectedFiles: coerceStringArray(item.affectedFiles),
      severity,
      confidence,
      resolutionLevel: coerceEnum(item.resolutionLevel, resolutionLevels, "L5"),
      bobRationale: coerceString(item.bobRationale, "Bob identified this as a migration readiness risk."),
      businessImpact: coerceString(item.businessImpact, "Potential business impact requires validation."),
      migrationImpact: coerceString(item.migrationImpact, "Potential migration impact requires validation."),
      recommendedAction: coerceString(item.recommendedAction, "Review and remediate before migration."),
      requiresHumanReview:
        typeof item.requiresHumanReview === "boolean"
          ? item.requiresHumanReview
          : (severity === "High" || severity === "Critical") && confidence === "Low"
    };
  });
}

function normalizeFeatureSurvival(value: unknown): FeatureSurvivalItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item) => ({
    feature: coerceString(item.feature, "Unspecified feature"),
    dependency: coerceString(item.dependency, "Unknown dependency"),
    expectedState: coerceEnum(item.expectedState, expectedStates, "Unknown"),
    bobRationale: coerceString(item.bobRationale, "Bob could not fully determine feature survival."),
    recommendedAction: coerceString(item.recommendedAction, "Validate this feature during migration rehearsal.")
  }));
}

function normalizeHumanReview(value: unknown): HumanReviewItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((item, index) => ({
    findingId: coerceString(item.findingId, `review_${index + 1}`),
    title: coerceString(item.title, "Bob escalation for human review"),
    reason: coerceString(
      item.reason,
      "Bob escalated this item because severity and uncertainty make automated classification unsafe."
    ),
    severity: coerceEnum(item.severity, severities, "High"),
    confidence: coerceEnum(item.confidence, confidences, "Low"),
    suggestedReviewer: coerceString(item.suggestedReviewer, "Senior Engineer"),
    nextAction: coerceString(item.nextAction, "Assign owner and review before migration planning.")
  }));
}

function normalizeActionPlan(value: unknown): ActionPlan {
  const item: Record<string, unknown> = isRecord(value) ? value : {};
  return {
    fixBeforeMigration: coerceStringArray(item.fixBeforeMigration),
    validateBeforeMigration: coerceStringArray(item.validateBeforeMigration),
    reviewWithSeniorEngineer: coerceStringArray(item.reviewWithSeniorEngineer),
    documentBeforeMigration: coerceStringArray(item.documentBeforeMigration),
    postMigrationChecks: coerceStringArray(item.postMigrationChecks)
  };
}

function normalizeTrace(value: unknown): BobReasoningTrace {
  const item: Record<string, unknown> = isRecord(value) ? value : {};
  return {
    architectureSummary: coerceString(
      item.architectureSummary,
      "Bob reviewed repository structure, configuration, and detected service dependencies."
    ),
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
    const detail = error instanceof Error ? error.message : "Unknown parse error";
    throw new Error(`Bob response could not be normalized into a ScanResult: ${detail}`);
  }

  return {
    scanId,
    projectName: context.projectName,
    currentProvider: context.currentProvider,
    targetProvider: context.targetProvider,
    applicationType: context.applicationType,
    bobVerdict: coerceString(payload.bobVerdict, "Requires Human Review"),
    bobSummary: coerceString(
      payload.bobSummary,
      "Bob completed the repository analysis but returned a limited summary."
    ),
    bobConfidence: coerceString(payload.bobConfidence, "Medium"),
    readinessScore: coerceNumber(payload.readinessScore, 50),
    recommendedDecision: coerceEnum(payload.recommendedDecision, recommendedDecisions, "Requires Human Review"),
    businessRiskLevel: coerceString(payload.businessRiskLevel, "Unknown"),
    technicalComplexity: coerceString(payload.technicalComplexity, "Unknown"),
    findings: normalizeFindings(payload.findings),
    featureSurvivalMap: normalizeFeatureSurvival(payload.featureSurvivalMap),
    humanReviewQueue: normalizeHumanReview(payload.humanReviewQueue),
    actionPlan: normalizeActionPlan(payload.actionPlan),
    bobReasoningTrace: normalizeTrace(payload.bobReasoningTrace),
    createdAt: new Date().toISOString()
  };
}
