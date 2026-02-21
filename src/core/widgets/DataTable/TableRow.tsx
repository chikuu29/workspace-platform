import React, { memo } from "react";
import { Table, Text, Box, Badge } from "@chakra-ui/react";
import { DataTableColumn, DataTableAction } from "./types";
import ActionMenu from "./ActionMenu";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion } from "framer-motion";

const MotionRow = motion(Table.Row as any);

interface TableRowProps<T> {
    row: T;
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[];
    borderColor: string;
    index: number;
}

const SmartBadge = ({ value }: { value: any }) => {
    const val = String(value).toLowerCase();
    const colorMap: Record<string, string> = {
        active: "green",
        inactive: "gray",
        platinum: "purple",
        basic: "blue",
        flex: "teal",
        completed: "green",
        pending: "orange",
        failed: "red"
    };

    let colorPalette = "gray";
    for (const [key, colorName] of Object.entries(colorMap)) {
        if (val.includes(key)) {
            colorPalette = colorName;
            break;
        }
    }

    return (
        <Badge
            variant="solid"
            colorPalette={colorPalette}
            size="sm"
            px={3}
            py={0.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="9px"
            letterSpacing="wider"
            textTransform="uppercase"
            boxShadow={useColorModeValue(`0 2px 4px var(--chakra-colors-${colorPalette}-200)`, "none")}
        >
            {value}
        </Badge>
    );
};

/**
 * TableRow
 * Animated body row with sticky first column and status badge rendering.
 */
function TableRowComponent<T>({ row, columns, actions, borderColor, index }: TableRowProps<T>) {
    const hoverBg = useColorModeValue("blue.50/35", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const cellBorderColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const zebraBg = useColorModeValue(index % 2 === 0 ? "white" : "gray.50", index % 2 === 0 ? "transparent" : "whiteAlpha.50");

    return (
        <MotionRow
            role="group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: Math.min(index * 0.02, 0.2) }}
            _hover={{ bg: hoverBg }}
            bg={zebraBg}
            position="relative"
        >
            {columns.map((col, cIdx) => {
                const rawValue = row[col.key as keyof T];
                const normalizedValue = rawValue ?? "-";
                const shouldRenderBadge = col.isStatus || String(col.key).toLowerCase().includes("status") || String(col.key).toLowerCase().includes("plan");

                return (
                    <Table.Cell
                        key={String(col.key)}
                        textAlign={col.textAlign || "left"}
                        py={3.5}
                        px={5}
                        fontSize="13px"
                        fontWeight="600"
                        borderColor={cellBorderColor}
                        color={textColor}
                        whiteSpace="nowrap"
                        position="relative"
                        zIndex={5}
                    >
                        {cIdx === 0 && (
                            <Box
                                position="absolute"
                                left={0}
                                top={0}
                                bottom={0}
                                width="2px"
                                bg="blue.500"
                                opacity={0}
                                transition="opacity 0.2s"
                                _groupHover={{ opacity: 1 }}
                            />
                        )}

                        {col.renderComponent ? (
                            col.renderComponent(normalizedValue, row)
                        ) : shouldRenderBadge ? (
                            <SmartBadge value={String(normalizedValue)} />
                        ) : (
                            <Text>{String(normalizedValue)}</Text>
                        )}
                    </Table.Cell>
                );
            })}

            {actions && actions.length > 0 && (
                <Table.Cell
                    py={3.5}
                    px={5}
                    textAlign="right"
                    borderColor={cellBorderColor}
                    whiteSpace="nowrap"
                    width="1%"
                    position="sticky"
                    right={0}
                    zIndex={7}
                    bg="inherit"
                    _groupHover={{ bg: "inherit" }}
                    boxShadow={useColorModeValue("inset 1px 0 0 var(--chakra-colors-gray-100)", "inset 1px 0 0 rgba(255,255,255,0.16)")}
                >
                    <ActionMenu row={row} actions={actions} />
                </Table.Cell>
            )}
        </MotionRow>
    );
}

const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
export default TableRow;
