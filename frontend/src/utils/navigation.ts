export type Route = "/" | "/assessment" | "/results";

const validRoutes = new Set<Route>(["/", "/assessment", "/results"]);

export function getCurrentRoute(): Route {
  const path = window.location.pathname as Route;
  return validRoutes.has(path) ? path : "/";
}

export function navigateTo(route: Route) {
  window.history.pushState({}, "", route);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
