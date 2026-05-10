import React, { memo } from "react";
import { VStack, Flex, HStack, Box, Text, Separator, SimpleGrid, Badge } from "@chakra-ui/react";
import { User, MoreHorizontal } from "lucide-react";
import { DataTableColumn } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box as any);

interface MobileDataCardProps<T> {
    row: T;
    columns: DataTableColumn<T>[];
}

/**
 * SmartBadge (Internal helper for mobile cards)
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
        >
            {value}
        </Badge>
    );
};

/**
 * MobileDataCard
 * Renders a single row of data as a card for mobile views.
 */
function MobileDataCardComponent<T extends Record<string, any>>({ row, columns }: MobileDataCardProps<T>) {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const secondaryColor = useColorModeValue("gray.500", "gray.400");

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            p={4}
            bg={bg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{ transform: "translateY(-2px)", boxShadow: "md", borderColor: "blue.500/20" }}
        >
            <VStack align="stretch" gap={3}>
                <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                        <Box p={2} bg="blue.100/10" borderRadius="lg" color="blue.500">
                            <User size={16} />
                        </Box>
                        <VStack align="start" gap={0}>
                            <Text fontWeight="800" fontSize="md">{row.name || row.label || row[columns[1]?.key] || "Record"}</Text>
                            <Text fontSize="xs" color={secondaryColor}>{row.id || "ID-UNKNOWN"}</Text>
                        </VStack>
                    </HStack>
                    <SmartBadge value={row.status || row.plan || "N/A"} />
                </Flex>
                <Separator opacity={0.1} />
                <SimpleGrid columns={2} gap={4}>
                    {columns.filter(c => c.key !== 'name' && c.key !== 'status' && c.key !== 'id').slice(0, 4).map(col => (
                        <VStack key={String(col.key)} align="start" gap={0}>
                            <Text fontSize="10px" fontWeight="700" color={secondaryColor} textTransform="uppercase">
                                {col.label}
                            </Text>
                            <Text fontSize="xs" fontWeight="600">{String(row[col.key as keyof T]) || "-"}</Text>
                        </VStack>
                    ))}
                </SimpleGrid>
                <HStack justify="end" pt={1}>
                    <Box p={1.5} color={secondaryColor} _hover={{ color: "blue.500" }} cursor="pointer">
                        <MoreHorizontal size={18} />
                    </Box>
                </HStack>
            </VStack>
        </MotionBox>
    );
}

export const MobileDataCard = memo(MobileDataCardComponent) as typeof MobileDataCardComponent;
