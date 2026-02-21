import React, { memo, useMemo } from "react";
import {
    Box,
    VStack,
    Flex,
    Heading,
    Table as ChakraTable,
    Text,
    HStack,
    useBreakpointValue
} from "@chakra-ui/react";
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
                        <MobileTableCard key={idx} row={row} columns={columns} />
                    ))}

                    {processedData.length === 0 && (
                        <Box
                            borderRadius="lg"
                            p={6}
                            bg={emptyCardBg}
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
            <Flex justify="space-between" align="end" mb={6} wrap="wrap" gap={3}>
                <VStack align="start" gap={1}>
                    <Heading size="lg" fontWeight="900" letterSpacing="tight">
                        {title || "Data Management"}
                    </Heading>
                    <HStack gap={2}>
                        <Box w="8px" h="8px" borderRadius="full" bg="green.500" boxShadow="0 0 8px var(--chakra-colors-green-500)" />
                        <Text fontSize="xs" fontWeight="700" color="gray.500" textTransform="uppercase" letterSpacing="widest">
                            {pagination.totalCount} Active Records
                        </Text>
                    </HStack>
                </VStack>
            </Flex>

            <FilterPanel
                searchQuery={state.searchQuery}
                onSearch={handlers.handleSearch}
                onClear={handlers.clearFilters}
            />

            <Box
                boxShadow="xl"
                borderRadius="xl"
                bg={panelBg}
                border="1px solid"
                borderColor={borderColor}
                transition="all 0.25s"
                _hover={{ boxShadow: "0 18px 40px -24px rgba(0, 0, 0, 0.35)" }}
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
