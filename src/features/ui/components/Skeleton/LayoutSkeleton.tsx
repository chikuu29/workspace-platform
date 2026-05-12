import React, { memo } from "react";
import { Box, Flex, VStack, HStack } from "@chakra-ui/react";
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";

/**
 * LayoutSkeleton
 * A premium, modern skeleton loader with glassmorphic effects and 
 * theme-aligned colors. Mirrors the high-fidelity SaaS dashboard layout.
 */
const LayoutSkeleton = memo(() => {
  const panelBg = useColorModeValue(
    "rgba(255, 255, 255, 0.4)",
    "rgba(27, 37, 75, 0.4)"
  );
  const borderColor = useColorModeValue(
    "rgba(99, 102, 241, 0.1)",
    "rgba(255, 255, 255, 0.05)"
  );
  const sidebarBg = useColorModeValue(
    "rgba(255, 255, 255, 0.6)",
    "rgba(17, 28, 68, 0.6)"
  );

  return (
    <Flex h="100vh" direction="column" bg="bg.default">
      {/* Navbar skeleton - Glassmorphic */}
      <Flex
        h="72px"
        w="100%"
        px={6}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor={borderColor}
        bg={panelBg}
        backdropFilter="blur(12px)"
        zIndex="999"
      >
        <HStack gap={4}>
          <SkeletonCircle size="40px" />
          <Skeleton w="140px" h="24px" borderRadius="lg" />
        </HStack>
        <HStack gap={4}>
          <HStack gap={2} display={{ base: "none", md: "flex" }} mr={4}>
            <Skeleton w="80px" h="14px" borderRadius="md" />
            <Skeleton w="80px" h="14px" borderRadius="md" />
            <Skeleton w="80px" h="14px" borderRadius="md" />
          </HStack>
          <SkeletonCircle size="36px" />
          <SkeletonCircle size="36px" />
          <SkeletonCircle size="36px" />
        </HStack>
      </Flex>

      <Flex flex="1" overflow="hidden">
        {/* Sidebar skeleton (desktop only) - More sophisticated sectioning */}
        <Box
          display={{ base: "none", xl: "block" }}
          w="280px"
          borderRight="1px solid"
          borderColor={borderColor}
          bg={sidebarBg}
          backdropFilter="blur(10px)"
          p={5}
          flexShrink={0}
        >
          <VStack gap={6} align="stretch">
            {/* Nav Group 1 */}
            <VStack gap={3} align="stretch">
              <Skeleton w="60px" h="10px" borderRadius="md" mb={2} opacity={0.6} />
              {[1, 2, 3, 4].map((i) => (
                <HStack key={`nav1-${i}`} gap={3} p={2} borderRadius="xl">
                  <SkeletonCircle size="20px" />
                  <Skeleton w="100%" h="12px" borderRadius="md" />
                </HStack>
              ))}
            </VStack>

            {/* Nav Group 2 */}
            <VStack gap={3} align="stretch">
              <Skeleton w="70px" h="10px" borderRadius="md" mb={2} opacity={0.6} />
              {[1, 2, 3].map((i) => (
                <HStack key={`nav2-${i}`} gap={3} p={2} borderRadius="xl">
                  <SkeletonCircle size="20px" />
                  <Skeleton w="100%" h="12px" borderRadius="md" />
                </HStack>
              ))}
            </VStack>

            {/* User Profile Area */}
            <Box mt="auto" pt={6} borderTop="1px solid" borderColor={borderColor}>
              <HStack gap={3}>
                <SkeletonCircle size="40px" />
                <VStack align="stretch" gap={1} flex="1">
                  <Skeleton w="100px" h="12px" borderRadius="md" />
                  <Skeleton w="60px" h="10px" borderRadius="md" />
                </VStack>
              </HStack>
            </Box>
          </VStack>
        </Box>

        {/* Main content area - Bento layout skeleton */}
        <Box flex="1" p={6} overflowY="auto">
          {/* Breadcrumb & Title */}
          <VStack align="stretch" gap={2} mb={8} px={2}>
            <HStack gap={2}>
              <Skeleton w="50px" h="10px" borderRadius="md" />
              <Box w="4px" h="4px" borderRadius="full" bg="gray.400" />
              <Skeleton w="80px" h="10px" borderRadius="md" />
            </HStack>
            <Skeleton w="240px" h="32px" borderRadius="xl" />
          </VStack>

          {/* Grid Layout (Bento Style) */}
          <VStack gap={6} align="stretch">
            {/* Stats Cards Row */}
            <HStack gap={6}>
              {[1, 2, 3, 4].map((i) => (
                <Box
                  key={`stat-${i}`}
                  flex="1"
                  p={5}
                  bg={panelBg}
                  borderRadius="2xl"
                  border="1px solid"
                  borderColor={borderColor}
                  backdropFilter="blur(5px)"
                >
                  <VStack align="stretch" gap={3}>
                    <SkeletonCircle size="32px" />
                    <Skeleton w="60px" h="10px" borderRadius="md" />
                    <Skeleton w="100px" h="20px" borderRadius="md" />
                  </VStack>
                </Box>
              ))}
            </HStack>

            {/* Main Content Row */}
            <HStack gap={6} align="stretch">
              <Box
                flex="2"
                h="320px"
                p={6}
                bg={panelBg}
                borderRadius="3xl"
                border="1px solid"
                borderColor={borderColor}
                backdropFilter="blur(5px)"
              >
                <VStack align="stretch" gap={4}>
                  <Skeleton w="180px" h="20px" borderRadius="md" mb={2} />
                  <Skeleton h="200px" w="100%" borderRadius="2xl" />
                </VStack>
              </Box>
              <Box
                flex="1"
                h="320px"
                p={6}
                bg={panelBg}
                borderRadius="3xl"
                border="1px solid"
                borderColor={borderColor}
                backdropFilter="blur(5px)"
              >
                <VStack align="stretch" gap={4}>
                  <Skeleton w="120px" h="20px" borderRadius="md" mb={2} />
                  {[1, 2, 3, 4].map((i) => (
                    <HStack key={`list-${i}`} gap={3}>
                      <SkeletonCircle size="32px" />
                      <VStack align="stretch" gap={2} flex="1">
                        <Skeleton w="100%" h="10px" borderRadius="md" />
                        <Skeleton w="60%" h="8px" borderRadius="md" />
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </HStack>

            {/* Bottom Row */}
            <Box
              h="240px"
              p={6}
              bg={panelBg}
              borderRadius="3xl"
              border="1px solid"
              borderColor={borderColor}
              backdropFilter="blur(5px)"
            >
              <VStack align="stretch" gap={4}>
                <Skeleton w="200px" h="20px" borderRadius="md" />
                <HStack gap={4} h="140px">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={`chart-${i}`} flex="1" h="100%" borderRadius="xl" />
                  ))}
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
});

export default LayoutSkeleton;
