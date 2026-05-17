import { useState } from "react";
import type { ScanResult, Severity, Finding, HumanReviewItem } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface HumanReviewTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

function getHighestSeverity(findings: Finding[]): Severity {
  const severityOrder: Severity[] = ["Critical", "High", "Medium", "Low"];
  for (const severity of severityOrder) {
    if (findings.some((f) => f.severity === severity)) {
      return severity;
    }
  }
  return "Low";
}

function deriveMainReason(finding: Finding, review?: HumanReviewItem): string {
  const reason = finding.humanReviewReason || review?.reason || "";
  const title = finding.title.toLowerCase();
  const feature = finding.affectedFeature.toLowerCase();
  const category = finding.category.toLowerCase();
  
  const text = `${reason} ${title} ${feature} ${category}`.toLowerCase();
  
  if (text.match(/architecture|infrastructure|webrtc|real-time|socket|turn|kinesis|video|bidding|storage provider|database migration|cosmos|mongodb|atlas|auth|security|payment|billing|provider choice/)) {
    return "Architecture decision";
  }
  
  if (finding.confidence === "Low") {
    return "Low confidence";
  }
  
  return "Bob requires human validation";
}

function deriveDecisionNeeded(finding: Finding, review?: HumanReviewItem): string {
  const title = finding.title.toLowerCase();
  const feature = finding.affectedFeature.toLowerCase();
  const reason = finding.humanReviewReason || review?.reason || "";
  
  const text = `${title} ${feature} ${reason}`.toLowerCase();
  
  if (text.match(/real-time|webrtc|socket|turn|kinesis|video|bidding/)) {
    return "Choose the real-time communication strategy before production migration.";
  }
  
  if (text.match(/database|mongodb|cosmos|atlas|persistence|data/)) {
    return "Validate the target database migration strategy before production migration.";
  }
  
  if (text.match(/storage|s3|gcs|blob|file upload/)) {
    return "Validate the target storage provider and upload migration path before production migration.";
  }
  
  if (text.match(/auth|token|security|captcha|credential/)) {
    return "Validate the security and authentication configuration before production migration.";
  }
  
  return "Validate the migration approach for this finding before production migration.";
}

export function HumanReviewTab({ result }: HumanReviewTabProps) {
  const reviewFindings = result.findings.filter((finding) => finding.requiresHumanReview);
  
  if (reviewFindings.length === 0) {
    return (
      <div className="human-review-queue">
        <Card className="wide-card human-review-empty">
          <h2>No manual review required</h2>
          <p>
            Bob did not identify findings that require mandatory human validation before migration.
          </p>
          <p>
            High-risk findings may still need prioritization, but Bob did not escalate them as required review items.
          </p>
        </Card>
      </div>
    );
  }
  
  const highestSeverity = getHighestSeverity(reviewFindings);
  const highestSeverityFinding = reviewFindings.find((f) => f.severity === highestSeverity);
  const primaryReviewer = highestSeverityFinding?.suggestedReviewer || 
    result.humanReviewQueue.find((item) => item.findingId === highestSeverityFinding?.id)?.suggestedReviewer ||
    "Technical reviewer";
  const mainReason = highestSeverityFinding ? 
    deriveMainReason(highestSeverityFinding, result.humanReviewQueue.find((item) => item.findingId === highestSeverityFinding.id)) :
    "Bob requires human validation";

  return (
    <div className="human-review-queue">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Manual Review Queue</span>
          <h2>Manual review required before migration</h2>
        </div>
        <p>
          Bob escalates findings when automated reasoning is not enough to make a safe migration decision.
        </p>
      </Card>

      <Card className="human-review-summary">
        <div className="human-review-summary__grid">
          <div className="human-review-summary__item">
            <span className="human-review-summary__label">Required reviews</span>
            <strong className="human-review-summary__value">{reviewFindings.length}</strong>
          </div>
          <div className="human-review-summary__item">
            <span className="human-review-summary__label">Highest severity</span>
            <strong className="human-review-summary__value">{highestSeverity}</strong>
          </div>
          <div className="human-review-summary__item">
            <span className="human-review-summary__label">Primary reviewer</span>
            <strong className="human-review-summary__value">{primaryReviewer}</strong>
          </div>
          <div className="human-review-summary__item">
            <span className="human-review-summary__label">Main reason</span>
            <strong className="human-review-summary__value">{mainReason}</strong>
          </div>
        </div>
      </Card>

      {reviewFindings.map((finding) => {
        const review = result.humanReviewQueue.find((item) => item.findingId === finding.id || item.title === finding.title);
        return <ReviewCard key={finding.id} finding={finding} review={review} />;
      })}
    </div>
  );
}

interface ReviewCardProps {
  finding: Finding;
  review?: HumanReviewItem;
}

function ReviewCard({ finding, review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const decisionNeeded = deriveDecisionNeeded(finding, review);
  const suggestedReviewer = finding.suggestedReviewer || review?.suggestedReviewer || "Senior Engineer";
  
  return (
    <Card className="human-review-card">
      <div className="human-review-card__header">
        <StatusPill tone={severityTone(finding.severity)}>{finding.severity} severity</StatusPill>
        <StatusPill tone="neutral">{finding.confidence} confidence</StatusPill>
        <StatusPill tone="high">Manual review required</StatusPill>
      </div>
      
      <h3 className="human-review-card__title">{finding.title}</h3>
      
      <div className="human-review-card__decision">
        <span className="human-review-card__decision-label">Decision needed</span>
        <p>{decisionNeeded}</p>
      </div>
      
      <div className="human-review-card__reviewer">
        <span className="human-review-card__reviewer-label">Suggested reviewer</span>
        <strong>{suggestedReviewer}</strong>
      </div>
      
      <button
        className="human-review-card__toggle button button-ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        type="button"
      >
        {isExpanded ? "Hide review details" : "See review details"}
      </button>
      
      {isExpanded && (
        <div className="human-review-card__details">
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Why Bob escalated this</h4>
            <div className="human-review-card__detail-body">
              <p>
                {finding.humanReviewReason ||
                  review?.reason ||
                  "Bob escalated this finding because the migration path depends on a decision that affects production reliability, cost, or technical architecture. Automated reasoning is not sufficient to make this decision safely."}
              </p>
            </div>
          </div>
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Technical context</h4>
            <div className="human-review-card__detail-body">
              <p>{finding.technicalIssue}</p>
              {finding.bobNotes && <p>{finding.bobNotes}</p>}
            </div>
          </div>
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Decision needed</h4>
            <div className="human-review-card__detail-body">
              <p>{decisionNeeded}</p>
            </div>
          </div>
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Recommended validation</h4>
            <div className="human-review-card__detail-body">
              <p>{review?.recommendedValidation || review?.nextAction || finding.recommendedAction}</p>
            </div>
          </div>
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Affected feature</h4>
            <div className="human-review-card__detail-body">
              <p>{finding.affectedFeature}</p>
            </div>
          </div>
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Suggested reviewer</h4>
            <div className="human-review-card__detail-body">
              <p>{suggestedReviewer}</p>
            </div>
          </div>
          
          {finding.businessImpact && (
            <div className="human-review-card__detail-section">
              <h4 className="human-review-card__detail-title">Business impact</h4>
              <div className="human-review-card__detail-body">
                <p>{finding.businessImpact}</p>
              </div>
            </div>
          )}
          
          <div className="human-review-card__detail-section">
            <h4 className="human-review-card__detail-title">Related finding</h4>
            <div className="human-review-card__detail-body">
              <p>{finding.title}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// Made with Bob
