import React from "react";
import {
    Box,
    Heading,
    Text,
    Button,
    Container,
    VStack,
    Icon,
    Flex,
    Circle,
} from "@chakra-ui/react";
import { Link, useLocation } from "react-router";
import { LuShieldAlert, LuArrowLeft, LuRefreshCw } from "react-icons/lu";

/**
 * AuthError Component
 * Displays a professional error message when authentication or token exchange fails.
 */
const AuthError = () => {
    const location = useLocation();
    const errorDetail = location.state?.message || "We encountered an unexpected issue while verifying your credentials.";

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minH="80vh"
            bg="transparent"
        >
            <Container maxW="container.sm" textAlign="center">
                <VStack gap={8} p={10} borderRadius="3xl" bg="rgba(255, 255, 255, 0.02)" backdropFilter="blur(10px)" border="1px solid" borderColor="whiteAlpha.100">
                    <Circle size="80px" bg="red.500/10" border="1px solid" borderColor="red.500/20">
                        <Icon as={LuShieldAlert} boxSize="40px" color="red.400" />
                    </Circle>

                    <VStack gap={3}>
                        <Heading as="h2" size="xl" fontWeight="800" letterSpacing="tight" color="white">
                            Authentication Failed
                        </Heading>
                        <Text fontSize="md" color="whiteAlpha.600" maxW="sm">
                            {errorDetail}
                        </Text>
                    </VStack>

                    <Flex gap={4} direction={{ base: "column", sm: "row" }} w="full" justify="center">
                        <Button
                            asChild
                            size="lg"
                            variant="outline"
                            colorPalette="whiteAlpha"
                            borderRadius="xl"
                            px={8}
                        >
                            <Link to="/auth/login">
                                <Icon as={LuArrowLeft} mr={2} />
                                Back to Login
                            </Link>
                        </Button>

                        <Button
                            size="lg"
                            colorPalette="teal"
                            borderRadius="xl"
                            px={8}
                            onClick={() => window.location.href = "/auth/login"}
                        >
                            <Icon as={LuRefreshCw} mr={2} />
                            Retry Login
                        </Button>
                    </Flex>

                    <Box pt={4}>
                        <Text fontSize="xs" color="whiteAlpha.400">
                            Technical details: {location.state?.type || "OAUTH_EXCHANGE_FAILURE"}
                        </Text>
                    </Box>
                </VStack>
            </Container>
        </Box>
    );
};

export default AuthError;
