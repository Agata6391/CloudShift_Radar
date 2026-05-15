import { useEffect, useState } from "react";
import type { ScanResult } from "@cloudshift-radar/shared";
import { AppShell } from "./components/layout/AppShell";
import { Assessment } from "./routes/Assessment";
import { Home } from "./routes/Home";
import { Results } from "./routes/Results";
import { getCurrentRoute, navigateTo, type Route } from "./utils/navigation";
import { mockScanResult } from "./data/mockScanResult";

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
    navigateTo("/results");
  };

  const previewDemo = () => {
    handleScanComplete(mockScanResult, true);
  };

  return (
    <AppShell activeRoute={route} onNavigate={navigate}>
      {route === "/" ? <Home onNavigate={navigate} onPreviewDemo={previewDemo} /> : null}
      {route === "/assessment" ? <Assessment onNavigate={navigate} onScanComplete={handleScanComplete} /> : null}
      {route === "/results" ? <Results latestResult={latestResult} previewMode={previewMode} /> : null}
    </AppShell>
  );
}
