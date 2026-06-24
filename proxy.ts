import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isLoginRoute = createRouteMatcher(["/admin/login"]);

// Next.js 16 "proxy" convention (the renamed middleware). The Convex Auth
// helper returns a request handler that we use as the default export.
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Protect the portal: send unauthenticated visitors to the login page.
  // (The real security boundary is requireAdmin() inside each Convex function;
  // this is just so the UI doesn't flash for logged-out users.)
  if (
    isAdminRoute(request) &&
    !isLoginRoute(request) &&
    !(await convexAuth.isAuthenticated())
  ) {
    return nextjsMiddlewareRedirect(request, "/admin/login");
  }
  // Already signed in? Skip the login page.
  if (isLoginRoute(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/admin");
  }
});

export const config = {
  // Run on everything except static files and Next internals.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
