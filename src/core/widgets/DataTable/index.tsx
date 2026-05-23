import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import {
    Box,
    VStack,
    Flex,
    Heading,
    Table as ChakraTable,
    Text,
    HStack,
    useBreakpointValue,
    Icon
} from "@chakra-ui/react";
import { Database, Layers } from "lucide-react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useDataTable } from "./hooks/useDataTable";
import { DataTableColumn, DataTableAction, DataTableState } from "./types";
import { GETAPI } from "@/app/api";
import FilterPanel from "./FilterPanel";
import TableHead from "./TableHead";
import TableRow from "./TableRow";
import Pagination from "./Pagination";
import { MobileTableCard } from "./MobileTableCard";

interface DataTableProps<T> {
    title?: string;
    data?: T[];
    apiConfig?: {
        path: string;
        method?: string;
        params?: Record<string, any>;
    };
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[];
    initialState?: Partial<DataTableState>;
    onStateChange?: (state: DataTableState) => void;
}

/**
 * DataTable
 * Adaptive desktop/mobile data presentation with sorting, search and pagination.
 * Supports internal dynamic API data fetching, parameter interpolation, and loading shimmers.
 */
function DataTable<T extends Record<string, any>>({
    title,
    data,
    apiConfig,
    columns,
    actions,
    initialState,
    onStateChange
}: DataTableProps<T>) {
    const [apiData, setApiData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Dynamic Parameter Interpolation for URL-driven contexts
    const interpolateParam = useCallback((val: any): any => {
        if (typeof val !== "string") return val;
        return val.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
            const trimmedKey = key.trim();
            const searchParams = new URLSearchParams(window.location.search);
            const searchVal = searchParams.get(trimmedKey);
            if (searchVal !== null) return searchVal;
            return "";
        });
    }, []);

    // Perform dynamic API fetch internally
    useEffect(() => {
        if (!apiConfig || !apiConfig.path) {
            setApiData(null);
            return;
        }

        setLoading(true);

        const queryParams: Record<string, any> = {};
        if (apiConfig.params) {
            Object.entries(apiConfig.params).forEach(([key, val]) => {
                queryParams[key] = interpolateParam(val);
            });
        }

        const subscription = GETAPI({
            path: apiConfig.path,
            params: queryParams,
            isPrivateApi: true,
        }).subscribe({
            next: (res: any) => {
                if (res && res.success) {
                    const dataArray = Array.isArray(res.data) 
                        ? res.data 
                        : (res.result && Array.isArray(res.result) ? res.result : []);
                    setApiData(dataArray);
                } else {
                    setApiData([]);
                }
                setLoading(false);
            },
            error: (err) => {
                console.error(`Failed to fetch table records inside DataTable from path '${apiConfig.path}':`, err);
                setApiData([]);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [apiConfig, interpolateParam]);

    // Use fetched API data or fallback to static data
    const resolvedData = useMemo(() => {
        if (apiData !== null) return apiData;
        return data || [];
    }, [apiData, data]);

    const { state, processedData, pagination, handlers } = useDataTable({
        data: resolvedData,
        initialState,
        onStateChange
    });

    const isMobile = useBreakpointValue({ base: true, md: false });
    const panelBg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const emptyCardBg = useColorModeValue("gray.50", "whiteAlpha.100");
    const scrollbarThumbBg = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)");
    const scrollbarThumbHoverBg = useColorModeValue("rgba(0,0,0,0.16)", "rgba(255,255,255,0.16)");
    const skeletonBg = useColorModeValue("gray.100", "whiteAlpha.100");
 
    const tableContent = useMemo(() => {
        if (isMobile) {
            if (loading) {
                return (
                    <VStack gap={3} align="stretch" w="full" p={{ base: 3, sm: 4 }}>
                        {Array.from({ length: 3 }).map((_, idx) => (
                            <Box
                                key={`skeleton-card-${idx}`}
                                p={4}
                                border="1px solid"
                                borderColor={borderColor}
                                borderRadius="xl"
                                bg="app.card.bg"
                                css={{
                                    animation: "shimmer 1.8s infinite ease-in-out",
                                    "@keyframes shimmer": {
                                        "0%": { opacity: 0.4 },
                                        "50%": { opacity: 0.8 },
                                        "100%": { opacity: 0.4 }
                                    }
                                }}
                            >
                                <VStack align="stretch" gap={3}>
                                    <Box h="14px" bg={skeletonBg} w="40%" borderRadius="md" />
                                    <Box h="10px" bg={skeletonBg} w="70%" borderRadius="md" />
                                    <Box h="10px" bg={skeletonBg} w="50%" borderRadius="md" />
                                </VStack>
                            </Box>
                        ))}
                    </VStack>
                );
            }

            return (
                <VStack gap={3} align="stretch" w="full" p={{ base: 3, sm: 4 }}>
                    {processedData.map((row, idx) => (
                        <MobileTableCard key={idx} row={row} columns={columns} actions={actions} />
                    ))}
 
                    {processedData.length === 0 && (
                        <Box
                            borderRadius="lg"
                            p={6}
                            border="1px dashed"
                            borderColor={borderColor}
                            textAlign="center"
                        >
                            <Text fontWeight="700" color="gray.500">No records found</Text>
                            <Text fontSize="xs" color="gray.500">Try changing search text or filters.</Text>
                        </Box>
                    )}
                </VStack>
            );
        }
 
        return (
            <Box
                overflowX="auto"
                overflowY="hidden"
                borderRadius="xl"
                w="full"
                css={{
                    scrollbarWidth: "thin",
                    "&::-webkit-scrollbar": { height: "6px" },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                    "&::-webkit-scrollbar-thumb": { 
                        background: scrollbarThumbBg, 
                        borderRadius: "8px" 
                    },
                    "&::-webkit-scrollbar-thumb:hover": { 
                        background: scrollbarThumbHoverBg 
                    }
                }}
            >
                <ChakraTable.Root size="md" variant="line" minW="760px">
                    <TableHead
                        columns={columns}
                        sortBy={state.sortBy}
                        sortOrder={state.sortOrder}
                        onSort={handlers.handleSort}
                        borderColor={borderColor}
                        hasActions={Boolean(actions && actions.length > 0)}
                    />
                    <ChakraTable.Body>
                        {loading ? (
                            Array.from({ length: 4 }).map((_, idx) => (
                                <ChakraTable.Row key={`skeleton-row-${idx}`}>
                                    {columns.map((col, colIdx) => (
                                        <ChakraTable.Cell key={colIdx} py={6}>
                                            <Box
                                                h="16px"
                                                bg={skeletonBg}
                                                borderRadius="md"
                                                css={{
                                                    animation: "shimmer 1.5s infinite ease-in-out",
                                                    "@keyframes shimmer": {
                                                        "0%": { opacity: 0.4 },
                                                        "50%": { opacity: 0.8 },
                                                        "100%": { opacity: 0.4 }
                                                    }
                                                }}
                                            />
                                        </ChakraTable.Cell>
                                    ))}
                                    {actions && actions.length > 0 && <ChakraTable.Cell py={6} />}
                                </ChakraTable.Row>
                            ))
                        ) : processedData.length > 0 ? (
                            processedData.map((row, idx) => (
                                <TableRow
                                    key={idx}
                                    row={row}
                                    columns={columns}
                                    actions={actions}
                                    borderColor={borderColor}
                                    index={idx}
                                />
                            ))
                        ) : (
                            <ChakraTable.Row>
                                <ChakraTable.Cell colSpan={columns.length + (actions ? 1 : 0)} py={10} textAlign="center" bg="app.card.bg">
                                    <VStack gap={1}>
                                        <Text fontWeight="800" color="gray.400">No records found</Text>
                                        <Text fontSize="xs" color="gray.500">Try adjusting your filters or search query.</Text>
                                    </VStack>
                                </ChakraTable.Cell>
                            </ChakraTable.Row>
                        )}
                    </ChakraTable.Body>
                </ChakraTable.Root>
            </Box>
        );
    }, [isMobile, processedData, columns, actions, state.sortBy, state.sortOrder, handlers.handleSort, borderColor, scrollbarThumbBg, scrollbarThumbHoverBg, loading, skeletonBg]);

    return (
        <VStack align="stretch" gap={0} w="full">
            <Flex
                justify="space-between"
                align={{ base: "start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={4}
                mb={6}
                p={4}
                borderRadius="2xl"
                bg={"app.card.bg"}
                border="1px solid"
                borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}
                // backdropFilter="blur(8px)"
            >
                <VStack align="start" gap={1.5}>
                    <HStack gap={2.5}>
                        <Icon as={Database} color="blue.500" fontSize="18px" />
                        <Heading
                            fontSize={{ base: "xl", md: "2xl" }}
                            fontWeight="950"
                            letterSpacing="tight"
                            color={useColorModeValue("gray.950", "white")}
                        >
                            {title || "Data Management"}
                        </Heading>
                    </HStack>
                    <Text fontSize="xs" fontWeight="700" color="gray.500">
                        Real-time tracking, sorting, and management dashboard.
                    </Text>
                </VStack>

                <HStack
                    gap={2}
                    px={3.5}
                    py={1.5}
                    border="1px solid"
                    borderColor={useColorModeValue(loading ? "blue.100/60" : "blue.100/60", "whiteAlpha.100")}
                    borderRadius="full"
                    // boxShadow="sm"
                >
                    <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg={loading ? "blue.500" : "green.500"}
                        css={{
                            animation: "pulse-glow 2.5s infinite",
                            "@keyframes pulse-glow": {
                                "0%": { transform: "scale(0.9)", boxShadow: loading ? "0 0 0 0 rgba(59, 130, 246, 0.6)" : "0 0 0 0 rgba(72, 187, 120, 0.6)" },
                                "70%": { transform: "scale(1)", boxShadow: loading ? "0 0 0 6px rgba(59, 130, 246, 0)" : "0 0 0 6px rgba(72, 187, 120, 0)" },
                                "100%": { transform: "scale(0.9)", boxShadow: "0 0 0 0 rgba(0,0,0,0)" }
                            }
                        }}
                    />
                    <Icon as={Layers} color={useColorModeValue("blue.500", "blue.400")} fontSize="11px" />
                    <Text
                        fontSize="10px"
                        fontWeight="800"
                        color={useColorModeValue("blue.800", "blue.300")}
                        textTransform="uppercase"
                        letterSpacing="widest"
                    >
                        {loading ? "Syncing..." : `${pagination.totalCount} Active Records`}
                    </Text>
                </HStack>
            </Flex>

            <FilterPanel
                searchQuery={state.searchQuery}
                onSearch={handlers.handleSearch}
                onClear={handlers.clearFilters}
            />

            <Box
                // boxShadow="md"
                borderRadius="xl"
                bg={"app.card.bg"}
                border="1px solid"
                borderColor={borderColor}
                transition="all 0.25s"
            >
                {tableContent}
            </Box>

            <Pagination
                pagination={pagination}
                onPageChange={handlers.handlePageChange}
                onPageSizeChange={handlers.handlePageSizeChange}
            />
        </VStack>
    );
}

export default memo(DataTable) as typeof DataTable;
