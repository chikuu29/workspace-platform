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
import { LuCheck, LuSave } from "react-icons/lu";
import { UIEngine } from "../renderer/UIEngine";
import "../widgets"; // Ensure all widgets are registered
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useFormStore } from "../store/useFormStore";


/**
 * FormView
 * Renders a tab-based form layout with a premium aesthetic.
 * Specifically designed for UI_TYPE.type === "FORM_VIEW"
 */
const FormView = ({ config }: any) => {
    console.log("FormView Config:", config);
    const layoutStyles = config?.UI_TYPE?.layoutStyles || {};
    // Premium adaptive theme colors
    const cardBg = useColorModeValue("white", "rgba(15, 23, 42, 0.8)");
    const borderColor = useColorModeValue("gray.200", "rgba(56, 189, 248, 0.1)");
    const headingColor = useColorModeValue("blue.600", "white");
    const codeBg = useColorModeValue("gray.50", "gray.900");
    const formValues = useFormStore(state => state.values);
    console.log("formValues", formValues);



    const tabs = useMemo(() => {
        return config?.UI_VIEW?.schema?.forms?.tabs || [];
    }, [config]);

    const actions = useMemo(() => {
        const buttons = config?.ACTIONS?.ACTION_BUTTONS || config?.ACTIONS?.BUTTONS || [];
        const showSave = config?.ACTIONS?.showSaveButton;

        if (showSave) {
            const saveBtn = {
                name: "save_submit_generated",
                text: "Save",
                iconName: "LuSave",
                event: "submit",
                position: "top",
                styles: {
                    variant: "outline",
                    colorPalette: "blue"
                }
            };
            return [...buttons, saveBtn];
        }
        return buttons;
    }, [config]);



    const [submittedData, setSubmittedData] = React.useState<any>(null);
    const formId = React.useId();

    const onFormSubmit = (data: any) => {
        console.log("FormView Submitted:", data);
        setSubmittedData(data);
    };

    const handleAction = (button: any) => {
        console.log("Action triggered:", button);
        if (button.event !== "submit") {
            // Handle other actions
            setSubmittedData(null); // Reset on other actions if needed
        }
    };

    if (!tabs.length) return null;

    return (
        <Box py={{ base: "8", md: "8" }} position="relative">
            <Box {...layoutStyles}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "start", md: "flex-end" }}
                    mb={{ base: "8", md: "8" }}
                    gap="6"
                >
                    <VStack align="start" gap="4">
                        <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                            {config.UI_TYPE?.title || "Data Entry"}
                        </Badge>
                        <VStack gap="1" align="start">
                            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="extrabold" letterSpacing="tight" color={headingColor}>
                                {config.UI_TYPE?.title || "Information Portal"}
                            </Heading>
                        </VStack>
                    </VStack>

                    <HStack gap="4">
                        {actions.map((btn: any, idx: number) => {
                            const isSubmit = btn.event === 'submit';
                            return (
                                <Button
                                    key={btn.name || idx}
                                    onClick={isSubmit ? undefined : () => handleAction(btn)}
                                    type={isSubmit ? "submit" : "button"}
                                    form={isSubmit ? formId : undefined}
                                    display={btn.hidden ? "none" : "flex"}
                                    {...btn?.styles}
                                >
                                    <HStack gap="2">
                                        <Text fontWeight="bold">{btn.text}</Text>
                                        {btn.iconName && (
                                            <Box>
                                                <AsyncLoadIcon iconName={btn.iconName} />
                                            </Box>
                                        )}
                                    </HStack>
                                </Button>
                            );
                        })}
                    </HStack>
                </Flex>

                {/* Main Content Card */}
                <Box
                    // bg={cardBg}
                    rounded="3xl"
                    shadow="xl"
                    border="1px solid"
                    borderColor={borderColor}
                    overflow="hidden"
                    backdropFilter="blur(10px)"
                    position="relative"
                >
                    <UIEngine
                        config={tabs}
                        tabs={tabs}
                        initialData={formValues}
                        onSubmit={onFormSubmit}
                        formId={formId}
                    >
                        <AnimatePresence mode="wait">
                            {/* RunTimeWidget handled internally */}
                        </AnimatePresence>

                        {/* <HStack gap="4" p="4" justify="flex-end">
                            {actions.map((btn: any, idx: number) => (
                                (btn.position === 'bottom') && (
                                    <Button
                                        key={`bottom-${idx}`}
                                        type="button"
                                        onClick={() => handleAction(btn)}
                                        display={btn.hidden ? "none" : "flex"}
                                        {...btn?.styles}
                                    >
                                        <HStack gap="2">
                                            <Text fontWeight="bold">{btn.text}</Text>
                                            {btn.iconName && (
                                                <Box>
                                                    <AsyncLoadIcon iconName={btn.iconName} />
                                                </Box>
                                            )}
                                        </HStack>
                                    </Button>
                                )
                            ))}
                        </HStack> */}
                    </UIEngine>
                </Box>

                {/* Submitted Data Display */}
                {submittedData && (
                    <Box mt={8} p={6} bg={cardBg} rounded="xl" shadow="lg" border="1px solid" borderColor={borderColor}>
                        <Heading size="lg" mb={4} color="green.500">Submission Successful</Heading>
                        <Box as="pre" overflowX="auto" p={4} bg={codeBg} rounded="md" fontSize="sm">
                            {JSON.stringify(submittedData, null, 2)}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default FormView;
