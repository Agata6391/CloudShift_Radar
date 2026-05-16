import type { Finding, ScanResult, Severity } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface MigrationImpactFindingsTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

function stateTone(state: string) {
  if (state === "Blocked") return "critical";
  if (state === "High risk") return "high";
  if (state === "Partially working") return "medium";
  if (state === "Likely working") return "success";
  return "neutral";
}

function reviewForFinding(result: ScanResult, finding: Finding) {
  return result.humanReviewQueue.find((item) => item.findingId === finding.id || item.title === finding.title);
}

export function MigrationImpactFindingsTab({ result }: MigrationImpactFindingsTabProps) {
  return (
    <div className="impact-findings">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Technical findings + feature survival</span>
          <h2>Migration Impact Findings</h2>
        </div>
        <p>
          Bob combines repository signals with feature impact so every finding shows both what breaks technically and
          what product capability is at risk.
        </p>
      </Card>

      {result.findings.map((finding) => {
        const review = reviewForFinding(result, finding);
        const humanReviewReason = finding.humanReviewReason || review?.reason;
        const suggestedReviewer = finding.suggestedReviewer || review?.suggestedReviewer;

        return (
          <Card key={finding.id} className="impact-card">
            <div className="impact-summary-grid">
              <div>
                <span>Severity</span>
                <StatusPill tone={severityTone(finding.severity)}>{finding.severity}</StatusPill>
              </div>
              <div className="impact-title">
                <span>Finding</span>
                <strong>{finding.title}</strong>
              </div>
              <div>
                <span>Affected feature</span>
                <strong>{finding.affectedFeature}</strong>
              </div>
              <div>
                <span>Feature survival</span>
                <StatusPill tone={stateTone(finding.featureSurvivalState)}>{finding.featureSurvivalState}</StatusPill>
              </div>
              <div>
                <span>Provider / Service</span>
                <strong>{finding.provider} / {finding.service}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{finding.confidence}</strong>
              </div>
              <div>
                <span>Resolution</span>
                <strong>{finding.resolutionLevel}</strong>
              </div>
              <div>
                <span>Human review</span>
                <strong>{finding.requiresHumanReview ? "Yes" : "No"}</strong>
              </div>
            </div>

            <details className="impact-details">
              <summary>See details</summary>
              <dl className="detail-list">
                <div>
                  <dt>Bob rationale</dt>
                  <dd>{finding.bobRationale}</dd>
                </div>
                <div>
                  <dt>Affected files</dt>
                  <dd>{finding.affectedFiles.length > 0 ? finding.affectedFiles.join(", ") : "No specific files reported"}</dd>
                </div>
                <div>
                  <dt>Business impact</dt>
                  <dd>{finding.businessImpact}</dd>
                </div>
                <div>
                  <dt>Migration impact</dt>
                  <dd>{finding.migrationImpact}</dd>
                </div>
                <div>
                  <dt>Feature survival state</dt>
                  <dd>{finding.featureSurvivalState}</dd>
                </div>
                <div>
                  <dt>Recommended action</dt>
                  <dd>{finding.recommendedAction}</dd>
                </div>
                {suggestedReviewer ? (
                  <div>
                    <dt>Suggested reviewer</dt>
                    <dd>{suggestedReviewer}</dd>
                  </div>
                ) : null}
                {humanReviewReason ? (
                  <div>
                    <dt>Human review reason</dt>
                    <dd>{humanReviewReason}</dd>
                  </div>
                ) : null}
              </dl>
            </details>
          </Card>
        );
      })}
    </div>
  );
}
