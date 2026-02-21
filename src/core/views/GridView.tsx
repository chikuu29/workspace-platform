import React, { useMemo, lazy, Suspense } from "react";
import {
    Box,
    SimpleGrid,
    Heading,
    VStack,
    Flex,
    Text,
    Stat,
    Skeleton,
    HStack,
    Badge,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import DataTable from "../widgets/DataTable";
import { DataTableColumn, DataTableAction } from "../widgets/DataTable/types";

// Types for GridView Configuration
export interface GridTableColumn extends DataTableColumn<any> { }

export interface SubKPIConfig {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "neutral";
}

export interface KPICardConfig {
    label: string;
    value: string | number;
    helpText?: string;
    trend?: "up" | "down" | "neutral";
    colorPalette?: string;
    subKpis?: SubKPIConfig[];
}

export interface GridViewConfig {
    title: string;
    appMeta?: {
        appName: string;
        version: string;
        [key: string]: any;
    };
    kpis: KPICardConfig[];
    tableConfig: {
        title: string;
        apiPath: string;
        columns: GridTableColumn[];
    };
    analytics?: {
        components: {
            name: string;
            id: string;
        }[];
    };
}

// Sub-component for Nested KPI Tile
const SubKPITile = React.memo(({ config }: { config: SubKPIConfig }) => {
    const labelColor = useColorModeValue("gray.500", "gray.400");
    const valueColor = useColorModeValue("gray.700", "gray.200");

    return (
        <VStack align="start" gap={0} p={2} bg={useColorModeValue("gray.50", "whiteAlpha.50")} borderRadius="md" flex="1">
            <Text fontSize="10px" fontWeight="700" color={labelColor} textTransform="uppercase" letterSpacing="wider">
                {config.label}
            </Text>
            <Text fontSize="md" fontWeight="800" color={valueColor}>
                {config.value}
            </Text>
        </VStack>
    );
});

// Sub-component for KPI Card (Memoized)
const KPICard = React.memo(({ config }: { config: KPICardConfig }) => {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const labelColor = useColorModeValue("gray.500", "gray.400");
    const valueColor = useColorModeValue(`${config.colorPalette ? `${config.colorPalette}.600` : "blue.600"}`, `${config.colorPalette ? `${config.colorPalette}.400` : "blue.400"}`);

    return (
        <Box
            p={5}
            bg={bg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            transition="all 0.2s"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
            display="flex"
            flexDirection="column"
            gap={4}
        >
            <Stat.Root>
                <Stat.Label fontSize="sm" fontWeight="600" color={labelColor}>
                    {config.label}
                </Stat.Label>
                <Flex align="baseline" gap={2} mt={1}>
                    <Stat.ValueText fontSize="2xl" fontWeight="800" color={valueColor}>
                        {config.value}
                    </Stat.ValueText>
                </Flex>
                {config.helpText && (
                    <Stat.HelpText fontSize="xs" mt={1}>
                        {config.helpText}
                    </Stat.HelpText>
                )}
            </Stat.Root>

            {config.subKpis && config.subKpis.length > 0 && (
                <HStack gap={2} w="full">
                    {config.subKpis.map((sub, idx) => (
                        <SubKPITile key={idx} config={sub} />
                    ))}
                </HStack>
            )}
        </Box>
    );
});

// Analytics Section (Internal Placeholder)
const AnalyticsLoader = ({ id }: { id: string }) => {
    const Component = useMemo(() => {
        if (id === "RevenuAnalytics") {
            return lazy(() => import("@/features/modules/gym/RevenuAnalytics"));
        }
        return null;
    }, [id]);

    if (!Component) return null;

    return (
        <Suspense fallback={<Skeleton height="300px" borderRadius="3xl" />}>
            <Component />
        </Suspense>
    );
};

/**
 * GridView
 * Master layout for dashbaord views.
 * Orchestrates KPIs, Analytics, and the Advanced DataTable.
 */
const GridView: React.FC<{ config: GridViewConfig }> = ({ config }) => {
    // 1. Mock Table Data (Usually fetched from config.tableConfig.apiPath)
    const tableData = useMemo(() => [
        { id: "M001", name: "John Doe", joinDate: "2024-01-15", plan: "Annual Platinum", status: "Active", lastVisit: "2 hours ago", trainer: "Alex" },
        { id: "M002", name: "Jane Smith", joinDate: "2024-02-01", plan: "Monthly Basic", status: "Active", lastVisit: "5 hours ago", trainer: "Sarah" },
        { id: "M003", name: "Robert Brown", joinDate: "2023-11-20", plan: "6-Month Flex", status: "Inactive", lastVisit: "3 days ago", trainer: "Alex" },
        { id: "M004", name: "Alice Wilson", joinDate: "2024-02-12", plan: "Annual Platinum", status: "Active", lastVisit: "1 hour ago", trainer: "Michael" },
        { id: "M005", name: "Chris Evans", joinDate: "2024-03-01", plan: "Monthly Basic", status: "Active", lastVisit: "Just now", trainer: "Sarah" },
        { id: "M006", name: "Emma Stone", joinDate: "2024-03-05", plan: "Annual Platinum", status: "Active", lastVisit: "1 day ago", trainer: "Michael" },
    ], []);

    // 2. Table Actions
    const tableActions: DataTableAction<any>[] = useMemo(() => [
        {
            label: "Edit Member",
            icon: "FcSettings",
            onClick: (row) => console.log("Edit", row),
        },
        {
            label: "Delete",
            icon: "FcDeleteDatabase",
            isDanger: true,
            requiresConfirm: true,
            onClick: (row) => console.log("Delete", row),
            isVisible: (row) => row.status !== 'Active' // Only delete inactive members
        }
    ], []);

    const kpiSection = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 3 }} gap={6} w="100%">
            {config.kpis.map((kpi, index) => (
                <KPICard key={`${kpi.label}-${index}`} config={kpi} />
            ))}
        </SimpleGrid>
    ), [config.kpis]);

    return (
        <VStack gap={10} align="stretch" w="100%" p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
            {/* Header Section */}
            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
                <VStack align="start" gap={1}>
                    <Heading size="xl" fontWeight="900" letterSpacing="tight">
                        {config.title || "Dashboard Overview"}
                    </Heading>
                    {config.appMeta && (
                        <HStack gap={3}>
                            <Badge variant="solid" colorPalette="blue" size="sm">v{config.appMeta.version}</Badge>
                            <Text fontSize="xs" fontWeight="600" color="gray.500">System Owner: {config.appMeta.owner}</Text>
                        </HStack>
                    )}
                </VStack>
            </Flex>

            {/* KPI Section */}
            <Box>
                {kpiSection}
            </Box>

            {/* Analytics Section - Lazy Loaded */}
            {config.analytics && config.analytics.components.length > 0 && (
                <Box>
                    {config.analytics.components.map(comp => (
                        <AnalyticsLoader key={comp.id} id={comp.id} />
                    ))}
                </Box>
            )}

            {/* Advanced DataTable Section */}
            <Box>
                <DataTable
                    title={config.tableConfig.title}
                    data={tableData}
                    columns={config.tableConfig.columns as any}
                    actions={tableActions}
                />
            </Box>
        </VStack>
    );
};

export default React.memo(GridView);
