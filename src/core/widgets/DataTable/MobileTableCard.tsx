import React, { memo, useMemo } from "react";
import { VStack, Flex, Box, Text, Separator, SimpleGrid, Badge, HStack, Icon, Button } from "@chakra-ui/react";
import { 
  Key, 
  User, 
  Phone, 
  Home, 
  Shield, 
  Wrench, 
  Calendar, 
  Tag, 
  CreditCard, 
  Activity, 
  Layers, 
  Hash 
} from "lucide-react";
import { DataTableColumn, DataTableAction } from "./types";
import { useColorModeValue } from "@/components/ui/color-mode";
import LoadIcon from "@/utils/hooks/LoadIcon";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box as any);

interface MobileTableCardProps<T> {
    row: T;
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[];
}

/**
 * Maps cell fields to a context-appropriate icon for mobile card elements.
 */
const getCellIcon = (key: string) => {
  const normKey = String(key).toLowerCase();
  
  if (normKey === "id" || normKey.includes("tenant_id") || normKey.includes("ticket_id") || normKey.includes("record_id")) return Key;
  if (normKey.includes("name") || normKey.includes("trainer") || normKey.includes("firstname")) return User;
  if (normKey.includes("phone") || normKey.includes("contact") || normKey.includes("mobile")) return Phone;
  if (normKey.includes("room") || normKey.includes("bed")) return Home;
  if (normKey.includes("building") || normKey.includes("location") || normKey.includes("campus")) return Layers;
  return undefined;
};

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

const getNestedValue = (obj: any, path: string): any => {
    if (!obj || !path) return undefined;
    const parts = path.split(".");
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
};

/**
 * MobileTableCard
 * Redesigned generic card renderer for mobile viewports, complete with row-actions support.
 */
function MobileTableCardComponent<T extends Record<string, any>>({ row, columns, actions }: MobileTableCardProps<T>) {
    const bg = useColorModeValue("white", "whiteAlpha.50");
    const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const secondaryColor = useColorModeValue("gray.500", "gray.400");
    const titleColor = useColorModeValue("gray.950", "white");

    const { primaryColumn, statusColumn, detailColumns } = useMemo(() => {
        const firstColumn = columns[0];
        const detectedStatus = columns.find((col) => col.isStatus || String(col.key).toLowerCase().includes("status") || String(col.key).toLowerCase().includes("plan") || String(col.key).toLowerCase().includes("urgency"));
        const rest = columns
            .filter((col) => col.key !== firstColumn?.key && col.key !== detectedStatus?.key)
            .slice(0, 4);

        return {
            primaryColumn: firstColumn,
            statusColumn: detectedStatus,
            detailColumns: rest
        };
    }, [columns]);

    const primaryValue = primaryColumn ? getNestedValue(row, String(primaryColumn.key)) : "Record";
    const statusValue = statusColumn ? getNestedValue(row, String(statusColumn.key)) : null;

    const visibleActions = useMemo(() => {
        if (!actions) return [];
        return actions.filter(a => !a.isVisible || a.isVisible(row));
    }, [actions, row]);

    const primaryCellIcon = primaryColumn ? getCellIcon(String(primaryColumn.key)) : undefined;

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
            // boxShadow="sm"
            _hover={{ transform: "translateY(-1px)", boxShadow: "md", borderColor: "blue.200" }}
        >
            <VStack align="stretch" gap={3}>
                <Flex justify="space-between" align="flex-start" gap={3}>
                    <VStack align="start" gap={0.5} minW={0}>
                        <HStack gap={1.5} maxW="full">
                            {primaryCellIcon && (
                                <Icon as={primaryCellIcon} color="blue.500" fontSize="12px" />
                            )}
                            <Text
                                fontWeight="800"
                                fontSize="sm"
                                color={titleColor}
                                lineClamp={1}
                            >
                                {String(primaryValue ?? "Record")}
                            </Text>
                        </HStack>
                        <Text fontSize="10px" fontWeight="700" color={secondaryColor} textTransform="uppercase" letterSpacing="wider">
                            {primaryColumn?.label || "Row"}
                        </Text>
                    </VStack>

                    {statusValue != null && <SmartBadge value={String(statusValue)} />}
                </Flex>

                <Separator opacity={0.15} />

                {detailColumns.length > 0 ? (
                    <SimpleGrid columns={2} gap={3.5}>
                        {detailColumns.map((col) => {
                            const value = getNestedValue(row, String(col.key));
                            const CellIcon = getCellIcon(String(col.key));
                            return (
                                <VStack key={String(col.key)} align="start" gap={0.5} minW={0}>
                                    <Text fontSize="10px" fontWeight="700" color={secondaryColor} textTransform="uppercase" lineClamp={1}>
                                        {col.label}
                                    </Text>
                                    <HStack gap={1.5} maxW="full">
                                        {CellIcon && (
                                            <Icon as={CellIcon} color="gray.400" fontSize="10px" opacity={0.6} />
                                        )}
                                        <Text fontSize="xs" fontWeight="600" lineClamp={1}>
                                            {String(value ?? "-")}
                                        </Text>
                                    </HStack>
                                </VStack>
                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <Text fontSize="xs" color={secondaryColor}>No additional columns</Text>
                )}

                {visibleActions.length > 0 && (
                    <>
                        <Separator opacity={0.15} my={0.5} />
                        <HStack gap={2.5} justify="flex-end" w="full" mt={0.5}>
                            {visibleActions.map((action, i) => (
                                <Button
                                    key={i}
                                    size="xs"
                                    variant="subtle"
                                    colorPalette={action.isDanger ? "red" : (action.colorPalette || "blue")}
                                    fontWeight="800"
                                    fontSize="10px"
                                    letterSpacing="wide"
                                    borderRadius="lg"
                                    onClick={() => {
                                        if (action.requiresConfirm) {
                                            if (window.confirm(action.confirmMessage || "Are you sure?")) {
                                                action.onClick(row);
                                            }
                                        } else {
                                            action.onClick(row);
                                        }
                                    }}
                                    h="26px"
                                    px={3}
                                >
                                    <HStack gap={1}>
                                        {action.icon && <LoadIcon iconName={action.icon} size="11px" />}
                                        <Text>{action.label}</Text>
                                    </HStack>
                                </Button>
                            ))}
                        </HStack>
                    </>
                )}
            </VStack>
        </MotionBox>
    );
}

export const MobileTableCard = memo(MobileTableCardComponent) as typeof MobileTableCardComponent;
