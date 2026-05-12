/**
 * GymManagementDashboard.tsx
 *
 * Modern SaaS command center for gym operations.
 */

import { memo, useCallback, useMemo, type ElementType } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Progress,
  Separator,
  SimpleGrid,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Clock3,
  CreditCard,
  Dumbbell,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymDashboard } from "./hooks/useGymDashboard";
import RevenuAnalytics from "./RevenuAnalytics";

const formatCurrency = (value?: number) => `$${(value || 0).toLocaleString()}`;

const formatDate = (date?: string) => {
  if (!date) return "Recently";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const SurfaceCard = memo(({
  children,
  p = { base: 4, md: 5 },
  ...props
}: {
  children: React.ReactNode;
  p?: any;
  [key: string]: any;
}) => {
  const bg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(15,23,42,0.66)");
  const border = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");

  return (
    <Box
      p={p}
      borderRadius="2xl"
      bg={bg}
      border="1px solid"
      borderColor={border}
      backdropFilter="blur(18px) saturate(150%)"
      boxShadow="0 22px 52px -38px rgba(15, 23, 42, 0.72)"
      {...props}
    >
      {children}
    </Box>
  );
});
SurfaceCard.displayName = "SurfaceCard";

const KpiTile = memo(({
  label,
  value,
  caption,
  icon,
  accent,
  loading,
}: {
  label: string;
  value: string;
  caption: string;
  icon: ElementType;
  accent: string;
  loading: boolean;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <SurfaceCard p={5}>
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
            {label}
          </Text>
          <Skeleton loading={loading}>
            <Heading size="xl" color="app.text.primary" letterSpacing="tight">
              {value}
            </Heading>
          </Skeleton>
          <Text fontSize="xs" color={muted} fontWeight="700">
            {caption}
          </Text>
        </VStack>
        <Circle size="11" bg={`${accent}/10`} color={accent}>
          <Icon as={icon} boxSize={5} />
        </Circle>
      </HStack>
    </SurfaceCard>
  );
});
KpiTile.displayName = "KpiTile";

const WorkflowButton = memo(({
  label,
  caption,
  icon,
  accent,
  onClick,
}: {
  label: string;
  caption: string;
  icon: ElementType;
  accent: string;
  onClick: () => void;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Button
      h="auto"
      minH="84px"
      p={4}
      justifyContent="start"
      variant="ghost"
      borderRadius="2xl"
      onClick={onClick}
      _hover={{ bg: `${accent}/10`, transform: "translateY(-2px)" }}
      transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
    >
      <HStack gap={4} w="full" align="center">
        <Circle size="11" bg={`${accent}/12`} color={accent} flexShrink={0}>
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap={0.5} minW={0}>
          <Text fontSize="sm" fontWeight="900" color="app.text.primary">
            {label}
          </Text>
          <Text fontSize="xs" color={muted} fontWeight="700" textAlign="left">
            {caption}
          </Text>
        </VStack>
      </HStack>
    </Button>
  );
});
WorkflowButton.displayName = "WorkflowButton";

const AlertRow = memo(({
  title,
  description,
  icon,
  accent,
}: {
  title: string;
  description: string;
  icon: ElementType;
  accent: string;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <HStack p={3} borderRadius="xl" bg={`${accent}/10`} border="1px solid" borderColor={`${accent}/20`} gap={3}>
      <Circle size="8" bg={`${accent}/12`} color={accent}>
        <Icon as={icon} boxSize={4} />
      </Circle>
      <VStack align="start" gap={0} minW={0}>
        <Text fontSize="sm" fontWeight="900" color="app.text.primary">
          {title}
        </Text>
        <Text fontSize="xs" color={muted} fontWeight="700">
          {description}
        </Text>
      </VStack>
    </HStack>
  );
});
AlertRow.displayName = "AlertRow";

const GymManagementDashboard = memo(() => {
  const { navigateTo } = useWorkspaceRouter();

  const { stats, loading } = useGymDashboard();

  const kpis = stats?.kpis;
  const totalMembers = kpis?.total_members || 0;
  const activeMembers = kpis?.active_members || 0;
  const attentionMembers = kpis?.attention_members || 0;
  const frozenMembers = kpis?.frozen_members || 0;
  const retention = totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0;
  const utilization = kpis?.trainer_utilization || 0;

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.94) 50%, rgba(236,253,245,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.9) 50%, rgba(6,78,59,0.42))"
  );
  const borderColor = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mt={4} w="full" animation="fade-in 0.5s ease-out">
      <PageHeader
        title="Gym Command Center"
        subtitle="Live overview for members, renewals, floor activity, and revenue performance."
        actions={
          <HStack gap={3}>
            <Button variant="outline" borderRadius="xl" onClick={() => navigateTo("members")} fontWeight="900">
              <Users size={16} /> Directory
            </Button>
            <Button colorPalette="blue" borderRadius="xl" onClick={() => navigateTo("AddMember")} fontWeight="900">
              <UserPlus size={16} /> Enroll Member
            </Button>
          </HStack>
        }
      />

      <VStack align="stretch" gap={6} pb={8}>
        <SurfaceCard p={{ base: 5, lg: 7 }} bg={heroBg} borderColor={borderColor}>
          <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.7fr" }} gap={6} alignItems="stretch">
            <VStack align="start" justify="space-between" gap={6}>
              <VStack align="start" gap={3}>
                <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                  Live Gym Ops
                </Badge>
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                  Run memberships, check-ins, and revenue from one cockpit.
                </Heading>
                <Text color={muted} fontSize="sm" maxW="580px" fontWeight="700">
                  Monitor the health of your gym business with member signals, daily workflows, revenue insight, and operational alerts.
                </Text>
              </VStack>
              <HStack gap={3} flexWrap="wrap">
                <Button colorPalette="blue" borderRadius="xl" fontWeight="900" onClick={() => navigateTo("AddMember")}>
                  <UserPlus size={18} /> New Enrollment
                </Button>
                <Button variant="outline" borderRadius="xl" fontWeight="900" onClick={() => navigateTo("Subscription")}>
                  <CreditCard size={17} /> Billing
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
              <KpiTile label="Active members" value={activeMembers.toLocaleString()} caption={`${retention}% active ratio`} icon={Users} accent="blue.500" loading={loading} />
              <KpiTile label="Check-ins today" value={(kpis?.checkins_today || 0).toLocaleString()} caption="Front desk traffic" icon={Activity} accent="green.500" loading={loading} />
              <KpiTile label="MRR" value={formatCurrency(kpis?.revenue_mrr)} caption="Monthly recurring revenue" icon={Receipt} accent="purple.500" loading={loading} />
              <KpiTile label="Trainer utilization" value={`${utilization}%`} caption="Floor capacity signal" icon={Dumbbell} accent="orange.500" loading={loading} />
            </SimpleGrid>
          </Grid>
        </SurfaceCard>

        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">
                        Daily Workflows
                      </Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        High-frequency actions for front desk and managers.
                      </Text>
                    </VStack>
                    <Badge colorPalette="blue" borderRadius="full" px={3} py={1} fontWeight="900">
                      Today
                    </Badge>
                  </Flex>

                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
                    <WorkflowButton label="New Enrollment" caption="Create member profile" icon={UserPlus} accent="blue.500" onClick={() => navigateTo("AddMember")} />
                    <WorkflowButton label="Member Check-in" caption="Log front desk arrival" icon={Clock3} accent="green.500" onClick={() => navigateTo("MemberCheckIn")} />
                    <WorkflowButton label="Process Payment" caption="Open billing workflow" icon={Receipt} accent="purple.500" onClick={() => navigateTo("Subscription")} />
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>

              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">
                        Revenue Intelligence
                      </Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        Plan distribution, membership growth, and revenue composition.
                      </Text>
                    </VStack>
                    <Button variant="ghost" size="sm" borderRadius="xl" colorPalette="blue" fontWeight="900" onClick={() => navigateTo("revenueReport")}>
                      Detailed Report <ArrowRight size={15} />
                    </Button>
                  </Flex>
                  <RevenuAnalytics />
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              <SurfaceCard>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">
                      Operational Alerts
                    </Heading>
                    <Badge colorPalette="orange" borderRadius="full" variant="solid">
                      {attentionMembers + frozenMembers}
                    </Badge>
                  </HStack>
                  <VStack align="stretch" gap={3}>
                    <AlertRow title="Renewal attention" description={`${attentionMembers} members need follow-up`} icon={CircleAlert} accent="orange.500" />
                    <AlertRow title="Frozen accounts" description={`${frozenMembers} paused memberships`} icon={Zap} accent="blue.500" />
                    <AlertRow title="Daily check-ins" description={`${kpis?.checkins_today || 0} visits recorded today`} icon={CircleCheck} accent="green.500" />
                  </VStack>
                </VStack>
              </SurfaceCard>

              <SurfaceCard>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">
                      Recent Enrollments
                    </Heading>
                    <Button variant="ghost" size="xs" borderRadius="lg" onClick={() => navigateTo("members")} fontWeight="900">
                      View all
                    </Button>
                  </HStack>
                  <Skeleton loading={loading} borderRadius="xl">
                    <VStack align="stretch" gap={3}>
                      {(stats?.recent_members || []).slice(0, 5).map((member) => (
                        <HStack
                          key={member.record_id}
                          justify="space-between"
                          p={3}
                          borderRadius="xl"
                          bg="blue.500/8"
                          cursor="pointer"
                          _hover={{ bg: "blue.500/12", transform: "translateX(2px)" }}
                          transition="all 0.2s"
                          onClick={() => navigateTo(`members/${member.record_id}`)}
                        >
                          <HStack gap={3} minW={0}>
                            <Avatar.Root size="sm" shape="rounded">
                              <Avatar.Fallback fontWeight="900">{member.name?.slice(0, 2).toUpperCase() || "GM"}</Avatar.Fallback>
                            </Avatar.Root>
                            <VStack align="start" gap={0} minW={0}>
                              <Text fontSize="sm" fontWeight="900" truncate>
                                {member.name}
                              </Text>
                              <Text fontSize="xs" color={muted} fontWeight="700" truncate>
                                {member.plan} • {formatDate(member.created_at)}
                              </Text>
                            </VStack>
                          </HStack>
                          <Badge colorPalette="green" variant="subtle" borderRadius="full">
                            Active
                          </Badge>
                        </HStack>
                      ))}
                      {!loading && (stats?.recent_members || []).length === 0 && (
                        <VStack py={8} gap={2}>
                          <Icon as={CircleCheck} boxSize={8} color="gray.300" />
                          <Text fontSize="sm" color={muted} fontWeight="700">
                            No recent enrollments yet.
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </Skeleton>
                </VStack>
              </SurfaceCard>

              <SurfaceCard bg="gray.950" color="white" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="sm" fontWeight="900">
                        Floor Capacity
                      </Heading>
                      <Text fontSize="xs" color="gray.400" fontWeight="800">
                        Trainer utilization
                      </Text>
                    </VStack>
                    <CalendarDays size={20} />
                  </HStack>
                  <Progress.Root value={utilization} colorPalette="orange" size="sm">
                    <Progress.Track bg="whiteAlpha.200">
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.300" fontWeight="800">
                      Current load
                    </Text>
                    <Text fontSize="lg" fontWeight="900">
                      {utilization}%
                    </Text>
                  </HStack>
                  <Separator borderColor="whiteAlpha.200" />
                  <Button variant="surface" bg="white" color="gray.950" borderRadius="xl" fontWeight="900" onClick={() => navigateTo("listClasses")}>
                    View Class Schedule
                  </Button>
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

GymManagementDashboard.displayName = "GymManagementDashboard";
export default GymManagementDashboard;
