import { useState } from "react";
import type { ScanResult, Severity } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface TechnicalFindingsTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

/**
 * TechnicalFindingsTab - Alternative view focusing on technical details
 * Note: This component provides a technical-focused view of findings.
 * The main "Findings" tab uses MigrationImpactFindingsTab which shows migration impact.
 * Both components display the same underlying data (ScanResult.findings) with different emphasis.
 */
export function TechnicalFindingsTab({ result }: TechnicalFindingsTabProps) {
  const [filter, setFilter] = useState<"All" | Severity | "Review">("All");
  const filteredFindings = result.findings.filter((finding) => {
    if (filter === "All") return true;
    if (filter === "Review") return finding.requiresHumanReview;
    return finding.severity === filter;
  });

  return (
    <div className="impact-findings">
      {/* Technical Details View */}
      <Card className="wide-card">
        <div className="section-heading">
          <span>Bob rationale by finding</span>
          <h2>Technical Details</h2>
        </div>
        <p>
          Technical issues detected by Bob with detailed analysis and recommendations.
        </p>
        <div className="finding-filters" aria-label="Finding filters">
          {(["All", "Critical", "High", "Medium", "Low", "Review"] as const).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
      </Card>

      {filteredFindings.map((finding) => (
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
              <span>Category</span>
              <strong>{finding.category}</strong>
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
              <span>Resolution level</span>
              <strong>{finding.resolutionLevel}</strong>
            </div>
            <div>
              <span>Human review</span>
              <strong>{finding.requiresHumanReview ? "Yes" : "No"}</strong>
            </div>
          </div>
          <p className="impact-short-summary">{finding.bobRationale}</p>

          <details className="impact-details">
            <summary>
              <span className="details-open-label">See details</span>
              <span className="details-close-label">Hide details</span>
            </summary>
            <dl className="detail-list">
              <div>
                <dt>Affected files</dt>
                <dd>{finding.affectedFiles.length > 0 ? finding.affectedFiles.join(", ") : "No specific files reported"}</dd>
              </div>
              <div>
                <dt>Recommended action</dt>
                <dd>{finding.recommendedAction}</dd>
              </div>
              {finding.humanReviewReason ? (
                <div>
                  <dt>Human review reason</dt>
                  <dd>{finding.humanReviewReason}</dd>
                </div>
              ) : null}
              {finding.suggestedReviewer ? (
                <div>
                  <dt>Suggested reviewer</dt>
                  <dd>{finding.suggestedReviewer}</dd>
                </div>
              ) : null}
            </dl>
          </details>
        </Card>
      ))}
    </div>
  );
}
