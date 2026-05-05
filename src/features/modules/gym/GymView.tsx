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
import { memo, useCallback, useMemo } from "react";
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
} from "lucide-react";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymDashboard } from "./hooks/useGymDashboard";
import { useGymNavigation } from "./hooks/useGymNavigation";

// Sub-components
import StatCard from "./components/StatCard";
import QuickActionCard from "./components/QuickActionCard";
import ActionRequiredList, { type AlertItem } from "./components/ActionRequiredList";
import RecentEnrollmentsList from "./components/RecentEnrollmentsList";
import FloorCapacityGauge from "./components/FloorCapacityGauge";

// ── Helpers ──────────────────────────────────────────────────────────

const formatCurrency = (value?: number): string =>
  `$${(value || 0).toLocaleString()}`;

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
    label: "Member Check-in",
    description: "Log front desk arrival",
    icon: Clock,
    accentColor: "green.500",
    view: "MemberCheckIn",
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
    view: "GymSubscriptionPlans",
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
  /** Stable callbacks map — one per action */
  const handlers = useMemo(
    () =>
      Object.fromEntries(
        QUICK_ACTIONS.map((a) => [a.id, () => onNavigate(a.view)])
      ) as Record<string, () => void>,
    [onNavigate],
  );

  return (
    <Box
      p={5}
      borderRadius="2xl"
      bg="app.card.bg"
      border="1px solid"
      borderColor="app.card.border"
      boxShadow="0 1px 3px rgba(0,0,0,0.04)"
    >
      <VStack align="stretch" gap={4}>
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
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              label={action.label}
              description={action.description}
              icon={action.icon}
              accentColor={action.accentColor}
              onClick={handlers[action.id]}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </Box>
  );
});
QuickActionsSection.displayName = "QuickActionsSection";

// ── Page Header Actions (memoized) ───────────────────────────────────

interface HeaderActionsProps {
  onDirectory: () => void;
  onEnroll: () => void;
}

const HeaderActions = memo(({ onDirectory, onEnroll }: HeaderActionsProps) => (
  <HStack gap={3}>
    <Button
      variant="outline"
      borderRadius="sm"
      fontWeight="800"
      onClick={onDirectory}
      h="46px"
      px={6}
      borderColor="app.card.border"
      _hover={{ bg: "app.card.bg", borderColor: "app.text.accent", color: "app.text.accent" }}
    >
      <Users size={18} /> Directory
    </Button>
    <Button
      colorPalette="blue"
      borderRadius="sm"
      fontWeight="800"
      onClick={onEnroll}
      h="46px"
      px={6}
      boxShadow="0 4px 12px rgba(49, 130, 206, 0.3)"
      _hover={{ transform: "translateY(-1px)", boxShadow: "0 6px 16px rgba(49, 130, 206, 0.4)" }}
    >
      <UserPlus size={18} /> Enroll Member
    </Button>
  </HStack>
));
HeaderActions.displayName = "HeaderActions";

// ═══════════════════════════════════════════════════════════════════════
// ── Main Page Component ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

const GymView = memo(() => {
  const { stats, loading } = useGymDashboard();
  const { navigateTo } = useGymNavigation();

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

  // ── Stable navigation callbacks ───────────────────────────────────
  const handleDirectory = useCallback(() => navigateTo("members"), [navigateTo]);
  const handleEnroll = useCallback(() => navigateTo("AddMember"), [navigateTo]);
  const handleViewAll = useCallback(() => navigateTo("members"), [navigateTo]);
  const handleSchedule = useCallback(() => navigateTo("listClasses"), [navigateTo]);

  const handleMemberClick = useCallback(
    (recordId: string) => navigateTo(`members/${recordId}`),
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

  const recentMembers = stats?.recent_members || [];

  return (
    <Box w="full" animation="fade-in 0.4s ease-out">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <PageHeader
        title={
          <HStack gap={4}>
            <Flex
              align="center"
              justify="center"
              w="54px"
              h="54px"
              bg="linear-gradient(135deg, #3182ce, #6366f1)"
              borderRadius="xl"
              color="white"
              boxShadow="0 8px 20px rgba(49, 130, 206, 0.3)"
              flexShrink={0}
            >
              <Zap size={28} fill="white" />
            </Flex>
            <Text>Operational Intelligence</Text>
          </HStack>
        }
        subtitle="Real-time control center for memberships, high-frequency gym workflows, and floor density analytics."
        actions={
          <HeaderActions
            onDirectory={handleDirectory}
            onEnroll={handleEnroll}
          />
        }
      />

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── KPI Row ──────────────────────────────────────────────── */}
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
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
            label="Active Trainers"
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
                members={recentMembers}
                loading={loading}
                onViewAll={handleViewAll}
                onMemberClick={handleMemberClick}
              />
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
