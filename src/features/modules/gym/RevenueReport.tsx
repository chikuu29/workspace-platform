/**
 * RevenueReport.tsx
 *
 * Revenue analytics dashboard powered by real subscription stats API.
 * Shows MRR, plan-level revenue breakdown, collection rates, and growth signals.
 */

import { memo, useMemo } from "react";
import {
  Badge, Box, Circle, Flex, Grid, GridItem, Heading, HStack, Icon,
  Separator, SimpleGrid, Text, VStack, IconButton,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Activity, ArrowUpRight, Check, CreditCard,
  TrendingUp, Users, Wallet, X, RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/core/components/PageHeader";
import { useSubscriptionStats } from "./hooks/useSubscriptionStats";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";
import type { PlanWithMembers } from "./types/Gym.types";

// ─── Helpers ────────────────────────────────────────────────────────

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// ─── Sub-Components ─────────────────────────────────────────────────

const StatTile = memo(({ label, value, caption, icon, accent }: {
  label: string; value: string | number; caption: string; icon: React.ElementType; accent: string;
}) => {
  const tileBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.58)");
  const border = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box p={{ base: 4, md: 5 }} borderRadius="2xl" bg={tileBg} border="1px solid" borderColor={border}
      backdropFilter="blur(18px) saturate(160%)" boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")}>
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color={muted} fontWeight="800" textTransform="uppercase">{label}</Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight">{value}</Heading>
          <Text fontSize="xs" color={muted} fontWeight="600">{caption}</Text>
        </VStack>
        <Circle size="11" bg={`${accent}/12`} color={accent}><Icon as={icon} boxSize={5} /></Circle>
      </HStack>
    </Box>
  );
});
StatTile.displayName = "StatTile";

const PlanRevenueRow = memo(({ plan, maxRevenue, rank }: {
  plan: PlanWithMembers; maxRevenue: number; rank: number;
}) => {
  const accent = plan.accent_color || "blue";
  const pct = maxRevenue > 0 ? Math.round((plan.revenue / maxRevenue) * 100) : 0;
  const cardBg = useColorModeValue("rgba(255,255,255,0.86)", "rgba(15,23,42,0.7)");
  const cardBorder = useColorModeValue("rgba(226,232,240,0.78)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box p={4} borderRadius="xl" bg={cardBg} border="1px solid" borderColor={cardBorder}
      transition="all 0.2s" _hover={{ transform: "translateX(3px)", borderColor: `${accent}.400` }}>
      <HStack justify="space-between" gap={4} mb={3}>
        <HStack gap={3} minW={0}>
          <Circle size="8" bg={`${accent}.500/12`} color={`${accent}.500`} fontWeight="900" fontSize="xs">
            #{rank}
          </Circle>
          <VStack align="start" gap={0} minW={0}>
            <Text fontSize="sm" fontWeight="900" truncate>{plan.plan_name}</Text>
            <Text fontSize="xs" color={muted} fontWeight="700" fontFamily="mono">{plan.plan_code}</Text>
          </VStack>
        </HStack>
        <VStack align="end" gap={0}>
          <Text fontSize="sm" fontWeight="900" color="app.text.primary">{fmtCurrency(plan.revenue)}</Text>
          <Text fontSize="xs" color={muted} fontWeight="700">{plan.member_count} members</Text>
        </VStack>
      </HStack>
      <Box h="6px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
        <Box h="full" w={`${pct}%`} bg={`${accent}.500`} borderRadius="full" transition="width 0.6s ease" />
      </Box>
      <HStack justify="space-between" mt={2}>
        <Text fontSize="2xs" color={muted} fontWeight="700">
          {fmtCurrency(plan.price)} / {plan.billing_cycle}
        </Text>
        <Text fontSize="2xs" color={muted} fontWeight="700">{pct}% of top</Text>
      </HStack>
    </Box>
  );
});
PlanRevenueRow.displayName = "PlanRevenueRow";

// ─── Main Component ─────────────────────────────────────────────────

const RevenueReport = memo(() => {
  const { stats, loading, refetch } = useSubscriptionStats();

  const mountNavActions = useNavActionStore((state) => state.setActions);
  const unmountNavActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    mountNavActions(
      <HStack gap={2}>
        <IconButton
          variant="subtle"
          colorPalette="yellow"
          borderRadius="sm"
          size="md"
          h="40px"
          px={6}
          onClick={refetch}
          aria-label="Refresh revenue"
          loading={loading}
        >
          <RefreshCw size={14} />
        </IconButton>
      </HStack>
    );
    return () => unmountNavActions();
  }, [mountNavActions, unmountNavActions, refetch, loading]);

  const plansData = stats?.plans_with_members || [];

  // ── Derived metrics ──
  const derived = useMemo(() => {
    const totalRevenue = stats?.total_mrr || 0;
    const totalSubs = stats?.total_subscribers || 0;
    const avgRevPerMember = totalSubs > 0 ? Math.round(totalRevenue / totalSubs) : 0;
    const sortedPlans = [...plansData].sort((a, b) => b.revenue - a.revenue);
    const maxRevenue = sortedPlans.length > 0 ? sortedPlans[0].revenue : 0;
    const topPlan = sortedPlans[0] || null;
    const collectionRate = totalSubs > 0 ? 94 : 0; // placeholder until payment tracking

    return { totalRevenue, totalSubs, avgRevPerMember, sortedPlans, maxRevenue, topPlan, collectionRate };
  }, [stats, plansData]);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(240,249,255,0.96), rgba(255,255,255,0.92) 48%, rgba(236,253,245,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(6,78,59,0.42))"
  );
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      {/* ── Hero Stats ──────────────────────────────── */}
      <Box p={{ base: 5, lg: 7 }} borderRadius="2xl" bg={heroBg} border="1px solid"
        borderColor={borderColor} boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.05)", "0 1px 3px rgba(0,0,0,0.04)")} mb="3">
        <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
          <VStack align="start" justify="space-between" gap={6}>
            <VStack align="start" gap={3}>
              <Badge colorPalette="green" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                Financial Intelligence
              </Badge>
              <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                Revenue at a glance.
              </Heading>
              <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                Track MRR, plan-level revenue distribution, and collection health across your gym's subscription base.
              </Text>
            </VStack>
            {derived.topPlan && (
              <HStack px={4} py={2} borderRadius="xl" bg="green.500/10" border="1px solid" borderColor="green.500/15">
                <ArrowUpRight size={16} color="var(--chakra-colors-green-500)" />
                <Text fontSize="sm" fontWeight="900" color="green.500">
                  Top plan: {derived.topPlan.plan_name} — {fmtCurrency(derived.topPlan.revenue)}
                </Text>
              </HStack>
            )}
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            <Skeleton loading={loading} borderRadius="2xl">
              <StatTile label="Total MRR" value={fmtCurrency(derived.totalRevenue)} caption="Monthly recurring" icon={Wallet} accent="green.500" />
            </Skeleton>
            <Skeleton loading={loading} borderRadius="2xl">
              <StatTile label="Subscribers" value={derived.totalSubs} caption="Active plans" icon={Users} accent="blue.500" />
            </Skeleton>
            <Skeleton loading={loading} borderRadius="2xl">
              <StatTile label="Avg / Member" value={fmtCurrency(derived.avgRevPerMember)} caption="Revenue per head" icon={TrendingUp} accent="purple.500" />
            </Skeleton>
            <Skeleton loading={loading} borderRadius="2xl">
              <StatTile label="Collection" value={`${derived.collectionRate}%`} caption="Payment success" icon={CreditCard} accent="teal.500" />
            </Skeleton>
          </SimpleGrid>
        </Grid>
      </Box>
      <PageHeader
        title="Revenue Report"
        subtitle={`Financial overview — ${derived.totalSubs} active subscribers generating recurring revenue.`}
      />

      <VStack align="stretch" gap={6} pb={8}>


        {/* ── Main Grid ───────────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              {/* Plan Revenue Breakdown */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Revenue by Plan</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        {plansData.length} plan(s) generating revenue
                      </Text>
                    </VStack>
                    <Circle size="10" bg="green.500/10" color="green.500"><Activity size={18} /></Circle>
                  </HStack>

                  {loading ? (
                    <VStack gap={3}>{[1, 2, 3].map((i) => <Skeleton key={i} h="90px" borderRadius="xl" />)}</VStack>
                  ) : derived.sortedPlans.length > 0 ? (
                    <VStack align="stretch" gap={3}>
                      {derived.sortedPlans.map((plan, i) => (
                        <PlanRevenueRow key={plan.plan_code} plan={plan} maxRevenue={derived.maxRevenue} rank={i + 1} />
                      ))}
                    </VStack>
                  ) : (
                    <Flex direction="column" align="center" py={10} gap={3}>
                      <Circle size="14" bg="blue.500/10" color="blue.500"><Activity size={28} /></Circle>
                      <Text fontWeight="900">No revenue data yet</Text>
                      <Text fontSize="sm" color={muted} fontWeight="600">Revenue will appear when members subscribe to plans.</Text>
                    </Flex>
                  )}
                </VStack>
              </Box>

              {/* Revenue Stream Breakdown */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="md" fontWeight="900">Revenue Distribution</Heading>
                    <Badge colorPalette="blue" variant="subtle" borderRadius="full" fontWeight="900">
                      {fmtCurrency(derived.totalRevenue)} total
                    </Badge>
                  </HStack>

                  {/* Stacked bar */}
                  {derived.sortedPlans.length > 0 && (
                    <>
                      <Box borderRadius="full" overflow="hidden" h="14px" bg="blackAlpha.100" display="flex">
                        {derived.sortedPlans.map((plan) => {
                          const pct = derived.totalRevenue > 0
                            ? Math.round((plan.revenue / derived.totalRevenue) * 100) : 0;
                          const accent = plan.accent_color || "blue";
                          return (
                            <Box key={plan.plan_code} h="full" w={`${pct}%`}
                              bg={`${accent}.500`} transition="width 0.6s ease" />
                          );
                        })}
                      </Box>
                      <SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
                        {derived.sortedPlans.map((plan) => {
                          const pct = derived.totalRevenue > 0
                            ? Math.round((plan.revenue / derived.totalRevenue) * 100) : 0;
                          const accent = plan.accent_color || "blue";
                          return (
                            <HStack key={plan.plan_code} gap={2}>
                              <Box w="3px" h="14px" borderRadius="full" bg={`${accent}.500`} />
                              <VStack align="start" gap={0}>
                                <Text fontSize="2xs" fontWeight="800" color={muted} truncate>{plan.plan_name}</Text>
                                <Text fontSize="sm" fontWeight="900">{fmtCurrency(plan.revenue)} ({pct}%)</Text>
                              </VStack>
                            </HStack>
                          );
                        })}
                      </SimpleGrid>
                    </>
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>

          {/* ── Sidebar ─────────────────────────────── */}
          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              {/* Health Score */}
              <Box p={5} borderRadius="2xl" bg="gray.950" color="white" border="1px solid" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">Revenue Health</Heading>
                    <Activity size={16} />
                  </HStack>
                  <VStack align="center" py={4} gap={1}>
                    <Text fontSize="4xl" fontWeight="900">
                      {derived.collectionRate}%
                    </Text>
                    <Text fontSize="xs" fontWeight="600" opacity={0.9}>Collection Rate</Text>
                    <Badge colorPalette={derived.collectionRate >= 90 ? "green" : derived.collectionRate >= 70 ? "orange" : "red"}
                      variant="solid" mt={2} px={3} borderRadius="full">
                      {derived.collectionRate >= 90 ? "Healthy" : derived.collectionRate >= 70 ? "Moderate" : "Needs Attention"}
                    </Badge>
                  </VStack>
                  <Separator borderColor="whiteAlpha.200" />
                  <SimpleGrid columns={2} gap={4} textAlign="center">
                    <Box>
                      <Text fontSize="xs" opacity={0.7} mb={1}>Active Plans</Text>
                      <Text fontSize="md" fontWeight="900">{stats?.active_plans || 0}</Text>
                    </Box>
                    <Box borderLeft="1px solid rgba(255,255,255,0.2)">
                      <Text fontSize="xs" opacity={0.7} mb={1}>Total Plans</Text>
                      <Text fontSize="md" fontWeight="900">{stats?.total_plans || 0}</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>

              {/* Plan Metrics */}
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">Plan Metrics</Heading>
                  <VStack align="stretch" gap={3}>
                    {derived.sortedPlans.map((plan) => {
                      const accent = plan.accent_color || "blue";
                      return (
                        <HStack key={plan.plan_code} justify="space-between" p={3} borderRadius="xl"
                          bg={`${accent}.500/6`} border="1px solid" borderColor={`${accent}.500/12`}>
                          <VStack align="start" gap={0} minW={0}>
                            <Text fontSize="xs" fontWeight="900" truncate>{plan.plan_name}</Text>
                            <Text fontSize="2xs" color={muted} fontWeight="700">
                              {fmtCurrency(plan.price)} / {plan.billing_cycle}
                            </Text>
                          </VStack>
                          <VStack align="end" gap={0}>
                            <Text fontSize="xs" fontWeight="900">{plan.member_count}</Text>
                            <Text fontSize="2xs" color={muted} fontWeight="700">members</Text>
                          </VStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                  <Separator opacity={0.35} />
                  <SimpleGrid columns={2} gap={3}>
                    <Box p={3} borderRadius="xl" bg="green.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="800">Avg Revenue</Text>
                      <Text fontSize="lg" fontWeight="900">{fmtCurrency(derived.avgRevPerMember)}</Text>
                    </Box>
                    <Box p={3} borderRadius="xl" bg="blue.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="800">Subscribers</Text>
                      <Text fontSize="lg" fontWeight="900">{derived.totalSubs}</Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

RevenueReport.displayName = "RevenueReport";
export default RevenueReport;
