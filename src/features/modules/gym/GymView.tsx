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
import { memo, useCallback, useMemo, useEffect } from "react";
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
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

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
      bg={panelBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(16px) saturate(140%)"
      boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}
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


// ═══════════════════════════════════════════════════════════════════════
// ── Main Page Component ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

const GymView = memo(() => {
  const { stats, loading, refresh } = useGymDashboard();
  const { navigateTo } = useWorkspaceRouter();

  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");

  const mountNavActions = useNavActionStore((state) => state.setActions);
  const unmountNavActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    mountNavActions(
      <HStack gap={2}>
        <IconButton
          // variant=""
          colorPalette="yellow"
          borderRadius="sm"
          // size="sm"
          onClick={refresh}
          aria-label="Refresh dashboard"
          loading={loading}
          size="md"
          h="40px"
          px={6}
        >
          <RefreshCw size={16} /> Sync
        </IconButton>
        <Button
          borderRadius="sm"
          fontWeight="800"
          size="md"
          h="40px"
          px={6}
          onClick={() => navigateTo("members")}
        >
          <Icon as={Users} /> Directory
        </Button>
        <Button
          colorPalette="blue"
          borderRadius="sm"
          fontWeight="800"
          size="md"
          h="40px"
          px={6}
          onClick={() => navigateTo("AddMember")}
        >
          <Plus size={16} /> Enroll Member
        </Button>
      </HStack>
    );
    return () => unmountNavActions();
  }, [mountNavActions, unmountNavActions, refresh, loading, navigateTo]);

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
              w="48px"
              h="48px"
              bg="linear-gradient(135deg, #3182ce, #6366f1)"
              borderRadius="xl"
              color="white"
              boxShadow="0 8px 16px rgba(49, 130, 206, 0.25)"
              flexShrink={0}
            >
              <Zap size={24} fill="white" />
            </Flex>
            <Text>Operational Intelligence</Text>
          </HStack>
        }
        subtitle="Real-time control center for memberships, high-frequency gym workflows, and floor density analytics."
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
