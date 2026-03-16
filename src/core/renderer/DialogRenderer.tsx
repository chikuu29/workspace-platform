import { memo, useEffect, useState, useCallback } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Dialog,
    Portal,
    CloseButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton";
import { useModalStore } from "@/core/store/useModalStore";
import { GETAPI } from "@/app/api";
import ViewRenderer from "./ViewRenderer";
import FallbackRenderer from "./FallbackRenderer";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

/**
 * Loading skeleton that mirrors form structure
 */
const ModalLoadingSkeleton = memo(() => (
    <VStack gap={6} align="stretch" p={6}>
        <HStack gap={4}>
            <SkeletonCircle size="12" />
            <VStack align="stretch" flex="1" gap={2}>
                <Skeleton height="6" width="40%" />
                <Skeleton height="4" width="25%" />
            </VStack>
        </HStack>
        <Skeleton height="300px" borderRadius="xl" />
        <VStack gap={3} align="stretch">
            <Skeleton height="40px" borderRadius="lg" />
            <Skeleton height="40px" borderRadius="lg" />
            <Skeleton height="40px" borderRadius="lg" />
        </VStack>
    </VStack>
));

/**
 * TemplateModal
 *
 * Global dialog that fetches a template via GETAPI and renders it
 * using ViewRenderer. Subscribes to Zustand useModalStore.
 * Mounted once at layout root — no layout re-renders.
 *
 * Reuses the exact same rendering pipeline as WorkspacePage:
 * GETAPI → config → ViewRenderer → FormView
 */
const DialogRenderer = memo(() => {
    const isOpen = useModalStore((s) => s.isOpen);
    const templateName = useModalStore((s) => s.templateName);
    const appName = useModalStore((s) => s.appName);
    const dialogConfig = useModalStore((s) => s.dialogConfig);
    const closeModal = useModalStore((s) => s.closeModal);

    const [config, setConfig] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current app from Redux for fallback appName (was loginInfo.app_code)
    const defaultApp = null;

    // Fetch template when modal opens
    useEffect(() => {
        if (!isOpen || !templateName) return;

        setLoading(true);
        setError(null);
        setConfig(null);

        const resolvedApp = appName ?? defaultApp;

        const subscription = GETAPI({
            path: "app/ui_template",
            params: {
                pageName: templateName,
                ...(resolvedApp ? { appName: resolvedApp } : {}),
            },
            isPrivateApi: true,
            enableCache: false,
        }).subscribe({
            next: (res: any) => {
                if (res.success && res.result?.length > 0) {
                    setConfig(res.result[0]);
                } else {
                    setError(
                        res.message ?? `Template "${templateName}" not found.`
                    );
                }
                setLoading(false);
            },
            error: (err: any) => {
                setError(err?.message ?? "An unexpected error occurred.");
                setLoading(false);
            },
        });

        // Cleanup subscription on unmount or re-fetch
        return () => subscription.unsubscribe();
    }, [isOpen, templateName, appName, defaultApp]);

    // Clean up state on close
    const handleOpenChange = useCallback(
        (details: { open: boolean }) => {
            if (!details.open) {
                closeModal();
                // Reset local state after animation completes
                setTimeout(() => {
                    setConfig(null);
                    setError(null);
                    setLoading(false);
                }, 300);
            }
        },
        [closeModal]
    );

    // Theme-aware dialog colors
    const headerBg = useColorModeValue("gray.50", "rgba(15, 23, 42, 0.95)");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={handleOpenChange}
            // size={dialogConfig.size ?? "xl"}
            size={"full"}
            placement="center"
            motionPreset="slide-in-bottom"
            scrollBehavior={dialogConfig.scrollBehavior ?? "inside"}
            closeOnInteractOutside={dialogConfig.closeOnOverlayClick ?? true}
            closeOnEscape={dialogConfig.closeOnEsc ?? true}
        >
            <Portal>
                <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(4px)" />
                <Dialog.Positioner>
                    <Dialog.Content
                        // maxW="900px"
                        maxH="90vh"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor={borderColor}
                        overflow="hidden"
                        bg="bg.default"
                    >
                        {/* Header */}
                        <Dialog.Header
                            bg={headerBg}
                            borderBottom="1px solid"
                            borderColor={borderColor}

                        >
                            <HStack justify="space-between" w="full">
                                <VStack align="start" gap={0}>
                                    <Dialog.Title
                                        fontSize="lg"
                                        fontWeight="700"
                                        color="text.default"
                                    >
                                        {config
                                            ? (config as any)?.UI_TYPE?.title ?? templateName
                                            : templateName ?? "Loading..."}
                                    </Dialog.Title>
                                    {config && (config as any)?.UI_TYPE?.description && (
                                        <Text fontSize="xs" color="text.muted">
                                            {(config as any).UI_TYPE.description}
                                        </Text>
                                    )}
                                </VStack>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </HStack>
                        </Dialog.Header>

                        {/* Body */}
                        <Dialog.Body p={0} overflowY="auto">
                            {loading && <ModalLoadingSkeleton />}
                            {error && (
                                <Box p={4}>
                                    <FallbackRenderer
                                        reason="TEMPLATE_NOT_FOUND"
                                        type={templateName ?? undefined}
                                    />
                                </Box>
                            )}
                            {config && !loading && !error && (
                                <Box p={4}>
                                    <ViewRenderer config={config} />
                                </Box>
                            )}
                        </Dialog.Body>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
});

export default DialogRenderer;
