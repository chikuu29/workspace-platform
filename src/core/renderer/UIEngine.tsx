import React, { useEffect } from 'react';
import RunTimeWidget from './RunTimeWidget';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormStore } from '../store/useFormStore';
import { ruleEngine } from '../engine/logicEngine';


import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogRoot,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button, Text, VStack, Box, Icon, Flex } from "@chakra-ui/react";
import { useState } from 'react';
import { FiAlertCircle } from "react-icons/fi";

interface UIEngineProps {
    config: any[]; // Array of widget configs
    initialData?: any;
    onSubmit?: (data: any) => void;
    children?: React.ReactNode;
    formId?: string; // Add formId prop
    [key: string]: any;
}

export const UIEngine: React.FC<UIEngineProps> = ({ config, initialData = {}, onSubmit, children, formId, ...rest }) => {
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
    const [alertMessage, setAlertMessage] = useState<string[]>([]);

    const onError = (errors: any) => {
        const store = useFormStore.getState();
        const messages = Object.entries(errors).map(([name, err]: [string, any]) => {
            const widget = store.metadata[name];
            const label = widget?.text || widget?.label || name;
            return `${label}: ${err.message}`;
        });
        setAlertMessage(messages);
        setAlertOpen(true);
    };

    return (
        <FormProvider {...methods}>
            <form id={formId} onSubmit={methods.handleSubmit(handleFormSubmit, onError)}>
                <RunTimeWidget configs={config} {...rest} />
                {children}

                <DialogRoot open={alertOpen} onOpenChange={(e) => setAlertOpen(e.open)} placement="center" motionPreset="slide-in-bottom" >
                    <DialogContent rounded="2xl" overflow="hidden" border="1px solid" borderColor="red.100">
                        <DialogHeader>
                            <Flex align="center" gap={3}>
                                <Box bg="red.50" p={2} rounded="full">
                                    <Icon as={FiAlertCircle} color="red.500" boxSize={6} />
                                </Box>
                                <DialogTitle fontSize="lg" fontWeight="bold">Validation Failed</DialogTitle>
                            </Flex>
                        </DialogHeader>
                        <DialogBody>
                            <VStack align="stretch" gap={3}>
                                <Text fontSize="sm" color="gray.500" fontWeight="700">Please correct the following errors before proceeding:</Text>
                                {alertMessage.map((msg, idx) => (
                                    <Box key={idx} p={3} bg="red.50" rounded="xl" border="1px solid" borderColor="red.100">
                                        <Text color="red.700" fontSize="sm" fontWeight="medium">{msg}</Text>
                                    </Box>
                                ))}
                            </VStack>
                        </DialogBody>
                        <DialogFooter>
                            <Button size="lg" width="full" variant="solid" onClick={() => setAlertOpen(false)}>
                                Acknowledge & Fix
                            </Button>
                        </DialogFooter>
                        <DialogCloseTrigger />
                    </DialogContent>
                </DialogRoot>
            </form>
        </FormProvider>
    );
};
