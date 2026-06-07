import React, { Suspense, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppLoader } from "@/features/ui/components/Loader/Loader";
import { AppRegistry } from "@/core/registry/AppRegistry";
import RequireAccess from "@/core/guards/RequireAccess";
import FallbackRenderer from "@/core/renderer/FallbackRenderer";
import { useRefreshStore } from "@/core/store/useRefreshStore";

/**
 * HandleDynamicView
 *
 * Resolves and renders the correct lazy component based on
 * the current route params (appCode + view).
 * Uses ViewRegistry for stable cached lazy resolution.
 * Falls back to WorkspacePage when no matching view exists.
 *
 * Soft-refresh: subscribes to `refreshKey` from the global store.
 * When the navbar refresh button is clicked, `refreshKey` increments,
 * changing the React key on the content wrapper and forcing a clean
 * remount of the page component — all useEffects re-run, data re-fetches.
 */
const HandleDynamicView = () => {
  const { appCode, view, params } = useParams();
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");

  // Global soft-refresh key — changes trigger a component remount
  const refreshKey = useRefreshStore((state) => state.refreshKey);
  const markRefreshComplete = useRefreshStore((state) => state.markRefreshComplete);

  const appName = useMemo(
    () => appCode || appParam || "Default",
    [appCode, appParam]
  );

  // Resolve the view component and its permissions from registry
  const resolution = useMemo(() => {
    if (!view) return null;
    return AppRegistry.resolveView(appName, view);
  }, [appName, view]);

  /**
   * After a refresh-triggered remount, signal the store that the
   * new component has mounted so the navbar spinner can stop.
   * We skip the initial mount (refreshKey === 0) to avoid a no-op call.
   */
  useEffect(() => {
    if (refreshKey > 0) {
      markRefreshComplete();
    }
  }, [refreshKey, markRefreshComplete]);

  // Fallback to WorkspacePage if no matching component found
  if (!resolution || !resolution.component) {
    const WorkspacePage = AppRegistry.resolveWorkspacePage();
    return (
      <Suspense fallback={<AppLoader />} key={`workspace-${refreshKey}`}>
        {WorkspacePage && <WorkspacePage />}
      </Suspense>
    );
  }

  const uniqueKey = `${appName}-${view || "home"}-${params || "base"}-${refreshKey}`;
  console.log("=== uniqueKey === ", uniqueKey);

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
