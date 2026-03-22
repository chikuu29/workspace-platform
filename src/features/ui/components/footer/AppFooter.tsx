import { Box, Flex, Text, Link, HStack, Icon, Circle } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import React from "react";
import { LuHeart, LuActivity, LuShieldCheck } from "react-icons/lu";

/**
 * AppFooter
 * A modern, premium footer with glassmorphism and refined typography.
 */
const AppFooter = () => {
  const currentYear = new Date().getFullYear();
  const footerBg = useColorModeValue("white", "rgba(15, 23, 42, 0.9)");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const textColor = useColorModeValue("gray.500", "whiteAlpha.500");
  const activeTextColor = useColorModeValue("gray.800", "white");

  return (
    <Box
      as="footer"
      w="100%"
      h="14"
      borderTop="1px solid"
      borderColor={borderColor}
      bg={"app.card.bg"}
      px="8"
      position="relative"
      zIndex="sticky"
    >
      <Flex
        h="full"
        maxW="1440px"
        mx="auto"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ base: "column", md: "row" }}
        gap="4"
      >
        {/* Left Side: Copyright & Branding */}
        <HStack gap="4" color={textColor} fontSize="xs" fontWeight="medium">
          <Text letterSpacing="wider">
            © {currentYear} <Text as="span" fontWeight="bold" color={activeTextColor}>PLATFORM™</Text>
          </Text>
          <Box h="3px" w="3px" bg={textColor} rounded="full" display={{ base: "none", md: "block" }} />
          <HStack gap="1" display={{ base: "none", md: "flex" }}>
            <Text>Made with</Text>
            <Icon as={LuHeart} color="red.400" boxSize="3" />
            <Text>for the future.</Text>
          </HStack>
        </HStack>

        {/* Middle Side: Status Indicator */}
        <HStack gap="2" bg={useColorModeValue("green.50/50", "green.500/10")} px="3" py="1" rounded="full" border="1px solid" borderColor={useColorModeValue("green.100", "green.500/20")}>
          <Circle size="1.5" bg="green.500" />
          <Text fontSize="10px" fontWeight="bold" color="green.500" textTransform="uppercase" letterSpacing="widest">
            All Systems Operational
          </Text>
        </HStack>

        {/* Right Side: Links */}
        <HStack gap="6" color={textColor} fontSize="xs" fontWeight="semibold">
          <Link
            href="#"
            _hover={{ color: activeTextColor, transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Feedback
          </Link>
          <Link
            href="#"
            _hover={{ color: activeTextColor, transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            _hover={{ color: activeTextColor, transform: "translateY(-1px)" }}
            transition="all 0.2s"
          >
            Terms of Service
          </Link>
          <HStack gap="1" color="blue.500" cursor="pointer" _hover={{ filter: "brightness(1.2)" }}>
            <Icon as={LuShieldCheck} />
            <Text>Enterprise Verified</Text>
          </HStack>
        </HStack>
      </Flex>
    </Box>
  );
}

export default React.memo(AppFooter);
