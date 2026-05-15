import type { ReactNode } from "react";
import type { Route } from "../../utils/navigation";
import { Header } from "./Header";

interface AppShellProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  children: ReactNode;
}

export function AppShell({ activeRoute, onNavigate, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <Header activeRoute={activeRoute} onNavigate={onNavigate} />
      <main>{children}</main>
    </div>
  );
}
