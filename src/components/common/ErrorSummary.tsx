
import React from 'react';
import { Box, Heading, Text, VStack, HStack, Icon, List, Separator } from "@chakra-ui/react";
import { FaExclamationTriangle, FaCircle } from "react-icons/fa";
import { ParsedError } from "@/utils/apiErrorParser";

interface ErrorSummaryProps {
    error: ParsedError | null;
}

export const ErrorSummary: React.FC<ErrorSummaryProps> = ({ error }) => {
    if (!error) return null;

    return (
        <Box
            bg="red.50"
            _dark={{ bg: "red.900/20" }}
            border="1px solid"
            borderColor="red.200"
            // _dark={{ borderColor: "red.800" }}
            borderRadius="lg"
            p={4}
            mb={6}
        >
            <VStack align="start" gap={3}>
                <HStack gap={3} align="start">
                    <Icon as={FaExclamationTriangle} color="red.500" mt={1} />
                    <VStack align="start" gap={1}>
                        <Heading size="sm" color="red.700" _dark={{ color: "red.300" }}>
                            {error.summary}
                        </Heading>
                        {/* {error.issues.length === 0 && (
                            <Text fontSize="sm" color="red.600" _dark={{ color: "red.400" }}>
                                Please check your inputs and try again.
                            </Text>
                        )} */}
                    </VStack>
                </HStack>

                {error.issues.length > 0 && (
                    <>
                        <Separator borderColor="red.200" _dark={{ borderColor: "red.800" }} />
                        <List.Root gap={2} variant="plain" w="full">
                            {error.issues.map((issue, index) => (
                                <List.Item key={index} alignItems="start">
                                    <HStack align="start" gap={2}>
                                        <Icon as={FaCircle} color="red.400" mt={1.5} boxSize={2} />
                                        <Text fontSize="sm" color="red.700" _dark={{ color: "red.300" }}>
                                            <Text as="span" fontWeight="bold">{issue.field}: </Text>
                                            {issue.message}
                                        </Text>
                                    </HStack>
                                </List.Item>
                            ))}
                        </List.Root>
                    </>
                )}
            </VStack>
        </Box>
    );
};
