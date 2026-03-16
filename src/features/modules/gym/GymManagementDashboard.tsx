import { useCallback, useMemo, useRef } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Circle,
  Flex,
  Heading,
  HStack,
  Icon,
  Progress,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  LuActivity,
  LuArrowRight,
  LuArrowUpRight,
  LuBellRing,
  LuCalendarDays,
  LuClock3,
  LuDumbbell,
  LuReceipt,
  LuShieldCheck,
  LuTrendingUp,
  LuUserPlus,
  LuUsers,
  LuWallet,
} from "react-icons/lu";
import RevenuAnalytics from "./RevenuAnalytics";

type ActionTarget = "AddMember" | "ListMember" | "Subscription" | "finance";

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  accent: string;
  icon: React.ElementType;
}

interface ActionCardProps {
  title: string;
  description: string;
  accent: string;
  icon: React.ElementType;
  actionLabel: string;
  target: ActionTarget;
}

const metricCards: MetricCardProps[] = [
  { label: "Active Members", value: "1,284", change: "+8.4% vs last month", accent: "blue", icon: LuUsers },
  { label: "Today's Check-ins", value: "186", change: "74 before 9 AM", accent: "green", icon: LuActivity },
  { label: "Monthly Revenue", value: "$45.2K", change: "+12.1% collection rate", accent: "orange", icon: LuWallet },
  { label: "Trainer Utilization", value: "81%", change: "6 PT sessions in progress", accent: "purple", icon: LuDumbbell },
];

const quickActions: ActionCardProps[] = [
  {
    title: "Enroll Member",
    description: "Start a new member onboarding flow with profile, plan and verification.",
    accent: "blue",
    icon: LuUserPlus,
    actionLabel: "Add member",
    target: "AddMember",
  },
  {
    title: "Member Directory",
    description: "Review check-ins, inactive members and personal training assignments.",
    accent: "green",
    icon: LuUsers,
    actionLabel: "View members",
    target: "ListMember",
  },
  {
    title: "Billing & Plans",
    description: "Update plans, freeze subscriptions and follow up on unpaid renewals.",
    accent: "orange",
    icon: LuReceipt,
    actionLabel: "Manage plans",
    target: "Subscription",
  },
  {
    title: "Revenue Pulse",
    description: "Jump to the finance section for growth, retention and stream health.",
    accent: "purple",
    icon: LuTrendingUp,
    actionLabel: "Open finance",
    target: "finance",
  },
];

const floorAlerts = [
  { title: "Membership renewals due", description: "18 members need renewal follow-up in the next 72 hours.", tone: "orange" },
  { title: "Locker maintenance", description: "3 lockers flagged by staff after the morning rush.", tone: "blue" },
  { title: "Attendance target", description: "Evening attendance is tracking 9% above the weekly target.", tone: "green" },
];

const todaySchedule = [
  { time: "06:30", title: "Morning HIIT Blast", owner: "Coach Riya", occupancy: "28 / 30", status: "Almost full" },
  { time: "09:00", title: "Senior Mobility", owner: "Coach Vikram", occupancy: "14 / 18", status: "On track" },
  { time: "17:30", title: "Strength Foundations", owner: "Coach Neha", occupancy: "19 / 22", status: "Filling fast" },
  { time: "19:00", title: "Nutrition Induction", owner: "Diet Desk", occupancy: "11 / 20", status: "Open seats" },
];

const trainerBoard = [
  { name: "Riya Sen", role: "HIIT / Functional", load: 92, sessions: 7 },
  { name: "Vikram Das", role: "Mobility / Rehab", load: 74, sessions: 5 },
  { name: "Neha Sharma", role: "Strength / PT", load: 86, sessions: 6 },
];

const planMix = [
  { name: "Annual Platinum", members: 412, share: 48, color: "blue.500" },
  { name: "Quarterly Flex", members: 268, share: 31, color: "green.500" },
  { name: "Monthly Starter", members: 176, share: 21, color: "orange.500" },
];

const recentCheckins = [
  { name: "Arjun Patel", plan: "Annual Platinum", time: "7 mins ago" },
  { name: "Maya Reddy", plan: "Quarterly Flex", time: "12 mins ago" },
  { name: "Kabir Das", plan: "Monthly Starter", time: "21 mins ago" },
  { name: "Sara Khan", plan: "PT Premium", time: "27 mins ago" },
];

const performanceHighlights = [
  { label: "Collection efficiency", value: "96.2%" },
  { label: "Trial to paid conversion", value: "38%" },
  { label: "Average daily visits", value: "214" },
];

const SurfaceCard = ({ children, ...props }: any) => {
  const bg = useColorModeValue("rgba(255,255,255,0.96)", "rgba(15, 23, 42, 0.72)");
  const borderColor = useColorModeValue("rgba(99,102,241,0.12)", "rgba(255,255,255,0.08)");

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      boxShadow={useColorModeValue("0 24px 60px -42px rgba(15, 23, 42, 0.28)", "0 24px 60px -42px rgba(2, 6, 23, 0.8)")}
      backdropFilter="blur(14px)"
      {...props}
    >
      {children}
    </Box>
  );
};

const MetricCard = ({ label, value, change, accent, icon }: MetricCardProps) => {
  const softBg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
  const iconColor = useColorModeValue(`${accent}.600`, `${accent}.300`);
  const textMuted = useColorModeValue("gray.600", "gray.300");

  return (
    <SurfaceCard p={5}>
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="start">
          <Circle size="12" bg={softBg} color={iconColor}>
            <Icon as={icon} boxSize={5} />
          </Circle>
          <Badge colorPalette={accent} variant="subtle" px="3" py="1" borderRadius="full">
            Live
          </Badge>
        </HStack>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="600" color={textMuted}>
            {label}
          </Text>
          <Heading size="xl" letterSpacing="tight">
            {value}
          </Heading>
          <Text fontSize="sm" color={textMuted}>
            {change}
          </Text>
        </VStack>
      </VStack>
    </SurfaceCard>
  );
};

const QuickActionCard = ({
  title,
  description,
  accent,
  icon,
  actionLabel,
  onClick,
}: ActionCardProps & { onClick: () => void }) => {
  const accentBg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
  const accentColor = useColorModeValue(`${accent}.600`, `${accent}.300`);
  const bodyText = useColorModeValue("gray.600", "gray.300");

  return (
    <SurfaceCard p={5}>
      <VStack align="start" gap={4}>
        <Circle size="11" bg={accentBg} color={accentColor}>
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Heading size="sm">{title}</Heading>
          <Text fontSize="sm" color={bodyText}>
            {description}
          </Text>
        </VStack>
        <Button
          variant="ghost"
          px="0"
          h="auto"
          colorPalette={accent}
          onClick={onClick}
        >
          {actionLabel}
          <LuArrowRight />
        </Button>
      </VStack>
    </SurfaceCard>
  );
};

const GymManagementDashboard = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();
  const financeRef = useRef<HTMLDivElement | null>(null);

  const appParam = searchParams.get("app");
  const appName = useMemo(() => appCode || appParam || "myGym", [appCode, appParam]);
  const workspacePrefix = useMemo(() => {
    if (!pathname.includes("/workspace")) return "";
    return `${pathname.split("/workspace")[0]}/workspace`;
  }, [pathname]);

  const buildViewPath = useCallback((viewName: string) => {
    if (appCode) {
      return `${workspacePrefix}/app/${appCode}/${viewName}`;
    }

    return `${workspacePrefix}/${viewName}?app=${appName}`;
  }, [appCode, appName, workspacePrefix]);

  const handleAction = useCallback((target: ActionTarget) => {
    if (target === "finance") {
      financeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    navigate(buildViewPath(target));
  }, [buildViewPath, navigate]);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(15,118,110,0.10) 0%, rgba(59,130,246,0.10) 52%, rgba(249,115,22,0.08) 100%)",
    "linear-gradient(135deg, rgba(13,148,136,0.20) 0%, rgba(37,99,235,0.18) 52%, rgba(249,115,22,0.12) 100%)"
  );
  const softText = useColorModeValue("gray.600", "gray.300");
  const quietText = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedSurface = useColorModeValue("gray.50", "whiteAlpha.50");
  const blueSoftSurface = useColorModeValue("blue.50", "whiteAlpha.100");
  const blueSoftColor = useColorModeValue("blue.600", "blue.300");
  const trackSurface = useColorModeValue("gray.100", "whiteAlpha.100");
  const experienceTone = useColorModeValue("green.600", "green.300");
  const operationsTone = useColorModeValue("blue.600", "blue.300");

  return (
    <VStack align="stretch" gap={6} pb={8}>
      <SurfaceCard p={{ base: 5, md: 7 }} bg={heroBg} overflow="hidden" position="relative">
        <Box
          position="absolute"
          top="-24px"
          right="-16px"
          w={{ base: "140px", md: "220px" }}
          h={{ base: "140px", md: "220px" }}
          borderRadius="full"
          bg="rgba(59,130,246,0.12)"
          filter="blur(40px)"
          pointerEvents="none"
        />
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={8} position="relative">
          <VStack align="start" gap={4}>
            <HStack flexWrap="wrap" gap="3">
              <Badge colorPalette="teal" variant="subtle" px="3" py="1" borderRadius="full">
                Gym CRM Home
              </Badge>
              <Badge variant="outline" px="3" py="1" borderRadius="full">
                Peak occupancy 78%
              </Badge>
              <Badge variant="outline" px="3" py="1" borderRadius="full">
                4 alerts need action
              </Badge>
            </HStack>

            <VStack align="start" gap="2" maxW="2xl">
              <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
                Gym management dashboard for members, billing and floor operations.
              </Heading>
              <Text color={softText} fontSize={{ base: "sm", md: "md" }} lineHeight="tall">
                Track live check-ins, subscription health, trainer capacity and cash flow from one
                home page. This dashboard is designed as the CRM command center for the gym team.
              </Text>
            </VStack>

            <HStack flexWrap="wrap" gap="3">
              <Button colorPalette="blue" size="lg" borderRadius="xl" onClick={() => handleAction("AddMember")}>
                <LuUserPlus />
                Add member
              </Button>
              <Button variant="outline" size="lg" borderRadius="xl" onClick={() => handleAction("ListMember")}>
                <LuUsers />
                Open directory
              </Button>
            </HStack>
          </VStack>

          <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
            {performanceHighlights.map((item) => (
              <SurfaceCard key={item.label} p={5}>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                  {item.label}
                </Text>
                <Heading size="lg">{item.value}</Heading>
              </SurfaceCard>
            ))}
          </SimpleGrid>
        </SimpleGrid>
      </SurfaceCard>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={5}>
        {metricCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={6}>
        <VStack align="stretch" gap={6} gridColumn={{ xl: "span 2" }}>
          <SurfaceCard p={{ base: 5, md: 6 }}>
            <VStack align="stretch" gap={5}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                    Quick Actions
                  </Text>
                  <Heading size="md">Run the daily gym workflow</Heading>
                </Box>
                <Badge variant="subtle" colorPalette="blue" px="3" py="1" borderRadius="full">
                  Front desk + CRM
                </Badge>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.title}
                    {...action}
                    onClick={() => handleAction(action.target)}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </SurfaceCard>

          <SurfaceCard p={{ base: 5, md: 6 }}>
            <VStack align="stretch" gap={5}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                    Today's Schedule
                  </Text>
                  <Heading size="md">Classes and induction sessions</Heading>
                </Box>
                <HStack color={softText}>
                  <LuCalendarDays />
                  <Text fontSize="sm">11 sessions booked today</Text>
                </HStack>
              </Flex>

              <VStack align="stretch" gap={3}>
                {todaySchedule.map((item) => (
                  <Box key={`${item.time}-${item.title}`} p={4} borderRadius="2xl" bg={mutedSurface}>
                    <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                      <HStack align="start" gap={4}>
                        <Circle size="10" bg={blueSoftSurface} color={blueSoftColor}>
                          <LuClock3 />
                        </Circle>
                        <VStack align="start" gap="1">
                          <HStack gap="2" flexWrap="wrap">
                            <Text fontWeight="700">{item.time}</Text>
                            <Badge variant="outline" borderRadius="full">
                              {item.status}
                            </Badge>
                          </HStack>
                          <Text fontWeight="600">{item.title}</Text>
                          <Text fontSize="sm" color={softText}>
                            {item.owner}
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="sm" color={quietText}>
                        Occupancy {item.occupancy}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </VStack>
          </SurfaceCard>
        </VStack>

        <VStack align="stretch" gap={6}>
          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                    Alerts
                  </Text>
                  <Heading size="sm">Action queue</Heading>
                </Box>
                <LuBellRing />
              </HStack>

              {floorAlerts.map((alert) => (
                <Box key={alert.title} p={4} borderRadius="2xl" bg={mutedSurface}>
                  <Badge colorPalette={alert.tone} variant="subtle" mb={3}>
                    {alert.tone === "green" ? "Good signal" : "Needs review"}
                  </Badge>
                  <Text fontWeight="700" mb={1}>{alert.title}</Text>
                  <Text fontSize="sm" color={softText}>{alert.description}</Text>
                </Box>
              ))}
            </VStack>
          </SurfaceCard>

          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                  Trainer Board
                </Text>
                <Heading size="sm">Live floor utilization</Heading>
              </Box>

              {trainerBoard.map((trainer) => (
                <Box key={trainer.name}>
                  <HStack justify="space-between" mb={2}>
                    <HStack gap={3}>
                      <Avatar.Root size="sm">
                        <Avatar.Fallback>{trainer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</Avatar.Fallback>
                      </Avatar.Root>
                      <Box>
                        <Text fontWeight="700">{trainer.name}</Text>
                        <Text fontSize="sm" color={softText}>{trainer.role}</Text>
                      </Box>
                    </HStack>
                    <Text fontSize="sm" color={quietText}>{trainer.sessions} sessions</Text>
                  </HStack>
                  <Progress.Root value={trainer.load} size="sm" colorPalette="blue" borderRadius="full">
                    <Progress.Track borderRadius="full">
                      <Progress.Range borderRadius="full" />
                    </Progress.Track>
                  </Progress.Root>
                </Box>
              ))}
            </VStack>
          </SurfaceCard>

          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                  Membership Mix
                </Text>
                <Heading size="sm">Plan distribution</Heading>
              </Box>

              {planMix.map((plan) => (
                <Box key={plan.name}>
                  <Flex justify="space-between" mb={2}>
                    <Text fontWeight="600">{plan.name}</Text>
                    <Text fontSize="sm" color={quietText}>{plan.members} members</Text>
                  </Flex>
                  <Box h="2.5" borderRadius="full" bg={trackSurface} overflow="hidden">
                    <Box h="full" w={`${plan.share}%`} bg={plan.color} borderRadius="full" />
                  </Box>
                </Box>
              ))}

              <Separator borderColor={dividerColor} />

              <VStack align="stretch" gap={3}>
                {recentCheckins.map((member) => (
                  <HStack key={`${member.name}-${member.time}`} justify="space-between">
                    <VStack align="start" gap="0">
                      <Text fontWeight="600">{member.name}</Text>
                      <Text fontSize="sm" color={softText}>{member.plan}</Text>
                    </VStack>
                    <Text fontSize="sm" color={quietText}>{member.time}</Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </SurfaceCard>
        </VStack>
      </SimpleGrid>

      <Box ref={financeRef}>
        <SurfaceCard p={{ base: 2, md: 3 }}>
          <VStack align="stretch" gap={4}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} px={{ base: 3, md: 4 }} pt={{ base: 3, md: 4 }}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2}>
                  Finance & Retention
                </Text>
                <Heading size="md">Revenue analytics snapshot</Heading>
              </Box>
              <Badge colorPalette="teal" variant="subtle" px="3" py="1" borderRadius="full">
                Updated 5 minutes ago
              </Badge>
            </Flex>
            <RevenuAnalytics />
          </VStack>
        </SurfaceCard>
      </Box>

      <SurfaceCard p={{ base: 5, md: 6 }}>
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={5}>
          <VStack align="start" gap="1">
            <HStack color={experienceTone}>
              <LuShieldCheck />
              <Text fontWeight="700">Member experience</Text>
            </HStack>
            <Heading size="sm">Service score is healthy and improving.</Heading>
            <Text color={softText} fontSize="sm">
              High renewal intent, low churn and stronger trainer occupancy are all trending in the
              right direction this week.
            </Text>
          </VStack>

          <VStack align="start" gap="1">
            <HStack color={operationsTone}>
              <LuActivity />
              <Text fontWeight="700">Operations focus</Text>
            </HStack>
            <Text fontSize="sm" color={softText}>
              Prioritize renewal follow-up for expiring members and re-balance evening sessions to
              reduce waitlist pressure.
            </Text>
          </VStack>

          <VStack align="start" gap="3">
            <Button colorPalette="blue" borderRadius="xl" onClick={() => handleAction("Subscription")}>
              Review renewals
              <LuArrowUpRight />
            </Button>
            <Text fontSize="sm" color={quietText}>
              Use the billing area to freeze, upgrade or renew plans without leaving the workspace.
            </Text>
          </VStack>
        </SimpleGrid>
      </SurfaceCard>
    </VStack>
  );
};

export default GymManagementDashboard;
