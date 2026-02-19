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
import { FormProvider, useForm } from "react-hook-form";
import { LuCheck, LuSave } from "react-icons/lu";
import RunTimeWidgetRender from "../widgets/RunTimeWidget";
import "../widgets"; // Ensure all widgets are registered
import { ScriptProvider } from "../../features/ui/components/contexts/ScriptProvider";

/**
 * FormView
 * Renders a tab-based form layout with a premium aesthetic.
 * Specifically designed for UI_TYPE.type === "FORM_VIEW"
 */
const FormView = ({ config }: any) => {
    // Premium adaptive theme colors
    const cardBg = useColorModeValue("white", "rgba(15, 23, 42, 0.8)");
    const textColor = useColorModeValue("gray.800", "white");
    const mutedTextColor = useColorModeValue("gray.600", "whiteAlpha.600");
    const borderColor = useColorModeValue("gray.200", "rgba(56, 189, 248, 0.1)");
    const accentColor = "#3B82F6"; // Vibrant blue

    const tabs = useMemo(() => {
        return config?.UI_VIEW?.schema?.forms?.tabs || [];
    }, [config]);

    const scriptFiles = useMemo(() => {
        return config?.scripts?.files || [];
    }, [config]);

    const methods = useForm({
        mode: "onChange",
        defaultValues: {},
    });

    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const onFormSubmit = (data: any) => {
        console.log("FormView Submitted:", data);
        setIsSubmitted(true);
    };

    const handleReset = useCallback(() => {
        setIsSubmitted(false);
        methods.reset();
    }, [methods]);

    if (!tabs.length) return null;

    return (
        <Box
            minH="100vh"
            color={textColor}
            py={{ base: "8", md: "12" }}
            position="relative"
            m="-6" // Overcome default padding
            px="6"
        >
            <Box mx="auto" maxW="7xl">
                {/* Header Section */}
                <VStack mb={{ base: "8", md: "12" }} textAlign="center" gap="4">
                    <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                        {config.UI_TYPE?.title || "Data Entry"}
                    </Badge>
                    <VStack gap="1">
                        <Heading size={{ base: "xl", md: "3xl" }} fontWeight="extrabold" letterSpacing="tight" color={useColorModeValue("blue.600", "white")}>
                            {config.UI_TYPE?.title || "Information Portal"}
                        </Heading>
                        <Text color={mutedTextColor} fontSize="lg" maxW="2xl" mx="auto">
                            {isSubmitted
                                ? "Form submitted successfully."
                                : config.UI_TYPE?.description || "Complete the sections below."}
                        </Text>
                    </VStack>
                </VStack>

                {/* Main Content Card */}
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
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onFormSubmit)}>
                            <ScriptProvider scriptFiles={scriptFiles}>
                                <AnimatePresence mode="wait">
                                    {!isSubmitted ? (
                                        <motion.div
                                            key="form-content"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                        >
                                            {/* We pass tabs directly to RunTimeWidgetRender which handles the TabsWidget */}
                                            <RunTimeWidgetRender
                                                configs={[]}
                                                tabs={tabs}
                                            />

                                            {/* Footer Actions */}
                                            <Box p="6" mt="4" borderTop="1px solid" borderColor={borderColor} bg="rgba(255,255,255,0.02)">
                                                <Flex justify="flex-end">
                                                    <Button
                                                        type="submit"
                                                        bg={accentColor}
                                                        color="white"
                                                        size="lg"
                                                        px="12"
                                                        rounded="xl"
                                                        shadow={`0 10px 20px ${accentColor}44`}
                                                        _hover={{ bg: "blue.600", transform: "translateY(-1px)" }}
                                                        _active={{ transform: "translateY(0)" }}
                                                    >
                                                        <HStack gap="2">
                                                            <Text>Submit Form</Text>
                                                            <LuSave />
                                                        </HStack>
                                                    </Button>
                                                </Flex>
                                            </Box>
                                        </motion.div>
                                    ) : (
                                        /* Success State */
                                        <motion.div
                                            key="success-state"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                        >
                                            <VStack gap="6" py="20">
                                                <Circle size="20" bg="green.500/20" color="green.500" border="2px solid" borderColor="green.500">
                                                    <LuCheck size="40" />
                                                </Circle>
                                                <VStack gap="2">
                                                    <Heading size="lg" color={textColor}>Submission Received</Heading>
                                                    <Text color={mutedTextColor}>Thank you for providing the information.</Text>
                                                </VStack>
                                                <Button
                                                    variant="outline"
                                                    borderColor={borderColor}
                                                    color={textColor}
                                                    onClick={handleReset}
                                                    size="lg"
                                                    px="10"
                                                    rounded="xl"
                                                >
                                                    New Submission
                                                </Button>
                                            </VStack>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </ScriptProvider>
                        </form>
                    </FormProvider>
                </Box>
            </Box>
        </Box>
    );
};

export default FormView;
