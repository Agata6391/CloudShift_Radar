import type { ScanResult, Finding } from "@cloudshift-radar/shared";

/**
 * Genera un archivo CSV con los hallazgos del análisis
 */
export function generateCSV(result: ScanResult): string {
  const headers = [
    "ID",
    "Title",
    "Category",
    "Provider",
    "Service",
    "Severity",
    "Confidence",
    "Risk",
    "Feature Status",
    "Affected Feature",
    "Affected Files",
    "Recommended Action"
  ];

  const rows = result.findings.map((finding: Finding) => [
    finding.id,
    escapeCSV(finding.title),
    escapeCSV(finding.category),
    escapeCSV(finding.provider),
    escapeCSV(finding.service),
    finding.severity,
    finding.confidence,
    finding.risk,
    finding.featureStatus,
    escapeCSV(finding.affectedFeature),
    escapeCSV(finding.affectedFiles.join("; ")),
    escapeCSV(finding.recommendedAction)
  ]);

  const csvLines = [headers.join(","), ...rows.map((row) => row.join(","))];
  return csvLines.join("\n");
}

/**
 * Escapa valores para CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Genera un reporte en formato Markdown
 */
export function generateMarkdown(result: ScanResult): string {
  const sections: string[] = [];

  // Header
  sections.push(`# CloudShift Radar Report`);
  sections.push(`## ${result.projectName}`);
  sections.push("");
  sections.push(`**Migration:** ${result.currentProvider} → ${result.targetProvider}`);
  sections.push(`**Application Type:** ${result.applicationType}`);
  sections.push(`**Generated:** ${new Date(result.createdAt).toLocaleString()}`);
  sections.push("");

  // Bob Verdict
  sections.push(`## Bob's Verdict: ${result.bobVerdict}`);
  sections.push("");
  sections.push(`**Confidence:** ${result.bobConfidence}`);
  sections.push(`**Readiness Score:** ${result.readinessScore}%`);
  sections.push("");
  sections.push(result.bobSummary);
  sections.push("");

  // Summary Metrics
  sections.push(`## Summary Metrics`);
  sections.push("");
  const highRiskCount = result.findings.filter((f) => f.severity === "High" || f.severity === "Critical").length;
  const lowMediumRiskCount = result.findings.filter((f) => f.severity === "Low" || f.severity === "Medium").length;
  const readyFiles = result.findings.filter((f) => f.featureStatus === "Ready").length;
  const needsReview = result.findings.filter((f) => f.requiresHumanReview).length;

  sections.push(`- **Migration Readiness:** ${result.readinessScore}%`);
  sections.push(`- **Migration-Ready Files:** ${readyFiles}`);
  sections.push(`- **Low/Medium Risk:** ${lowMediumRiskCount}`);
  sections.push(`- **High Risk:** ${highRiskCount}`);
  sections.push(`- **Needs Human Review:** ${needsReview}`);
  sections.push(`- **Business Risk Level:** ${result.businessRiskLevel}`);
  sections.push(`- **Technical Complexity:** ${result.technicalComplexity}`);
  sections.push("");

  // Findings
  sections.push(`## Findings (${result.findings.length})`);
  sections.push("");

  for (const finding of result.findings) {
    sections.push(`### ${finding.title}`);
    sections.push("");
    sections.push(`**Severity:** ${finding.severity} | **Confidence:** ${finding.confidence} | **Risk:** ${finding.risk}`);
    sections.push("");
    sections.push(`**Category:** ${finding.category}`);
    sections.push(`**Provider:** ${finding.provider} (${finding.service})`);
    sections.push(`**Affected Feature:** ${finding.affectedFeature} (${finding.featureStatus})`);
    sections.push("");
    sections.push(`**Technical Issue:**`);
    sections.push(finding.technicalIssue);
    sections.push("");
    sections.push(`**Business Impact:**`);
    sections.push(finding.businessImpact);
    sections.push("");
    sections.push(`**Recommended Action:**`);
    sections.push(finding.recommendedAction);
    sections.push("");
    sections.push(`**Bob's Notes:**`);
    sections.push(finding.bobNotes);
    sections.push("");
    sections.push(`**Affected Files:**`);
    for (const file of finding.affectedFiles) {
      sections.push(`- \`${file}\``);
    }
    sections.push("");

    if (finding.requiresHumanReview) {
      sections.push(`> ⚠️ **Requires Human Review**`);
      if (finding.humanReviewReason) {
        sections.push(`> ${finding.humanReviewReason}`);
      }
      if (finding.suggestedReviewer) {
        sections.push(`> Suggested Reviewer: ${finding.suggestedReviewer}`);
      }
      sections.push("");
    }

    sections.push("---");
    sections.push("");
  }

  // Feature Survival Map
  sections.push(`## Feature Survival Map`);
  sections.push("");
  sections.push("| Feature | Dependency | Expected State | Recommended Action |");
  sections.push("|---------|------------|----------------|-------------------|");
  for (const item of result.featureSurvivalMap) {
    sections.push(
      `| ${item.feature} | ${item.dependency} | ${item.expectedState} | ${item.recommendedAction} |`
    );
  }
  sections.push("");

  // Action Plan
  sections.push(`## Action Plan`);
  sections.push("");

  sections.push(`### Fix Before Migration`);
  for (const action of result.actionPlan.fixBeforeMigration) {
    sections.push(`- ${action}`);
  }
  sections.push("");

  sections.push(`### Validate Before Migration`);
  for (const action of result.actionPlan.validateBeforeMigration) {
    sections.push(`- ${action}`);
  }
  sections.push("");

  sections.push(`### Review with Senior Engineer`);
  for (const action of result.actionPlan.reviewWithSeniorEngineer) {
    sections.push(`- ${action}`);
  }
  sections.push("");

  sections.push(`### Document Before Migration`);
  for (const action of result.actionPlan.documentBeforeMigration) {
    sections.push(`- ${action}`);
  }
  sections.push("");

  sections.push(`### Post-Migration Checks`);
  for (const action of result.actionPlan.postMigrationChecks) {
    sections.push(`- ${action}`);
  }
  sections.push("");

  // Human Review Queue
  if (result.humanReviewQueue.length > 0) {
    sections.push(`## Human Review Queue (${result.humanReviewQueue.length})`);
    sections.push("");

    for (const item of result.humanReviewQueue) {
      sections.push(`### ${item.title}`);
      sections.push("");
      sections.push(`**Severity:** ${item.severity} | **Confidence:** ${item.confidence}`);
      sections.push("");
      sections.push(`**Reason:**`);
      sections.push(item.reason);
      sections.push("");
      sections.push(`**Suggested Reviewer:** ${item.suggestedReviewer}`);
      sections.push("");
      sections.push(`**Next Action:**`);
      sections.push(item.nextAction);
      sections.push("");
      sections.push("---");
      sections.push("");
    }
  }

  // Bob's Reasoning Trace
  sections.push(`## Bob's Reasoning Trace`);
  sections.push("");
  sections.push(`### Architecture Summary`);
  sections.push(result.bobReasoningTrace.architectureSummary);
  sections.push("");

  sections.push(`### Cloud Dependency Reasoning`);
  for (const reasoning of result.bobReasoningTrace.cloudDependencyReasoning) {
    sections.push(`- ${reasoning}`);
  }
  sections.push("");

  sections.push(`### Risk Classification Rationale`);
  for (const rationale of result.bobReasoningTrace.riskClassificationRationale) {
    sections.push(`- ${rationale}`);
  }
  sections.push("");

  sections.push(`### Confidence Rationale`);
  for (const rationale of result.bobReasoningTrace.confidenceRationale) {
    sections.push(`- ${rationale}`);
  }
  sections.push("");

  return sections.join("\n");
}

/**
 * Genera el JSON formateado del resultado
 */
export function generateJSON(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

// Made with Bob
