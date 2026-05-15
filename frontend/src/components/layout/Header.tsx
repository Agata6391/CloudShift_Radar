import type { Route } from "../../utils/navigation";
import { BobBadge } from "../bob/BobBadge";
import { Navigation } from "./Navigation";

interface HeaderProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
}

export function Header({ activeRoute, onNavigate }: HeaderProps) {
  return (
    <header className="app-header">
      <button className="brand" onClick={() => onNavigate("/")} aria-label="CloudShift Radar home">
        <span className="brand-mark">CS</span>
        <span>
          <strong>CloudShift Radar</strong>
          <small>Know what will break</small>
        </span>
      </button>
      <Navigation activeRoute={activeRoute} onNavigate={onNavigate} />
      <BobBadge />
    </header>
  );
}
