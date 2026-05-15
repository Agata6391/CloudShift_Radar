import { BobBadge } from "../components/bob/BobBadge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Route } from "../utils/navigation";

interface HomeProps {
  onNavigate: (route: Route) => void;
  onPreviewDemo: () => void;
}

export function Home({ onNavigate, onPreviewDemo }: HomeProps) {
  return (
    <div className="page home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">Bob-powered migration readiness assessment</span>
          <h1>CloudShift Radar</h1>
          <p className="hero-subtitle">Know what will break before you migrate.</p>
          <p>
            Upload a repository ZIP and let Bob analyze cloud dependencies, migration blockers, architecture risks,
            and human-review items before migration work begins.
          </p>
          <div className="hero-actions">
            <Button onClick={() => onNavigate("/assessment")}>Start Bob Assessment</Button>
            <Button variant="secondary" onClick={onPreviewDemo}>View Bob Demo Report</Button>
          </div>
        </div>

        <Card className="bob-hero-card">
          <BobBadge />
          <h2>Bob-powered analysis card</h2>
          <ul className="analysis-list">
            <li>Bob reviews repository architecture</li>
            <li>Bob classifies migration blockers</li>
            <li>Bob explains confidence and uncertainty</li>
            <li>Bob produces the readiness verdict</li>
          </ul>
          <div className="radar-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </Card>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <span>Problem</span>
          <h2>Hidden dependencies are discovered too late.</h2>
        </div>
        <p>
          Cloud migrations often fail because cloud-specific SDKs, hardcoded infrastructure, environment gaps,
          queues, databases, storage services, and CI/CD assumptions silently block migration readiness.
        </p>
      </section>

      <section className="content-section two-column">
        <div>
          <div className="section-heading">
            <span>Bob-Powered Assessment</span>
            <h2>CloudShift Radar scans the repository. Bob explains what matters.</h2>
          </div>
          <p>
            The scanner extracts technical signals. Bob interprets what those signals mean for migration readiness,
            risk, feature survival, and required human review.
          </p>
        </div>
        <Card>
          <h3>Bob's assessment contract</h3>
          <p>Severity, confidence, resolution level, human review, and readiness verdict all come from Bob.</p>
        </Card>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <span>How It Works</span>
          <h2>From repository ZIP to Bob verdict</h2>
        </div>
        <div className="step-grid">
          {[
            "Upload a repository ZIP",
            "CloudShift Radar extracts technical signals",
            "Bob analyzes the repository context",
            "Bob classifies blockers by severity and confidence",
            "Bob identifies human-review risks",
            "Bob generates a migration readiness verdict",
            "The dashboard turns Bob's analysis into an executive and technical report"
          ].map((step, index) => (
            <Card key={step}>
              <span className="step-number">{index + 1}</span>
              <p>{step}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="content-section two-column">
        <Card>
          <h3>What Bob Detects and Explains</h3>
          <div className="pill-cloud">
            {[
              "Cloud SDK coupling",
              "Hardcoded infrastructure",
              "Environment variable gaps",
              "External service dependencies",
              "Storage migration risks",
              "Queue and background job risks",
              "Database portability issues",
              "CI/CD assumptions",
              "Architecture-level blockers",
              "Human-review uncertainty"
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Card>

        <Card>
          <h3>Who Uses Bob's Output</h3>
          <ul className="clean-list">
            <li>CTOs: readiness verdict and business risk</li>
            <li>PMs: feature survival and roadmap impact</li>
            <li>Tech Leads: blockers and remediation plan</li>
            <li>Developers: affected files and recommended actions</li>
            <li>DevOps Engineers: infrastructure and service dependency risks</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
