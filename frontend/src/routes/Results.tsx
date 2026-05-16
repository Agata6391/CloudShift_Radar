import { useMemo, useState } from "react";
import type { ScanResult } from "@cloudshift-radar/shared";
import { Card } from "../components/ui/Card";
import { BobVerdictHero } from "../components/dashboard/BobVerdictHero";
import { MetricCard } from "../components/dashboard/MetricCard";
import { DashboardTabs, type DashboardTab } from "../components/dashboard/DashboardTabs";
import { BobOverviewTab } from "../components/dashboard/BobOverviewTab";
import { MigrationImpactFindingsTab } from "../components/dashboard/MigrationImpactFindingsTab";
import { HumanReviewTab } from "../components/dashboard/HumanReviewTab";
import { AISummaryTab } from "../components/dashboard/AISummaryTab";
import { ExportMenu } from "../components/dashboard/ExportMenu";
import { mockScanResult } from "../data/mockScanResult";
import "../styles/export.css";

interface ResultsProps {
  latestResult: ScanResult | null;
  previewMode: boolean;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function Results({ latestResult, previewMode }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const result = useMemo(() => (latestResult ? latestResult : previewMode ? mockScanResult : null), [latestResult, previewMode]);

  if (!result) {
    return (
      <div className="page results-page">
        <Card className="error-card">
          <h1>CloudShift Radar Report</h1>
          <p>No report has been generated yet. Run a Bob-powered analysis from Project Input first.</p>
        </Card>
      </div>
    );
  }

  const highRiskCount = result.findings.filter((finding) => finding.severity === "High" || finding.severity === "Critical").length;
  const lowMediumRiskCount = result.findings.filter((finding) => finding.severity === "Low" || finding.severity === "Medium").length;
  const readyFiles = result.findings.filter((finding) => finding.featureStatus === "Ready").length;

  return (
    <div className="page results-page">
      {previewMode ? (
        <div className="preview-banner">
          Preview demo UI mode. Real scan routes require Bob Shell configuration and never fall back silently.
        </div>
      ) : null}

      <section className="report-header">
        <div>
          <span className="eyebrow">Report Dashboard</span>
          <h1>CloudShift Radar Report</h1>
          <p>{result.projectName}</p>
          <p>{result.currentProvider} &rarr; {result.targetProvider}</p>
        </div>
        <div className="report-meta">
          <span>Analysis status</span>
          <strong>Generated</strong>
          <span>Generated date</span>
          <strong>{formatDate(result.createdAt)}</strong>
          <div style={{ marginTop: "1rem" }}>
            <ExportMenu scanId={result.scanId} projectName={result.projectName} />
          </div>
        </div>
      </section>

      <BobVerdictHero result={result} />

      <section className="metric-grid">
        <MetricCard label="Migration readiness" value={`${result.readinessScore}%`} />
        <MetricCard label="Migration-ready files" value={String(readyFiles)} />
        <MetricCard label="Low / Medium risk" value={String(lowMediumRiskCount)} />
        <MetricCard label="High risk" value={String(highRiskCount)} />
        <MetricCard label="Needs human review" value={String(result.findings.filter((finding) => finding.requiresHumanReview).length)} />
      </section>

      <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

      <section className="tab-surface">
        {activeTab === "overview" ? <BobOverviewTab result={result} /> : null}
        {activeTab === "findings" ? <MigrationImpactFindingsTab result={result} /> : null}
        {activeTab === "humanReview" ? <HumanReviewTab result={result} /> : null}
        {activeTab === "aiSummary" ? <AISummaryTab result={result} /> : null}
      </section>
    </div>
  );
}
