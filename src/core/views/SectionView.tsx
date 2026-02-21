import React, { useMemo, useCallback } from "react";
import {
    Box,
    Flex,
    Heading,
    Icon,
    Text,
    VStack,
    HStack,
    Button,
    Circle,
    Badge,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion, AnimatePresence } from "framer-motion";
import PremiumStepper from "../widgets/PremiumStepper";
import { LuArrowRight, LuArrowLeft, LuCheck } from "react-icons/lu";
import { UIEngine } from "../renderer/UIEngine";
import "../widgets"; // Ensure all widgets are registered
import { useFormStore } from "../store/useFormStore";
import ApiResponseModalAlert from "../components/ApiResponseModalAlert";
import type { AppAlertPayload } from "../utils/apiResponseAlert";


const SectionView = ({ config }: any) => {
    // Premium adaptive theme colors
    const cardBg = useColorModeValue("white", "rgba(15, 23, 42, 0.8)");
    const textColor = useColorModeValue("gray.800", "white");
    const mutedTextColor = useColorModeValue("gray.600", "whiteAlpha.600");
    const borderColor = useColorModeValue("gray.200", "rgba(56, 189, 248, 0.1)");
    const separatorColor = useColorModeValue("gray.100", "rgba(255, 255, 255, 0.05)");
    const accentColor = "#3B82F6"; // Vibrant blue

    const [step, setStep] = React.useState(0);
    const formValues = useFormStore(state => state.values);

    // Alert Modal State
    const [actionFeedback, setActionFeedback] = React.useState<AppAlertPayload | null>(null);
    const [isResponseModalOpen, setIsResponseModalOpen] = React.useState(false);

    const sections = useMemo(() => {
        return config?.UI_VIEW?.schema?.sections || [];
    }, [config]);



    const handleStepChange = useCallback((newStep: number) => {
        if (newStep >= 0 && newStep <= sections.length) { // Allow going to completion step
            setStep(newStep);
        }
    }, [sections.length]);

    const handleReset = useCallback(() => {
        setStep(0);
        // Note: We might want to clear store values here too if needed
    }, []);

    const onFormSubmit = (data: any) => {
        console.log("Step Submitted:", data);
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (step < sections.length - 1) {
            handleStepChange(step + 1);
        } else {
            handleStepChange(sections.length); // Go to success screen
        }
    };

    if (!sections.length) return null;

    return (

        <Box
            minH="100vh"
            // bg={pageBg}
            color={textColor}
            py={{ base: "8", md: "12" }}
            position="relative"
            m="-6" // Overcome default padding if any to fill screen
            px="6"
        >
            <Box mx="auto" maxW="7xl">

                <VStack mb={{ base: "8", md: "16" }} textAlign="center" gap="4">
                    <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                        {config.UI_TYPE?.title || "Registration Flow"}
                    </Badge>
                    <VStack gap="1">
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="extrabold" letterSpacing="tight" color={useColorModeValue("blue.600", "white")}>
                            {config.UI_TYPE?.title || "Member Onboarding"}
                        </Heading>
                        <Text color={mutedTextColor} fontSize="lg" maxW="2xl" mx="auto">
                            {step === sections.length
                                ? "Registration complete! Thank you."
                                : config.UI_TYPE?.description || "Fill in the details below."}
                        </Text>
                    </VStack>
                </VStack>

                {/* 2. Premium Stepper (Outside the card) */}
                <Box mb="5">
                    <PremiumStepper
                        activeStep={step}
                        steps={sections}
                        onStepChange={handleStepChange}
                    />
                </Box>

                {/* 3. Main Content Card with holistic animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: -40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{ width: '100%' }}
                    >
                        <Box
                            bg={cardBg}
                            rounded="3xl"
                            shadow="xl"
                            border="1px solid"
                            borderColor={borderColor}
                            overflow="hidden"
                            backdropFilter="blur(10px)"
                            position="relative"
                        >
                            {/* Content Area */}
                            <Box>
                                <Box minH="300px">
                                    {step < sections.length ? (
                                        <UIEngine
                                            key={step} // Force re-mount for new step config
                                            config={sections[step].widgets}
                                            initialData={formValues}
                                            onSubmit={onFormSubmit}
                                            tabs={sections[step].tabs} // Pass tabs if UIEngine/RunTimeWidget supports them
                                        >
                                            <Box p={(!sections[step].tabs || sections[step].tabs.length === 0) ? { base: "6", md: "10" } : "0"} />

                                            {/* Footer: Premium Action Buttons */}
                                            <Box p="6" bg="rgba(255,255,255,0.02)" borderTop="1px solid" borderColor={separatorColor}>
                                                <Flex justify="space-between" align="center">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        color={mutedTextColor}
                                                        borderColor={borderColor}
                                                        _hover={{ bg: useColorModeValue("gray.50", "whiteAlpha.100"), color: textColor }}
                                                        onClick={() => handleStepChange(step - 1)}
                                                        disabled={step === 0}
                                                        size="lg"
                                                        px="8"
                                                        rounded="xl"
                                                    >
                                                        <HStack gap="2">
                                                            <LuArrowLeft />
                                                            <Text>Previous</Text>
                                                        </HStack>
                                                    </Button>

                                                    <Button
                                                        type="submit"
                                                        bg={accentColor}
                                                        color="white"
                                                        _hover={{ bg: "blue.600", transform: "translateY(-1px)" }}
                                                        _active={{ transform: "translateY(0)" }}
                                                        size="lg"
                                                        px="12"
                                                        rounded="xl"
                                                        shadow={`0 10px 20px ${accentColor}44`}
                                                    >
                                                        <HStack gap="2">
                                                            <Text>{step === sections.length - 1 ? "Complete" : "Next Step"}</Text>
                                                            <LuArrowRight />
                                                        </HStack>
                                                    </Button>
                                                </Flex>
                                            </Box>
                                        </UIEngine>

                                    ) : (
                                        /* Success State */
                                        <VStack gap="6" py="10">
                                            <Circle size="20" bg="green.500/20" color="green.500" border="2px solid" borderColor="green.500">
                                                <LuCheck size="40" />
                                            </Circle>
                                            <VStack gap="2">
                                                <Heading size="lg" color={textColor}>Success!</Heading>
                                                <Text color={mutedTextColor}>Configuration completed successfully.</Text>
                                            </VStack>
                                            <Button
                                                bg={accentColor}
                                                color="white"
                                                _hover={{ bg: "blue.600" }}
                                                onClick={handleReset}
                                                size="lg"
                                                px="10"
                                            >
                                                Restart
                                            </Button>
                                        </VStack>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </motion.div>
                </AnimatePresence>

                {/* Secure Badge & Footer Links */}
                <Flex mt="8" justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap="4" color={mutedTextColor} fontSize="xs">
                    <HStack gap="6">
                        <HStack gap="1">
                            <Icon as={LuCheck} />
                            <Text>Secure encrypted session</Text>
                        </HStack>
                        <HStack gap="1">
                            <Icon as={LuCheck} />
                            <Text>Changes autosaved 2m ago</Text>
                        </HStack>
                    </HStack>
                    <HStack gap="4">
                        <Text cursor="pointer" _hover={{ textDecoration: "underline" }}>Help Center</Text>
                        <Text cursor="pointer" _hover={{ textDecoration: "underline" }}>Documentation</Text>
                    </HStack>
                </Flex>
            </Box>

            <ApiResponseModalAlert
                payload={actionFeedback}
                open={isResponseModalOpen}
                onClose={() => setIsResponseModalOpen(false)}
            />
        </Box>
    );
};

export default SectionView;
