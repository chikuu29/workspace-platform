import { useCallback, useMemo, useState } from "react";
import {
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
  LuArrowRight,
  LuArrowUpRight,
  LuBadgeDollarSign,
  LuCalendarClock,
  LuChartColumn,
  LuCircleDollarSign,
  LuCreditCard,
  LuFileClock,
  LuReceipt,
  LuShieldAlert,
  LuSparkles,
  LuUsers,
  LuWallet,
} from "react-icons/lu";

type PlanStatus = "Top plan" | "Growing" | "Needs push";
type RenewalStatus = "Due Today" | "This Week" | "Overdue";

interface PlanRecord {
  name: string;
  price: string;
  billingCycle: string;
  members: number;
  utilization: number;
  retention: string;
  revenue: string;
  status: PlanStatus;
  features: string[];
  accent: string;
}

interface RenewalRecord {
  member: string;
  plan: string;
  due: string;
  amount: string;
  status: RenewalStatus;
}

const planRecords: PlanRecord[] = [
  {
    name: "Annual Platinum",
    price: "$899",
    billingCycle: "per year",
    members: 412,
    utilization: 88,
    retention: "95.4%",
    revenue: "$370K",
    status: "Top plan",
    accent: "blue",
    features: ["Priority PT slots", "Nutrition review", "2 freeze credits"],
  },
  {
    name: "Quarterly Flex",
    price: "$289",
    billingCycle: "per quarter",
    members: 268,
    utilization: 74,
    retention: "87.2%",
    revenue: "$77K",
    status: "Growing",
    accent: "green",
    features: ["Flexible renewal", "Class access", "1 trainer consultation"],
  },
  {
    name: "Monthly Starter",
    price: "$79",
    billingCycle: "per month",
    members: 176,
    utilization: 58,
    retention: "71.8%",
    revenue: "$13.9K",
    status: "Needs push",
    accent: "orange",
    features: ["Open gym access", "Basic onboarding", "Upgrade anytime"],
  },
];

const renewalQueue: RenewalRecord[] = [
  { member: "Sara Khan", plan: "Quarterly Flex", due: "Today, 5:00 PM", amount: "$120", status: "Due Today" },
  { member: "Rohan Iyer", plan: "Family Flex", due: "18 Mar 2026", amount: "$80", status: "This Week" },
  { member: "Nidhi Jain", plan: "Monthly Starter", due: "18 Mar 2026", amount: "$79", status: "This Week" },
  { member: "Kabir Das", plan: "Monthly Starter", due: "Overdue by 3 days", amount: "$79", status: "Overdue" },
];

const collectionChannels = [
  { label: "Auto debit", share: 52, amount: "$23.5K", color: "blue.500" },
  { label: "UPI / Card", share: 33, amount: "$14.8K", color: "green.500" },
  { label: "Front desk", share: 15, amount: "$6.9K", color: "orange.500" },
];

const actionCards = [
  {
    title: "Review renewals",
    description: "Handle due-today plans, partial payments and member outreach.",
    icon: LuCalendarClock,
    accent: "blue",
  },
  {
    title: "Launch upgrade push",
    description: "Move active monthly members into quarterly or annual plans.",
    icon: LuSparkles,
    accent: "green",
  },
  {
    title: "Collections check",
    description: "Audit unpaid invoices and desk-level settlements before close.",
    icon: LuReceipt,
    accent: "orange",
  },
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

const KPI = ({
  label,
  value,
  helper,
  icon,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ElementType;
  accent: string;
}) => {
  const iconBg = useColorModeValue(`${accent}.50`, "whiteAlpha.100");
  const iconColor = useColorModeValue(`${accent}.600`, `${accent}.300`);
  const muted = useColorModeValue("gray.600", "gray.300");

  return (
    <SurfaceCard p={5} className="hover-lift">
      <VStack align="stretch" gap={4}>
        <Circle size="12" bg={iconBg} color={iconColor} className="glow-icon">
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="600" color={muted} letterSpacing="wide">
            {label}
          </Text>
          <Heading size="xl" letterSpacing="tighter">{value}</Heading>
          <Text fontSize="sm" color={muted}>
            {helper}
          </Text>
        </VStack>
      </VStack>
    </SurfaceCard>
  );
};

const PlanCard = ({ plan }: { plan: PlanRecord }) => {
  const quiet = useColorModeValue("gray.500", "gray.400");
  const muted = useColorModeValue("gray.600", "gray.300");
  const softSurface = useColorModeValue("rgba(0,0,0,0.02)", "whiteAlpha.50");
  const accentBg = useColorModeValue(`${plan.accent}.50`, "whiteAlpha.100");
  const accentColor = useColorModeValue(`${plan.accent}.600`, `${plan.accent}.300`);
  const isTopPlan = plan.status === "Top plan";

  return (
    <SurfaceCard p={6} h="full" className="hover-lift" borderColor={isTopPlan ? useColorModeValue("blue.300", "blue.600") : undefined} boxShadow={isTopPlan ? useColorModeValue("0 12px 40px -12px rgba(59,130,246,0.3)", "0 12px 40px -12px rgba(59,130,246,0.2)") : undefined}>
      <VStack align="stretch" gap={6} h="full">
        <Flex justify="space-between" align="start" gap={4}>
          <VStack align="start" gap="2">
            <Badge colorPalette={plan.accent} variant="subtle" borderRadius="full" px="3" py="1" fontWeight="bold">
              {plan.status}
            </Badge>
            <Box>
              <Heading size="lg" letterSpacing="tight">{plan.name}</Heading>
              <Text color={muted} mt={1} fontSize="lg" fontWeight="600">
                {plan.price} <Text as="span" color={quiet} fontSize="sm" fontWeight="normal">/ {plan.billingCycle}</Text>
              </Text>
            </Box>
          </VStack>
          <Circle size="12" bg={accentBg} color={accentColor}>
            <Icon as={LuCreditCard} boxSize={5} />
          </Circle>
        </Flex>

        <SimpleGrid columns={2} gap={4}>
          <Box p={4} borderRadius="2xl" bg={softSurface}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
              Members
            </Text>
            <Heading size="md" mt={1}>{plan.members}</Heading>
          </Box>
          <Box p={4} borderRadius="2xl" bg={softSurface}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
              Revenue
            </Text>
            <Heading size="md" mt={1}>{plan.revenue}</Heading>
          </Box>
        </SimpleGrid>

        <VStack align="stretch" gap={3} flex="1">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="600" color={muted}>
              Utilization
            </Text>
            <Text fontSize="sm" fontWeight="bold" color={quiet}>
              {plan.utilization}%
            </Text>
          </HStack>
          <Progress.Root value={plan.utilization} size="md" colorPalette={plan.accent} borderRadius="full">
            <Progress.Track borderRadius="full" bg={softSurface}>
              <Progress.Range borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color={muted}>
            Retention: <Text as="span" fontWeight="800" color={useColorModeValue("gray.800", "white")}>{plan.retention}</Text>
          </Text>
        </VStack>

        <Separator opacity={0.5} />

        <VStack align="stretch" gap={3}>
          {plan.features.map((feature) => (
            <HStack key={feature} gap={3} color={muted}>
              <Circle size="5" bg={accentBg} color={accentColor}>
                <LuArrowRight size="12px" />
              </Circle>
              <Text fontSize="sm" fontWeight="500">{feature}</Text>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </SurfaceCard>
  );
};

const ActionCard = ({
  item,
  muted,
  softSurface,
}: {
  item: (typeof actionCards)[number];
  muted: string;
  softSurface: string;
}) => {
  const iconBg = useColorModeValue(`${item.accent}.50`, "whiteAlpha.100");
  const iconColor = useColorModeValue(`${item.accent}.600`, `${item.accent}.300`);

  return (
    <Box p={5} borderRadius="2xl" bg={softSurface} className="hover-lift" cursor="pointer" border="1px solid" borderColor="transparent" _hover={{ borderColor: useColorModeValue(`${item.accent}.200`, `${item.accent}.700`) }}>
      <VStack align="start" gap={4}>
        <Circle size="12" bg={iconBg} color={iconColor}>
          <Icon as={item.icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Heading size="sm" letterSpacing="tight">{item.title}</Heading>
          <Text fontSize="sm" color={muted}>{item.description}</Text>
        </VStack>
      </VStack>
    </Box>
  );
};

const Subscription = () => {
  const [isAnalyticsOpen, setAnalyticsOpen] = useState(false);
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

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(14,165,233,0.10) 42%, rgba(249,115,22,0.15) 100%)",
    "linear-gradient(135deg, rgba(37,99,235,0.25) 0%, rgba(8,145,178,0.20) 42%, rgba(249,115,22,0.15) 100%)"
  );
  const muted = useColorModeValue("gray.600", "gray.300");
  const quiet = useColorModeValue("gray.500", "gray.400");
  const softSurface = useColorModeValue("rgba(0,0,0,0.03)", "whiteAlpha.50");
  const toneBlue = useColorModeValue("blue.600", "blue.300");
  const channelTrackBg = useColorModeValue("gray.100", "whiteAlpha.100");

  const decorativeBlob1 = useColorModeValue("rgba(59,130,246,0.3)", "rgba(59,130,246,0.15)");
  const decorativeBlob2 = useColorModeValue("rgba(249,115,22,0.2)", "rgba(249,115,22,0.1)");

  return (
    <Box position="relative" w="full" minH="100%">
      <style>{animations}</style>

      {/* Decorative Orbs */}
      <Box position="absolute" top="-5%" left="-5%" w="350px" h="350px" bg={decorativeBlob1} filter="blur(100px)" borderRadius="full" pointerEvents="none" zIndex={0} />
      <Box position="absolute" top="40%" right="-5%" w="300px" h="300px" bg={decorativeBlob2} filter="blur(90px)" borderRadius="full" pointerEvents="none" zIndex={0} />

      <VStack align="stretch" gap={8} pb={12} position="relative" zIndex={1}>
        <SurfaceCard p={{ base: 6, md: 8 }} bg={heroBg} overflow="hidden" position="relative" className="animate-entrance">
          <Box
            position="absolute"
            top="-40px"
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
                <Badge colorPalette="blue" variant="solid" px="4" py="1.5" borderRadius="full" fontWeight="bold">
                  Subscription Desk
                </Badge>
                <Badge variant="surface" px="4" py="1.5" borderRadius="full" bg={useColorModeValue("white", "whiteAlpha.200")}>
                  <Box as="span" w="2" h="2" borderRadius="full" bg="red.500" display="inline-block" mr={2} />
                  4 renewals need action
                </Badge>
                <Badge variant="surface" px="4" py="1.5" borderRadius="full" bg={useColorModeValue("white", "whiteAlpha.200")}>
                  <Box as="span" w="2" h="2" borderRadius="full" bg="green.500" display="inline-block" mr={2} />
                  Auto-debit success 96.2%
                </Badge>
              </HStack>

              <VStack align="start" gap="3" maxW="2xl">
                <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="tight" fontWeight="800">
                  Modern subscription management for renewals, collections and upgrades.
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={muted} lineHeight="tall">
                  Manage billing health across all gym plans, review due members, watch channel
                  performance and launch plan upgrades from one CRM billing page.
                </Text>
              </VStack>

              <HStack flexWrap="wrap" gap="4" pt={2}>
                <Button colorPalette="blue" size="xl" borderRadius="2xl" px={8} className="hover-lift" onClick={() => navigate(buildViewPath("AddMember"))}>
                  <LuBadgeDollarSign />
                  New subscription
                </Button>
                <Button variant="surface" size="xl" borderRadius="2xl" px={8} className="hover-lift" bg={useColorModeValue("white", "whiteAlpha.200")} onClick={() => navigate(buildViewPath("ListMember"))}>
                  <LuUsers />
                  Open members
                </Button>
                <Button variant="ghost" size="xl" borderRadius="2xl" px={6} className="hover-lift" onClick={() => setAnalyticsOpen(true)}>
                  <LuChartColumn />
                  Analytics
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} gap={5}>
              <KPI label="MRR" value="$45.2K" helper="12.1% higher than last month" icon={LuWallet} accent="blue" />
              <KPI label="Renewals" value="128" helper="Due in the next 30 days" icon={LuCalendarClock} accent="green" />
              <KPI label="Collection Rate" value="96.2%" helper="Across all payment channels" icon={LuCircleDollarSign} accent="orange" />
              <KPI label="At Risk" value="18" helper="Need outreach or reactivation" icon={LuShieldAlert} accent="red" />
            </SimpleGrid>
          </SimpleGrid>
        </SurfaceCard>

        <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-1">
          <VStack align="stretch" gap={6}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
              <Box>
                <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="700">
                  Plan Catalog
                </Text>
                <Heading size="xl" letterSpacing="tight">Subscription portfolio performance</Heading>
              </Box>
              <Badge variant="subtle" colorPalette="blue" px="4" py="2" borderRadius="full" fontWeight="bold">
                Product + Collections
              </Badge>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
              {planRecords.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </SimpleGrid>
          </VStack>
        </SurfaceCard>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={8}>
          <VStack align="stretch" gap={8} gridColumn={{ xl: "span 2" }}>
            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-2">
              <VStack align="stretch" gap={6}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                  <Box>
                    <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="700">
                      Collections
                    </Text>
                    <Heading size="xl" letterSpacing="tight">Revenue channel mix</Heading>
                  </Box>
                  <Badge variant="surface" bg={softSurface} borderRadius="full" px="4" py="2" fontWeight="600">
                    Updated today
                  </Badge>
                </Flex>

                <VStack align="stretch" gap={4}>
                  {collectionChannels.map((channel) => (
                    <Box key={channel.label} p={5} borderRadius="2xl" bg={softSurface} className="hover-lift">
                      <Flex justify="space-between" mb={4}>
                        <VStack align="start" gap="1">
                          <Text fontWeight="800" fontSize="lg">{channel.label}</Text>
                          <Text fontSize="md" color={muted}>{channel.amount}</Text>
                        </VStack>
                        <Text fontSize="md" fontWeight="bold" color={quiet}>{channel.share}% share</Text>
                      </Flex>
                      <Box h="3" borderRadius="full" bg={channelTrackBg} overflow="hidden">
                        <Box h="full" w={`${channel.share}%`} bg={channel.color} borderRadius="full" transition="width 1s ease-in-out" />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-3">
              <VStack align="stretch" gap={6}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="700">
                    Action Queue
                  </Text>
                  <Heading size="xl" letterSpacing="tight">Billing workflows for today</Heading>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                  {actionCards.map((item) => (
                    <ActionCard key={item.title} item={item} muted={muted} softSurface={softSurface} />
                  ))}
                </SimpleGrid>
              </VStack>
            </SurfaceCard>
          </VStack>

          <VStack align="stretch" gap={8}>
            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-2">
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="700">
                    Renewal Queue
                  </Text>
                  <Heading size="lg" letterSpacing="tight">Members due for follow-up</Heading>
                </Box>

                {renewalQueue.map((item) => {
                  const tone =
                    item.status === "Due Today" ? "red" : item.status === "Overdue" ? "orange" : "blue";

                  return (
                    <Box key={`${item.member}-${item.plan}`} p={5} borderRadius="2xl" bg={softSurface} className="hover-lift">
                      <VStack align="stretch" gap={4}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap="1">
                            <Text fontWeight="800" fontSize="md">{item.member}</Text>
                            <Text fontSize="sm" color={muted} fontWeight="500">{item.plan}</Text>
                          </VStack>
                          <Badge colorPalette={tone} variant="subtle" fontWeight="bold" px="3" py="1" borderRadius="full">
                            {item.status}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between" color={quiet}>
                          <HStack gap={2}>
                            <LuFileClock />
                            <Text fontSize="sm" fontWeight="500">{item.due}</Text>
                          </HStack>
                          <Text fontSize="md" fontWeight="800" color="inherit">
                            {item.amount}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}

                <Button variant="outline" size="lg" borderRadius="2xl" className="hover-lift" mt={2} onClick={() => navigate(buildViewPath("ListMember"))}>
                  Open member records
                  <LuArrowRight />
                </Button>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-3" bg={useColorModeValue("blue.50", "blue.900")} borderColor={useColorModeValue("blue.100", "blue.800")}>
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={useColorModeValue("blue.600", "blue.300")} mb={2} fontWeight="800">
                    Strategy Note
                  </Text>
                  <Heading size="md" letterSpacing="tight">Recommended move</Heading>
                </Box>
                <Text fontSize="md" color={useColorModeValue("gray.700", "gray.300")} lineHeight="tall" fontWeight="500">
                  Push monthly members with strong visit history toward quarterly plans. That group
                  has the best upgrade probability and the lowest collection friction.
                </Text>
                <HStack gap={3} color={toneBlue} mt={2} p={3} bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="xl">
                  <LuSparkles size={20} />
                  <Text fontSize="sm" fontWeight="800">
                    Use trainers to anchor the upgrade conversation
                  </Text>
                </HStack>
              </VStack>
            </SurfaceCard>
          </VStack>
        </SimpleGrid>

        <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-4" bg={useColorModeValue("gray.900", "whiteAlpha.100")} color="white" borderColor="transparent">
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={6}>
            <VStack align="start" gap={2}>
              <Heading size="lg" letterSpacing="tight" color="white">Need deeper numbers?</Heading>
              <Text fontSize="md" color="gray.300" maxW="xl">
                Open the analytics panel to review retention, revenue streams and growth signals with high-resolution charts.
              </Text>
            </VStack>
            <Button size="xl" colorPalette="blue" borderRadius="2xl" className="hover-lift" px={8} onClick={() => setAnalyticsOpen(true)}>
              Open highly-detailed analytics
              <LuArrowUpRight />
            </Button>
          </Flex>
        </SurfaceCard>
      </VStack>
    </Box>
  );
};

export default Subscription;
