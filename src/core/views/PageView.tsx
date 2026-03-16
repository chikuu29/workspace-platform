import React, { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Box, Button, HStack, Icon, Text } from "@chakra-ui/react";
import * as Icons from "react-icons/lu";
import { PageHeader } from "../components/PageHeader";
import { PageLayout } from "../components/PageLayout";
import { UIEngine } from "../renderer/UIEngine";
import { actionEngine } from "../engine/logicEngine";
import { useFormStore } from "../store/useFormStore";
import {
    DrawerRoot,
    DrawerBackdrop,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerBody,
    DrawerFooter,
    DrawerCloseTrigger,
} from "@/components/ui/drawer";

const ActionPanel = () => {
    const { organization_name } = useParams();
    const navigate = useNavigate();
    const setNavigate = useFormStore(state => state.setNavigate);
    const setOrganizationName = useFormStore(state => state.setOrganizationName);

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate, setNavigate]);

    useEffect(() => {
        if (organization_name) setOrganizationName(organization_name);
    }, [organization_name, setOrganizationName]);

    const { panelOpen, panelConfig, panelData, setPanelState } = useFormStore();

    if (!panelConfig) return null;

    const handleSubmit = (data: any) => {
        // Form submitted inside the panel
        // Trigger the root-level apiPath stored on the panelConfig
        if (panelConfig.apiPath) {
            actionEngine.trigger({
                type: "apiCall",
                method: panelConfig.method || "POST",
                apiPath: panelConfig.apiPath,
                serverName: panelConfig.serverName
            }, data, () => {
                // onSuccess, trigger data refresh via window reload or global event later
                // For now, close panel is handled by actionEngine
            });
        }
    };

    return (
        <DrawerRoot open={panelOpen} onOpenChange={(e) => setPanelState(e.open)} size="lg">
            <DrawerBackdrop backdropFilter="blur(12px) saturate(150%)" bg="rgba(0,0,0,0.4)" />
            <DrawerContent
                bg="app.bg.primary"
                borderLeft="1px solid"
                borderColor="app.card.border"
                boxShadow="-40px 0 80px rgba(0,0,0,0.6)"
                transition="transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)"
                display="flex"
                flexDirection="column"
                h="100dvh"
            >
                <DrawerCloseTrigger color="app.text.muted" top={8} right={8} p={2} _hover={{ bg: "white/5", color: "app.text.primary" }} />
                <DrawerHeader borderBottom="1px solid" borderColor="app.card.border" py={10} px={{ base: 6, md: 12 }}>
                    <HStack gap={6}>
                        {/* We could make icon configurable, default to LuPlus */}
                        {panelConfig.iconName && (Icons as any)[panelConfig.iconName] ? (
                            <Box display="inline-block">
                                <Icon as={(Icons as any)[panelConfig.iconName]} boxSize={8} />
                            </Box>
                        ) : (
                            <Box
                                w={16} h={16} borderRadius="2xl" bg="cyan.500" color="white"
                                boxShadow="0 12px 24px rgba(6,182,212,0.3)"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Icon as={Icons.LuPlus} boxSize={8} />
                            </Box>
                        )}
                        <Box display="flex" flexDirection="column" gap={0} alignItems="flex-start">
                            <Text fontSize="2xl" fontWeight="900" letterSpacing="tight" color="app.text.primary" m={0}>
                                {panelConfig.title || "Action"}
                            </Text>
                            {panelConfig.description && (
                                <Text fontSize="sm" color="app.text.muted" fontWeight="500" m={0} mt={1}>
                                    {panelConfig.description}
                                </Text>
                            )}
                        </Box>
                    </HStack>
                </DrawerHeader>
                <DrawerBody py={12} px={{ base: 6, md: 12 }} className="custom-scrollbar" overflowY="auto">
                    <UIEngine
                        config={panelConfig.widgets || []}
                        initialData={panelData || {}}
                        onSubmit={handleSubmit}
                        formId="dynamic-action-panel-form"
                    />
                </DrawerBody>
                <DrawerFooter borderTop="1px solid" borderColor="app.card.border" p={{ base: 6, md: 12 }}>
                    {/* Render action button manually to match style if not in UI Engine config */}
                    <Button
                        type="submit"
                        form="dynamic-action-panel-form"
                        w="full"
                        colorPalette="cyan"
                        size="lg"
                        borderRadius="xl"
                        h="60px"
                        boxShadow="0 12px 24px rgba(6,182,212,0.25)"
                        _active={{ transform: "scale(0.98)" }}
                    >
                        <Icon as={Icons.LuSave} mr={2} />
                        {panelConfig.submitButtonLabel || "Save"}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </DrawerRoot>
    );
};

const PageView = ({ config }: { config: any }) => {
    const [searchValue, setSearchValue] = useState("");

    const HeaderActions = () => {
        const actions = config?.UI_TYPE?.actions || [];
        if (!actions.length) return null;

        return (
            <HStack gap={4}>
                {actions.map((action: any, index: number) => {
                    const IconComponent = (Icons as any)[action.iconName];
                    return (
                        <Button
                            key={index}
                            colorPalette="cyan"
                            borderRadius="xl"
                            size="md"
                            boxShadow="0 8px 20px rgba(6,182,212,0.25)"
                            h="48px"
                            px={8}
                            fontWeight="700"
                            _hover={{ transform: "translateY(-1px)", boxShadow: "0 12px 24px rgba(6,182,212,0.35)" }}
                            onClick={() => {
                                action.events?.onClick?.forEach((evt: any) => {
                                    actionEngine.trigger(evt, {});
                                });
                            }}
                        >
                            {IconComponent && <Icon as={IconComponent} boxSize={5} style={{ strokeWidth: '3px' }} />}
                            {action.label}
                        </Button>
                    );
                })}
            </HStack>
        );
    };

    const widgets = useMemo(() => {
        return config?.UI_VIEW?.schema?.widgets || [];
    }, [config]);

    if (!widgets.length) return null;

    return (
        <PageLayout
            title={config?.UI_TYPE?.title || "Page View"}
            subtitle={config?.UI_TYPE?.description}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            actions={<HeaderActions />}
        >
            <UIEngine config={widgets} />
            <ActionPanel />
        </PageLayout>
    );
};

export default React.memo(PageView);
