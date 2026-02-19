import React from "react";
import {
    Box,
    HStack,
    Icon,
    Text,
    Flex,
    Circle,
    IconButton,
} from "@chakra-ui/react";
import { LuCheck, LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface Step {
    title: string;
    iconName?: string;
}

interface PremiumStepperProps {
    activeStep: number;
    steps: Step[];
    onStepChange: (step: number) => void;
}

/**
 * PremiumStepper
 * A high-end horizontal stepper designed to match the "Project Wizard" figma aesthetic.
 */
const PremiumStepper: React.FC<PremiumStepperProps> = ({
    activeStep,
    steps,
    onStepChange,
}) => {
    return (
        <Flex align="center" justify="center" w="full" py="8" gap="4">
            {/* Left Navigation Arrow */}
            <IconButton
                aria-label="Previous step"
                variant="ghost"
                rounded="full"
                disabled={activeStep === 0}
                onClick={() => onStepChange(activeStep - 1)}
                color="whiteAlpha.600"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
            >
                <LuChevronLeft />
            </IconButton>

            <HStack gap="0" flex="1" maxW="4xl" justify="space-between" position="relative">
                {steps.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <VStack gap="3" position="relative" zIndex="1" flex="1">
                                <Circle
                                    size="10"
                                    bg={isActive ? "blue.500" : isCompleted ? "green.500" : "whiteAlpha.100"}
                                    color={isActive || isCompleted ? "white" : "whiteAlpha.400"}
                                    border="1px solid"
                                    borderColor={isActive ? "blue.400" : isCompleted ? "green.400" : "transparent"}
                                    shadow={isActive ? "0 0 20px rgba(59, 130, 246, 0.5)" : "none"}
                                    cursor="pointer"
                                    onClick={() => onStepChange(index)}
                                    transition="all 0.3s"
                                    _hover={{ transform: "scale(1.1)" }}
                                >
                                    {isCompleted ? (
                                        <LuCheck size="18" />
                                    ) : (
                                        <Text fontWeight="bold" fontSize="sm">
                                            {String(index + 1).padStart(2, "0")}
                                        </Text>
                                    )}
                                </Circle>
                                <Text
                                    fontSize="xs"
                                    fontWeight="bold"
                                    color={isActive ? "blue.400" : isCompleted ? "green.400" : "whiteAlpha.400"}
                                    textTransform="uppercase"
                                    letterSpacing="wider"
                                    textAlign="center"
                                    whiteSpace="nowrap"
                                >
                                    {step.title}
                                </Text>
                            </VStack>

                            {/* Connecting Line */}
                            {!isLast && (
                                <Box
                                    flex="1"
                                    h="1px"
                                    bg="whiteAlpha.200"
                                    mt="-8" // Align with circle center (approx)
                                    position="relative"
                                    mx="-4"
                                >
                                    <Box
                                        position="absolute"
                                        left="0"
                                        top="0"
                                        h="full"
                                        w={isCompleted ? "full" : "0%"}
                                        bg="blue.500"
                                        transition="width 0.4s ease-in-out"
                                    />
                                </Box>
                            )}
                        </React.Fragment>
                    );
                })}
            </HStack>

            {/* Right Navigation Arrow */}
            <IconButton
                aria-label="Next step"
                variant="ghost"
                rounded="full"
                disabled={activeStep === steps.length - 1}
                onClick={() => onStepChange(activeStep + 1)}
                color="whiteAlpha.600"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
            >
                <LuChevronRight />
            </IconButton>
        </Flex>
    );
};

// Helper for labels alignment
const VStack = ({ children, ...props }: any) => (
    <Flex direction="column" align="center" {...props}>
        {children}
    </Flex>
);

export default PremiumStepper;
