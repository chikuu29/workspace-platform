import React, { Suspense, useMemo, memo } from "react";
import { useParams, useSearchParams } from "react-router";
import { AppRegistry } from "@/core/registry/AppRegistry";
import { Box, Flex, Skeleton, VStack, HStack } from "@chakra-ui/react";

/**
 * LayoutSkeleton
 * A premium skeleton loader that mirrors the workspace layout structure:
 * navbar, sidebar, breadcrumb, and content area.
 * Uses the project's bg.default for seamless theme matching.
 */
const LayoutSkeleton = memo(() => (
  <Flex h="100vh" direction="column" bg="bg.default">
    {/* Navbar skeleton */}
    <Flex
      h="5.5rem"
      w="100%"
      px={4}
      align="center"
      justify="space-between"
      borderBottom="1px solid"
      borderColor="border.muted"
    >
      <HStack gap={3}>
        <Skeleton w="42px" h="42px" borderRadius="xl" />
        <Skeleton w="120px" h="36px" borderRadius="lg" />
      </HStack>
      <HStack gap={3}>
        <Skeleton w="32px" h="32px" borderRadius="full" />
        <Skeleton w="32px" h="32px" borderRadius="full" />
        <Skeleton w="32px" h="32px" borderRadius="full" />
      </HStack>
    </Flex>

    <Flex flex="1" overflow="hidden">
      {/* Sidebar skeleton (desktop only) */}
      <Box
        display={{ base: "none", xl: "block" }}
        w="260px"
        borderRight="1px solid"
        borderColor="border.muted"
        p={3}
        flexShrink={0}
      >
        <VStack gap={3} align="stretch" pt={2}>
          <Skeleton w="80px" h="12px" borderRadius="md" mb={1} />
          {[1, 2, 3, 4, 5].map((i) => (
            <HStack key={i} gap={3} px={2} py={2}>
              <Skeleton w="20px" h="20px" borderRadius="md" flexShrink={0} />
              <Skeleton w="100%" h="14px" borderRadius="md" />
            </HStack>
          ))}
          <Skeleton w="60px" h="12px" borderRadius="md" mt={4} mb={1} />
          {[1, 2, 3].map((i) => (
            <HStack key={`s2-${i}`} gap={3} px={2} py={2}>
              <Skeleton w="20px" h="20px" borderRadius="md" flexShrink={0} />
              <Skeleton w="100%" h="14px" borderRadius="md" />
            </HStack>
          ))}
        </VStack>
      </Box>

      {/* Main content area */}
      <Box flex="1" p={4}>
        <HStack gap={2} mb={6} px={2}>
          <Skeleton w="60px" h="14px" borderRadius="md" />
          <Skeleton w="8px" h="14px" borderRadius="sm" />
          <Skeleton w="80px" h="14px" borderRadius="md" />
          <Skeleton w="8px" h="14px" borderRadius="sm" />
          <Skeleton w="100px" h="14px" borderRadius="md" />
        </HStack>
        <VStack gap={4} align="stretch">
          <Skeleton h="160px" w="100%" borderRadius="2xl" />
          <HStack gap={4}>
            <Skeleton h="100px" flex="1" borderRadius="xl" />
            <Skeleton h="100px" flex="1" borderRadius="xl" />
            <Skeleton
              h="100px"
              flex="1"
              borderRadius="xl"
              display={{ base: "none", md: "block" }}
            />
          </HStack>
          <Skeleton h="200px" w="100%" borderRadius="2xl" />
        </VStack>
      </Box>
    </Flex>
  </Flex>
));

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
