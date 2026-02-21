import React, { useMemo, useCallback } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion, AnimatePresence } from "framer-motion";
import { UIEngine } from "../renderer/UIEngine";
import "../widgets";
import AsyncLoadIcon from "@/utils/hooks/AsyncLoadIcon";
import { useFormStore } from "../store/useFormStore";
import { appEventRegistry } from "../registry/AppEventRegistry";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "@/app/slices/loader/appLoaderSlice";

const FormView = ({ config }: any) => {
    const dispatch = useDispatch();
    const layoutStyles = config?.UI_TYPE?.layoutStyles || {};
    const cardBg = useColorModeValue("white", "rgba(15, 23, 42, 0.8)");
    const borderColor = useColorModeValue("gray.200", "rgba(56, 189, 248, 0.1)");
    const headingColor = useColorModeValue("blue.600", "white");
    const codeBg = useColorModeValue("gray.50", "gray.900");
    const formValues = useFormStore(state => state.values);

    const tabs = useMemo(() => config?.UI_VIEW?.schema?.forms?.tabs || [], [config]);

    const actionEventConfig = useMemo(() => config?.ACTIONS?.event || {}, [config]);

    const actionButtons = useMemo(() => {
        const buttons = config?.ACTIONS?.ACTION_BUTTONS || config?.ACTIONS?.BUTTONS || [];
        const showSave = config?.ACTIONS?.showSaveButton;

        if (showSave) {
            const submitButton = {
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
            return [...buttons, submitButton];
        }

        return buttons;
    }, [config]);

    const [submittedData, setSubmittedData] = React.useState<any>(null);
    const [isEventInProgress, setIsEventInProgress] = React.useState(false);
    const [pendingEventName, setPendingEventName] = React.useState<string | null>(null);
    const formId = React.useId();

    const executeFormEvent = useCallback(async (eventName: string, payload: any) => {
        if (isEventInProgress) {
            return {
                success: false,
                message: "Please wait, an action is already in progress.",
            };
        }

        setIsEventInProgress(true);
        setPendingEventName(eventName);
        dispatch(startLoading(`Processing ${eventName}...`));

        try {
            const result = await appEventRegistry.executeEvent(
                eventName,
                actionEventConfig?.[eventName],
                payload,
                config
            );

            return result;
        } finally {
            setIsEventInProgress(false);
            setPendingEventName(null);
            dispatch(stopLoading());
        }
    }, [actionEventConfig, config, dispatch, isEventInProgress]);

    const handleFormSubmit = useCallback(async (data: any) => {
        if (isEventInProgress) return;
        const result = await executeFormEvent("submit", data);
        if (result.success) {
            setSubmittedData(data);
        }
    }, [executeFormEvent, isEventInProgress]);

    const handleActionButtonClick = useCallback(async (button: any) => {
        if (!button?.event || button.event === "submit" || isEventInProgress) return;

        await executeFormEvent(button.event, formValues);
    }, [executeFormEvent, formValues, isEventInProgress]);

    if (!tabs.length) return null;

    return (
        <Box position="relative">
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
                        {actionButtons.map((btn: any, idx: number) => {
                            const isSubmit = btn.event === "submit";
                            return (
                                <Button
                                    key={btn.name || idx}
                                    onClick={isSubmit ? undefined : () => handleActionButtonClick(btn)}
                                    type={isSubmit ? "submit" : "button"}
                                    form={isSubmit ? formId : undefined}
                                    display={btn.hidden ? "none" : "flex"}
                                    loading={isEventInProgress && pendingEventName === btn.event}
                                    disabled={isEventInProgress}
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

                <Box
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
                        onSubmit={handleFormSubmit}
                        formId={formId}
                    >
                        <AnimatePresence mode="wait" />
                    </UIEngine>
                </Box>

            </Box>
        </Box>
    );
};

export default FormView;
