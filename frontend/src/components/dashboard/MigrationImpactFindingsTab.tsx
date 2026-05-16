import { useState } from "react";
import type { Finding, RiskValue, ScanResult, Severity } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface MigrationImpactFindingsTabProps {
  result: ScanResult;
}

/**
 * MigrationImpactFindingsTab - Main findings view with migration impact focus
 * This component displays findings from ScanResult.findings with emphasis on:
 * - Migration risk and feature survival
 * - Business and feature impact
 * - Migration-specific recommendations
 *
 * Note: All findings come from the same data source (ScanResult.findings).
 * The term "findings" is standardized across the codebase.
 */

function riskTone(risk: RiskValue) {
  if (risk === "Critical" || risk === "Needs review") return "critical";
  if (risk === "High") return "high";
  if (risk === "Medium") return "medium";
  return "low";
}

function stateTone(state: string) {
  if (state === "Blocked" || state === "Needs human review") return "critical";
  if (state === "At risk") return "high";
  if (state === "Needs changes") return "medium";
  if (state === "Ready") return "success";
  return "neutral";
}

function featureSurvivalStateTone(state: string) {
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
  const [filter, setFilter] = useState<"All" | Severity | "Review">("All");
  const filteredFindings = result.findings.filter((finding) => {
    if (filter === "All") return true;
    if (filter === "Review") return finding.requiresHumanReview;
    return finding.severity === filter;
  });

  return (
    <div className="impact-findings">
      {/* Feature Survival Map Section */}
      <div className="table-card">
        <div className="section-heading">
          <span>Bob feature survival map</span>
          <h2 className="tab-section-title">What survives the migration</h2>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Dependency</th>
                <th>Expected state after migration</th>
                <th>Bob rationale</th>
                <th>Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {result.featureSurvivalMap.map((item) => (
                <tr key={item.feature}>
                  <td><strong>{item.feature}</strong></td>
                  <td>{item.dependency}</td>
                  <td><StatusPill tone={featureSurvivalStateTone(item.expectedState)}>{item.expectedState}</StatusPill></td>
                  <td>{item.bobRationale}</td>
                  <td>{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Findings Section */}
      <Card className="wide-card">
        <div className="section-heading">
          <span>Findings</span>
          <h2 className="tab-section-title">Findings & Feature Status</h2>
        </div>
        <p>
          Technical issues detected by Bob and their impact on application features.
        </p>
        <div className="finding-filters" aria-label="Finding filters">
          {(["All", "Critical", "High", "Medium", "Low", "Review"] as const).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
      </Card>

      {filteredFindings.map((finding) => {
        const review = reviewForFinding(result, finding);
        const humanReviewReason = finding.humanReviewReason || review?.reason;
        const suggestedReviewer = finding.suggestedReviewer || review?.suggestedReviewer;
        const risk = finding.risk as RiskValue;

        return (
          <Card key={finding.id} className="impact-card">
            <div className="impact-summary-grid">
              <div>
                <span>Risk</span>
                <StatusPill tone={riskTone(risk)}>{risk}</StatusPill>
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
                <span>Feature status</span>
                <StatusPill tone={stateTone(finding.featureStatus)}>{finding.featureStatus}</StatusPill>
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
                <span>Human review</span>
                <strong>{finding.requiresHumanReview ? "Yes" : "No"}</strong>
              </div>
            </div>
            <p className="impact-short-summary">{finding.shortSummary}</p>

            <details className="impact-details">
              <summary>
                <span className="details-open-label">See details</span>
                <span className="details-close-label">Hide details</span>
              </summary>
              <dl className="detail-list">
                <div>
                  <dt>Detected files</dt>
                  <dd>{finding.affectedFiles.length > 0 ? finding.affectedFiles.join(", ") : "No specific files reported"}</dd>
                </div>
                <div>
                  <dt>Technical issue</dt>
                  <dd>{finding.technicalIssue}</dd>
                </div>
                <div>
                  <dt>Feature impact</dt>
                  <dd>{finding.migrationImpact}</dd>
                </div>
                <div>
                  <dt>Technical Complexity</dt>
                  <dd>{finding.technicalComplexity || 'Not specified'}</dd>
                </div>
                <div>
                  <dt>Recommended action</dt>
                  <dd>{finding.recommendedAction}</dd>
                </div>
                <div>
                  <dt>Bob notes</dt>
                  <dd>{finding.bobNotes}</dd>
                </div>
                <div>
                  <dt>Business impact</dt>
                  <dd>{finding.businessImpact}</dd>
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
