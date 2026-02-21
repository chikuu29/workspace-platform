import React, { memo } from "react";
import { Table, Icon, HStack, Text, Box } from "@chakra-ui/react";
import { LuArrowUp, LuArrowDown, LuArrowUpDown } from "react-icons/lu";
import { DataTableColumn, SortOrder } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";

interface TableHeaderProps<T> {
    columns: DataTableColumn<T>[];
    sortBy: string | null;
    sortOrder: SortOrder;
    onSort: (key: string) => void;
    headerBg: string;
    borderColor: string;
}

/**
 * TableHead
 * Sticky header component for the DataTable.
 * Implements sorting logic with visual cues and stable click handlers.
 */
function TableHead<T>({
    columns,
    sortBy,
    sortOrder,
    onSort,
    headerBg,
    borderColor
}: TableHeaderProps<T>) {
    const glassBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(20, 20, 20, 0.8)");

    return (
        <Table.Header bg={headerBg} position="sticky" top={0} zIndex={10}>
            <Table.Row
                bg={glassBg}
                backdropFilter="blur(12px)"
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
                            color="gray.500"
                            fontWeight="800"
                            fontSize="10px"
                            textTransform="uppercase"
                            letterSpacing="widest"
                            py={4}
                            px={6}
                            borderRight={idx < columns.length - 1 ? "1px solid" : "none"}
                            borderRightColor={useColorModeValue("gray.50", "whiteAlpha.50")}
                            cursor={col.isSortable ? "pointer" : "default"}
                            onClick={() => col.isSortable && onSort(String(col.key))}
                            userSelect="none"
                            transition="all 0.2s"
                            _hover={col.isSortable ? { bg: "whiteAlpha.100", color: "blue.500" } : {}}
                            position="relative"
                        >
                            <HStack gap={2} justify={col.textAlign === "center" ? "center" : "flex-start"}>
                                <Text>{col.label}</Text>
                                {col.isSortable && (
                                    <Icon
                                        as={isSorted ? (sortOrder === "asc" ? LuArrowUp : LuArrowDown) : LuArrowUpDown}
                                        color={isSorted ? "blue.500" : "gray.400"}
                                        fontSize="10px"
                                        transition="transform 0.2s"
                                        transform={isSorted ? "scale(1.2)" : "scale(1)"}
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
                                    boxShadow="0 0 8px var(--chakra-colors-blue-500)"
                                />
                            )}
                        </Table.ColumnHeader>
                    );
                })}
            </Table.Row>
        </Table.Header>
    );
}

export default memo(TableHead) as typeof TableHead;
