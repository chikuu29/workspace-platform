import { useState, useEffect, memo } from "react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Flex,
  Box,
  Center,
  Text,
  VStack,
  Progress,
  Image,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

// ─── CSS Keyframes (injected once) ───────────────────────────────────
const KEYFRAMES = `
@keyframes loader-pulse {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
}
@keyframes loader-orbit {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes loader-dot-bounce {
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
}
@keyframes loader-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes loader-fade-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
`;

// Inject keyframes into document head (idempotent)
if (typeof document !== "undefined") {
  const styleId = "loader-keyframes";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
  }
}

// ─── Animated Dots Component ─────────────────────────────────────────
const LoadingDots = memo(() => (
  <Flex gap="6px" align="center" justify="center">
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        w="8px"
        h="8px"
        borderRadius="full"
        bg="brand.500"
        css={{
          animation: `loader-dot-bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
        }}
      />
    ))}
  </Flex>
));

// ─── Orbital Spinner ─────────────────────────────────────────────────
const OrbitalSpinner = memo(({ size = "48px" }: { size?: string }) => {
  const orbitColor = useColorModeValue("brand.500", "brand.400");

  return (
    <Box position="relative" w={size} h={size}>
      {/* Outer ring */}
      <Box
        position="absolute"
        inset="0"
        borderRadius="full"
        border="3px solid"
        borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
      />
      {/* Spinning arc */}
      <Box
        position="absolute"
        inset="0"
        borderRadius="full"
        border="3px solid transparent"
        borderTopColor={orbitColor}
        borderRightColor={orbitColor}
        css={{ animation: "loader-orbit 0.8s linear infinite" }}
      />
      {/* Inner pulsing dot */}
      <Center position="absolute" inset="0">
        <Box
          w="10px"
          h="10px"
          borderRadius="full"
          bg={orbitColor}
          css={{ animation: "loader-pulse 2s ease-in-out infinite" }}
        />
      </Center>
    </Box>
  );
});

// ─── Loader (Redux-driven overlay) ───────────────────────────────────
/**
 * Full-screen overlay loader triggered by Redux `loader` slice.
 * Renders a glassmorphic card with orbital spinner and loading text.
 */
const Loader = memo(() => {
  const { active, loaderText } = useSelector(
    (state: RootState) => state.loader
  );

  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.92)",
    "rgba(15, 23, 42, 0.92)"
  );
  const textColor = useColorModeValue("gray.700", "whiteAlpha.800");
  const cardBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  if (!active) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      zIndex="9999"
      bg="blackAlpha.700"
      backdropFilter="blur(8px)"
      css={{ animation: "loader-fade-in 0.2s ease-out" }}
    >
      <Center height="100vh">
        <Box
          bg={cardBg}
          backdropFilter="blur(20px)"
          borderRadius="2xl"
          p={8}
          minW="280px"
          boxShadow="0 20px 60px rgba(0,0,0,0.3)"
          border="1px solid"
          borderColor={cardBorderColor}
          css={{ animation: "loader-fade-in 0.3s ease-out" }}
        >
          <VStack gap={5}>
            <OrbitalSpinner size="52px" />
            <VStack gap={2}>
              <Text
                fontSize="sm"
                fontWeight="600"
                color={textColor}
                textAlign="center"
                maxW="220px"
              >
                {loaderText || "Loading..."}
              </Text>
              <LoadingDots />
            </VStack>
          </VStack>
        </Box>
      </Center>
    </Box>
  );
});

// ─── Segmented Progress (Bar of Box) ──────────────────────────────────
const SegmentedProgress = memo(({ value }: { value: number }) => {
  const activeColor = useColorModeValue("brand.500", "brand.400");
  const inactiveColor = useColorModeValue("gray.100", "whiteAlpha.50");
  const segments = 12; // More segments for a finer "box bar" look

  return (
    <VStack gap={3}>
      <Flex gap="4px">
        {Array.from({ length: segments }).map((_, i) => {
          const threshold = ((i + 1) / segments) * 100;
          const isActive = value >= threshold;
          return (
            <Box
              key={i}
              w="18px"
              h="10px"
              borderRadius="2px"
              bg={isActive ? activeColor : inactiveColor}
              boxShadow={isActive ? `0 0 15px var(--chakra-colors-brand-500)` : "none"}
              transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              transform={isActive ? "scaleY(1.1)" : "scaleY(1)"}
              opacity={isActive ? 1 : 0.3}
            />
          );
        })}
      </Flex>
      <Text
        fontSize="xs"
        fontWeight="bold"
        color="brand.500"
        letterSpacing="0.1em"
        fontFamily="mono"
      >
        {Math.round(value)}%
      </Text>
    </VStack>
  );
});

// ─── AppLoader (Suspense fallback / initial page load) ───────────────
/**
 * Full-page loader used as Suspense fallback and initial app load.
 * Features a modern segmented progress bar and orbital spinner.
 */
export const AppLoader = memo(() => {
  const [progress, setProgress] = useState(0);
  const textColor = useColorModeValue("gray.800", "white");
  const subtleText = useColorModeValue("gray.500", "whiteAlpha.500");

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const increment = prev < 50 ? 8 : prev < 80 ? 4 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100vh"
      bg="bg.default"
      position="relative"
      overflow="hidden"
      css={{
        animation: "loader-fade-in 0.5s ease-out",
        background: useColorModeValue(
          "radial-gradient(circle at center, white 0%, #f8fafc 100%)",
          "radial-gradient(circle at center, #0f172a 0%, #020617 100%)"
        ),
      }}
    >
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        left="-10%"
        w="40%"
        h="40%"
        borderRadius="full"
        bg="brand.500"
        filter="blur(120px)"
        opacity={0.05}
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-10%"
        w="40%"
        h="40%"
        borderRadius="full"
        bg="blue.500"
        filter="blur(120px)"
        opacity={0.05}
      />

      <VStack gap={12} zIndex={1}>
        <VStack gap={6}>
          <Box
            p={1}
            borderRadius="full"
            border="1px solid"
            borderColor="whiteAlpha.200"
            boxShadow="0 0 40px rgba(99, 102, 241, 0.1)"
          >
            <OrbitalSpinner size="64px" />
          </Box>
          <VStack gap={1}>
            <Text
              fontSize="xl"
              fontWeight="800"
              color={textColor}
              textAlign="center"
              letterSpacing="-0.02em"
            >
              System Initializing
            </Text>
            {/* <Text
              fontSize="sm"
              color={subtleText}
              fontWeight="500"
              letterSpacing="0.05em"
            >
              NEXUS SAAS ENGINE
            </Text> */}
            <Text
              fontSize="xs"
              color={subtleText}
              fontWeight="400"
              fontStyle="italic"
              opacity={0.8}
            >
              Please wait...
            </Text>
          </VStack>
        </VStack>

        <SegmentedProgress value={progress} />

        <Box mt={4}>
          <Text
            fontSize="10px"
            fontWeight="bold"
            color={subtleText}
            textTransform="uppercase"
            letterSpacing="0.2em"
            opacity={0.6}
            css={{ animation: "loader-pulse 2s infinite" }}
          >
            Decrypting workspace assets...
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
});

export default Loader;
