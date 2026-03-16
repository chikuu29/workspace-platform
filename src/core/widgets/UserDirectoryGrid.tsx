import {
    Box,
    Flex,
    Grid,
    GridItem,
    Input,
    InputGroup,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
    Center,
    Spinner,
} from "@chakra-ui/react";
import { memo, useCallback, useMemo, useState } from "react";
import { LuSearch, LuUsersRound, LuRefreshCw } from "react-icons/lu";
import { UserCard, UserCardAction, UserCardData } from "./UserCard";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserDirectoryGridProps {
    /** Array of user objects — any shape that satisfies UserCardData */
    users?: UserCardData[];
    /** Show loading skeleton overlay */
    isLoading?: boolean;
    /** Action buttons to render on each card */
    actions?: UserCardAction[];
    /** Called when an action button is clicked */
    onAction?: (actionType: string, user: UserCardData) => void;
    /** Optional slot — rendered in the toolbar right-side (e.g. "Add User" button) */
    toolbarEnd?: React.ReactNode;
    /**
     * Field to filter users by status.
     * Defaults to `is_active`. Pass null to disable status filter.
     */
    statusField?: string | null;
    /**
     * Fields to search across.
     * Defaults to ["username","email","first_name","last_name","role"]
     */
    searchFields?: string[];
}

const DEFAULT_SEARCH_FIELDS = ["username", "email", "first_name", "last_name", "role"];
const DEFAULT_USERS: UserCardData[] = [];

// ─── UserDirectoryGrid ────────────────────────────────────────────────────────

/**
 * UserDirectoryGrid — reusable, self-contained user grid widget.
 *
 * Features:
 * - Client-side fuzzy search across configurable fields
 * - Status filter (Active / Inactive / All)
 * - Responsive grid (1 col on mobile, 2 on tablet, 3–4 on desktop)
 * - Glassmorphic card design with gradient avatars
 * - Pluggable action buttons per card
 * - Empty + loading states
 *
 * The component is fully data-agnostic — pass any user array, configure which
 * fields to search, and plug in your own actions. This makes it reusable across
 * any admin view that deals with user-like entities.
 */
export const UserDirectoryGrid = memo(
    ({
        users = DEFAULT_USERS,
        isLoading = false,
        actions = [],
        onAction,
        toolbarEnd,
        statusField = "is_active",
        searchFields = DEFAULT_SEARCH_FIELDS,
    }: UserDirectoryGridProps) => {
        const [query, setQuery] = useState("");
        const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

        // ── Filtered + searched user list ────────────────────────────────────────
        const filtered = useMemo(() => {
            const q = query.toLowerCase().trim();

            return users.filter((user) => {
                // Status filter
                if (statusField !== null && statusFilter !== "all") {
                    const val = user[statusField ?? "is_active"];
                    const isActive =
                        val === true || val === "true" || val === 1;
                    if (statusFilter === "active" && !isActive) return false;
                    if (statusFilter === "inactive" && isActive) return false;
                }

                // Search filter — match any configured field
                if (q) {
                    return searchFields.some((field) =>
                        String(user[field] ?? "")
                            .toLowerCase()
                            .includes(q)
                    );
                }

                return true;
            });
        }, [users, query, statusFilter, statusField, searchFields]);

        const handleQueryChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value),
            []
        );

        return (
            <Box position="relative">
                {/* ── Toolbar ────────────────────────────────────────────────────── */}
                <Flex
                    mb={5}
                    gap={3}
                    wrap="wrap"
                    align="center"
                    justify="space-between"
                >
                    {/* Left: search + status filter */}
                    <HStack gap={3} flex={1} flexWrap="wrap">
                        {/* Search */}
                        <InputGroup
                            startElement={<LuSearch size={15} />}
                            maxW={{ base: "100%", sm: "320px" }}
                            flex={1}
                        >
                            <Input
                                placeholder="Search by name, email, role…"
                                size="sm"
                                borderRadius="full"
                                value={query}
                                onChange={handleQueryChange}
                                bg="app.card.bg"
                                border="1px solid"
                                borderColor="app.navbar.border"
                                _focus={{
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                _active={{
                                    boxShadow: "none",
                                    outline: "none",
                                }}
                                transition="all 0.2s"
                            />
                        </InputGroup>

                        {/* Status chips — All / Active / Inactive */}
                        {statusField !== null && (
                            <HStack gap={1.5} p={1} borderRadius="full" bg="app.card.bg" border="1px solid" borderColor="app.navbar.border">
                                {STATUS_CHIPS.map((chip) => {
                                    const isSelected = statusFilter === chip.value;
                                    return (
                                        <Button
                                            key={chip.value}
                                            size="xs"
                                            borderRadius="full"
                                            px={3}
                                            h="24px"
                                            fontWeight={isSelected ? "700" : "500"}
                                            fontSize="xs"
                                            variant="ghost"
                                            bg={isSelected ? chip.activeBg : "transparent"}
                                            color={isSelected ? chip.activeColor : "app.text.muted"}
                                            border={isSelected ? "1px solid" : "1px solid transparent"}
                                            borderColor={isSelected ? chip.activeBorder : "transparent"}
                                            _hover={!isSelected ? { bg: "rgba(99,102,241,0.07)", color: "app.text.primary" } : {}}
                                            transition="all 0.18s ease"
                                            onClick={() => setStatusFilter(chip.value as any)}
                                        >
                                            {chip.label}
                                        </Button>
                                    );
                                })}
                            </HStack>
                        )}
                    </HStack>

                    {/* Right: result count + custom slot */}
                    <HStack gap={3} flexShrink={0}>
                        <Text fontSize="xs" color="app.text.muted" whiteSpace="nowrap">
                            {filtered.length} of {users.length} users
                        </Text>
                        {toolbarEnd}
                    </HStack>
                </Flex>

                {/* ── Grid ───────────────────────────────────────────────────────── */}
                {isLoading ? (
                    <Center py={20}>
                        <VStack gap={4}>
                            <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
                            <Text fontSize="sm" color="app.text.muted" fontWeight="500">
                                Loading users…
                            </Text>
                        </VStack>
                    </Center>
                ) : filtered.length === 0 ? (
                    <Center py={20}>
                        <VStack gap={4}>
                            <Box
                                w={16}
                                h={16}
                                borderRadius="2xl"
                                bg="rgba(99,102,241,0.08)"
                                border="1px dashed"
                                borderColor="app.card.border"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                            >
                                <Icon as={LuUsersRound} boxSize={7} color="app.text.muted" />
                            </Box>
                            <VStack gap={1}>
                                <Text fontWeight="600" color="app.text.primary">
                                    {query || statusFilter !== "all"
                                        ? "No users match your filters"
                                        : "No users found"}
                                </Text>
                                <Text fontSize="sm" color="app.text.muted">
                                    {query || statusFilter !== "all"
                                        ? "Try adjusting your search or filter"
                                        : "Add a user to get started"}
                                </Text>
                            </VStack>
                            {(query || statusFilter !== "all") && (
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    colorPalette="blue"
                                    borderRadius="full"
                                    onClick={() => {
                                        setQuery("");
                                        setStatusFilter("all");
                                    }}
                                >
                                    <LuRefreshCw size={13} />
                                    Clear filters
                                </Button>
                            )}
                        </VStack>
                    </Center>
                ) : (
                    <Grid
                        templateColumns={{
                            base: "1fr",
                            sm: "repeat(2, 1fr)",
                            lg: "repeat(3, 1fr)",
                            "2xl": "repeat(4, 1fr)",
                        }}
                        gap={4}
                    >
                        {filtered.map((user, idx) => (
                            <GridItem key={user.id || user.username || `user-${idx}`}>
                                <UserCard
                                    user={user}
                                    actions={actions}
                                    onAction={onAction}
                                />
                            </GridItem>
                        ))}
                    </Grid>
                )}
            </Box>
        );
    }
);

UserDirectoryGrid.displayName = "UserDirectoryGrid";

// ─── Chip filter config — stable constant, never re-allocated per render ───────
const STATUS_CHIPS = [
    {
        label: "All",
        value: "all",
        activeBg: "rgba(99,102,241,0.15)",
        activeColor: "app.text.accent",
        activeBorder: "rgba(99,102,241,0.3)",
    },
    {
        label: "Active",
        value: "active",
        activeBg: "rgba(34,197,94,0.15)",
        activeColor: "green.400",
        activeBorder: "rgba(34,197,94,0.3)",
    },
    {
        label: "Inactive",
        value: "inactive",
        activeBg: "rgba(239,68,68,0.12)",
        activeColor: "red.400",
        activeBorder: "rgba(239,68,68,0.25)",
    },
] as const;