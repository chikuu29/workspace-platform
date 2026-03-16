import React, { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppLoader } from "@/features/ui/components/Loader/Loader";
import { AppRegistry } from "@/core/registry/AppRegistry";
import RequireAccess from "@/core/guards/RequireAccess";
import FallbackRenderer from "@/core/renderer/FallbackRenderer";

/**
 * HandleDynamicView
 *
 * Resolves and renders the correct lazy component based on
 * the current route params (appCode + view).
 * Uses ViewRegistry for stable cached lazy resolution.
 * Falls back to WorkspacePage when no matching view exists.
 */
const HandleDynamicView = () => {
  const { appCode, view, params } = useParams();
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");

  const appName = useMemo(
    () => appCode || appParam || "Default",
    [appCode, appParam]
  );

  // Resolve the view component and its permissions from registry
  const resolution = useMemo(() => {
    if (!view) return null;
    return AppRegistry.resolveView(appName, view);
  }, [appName, view]);

  // Fallback to WorkspacePage if no matching component found
  if (!resolution || !resolution.component) {
    const WorkspacePage = AppRegistry.resolveWorkspacePage();
    return (
      <Suspense fallback={<AppLoader />}>
        {WorkspacePage && <WorkspacePage />}
      </Suspense>
    );
  }

  const uniqueKey = `${appName}-${view || "home"}-${params || "base"}`;
  const { component: Component, permissions, requireAll } = resolution;

  const content = (
    <Suspense fallback={<AppLoader />} key={uniqueKey}>
      <Component />
    </Suspense>
  );

  // If the view requires PBAC permissions, wrap it in a RequireAccess guard
  if (permissions) {
    return (
      <RequireAccess
        permissions={permissions}
        requireAll={requireAll}
        fallback={<FallbackRenderer reason="PBAC_UNAUTHORIZED" />}
      >
        {content}
      </RequireAccess>
    );
  }

  return content;
};

export default React.memo(HandleDynamicView);
