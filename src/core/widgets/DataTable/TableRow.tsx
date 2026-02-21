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

/**
 * SmartBadge (Premium version with subtle glow and gradients)
 */
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
    for (const [key, c] of Object.entries(colorMap)) {
        if (val.includes(key)) {
            colorPalette = c;
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
 * Enhanced with motion entry and hover selection accents.
 */
function TableRowComponent<T>({ row, columns, actions, borderColor, index }: TableRowProps<T>) {
    const hoverBg = useColorModeValue("blue.50/40", "whiteAlpha.100");
    const textColor = useColorModeValue("gray.700", "whiteAlpha.900");
    const cellBorderColor = useColorModeValue("gray.50/50", "whiteAlpha.50");

    return (
        <MotionRow
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            _hover={{ bg: hoverBg }}
            position="relative"
            cursor="pointer"
        >
            {columns.map((col, cIdx) => (
                <Table.Cell
                    key={String(col.key)}
                    textAlign={col.textAlign || "left"}
                    py={4}
                    px={6}
                    fontSize="13px"
                    fontWeight="600"
                    borderColor={cellBorderColor}
                    color={textColor}
                    position="relative"
                >
                    {/* Selection Accent on the first cell */}
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
                        col.renderComponent(row[col.key as keyof T], row)
                    ) : col.isStatus || String(col.key).toLowerCase().includes('status') || String(col.key).toLowerCase().includes('plan') ? (
                        <SmartBadge value={String(row[col.key as keyof T])} />
                    ) : (
                        <Text transition="color 0.2s">
                            {String(row[col.key as keyof T] || "-")}
                        </Text>
                    )}
                </Table.Cell>
            ))}

            {actions && actions.length > 0 && (
                <Table.Cell py={4} px={6} textAlign="right" borderColor={cellBorderColor}>
                    <ActionMenu row={row} actions={actions} />
                </Table.Cell>
            )}
        </MotionRow>
    );
}

const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
export default TableRow;
