import React, { memo } from "react";
import { Table, Text, Box, Badge, HStack, Icon, IconButton } from "@chakra-ui/react";
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
import ActionMenu from "./ActionMenu";
import { useColorModeValue } from "@/components/ui/color-mode";
import LoadIcon from "@/utils/hooks/LoadIcon";
import { motion } from "framer-motion";

const MotionRow = motion.create(Table.Row as any);

interface TableRowProps<T> {
    row: T;
    columns: DataTableColumn<T>[];
    actions?: DataTableAction<T>[];
    borderColor: string;
    index: number;
}

/**
 * Maps cell fields to a context-appropriate icon for highly polished inline layout cues.
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
 * Renders row actions dynamically using direct buttons for quick access 
 * and a clean vertical dropdown for secondary options.
 */
const RowActions = memo(function RowActions<T>({ row, actions }: { row: T; actions: DataTableAction<T>[] }) {
    const visibleActions = actions.filter(a => !a.isVisible || a.isVisible(row));

    if (visibleActions.length === 0) return null;

    // Standard colored direct shortcuts if we have 1 or 2 actions
    if (visibleActions.length <= 2) {
        return (
            <HStack gap={2} justify="flex-end">
                {visibleActions.map((action, i) => (
                    <IconButton
                        key={i}
                        variant="subtle"
                        size="xs"
                        colorPalette={action.isDanger ? "red" : (action.colorPalette || "blue")}
                        borderRadius="md"
                        aria-label={action.label}
                        onClick={() => {
                            if (action.requiresConfirm) {
                                if (window.confirm(action.confirmMessage || "Are you sure?")) {
                                    action.onClick(row);
                                }
                            } else {
                                action.onClick(row);
                            }
                        }}
                        _hover={{ transform: "scale(1.08)" }}
                        transition="all 0.15s"
                        boxShadow="xs"
                        h="26px"
                        w="26px"
                    >
                        {action.icon ? (
                            <LoadIcon iconName={action.icon} size="12px" />
                        ) : (
                            <Text fontSize="10px" fontWeight="800">{action.label.substring(0, 1)}</Text>
                        )}
                    </IconButton>
                ))}
            </HStack>
        );
    }

    // High-end Stripe style split layout for >2 actions (1 direct action + 1 drop menu for rest)
    return (
        <HStack gap={2} justify="flex-end">
            <IconButton
                variant="subtle"
                size="xs"
                colorPalette={visibleActions[0].isDanger ? "red" : (visibleActions[0].colorPalette || "blue")}
                borderRadius="md"
                aria-label={visibleActions[0].label}
                onClick={() => {
                    if (visibleActions[0].requiresConfirm) {
                        if (window.confirm(visibleActions[0].confirmMessage || "Are you sure?")) {
                            visibleActions[0].onClick(row);
                        }
                    } else {
                        visibleActions[0].onClick(row);
                    }
                }}
                _hover={{ transform: "scale(1.08)" }}
                transition="all 0.15s"
                boxShadow="xs"
                h="26px"
                w="26px"
            >
                {visibleActions[0].icon ? (
                    <LoadIcon iconName={visibleActions[0].icon} size="12px" />
                ) : (
                    <Text fontSize="10px" fontWeight="800">{visibleActions[0].label.substring(0, 1)}</Text>
                )}
            </IconButton>

            <ActionMenu row={row} actions={visibleActions.slice(1)} />
        </HStack>
    );
});

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
 * TableRow
 * Animated body row with inline context icons and sticky action shortcut columns.
 */
function TableRowComponent<T>({ row, columns, actions, borderColor, index }: TableRowProps<T>) {
    const hoverBg = useColorModeValue("blue.50/20", "whiteAlpha.50");
    const textColor = useColorModeValue("gray.800", "whiteAlpha.950");
    const cellBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");
    const zebraBg = useColorModeValue(index % 2 === 0 ? "white" : "gray.50/40", index % 2 === 0 ? "transparent" : "whiteAlpha.50/20");

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
                const rawValue = getNestedValue(row, String(col.key));
                const normalizedValue = rawValue ?? "-";
                const shouldRenderBadge = col.isStatus || String(col.key).toLowerCase().includes("status") || String(col.key).toLowerCase().includes("plan") || String(col.key).toLowerCase().includes("urgency");

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
                                width="3px"
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
                    py={3}
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
                    boxShadow={useColorModeValue(
                        "inset 1px 0 0 var(--chakra-colors-gray-100), -8px 0 12px -8px rgba(0, 0, 0, 0.12)",
                        "inset 1px 0 0 rgba(255, 255, 255, 0.1), -8px 0 12px -8px rgba(0, 0, 0, 0.3)"
                    )}
                >
                    <RowActions row={row} actions={actions} />
                </Table.Cell>
            )}
        </MotionRow>
    );
}

const TableRow = memo(TableRowComponent) as typeof TableRowComponent;
export default TableRow;
