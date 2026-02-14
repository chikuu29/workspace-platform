// components/layouts/DynamicLayout.tsx
import React, { Suspense, useMemo } from "react";
import { lazy } from "react";
import { useSearchParams } from "react-router";
import componentConfig from "../../componentConfig";
import { Skeleton, VStack } from "@chakra-ui/react";
const LayoutSkeleton = () => (
  <VStack gap={4} p={6}>
    <Skeleton height="40px" width="80%" />
    <Skeleton height="20px" width="60%" />
    <Skeleton height="400px" width="100%" />
  </VStack>
);
// Fallback layout if config or load fails
const FallbackLayout = () => <div>Layout not found</div>;

const DynamicLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const appName = searchParams.get("app") || "Default";
  const appConfig = componentConfig[appName];

  const LayoutComponent = useMemo(() => {
    if (
      !appConfig ||
      typeof appConfig !== "object" ||
      !("layout" in appConfig)
    ) {
      console.warn(`Layout config not found for app: "${appName}"`);
      return FallbackLayout;
    }

    try {
      return lazy(appConfig.layout);
    } catch (err) {
      console.error("Error lazy loading layout for:", appName, err);
      return FallbackLayout;
    }
  }, [appName]);

  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <LayoutComponent />
    </Suspense>
  );
};

export default React.memo(DynamicLayout);
