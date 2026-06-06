import { Box, Flex, Text, Link, HStack, Icon, Circle } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React from "react";
import { Heart, Activity, ShieldCheck } from "lucide-react";

/**
 * AppFooter
 * A modern, premium footer with glassmorphism and refined typography.
 */
const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.500", "whiteAlpha.400");
  const activeTextColor = useColorModeValue("gray.900", "white");
  const accentColor = "#c799ff"; // Match the platform accent

  return (
    <Box
      as="footer"
      w="100%"
      borderTop="1px solid"
      borderColor={borderColor}
      bg={"app.card.bg"}
      backdropFilter="blur(10px)"
      px={{ base: "4", md: "12" }}
      py={{ base: "6", md: "0" }}
      minH={{ base: "auto", md: "14" }}
      position="relative"
    // zIndex="sticky"
    >
      <Flex
        h={{ base: "auto", md: "14" }}
        maxW="1800px"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
        gap={{ base: "6", md: "4" }}
      >
        {/* Left Side: Copyright & Branding */}
        <HStack gap="4" color={textColor} fontSize="xs" fontWeight="medium">
          <HStack gap="2">
            <Box boxSize="2" bg={accentColor} rounded="full" boxShadow={`0 0 8px ${accentColor}`} />
            <Text letterSpacing="widest" textTransform="uppercase" fontWeight="bold" color={activeTextColor}>
              SYSTEM<Text as="span" color={accentColor}>™</Text>
            </Text>
          </HStack>

          <Box h="3px" w="3px" bg={borderColor} rounded="full" display={{ base: "none", md: "block" }} />

          <Text letterSpacing="wide" display={{ base: "none", md: "block" }}>
            © {currentYear} All Rights Reserved
          </Text>

          <Box h="3px" w="3px" bg={borderColor} rounded="full" display={{ base: "none", md: "block" }} />

          <HStack gap="1" display={{ base: "none", lg: "flex" }} opacity="0.8">
            <Text>Crafted with</Text>
            <Icon as={Heart} color="red.400" boxSize="3" />
            <Text>for the workspace.</Text>
          </HStack>
        </HStack>

        {/* Middle Side: Status Indicator (Floating Glass Pill) */}
        <HStack
          gap="2.5"
          bg={useColorModeValue("green.50/80", "rgba(34, 197, 94, 0.05)")}
          px="4"
          py="1.5"
          rounded="full"
          border="1px solid"
          borderColor={useColorModeValue("green.100", "rgba(34, 197, 94, 0.2)")}
          boxShadow="sm"
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.02)", bg: useColorModeValue("green.50", "rgba(34, 197, 94, 0.1)") }}
        >
          <Box position="relative" display="flex" alignItems="center" justifyContent="center">
            <Circle size="2" bg="green.500" />
            <Circle
              size="2"
              bg="green.500"
              position="absolute"
              animation="ping 2s cubic-bezier(0, 0, 0.2, 1) infinite"
              opacity="0.75"
            />
          </Box>
          <Text fontSize="10px" fontWeight="extrabold" color="green.500" textTransform="uppercase" letterSpacing="0.2em">
            Live Status: Operational
          </Text>
        </HStack>

        {/* Right Side: Links & Verification */}
        <HStack gap={{ base: "6", lg: "8" }} color={textColor} fontSize="xs" fontWeight="bold">
          <HStack gap="6" display={{ base: "none", sm: "flex" }}>
            {["Support", "Privacy", "Terms"].map((label) => (
              <Link
                key={label}
                href="#"
                _hover={{ color: activeTextColor, transform: "translateY(-1px)" }}
                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                letterSpacing="wide"
              >
                {label}
              </Link>
            ))}
          </HStack>

          <HStack
            gap="2"
            color={useColorModeValue("blue.600", "blue.400")}
            bg={useColorModeValue("blue.50", "blue.500/10")}
            px="3"
            py="1"
            rounded="lg"
            cursor="pointer"
            transition="all 0.2s"
            _hover={{ filter: "brightness(1.1)", transform: "translateY(-1px)" }}
          >
            <Icon as={ShieldCheck} boxSize="3.5" />
            <Text fontSize="10px" textTransform="uppercase" letterSpacing="widest">Enterprise</Text>
          </HStack>
        </HStack>
      </Flex>

      {/* Mobile-only Copyright */}
      <Box display={{ base: "block", md: "none" }} textAlign="center" pt="4" pb="2" borderTop="1px solid" borderColor={borderColor}>
        <Text color={textColor} fontSize="10px" letterSpacing="wide">
          © {currentYear} SYSTEM™ · All Rights Reserved
        </Text>
      </Box>
    </Box>
  );
}

export default React.memo(AppFooter);
