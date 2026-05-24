import React, { Suspense, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppRegistry } from "@/core/registry/AppRegistry";
import LayoutSkeleton from "@/features/ui/components/Skeleton/LayoutSkeleton";


/**
 * FallbackLayout — rendered when no layout config is found
 */
const FallbackLayout = () => <div>Layout not found</div>;

/**
 * DynamicLayout
 *
 * Resolves and renders the layout component for the current app
 * using ViewRegistry. Uses the centralized lazy cache — no more
 * calling lazy() inside useMemo.
 */
const DynamicLayout: React.FC = () => {
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();
  const appParam = searchParams.get("app");

  const appName = useMemo(
    () => appCode || appParam || "Default",
    [appCode, appParam]
  );

  // ViewRegistry returns a stable, cached lazy component
  const LayoutComponent = useMemo(() => {
    const resolved = AppRegistry.resolveLayout(appName);
    if (!resolved) {
      console.warn(`Layout config not found for app: "${appName}"`);
      return FallbackLayout;
    }
    return resolved;
  }, [appName]);

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutComponent />
    </Suspense>
  );
};

export default React.memo(DynamicLayout);
