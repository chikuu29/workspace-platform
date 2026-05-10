import React, { memo } from "react";
import { Table, Icon, HStack, Text, Box } from "@chakra-ui/react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { DataTableColumn, SortOrder } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";

interface TableHeaderProps<T> {
    columns: DataTableColumn<T>[];
    sortBy: string | null;
    sortOrder: SortOrder;
    onSort: (key: string) => void;
    borderColor: string;
    hasActions?: boolean;
}

/**
 * TableHead
 * Sticky header with sorting cues and a sticky first column for wide data sets.
 */
function TableHead<T>({
    columns,
    sortBy,
    sortOrder,
    onSort,
    borderColor,
    hasActions = false
}: TableHeaderProps<T>) {
    const glassBg = useColorModeValue("rgba(255, 255, 255, 0.92)", "rgba(20, 20, 20, 0.85)");
    const dividerColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const labelColor = useColorModeValue("gray.600", "gray.300");

    return (
        <Table.Header position="sticky" top={0} zIndex={20}>
            <Table.Row
                bg={glassBg}
                backdropFilter="blur(10px)"
                borderBottom="1px solid"
                borderColor={borderColor}
            >
                {columns.map((col, idx) => {
                    const isSorted = sortBy === col.key;

                    return (
                        <Table.ColumnHeader
                            key={String(col.key)}
                            width={col.width}
                            textAlign={col.textAlign || "left"}
                            color={labelColor}
                            fontWeight="800"
                            fontSize="11px"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            py={4}
                            px={5}
                            whiteSpace="nowrap"
                            borderRight={idx < columns.length - 1 ? "1px solid" : "none"}
                            borderRightColor={dividerColor}
                            cursor={col.isSortable ? "pointer" : "default"}
                            onClick={() => col.isSortable && onSort(String(col.key))}
                            userSelect="none"
                            transition="all 0.2s"
                            _hover={col.isSortable ? { bg: "blackAlpha.50", color: "blue.500" } : {}}
                            position="relative"
                            zIndex={21}
                        >
                            <HStack gap={2} justify={col.textAlign === "center" ? "center" : "flex-start"}>
                                <Text>{col.label}</Text>
                                {col.isSortable && (
                                    <Icon
                                        as={isSorted ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown}
                                        color={isSorted ? "blue.500" : "gray.400"}
                                        fontSize="11px"
                                        transition="transform 0.2s"
                                        transform={isSorted ? "scale(1.15)" : "scale(1)"}
                                    />
                                )}
                            </HStack>

                            {isSorted && (
                                <Box
                                    position="absolute"
                                    bottom="-1px"
                                    left={0}
                                    right={0}
                                    height="2px"
                                    bg="blue.500"
                                />
                            )}
                        </Table.ColumnHeader>
                    );
                })}

                {hasActions && (
                    <Table.ColumnHeader
                        textAlign="right"
                        fontWeight="800"
                        fontSize="11px"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        py={4}
                        px={5}
                        color={labelColor}
                        whiteSpace="nowrap"
                        width="1%"
                        position="sticky"
                        right={0}
                        zIndex={23}
                        bg={glassBg}
                        boxShadow={useColorModeValue("inset 1px 0 0 var(--chakra-colors-gray-100)", "inset 1px 0 0 rgba(255,255,255,0.16)")}
                    >
                        Actions
                    </Table.ColumnHeader>
                )}
            </Table.Row>
        </Table.Header>
    );
}

export default memo(TableHead) as typeof TableHead;
