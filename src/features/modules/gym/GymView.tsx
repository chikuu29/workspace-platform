/**
 * GymView.tsx
 *
 * Modern gym management dashboard — the home screen for the gym app.
 * Composed of small, memoized sub-components for maximum reusability
 * and zero unnecessary re-renders.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  PageHeader                                                  │
 * ├──────────────────────────────────────────────────────────────┤
 * │  4-col KPI Row                                               │
 * ├──────────────────────────────────────────────────────────────┤
 * │  Main Grid (left: Quick Actions + Enrollments, right: panel) │
 * └──────────────────────────────────────────────────────────────┘
 *
 * @module features/modules/gym/GymView
 */
import { memo, useCallback, useMemo, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  SimpleGrid,
  Text,
  VStack,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  CreditCard,
  Dumbbell,
  FileText,
  LucideIcon,
  Receipt,
  UserPlus,
  Users,
  Zap,
  Plus,
  RefreshCw,
} from "lucide-react";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymDashboard } from "./hooks/useGymDashboard";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { useNavActionStore } from "@/core/store/useNavActionStore";

// Sub-components
import StatCard from "./components/StatCard";
import QuickActionCard from "./components/QuickActionCard";
import ActionRequiredList, { type AlertItem } from "./components/ActionRequiredList";
import RecentEnrollmentsList from "./components/RecentEnrollmentsList";
import FloorCapacityGauge from "./components/FloorCapacityGauge";
import { useColorModeValue } from "@/components/ui/color-mode";
import ChartCard from "@/components/common/ChartCard";

// ── Helpers ──────────────────────────────────────────────────────────

const formatCurrency = (value?: number): string =>
  `₹${(value || 0).toLocaleString("en-IN")}`;

// ── Quick Actions config (stable — defined outside component) ────────

interface QuickActionDef {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  view: string;
}

const QUICK_ACTIONS: QuickActionDef[] = [
  {
    id: "enroll",
    label: "New Enrollment",
    description: "Create a member profile",
    icon: UserPlus,
    accentColor: "blue.500",
    view: "AddMember",
  },
  {
    id: "checkin",
    label: "Attendance Terminal",
    description: "Log front desk arrivals",
    icon: Clock,
    accentColor: "green.500",
    view: "attendance",
  },
  {
    id: "billing",
    label: "Process Payment",
    description: "Open billing workflow",
    icon: Receipt,
    accentColor: "purple.500",
    view: "Subscription",
  },
  {
    id: "plans",
    label: "Subscription Plans",
    description: "Manage membership tiers",
    icon: CreditCard,
    accentColor: "teal.500",
    view: "subscriptions",
  },
  {
    id: "trainers",
    label: "Trainers & Staff",
    description: "View trainer roster",
    icon: Dumbbell,
    accentColor: "orange.500",
    view: "trainers",
  },
  {
    id: "revenue",
    label: "Revenue Report",
    description: "Analytics & insights",
    icon: BarChart3,
    accentColor: "pink.500",
    view: "revenueReport",
  },
];

// ── Quick Actions Section (memoized) ─────────────────────────────────

interface QuickActionsSectionProps {
  onNavigate: (view: string) => void;
}

const QuickActionsSection = memo(({ onNavigate }: QuickActionsSectionProps) => {
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  /** Stable callbacks map — one per action */
  const handlers = useMemo(
    () =>
      Object.fromEntries(
        QUICK_ACTIONS.map((a) => [a.id, () => onNavigate(a.view)])
      ) as Record<string, () => void>,
    [onNavigate],
  );

  const renderActionCard = useCallback(
    (action: QuickActionDef) => (
      <QuickActionCard
        key={action.id}
        label={action.label}
        description={action.description}
        icon={action.icon}
        accentColor={action.accentColor}
        onClick={handlers[action.id]}
      />
    ),
    [handlers],
  );

  return (
    <Box
      p={5.5}
      borderRadius="24px"
      bg={"app.card.bg"}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px) saturate(160%)"
      boxShadow={useColorModeValue("0 10px 30px rgba(0, 0, 0, 0.04)", "0 4px 20px rgba(0, 0, 0, 0.2)")}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative vertical accent bar */}
      <Box
        position="absolute"
        top="0"
        left="0"
        bottom="0"
        w="4px"
        bgGradient="linear(to-b, #7551FF, #422AFB)"
      />

      <VStack align="stretch" gap={4.5} pl={2}>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0}>
            <Heading size="sm" fontWeight="900" color="app.text.primary">
              Quick Actions
            </Heading>
            <Text fontSize="xs" fontWeight="600" color="app.text.muted">
              Daily workflows for front desk and managers
            </Text>
          </VStack>
          <Badge
            colorPalette="blue"
            borderRadius="full"
            px={3}
            py={1}
            fontWeight="800"
            fontSize="2xs"
          >
            Today
          </Badge>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
          {QUICK_ACTIONS.map(renderActionCard)}
        </SimpleGrid>
      </VStack>
    </Box>
  );
});
QuickActionsSection.displayName = "QuickActionsSection";


// ═══════════════════════════════════════════════════════════════════════
// ── Main Page Component ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

const GymView = memo(() => {
  const { stats, loading, refresh } = useGymDashboard();
  const { navigateTo } = useWorkspaceRouter();

  const [revenueRange, setRevenueRange] = useState<string>("30d");

  const revenueRangeOptions = useMemo(
    () => [
      { label: "Last 30 Days", value: "30d" },
      { label: "This Year", value: "year" },
    ],
    []
  );

  const handleRevenueRangeChange = useCallback((value: string) => {
    setRevenueRange(value);
  }, []);

  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh dashboard",
        onClick: refresh,
        loading: loading,
        flexShrink: 0,
      },
      {
        id: "members",
        label: "Members",
        bg: "gradient_cyan_purple",
        color: "white",
        icon: Users,
        onClick: () => navigateTo("members"),
      },
      {
        id: "enroll",
        label: "Enroll Member",
        icon: Plus,
        bg: "gradient_purple",
        color: "white",
        onClick: () => navigateTo("AddMember"),
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, refresh, loading, navigateTo]);

  // ── Derived KPI values ────────────────────────────────────────────
  const kpis = stats?.kpis;
  const totalMembers = kpis?.total_members || 0;
  const activeMembers = kpis?.active_members || 0;
  const attentionMembers = kpis?.attention_members || 0;
  const frozenMembers = kpis?.frozen_members || 0;
  const checkinsToday = kpis?.checkins_today || 0;
  const utilization = kpis?.trainer_utilization || 0;
  const revenueMrr = kpis?.revenue_mrr || 0;

  const retentionPct = useMemo(
    () => (totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0),
    [activeMembers, totalMembers],
  );

  const membershipData = useMemo(
    () => [
      { name: "Active Members", value: activeMembers },
      { name: "Frozen Members", value: frozenMembers },
      { name: "Needs Attention", value: attentionMembers },
    ],
    [activeMembers, frozenMembers, attentionMembers]
  );

  const planPopularityData = useMemo(
    () => [
      { name: "Monthly Plans", value: 55 },
      { name: "Quarterly Plans", value: 25 },
      { name: "Yearly Plans", value: 20 },
    ],
    []
  );

  const paymentStatusData = useMemo(
    () => [
      { name: "Paid Invoices", value: 80 },
      { name: "Pending Invoices", value: 15 },
      { name: "Overdue Invoices", value: 5 },
    ],
    []
  );

  const revenueTrendData = useMemo(
    () => {
      if (revenueRange === "year") {
        return [
          { label: "Jan", value: 120000 },
          { label: "Feb", value: 140000 },
          { label: "Mar", value: 170000 },
          { label: "Apr", value: 210000 },
          { label: "May", value: 280000 },
          { label: "Jun", value: 360000 }, // Peak
          { label: "Jul", value: 310000 }, // Dip
          { label: "Aug", value: 290000 },
          { label: "Sep", value: 330000 },
          { label: "Oct", value: 390000 },
          { label: "Nov", value: 440000 },
          { label: "Dec", value: 510000 },
        ];
      }
      return [
        { label: "Day 1", value: 10000 },
        { label: "Day 5", value: 15000 },
        { label: "Day 10", value: 22000 },
        { label: "Day 15", value: 35000 }, // Peak/Growth Rise
        { label: "Day 20", value: 26000 }, // Dip/Fluctuation
        { label: "Day 25", value: 31000 },
        { label: "Day 30", value: 42000 }, // Final Growth
      ];
    },
    [revenueRange]
  );

  // ── Stable navigation callbacks ───────────────────────────────────
  const handleDirectory = useCallback(() => navigateTo("members"), [navigateTo]);
  const handleEnroll = useCallback(() => navigateTo("AddMember"), [navigateTo]);
  const handleViewAll = useCallback(() => navigateTo("members"), [navigateTo]);
  const handleSchedule = useCallback(() => navigateTo("listClasses"), [navigateTo]);

  const handleMemberClick = useCallback(
    (recordId: string) => navigateTo(`member/${recordId}`),
    [navigateTo],
  );

  // ── Action Required items (stable) ────────────────────────────────
  const alertItems: AlertItem[] = useMemo(
    () => [
      {
        id: "renewal",
        title: "Renewal Attention",
        description: `${attentionMembers} members need follow-up`,
        icon: AlertCircle,
        accentColor: "orange.500",
        count: attentionMembers,
      },
      {
        id: "frozen",
        title: "Frozen Accounts",
        description: `${frozenMembers} paused memberships`,
        icon: Zap,
        accentColor: "blue.500",
        count: frozenMembers,
      },
      {
        id: "checkins",
        title: "Daily Check-ins",
        description: `${checkinsToday} visits recorded today`,
        icon: CheckCircle2,
        accentColor: "green.500",
        count: checkinsToday,
      },
    ],
    [attentionMembers, frozenMembers, checkinsToday],
  );

  return (
    <Box w="full" animation="fade-in 0.4s ease-out">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <PageHeader
        title="Grow and Manage Your Gym"
        subtitle="Simplify memberships, payments, attendance tracking, and daily operations."
        icon={Zap}
        badge="Live Gym Ops"
        accentColor="blue"
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── KPI Row ──────────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 3, xl: 5 }} gap={4}>
          <StatCard
            label="Total Members"
            value={totalMembers.toLocaleString()}
            subtitle={`${retentionPct}% active ratio`}
            icon={Users}
            accentColor="blue.500"
            loading={loading}
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(revenueMrr)}
            subtitle="Monthly recurring revenue"
            icon={FileText}
            accentColor="purple.500"
            loading={loading}
          />
          <StatCard
            label="Total Trainers"
            value={(kpis?.total_trainers || 0).toLocaleString()}
            subtitle="Total staff strength"
            icon={Users}
            accentColor="teal.500"
            loading={loading}
          />
          <StatCard
            label="Staff Capacity"
            value={`${utilization}%`}
            subtitle="Floor capacity signal"
            icon={Dumbbell}
            accentColor="orange.500"
            loading={loading}
          />
          <StatCard
            label="Attendance"
            value={checkinsToday.toLocaleString()}
            subtitle="Check-ins today"
            icon={Activity}
            accentColor="green.500"
            loading={loading}
          />
        </SimpleGrid>

        {/* ── Analytics Charts ──────────────────────────────────────── */}
        <VStack align="stretch" gap={6}>
          {/* Row 1: Line Charts */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
            <ChartCard
              title="Revenue Trend"
              subtitle={revenueRange === "year" ? "Income growth over this year" : "Income growth over the last 30 days"}
              type="line"
              initialData={revenueTrendData}
              filterOptions={revenueRangeOptions}
              selectedFilter={revenueRange}
              onFilterChange={handleRevenueRangeChange}
            />
            <ChartCard
              title="Attendance Trend"
              subtitle="Daily visits history for the last 7 days"
              type="line"
              apiEndpoint="/v1/gym/analytics/attendance"
            />
          </SimpleGrid>


        </VStack>

        {/* ── Main Content Grid ────────────────────────────────────── */}
        <Grid
          templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }}
          gap={{ base: 6, xl: 8 }}
        >
          {/* Left column: Quick Actions + Recent Enrollments */}
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              <QuickActionsSection onNavigate={navigateTo} />
              <RecentEnrollmentsList
                onViewAll={handleViewAll}
                onMemberClick={handleMemberClick}
              />
              {/* Row 2: Distribution Donut Charts */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                <ChartCard
                  title="Membership Distribution"
                  subtitle="Active, frozen, and attention memberships"
                  type="pie"
                  initialData={membershipData}

                />
                <ChartCard
                  title="Plan Popularity"
                  subtitle="Plan tier selection ratio"
                  type="pie"
                  initialData={planPopularityData}

                />
                <ChartCard
                  title="Payment Status"
                  subtitle="Fulfillment status ratio"
                  type="pie"

                  initialData={paymentStatusData}
                />
              </SimpleGrid>
            </VStack>
          </GridItem>

          {/* Right column: Action Required + Floor Gauge */}
          <GridItem>
            <VStack
              align="stretch"
              gap={5}
              position={{ xl: "sticky" }}
              top={{ xl: "7rem" }}
            >
              <ActionRequiredList
                items={alertItems}
                totalCount={attentionMembers + frozenMembers}
              />
              <FloorCapacityGauge
                utilization={utilization}
                onViewSchedule={handleSchedule}
              />
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

GymView.displayName = "GymView";
export default GymView;
