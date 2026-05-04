/**
 * Subscription.tsx
 *
 * Subscription dashboard — API-driven overview of subscription plans,
 * subscriber stats, and quick actions. Replaces the previous version
 * that used 100% hardcoded mock data.
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
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
    LuArrowRight,
    LuBadgeDollarSign,
    LuCalendarClock,
    LuChartColumn,
    LuCircleDollarSign,
    LuCreditCard,
    LuLayers,
    LuPlus,
    LuSettings,
    LuShieldCheck,
    LuUsers,
    LuWallet,
} from "react-icons/lu";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { useSubscriptionStats } from "./hooks/useSubscriptionStats";
import type { SubscriptionPlanDocument, PlanWithMembers } from "./types/Gym.types";

// ─── KPI Tile ───────────────────────────────────────────────────────────────

interface KpiTileProps {
    label: string;
    value: string;
    helper: string;
    icon: React.ElementType;
    accent: string;
}

const KpiTile = memo(({ label, value, helper, icon: IconComponent, accent }: KpiTileProps) => {
    const iconBg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
    const iconColor = useColorModeValue(`${accent}.600`, `${accent}.300`);
    const muted = useColorModeValue("gray.600", "gray.300");

    return (
        <Card p={5}>
            <VStack align="stretch" gap={3}>
                <Circle size="10" bg={iconBg} color={iconColor}>
                    <IconComponent size={18} />
                </Circle>
                <VStack align="start" gap="0.5">
                    <Text fontSize="xs" fontWeight="700" color={muted} letterSpacing="wide" textTransform="uppercase">
                        {label}
                    </Text>
                    <Heading size="lg" letterSpacing="tighter">{value}</Heading>
                    <Text fontSize="xs" color={muted}>{helper}</Text>
                </VStack>
            </VStack>
        </Card>
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
    const softSurface = useColorModeValue("rgba(0,0,0,0.02)", "whiteAlpha.50");
    const accentBg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
    const accentColor = useColorModeValue(`${accent}.600`, `${accent}.300`);

    const memberCount = memberInfo?.member_count ?? 0;
    const planRevenue = memberInfo?.revenue ?? 0;

    return (
        <Card p={6} h="full">
            <VStack align="stretch" gap={5} h="full">
                {/* Header */}
                <Flex justify="space-between" align="start" gap={3}>
                    <VStack align="start" gap="1">
                        <Badge
                            colorPalette={accent}
                            variant="subtle"
                            borderRadius="full"
                            px="3"
                            py="1"
                            fontWeight="bold"
                        >
                            {plan.data.is_active ? "Live" : "Inactive"}
                        </Badge>
                        <Heading size="md" letterSpacing="tight">{plan.data.name}</Heading>
                        <Text color={muted} fontSize="md" fontWeight="600">
                            ${plan.data.price.toLocaleString()}{" "}
                            <Text as="span" color={muted} fontSize="sm" fontWeight="normal">
                                / {plan.data.billing_cycle}
                            </Text>
                        </Text>
                    </VStack>
                    <Circle size="10" bg={accentBg} color={accentColor}>
                        <LuCreditCard size={18} />
                    </Circle>
                </Flex>

                {/* Stats row */}
                <SimpleGrid columns={2} gap={3}>
                    <Box p={3} borderRadius="xl" bg={softSurface}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={muted} fontWeight="700">
                            Members
                        </Text>
                        <Heading size="sm" mt={1}>{memberCount}</Heading>
                    </Box>
                    <Box p={3} borderRadius="xl" bg={softSurface}>
                        <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={muted} fontWeight="700">
                            MRR
                        </Text>
                        <Heading size="sm" mt={1}>${planRevenue.toLocaleString()}</Heading>
                    </Box>
                </SimpleGrid>

                {/* Features */}
                <Separator opacity={0.08} />
                <VStack align="stretch" gap={2} flex="1">
                    {plan.data.features.slice(0, 3).map((feature) => (
                        <HStack key={feature} gap={2} color={muted}>
                            <Circle size="5" bg={accentBg} color={accentColor}>
                                <LuShieldCheck size={10} />
                            </Circle>
                            <Text fontSize="xs" fontWeight="600">{feature}</Text>
                        </HStack>
                    ))}
                    {plan.data.features.length > 3 && (
                        <Text fontSize="xs" color={muted} fontWeight="500">
                            +{plan.data.features.length - 3} more features
                        </Text>
                    )}
                </VStack>
            </VStack>
        </Card>
    );
});
PlanSummaryCard.displayName = "PlanSummaryCard";

// ─── Empty State ────────────────────────────────────────────────────────────

interface EmptyStateProps {
    onCreatePlan: () => void;
}

const EmptyState = memo(({ onCreatePlan }: EmptyStateProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");

    return (
        <Card p={12} borderRadius="2xl">
            <VStack gap={5} textAlign="center">
                <Circle size={16} bg="blue.500/10" color="blue.500">
                    <LuLayers size={28} />
                </Circle>
                <VStack gap={2}>
                    <Heading size="lg" fontWeight="800">No subscription plans yet</Heading>
                    <Text fontSize="sm" color={muted} maxW="md">
                        Create your first subscription plan to start managing gym memberships,
                        billing cycles, and member enrollments.
                    </Text>
                </VStack>
                <Button
                    colorPalette="blue"
                    size="lg"
                    borderRadius="xl"
                    px={8}
                    onClick={onCreatePlan}
                >
                    <LuPlus size={16} />
                    Create First Plan
                </Button>
            </VStack>
        </Card>
    );
});
EmptyState.displayName = "EmptyState";

// ─── Main ───────────────────────────────────────────────────────────────────

const Subscription = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { appCode } = useParams();
    const [searchParams] = useSearchParams();

    const appParam = searchParams.get("app");
    const appName = useMemo(() => appCode || appParam || "myGym", [appCode, appParam]);
    const workspacePrefix = useMemo(() => {
        if (!pathname.includes("/workspace")) return "";
        return `${pathname.split("/workspace")[0]}/workspace`;
    }, [pathname]);

    const buildViewPath = useCallback((viewName: string) => {
        if (appCode) return `${workspacePrefix}/app/${appCode}/${viewName}`;
        return `${workspacePrefix}/${viewName}?app=${appName}`;
    }, [appCode, appName, workspacePrefix]);

    // ── Data ──
    const { plans, loading: plansLoading, refetch: refetchPlans } = useSubscriptionPlans();
    const { stats, loading: statsLoading, refetch: refetchStats } = useSubscriptionStats();

    const handleRefresh = useCallback(() => {
        refetchPlans();
        refetchStats();
    }, [refetchPlans, refetchStats]);

    // ── Navigation handlers ──
    const handleCreatePlan = useCallback(() => {
        navigate(buildViewPath("AddSubscriptionPlan"));
    }, [navigate, buildViewPath]);

    const handleManagePlans = useCallback(() => {
        navigate(buildViewPath("GymSubscriptionPlans"));
    }, [navigate, buildViewPath]);

    const handleViewMembers = useCallback(() => {
        navigate(buildViewPath("ListMember"));
    }, [navigate, buildViewPath]);

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
            title={
                <HStack gap={3}>
                    <Circle size={10} bg="blue.500" color="white" shadow="0 0 20px rgba(59, 130, 246, 0.4)">
                        <LuWallet size={20} />
                    </Circle>
                    <Text>Subscription Dashboard</Text>
                </HStack>
            }
            subtitle="Manage billing health across all gym plans, review subscribers, and launch plan upgrades."
            actions={
                <HStack gap={3} flexWrap="wrap">
                    <Button
                        colorPalette="blue"
                        borderRadius="xl"
                        size="lg"
                        px={6}
                        shadow="0 10px 20px -5px rgba(59, 130, 246, 0.3)"
                        onClick={handleCreatePlan}
                    >
                        <LuPlus style={{ marginRight: "6px" }} /> New Plan
                    </Button>
                    <Button
                        variant="surface"
                        borderRadius="xl"
                        size="lg"
                        onClick={handleManagePlans}
                    >
                        <LuSettings style={{ marginRight: "6px" }} /> Manage Plans
                    </Button>
                </HStack>
            }
            onRefresh={handleRefresh}
            isRefreshing={plansLoading || statsLoading}
        >
            <VStack align="stretch" gap={8} pb={4}>

                {/* ── KPI Row ─────────────────────────────────────────── */}
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
                    {statsLoading ? (
                        [1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} height="130px" borderRadius="2xl" />
                        ))
                    ) : (
                        <>
                            <KpiTile
                                label="Active Plans"
                                value={String(stats?.active_plans ?? 0)}
                                helper={`${stats?.total_plans ?? 0} total plans configured`}
                                icon={LuLayers}
                                accent="blue"
                            />
                            <KpiTile
                                label="Subscribers"
                                value={String(stats?.total_subscribers ?? 0)}
                                helper="Active memberships"
                                icon={LuUsers}
                                accent="green"
                            />
                            <KpiTile
                                label="Monthly Revenue"
                                value={`$${(stats?.total_mrr ?? 0).toLocaleString()}`}
                                helper="Normalized MRR"
                                icon={LuCircleDollarSign}
                                accent="orange"
                            />
                            <KpiTile
                                label="Avg Plan Value"
                                value={
                                    stats && stats.total_subscribers > 0
                                        ? `$${Math.round(stats.total_mrr / stats.total_subscribers)}`
                                        : "$0"
                                }
                                helper="Per subscriber per month"
                                icon={LuChartColumn}
                                accent="purple"
                            />
                        </>
                    )}
                </SimpleGrid>

                {/* ── Plans Grid ──────────────────────────────────────── */}
                <VStack align="stretch" gap={4}>
                    <Flex justify="space-between" align="center">
                        <VStack align="start" gap={1}>
                            <Heading size="md" letterSpacing="tight">Subscription Plans</Heading>
                            <Text fontSize="sm" color={muted}>
                                Your active plan portfolio and subscriber distribution
                            </Text>
                        </VStack>
                        <Button
                            variant="ghost"
                            size="sm"
                            borderRadius="xl"
                            onClick={handleManagePlans}
                        >
                            View all <LuArrowRight size={14} />
                        </Button>
                    </Flex>

                    {plansLoading ? (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} height="280px" borderRadius="2xl" />
                            ))}
                        </SimpleGrid>
                    ) : plans.length === 0 ? (
                        <EmptyState onCreatePlan={handleCreatePlan} />
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
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

                {/* ── Quick Actions ───────────────────────────────────── */}
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
                    <Card p={5} cursor="pointer" onClick={handleCreatePlan}>
                        <VStack align="start" gap={3}>
                            <Circle size="10" bg="blue.500/10" color="blue.500">
                                <LuBadgeDollarSign size={18} />
                            </Circle>
                            <VStack align="start" gap="0.5">
                                <Heading size="sm" letterSpacing="tight">Create New Plan</Heading>
                                <Text fontSize="xs" color={muted}>
                                    Design a new membership tier with pricing and features.
                                </Text>
                            </VStack>
                        </VStack>
                    </Card>

                    <Card p={5} cursor="pointer" onClick={handleManagePlans}>
                        <VStack align="start" gap={3}>
                            <Circle size="10" bg="green.500/10" color="green.500">
                                <LuSettings size={18} />
                            </Circle>
                            <VStack align="start" gap="0.5">
                                <Heading size="sm" letterSpacing="tight">Manage Plans</Heading>
                                <Text fontSize="xs" color={muted}>
                                    Edit pricing, features, and toggle availability.
                                </Text>
                            </VStack>
                        </VStack>
                    </Card>

                    <Card p={5} cursor="pointer" onClick={handleViewMembers}>
                        <VStack align="start" gap={3}>
                            <Circle size="10" bg="orange.500/10" color="orange.500">
                                <LuUsers size={18} />
                            </Circle>
                            <VStack align="start" gap="0.5">
                                <Heading size="sm" letterSpacing="tight">View Members</Heading>
                                <Text fontSize="xs" color={muted}>
                                    Browse all enrolled members and their subscription status.
                                </Text>
                            </VStack>
                        </VStack>
                    </Card>
                </SimpleGrid>
            </VStack>
        </PageLayout>
    );
};

export default Subscription;
