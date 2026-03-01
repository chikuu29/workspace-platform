import React, { memo, useMemo } from "react";
import { VStack, Flex, Box, Text, Separator, SimpleGrid, Badge } from "@chakra-ui/react";
import { DataTableColumn } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box as any);

interface MobileTableCardProps<T> {
    row: T;
    columns: DataTableColumn<T>[];
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
            px={2.5}
            py={0.5}
            borderRadius="full"
            fontWeight="800"
            fontSize="9px"
            letterSpacing="wider"
            textTransform="uppercase"
        >
            {value}
        </Badge>
    );
};

/**
 * MobileTableCard
 * Generic column-driven card renderer for compact screens.
 */
function MobileTableCardComponent<T extends Record<string, any>>({ row, columns }: MobileTableCardProps<T>) {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const secondaryColor = useColorModeValue("gray.500", "gray.400");
    const titleColor = useColorModeValue("gray.900", "white");

    const { primaryColumn, statusColumn, detailColumns } = useMemo(() => {
        const firstColumn = columns[0];
        const detectedStatus = columns.find((col) => col.isStatus || String(col.key).toLowerCase().includes("status") || String(col.key).toLowerCase().includes("plan"));
        const rest = columns
            .filter((col) => col.key !== firstColumn?.key && col.key !== detectedStatus?.key)
            .slice(0, 4);

        return {
            primaryColumn: firstColumn,
            statusColumn: detectedStatus,
            detailColumns: rest
        };
    }, [columns]);

    const primaryValue = primaryColumn ? row[primaryColumn.key as keyof T] : "Record";
    const statusValue = statusColumn ? row[statusColumn.key as keyof T] : null;

    return (
        <MotionBox
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            p={4}
            bg={bg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{ transform: "translateY(-1px)", boxShadow: "md", borderColor: "blue.200" }}
        >
            <VStack align="stretch" gap={3}>
                <Flex justify="space-between" align="flex-start" gap={3}>
                    <VStack align="start" gap={0.5} minW={0}>
                        <Text
                            fontWeight="800"
                            fontSize="sm"
                            color={titleColor}
                            lineClamp={1}
                        >
                            {String(primaryValue ?? "Record")}
                        </Text>
                        <Text fontSize="10px" fontWeight="700" color={secondaryColor} textTransform="uppercase" letterSpacing="wider">
                            {primaryColumn?.label || "Row"}
                        </Text>
                    </VStack>

                    {statusValue != null && <SmartBadge value={String(statusValue)} />}
                </Flex>

                <Separator opacity={0.2} />

                {detailColumns.length > 0 ? (
                    <SimpleGrid columns={2} gap={3}>
                        {detailColumns.map((col) => {
                            const value = row[col.key as keyof T];
                            return (
                                <VStack key={String(col.key)} align="start" gap={0} minW={0}>
                                    <Text fontSize="10px" fontWeight="700" color={secondaryColor} textTransform="uppercase" lineClamp={1}>
                                        {col.label}
                                    </Text>
                                    <Text fontSize="xs" fontWeight="600" lineClamp={1}>
                                        {String(value ?? "-")}
                                    </Text>
                                </VStack>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <Text fontSize="xs" color={secondaryColor}>No additional columns</Text>
                )}
            </VStack>
        </MotionBox>
    );
}

export const MobileTableCard = memo(MobileTableCardComponent) as typeof MobileTableCardComponent;
