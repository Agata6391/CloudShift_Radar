import { useMemo, useState } from "react";
import type { ScanResult } from "@cloudshift-radar/shared";
import { BobVerdictHero } from "../components/dashboard/BobVerdictHero";
import { MetricCard } from "../components/dashboard/MetricCard";
import { DashboardTabs, type DashboardTab } from "../components/dashboard/DashboardTabs";
import { BobOverviewTab } from "../components/dashboard/BobOverviewTab";
import { MigrationImpactFindingsTab } from "../components/dashboard/MigrationImpactFindingsTab";
import { HumanReviewTab } from "../components/dashboard/HumanReviewTab";
import { ActionPlanTab } from "../components/dashboard/ActionPlanTab";
import { MigrationReportTab } from "../components/dashboard/MigrationReportTab";
import { BobReasoningTraceTab } from "../components/dashboard/BobReasoningTraceTab";
import { mockScanResult } from "../data/mockScanResult";

interface ResultsProps {
  latestResult: ScanResult | null;
  previewMode: boolean;
}

export function Results({ latestResult, previewMode }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const result = useMemo(() => latestResult || mockScanResult, [latestResult]);

  return (
    <div className="page results-page">
      {previewMode || !latestResult ? (
        <div className="preview-banner">
          Preview demo UI mode. Real scan routes require Bob API configuration and never fall back silently.
        </div>
      ) : null}

      <BobVerdictHero result={result} />

      <section className="metric-grid">
        <MetricCard label="Migration Readiness Score" value={`${result.readinessScore}%`} />
        <MetricCard label="Recommended Decision" value={result.recommendedDecision} />
        <MetricCard label="Business Risk Level" value={result.businessRiskLevel} />
        <MetricCard label="Human Review Items" value={String(result.humanReviewQueue.length)} />
      </section>

      <DashboardTabs activeTab={activeTab} onChange={setActiveTab} />

      <section className="tab-surface">
        {activeTab === "overview" ? <BobOverviewTab result={result} /> : null}
        {activeTab === "migrationImpact" ? <MigrationImpactFindingsTab result={result} /> : null}
        {activeTab === "humanReview" ? <HumanReviewTab result={result} /> : null}
        {activeTab === "actionPlan" ? <ActionPlanTab actionPlan={result.actionPlan} /> : null}
        {activeTab === "report" ? <MigrationReportTab result={result} /> : null}
        {activeTab === "trace" ? <BobReasoningTraceTab result={result} /> : null}
      </section>
    </div>
  );
}
