export type DashboardTab =
  | "overview"
  | "findings"
  | "survival"
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
  { id: "findings", label: "Technical Findings" },
  { id: "survival", label: "Feature Survival" },
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
