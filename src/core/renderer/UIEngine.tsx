import React, { useEffect } from 'react';
import RunTimeWidget from './RunTimeWidget';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormStore } from '../store/useFormStore';
import { ruleEngine } from '../engine/logicEngine';


import {
    DialogBackdrop,
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button, Text, VStack, Box, Icon, Flex, Circle, Badge, HStack, Portal } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion } from "framer-motion";
import { useState } from 'react';
import { FiAlertCircle } from "react-icons/fi";
import { LuCornerDownRight } from "react-icons/lu";

interface UIEngineProps {
    config: any[]; // Array of widget configs
    initialData?: any;
    onSubmit?: (data: any) => void;
    children?: React.ReactNode;
    formId?: string; // Add formId prop
    [key: string]: any;
}

export const UIEngine: React.FC<UIEngineProps> = ({ config, initialData = {}, onSubmit, children, formId, ...rest }) => {
    console.log("===RENDER UI ENGINE===");

    const initialize = useFormStore(state => state.initialize);
    const setFieldValue = useFormStore(state => state.setFieldValue);

    const methods = useForm({
        defaultValues: initialData,
        mode: "onSubmit" // Change to onSubmit
    });

    const { watch } = methods;

    // Initialize store on mount
    useEffect(() => {
        if (config) {
            initialize(config);
        }
    }, [config, initialize]);

    // Global listener for field changes to sync with Zustand and trigger Rules
    useEffect(() => {
        const subscription = watch((value, { name, type }) => {
            if (name) {
                const currentStoreValue = useFormStore.getState().values[name];
                const newFieldValue = value[name];

                // Only update store if value implies a change to avoid loops
                if (currentStoreValue !== newFieldValue) {
                    setFieldValue(name, newFieldValue);
                }
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setFieldValue, methods]);

    const handleFormSubmit = (data: any) => {
        if (onSubmit) onSubmit(data);
    };

    const [alertOpen, setAlertOpen] = useState(false);
    const [groupedErrors, setGroupedErrors] = useState<Record<string, string[]>>({});
    const dialogBorderColor = useColorModeValue("red.100", "whiteAlpha.200");
    const dialogBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(15, 23, 42, 0.8)");
    const titleColor = useColorModeValue("red.700", "red.400");
    const subtitleColor = useColorModeValue("gray.500", "whiteAlpha.600");
    const dividerColor = useColorModeValue("red.50", "whiteAlpha.100");
    const itemBg = useColorModeValue("red.50/50", "whiteAlpha.50");
    const itemBorderColor = useColorModeValue("red.100/50", "transparent");
    const itemTextColor = useColorModeValue("gray.800", "gray.200");
    const footerBg = useColorModeValue("gray.50/50", "whiteAlpha.50");
    const footerBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

    const onError = (errors: any) => {
        const store = useFormStore.getState();
        const groups: Record<string, string[]> = {};

        Object.entries(errors).forEach(([name, err]: [string, any]) => {
            const widget = store.metadata[name];
            const tabName = widget?.tabName || "General";
            const label = widget?.text || widget?.label || name;

            if (!groups[tabName]) {
                groups[tabName] = [];
            }
            groups[tabName].push(`${label}: ${err.message}`);
        });

        setGroupedErrors(groups);
        setAlertOpen(true);
    };

    return (
        <FormProvider {...methods}>
            <form id={formId} noValidate onSubmit={methods.handleSubmit(handleFormSubmit, onError)}>
                <RunTimeWidget configs={config} {...rest} />
                {children}

                <DialogRoot open={alertOpen} onOpenChange={(e) => setAlertOpen(e.open)} placement="center" motionPreset="scale" >
                    <Portal>
                        <DialogBackdrop backdropFilter="blur(10px)" bg="blackAlpha.500" />

                        <DialogContent
                            rounded={{ base: "2xl", md: "3xl" }}
                            overflow="hidden"
                            border="1px solid"
                            borderColor={dialogBorderColor}
                            shadow="2xl"
                            boxShadow="2xl" backdrop={false}
                            bg={"app.card.bg"}
                            // backdropFilter="blur(60px)"
                            maxW={{ base: "95vw", md: "500px" }}
                        >
                            <DialogHeader pb={4} pt={6} px={6}>
                                <Flex align="center" gap={4}>
                                    <motion.div

                                        initial={{ scale: 0, boxShadow: "0px 0px 0px rgba(239, 68, 68, 0)" }}
                                        animate={{ scale: 1, boxShadow: "0px 10px 20px rgba(239, 68, 68, 0.2)" }}
                                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                    >
                                        <Circle

                                            size="12"
                                            bgGradient="linear(to-br, red.400, red.600)"
                                            // color="white"
                                            shadow="lg"
                                        >
                                            <Icon as={FiAlertCircle} boxSize={6} />
                                        </Circle>
                                    </motion.div>
                                    <VStack align="start" gap={0}>
                                        <DialogTitle fontSize="xl" fontWeight="900" letterSpacing="tight" color={titleColor}>
                                            Validation Required
                                        </DialogTitle>
                                        <Text fontSize="xs" fontWeight="medium" color={subtitleColor}>
                                            Some fields need your attention
                                        </Text>
                                    </VStack>
                                </Flex>
                            </DialogHeader>

                            <DialogBody maxH="50vh" overflowY="auto" py={2} px={6}>
                                <VStack align="stretch" gap={6} py={2}>
                                    {Object.entries(groupedErrors).map(([tab, msgs], idx) => (
                                        <motion.div
                                            key={tab}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 + 0.2 }}
                                        >
                                            <VStack align="stretch" gap={3}>
                                                <HStack gap={3}>
                                                    <Badge
                                                        variant="solid"
                                                        bgGradient="linear(to-r, red.500, red.600)"
                                                        // color="white"
                                                        px={3}
                                                        py={1}
                                                        // rounded="full"
                                                        fontSize="10px"
                                                        fontWeight="bold"
                                                        textTransform="uppercase"
                                                        letterSpacing="wider"
                                                    >
                                                        {tab}
                                                    </Badge>
                                                    <Box flex="1" h="1px" bg={dividerColor} />
                                                </HStack>
                                                <VStack align="stretch" gap={2} pl={1}>
                                                    {msgs.map((msg, mIdx) => (
                                                        <motion.div
                                                            key={mIdx}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: idx * 0.1 + mIdx * 0.05 + 0.3 }}
                                                        >
                                                            <HStack align="start" gap={3} p={3} rounded="xl" bg={itemBg} border="1px solid" borderColor={itemBorderColor}>
                                                                <Circle size="1.5" bg="red.500" mt={2} />
                                                                <Text color={itemTextColor} fontSize="sm" fontWeight="600" lineHeight="tall">
                                                                    {msg}
                                                                </Text>
                                                            </HStack>
                                                        </motion.div>
                                                    ))}
                                                </VStack>
                                            </VStack>
                                        </motion.div>
                                    ))}
                                </VStack>
                            </DialogBody>

                            <DialogFooter bg={footerBg} borderTop="1px solid" borderColor={footerBorderColor} p={6}>
                                <Button
                                    size="lg"
                                    width="full"
                                    bgGradient="linear(to-r, red.500, red.600)"
                                    _hover={{ bgGradient: "linear(to-r, red.600, red.700)", transform: "translateY(-1px)", shadow: "xl" }}
                                    _active={{ transform: "translateY(0px)" }}
                                    transition="all 0.2s"
                                    onClick={() => setAlertOpen(false)}
                                    rounded="xl"
                                    shadow="lg"
                                    fontWeight="800"
                                    fontSize="md"
                                >
                                    <HStack gap={2}>
                                        <Text>Acknowledge & Fix</Text>
                                        <Icon as={LuCornerDownRight} />
                                    </HStack>
                                </Button>
                            </DialogFooter>
                            <DialogCloseTrigger />
                        </DialogContent>
                    </Portal>
                </DialogRoot>
            </form>
        </FormProvider>
    );
};
