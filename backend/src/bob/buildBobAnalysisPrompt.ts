import type { MigrationContext, RepositoryScanContext } from "@cloudshift-radar/shared";

const SECRET_VALUE_PATTERN =
  /([a-z0-9_-]*(?:api[_-]?key|secret|token|password|passwd|private[_-]?key|access[_-]?key|session[_-]?key|credential)[a-z0-9_-]*)(["'\s:=]+)([^"'\s,}]+)/gi;

const SECRET_KEY_PATTERN =
  /(api[_-]?key|secret|token|password|passwd|private[_-]?key|access[_-]?key|session[_-]?key|credential)/i;

function redactSensitiveText(text: string): string {
  return text.replace(SECRET_VALUE_PATTERN, (_match, key: string, separator: string) => `${key}${separator}[REDACTED]`);
}

function sanitizeForPrompt(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForPrompt(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? "[REDACTED]" : sanitizeForPrompt(item)
      ])
    );
  }

  if (typeof value === "string") {
    return redactSensitiveText(value);
  }

  return value;
}

function stringifyForPrompt(value: unknown): string {
  return redactSensitiveText(JSON.stringify(sanitizeForPrompt(value), null, 2));
}

export function buildBobAnalysisPrompt(context: MigrationContext, scanContext: RepositoryScanContext): string {
  return `You are Bob, the AI modernization analyst for CloudShift Radar.

Analyze the repository scan context and produce a migration readiness assessment.

The scanner only provides raw technical signals. You produce the final assessment.

Your task:
1. Identify cloud migration blockers.
2. Classify each finding by severity, confidence, and resolution level.
3. Determine which findings require human review.
4. Estimate which product features would survive migration.
5. Generate a migration readiness score.
6. Recommend whether the team should proceed, proceed with caution, prepare first, block migration, or require human review.
7. Explain your reasoning clearly.

For every finding, include:
- technical issue
- affected provider/service
- affected files
- severity
- confidence
- resolution level
- affected feature or feature area
- feature survival state
- business impact
- migration impact
- recommended action
- Bob rationale
- whether human review is required

Migration context:
Project name: ${context.projectName}
Current cloud provider: ${context.currentProvider}
Target cloud provider: ${context.targetProvider}
Application type: ${context.applicationType}

Repository file tree:
${stringifyForPrompt(scanContext.fileTree)}

Detected technical signals:
${stringifyForPrompt(scanContext.technicalSignals)}

Environment gaps:
${stringifyForPrompt(scanContext.environmentGaps)}

Hardcoded infrastructure:
${stringifyForPrompt(scanContext.hardcodedInfrastructure)}

Preliminary findings:
${stringifyForPrompt(scanContext.preliminaryFindings)}

Use these resolution levels:
- L1: Config change
- L2: Minor code change
- L3: Refactor required
- L4: Architecture change
- L5: Human review required

Use this rule:
High severity + low confidence = Human Review Required

Return only valid JSON matching the ScanResult type with this structure:

{
  "bobVerdict": "Prepare First",
  "bobSummary": "...",
  "bobConfidence": "Medium-High",
  "readinessScore": 42,
  "recommendedDecision": "Prepare First",
  "businessRiskLevel": "High",
  "technicalComplexity": "High",
  "findings": [
    {
      "id": "finding_001",
      "title": "...",
      "category": "...",
      "provider": "...",
      "service": "...",
      "affectedFiles": ["..."],
      "severity": "High",
      "confidence": "High",
      "resolutionLevel": "L3",
      "affectedFeature": "File uploads",
      "featureSurvivalState": "High risk",
      "bobRationale": "...",
      "businessImpact": "...",
      "migrationImpact": "...",
      "recommendedAction": "...",
      "requiresHumanReview": false,
      "humanReviewReason": "...",
      "suggestedReviewer": "Senior Backend Engineer"
    }
  ],
  "featureSurvivalMap": [
    {
      "feature": "...",
      "dependency": "...",
      "expectedState": "High risk",
      "bobRationale": "...",
      "recommendedAction": "..."
    }
  ],
  "humanReviewQueue": [
    {
      "findingId": "...",
      "title": "...",
      "reason": "...",
      "severity": "Critical",
      "confidence": "Low",
      "suggestedReviewer": "Senior Backend Engineer",
      "nextAction": "..."
    }
  ],
  "actionPlan": {
    "fixBeforeMigration": [],
    "validateBeforeMigration": [],
    "reviewWithSeniorEngineer": [],
    "documentBeforeMigration": [],
    "postMigrationChecks": []
  },
  "bobReasoningTrace": {
    "architectureSummary": "...",
    "cloudDependencyReasoning": [],
    "riskClassificationRationale": [],
    "confidenceRationale": [],
    "humanReviewRationale": [],
    "recommendedModernizationNotes": [],
    "traceTimeline": []
  }
}`;
}
