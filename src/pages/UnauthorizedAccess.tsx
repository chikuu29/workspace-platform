import {
  Box,
  Button,
  VStack,
  Heading,
  Text,
  Icon,
  Circle,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useColorModeValue } from "@/components/ui/color-mode";

const MotionBox = motion.create(Box);

/**
 * UnauthorizedAccess (403 Forbidden)
 * 
 * A premium fallback page for when a user tries to access a resource
 * they don't have PBAC/RBAC permissions for.
 */
const UnauthorizedAccess = () => {
  const navigate = useNavigate();
  
  const bg = useColorModeValue("gray.50", "#0f172a");
  const cardBg = useColorModeValue("white", "rgba(30, 41, 59, 0.7)");
  const cardBorder = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.1)");

  return (
    <Box
      minH="100vh"
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={bg}
      p={4}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative Orbs */}
      <Box
        position="absolute"
        top="-10%"
        left="-5%"
        w="400px"
        h="400px"
        bg="red.500"
        opacity="0.05"
        filter="blur(100px)"
        borderRadius="full"
      />
      <Box
        position="absolute"
        bottom="-10%"
        right="-5%"
        w="400px"
        h="400px"
        bg="indigo.500"
        opacity="0.05"
        filter="blur(100px)"
        borderRadius="full"
      />

      <MotionBox
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        maxW="lg"
        w="full"
        bg={cardBg}
        p={{ base: 8, md: 12 }}
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        backdropFilter="blur(24px)"
        boxShadow="2xl"
        textAlign="center"
        position="relative"
        zIndex={1}
      >
        <VStack gap={6}>
          <Circle
            size="80px"
            bg="red.50"
            _dark={{ bg: "rgba(239, 68, 68, 0.1)" }}
            color="red.500"
          >
            <Icon as={ShieldOff} boxSize={8} />
          </Circle>

          <VStack gap={2}>
            <Heading size="xl" fontWeight="700" letterSpacing="-0.02em" color="auth.text.primary">
              Access Denied
            </Heading>
            <Text color="auth.text.muted" fontSize="md" lineHeight="tall">
              You don't have the required permissions to view this resource. 
              If you believe this is an error, please contact your administrator.
            </Text>
          </VStack>

          <VStack w="full" gap={3} pt={4}>
            <Button
              w="full"
              size="lg"
              colorPalette="indigo"
              variant="solid"
              bg="indigo.600"
              color="white"
              _hover={{ bg: "indigo.700", transform: "translateY(-1px)", boxShadow: "lg" }}
              onClick={() => navigate(-1)}
              borderRadius="xl"
              fontWeight="600"
            >
              <ArrowLeft /> Go Back
            </Button>
            
            <Link to="/myApps" style={{ width: "100%" }}>
              <Button
                variant="outline"
                w="full"
                size="lg"
                borderColor={cardBorder}
                color="auth.text.primary"
                _hover={{ bg: "whiteAlpha.50", _dark: { bg: "whiteAlpha.100" } }}
                borderRadius="xl"
                fontWeight="500"
              >
                <Home /> Return Home
              </Button>
            </Link>
          </VStack>

          <Text fontSize="xs" color="auth.text.muted" pt={4} opacity={0.6}>
            Error Code: 403 Forbidden
          </Text>
        </VStack>
      </MotionBox>
    </Box>
  );
};

export default UnauthorizedAccess;
