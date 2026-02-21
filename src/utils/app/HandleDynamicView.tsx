import React, { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppLoader } from "@/features/ui/components/Loader/Loader";
import { AppRegistry } from "@/core/registry/AppRegistry";

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

  // Resolve the view component from registry (cached)
  const Component = useMemo(() => {
    if (!view) return null;
    return AppRegistry.resolveView(appName, view);
  }, [appName, view]);

  // Fallback to WorkspacePage if no matching component found
  if (!Component) {
    const WorkspacePage = AppRegistry.resolveWorkspacePage();
    return (
      <Suspense fallback={<AppLoader />}>
        {WorkspacePage && <WorkspacePage />}
      </Suspense>
    );
  }

  // Unique key ensures fresh render when route changes
  const uniqueKey = `${appName}-${view || "home"}-${params || "base"}`;

  return (
    <Suspense fallback={<AppLoader />} key={uniqueKey}>
      <Component />
    </Suspense>
  );
};

export default React.memo(HandleDynamicView);
