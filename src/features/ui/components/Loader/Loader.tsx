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
          borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
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

// ─── AppLoader (Suspense fallback / initial page load) ───────────────
/**
 * Full-page loader used as Suspense fallback and initial app load.
 * Features a simulated progress bar, orbital spinner, and animated text.
 */
export const AppLoader = memo(() => {
  const [progress, setProgress] = useState(0);
  const textColor = useColorModeValue("gray.600", "whiteAlpha.700");
  const subtleText = useColorModeValue("gray.400", "whiteAlpha.400");

  // Simulate non-linear progress for a more natural feel
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        // Slow down as we approach 100% for realistic feel
        const increment = prev < 60 ? 12 : prev < 85 ? 5 : 2;
        return Math.min(prev + increment, 100);
      });
    }, 400);

    return () => clearInterval(timer);
  }, []);

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      height="100vh"
      bg="bg.default"
      css={{ animation: "loader-fade-in 0.3s ease-out" }}
    >
      <VStack gap={8}>
        {/* Logo with pulse */}
        <Box css={{ animation: "loader-pulse 2.5s ease-in-out infinite" }}>
          <Image
            src="/assets/icons/logo.png"
            alt="Workspace Logo"
            h="56px"
            w="auto"
            objectFit="contain"
          />
        </Box>

        {/* Spinner */}
        <OrbitalSpinner size="56px" />

        {/* Text */}
        <VStack gap={2}>
          <Text
            fontSize="md"
            fontWeight="600"
            color={textColor}
            textAlign="center"
            css={{
              background:
                "linear-gradient(90deg, currentColor 25%, transparent 50%, currentColor 75%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              animation: "loader-shimmer 3s linear infinite",
            }}
          >
            Preparing your workspace...
          </Text>
          <Text fontSize="xs" color={subtleText}>
            This will only take a moment
          </Text>
        </VStack>

        {/* Progress Bar */}
        <Box w="240px">
          <Progress.Root
            value={progress}
            size="xs"
            colorPalette="brand"
          >
            <Progress.Track
              borderRadius="full"
              bg={useColorModeValue("gray.100", "whiteAlpha.100")}
            >
              <Progress.Range
                borderRadius="full"
                transition="width 0.4s ease"
              />
            </Progress.Track>
          </Progress.Root>
          <Text
            fontSize="10px"
            color={subtleText}
            textAlign="center"
            mt={2}
            fontWeight="600"
            letterSpacing="wider"
          >
            {progress}%
          </Text>
        </Box>
      </VStack>
    </Flex>
  );
});

export default Loader;
