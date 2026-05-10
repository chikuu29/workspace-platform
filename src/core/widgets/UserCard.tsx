import { memo, useCallback } from "react";
import {
    Box,
    Flex,
    Text,
    HStack,
    VStack,
    Badge,
    IconButton,
    Avatar,
} from "@chakra-ui/react";
import { Mail, Shield } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserCardAction {
    label: string;
    icon: React.ReactNode;
    colorPalette?: string;
    /** Action key emitted via onAction */
    actionType: string;
}

export interface UserCardData {
    id?: string | number;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role?: string;
    is_active?: boolean | string;
    avatar_url?: string;
    /** Any extra fields are preserved and forwarded in onAction payloads */
    [key: string]: any;
}

interface UserCardProps {
    user: UserCardData;
    actions?: UserCardAction[];
    onAction?: (actionType: string, user: UserCardData) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Derive initials from name fields for the avatar fallback */
const getInitials = (user: UserCardData): string => {
    const first = user.first_name?.[0] ?? user.username?.[0] ?? "?";
    const last = user.last_name?.[0] ?? "";
    return (first + last).toUpperCase();
};

/** Normalize the `is_active` field — can be boolean or "true"/"false" string */
const isUserActive = (user: UserCardData): boolean => {
    const val = user.is_active;
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true";
    return false;
};

/** Pick a deterministic gradient for the avatar background from the username */
const AVATAR_GRADIENTS = [
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
    "linear-gradient(135deg,#3b82f6,#6366f1)",
    "linear-gradient(135deg,#8b5cf6,#ec4899)",
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
    "linear-gradient(135deg,#f59e0b,#ef4444)",
    "linear-gradient(135deg,#10b981,#3b82f6)",
];

const getGradient = (seed: string): string => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

// ─── UserCard ─────────────────────────────────────────────────────────────────

/**
 * UserCard — reusable card that renders a single user's key info.
 *
 * Designed to be layout-agnostic (dropped into a grid, list, or popover).
 * All data is behind generic `UserCardData` so it works with any user schema.
 */
export const UserCard = memo(({ user, actions = [], onAction }: UserCardProps) => {
    const initials = getInitials(user);
    const active = isUserActive(user);
    const gradient = getGradient(user.username ?? user.email ?? String(user.id ?? "?"));
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Unknown User";
    const role = user.role || "Member";

    const handleAction = useCallback(
        (actionType: string) => {
            onAction?.(actionType, user);
        },
        [onAction, user]
    );

    return (
        <Box
            borderRadius="2xl"
            border="1px solid"
            borderColor="app.card.border"
            bg="app.navbar.bg"
            backdropFilter="blur(16px)"
            boxShadow="app.shadow.glass-glow"
            overflow="hidden"
            transition="all 0.22s ease"
            _hover={{
                transform: "translateY(-3px)",
                boxShadow: "0 16px 40px -8px rgba(99,102,241,0.2)",
                borderColor: "rgba(99,102,241,0.35)",
            }}
            position="relative"
            role="article"
            aria-label={`User card for ${displayName}`}
        >
            {/* ── Accent header strip ────────────────────────────────────────── */}
            <Box h="4px" bgGradient={gradient} />

            {/* ── Card body ──────────────────────────────────────────────────── */}
            <VStack gap={0} align="stretch">
                {/* Top section: avatar + actions */}
                <Flex justify="space-between" align="flex-start" px={5} pt={5} pb={3}>
                    {/* Avatar */}
                    <Box position="relative">
                        <Avatar.Root
                            size="lg"
                            bg="transparent"
                            style={{ background: gradient }}
                            borderRadius="xl"
                        >
                            {user.avatar_url ? (
                                <Avatar.Image src={user.avatar_url} borderRadius="xl" />
                            ) : (
                                <Avatar.Fallback
                                    fontWeight="700"
                                    fontSize="md"
                                    color="white"
                                    bg="transparent"
                                >
                                    {initials}
                                </Avatar.Fallback>
                            )}
                        </Avatar.Root>

                        {/* Online indicator */}
                        <Box
                            position="absolute"
                            bottom="-2px"
                            right="-2px"
                            w="13px"
                            h="13px"
                            borderRadius="full"
                            bg={active ? "green.400" : "gray.500"}
                            border="2px solid"
                            borderColor="app.navbar.bg"
                            title={active ? "Active" : "Inactive"}
                        />
                    </Box>

                    {/* Quick-action buttons */}
                    <HStack gap={1}>
                        {actions.map((action, idx) => (
                            <IconButton
                                key={action.actionType || `action-${idx}`}
                                size="xs"
                                variant="ghost"
                                borderRadius="lg"
                                colorPalette={action.colorPalette ?? "gray"}
                                aria-label={action.label}
                                title={action.label}
                                _hover={{ bg: `${action.colorPalette ?? "gray"}.subtle`, transform: "scale(1.1)" }}
                                transition="all 0.15s"
                                onClick={() => handleAction(action.actionType)}
                            >
                                {action.icon}
                            </IconButton>
                        ))}
                    </HStack>
                </Flex>

                {/* Middle section: name + role + status */}
                <VStack gap={2} align="start" px={5} pb={4}>
                    <VStack gap={0.5} align="start">
                        <Text
                            fontWeight="700"
                            fontSize="sm"
                            color="app.text.primary"
                            lineClamp={1}
                            maxW="100%"
                            title={displayName}
                        >
                            {displayName}
                        </Text>
                        <Text
                            fontSize="xs"
                            color="app.text.muted"
                            lineClamp={1}
                            maxW="100%"
                            title={user.username}
                        >
                            @{user.username || "—"}
                        </Text>
                    </VStack>

                    <HStack gap={2} flexWrap="wrap">
                        {/* Role badges */}
                        {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r: any, idx: number) => (
                                <Badge
                                    key={r.id || r.role_name || `role-${idx}`}
                                    variant="subtle"
                                    colorPalette="purple"
                                    borderRadius="full"
                                    px={2.5}
                                    py={0.5}
                                    fontSize="2xs"
                                    fontWeight="600"
                                    display="flex"
                                    alignItems="center"
                                    gap={1}
                                >
                                    <Shield size={10} />
                                    {r.role_name}
                                </Badge>
                            ))
                        ) : (
                            <Badge
                                key="role-default"
                                variant="subtle"
                                colorPalette="purple"
                                borderRadius="full"
                                px={2.5}
                                py={0.5}
                                fontSize="2xs"
                                fontWeight="600"
                                display="flex"
                                alignItems="center"
                                gap={1}
                            >
                                <Shield size={10} />
                                {role}
                            </Badge>
                        )}

                        {/* Special Status Flags */}
                        {user.is_root_user && (
                            <Badge key="flag-root" variant="solid" colorPalette="orange" borderRadius="full" px={2} fontSize="2xs">
                                Root
                            </Badge>
                        )}

                        {user.user_type === "SYSTEM" && (
                            <Badge key="flag-platform" variant="subtle" colorPalette="cyan" borderRadius="full" px={2} fontSize="2xs">
                                Platform
                            </Badge>
                        )}

                        {/* Status badge */}
                        <Badge
                            key="flag-active"
                            variant="subtle"
                            colorPalette={active ? "green" : "red"}
                            borderRadius="full"
                            px={2.5}
                            py={0.5}
                            fontSize="2xs"
                            fontWeight="600"
                        >
                            {active ? "Active" : "Inactive"}
                        </Badge>
                    </HStack>
                </VStack>

                {/* Divider */}
                <Box borderTop="1px solid" borderColor="app.divider" mx={5} />

                {/* Bottom section: email */}
                <HStack
                    gap={2}
                    px={5}
                    py={3}
                    color="app.text.muted"
                    fontSize="xs"
                    _hover={{ color: "app.text.primary" }}
                    transition="color 0.15s"
                    cursor="default"
                >
                    <Mail size={12} style={{ flexShrink: 0 }} />
                    <Text lineClamp={1} flex={1} title={user.email}>
                        {user.email || "No email"}
                    </Text>
                </HStack>
            </VStack>
        </Box>
    );
});

UserCard.displayName = "UserCard";