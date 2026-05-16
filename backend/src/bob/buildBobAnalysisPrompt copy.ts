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

Analyze the repository scan context and produce a compact migration readiness assessment.

The scanner only provides raw technical signals. You produce the final assessment.

Hard output rules:
- Return ONLY valid JSON.
- Do not use markdown.
- Do not include explanations outside JSON.
- Do not include code fences.
- Do not include thinking text.
- Do not include commentary before or after the JSON.
- Close the JSON object completely.
- Keep the response compact.
- Prioritize the highest-impact risks only.

Assessment limits:
- Maximum findings: 5.
- Maximum featureSurvivalMap items: 6.
- Maximum humanReviewQueue items: 3.
- Maximum actionPlan items per array: 5.
- Maximum cloudDependencyReasoning items: 4.
- Maximum riskClassificationRationale items: 4.
- Maximum confidenceRationale items: 3.
- Maximum humanReviewRationale items: 3.
- Maximum recommendedModernizationNotes items: 4.
- Maximum traceTimeline items: 4.
- Keep bobSummary under 500 characters.
- Keep bobRationale fields under 260 characters.
- Keep businessImpact under 220 characters.
- Keep migrationImpact under 220 characters.
- Keep recommendedAction under 260 characters.
- Keep architectureSummary under 400 characters.

Your task:
1. Identify the most important cloud migration blockers.
2. Classify each finding by severity, confidence, and resolution level.
3. Determine which findings require human review.
4. Estimate which product features would survive migration.
5. Generate a migration readiness score from 0 to 100.
6. Recommend one decision:
   - "Proceed"
   - "Proceed with Caution"
   - "Prepare First"
   - "Block Migration"
   - "Human Review Required"

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

Use these severity values only:
- Critical
- High
- Medium
- Low

Use these confidence values only:
- High
- Medium
- Low

Use these resolution levels only:
- L1: Config change
- L2: Minor code change
- L3: Refactor required
- L4: Architecture change
- L5: Human review required

Use this rule:
High severity + low confidence = Human Review Required.

Return this exact JSON structure:

{
  "bobVerdict": "Prepare First",
  "bobSummary": "Compact summary of the migration readiness assessment.",
  "bobConfidence": "Medium-High",
  "readinessScore": 42,
  "recommendedDecision": "Prepare First",
  "businessRiskLevel": "High",
  "technicalComplexity": "High",
  "findings": [
    {
      "id": "finding_001",
      "title": "Short finding title",
      "category": "Cloud Dependency",
      "provider": "AWS",
      "service": "S3",
      "affectedFiles": ["path/to/file.ts"],
      "severity": "High",
      "confidence": "High",
      "resolutionLevel": "L3",
      "affectedFeature": "File uploads",
      "featureSurvivalState": "High risk",
      "bobRationale": "Short rationale.",
      "businessImpact": "Short business impact.",
      "migrationImpact": "Short migration impact.",
      "recommendedAction": "Short recommended action.",
      "requiresHumanReview": false,
      "humanReviewReason": null,
      "suggestedReviewer": null
    }
  ],
  "featureSurvivalMap": [
    {
      "feature": "File uploads",
      "dependency": "AWS S3",
      "expectedState": "High risk",
      "bobRationale": "Short rationale.",
      "recommendedAction": "Short recommended action."
    }
  ],
  "humanReviewQueue": [
    {
      "findingId": "finding_001",
      "title": "Short review title",
      "reason": "Short reason.",
      "severity": "Critical",
      "confidence": "Low",
      "suggestedReviewer": "Senior Backend Engineer",
      "nextAction": "Short next action."
    }
  ],
  "actionPlan": {
    "fixBeforeMigration": ["Short action"],
    "validateBeforeMigration": ["Short action"],
    "reviewWithSeniorEngineer": ["Short action"],
    "documentBeforeMigration": ["Short action"],
    "postMigrationChecks": ["Short action"]
  },
  "bobReasoningTrace": {
    "architectureSummary": "Short architecture summary.",
    "cloudDependencyReasoning": ["Short reasoning item"],
    "riskClassificationRationale": ["Short rationale item"],
    "confidenceRationale": ["Short confidence item"],
    "humanReviewRationale": ["Short review rationale"],
    "recommendedModernizationNotes": ["Short modernization note"],
    "traceTimeline": ["Short trace item"]
  }
}`;
}
