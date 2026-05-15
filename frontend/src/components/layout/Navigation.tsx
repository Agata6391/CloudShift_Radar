import type { Route } from "../../utils/navigation";

interface NavigationProps {
  activeRoute: Route;
  onNavigate: (route: Route) => void;
}

const links: Array<{ label: string; route: Route }> = [
  { label: "Product", route: "/" },
  { label: "Assessment", route: "/assessment" },
  { label: "Results", route: "/results" }
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
      <button className="nav-link bob-nav" onClick={() => onNavigate("/results")}>
        Bob Analysis
      </button>
    </nav>
  );
}
