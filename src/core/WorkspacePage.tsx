import { useEffect, useState, useMemo, memo } from "react"
import { useParams, useSearchParams } from "react-router"
import ViewRenderer from "./renderer/ViewRenderer"
import FallbackRenderer from "./renderer/FallbackRenderer"
import { GETAPI } from "@/app/api"
import { Box, HStack, SimpleGrid, VStack } from "@chakra-ui/react"
import { Skeleton, SkeletonCircle } from "@/components/ui/skeleton"
import { useColorModeValue } from "@/components/ui/color-mode"
import { useFormStore } from "./store/useFormStore"

/**
 * LoadingState
 * Glassmorphic skeleton loader that mirrors the bento-style dashboard
 * layout used across the workspace. Theme-aware via semantic tokens.
 */
const LoadingState = memo(() => {
    /* Theme-aware skeleton shimmer — prevents black skeletons in dark mode */
    const skeletonCss = useColorModeValue(
        { "--skeleton-from": "#e2e8f0", "--skeleton-to": "#f1f5f9" },
        { "--skeleton-from": "rgba(255,255,255,0.06)", "--skeleton-to": "rgba(255,255,255,0.12)" }
    );
    const bg = useColorModeValue('', 'navy.700')
    const panelStyles = {
        bg: "app.card.bg",
        border: "1px solid",
        borderColor: "app.card.border",
        backdropFilter: "blur(5px)",
    } as const;

    return (
        <Box px={{ base: 2, md: 2 }} py={2} w="full"  >
            <VStack gap={6} align="stretch">
                {/* Page title area
                <VStack align="start" gap={2} px={2}>
                    <HStack gap={2}>
                        <Skeleton w="50px" h="10px" borderRadius="md" />
                        <Box w="4px" h="4px" borderRadius="full" bg="gray.400" />
                        <Skeleton w="80px" h="10px" borderRadius="md" />
                    </HStack>
                    <Skeleton w="240px" h="28px" borderRadius="xl" />
                    <Skeleton w="320px" h="14px" borderRadius="md" />
                </VStack> */}

                {/* KPI stat cards row */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                    {[1, 2, 3, 4].map((i) => (
                        <Box key={`stat-${i}`} p={5} borderRadius="2xl" {...panelStyles}>
                            <VStack align="stretch" gap={3}>
                                <SkeletonCircle size="32px" bg={bg} />
                                <Skeleton w="60px" h="10px" borderRadius="md" bg={bg} />
                                <Skeleton w="100px" h="20px" borderRadius="md" bg={bg} />
                            </VStack>
                        </Box>
                    ))}
                </SimpleGrid>

                {/* Main content + sidebar panel */}
                <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
                    <Box p={6} borderRadius="2xl" minH="280px" {...panelStyles}>
                        <VStack align="stretch" gap={4}>
                            <Skeleton w="180px" h="20px" borderRadius="md" mb={2} bg={bg} />
                            <Skeleton h="180px" w="100%" borderRadius="2xl" bg={bg} />
                        </VStack>
                    </Box>
                    <Box p={6} borderRadius="2xl" minH="280px" {...panelStyles}>
                        <VStack align="stretch" gap={4}>
                            <Skeleton w="120px" h="20px" borderRadius="md" mb={2} bg={bg} />
                            {[1, 2, 3, 4].map((i) => (
                                <HStack key={`list-${i}`} gap={3}>
                                    <SkeletonCircle size="32px" bg={bg} />
                                    <VStack align="stretch" gap={2} flex="1">
                                        <Skeleton w="100%" h="10px" borderRadius="md" bg={bg} />
                                        <Skeleton w="60%" h="8px" borderRadius="md" bg={bg} />
                                    </VStack>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>
                </SimpleGrid>

                {/* Bottom wide panel */}
                <Box p={6} borderRadius="2xl" {...panelStyles}>
                    <VStack align="stretch" gap={4}>
                        <Skeleton w="200px" h="20px" borderRadius="md" bg={bg} />
                        <HStack gap={4} h="100px">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Skeleton key={`bar-${i}`} flex="1" h="100%" borderRadius="xl" bg={bg} />
                            ))}
                        </HStack>
                    </VStack>
                </Box>
            </VStack>
        </Box>

    );
});
LoadingState.displayName = "LoadingState";

const WorkspacePage = () => {
    // return <LoadingState />
    console.log("===Rendering WorkspacePage===")
    const { appCode, view: UITemplateID, organization_name } = useParams()
    const [searchParams] = useSearchParams()
    const appParam = searchParams.get("app")

    const app = useMemo(() => appCode || appParam, [appCode, appParam])
    const [config, setConfig] = useState(null)
    const [notFound, setNotFound] = useState(false)

    const setOrganizationName = useFormStore(state => state.setOrganizationName);

    useEffect(() => {
        if (organization_name) setOrganizationName(organization_name);
    }, [organization_name, setOrganizationName]);

    useEffect(() => {
        const getUITemplate = async () => {
            GETAPI({
                path: `app/ui_template`,

                params: {
                    pageName: UITemplateID,
                    appName: app
                },
                isPrivateApi: true,
                enableCache: false,
            }).subscribe(async (res: any) => {
                if (res.success && res["result"].length > 0) {
                    setConfig(res["result"][0]);
                    setNotFound(false);
                } else {
                    // Show fallback if template not found
                    setNotFound(true);
                    setConfig(null);
                }
            });
        };

        if (UITemplateID && app) {
            getUITemplate();
        }
    }, [UITemplateID, app]);

    if (notFound) return <FallbackRenderer reason="TEMPLATE_NOT_FOUND" type={UITemplateID} />
    if (!config) return <LoadingState />

    return <ViewRenderer config={config} />
}

export default memo(WorkspacePage)
