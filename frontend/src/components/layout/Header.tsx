import { useState } from "react";
import type { Route } from "../../utils/navigation";
import { BobBadge } from "../bob/BobBadge";
import { Navigation } from "./Navigation";

interface HeaderProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
  isAuthenticated: boolean;
  username: string;
  hasReport: boolean;
  onSignOut: () => void;
  onNewAnalysis: () => void;
}

export function Header({
  activeRoute,
  onNavigate,
  isAuthenticated,
  username,
  hasReport,
  onSignOut,
  onNewAnalysis
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="brand" onClick={() => onNavigate("/login")} aria-label="CloudShift Radar login">
          <span className="brand-mark">CS</span>
          <span>
            <strong>CloudShift Radar</strong>
            <small>Know what will break</small>
          </span>
        </button>
        {isAuthenticated && (
          <>
            <span className="header-divider">|</span>
            <span className="header-username">{username}</span>
          </>
        )}
      </div>

      {isAuthenticated && (
        <>
          <div className="header-right">
            <Navigation
              activeRoute={activeRoute}
              onNavigate={onNavigate}
              hasReport={hasReport}
              onSignOut={onSignOut}
              onNewAnalysis={onNewAnalysis}
            />
            <BobBadge />
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {mobileMenuOpen && (
            <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
              <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
                <div className="mobile-menu-main">
                  <Navigation
                    activeRoute={activeRoute}
                    onNavigate={(route) => {
                      onNavigate(route);
                      setMobileMenuOpen(false);
                    }}
                    hasReport={hasReport}
                    onSignOut={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                    onNewAnalysis={() => {
                      onNewAnalysis();
                      setMobileMenuOpen(false);
                    }}
                    isMobile={true}
                  />
                </div>
                <div className="mobile-menu-footer">
                  <BobBadge />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </header>
  );
}
