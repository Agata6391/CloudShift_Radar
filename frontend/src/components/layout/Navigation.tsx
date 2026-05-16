import type { Route } from "../../utils/navigation";

interface NavigationProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
}

const links: Array<{ label: string; route: Route }> = [
  { label: "Login", route: "/login" },
  { label: "Project Input", route: "/project-input" },
  { label: "Report Dashboard", route: "/report-dashboard" }
];

export function Navigation({ activeRoute, onNavigate }: NavigationProps) {
  return (
    <nav className="nav-links" aria-label="Main navigation">
      {links.map((link) => (
        <button
          key={link.route}
          className={activeRoute === link.route ? "nav-link active" : "nav-link"}
          onClick={() => onNavigate(link.route)}
        >
          {link.label}
        </button>
      ))}
      <button className="nav-link bob-nav" onClick={() => onNavigate("/report-dashboard")}>
        Bob Analysis
      </button>
    </nav>
  );
}
