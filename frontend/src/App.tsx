import { useEffect, useState } from "react";
import type { ScanResult } from "@cloudshift-radar/shared";
import { AppShell } from "./components/layout/AppShell";
import { AnalysisRunning } from "./routes/AnalysisRunning";
import { Assessment } from "./routes/Assessment";
import type { ProjectInputPayload } from "./routes/Assessment";
import { Home } from "./routes/Home";
import { Results } from "./routes/Results";
import { getCurrentRoute, navigateTo, type Route } from "./utils/navigation";

const RESULT_STORAGE_KEY = "cloudshift-radar.latestResult";
const PREVIEW_STORAGE_KEY = "cloudshift-radar.previewMode";

function readStoredResult(): ScanResult | null {
  const value = window.sessionStorage.getItem(RESULT_STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as ScanResult;
  } catch {
    return null;
  }
}

export default function App() {
  const [route, setRoute] = useState<Route>(getCurrentRoute());
  const [latestResult, setLatestResult] = useState<ScanResult | null>(() => readStoredResult());
  const [previewMode, setPreviewMode] = useState(() => window.sessionStorage.getItem(PREVIEW_STORAGE_KEY) === "true");
  const [pendingScan, setPendingScan] = useState<ProjectInputPayload | null>(null);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getCurrentRoute());
    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []);

  const navigate = (nextRoute: Route) => {
    navigateTo(nextRoute);
  };

  const handleScanComplete = (result: ScanResult, preview = false) => {
    window.sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
    window.sessionStorage.setItem(PREVIEW_STORAGE_KEY, String(preview));
    setLatestResult(result);
    setPreviewMode(preview);
    navigateTo("/report-dashboard");
  };

  const handleStartAnalysis = (payload: ProjectInputPayload) => {
    setPendingScan(payload);
    navigateTo("/analysis-running");
  };

  return (
    <AppShell activeRoute={route} onNavigate={navigate}>
      {route === "/" || route === "/login" ? <Home onNavigate={navigate} /> : null}
      {route === "/project-input" || route === "/assessment" ? (
        <Assessment onNavigate={navigate} onStartAnalysis={handleStartAnalysis} />
      ) : null}
      {route === "/analysis-running" ? (
        <AnalysisRunning pendingScan={pendingScan} onComplete={handleScanComplete} onNavigate={navigate} />
      ) : null}
      {route === "/report-dashboard" || route === "/results" ? (
        <Results latestResult={latestResult} previewMode={previewMode} />
      ) : null}
    </AppShell>
  );
}
