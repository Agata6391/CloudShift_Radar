import type { ReactNode } from "react";
import type { Route } from "../../utils/navigation";
import { Header } from "./Header";

interface AppShellProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  isAuthenticated: boolean;
  username: string;
  hasReport: boolean;
  onSignOut: () => void;
  onNewAnalysis: () => void;
  children: ReactNode;
}

export function AppShell({
  activeRoute,
  onNavigate,
  isAuthenticated,
  username,
  hasReport,
  onSignOut,
  onNewAnalysis,
  children
}: AppShellProps) {
  return (
    <div className="app-shell">
      <Header
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        isAuthenticated={isAuthenticated}
        username={username}
        hasReport={hasReport}
        onSignOut={onSignOut}
        onNewAnalysis={onNewAnalysis}
      />
      <main>{children}</main>
    </div>
  );
}
