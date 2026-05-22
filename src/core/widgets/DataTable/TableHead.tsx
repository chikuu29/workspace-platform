import React, { memo } from "react";
import { Table, Icon, HStack, Text, Box } from "@chakra-ui/react";
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown,
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
 * Maps standard column keys and labels to premium, context-appropriate Lucide icons.
 */
const getColumnIcon = (label: string, key: string) => {
  const normLabel = label.toLowerCase();
  const normKey = String(key).toLowerCase();
  
  if (normKey === "id" || normKey.includes("ticket_id") || normKey.includes("tenant_id") || normKey.includes("record_id")) return Key;
  if (normLabel.includes("name") || normLabel.includes("tenant") || normLabel.includes("trainer") || normKey.includes("firstname")) return User;
  if (normLabel.includes("phone") || normLabel.includes("contact") || normLabel.includes("mobile")) return Phone;
  if (normLabel.includes("room") || normLabel.includes("bed")) return Home;
  if (normLabel.includes("building") || normLabel.includes("location") || normLabel.includes("campus")) return Layers;
  if (normLabel.includes("status") || normLabel.includes("rent status") || normLabel.includes("urgency")) return Shield;
  if (normLabel.includes("complaint") || normLabel.includes("category") || normLabel.includes("issue")) return Wrench;
  if (normLabel.includes("date") || normLabel.includes("time") || normLabel.includes("visit")) return Calendar;
  if (normLabel.includes("plan") || normLabel.includes("membership") || normLabel.includes("tier")) return Tag;
  if (normLabel.includes("payment") || normLabel.includes("due") || normLabel.includes("invoice") || normLabel.includes("bill")) return CreditCard;
  if (normLabel.includes("activity") || normLabel.includes("rate") || normLabel.includes("metric")) return Activity;
  return Hash;
};

/**
 * TableHead
 * Dynamic, high-fidelity sticky header with sorting indicators and contextual icons.
 */
function TableHead<T>({
    columns,
    sortBy,
    sortOrder,
    onSort,
    borderColor,
    hasActions = false
}: TableHeaderProps<T>) {
    const dividerColor = useColorModeValue("gray.100", "whiteAlpha.200");
    const labelColor = useColorModeValue("gray.700", "gray.200");

    return (
        <Table.Header position="sticky" top={0} zIndex={20}>
            <Table.Row
                bg="app.card.bg"
                backdropFilter="blur(10px)"
                borderBottom="1px solid"
                borderColor={borderColor}
            >
                {columns.map((col, idx) => {
                    const isSorted = sortBy === col.key;
                    const ColIcon = getColumnIcon(col.label, String(col.key));

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
                            py={4.5}
                            px={5}
                            whiteSpace="nowrap"
                            borderRight={idx < columns.length - 1 ? "1px solid" : "none"}
                            borderRightColor={dividerColor}
                            cursor={col.isSortable ? "pointer" : "default"}
                            onClick={() => col.isSortable && onSort(String(col.key))}
                            userSelect="none"
                            transition="all 0.2s"
                            _hover={col.isSortable ? { bg: "rgba(0, 0, 0, 0.02)", color: "blue.500" } : {}}
                            position="relative"
                            zIndex={21}
                        >
                            <HStack gap={2.5} justify={col.textAlign === "center" ? "center" : "flex-start"}>
                                <Icon as={ColIcon} color={isSorted ? "blue.500" : "gray.400"} fontSize="12px" opacity={0.8} />
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
                                    height="2.5px"
                                    bg="blue.500"
                                    borderRadius="full"
                                    boxShadow="0 -1px 4px var(--chakra-colors-blue-500)"
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
                        py={4.5}
                        px={5}
                        color={labelColor}
                        whiteSpace="nowrap"
                        width="1%"
                        position="sticky"
                        right={0}
                        zIndex={23}
                        bg="app.card.bg"
                        backdropFilter="blur(10px)"
                        boxShadow={useColorModeValue(
                            "inset 1px 0 0 var(--chakra-colors-gray-100), -8px 0 12px -8px rgba(0, 0, 0, 0.12)",
                            "inset 1px 0 0 rgba(255, 255, 255, 0.1), -8px 0 12px -8px rgba(0, 0, 0, 0.3)"
                        )}
                    >
                        Actions
                    </Table.ColumnHeader>
                )}
            </Table.Row>
        </Table.Header>
    );
}

export default memo(TableHead) as typeof TableHead;
