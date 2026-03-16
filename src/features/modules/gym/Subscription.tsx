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
// import CustomModal from "@/features/components/CustomModel/CostomModal";
import RevenuAnalytics from "./RevenuAnalytics";

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

const SurfaceCard = ({ children, ...props }: any) => {
  const bg = useColorModeValue("rgba(255,255,255,0.96)", "rgba(15, 23, 42, 0.72)");
  const borderColor = useColorModeValue("rgba(99,102,241,0.12)", "rgba(255,255,255,0.08)");
  const shadow = useColorModeValue(
    "0 24px 60px -42px rgba(15, 23, 42, 0.28)",
    "0 24px 60px -42px rgba(2, 6, 23, 0.8)"
  );

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="3xl"
      boxShadow={shadow}
      backdropFilter="blur(14px)"
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
    <SurfaceCard p={5}>
      <VStack align="stretch" gap={4}>
        <Circle size="12" bg={iconBg} color={iconColor}>
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="600" color={muted}>
            {label}
          </Text>
          <Heading size="lg">{value}</Heading>
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
  const softSurface = useColorModeValue("gray.50", "whiteAlpha.50");
  const accentBg = useColorModeValue(`${plan.accent}.50`, "whiteAlpha.100");
  const accentColor = useColorModeValue(`${plan.accent}.600`, `${plan.accent}.300`);

  return (
    <SurfaceCard p={5} h="full">
      <VStack align="stretch" gap={5} h="full">
        <Flex justify="space-between" align="start" gap={4}>
          <VStack align="start" gap="1">
            <Badge colorPalette={plan.accent} variant="subtle" borderRadius="full" px="3" py="1">
              {plan.status}
            </Badge>
            <Heading size="md">{plan.name}</Heading>
            <Text color={muted}>
              {plan.price} <Text as="span" color={quiet}>/ {plan.billingCycle}</Text>
            </Text>
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
            <Text fontWeight="800" mt={1}>{plan.members}</Text>
          </Box>
          <Box p={4} borderRadius="2xl" bg={softSurface}>
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
              Revenue
            </Text>
            <Text fontWeight="800" mt={1}>{plan.revenue}</Text>
          </Box>
        </SimpleGrid>

        <VStack align="stretch" gap={3} flex="1">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="600" color={muted}>
              Utilization
            </Text>
            <Text fontSize="sm" color={quiet}>
              {plan.utilization}%
            </Text>
          </HStack>
          <Progress.Root value={plan.utilization} size="sm" colorPalette={plan.accent} borderRadius="full">
            <Progress.Track borderRadius="full">
              <Progress.Range borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="sm" color={muted}>
            Retention: <Text as="span" fontWeight="700">{plan.retention}</Text>
          </Text>
        </VStack>

        <Separator />

        <VStack align="stretch" gap={2}>
          {plan.features.map((feature) => (
            <HStack key={feature} gap={2} color={muted}>
              <Circle size="5" bg={accentBg} color={accentColor}>
                <LuArrowRight size="12px" />
              </Circle>
              <Text fontSize="sm">{feature}</Text>
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
    <Box p={5} borderRadius="2xl" bg={softSurface}>
      <VStack align="start" gap={4}>
        <Circle size="11" bg={iconBg} color={iconColor}>
          <Icon as={item.icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Heading size="sm">{item.title}</Heading>
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
    "linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(14,165,233,0.08) 42%, rgba(249,115,22,0.10) 100%)",
    "linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(8,145,178,0.16) 42%, rgba(249,115,22,0.12) 100%)"
  );
  const muted = useColorModeValue("gray.600", "gray.300");
  const quiet = useColorModeValue("gray.500", "gray.400");
  const softSurface = useColorModeValue("gray.50", "whiteAlpha.50");
  const toneBlue = useColorModeValue("blue.600", "blue.300");
  const channelTrackBg = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <>
      {/* <CustomModal
        isOpen={isAnalyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        size="sm"
        title="Revenue Analytics"
        onSubmit={() => setAnalyticsOpen(false)}
        children={<RevenuAnalytics />}
      /> */}

      <VStack align="stretch" gap={6} pb={8}>
        <SurfaceCard p={{ base: 5, md: 7 }} bg={heroBg} overflow="hidden" position="relative">
          <Box
            position="absolute"
            top="-30px"
            right="-16px"
            w={{ base: "150px", md: "240px" }}
            h={{ base: "150px", md: "240px" }}
            borderRadius="full"
            bg="rgba(59,130,246,0.12)"
            filter="blur(44px)"
            pointerEvents="none"
          />
          <SimpleGrid columns={{ base: 1, xl: 2 }} gap={8} position="relative">
            <VStack align="start" gap={4}>
              <HStack flexWrap="wrap" gap="3">
                <Badge colorPalette="blue" variant="subtle" px="3" py="1" borderRadius="full">
                  Subscription Desk
                </Badge>
                <Badge variant="outline" px="3" py="1" borderRadius="full">
                  4 renewals need action
                </Badge>
                <Badge variant="outline" px="3" py="1" borderRadius="full">
                  Auto-debit success 96.2%
                </Badge>
              </HStack>

              <VStack align="start" gap="2" maxW="2xl">
                <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
                  Modern subscription management for renewals, collections and upgrades.
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} color={muted} lineHeight="tall">
                  Manage billing health across all gym plans, review due members, watch channel
                  performance and launch plan upgrades from one CRM billing page.
                </Text>
              </VStack>

              <HStack flexWrap="wrap" gap="3">
                <Button colorPalette="blue" size="lg" borderRadius="xl" onClick={() => navigate(buildViewPath("AddMember"))}>
                  <LuBadgeDollarSign />
                  New subscription
                </Button>
                <Button variant="outline" size="lg" borderRadius="xl" onClick={() => navigate(buildViewPath("ListMember"))}>
                  <LuUsers />
                  Open members
                </Button>
                <Button variant="ghost" size="lg" borderRadius="xl" onClick={() => setAnalyticsOpen(true)}>
                  <LuChartColumn />
                  Analytics
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <KPI label="MRR" value="$45.2K" helper="12.1% higher than last month" icon={LuWallet} accent="blue" />
              <KPI label="Renewals" value="128" helper="Due in the next 30 days" icon={LuCalendarClock} accent="green" />
              <KPI label="Collection Rate" value="96.2%" helper="Across all payment channels" icon={LuCircleDollarSign} accent="orange" />
              <KPI label="At Risk" value="18" helper="Need outreach or reactivation" icon={LuShieldAlert} accent="red" />
            </SimpleGrid>
          </SimpleGrid>
        </SurfaceCard>

        <SurfaceCard p={{ base: 5, md: 6 }}>
          <VStack align="stretch" gap={5}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                  Plan Catalog
                </Text>
                <Heading size="md">Subscription portfolio performance</Heading>
              </Box>
              <Badge variant="subtle" colorPalette="blue" px="3" py="1" borderRadius="full">
                Product + Collections
              </Badge>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
              {planRecords.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </SimpleGrid>
          </VStack>
        </SurfaceCard>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={6}>
          <VStack align="stretch" gap={6} gridColumn={{ xl: "span 2" }}>
            <SurfaceCard p={{ base: 5, md: 6 }}>
              <VStack align="stretch" gap={5}>
                <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={4}>
                  <Box>
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                      Collections
                    </Text>
                    <Heading size="md">Revenue channel mix</Heading>
                  </Box>
                  <Badge variant="outline" borderRadius="full" px="3" py="1">
                    Updated today
                  </Badge>
                </Flex>

                <VStack align="stretch" gap={4}>
                  {collectionChannels.map((channel) => (
                    <Box key={channel.label} p={4} borderRadius="2xl" bg={softSurface}>
                      <Flex justify="space-between" mb={3}>
                        <VStack align="start" gap="0">
                          <Text fontWeight="700">{channel.label}</Text>
                          <Text fontSize="sm" color={muted}>{channel.amount}</Text>
                        </VStack>
                        <Text fontSize="sm" color={quiet}>{channel.share}% share</Text>
                      </Flex>
                      <Box h="2.5" borderRadius="full" bg={channelTrackBg} overflow="hidden">
                        <Box h="full" w={`${channel.share}%`} bg={channel.color} borderRadius="full" />
                      </Box>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 5, md: 6 }}>
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                    Action Queue
                  </Text>
                  <Heading size="md">Billing workflows for today</Heading>
                </Box>

                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  {actionCards.map((item) => (
                    <ActionCard key={item.title} item={item} muted={muted} softSurface={softSurface} />
                  ))}
                </SimpleGrid>
              </VStack>
            </SurfaceCard>
          </VStack>

          <VStack align="stretch" gap={6}>
            <SurfaceCard p={5}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                    Renewal Queue
                  </Text>
                  <Heading size="sm">Members due for follow-up</Heading>
                </Box>

                {renewalQueue.map((item) => {
                  const tone =
                    item.status === "Due Today" ? "red" : item.status === "Overdue" ? "orange" : "blue";

                  return (
                    <Box key={`${item.member}-${item.plan}`} p={4} borderRadius="2xl" bg={softSurface}>
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" gap="1">
                            <Text fontWeight="700">{item.member}</Text>
                            <Text fontSize="sm" color={muted}>{item.plan}</Text>
                          </VStack>
                          <Badge colorPalette={tone} variant="subtle">
                            {item.status}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between" color={quiet}>
                          <HStack gap={2}>
                            <LuFileClock />
                            <Text fontSize="sm">{item.due}</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="700" color="inherit">
                            {item.amount}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  );
                })}

                <Button variant="outline" borderRadius="xl" onClick={() => navigate(buildViewPath("ListMember"))}>
                  Open member records
                  <LuArrowRight />
                </Button>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={5}>
              <VStack align="stretch" gap={4}>
                <Box>
                  <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                    Strategy Note
                  </Text>
                  <Heading size="sm">Recommended move</Heading>
                </Box>
                <Text fontSize="sm" color={muted} lineHeight="tall">
                  Push monthly members with strong visit history toward quarterly plans. That group
                  has the best upgrade probability and the lowest collection friction.
                </Text>
                <HStack gap={2} color={toneBlue}>
                  <LuSparkles />
                  <Text fontSize="sm" fontWeight="700">
                    Use trainers to anchor the upgrade conversation
                  </Text>
                </HStack>
              </VStack>
            </SurfaceCard>
          </VStack>
        </SimpleGrid>

        <SurfaceCard p={{ base: 5, md: 6 }}>
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            <VStack align="start" gap="1">
              <Heading size="sm">Need deeper numbers?</Heading>
              <Text fontSize="sm" color={muted}>
                Open the analytics panel to review retention, revenue streams and growth signals.
              </Text>
            </VStack>
            <Button colorPalette="blue" borderRadius="xl" onClick={() => setAnalyticsOpen(true)}>
              Open analytics
              <LuArrowUpRight />
            </Button>
          </Flex>
        </SurfaceCard>
      </VStack>
    </>
  );
};

export default Subscription;
