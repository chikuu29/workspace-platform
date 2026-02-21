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
    Button,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import DataTable from "../widgets/DataTable";
import { DataTableColumn, DataTableAction } from "../widgets/DataTable/types";

type Trend = "up" | "down" | "neutral";

type DashboardSectionType =
    | "KPI_CARD"
    | "TABLE_VIEW"
    | "CHART_VIEW"
    | "FILTER_SECTION"
    | "ACTION_BUTTON";

interface GridTableColumn extends DataTableColumn<any> { }

interface SubKPIConfig {
    label: string;
    value: string | number;
    trend?: Trend;
}

interface KPICardConfig {
    label: string;
    value: string | number;
    helpText?: string;
    trend?: Trend;
    colorPalette?: string;
    subKpis?: SubKPIConfig[];
}

interface DataSourceConfig {
    type: "inline" | "api";
    data?: any[];
    fallbackData?: any[];
    api?: {
        path: string;
        method?: "GET" | "POST";
        params?: Record<string, any>;
    };
}

interface ActionConfig {
    label: string;
    icon?: string;
    colorPalette?: string;
    isDanger?: boolean;
    requiresConfirm?: boolean;
    confirmMessage?: string;
    event?: string;
}

interface DashboardSection {
    id: string;
    uiType?: DashboardSectionType;
    UI_TYPE?: DashboardSectionType | { type: DashboardSectionType };
    title?: string;
    description?: string;
    dataSource?: string;
    actionRef?: string;
    props?: Record<string, any>;
}

interface GridViewConfig {
    title?: string;
    appMeta?: {
        appName: string;
        version: string;
        owner?: string;
        [key: string]: any;
    };
    layout?: {
        maxW?: string;
        contentPadding?: Record<string, any>;
        sectionGap?: number;
    };
    dataSource?: Record<string, DataSourceConfig>;
    UI_VIEW?: {
        schema?: {
            sections?: DashboardSection[];
        };
    };
    uiSchema?: {
        sections: DashboardSection[];
    };
    actions?: Record<string, ActionConfig[]>;

    // Legacy fallback compatibility
    kpis?: KPICardConfig[];
    tableConfig?: {
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

const FALLBACK_TABLE_DATA = [
    { id: "M001", name: "John Doe", joinDate: "2024-01-15", plan: "Annual Platinum", status: "Active", lastVisit: "2 hours ago", trainer: "Alex" },
    { id: "M002", name: "Jane Smith", joinDate: "2024-02-01", plan: "Monthly Basic", status: "Active", lastVisit: "5 hours ago", trainer: "Sarah" },
    { id: "M003", name: "Robert Brown", joinDate: "2023-11-20", plan: "6-Month Flex", status: "Inactive", lastVisit: "3 days ago", trainer: "Alex" },
    { id: "M004", name: "Alice Wilson", joinDate: "2024-02-12", plan: "Annual Platinum", status: "Active", lastVisit: "1 hour ago", trainer: "Michael" },
    { id: "M005", name: "Chris Evans", joinDate: "2024-03-01", plan: "Monthly Basic", status: "Active", lastVisit: "Just now", trainer: "Sarah" },
    { id: "M006", name: "Emma Stone", joinDate: "2024-03-05", plan: "Annual Platinum", status: "Active", lastVisit: "1 day ago", trainer: "Michael" },
];

const ANALYTICS_COMPONENT_REGISTRY: Record<string, () => Promise<{ default: React.ComponentType<any> }>> = {
    RevenuAnalytics: () => import("@/features/modules/gym/RevenuAnalytics"),
};

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

const AnalyticsLoader = ({ componentKey }: { componentKey: string }) => {
    const Component = useMemo(() => {
        const importFactory = ANALYTICS_COMPONENT_REGISTRY[componentKey];
        return importFactory ? lazy(importFactory) : null;
    }, [componentKey]);

    if (!Component) {
        return (
            <Box p={6} borderRadius="xl" border="1px dashed" borderColor="gray.200">
                <Text fontSize="sm" color="gray.500">Analytics component '{componentKey}' is not registered.</Text>
            </Box>
        );
    }

    return (
        <Suspense fallback={<Skeleton height="300px" borderRadius="3xl" />}>
            <Component />
        </Suspense>
    );
};

const GridView: React.FC<{ config: GridViewConfig }> = ({ config }) => {
    const contentPadding = config.layout?.contentPadding || { base: 4, md: 8 };
    const sectionGap = config.layout?.sectionGap ?? 10;
    const maxW = config.layout?.maxW || "1600px";

    const resolveData = (dataSourceKey?: string): any[] => {
        if (!dataSourceKey) return [];
        const source = config.dataSource?.[dataSourceKey];
        if (!source) return [];
        if (source.type === "inline") return source.data || [];
        return source.fallbackData || [];
    };

    const resolveActions = (actionRef?: string, sectionId?: string): DataTableAction<any>[] => {
        const rawActions = actionRef ? config.actions?.[actionRef] || [] : [];

        return rawActions.map((action) => ({
            label: action.label,
            icon: action.icon,
            colorPalette: action.colorPalette,
            isDanger: action.isDanger,
            requiresConfirm: action.requiresConfirm,
            confirmMessage: action.confirmMessage,
            onClick: (row: any) => {
                const event = action.event || action.label;
                console.log(`[GridView Action] ${event}`, { row, sectionId });
            },
        }));
    };

    const sections = useMemo<DashboardSection[]>(() => {
        if (config.UI_VIEW?.schema?.sections?.length) {
            return config.UI_VIEW.schema.sections;
        }

        if (config.uiSchema?.sections?.length) {
            return config.uiSchema.sections;
        }

        const legacySections: DashboardSection[] = [];
        if (config.kpis?.length) {
            legacySections.push({ id: "legacy-kpis", UI_TYPE: "KPI_CARD", title: "KPI Overview" });
        }
        if (config.analytics?.components?.length) {
            legacySections.push({ id: "legacy-analytics", UI_TYPE: "CHART_VIEW", title: "Analytics" });
        }
        if (config.tableConfig?.columns?.length) {
            legacySections.push({ id: "legacy-table", UI_TYPE: "TABLE_VIEW", title: config.tableConfig.title });
        }
        return legacySections;
    }, [config]);

    const renderSection = (section: DashboardSection) => {
        const sectionType = getSectionType(section);
        if (!sectionType) return null;

        if (sectionType === "KPI_CARD") {
            const kpis: KPICardConfig[] = section.dataSource
                ? resolveData(section.dataSource)
                : (config.kpis || []);

            const columns = section.props?.columns || { base: 1, md: 2, lg: 3, xl: 3 };
            return (
                <Box key={section.id}>
                    {section.title && (
                        <Heading size="md" mb={4}>{section.title}</Heading>
                    )}
                    <SimpleGrid columns={columns} gap={6} w="100%">
                        {kpis.map((kpi, index) => (
                            <KPICard key={`${kpi.label}-${index}`} config={kpi} />
                        ))}
                    </SimpleGrid>
                </Box>
            );
        }

        if (sectionType === "TABLE_VIEW") {
            const tableData = section.dataSource
                ? resolveData(section.dataSource)
                : FALLBACK_TABLE_DATA;

            const tableColumns: GridTableColumn[] = section.props?.columns || config.tableConfig?.columns || [];
            const actions = resolveActions(section.actionRef, section.id);

            return (
                <Box key={section.id}>
                    <DataTable
                        title={section.title || config.tableConfig?.title || "Data Table"}
                        data={tableData}
                        columns={tableColumns as any}
                        actions={actions}
                        initialState={section.props?.initialState}
                    />
                </Box>
            );
        }

        if (sectionType === "CHART_VIEW") {
            const analyticsComponents = section.props?.components || config.analytics?.components || [];
            return (
                <Box key={section.id}>
                    {section.title && (
                        <Heading size="md" mb={4}>{section.title}</Heading>
                    )}
                    <VStack align="stretch" gap={4}>
                        {analyticsComponents.map((comp: any) => (
                            <AnalyticsLoader
                                key={comp.id || comp.componentKey}
                                componentKey={comp.componentKey || comp.id}
                            />
                        ))}
                    </VStack>
                </Box>
            );
        }

        if (sectionType === "ACTION_BUTTON") {
            const buttonActions = resolveActions(section.actionRef, section.id);
            return (
                <HStack key={section.id} justify="end" gap={3}>
                    {buttonActions.map((action) => (
                        <Button key={action.label} onClick={() => action.onClick({})} colorPalette={action.colorPalette || "blue"}>
                            {action.label}
                        </Button>
                    ))}
                </HStack>
            );
        }

        return null;
    };

    return (
        <VStack gap={sectionGap} align="stretch" w="100%" p={contentPadding} maxW={maxW} mx="auto">
            <Flex direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "start", sm: "center" }} gap={4}>
                <VStack align="start" gap={1}>
                    <Heading size="xl" fontWeight="900" letterSpacing="tight">
                        {config.title || "Dashboard Overview"}
                    </Heading>
                    {config.appMeta && (
                        <HStack gap={3}>
                            <Badge variant="solid" colorPalette="blue" size="sm">v{config.appMeta.version}</Badge>
                            {config.appMeta.owner && (
                                <Text fontSize="xs" fontWeight="600" color="gray.500">System Owner: {config.appMeta.owner}</Text>
                            )}
                        </HStack>
                    )}
                </VStack>
            </Flex>

            {sections.map((section) => renderSection(section))}
        </VStack>
    );
};

export default React.memo(GridView);
    const getSectionType = (section: DashboardSection): DashboardSectionType | null => {
        if (section.UI_TYPE) {
            if (typeof section.UI_TYPE === "string") return section.UI_TYPE;
            return section.UI_TYPE.type;
        }
        return section.uiType || null;
    };
