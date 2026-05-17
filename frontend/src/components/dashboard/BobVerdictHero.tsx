import type { ScanResult, Finding, Severity } from "@cloudshift-radar/shared";
import { BobConfidenceMeter } from "../bob/BobConfidenceMeter";
import { BobBadge } from "../bob/BobBadge";
import { StatusPill } from "../ui/StatusPill";

interface BobVerdictHeroProps {
  result: ScanResult;
}

/**
 * Get top 3 signals from findings using deterministic priority sorting
 * Priority: Critical > High > Medium > Low
 * Tie-breaker: requiresHumanReview = true comes first
 */
function getTopSignals(findings: Finding[], maxCount = 3): Finding[] {
  const severityOrder: Record<Severity, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };

  return findings
    .slice() // Create copy to avoid mutating original
    .sort((a, b) => {
      // Priority 1: Severity
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // Priority 2: Human review required
      if (a.requiresHumanReview && !b.requiresHumanReview) return -1;
      if (!a.requiresHumanReview && b.requiresHumanReview) return 1;

      // Priority 3: Preserve original order
      return 0;
    })
    .slice(0, maxCount);
}

/**
 * Generate next review guidance from top signals
 */
function getNextReview(topSignals: Finding[]): string {
  if (topSignals.length === 0) {
    return "No immediate review area was identified from the scanned repository.";
  }

  const topSignal = topSignals[0];
  const feature = topSignal.affectedFeature;
  const service = topSignal.service;

  if (feature && service) {
    return `Start with ${feature} and ${service} migration before production cutover.`;
  } else if (feature) {
    return `Start with ${feature} before production migration.`;
  } else {
    return "Start with the highest-risk finding before production migration.";
  }
}

/**
 * Map severity to StatusPill tone
 */
function getSeverityTone(severity: Severity): "critical" | "high" | "medium" | "low" {
  return severity.toLowerCase() as "critical" | "high" | "medium" | "low";
}

export function BobVerdictHero({ result }: BobVerdictHeroProps) {
  const topSignals = getTopSignals(result.findings);
  const nextReview = getNextReview(topSignals);

  return (
    <section className="verdict-hero">
      <div className="verdict-copy">
        <BobBadge />
        <h2 className="primary-module-title">Bob Readiness Verdict</h2>
        <div className="verdict-value dominant-module-value">{result.bobVerdict}</div>
        <p className="verdict-hero__summary">{result.bobSummary}</p>

        {/* Key Signals Section */}
        <div className="verdict-hero__key-signals">
          <h3 className="verdict-hero__key-signals-title">Key signals</h3>
          {topSignals.length > 0 ? (
            <ul className="verdict-hero__key-signals-list">
              {topSignals.map((signal) => (
                <li key={signal.id} className="verdict-hero__key-signal">
                  <StatusPill tone={getSeverityTone(signal.severity)}>
                    {signal.severity}
                  </StatusPill>
                  <span>{signal.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="verdict-hero__key-signal-empty">
              No major migration blockers detected in the scanned repository.
            </p>
          )}
        </div>

        {/* Next Review Section */}
        <div className="verdict-hero__next-review">
          <strong>Next review:</strong> {nextReview}
        </div>
      </div>
      <div className="verdict-panel">
        <BobConfidenceMeter confidence={result.bobConfidence} />
        <div className="verdict-stat">
          <span>Required human review items</span>
          <strong>{result.humanReviewQueue.length}</strong>
        </div>
        <div className="radar-surface" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </section>
  );
}
