import { useRef } from "react";

export type DashboardTab = "overview" | "findings" | "humanReview" | "aiSummary";

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "findings", label: "Findings" },
  { id: "humanReview", label: "Human Review" },
  { id: "aiSummary", label: "AI Summary" }
];

export function DashboardTabs({ activeTab, onChange }: DashboardTabsProps) {
  const tabRefs = useRef<Record<DashboardTab, HTMLButtonElement | null>>({
    overview: null,
    findings: null,
    humanReview: null,
    aiSummary: null
  });

  const handleTabChange = (tab: DashboardTab) => {
    onChange(tab);
    tabRefs.current[tab]?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth"
    });
  };

  return (
    <div className="dashboard-tabs" role="tablist" aria-label="CloudShift Radar dashboard tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          ref={(el) => (tabRefs.current[tab.id] = el)}
          className={activeTab === tab.id ? "active" : ""}
          onClick={() => handleTabChange(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
