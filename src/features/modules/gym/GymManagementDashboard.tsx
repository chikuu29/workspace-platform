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

const animations = `
  @keyframes slideUpFade {
    0% { opacity: 0; transform: translateY(24px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-entrance {
    animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hover-lift:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
  }
  
  .glow-icon {
    box-shadow: 0 0 24px currentColor;
  }
`;

const SurfaceCard = ({ children, className = "", ...props }: any) => {
  const bg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(15, 23, 42, 0.6)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.08)");
  const shadow = useColorModeValue(
    "0 12px 40px -12px rgba(0,0,0,0.06), inset 0 1px 0 0 rgba(255,255,255,0.6)",
    "0 12px 40px -12px rgba(0,0,0,0.8), inset 0 1px 0 0 rgba(255,255,255,0.05)"
  );

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      boxShadow={shadow}
      backdropFilter="blur(20px)"
      className={className}
      transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
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
    <SurfaceCard p={6} className="hover-lift animate-entrance">
      <VStack align="stretch" gap={5}>
        <HStack justify="space-between" align="start">
          <Circle size="12" bg={softBg} color={iconColor} className="glow-icon">
            <Icon as={icon} boxSize={5} />
          </Circle>
          <Badge colorPalette={accent} variant="subtle" px="3" py="1.5" borderRadius="full" fontWeight="bold">
            Live
          </Badge>
        </HStack>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="700" color={textMuted} letterSpacing="wide" textTransform="uppercase">
            {label}
          </Text>
          <Heading size="2xl" letterSpacing="tight" fontWeight="900">
            {value}
          </Heading>
          <Text fontSize="sm" color={textMuted} fontWeight="500">
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
    <SurfaceCard p={6} className="hover-lift animate-entrance" cursor="pointer" onClick={onClick} border="1px solid" borderColor="transparent" _hover={{ borderColor: useColorModeValue(`${accent}.200`, `${accent}.700`) }}>
      <VStack align="start" gap={5}>
        <Circle size="12" bg={accentBg} color={accentColor} className="glow-icon">
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Heading size="md" letterSpacing="tight" fontWeight="800">{title}</Heading>
          <Text fontSize="sm" color={bodyText} lineHeight="tall">
            {description}
          </Text>
        </VStack>
        <Button
          variant="ghost"
          px="0"
          h="auto"
          colorPalette={accent}
          fontWeight="700"
          mt={1}
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
    "linear-gradient(135deg, rgba(15,118,110,0.15) 0%, rgba(59,130,246,0.12) 52%, rgba(249,115,22,0.10) 100%)",
    "linear-gradient(135deg, rgba(13,148,136,0.25) 0%, rgba(37,99,235,0.20) 52%, rgba(249,115,22,0.15) 100%)"
  );
  const softText = useColorModeValue("gray.600", "gray.300");
  const quietText = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("gray.100", "whiteAlpha.100");
  const mutedSurface = useColorModeValue("rgba(0,0,0,0.03)", "whiteAlpha.50");
  const blueSoftSurface = useColorModeValue("blue.50", "whiteAlpha.100");
  const blueSoftColor = useColorModeValue("blue.600", "blue.300");
  const trackSurface = useColorModeValue("gray.100", "whiteAlpha.100");
  const experienceTone = useColorModeValue("green.600", "green.300");
  const operationsTone = useColorModeValue("blue.600", "blue.300");

  const decorativeBlob1 = useColorModeValue("rgba(15,118,110,0.25)", "rgba(15,118,110,0.15)");
  const decorativeBlob2 = useColorModeValue("rgba(59,130,246,0.2)", "rgba(59,130,246,0.1)");
  const decorativeBlob3 = useColorModeValue("rgba(249,115,22,0.15)", "rgba(249,115,22,0.08)");

  return (
    <Box position="relative" w="full" minH="100%">
      <style>{animations}</style>

      {/* Decorative Orbs */}
      <Box position="absolute" top="-5%" left="-5%" w="350px" h="350px" bg={decorativeBlob1} filter="blur(100px)" borderRadius="full" pointerEvents="none" zIndex={0} />
      <Box position="absolute" top="30%" right="-5%" w="400px" h="400px" bg={decorativeBlob2} filter="blur(110px)" borderRadius="full" pointerEvents="none" zIndex={0} />
      <Box position="absolute" top="70%" left="10%" w="300px" h="300px" bg={decorativeBlob3} filter="blur(90px)" borderRadius="full" pointerEvents="none" zIndex={0} />

      <VStack align="stretch" gap={8} pb={12} position="relative" zIndex={1}>
        <SurfaceCard p={{ base: 6, md: 8 }} bg={heroBg} overflow="hidden" position="relative" className="animate-entrance">
          <Box
            position="absolute"
            top="-30px"
            right="-20px"
            w={{ base: "180px", md: "280px" }}
            h={{ base: "180px", md: "280px" }}
            borderRadius="full"
            bg="rgba(255,255,255,0.1)"
            filter="blur(30px)"
            pointerEvents="none"
          />
          <SimpleGrid columns={{ base: 1, xl: 2 }} gap={10} position="relative">
            <VStack align="start" gap={6}>
              <HStack flexWrap="wrap" gap="3">
                <Badge colorPalette="teal" variant="solid" px="4" py="1.5" borderRadius="full" fontWeight="bold">
                  Gym CRM Command Center
                </Badge>
                <Badge variant="surface" px="4" py="1.5" borderRadius="full" bg={useColorModeValue("white", "whiteAlpha.200")}>
                  Peak occupancy 78%
                </Badge>
                <Badge variant="surface" px="4" py="1.5" borderRadius="full" bg={useColorModeValue("white", "whiteAlpha.200")}>
                  <Box as="span" w="2" h="2" borderRadius="full" bg="orange.500" display="inline-block" mr={2} />
                  4 alerts need action
                </Badge>
              </HStack>

              <VStack align="start" gap="3" maxW="2xl">
                <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="tight" fontWeight="900">
                  Gym management dashboard for members, billing and floor operations.
                </Heading>
                <Text color={softText} fontSize={{ base: "md", md: "lg" }} lineHeight="tall" fontWeight="500">
                  Track live check-ins, subscription health, trainer capacity and cash flow from one
                  home page. This dashboard is designed as the CRM command center for the gym team.
                </Text>
              </VStack>

              <HStack flexWrap="wrap" gap="4" pt={2}>
                <Button colorPalette="blue" size="xl" borderRadius="2xl" px={8} className="hover-lift" onClick={() => handleAction("AddMember")}>
                  <LuUserPlus />
                  Add member
                </Button>
                <Button variant="surface" size="xl" borderRadius="2xl" px={8} className="hover-lift" bg={useColorModeValue("white", "whiteAlpha.200")} onClick={() => handleAction("ListMember")}>
                  <LuUsers />
                  Open directory
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
              {performanceHighlights.map((item, id) => (
                <SurfaceCard key={item.label} p={6} className="hover-lift">
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" fontWeight="800" color={quietText} mb={2}>
                    {item.label}
                  </Text>
                  <Heading size="xl" fontWeight="900" letterSpacing="tight">{item.value}</Heading>
                </SurfaceCard>
              ))}
            </SimpleGrid>
          </SimpleGrid>
        </SurfaceCard>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={6}>
          {metricCards.map((card, idx) => (
            <div key={card.label} className={`delay-${(idx % 4) + 1}`}>
              <MetricCard {...card} />
            </div>
          ))}
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={8}>
          <VStack align="stretch" gap={8} gridColumn={{ xl: "span 2" }}>
            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-2">
              <VStack align="stretch" gap={6}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                  <Box>
                    <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                      Quick Actions
                    </Text>
                    <Heading size="xl" letterSpacing="tight" fontWeight="800">Run the daily gym workflow</Heading>
                  </Box>
                  <Badge variant="subtle" colorPalette="blue" px="4" py="2" borderRadius="full" fontWeight="bold">
                    Front desk + CRM
                  </Badge>
                </Flex>

                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                  {quickActions.map((action, idx) => (
                    <div key={action.title} className={`delay-${(idx % 3) + 2}`}>
                        <QuickActionCard
                        {...action}
                        onClick={() => handleAction(action.target)}
                        />
                    </div>
                  ))}
                </SimpleGrid>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-3">
              <VStack align="stretch" gap={6}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                  <Box>
                    <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                      Today's Schedule
                    </Text>
                    <Heading size="xl" letterSpacing="tight" fontWeight="800">Classes and induction sessions</Heading>
                  </Box>
                  <HStack color={softText} p={2} bg={useColorModeValue("blackAlpha.50", "whiteAlpha.100")} borderRadius="xl">
                    <LuCalendarDays />
                    <Text fontSize="sm" fontWeight="700">11 sessions booked today</Text>
                  </HStack>
                </Flex>

                <VStack align="stretch" gap={4}>
                  {todaySchedule.map((item) => (
                    <Box key={`${item.time}-${item.title}`} p={5} borderRadius="2xl" bg={mutedSurface} className="hover-lift">
                      <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
                        <HStack align="start" gap={5}>
                          <Circle size="12" bg={blueSoftSurface} color={blueSoftColor}>
                            <LuClock3 size="20" />
                          </Circle>
                          <VStack align="start" gap="1">
                            <HStack gap="3" flexWrap="wrap">
                              <Text fontWeight="800" fontSize="lg">{item.time}</Text>
                              <Badge variant="outline" borderRadius="full" px="3">
                                {item.status}
                              </Badge>
                            </HStack>
                            <Text fontWeight="700" fontSize="md">{item.title}</Text>
                            <Text fontSize="sm" color={softText} fontWeight="500">
                              {item.owner}
                            </Text>
                          </VStack>
                        </HStack>
                        <Heading size="sm" color={quietText} fontWeight="600">
                          {item.occupancy} seats
                        </Heading>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </SurfaceCard>
          </VStack>

          <VStack align="stretch" gap={8}>
            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-2">
              <VStack align="stretch" gap={5}>
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                      Alerts
                    </Text>
                    <Heading size="lg" letterSpacing="tight" fontWeight="800">Action queue</Heading>
                  </Box>
                  <Circle size="10" bg={useColorModeValue("red.50", "red.900")} color={useColorModeValue("red.500", "red.300")}>
                    <LuBellRing />
                  </Circle>
                </HStack>

                {floorAlerts.map((alert) => (
                  <Box key={alert.title} p={5} borderRadius="2xl" bg={mutedSurface} className="hover-lift" borderLeft="4px solid" borderColor={useColorModeValue(`${alert.tone}.400`, `${alert.tone}.600`)}>
                    <Badge colorPalette={alert.tone} variant="solid" mb={3} px="3" py="1" borderRadius="full" fontWeight="bold">
                      {alert.tone === "green" ? "Good signal" : "Needs review"}
                    </Badge>
                    <Text fontWeight="800" fontSize="md" mb={1}>{alert.title}</Text>
                    <Text fontSize="sm" color={softText} fontWeight="500">{alert.description}</Text>
                  </Box>
                ))}
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-3">
              <VStack align="stretch" gap={6}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                    Trainer Board
                  </Text>
                  <Heading size="lg" letterSpacing="tight" fontWeight="800">Live floor utilization</Heading>
                </Box>

                {trainerBoard.map((trainer) => (
                  <Box key={trainer.name} p={4} borderRadius="2xl" bg={mutedSurface} className="hover-lift">
                    <HStack justify="space-between" mb={3}>
                      <HStack gap={4}>
                        <Avatar.Root size="md">
                          <Avatar.Fallback>{trainer.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</Avatar.Fallback>
                        </Avatar.Root>
                        <Box>
                          <Text fontWeight="800" fontSize="md">{trainer.name}</Text>
                          <Text fontSize="sm" color={softText} fontWeight="500">{trainer.role}</Text>
                        </Box>
                      </HStack>
                      <Badge variant="subtle" colorPalette="blue" px="3" py="1" borderRadius="full" fontWeight="bold">
                        {trainer.sessions} sessions
                      </Badge>
                    </HStack>
                    <Progress.Root value={trainer.load} size="sm" colorPalette={trainer.load > 85 ? "red" : "blue"} borderRadius="full">
                      <Progress.Track borderRadius="full">
                        <Progress.Range borderRadius="full" />
                      </Progress.Track>
                    </Progress.Root>
                  </Box>
                ))}
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-4">
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                    Membership Mix
                  </Text>
                  <Heading size="lg" letterSpacing="tight" fontWeight="800">Plan distribution</Heading>
                </Box>

                {planMix.map((plan) => (
                  <Box key={plan.name} className="hover-lift">
                    <Flex justify="space-between" mb={2}>
                      <Text fontWeight="700">{plan.name}</Text>
                      <Text fontSize="sm" color={quietText} fontWeight="600">{plan.members} members</Text>
                    </Flex>
                    <Box h="3" borderRadius="full" bg={trackSurface} overflow="hidden">
                      <Box h="full" w={`${plan.share}%`} bg={plan.color} borderRadius="full" transition="width 1s ease-in-out" />
                    </Box>
                  </Box>
                ))}

                <Separator borderColor={dividerColor} my={3} opacity={0.5} />

                <VStack align="stretch" gap={4}>
                  {recentCheckins.map((member) => (
                    <HStack key={`${member.name}-${member.time}`} justify="space-between" p={3} borderRadius="xl" bg={mutedSurface} className="hover-lift">
                      <VStack align="start" gap="0">
                        <Text fontWeight="700">{member.name}</Text>
                        <Text fontSize="sm" color={softText} fontWeight="500">{member.plan}</Text>
                      </VStack>
                      <Badge variant="outline" fontSize="xs" fontWeight="700">
                         {member.time}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </SurfaceCard>
          </VStack>
        </SimpleGrid>

        <Box ref={financeRef} className="animate-entrance delay-5">
          <SurfaceCard p={{ base: 4, md: 6 }}>
            <VStack align="stretch" gap={5}>
              <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4} px={{ base: 4, md: 6 }} pt={{ base: 4, md: 6 }}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quietText} mb={2} fontWeight="800">
                    Finance & Retention
                  </Text>
                  <Heading size="xl" letterSpacing="tight" fontWeight="900">Revenue analytics snapshot</Heading>
                </Box>
                <Badge colorPalette="teal" variant="solid" px="4" py="2" borderRadius="full" fontWeight="bold">
                  Updated 5 minutes ago
                </Badge>
              </Flex>
              <RevenuAnalytics />
            </VStack>
          </SurfaceCard>
        </Box>

        <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-5" bg={useColorModeValue("blue.50", "blue.900")} borderColor={useColorModeValue("blue.100", "blue.800")}>
          <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
            <VStack align="start" gap="2">
              <HStack color={experienceTone} p={2} bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="xl">
                <LuShieldCheck size={20} />
                <Text fontWeight="800" letterSpacing="tight">Member experience</Text>
              </HStack>
              <Heading size="md" fontWeight="800" mt={2} letterSpacing="tight">Service score is healthy and improving.</Heading>
              <Text color={softText} fontSize="md" fontWeight="500" lineHeight="tall">
                High renewal intent, low churn and stronger trainer occupancy are all trending in the
                right direction this week.
              </Text>
            </VStack>

            <VStack align="start" gap="2">
              <HStack color={operationsTone} p={2} bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="xl">
                <LuActivity size={20} />
                <Text fontWeight="800" letterSpacing="tight">Operations focus</Text>
              </HStack>
              <Text fontSize="md" mt={2} color={softText} fontWeight="500" lineHeight="tall" pl={2} borderLeft="4px solid" borderColor={useColorModeValue("blue.300", "blue.600")}>
                Prioritize renewal follow-up for expiring members and re-balance evening sessions to
                reduce waitlist pressure.
              </Text>
            </VStack>

            <VStack align="start" gap={4} justify="center">
              <Button size="xl" colorPalette="blue" borderRadius="2xl" className="hover-lift" px={8} onClick={() => handleAction("Subscription")}>
                Review renewals
                <LuArrowUpRight />
              </Button>
              <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} fontWeight="600">
                Use the billing area to freeze, upgrade or renew plans without leaving the workspace.
              </Text>
            </VStack>
          </SimpleGrid>
        </SurfaceCard>
      </VStack>
    </Box>
  );
};

export default GymManagementDashboard;
