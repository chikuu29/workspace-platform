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
import RunTimeWidgetRender from "../renderer/RunTimeWidget";
import "../widgets"; // Ensure all widgets are registered
import { ScriptProvider } from "../../features/ui/components/contexts/ScriptProvider";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";

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
    const textColor = useColorModeValue("gray.800", "white");
    const mutedTextColor = useColorModeValue("gray.600", "whiteAlpha.600");
    const borderColor = useColorModeValue("gray.200", "rgba(56, 189, 248, 0.1)");
    const accentColor = "#3B82F6"; // Vibrant blue

    const tabs = useMemo(() => {
        return config?.UI_VIEW?.schema?.forms?.tabs || [];
    }, [config]);

    const actions = useMemo(() => {
        return config?.ACTIONS?.BUTTONS || [];
    }, [config]);

    const scriptFiles = useMemo(() => {
        return config?.scripts?.files || [];
    }, [config]);

    const methods = useForm({
        mode: "onChange",
        defaultValues: {},
    });



    const onFormSubmit = (data: any) => {
        console.log("FormView Submitted:", data);

    };

    const handleAction = (button: any) => {
        if (button.event === "submit") {
            methods.handleSubmit(onFormSubmit)();
        } else {
            console.log(`Action triggered: ${button.event}`, methods.getValues());
            // Potential for draft saving etc.
        }
    };

    const handleReset = useCallback(() => {

        methods.reset();
    }, [methods]);

    if (!tabs.length) return null;

    return (
        <Box
            py={{ base: "8", md: "8" }}
            position="relative"
        >
            <Box  {...layoutStyles}>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    justify="space-between"
                    align={{ base: "start", md: "flex-end" }}
                    mb={{ base: "8", md: "12" }}
                    gap="6"
                >
                    <VStack align="start" gap="4">
                        <Badge variant="subtle" colorPalette="blue" px="3" py="1" rounded="full" textTransform="uppercase" fontSize="10px" letterSpacing="widest">
                            {config.UI_TYPE?.title || "Data Entry"}
                        </Badge>
                        <VStack gap="1" align="start">
                            <Heading size={{ base: "xl", md: "2xl" }} fontWeight="extrabold" letterSpacing="tight" color={useColorModeValue("blue.600", "white")}>
                                {config.UI_TYPE?.title || "Information Portal"}
                            </Heading>

                        </VStack>
                    </VStack>


                    <HStack gap="4">
                        {actions.map((btn: any, idx: number) => (
                            <Button
                                key={btn.name || idx}
                                onClick={() => handleAction(btn)}
                                _active={{ transform: "translateY(0)" }}
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
                        ))}

                    </HStack>

                </Flex>

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

                                    </motion.div>

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
