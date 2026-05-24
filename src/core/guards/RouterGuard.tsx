import React from "react";
import { Navigate, useLocation, useParams } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import Loader from "@/features/ui/components/Loader/Loader";
import FallbackRenderer from "../renderer/FallbackRenderer";
import { GetNavMenuConfig } from "@/core/utils/services/appServices";

interface RouterGuardProps {
  children: React.ReactNode;
}

/**
 * RouterGuard
 *
 * Replaces PrivateRoute. Provides:
 * 1. Authentication Check (redirects to /auth/login if not logged in).
 * 2. Strict Tenant URL Isolation (prevents traversing to another organization's URLs).
 */
const RouterGuard: React.FC<RouterGuardProps> = ({ children }) => {
  console.info("=== ROUTERGAURD ===");
  GetNavMenuConfig();
  const location = useLocation();
  const params = useParams();

  // Read the active tenant and authentication state from Redux
  const authState = useSelector((state: RootState) => state.auth);
  const isLoading = authState.isLoading;
  const isAuthenticated = authState.isAuthenticated;
  const authRes = authState.authRes;
  const organizations = useSelector((state: RootState) => state.organizations);
  const activeOrganizationName = organizations?.organization?.name;
  const user_type = useSelector((state: RootState) => state.rbac.user_type);

  // 1. Wait for hydration
  if (isLoading) {
    return <Loader />;
  }

  // 2. Enforce Authentication
  if (!authRes?.success || !isAuthenticated) {
    // If the user is unauthenticated, ensure they get pushed to /auth/login,
    // unless they are explicitly already trying to get to an /auth route.
    if (!location.pathname.startsWith("/auth")) {
      const loginRedirect = `/auth/login?redirect=${encodeURIComponent(
        location.pathname + location.search,
      )}`;
      return <Navigate to={loginRedirect} replace />;
    }
  }

  // 3. Enforce Tenant URL Strict Isolation
  // If the route has an :organization_name parameter, verify it matches the Redux state
  const routeOrgName = params.organization_name;

  if (routeOrgName && activeOrganizationName) {
    if (routeOrgName.toLowerCase() !== activeOrganizationName.toLowerCase()) {
      console.warn(
        `[RouterGuard] Tenant Isolation Violation: Attempted to access URL for '${routeOrgName}' while active session is '${activeOrganizationName}'. Blocked.`,
      );
      // Block access and show the FallbackRenderer instead of hard redirect
      return <FallbackRenderer reason="UNAUTHORIZED" type={routeOrgName} />;
    }
  } else if (routeOrgName && !activeOrganizationName) {
    // Edge Case: URL requires an org, but Redux doesn't have one (e.g. ghost org state)
    // Push them back to the app selector
    return <Navigate to={`/myApps`} replace />;
  }

  // 4. Enforce App Subscription Access Strict Isolation
  const pathParts = location.pathname.split("/");
  const workspaceIndex = pathParts.indexOf("workspace");
  if (workspaceIndex !== -1 && pathParts[workspaceIndex + 1] === "app") {
    const app_slug: string = pathParts[workspaceIndex + 2];
    const subscribed_apps = organizations?.organization?.subscribed_apps || [];
    console.log("subscribed_apps", subscribed_apps);
    // If navigating to a specific provisioned app block (e.g. APP_b2b54e)
    // const apps = orgApps || {};
    if (app_slug && !subscribed_apps?.includes(app_slug)) {
      if (user_type !== "SYSTEM") {
        console.warn(
          `[RouterGuard] App Access Violation: Attempted to access app '${app_slug}' which is not in the organization's subscription.`,
        );
        return <FallbackRenderer reason="UNAUTHORIZED" type={app_slug} />;
      }
    }
  }

  // Passed all guards
  return <>{children}</>;
};

export default RouterGuard;
