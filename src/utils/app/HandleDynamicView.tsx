import React, { lazy, Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppLoader } from "@/features/ui/components/Loader/Loader";
import componentConfig from "@/componentConfig";

// Cache for lazy components to prevent re-creation and unmounting
const componentCache = new Map<string, React.LazyExoticComponent<any>>();
const getLazyComponent = (importFn: any, key: string) => {
  if (!componentCache.has(key)) {
    componentCache.set(key, lazy(importFn));
  }
  return componentCache.get(key);
};

const HandleDynamicView = () => {
  const { appCode, view, params } = useParams(); // Access params from the URL
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");

  const appName = useMemo(() => appCode || appParam || "Default", [appCode, appParam]);

  const appConfig = useMemo(() => componentConfig[appName], [appName]);

  // Safely access the component based on the view
  const Component = useMemo(() => {
    if (!appConfig || typeof appConfig !== "object") return null;

    // Use view as primary and params as secondary if needed
    if (view && view in appConfig) {
      const cacheKey = `${appName}-${view}`;
      return getLazyComponent(appConfig[view], cacheKey);
    }
    return null;
  }, [view, appConfig, appName]);

  // If the component doesn't exist, redirect to the 404 page
  if (!Component) {
    // Fallback to Universal WorkspacePage
    const WorkspacePage = getLazyComponent((componentConfig["Default"] as any)["workspacePage"], "Default-workspacePage");
    return (
      <Suspense fallback={<AppLoader />}>
        {WorkspacePage && <WorkspacePage />}
      </Suspense>
    );
  }

  // Use a more unique key that includes app, view and any additional path parameters
  const uniqueKey = `${appName}-${view || "home"}-${params || "base"}`;

  return (
    <Suspense fallback={<AppLoader />} key={uniqueKey}>
      <Component /> {/* Render the lazy-loaded component */}
    </Suspense>
  );
};

export default React.memo(HandleDynamicView);
