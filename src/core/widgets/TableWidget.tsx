import { InputGroup } from "@/components/ui/input-group";
import {
    PaginationItems,
    PaginationNextTrigger,
    PaginationPrevTrigger,
    PaginationRoot,
} from "@/components/ui/pagination";
import {
    Box,
    Flex,
    MenuRoot,
    MenuTrigger,
    IconButton,
    MenuContent,
    Input,
    VStack,
    Button,
    HStack,
    Table,
    Center,
    Spinner,
    Text,
    Icon,
    Badge,
} from "@chakra-ui/react";
import { forwardRef, memo, useCallback, useEffect, useState } from "react";
import { FaAngleDown, FaBoxOpen } from "react-icons/fa";
import { FaArrowDownShortWide, FaArrowUpShortWide } from "react-icons/fa6";
import { LuSearch } from "react-icons/lu";
import { MdOpenInNew } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";
import { TiEdit } from "react-icons/ti";
import { VscListFilter } from "react-icons/vsc";
import { Checkbox } from "@/components/ui/checkbox";
import { formatKey } from "@/utils/formatKey";
import { formatValue } from "@/utils/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ACTIONTYPES {
    types: "EDIT" | "DELETE" | "VIEW";
    title?: string;
    icon?: React.ReactNode;
    colorPalette?: string;
    action?: string;
}

interface TABLE_WIDGET {
    data?: any[];
    headerConfig?: any[];
    autoHeader?: boolean;
    paginationRequired?: boolean;
    paginationSettings?: {
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
    filltersRequired?: boolean;
    activeLoader?: boolean;
    api?: string;
    fillters?: any[];
    actionSet?: ACTIONTYPES[];
    onEvent?: (action: any) => void;
}

// ─── Stable defaults outside the component ───────────────────────────────────
// IMPORTANT: These MUST live outside the component. Inline defaults like
// `headerConfig = []` create a new array reference on every render, which
// makes them always look "changed" in a useEffect dep array → infinite loop.
const DEFAULT_ACTIONS: ACTIONTYPES[] = [
    { types: "VIEW", title: "Open", icon: <MdOpenInNew />, colorPalette: "blue", action: "openAction" },
    { types: "EDIT", title: "Edit", icon: <TiEdit />, colorPalette: "yellow", action: "editAction" },
    { types: "DELETE", title: "Delete", icon: <RiDeleteBin5Line />, colorPalette: "red", action: "deleteAction" },
];

const DEFAULT_HEADER_CONFIG: string[] = [];
const DEFAULT_DATA: any[] = [];
const DEFAULT_PAGINATION = { totalPages: 1, currentPage: 1, pageSize: 10 };

// Consistent row height keeps left data panel & right actions panel in sync
const ROW_HEIGHT = "56px";

// ─── TableWidget ─────────────────────────────────────────────────────────────

export const TableWidget = memo(
    forwardRef<any, TABLE_WIDGET>((props, _ref) => {
        const {
            data = DEFAULT_DATA,
            headerConfig = DEFAULT_HEADER_CONFIG,
            paginationRequired = false,
            autoHeader = true,
            activeLoader = true,
            filltersRequired = false,
            paginationSettings = DEFAULT_PAGINATION,
            actionSet = DEFAULT_ACTIONS,
            onEvent,
        } = props;

        const [isLoading, setLoading] = useState<boolean>(activeLoader);
        const [keys, setKeys] = useState<string[]>(headerConfig);
        const [sortKey, setSortKey] = useState<string | null>(null);
        const [sortAsc, setSortAsc] = useState<boolean>(true);

        // Auto-derive column keys from the first data row when no headerConfig was
        // provided. We guard with `keys.length === 0` instead of `headerConfig.length`
        // so we only derive once and avoid adding headerConfig to the dep array
        // (even with a stable ref, it keeps the intent explicit).
        useEffect(() => {
            if (autoHeader && data.length > 0 && keys.length === 0) {
                setKeys(Object.keys(data[0]));
            }
            setLoading(false);
            // `keys` intentionally omitted from deps: after the first derivation
            // keys.length > 0, so the setKeys branch never runs again.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [autoHeader, data]);

        // Stable sort toggle handler — avoids recreation on each render
        const handleSort = useCallback(
            (key: string) => {
                setSortKey((prev) => {
                    if (prev === key) setSortAsc((asc) => !asc);
                    else setSortAsc(true);
                    return key;
                });
            },
            []
        );

        // Client-side sort — only applied when a sortKey exists
        const sortedData = sortKey
            ? [...data].sort((a, b) => {
                const va = a[sortKey] ?? "";
                const vb = b[sortKey] ?? "";
                const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
                return sortAsc ? cmp : -cmp;
            })
            : data;

        // Dispatch row action events upward
        const sendEvent = useCallback(
            (e: React.MouseEvent, action: ACTIONTYPES, rowData: any) => {
                onEvent?.({ eventType: e.type, action: action.types, data: rowData });
            },
            [onEvent]
        );

        return (
            <Box>
                {/* ── Toolbar: search + filters ──────────────────────────────────── */}
                <Flex mb={4} gap={3} wrap="wrap" align="center" justify="space-between">
                    {/* Filter buttons */}
                    {filltersRequired && (
                        <HStack gap={2} flexShrink={0}>
                            <MenuRoot>
                                <MenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        borderRadius="full"
                                        px={4}
                                        gap={2}
                                        fontWeight="500"
                                        border="1px solid"
                                        borderColor="app.navbar.border"
                                        bg="app.card.bg"
                                        _hover={{ borderColor: "app.text.accent", bg: "app.card.bg" }}
                                        transition="all 0.2s"
                                    >
                                        Status <FaAngleDown />
                                    </Button>
                                </MenuTrigger>
                                <MenuContent p={3} borderRadius="xl" boxShadow="xl" minW="200px">
                                    <Input placeholder="Search value…" size="sm" mb={2} borderRadius="lg" />
                                    <VStack align="start" maxH="200px" overflowY="auto" gap={1}>
                                        {[
                                            { title: "Active", value: "active" },
                                            { title: "Pending", value: "pending" },
                                            { title: "Inactive", value: "inactive" },
                                        ].map(({ title, value }) => (
                                            <Button
                                                key={value}
                                                w="100%"
                                                variant="ghost"
                                                justifyContent="start"
                                                size="sm"
                                                borderRadius="md"
                                            >
                                                <Checkbox variant="subtle" cursor="pointer">{title}</Checkbox>
                                            </Button>
                                        ))}
                                    </VStack>
                                    <Button size="sm" colorPalette="blue" w="100%" mt={3} borderRadius="lg">
                                        Apply Filters
                                    </Button>
                                </MenuContent>
                            </MenuRoot>

                            <Button
                                variant="outline"
                                size="sm"
                                borderRadius="full"
                                px={4}
                                gap={2}
                                fontWeight="500"
                                border="1px solid"
                                borderColor="app.navbar.border"
                                bg="app.card.bg"
                                _hover={{ borderColor: "app.text.accent" }}
                                transition="all 0.2s"
                            >
                                <VscListFilter /> More Filters
                            </Button>
                        </HStack>
                    )}

                    {/* Search input */}
                    <InputGroup
                        startElement={<LuSearch />}
                        flex={1}
                        maxW={{ base: "100%", md: "380px" }}
                    >
                        <Input
                            placeholder="Search across all fields…"
                            borderRadius="full"
                            size="sm"
                            bg="app.card.bg"
                            border="1px solid"
                            borderColor="app.navbar.border"
                            _focus={{
                                borderColor: "app.text.accent",
                                boxShadow: "0 0 0 3px rgba(99,102,241,0.18)",
                            }}
                            transition="all 0.2s"
                        />
                    </InputGroup>
                </Flex>

                {/* ── Table card ────────────────────────────────────────────────── */}
                <Box
                    borderRadius="2xl"
                    border="1px solid"
                    borderColor="app.card.border"
                    bg="app.navbar.bg"
                    backdropFilter="blur(16px)"
                    boxShadow="app.shadow.glass-glow"
                    overflow="hidden"
                    position="relative"
                >
                    {/* Data present */}
                    {sortedData.length > 0 ? (
                        <>
                            {/*
               * Two-panel flex layout:
               *  • Left  → horizontally scrollable data columns
               *  • Right → fixed-width actions column (never scrolls)
               * Both panels share the same ROW_HEIGHT so rows stay aligned.
               */}
                            <Flex>
                                {/* ── Scrollable data columns ───────────────────────── */}
                                <Box flex={1} overflowX="auto">
                                    <Table.Root size="sm" variant="line">
                                        {/* Gradient header */}
                                        <Table.Header>
                                            <Table.Row
                                                bg="app.card.bg"
                                                borderBottom="2px solid"
                                                borderColor="app.card.border"
                                            >
                                                {keys.map((key, idx) => (
                                                    <Table.ColumnHeader
                                                        key={idx}
                                                        py={4}
                                                        px={5}
                                                        whiteSpace="nowrap"
                                                        h={ROW_HEIGHT}
                                                        userSelect="none"
                                                        cursor="pointer"
                                                        onClick={() => handleSort(key)}
                                                        _hover={{ color: "app.text.accent" }}
                                                        transition="color 0.15s"
                                                    >
                                                        <HStack gap={1} align="center">
                                                            <Text
                                                                fontSize="2xs"
                                                                fontWeight="700"
                                                                textTransform="uppercase"
                                                                letterSpacing="wider"
                                                                color={sortKey === key ? "app.text.accent" : "app.text.muted"}
                                                                transition="color 0.15s"
                                                            >
                                                                {formatKey(key)}
                                                            </Text>
                                                            <Box
                                                                opacity={sortKey === key ? 1 : 0.35}
                                                                color="app.text.accent"
                                                                transition="opacity 0.15s"
                                                            >
                                                                {sortKey === key && !sortAsc
                                                                    ? <FaArrowUpShortWide size={11} />
                                                                    : <FaArrowDownShortWide size={11} />
                                                                }
                                                            </Box>
                                                        </HStack>
                                                    </Table.ColumnHeader>
                                                ))}
                                            </Table.Row>
                                        </Table.Header>

                                        {/* Body rows — alternate tint for stripe effect */}
                                        <Table.Body>
                                            {sortedData.map((row: any, rowIdx) => (
                                                <Table.Row
                                                    key={rowIdx}
                                                    h={ROW_HEIGHT}
                                                    bg={
                                                        rowIdx % 2 === 0
                                                            ? "transparent"
                                                            /* Very subtle stripe — adaptive light/dark */
                                                            : "rgba(99,102,241,0.03)"
                                                    }
                                                    _hover={{
                                                        bg: "rgba(99,102,241,0.07)",
                                                        transform: "translateX(2px)",
                                                    }}
                                                    transition="all 0.18s ease"
                                                    borderBottom="1px solid"
                                                    borderColor="app.divider"
                                                >
                                                    {keys.map((key, colIdx) => (
                                                        <Table.Cell
                                                            key={colIdx}
                                                            py={3}
                                                            px={5}
                                                            whiteSpace="nowrap"
                                                            h={ROW_HEIGHT}
                                                        >
                                                            <CellValue value={row[key]} />
                                                        </Table.Cell>
                                                    ))}
                                                </Table.Row>
                                            ))}
                                        </Table.Body>
                                    </Table.Root>
                                </Box>

                                {/* ── Fixed actions column ────────────────────────────── */}
                                {actionSet.length > 0 && (
                                    <Box
                                        flexShrink={0}
                                        borderLeft="1px solid"
                                        borderColor="app.card.border"
                                        bg="app.navbar.bg"
                                        backdropFilter="blur(12px)"
                                        zIndex={2}
                                        boxShadow="-8px 0 20px -4px rgba(0,0,0,0.1)"
                                    >
                                        {/* Actions column header */}
                                        <Flex
                                            h={ROW_HEIGHT}
                                            align="center"
                                            justify="center"
                                            px={5}
                                            bg="app.card.bg"
                                            borderBottom="2px solid"
                                            borderColor="app.card.border"
                                        >
                                            <Text
                                                fontSize="2xs"
                                                fontWeight="700"
                                                textTransform="uppercase"
                                                letterSpacing="wider"
                                                color="app.text.muted"
                                            >
                                                Actions
                                            </Text>
                                        </Flex>

                                        {/* One action cell per data row */}
                                        {sortedData.map((row: any, rowIdx) => (
                                            <Flex
                                                key={rowIdx}
                                                h={ROW_HEIGHT}
                                                align="center"
                                                justify="center"
                                                px={4}
                                                gap={1}
                                                borderBottom="1px solid"
                                                borderColor="app.divider"
                                                bg={rowIdx % 2 === 0 ? "transparent" : "rgba(99,102,241,0.03)"}
                                                _hover={{ bg: "rgba(99,102,241,0.07)" }}
                                                transition="background 0.18s"
                                            >
                                                {actionSet.map((action, actionIdx) => (
                                                    <IconButton
                                                        key={`action-${actionIdx}`}
                                                        variant="ghost"
                                                        size="xs"
                                                        borderRadius="lg"
                                                        colorPalette={action.colorPalette}
                                                        aria-label={action.title ?? "Action"}
                                                        _hover={{
                                                            bg: `${action.colorPalette}.subtle`,
                                                            transform: "scale(1.15)",
                                                        }}
                                                        transition="all 0.18s ease"
                                                        onClick={(e) => sendEvent(e, action, row)}
                                                    >
                                                        {action.icon}
                                                    </IconButton>
                                                ))}
                                            </Flex>
                                        ))}
                                    </Box>
                                )}
                            </Flex>

                            {/* ── Pagination bar ──────────────────────────────────── */}
                            {paginationRequired && (
                                <Flex
                                    px={5}
                                    py={3}
                                    borderTop="1px solid"
                                    borderColor="app.card.border"
                                    bg="app.card.bg"
                                    align="center"
                                    justify="space-between"
                                    wrap="wrap"
                                    gap={2}
                                >
                                    <Text fontSize="xs" color="app.text.muted">
                                        Page {paginationSettings.currentPage} of {paginationSettings.totalPages}
                                    </Text>
                                    <PaginationRoot
                                        count={paginationSettings.totalPages * paginationSettings.pageSize}
                                        pageSize={paginationSettings.pageSize}
                                        defaultPage={paginationSettings.currentPage}
                                        colorPalette="blue"
                                        size="xs"
                                    >
                                        <HStack gap={1}>
                                            <PaginationPrevTrigger borderRadius="lg" />
                                            <PaginationItems />
                                            <PaginationNextTrigger borderRadius="lg" />
                                        </HStack>
                                    </PaginationRoot>
                                </Flex>
                            )}
                        </>
                    ) : (
                        /* ── Empty state ─────────────────────────────────────────── */
                        !isLoading && (
                            <VStack gap={5} align="center" justify="center" py={16}>
                                <Box
                                    w={16}
                                    h={16}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    borderRadius="2xl"
                                    bg="rgba(99,102,241,0.08)"
                                    border="1px dashed"
                                    borderColor="app.card.border"
                                >
                                    <Icon as={FaBoxOpen} boxSize={7} color="app.text.muted" />
                                </Box>
                                <VStack gap={1}>
                                    <Text fontSize="md" fontWeight="600" color="app.text.primary">
                                        No Data Found
                                    </Text>
                                    <Text fontSize="sm" color="app.text.muted">
                                        There are no records to display at the moment.
                                    </Text>
                                </VStack>
                            </VStack>
                        )
                    )}

                    {/* ── Loading overlay ────────────────────────────────────────── */}
                    {isLoading && (
                        <Box
                            position="absolute"
                            inset="0"
                            bg="rgba(15, 23, 42, 0.45)"
                            backdropFilter="blur(4px)"
                            zIndex={20}
                            borderRadius="2xl"
                        >
                            <Center h="full">
                                <VStack gap={4}>
                                    <Box position="relative">
                                        <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
                                    </Box>
                                    <Text
                                        fontSize="sm"
                                        fontWeight="600"
                                        color="white"
                                        letterSpacing="wide"
                                    >
                                        Loading data…
                                    </Text>
                                </VStack>
                            </Center>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    })
);

// ─── CellValue ───────────────────────────────────────────────────────────────
/**
 * Renders a table cell value with smart formatting:
 * - Boolean-like / status strings → colored Badge
 * - Everything else               → plain Text
 *
 * Extracted as a separate memo component so only changed cells re-render.
 */
const STATUS_COLORS: Record<string, string> = {
    active: "green",
    enabled: "green",
    true: "green",
    inactive: "red",
    disabled: "red",
    false: "red",
    pending: "yellow",
    draft: "gray",
};

interface CellValueProps {
    value: any;
}

const CellValue = memo(({ value }: CellValueProps) => {
    const formatted = formatValue(value);
    const lower = String(formatted).toLowerCase().trim();

    if (lower in STATUS_COLORS) {
        return (
            <Badge
                colorPalette={STATUS_COLORS[lower]}
                variant="subtle"
                borderRadius="full"
                px={3}
                py={0.5}
                fontSize="2xs"
                fontWeight="600"
                textTransform="capitalize"
            >
                {formatted}
            </Badge>
        );
    }

    return (
        <Text fontSize="sm" color="app.text.primary" lineClamp={1} maxW="280px">
            {formatted}
        </Text>
    );
});