import type { Route } from "../../utils/navigation";

interface NavigationProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  hasReport: boolean;
  onSignOut: () => void;
  onNewAnalysis: () => void;
  isMobile?: boolean;
}

export function Navigation({
  activeRoute,
  onNavigate,
  hasReport,
  onSignOut,
  onNewAnalysis,
  isMobile = false
}: NavigationProps) {
  // Determine states based on current route
  const isProjectInput = activeRoute === "/project-input" || activeRoute === "/assessment";
  const isAnalysisRunning = activeRoute === "/analysis-running";
  const isReportDashboard = activeRoute === "/report-dashboard" || activeRoute === "/results";

  // New analysis states
  const newAnalysisActive = isProjectInput;
  const newAnalysisDisabled = isAnalysisRunning;

  // Current report states
  const currentReportActive = isReportDashboard;
  const currentReportDisabled = isProjectInput || isAnalysisRunning || !hasReport;

  const handleNewAnalysisClick = () => {
    if (!newAnalysisDisabled) {
      onNewAnalysis();
    }
  };

  const handleCurrentReportClick = () => {
    if (!currentReportDisabled) {
      onNavigate("/report-dashboard");
    }
  };

  const navClass = isMobile ? "nav-links-mobile" : "nav-links";

  return (
    <nav className={navClass} aria-label="Main navigation">
      <button
        className={`nav-link ${newAnalysisActive ? "active" : ""} ${newAnalysisDisabled ? "disabled" : ""}`}
        onClick={handleNewAnalysisClick}
        disabled={newAnalysisDisabled}
        aria-current={newAnalysisActive ? "page" : undefined}
        aria-disabled={newAnalysisDisabled}
      >
        New analysis
      </button>

      <button
        className={`nav-link ${currentReportActive ? "active" : ""} ${currentReportDisabled ? "disabled" : ""}`}
        onClick={handleCurrentReportClick}
        disabled={currentReportDisabled}
        aria-current={currentReportActive ? "page" : undefined}
        aria-disabled={currentReportDisabled}
      >
        Current report
      </button>

      <button
        className="nav-link"
        onClick={onSignOut}
      >
        Sign out
      </button>
    </nav>
  );
}
