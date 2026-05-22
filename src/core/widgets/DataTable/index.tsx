import React, { memo, useMemo } from "react";
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
import FilterPanel from "./FilterPanel";
import TableHead from "./TableHead";
import TableRow from "./TableRow";
import Pagination from "./Pagination";
import { MobileTableCard } from "./MobileTableCard";

interface DataTableProps<T> {
    title?: string;
    data: T[];
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[];
    initialState?: Partial<DataTableState>;
    onStateChange?: (state: DataTableState) => void;
}

/**
 * DataTable
 * Adaptive desktop/mobile data presentation with sorting, search and pagination.
 */
function DataTable<T extends Record<string, any>>({
    title,
    data,
    columns,
    actions,
    initialState,
    onStateChange
}: DataTableProps<T>) {
    const { state, processedData, pagination, handlers } = useDataTable({
        data,
        initialState,
        onStateChange
    });

    const isMobile = useBreakpointValue({ base: true, md: false });
    const panelBg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const emptyCardBg = useColorModeValue("gray.50", "whiteAlpha.100");

    const tableContent = useMemo(() => {
        if (isMobile) {
            return (
                <VStack gap={3} align="stretch" w="full" p={{ base: 3, sm: 4 }}>
                    {processedData.map((row, idx) => (
                        <MobileTableCard key={idx} row={row} columns={columns} actions={actions} />
                    ))}

                    {processedData.length === 0 && (
                        <Box
                            borderRadius="lg"
                            p={6}
                            // bg={emptyCardBg}

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
                        background: useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.08)"), 
                        borderRadius: "8px" 
                    },
                    "&::-webkit-scrollbar-thumb:hover": { 
                        background: useColorModeValue("rgba(0,0,0,0.16)", "rgba(255,255,255,0.16)") 
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
                        {processedData.length > 0 ? (
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
                                <ChakraTable.Cell colSpan={columns.length + (actions ? 1 : 0)} py={10} textAlign="center">
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
    }, [isMobile, processedData, columns, actions, state.sortBy, state.sortOrder, handlers.handleSort, borderColor, emptyCardBg]);

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
                         backdropFilter="blur(8px)"
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
                    // bg={useColorModeValue("blue.50/30", "whiteAlpha.50")}
                    border="1px solid"
                    borderColor={useColorModeValue("blue.100/60", "whiteAlpha.100")}
                    borderRadius="full"
                    boxShadow="sm"
                >
                    <Box
                        w="6px"
                        h="6px"
                        borderRadius="full"
                        bg="green.500"
                        css={{
                            animation: "pulse-glow 2.5s infinite",
                            "@keyframes pulse-glow": {
                                "0%": { transform: "scale(0.9)", boxShadow: "0 0 0 0 rgba(72, 187, 120, 0.6)" },
                                "70%": { transform: "scale(1)", boxShadow: "0 0 0 6px rgba(72, 187, 120, 0)" },
                                "100%": { transform: "scale(0.9)", boxShadow: "0 0 0 0 rgba(72, 187, 120, 0)" }
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
                        {pagination.totalCount} Active Records
                    </Text>
                </HStack>
            </Flex>

            <FilterPanel
                searchQuery={state.searchQuery}
                onSearch={handlers.handleSearch}
                onClear={handlers.clearFilters}
            />

            <Box
                boxShadow="md"
                    // boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
                borderRadius="xl"
                // bg={panelBg}
                bg={"app.card.bg"}
                border="1px solid"
                borderColor={borderColor}
                transition="all 0.25s"
                // _hover={{ boxShadow: "0 18px 40px -24px rgba(0, 0, 0, 0.35)" }}
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
