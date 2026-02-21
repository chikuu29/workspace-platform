import React, { memo, useEffect, useState } from "react";
import { Box, VStack, Skeleton, HStack, Text, SimpleGrid } from "@chakra-ui/react";
import { GETAPI } from "@/app/api";
import FallbackRenderer from "@/core/renderer/FallbackRenderer";
import ViewRenderer from "@/core/renderer/ViewRenderer";

/**
 * DashboardSkeleton
 * Visual placeholder while the configuration is being fetched.
 */
const DashboardSkeleton = memo(() => (
  <VStack gap={8} align="stretch" w="100%" p={4}>
    <Box>
      <Skeleton height="30px" width="200px" mb={4} />
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        {[...Array(3)].map((_, i) => <Skeleton key={i} height="120px" borderRadius="xl" />)}
      </SimpleGrid>
    </Box>
    <Box>
      <Skeleton height="30px" width="150px" mb={4} />
      <Skeleton height="300px" borderRadius="xl" />
    </Box>
  </VStack>
));

/**
 * GymView
 * Fetches dashboard template and delegates view selection to ViewRenderer using UI_TYPE.
 */
const GymView = memo(() => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const subscription = GETAPI({
      path: "app/ui_template",
      params: {
        pageName: "gymHomePage",
        appName: "myGym"
      },
      isPrivateApi: true,
      enableCache: false,
    }).subscribe({
      next: (res: any) => {
        if (res.success && res.result?.length > 0) {
          setConfig(res.result[0]);
        } else {
          setError(true);
        }
        setLoading(false);
      },
      error: () => {
        setError(true);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error || !config) {
    return (
      <FallbackRenderer
        reason="TEMPLATE_NOT_FOUND"
        type="gymHomePage"
      />
    );
  }

  if (!config?.UI_TYPE?.type) {
    return (
      <FallbackRenderer
        reason="MISSING_UI_TYPE"
        config={config}
      />
    );
  }

  return <ViewRenderer config={config} />;
});

GymView.displayName = "GymView";
export default GymView;
