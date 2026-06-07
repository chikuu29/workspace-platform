/**
 * Subscription.tsx
 *
 * Subscription dashboard with High-Fidelity Glassmorphism and Gradient Borders.
 * API-driven overview of subscription plans, subscriber stats, and quick actions.
 */

import { memo, useCallback, useMemo } from "react";
import {
    Badge,
    Box,
    Button,
    Circle,
    Flex,
    Heading,
    HStack,
    Separator,
    SimpleGrid,
    Skeleton,
    Text,
    VStack,
    IconButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
    ArrowRight,
    BadgeDollarSign,
    ChartColumn,
    CircleDollarSign,
    CreditCard,
    Layers,
    Plus,
    Settings,
    ShieldCheck,
    Users,
    Wallet,
} from "lucide-react";
import { PageLayout } from "@/core/components/PageLayout";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { useSubscriptionStats } from "./hooks/useSubscriptionStats";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import type { SubscriptionPlanDocument, PlanWithMembers } from "./types/Gym.types";

// ─── Glassmorphic Card Wrapper ──────────────────────────────────────────────

interface GlassCardProps {
    children: React.ReactNode;
    p?: number | string;
    h?: string;
    accentColor?: string;
    onClick?: () => void;
    cursor?: string;
}

const GlassCard = memo(({ children, p = 6, h, accentColor = "blue", onClick, cursor }: GlassCardProps) => {
    const bg = useColorModeValue("rgba(255, 255, 255, 0.74)", "rgba(15, 23, 42, 0.58)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.84)", "rgba(255, 255, 255, 0.12)");
    const shadow = useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)");

    // Gradient border logic using a wrapper and an inner box
    return (
        <Box
            position="relative"
            borderRadius="2xl"
            p="1px" // The thickness of the gradient border
            bgGradient={`linear(to-br, ${accentColor}.400/20, transparent, ${accentColor}.400/20)`}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{
                transform: "translateY(-2px)",
                bgGradient: `linear(to-br, ${accentColor}.400/40, transparent, ${accentColor}.400/40)`,
                boxShadow: `0 8px 24px -12px var(--chakra-colors-${accentColor}-500)`,
            }}
            boxShadow={shadow}
            h={h}
            onClick={onClick}
            cursor={cursor}
        >
            <Box
                bg={bg}
                backdropFilter="blur(20px)"
                borderRadius="calc(var(--chakra-radii-2xl) - 1px)"
                p={p}
                h="full"
                border="1px solid"
                borderColor={borderColor}
            >
                {children}
            </Box>
        </Box>
    );
});
GlassCard.displayName = "GlassCard";

// ─── KPI Tile ───────────────────────────────────────────────────────────────

interface KpiTileProps {
    label: string;
    value: string;
    helper: string;
    icon: React.ElementType;
    accent: string;
}

const KpiTile = memo(({ label, value, helper, icon: IconComponent, accent }: KpiTileProps) => {
    const iconBg = useColorModeValue(`${accent}.50`, "rgba(255, 255, 255, 0.05)");
    const iconColor = useColorModeValue(`${accent}.600`, `${accent}.300`);
    const muted = useColorModeValue("gray.600", "gray.400");

    return (
        <GlassCard p={5} accentColor={accent}>
            <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align="center">
                    <Circle size="12" bg={iconBg} color={iconColor} shadow="inner">
                        <IconComponent size={20} />
                    </Circle>
                    <Badge colorPalette={accent} variant="surface" borderRadius="full">
                        Live
                    </Badge>
                </Flex>
                <VStack align="start" gap="0.5">
                    <Text fontSize="xs" fontWeight="800" color={muted} letterSpacing="wider" textTransform="uppercase">
                        {label}
                    </Text>
                    <Heading size="2xl" letterSpacing="tight" fontWeight="900">
                        {value}
                    </Heading>
                    <Text fontSize="xs" color={muted} fontWeight="500">
                        {helper}
                    </Text>
                </VStack>
            </VStack>
        </GlassCard>
    );
});
KpiTile.displayName = "KpiTile";

// ─── Plan Summary Card ──────────────────────────────────────────────────────

interface PlanSummaryCardProps {
    plan: SubscriptionPlanDocument;
    memberInfo?: PlanWithMembers;
}

const PlanSummaryCard = memo(({ plan, memberInfo }: PlanSummaryCardProps) => {
    const accent = plan.data.accent_color || "blue";
    const muted = useColorModeValue("gray.500", "gray.400");
    const softSurface = useColorModeValue("rgba(0,0,0,0.03)", "whiteAlpha.100");
    const accentBg = useColorModeValue(`${accent}.100`, "whiteAlpha.200");
    const accentColor = useColorModeValue(`${accent}.600`, `${accent}.300`);

    const memberCount = memberInfo?.member_count ?? 0;
    const planRevenue = memberInfo?.revenue ?? 0;

    return (
        <GlassCard p={6} h="full" accentColor={accent}>
            <VStack align="stretch" gap={6} h="full">
                {/* Header */}
                <Flex justify="space-between" align="start" gap={3}>
                    <VStack align="start" gap={2}>
                        <Badge
                            colorPalette={accent}
                            variant="solid"
                            borderRadius="full"
                            px="3"
                            fontSize="2xs"
                            fontWeight="900"
                        >
                            {plan.data.is_active ? "ACTIVE PLAN" : "INACTIVE"}
                        </Badge>
                        <Heading size="xl" fontWeight="900" letterSpacing="tight">
                            {plan.data.name}
                        </Heading>
                        <HStack align="baseline" gap={1}>
                            <Text fontSize="2xl" fontWeight="900">
                                ₹{plan.data.price.toLocaleString("en-IN")}
                            </Text>
                            <Text color={muted} fontSize="xs" fontWeight="700" textTransform="uppercase">
                                / {plan.data.billing_cycle}
                            </Text>
                        </HStack>
                    </VStack>
                    <Circle size="12" bg={accentBg} color={accentColor} shadow="md">
                        <CreditCard size={22} />
                    </Circle>
                </Flex>

                {/* Stats row with glass containers */}
                <SimpleGrid columns={2} gap={3}>
                    <Box p={4} borderRadius="2xl" bg={softSurface} border="1px solid" borderColor="whiteAlpha.200">
                        <Text fontSize="2xs" textTransform="uppercase" letterSpacing="widest" color={muted} fontWeight="800">
                            Members
                        </Text>
                        <Heading size="md" mt={1} fontWeight="900">{memberCount}</Heading>
                    </Box>
                    <Box p={4} borderRadius="2xl" bg={softSurface} border="1px solid" borderColor="whiteAlpha.200">
                        <Text fontSize="2xs" textTransform="uppercase" letterSpacing="widest" color={muted} fontWeight="800">
                            MRR
                        </Text>
                        <Heading size="md" mt={1} fontWeight="900">₹{planRevenue.toLocaleString("en-IN")}</Heading>
                    </Box>
                </SimpleGrid>

                {/* Features */}
                <Separator opacity={0.1} />
                <VStack align="stretch" gap={3} flex="1">
                    {plan.data.features.slice(0, 3).map((feature) => (
                        <HStack key={feature} gap={3}>
                            <Circle size="6" bg={accentBg} color={accentColor}>
                                <ShieldCheck size={14} />
                            </Circle>
                            <Text fontSize="sm" fontWeight="600" color="app.text.primary">{feature}</Text>
                        </HStack>
                    ))}
                    {plan.data.features.length > 3 && (
                        <Text fontSize="xs" color={muted} fontWeight="700" pl={9}>
                            + {plan.data.features.length - 3} MORE PRIVILEGES
                        </Text>
                    )}
                </VStack>
            </VStack>
        </GlassCard>
    );
});
PlanSummaryCard.displayName = "PlanSummaryCard";

// ─── Main ───────────────────────────────────────────────────────────────────

const Subscription = () => {
    const { navigateTo, buildPath } = useWorkspaceRouter();

    // ── Data ──
    const { plans, loading: plansLoading, refetch: refetchPlans } = useSubscriptionPlans();
    const { stats, loading: statsLoading, refetch: refetchStats } = useSubscriptionStats();

    const handleRefresh = useCallback(() => {
        refetchPlans();
        refetchStats();
    }, [refetchPlans, refetchStats]);

    // ── Navigation handlers ──
    const handleCreatePlan = useCallback(() => {
        navigateTo("AddSubscriptionPlan");
    }, [navigateTo]);

    const handleManagePlans = useCallback(() => {
        navigateTo("subscriptions");
    }, [navigateTo]);

    const mountNavActions = useNavActionStore((state) => state.setActions);
    const unmountNavActions = useNavActionStore((state) => state.clearActions);

    useEffect(() => {
        mountNavActions(
            <HStack gap={2}>
                <IconButton
                    variant="solid"
                    colorPalette="yellow"
                    borderRadius="sm"
                    size="md"
                    h="40px"
                    px={6}
                    onClick={handleRefresh}
                    aria-label="Refresh hub"
                    loading={plansLoading || statsLoading}
                >
                    <RefreshCw size={14} />
                </IconButton>
                <Button
                    variant="outline"
                    borderRadius="sm"
                    size="md"
                    h="40px"
                    px={6}
                    onClick={handleManagePlans}
                    fontWeight="800"
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                        bg: "whiteAlpha.100",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s ease"
                >
                    <Settings size={16} /> Management
                </Button>
                <Button
                    colorPalette="blue"
                    borderRadius="sm"
                    size="md"
                    h="40px"
                    px={6}
                    onClick={handleCreatePlan}
                    fontWeight="800"
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 24px -8px var(--chakra-colors-blue-500)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s ease"
                >
                    <Plus size={16} /> New Plan
                </Button>
            </HStack>
        );
        return () => unmountNavActions();
    }, [mountNavActions, unmountNavActions, handleRefresh, handleManagePlans, handleCreatePlan, plansLoading, statsLoading]);

    const handleViewMembers = useCallback(() => {
        navigateTo("members");
    }, [navigateTo]);

    // ── Plan ↔ stats map for member counts ──
    const planStatsMap = useMemo(() => {
        const map = new Map<string, PlanWithMembers>();
        if (stats?.plans_with_members) {
            for (const p of stats.plans_with_members) {
                map.set(p.plan_code, p);
            }
        }
        return map;
    }, [stats]);

    // ── Theme ──
    const muted = useColorModeValue("gray.500", "gray.400");

    return (
        <PageLayout
            title="Subscription Hub"
            subtitle="Real-time membership health, revenue forecasting, and plan management."
            icon={Wallet}
            badge="Revenue Hub"
            accentColor="purple"
        >
            <VStack align="stretch" gap={10} pb={8}>

                {/* ── KPI Row ─────────────────────────────────────────── */}
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={6}>
                    {statsLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} height="160px" borderRadius="3xl" />
                        ))
                    ) : (
                        <>
                            <KpiTile
                                label="Live Portfolios"
                                value={String(stats?.active_plans ?? 0)}
                                helper={`${stats?.total_plans ?? 0} Global Tiers`}
                                icon={Layers}
                                accent="blue"
                            />
                            <KpiTile
                                label="Subscribers"
                                value={String(stats?.total_subscribers ?? 0)}
                                helper="Active Memberships"
                                icon={Users}
                                accent="green"
                            />
                            <KpiTile
                                label="Projected MRR"
                                value={`₹${(stats?.total_mrr ?? 0).toLocaleString("en-IN")}`}
                                helper="Recurring Revenue"
                                icon={CircleDollarSign}
                                accent="orange"
                            />
                            <KpiTile
                                label="Unit Economy"
                                value={
                                    stats && stats.total_subscribers > 0
                                        ? `₹${Math.round(stats.total_mrr / stats.total_subscribers).toLocaleString("en-IN")}`
                                        : "₹0"
                                }
                                helper="Average Revenue / User"
                                icon={ChartColumn}
                                accent="purple"
                            />
                        </>
                    )}
                </SimpleGrid>

                {/* ── Plans Grid ──────────────────────────────────────── */}
                <VStack align="stretch" gap={6}>
                    <Flex justify="space-between" align="end">
                        <VStack align="start" gap={1}>
                            <HStack gap={2}>
                                <Box w="4px" h="20px" bg="blue.500" borderRadius="full" />
                                <Heading size="lg" fontWeight="950" letterSpacing="tight">Active Tiers</Heading>
                            </HStack>
                            <Text fontSize="sm" color={muted} fontWeight="600">
                                Monitor performance and distribution across all subscription levels
                            </Text>
                        </VStack>
                        <Button
                            variant="ghost"
                            size="sm"
                            borderRadius="xl"
                            onClick={handleManagePlans}
                            fontWeight="800"
                        >
                            Catalog Overview <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                        </Button>
                    </Flex>

                    {plansLoading ? (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height="320px" borderRadius="3xl" />
                            ))}
                        </SimpleGrid>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={8}>
                            {plans.map((plan) => (
                                <PlanSummaryCard
                                    key={plan._id}
                                    plan={plan}
                                    memberInfo={planStatsMap.get(plan.data.code)}
                                />
                            ))}
                        </SimpleGrid>
                    )}
                </VStack>

                {/* ── Quick Access ───────────────────────────────────── */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                    <GlassCard p={6} cursor="pointer" onClick={handleCreatePlan} accentColor="blue">
                        <VStack align="start" gap={4}>
                            <Circle size="12" bg="blue.500/10" color="blue.500">
                                <BadgeDollarSign size={24} />
                            </Circle>
                            <VStack align="start" gap="1">
                                <Heading size="md" fontWeight="900" letterSpacing="tight">Plan Architect</Heading>
                                <Text fontSize="xs" color={muted} fontWeight="600">
                                    Configure new membership tiers with dynamic pricing.
                                </Text>
                            </VStack>
                        </VStack>
                    </GlassCard>

                    <GlassCard p={6} cursor="pointer" onClick={handleManagePlans} accentColor="green">
                        <VStack align="start" gap={4}>
                            <Circle size="12" bg="green.500/10" color="green.500">
                                <Settings size={24} />
                            </Circle>
                            <VStack align="start" gap="1">
                                <Heading size="md" fontWeight="900" letterSpacing="tight">System Config</Heading>
                                <Text fontSize="xs" color={muted} fontWeight="600">
                                    Audit pricing models, features, and active statuses.
                                </Text>
                            </VStack>
                        </VStack>
                    </GlassCard>

                    <GlassCard p={6} cursor="pointer" onClick={handleViewMembers} accentColor="orange">
                        <VStack align="start" gap={4}>
                            <Circle size="12" bg="orange.500/10" color="orange.500">
                                <Users size={24} />
                            </Circle>
                            <VStack align="start" gap="1">
                                <Heading size="md" fontWeight="900" letterSpacing="tight">Member Ledger</Heading>
                                <Text fontSize="xs" color={muted} fontWeight="600">
                                    Analyze enrollment data and subscription lifecycles.
                                </Text>
                            </VStack>
                        </VStack>
                    </GlassCard>
                </SimpleGrid>
            </VStack>
        </PageLayout>
    );
};

export default Subscription;
