export type DashboardTab =
  | "overview"
  | "migrationImpact"
  | "humanReview"
  | "actionPlan"
  | "report"
  | "trace";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Bob Overview" },
  { id: "migrationImpact", label: "Migration Impact Findings" },
  { id: "humanReview", label: "Human Review" },
  { id: "actionPlan", label: "Action Plan" },
  { id: "report", label: "Migration Report" },
  { id: "trace", label: "Bob Reasoning Trace" }
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  return (
    <div className="dashboard-tabs" role="tablist" aria-label="CloudShift Radar dashboard tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => onChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
