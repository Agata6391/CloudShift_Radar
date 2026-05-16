import type { ScanResult } from "@cloudshift-radar/shared";
import { BobConfidenceMeter } from "../bob/BobConfidenceMeter";
import { BobBadge } from "../bob/BobBadge";

interface BobVerdictHeroProps {
  result: ScanResult;
}

export function BobVerdictHero({ result }: BobVerdictHeroProps) {
  return (
    <section className="verdict-hero">
      <div className="verdict-copy">
        <BobBadge />
        <h2 className="primary-module-title">Bob Readiness Verdict</h2>
        <div className="verdict-value dominant-module-value">{result.bobVerdict}</div>
        <p className="verdict-summary">{result.bobSummary}</p>
        <p>
          Bob does not recommend production migration yet. Critical AWS dependencies remain coupled to storage,
          cache, and matchmaking infrastructure. Basic auth and database-backed APIs may survive migration, but
          uploads, queues, and matchmaking are likely to fail without preparation.
        </p>
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
