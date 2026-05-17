import type { ScanResult, Severity, Finding } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface AISummaryTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

function getTopFindings(findings: Finding[], limit: number = 3): Finding[] {
  const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
  
  return [...findings]
    .sort((a, b) => {
      const aSeverityIndex = severityOrder.indexOf(a.severity);
      const bSeverityIndex = severityOrder.indexOf(b.severity);
      
      if (aSeverityIndex !== bSeverityIndex) {
        return aSeverityIndex - bSeverityIndex;
      }
      
      // If severity is tied, prioritize human review
      if (a.requiresHumanReview && !b.requiresHumanReview) return -1;
      if (!a.requiresHumanReview && b.requiresHumanReview) return 1;
      
      return 0;
    })
    .slice(0, limit);
}

function generateExecutiveSummary(result: ScanResult): string {
  const verdict = result.bobVerdict || result.recommendedDecision;
  const topFindings = getTopFindings(result.findings, 3);
  const reviewCount = result.findings.filter(f => f.requiresHumanReview).length;
  
  // Determine dominant reason from top findings
  const categories = topFindings.map(f => f.category.toLowerCase());
  const hasInfrastructure = categories.some(c => c.includes('infrastructure') || c.includes('hardcoded'));
  const hasDatabase = categories.some(c => c.includes('database') || c.includes('storage'));
  const hasArchitecture = categories.some(c => c.includes('architecture') || c.includes('real-time'));
  
  let dominantReason = "migration risks";
  if (hasInfrastructure) dominantReason = "hardcoded infrastructure references";
  else if (hasArchitecture) dominantReason = "architecture decisions";
  else if (hasDatabase) dominantReason = "storage and database dependencies";
  
  // Determine next step
  const nextStep = result.actionPlan?.fixBeforeMigration?.[0] || 
    topFindings[0]?.recommendedAction || 
    "Start with the highest-risk finding before production migration.";
  
  // Generate summary based on verdict
  if (verdict === "Proceed") {
    return `Bob recommends proceeding with migration because the application has low migration risks and clear migration paths. The strongest signals indicate ${dominantReason} that can be addressed during migration. ${nextStep}`;
  } else if (verdict === "Proceed with caution") {
    return `Bob recommends proceeding with caution because the application has manageable migration risks, but ${dominantReason} require validation before production migration. ${reviewCount > 0 ? `${reviewCount} finding${reviewCount > 1 ? 's' : ''} require human validation.` : ''} ${nextStep}`;
  } else if (verdict === "Prepare First") {
    return `Bob recommends preparing before migration because ${dominantReason} must be resolved to ensure migration safety. ${reviewCount > 0 ? `${reviewCount} critical decision${reviewCount > 1 ? 's' : ''} require human validation before proceeding.` : ''} ${nextStep}`;
  } else if (verdict === "Block Migration") {
    return `Bob recommends blocking migration because ${dominantReason} present critical blockers that would cause production failures. ${reviewCount > 0 ? `${reviewCount} finding${reviewCount > 1 ? 's' : ''} require immediate human review.` : ''} ${nextStep}`;
  }
  
  return `Bob analyzed the migration and identified ${dominantReason} that require attention. ${reviewCount > 0 ? `${reviewCount} finding${reviewCount > 1 ? 's' : ''} require human validation.` : ''} ${nextStep}`;
}

export function AISummaryTab({ result }: AISummaryTabProps) {
  const topFindings = getTopFindings(result.findings, 3);
  const reviewFindings = result.findings.filter(f => f.requiresHumanReview);
  const executiveSummary = generateExecutiveSummary(result);
  
  const highestReviewSeverity = reviewFindings.length > 0
    ? getTopFindings(reviewFindings, 1)[0]?.severity
    : null;
  
  const nextStep = result.actionPlan?.fixBeforeMigration?.[0] || 
    topFindings[0]?.recommendedAction || 
    "Start with the highest-risk finding before production migration.";
  
  // Evidence matrix data
  const evidenceRows = topFindings.slice(0, 4).map(finding => ({
    signal: finding.category,
    source: "Finding",
    impact: finding.severity,
    action: finding.recommendedAction
  }));

  return (
    <div className="ai-summary-layout">
      <Card className="wide-card">
        <div className="section-heading">
          <span>AI Summary</span>
          <h2>Bob's executive explanation of the migration verdict, linked to the strongest technical evidence found during analysis.</h2>
        </div>
      </Card>

      <Card className="ai-summary-executive">
        <h3>Executive Summary</h3>
        <p>{executiveSummary}</p>
      </Card>

      <div className="ai-summary-section">
        <h3 className="ai-summary-section-title">What this summary is based on</h3>
        
        <div className="evidence-grid">
          <Card className="evidence-card">
            <h4 className="evidence-card__title">Bob Verdict</h4>
            <div className="evidence-card__content">
              <div className="evidence-card__item">
                <span className="evidence-card__label">Verdict</span>
                <strong className="evidence-card__value">{result.bobVerdict || result.recommendedDecision}</strong>
              </div>
              <div className="evidence-card__item">
                <span className="evidence-card__label">Confidence</span>
                <strong className="evidence-card__value">{result.bobConfidence || "Medium"}</strong>
              </div>
              <div className="evidence-card__item">
                <span className="evidence-card__label">Readiness Score</span>
                <strong className="evidence-card__value">{result.readinessScore}%</strong>
              </div>
            </div>
          </Card>

          <Card className="evidence-card">
            <h4 className="evidence-card__title">Top Findings</h4>
            {topFindings.length > 0 ? (
              <div className="evidence-card__findings">
                {topFindings.map((finding) => (
                  <div key={finding.id} className="evidence-finding">
                    <div className="evidence-finding__header">
                      <StatusPill tone={severityTone(finding.severity)}>{finding.severity}</StatusPill>
                      <span className="evidence-finding__title">{finding.title}</span>
                    </div>
                    <p className="evidence-finding__summary">{finding.shortSummary}</p>
                    {finding.affectedFeature && (
                      <span className="evidence-finding__feature">Affects: {finding.affectedFeature}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="evidence-card__empty">No supporting findings were found for this summary.</p>
            )}
          </Card>

          <Card className="evidence-card">
            <h4 className="evidence-card__title">Human Review</h4>
            <div className="evidence-card__content">
              {reviewFindings.length > 0 ? (
                <>
                  <div className="evidence-card__item">
                    <span className="evidence-card__label">Manual review required</span>
                    <strong className="evidence-card__value">Yes</strong>
                  </div>
                  <div className="evidence-card__item">
                    <span className="evidence-card__label">Review items</span>
                    <strong className="evidence-card__value">{reviewFindings.length}</strong>
                  </div>
                  {highestReviewSeverity && (
                    <div className="evidence-card__item">
                      <span className="evidence-card__label">Highest severity</span>
                      <strong className="evidence-card__value">{highestReviewSeverity}</strong>
                    </div>
                  )}
                  <p className="evidence-card__note">
                    Bob escalated these findings because automated reasoning is not enough to make a safe migration decision.
                  </p>
                </>
              ) : (
                <p className="evidence-card__empty">No manual review was required by Bob for this scan.</p>
              )}
            </div>
          </Card>

          <Card className="evidence-card">
            <h4 className="evidence-card__title">Recommended Next Step</h4>
            <div className="evidence-card__content">
              <p className="evidence-card__action">{nextStep}</p>
            </div>
          </Card>
        </div>
      </div>

      {evidenceRows.length > 0 && (
        <div className="ai-summary-section">
          <h3 className="ai-summary-section-title">Evidence chain</h3>
          <Card>
            <div className="evidence-matrix-wrapper">
              <table className="evidence-matrix">
                <thead>
                  <tr>
                    <th>Signal</th>
                    <th>Evidence source</th>
                    <th>Migration impact</th>
                    <th>Recommended action</th>
                  </tr>
                </thead>
                <tbody>
                  {evidenceRows.map((row, index) => (
                    <tr key={index}>
                      <td>{row.signal}</td>
                      <td>{row.source}</td>
                      <td>
                        <StatusPill tone={severityTone(row.impact as Severity)}>{row.impact}</StatusPill>
                      </td>
                      <td>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <div className="ai-summary-section">
        <h3 className="ai-summary-section-title">Bob decision path</h3>
        <Card>
          <ol className="decision-path">
            <li>Static analysis detected infrastructure and configuration signals across the codebase.</li>
            <li>Bob weighted severity, confidence, affected features, and review flags for each finding.</li>
            <li>The final verdict prioritizes migration safety over the raw readiness score.</li>
            <li>The next step is based on the highest-impact unresolved migration risk.</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob
