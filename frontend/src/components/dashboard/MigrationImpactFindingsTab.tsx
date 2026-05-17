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
          <Card key={finding.id} className="finding-card">
            <div className="finding-card__header">
              <StatusPill tone={riskTone(risk)}>{risk}</StatusPill>
              <StatusPill tone={stateTone(finding.featureStatus)}>{finding.featureStatus}</StatusPill>
              <StatusPill>Confidence: {finding.confidence}</StatusPill>
              {finding.requiresHumanReview && <StatusPill tone="critical">Human review: Yes</StatusPill>}
            </div>

            <h3 className="finding-card__title">{finding.title}</h3>

            <div className="finding-card__summary">
              <p className="finding-card__summary-label">Summary</p>
              <p>{finding.shortSummary}</p>
            </div>

            <div className="finding-card__metadata">
              <div>
                <span className="finding-card__metadata-label">Affected feature</span>
                <strong>{finding.affectedFeature}</strong>
              </div>
              <div>
                <span className="finding-card__metadata-label">Provider / service</span>
                <strong>{finding.provider} / {finding.service}</strong>
              </div>
              {!finding.requiresHumanReview && (
                <div>
                  <span className="finding-card__metadata-label">Human review</span>
                  <strong>No</strong>
                </div>
              )}
            </div>

            <details className="finding-card__details">
              <summary className="finding-card__details-toggle">
                <span className="details-open-label">See details</span>
                <span className="details-close-label">Hide details</span>
              </summary>
              <div className="finding-card__details-content">
                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Detected files</h4>
                  <div className="finding-card__detail-body">
                    {finding.affectedFiles.length > 0 ? (
                      <ul className="finding-card__file-list">
                        {finding.affectedFiles.map((file, idx) => (
                          <li key={idx}>{file}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No specific files reported</p>
                    )}
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Technical issue</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.technicalIssue}</p>
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Feature impact</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.migrationImpact}</p>
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Technical complexity</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.technicalComplexity || 'Not specified'}</p>
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Recommended action</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.recommendedAction}</p>
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Bob notes</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.bobNotes}</p>
                  </div>
                </div>

                <div className="finding-card__detail-section">
                  <h4 className="finding-card__detail-title">Business impact</h4>
                  <div className="finding-card__detail-body">
                    <p>{finding.businessImpact}</p>
                  </div>
                </div>

                {suggestedReviewer ? (
                  <div className="finding-card__detail-section">
                    <h4 className="finding-card__detail-title">Suggested reviewer</h4>
                    <div className="finding-card__detail-body">
                      <p>{suggestedReviewer}</p>
                    </div>
                  </div>
                ) : null}

                {humanReviewReason ? (
                  <div className="finding-card__detail-section">
                    <h4 className="finding-card__detail-title">Human review reason</h4>
                    <div className="finding-card__detail-body">
                      <p>{humanReviewReason}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </details>
          </Card>
        );
      })}
    </div>
  );
}
