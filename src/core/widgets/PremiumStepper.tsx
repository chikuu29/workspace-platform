import React, { useRef, useState, useEffect } from "react";
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
import { useColorModeValue } from "@/components/ui/color-mode";

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
 * Now features conditional navigation arrows based on overflow.
 */
const PremiumStepper: React.FC<PremiumStepperProps> = ({
    activeStep,
    steps,
    onStepChange,
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Context-aware colors
    const inactiveCircleBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const inactiveCircleColor = useColorModeValue("gray.500", "whiteAlpha.400");
    const inactiveLabelColor = useColorModeValue("gray.500", "whiteAlpha.400");
    const navBtnColor = useColorModeValue("gray.600", "whiteAlpha.600");
    const navBtnHoverBg = useColorModeValue("gray.100", "whiteAlpha.100");
    const lineBg = useColorModeValue("gray.200", "whiteAlpha.200");

    const checkOverflow = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const hasOverflow = container.scrollWidth > container.clientWidth;
            if (hasOverflow) {
                setShowLeftArrow(container.scrollLeft > 0);
                setShowRightArrow(
                    container.scrollLeft < container.scrollWidth - container.clientWidth - 10
                );
            } else {
                setShowLeftArrow(false);
                setShowRightArrow(false);
            }
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener("resize", checkOverflow);
        return () => window.removeEventListener("resize", checkOverflow);
    }, [steps]);

    // Auto-scroll to active step
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            const activeStepElement = container.children[activeStep * 2] as HTMLElement; // *2 because of fragments/wrappers
            if (activeStepElement) {
                const scrollLeft = activeStepElement.offsetLeft - container.clientWidth / 2 + activeStepElement.clientWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: "smooth" });
            }
        }
        checkOverflow();
    }, [activeStep]);

    const handleScroll = (direction: "left" | "right") => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            setTimeout(checkOverflow, 400); // Check after animation
        }
    };

    return (
        <Flex align="center" justify="center" w="full" py="8" borderRadius={"xl"} position="relative" px="10"
            bg={useColorModeValue("gray.50/50", "white/5")}>
            {/* Left Navigation Arrow */}
            <Box position="absolute" left="0" zIndex="2">
                <IconButton
                    aria-label="Previous steps"
                    variant="ghost"
                    rounded="full"
                    opacity={showLeftArrow ? 1 : 0}
                    visibility={showLeftArrow ? "visible" : "hidden"}
                    onClick={() => handleScroll("left")}
                    color={navBtnColor}
                    _hover={{ color: useColorModeValue("blue.600", "white"), bg: navBtnHoverBg }}
                    transition="all 0.2s"
                >
                    <LuChevronLeft />
                </IconButton>
            </Box>

            <HStack
                ref={scrollContainerRef}
                p={3}
                // bg={"red"}
                borderRadius={"full"}
                gap="0"
                flex="1"
                maxW="7xl"
                overflowX="auto"
                css={{
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
                onScroll={checkOverflow}
                position="relative"
            >
                {steps.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isActive = index === activeStep;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={index}>
                            <VStack gap="3" position="relative" zIndex="1" minW="120px" flex="1">
                                <Circle
                                    size="10"
                                    bg={isActive ? "blue.500" : isCompleted ? "green.500" : inactiveCircleBg}
                                    color={isActive || isCompleted ? "white" : inactiveCircleColor}
                                    border="1px solid"
                                    borderColor={isActive ? "blue.400" : isCompleted ? "green.400" : "transparent"}
                                    shadow={isActive ? (useColorModeValue("0 0 15px rgba(59, 130, 246, 0.3)", "0 0 20px rgba(59, 130, 246, 0.5)")) : "none"}
                                    cursor="pointer"
                                    onClick={() => onStepChange(index)}
                                    transition="all 0.3s"
                                    _hover={{ transform: "scale(1.1)", bg: isActive ? "blue.600" : isCompleted ? "green.600" : useColorModeValue("gray.200", "whiteAlpha.200") }}
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
                                    color={isActive ? "blue.500" : isCompleted ? "green.500" : inactiveLabelColor}
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
                                    bg={lineBg}
                                    mt="-8" // Align with circle center (approx)
                                    position="relative"
                                    minW="20px"
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
            <Box position="absolute" right="0" zIndex="2">
                <IconButton
                    aria-label="Next steps"
                    variant="ghost"
                    rounded="full"
                    opacity={showRightArrow ? 1 : 0}
                    visibility={showRightArrow ? "visible" : "hidden"}
                    onClick={() => handleScroll("right")}
                    color={navBtnColor}
                    _hover={{ color: useColorModeValue("blue.600", "white"), bg: navBtnHoverBg }}
                    transition="all 0.2s"
                >
                    <LuChevronRight />
                </IconButton>
            </Box>
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
