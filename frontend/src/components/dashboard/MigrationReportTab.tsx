import type { ScanResult } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";

interface MigrationReportTabProps {
  result: ScanResult;
}

export function MigrationReportTab({ result }: MigrationReportTabProps) {
  const topBlockers = result.findings.slice(0, 5);

  return (
    <Card className="report-card">
      <div className="section-heading">
        <span>Bob final assessment</span>
        <h2>Migration Report</h2>
      </div>

      <section>
        <h3>Bob executive summary</h3>
        <p>{result.bobSummary}</p>
      </section>

      <section>
        <h3>Readiness score</h3>
        <p>{result.readinessScore}% migration readiness based on Bob's interpretation of repository scan context.</p>
      </section>

      <section>
        <h3>Recommended decision</h3>
        <p>{result.recommendedDecision}. Bob recommends preparing the migration before production cutover.</p>
      </section>

      <section>
        <h3>Business risk level</h3>
        <p>{result.businessRiskLevel}. Storage, queue, billing, and matchmaking uncertainty can affect customer-facing workflows.</p>
      </section>

      <section>
        <h3>Top blockers</h3>
        <ul className="clean-list">
          {topBlockers.map((finding) => (
            <li key={finding.id}>{finding.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Feature survival summary</h3>
        <p>
          Bob expects basic auth to survive with validation, while uploads, background jobs, and matchmaking need
          remediation before migration readiness can be trusted.
        </p>
      </section>

      <section>
        <h3>Technical findings</h3>
        <p>Every finding includes severity, confidence, affected files, resolution level, and Bob rationale in the technical dashboard.</p>
      </section>

      <section>
        <h3>Human review queue</h3>
        <p>{result.humanReviewQueue.length} Bob escalation items require senior review before migration estimates are final.</p>
      </section>

      <section>
        <h3>Remediation plan</h3>
        <p>Prioritize storage abstraction, target Redis configuration, GameLift replacement architecture, SendGrid startup gating, and env documentation.</p>
      </section>

      <section>
        <h3>Validation checklist</h3>
        <p>Run smoke tests for auth, storage, Redis, email, matchmaking, billing webhook routing, and rollback paths.</p>
      </section>

      <section>
        <h3>Bob final verdict</h3>
        <p>{result.bobVerdict}: know what will break before you migrate, then fix or escalate those items before production movement.</p>
      </section>
    </Card>
  );
}
