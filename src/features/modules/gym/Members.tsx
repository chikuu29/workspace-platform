import { useState } from "react";
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
  Input,
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
  LuCalendarClock,
  LuClock3,
  LuDumbbell,
  LuFilter,
  LuMail,
  LuPhone,
  LuSearch,
  LuShieldAlert,
  LuUserPlus,
  LuUsers,
  LuWallet,
} from "react-icons/lu";

type MemberStatus = "Active" | "Attention" | "Frozen";

interface MemberRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: string;
  trainer: string;
  status: MemberStatus;
  visitsThisMonth: number;
  targetVisits: number;
  lastVisit: string;
  nextRenewal: string;
  outstanding: string;
}

const memberData: MemberRecord[] = [
  {
    id: "GYM-1042",
    name: "Aarav Mehta",
    email: "aarav.mehta@fitmail.com",
    phone: "+91 98765 10120",
    plan: "Annual Platinum",
    trainer: "Neha Sharma",
    status: "Active",
    visitsThisMonth: 18,
    targetVisits: 20,
    lastVisit: "Today, 07:15 AM",
    nextRenewal: "08 Apr 2026",
    outstanding: "$0",
  },
  {
    id: "GYM-1108",
    name: "Sara Khan",
    email: "sara.khan@fitmail.com",
    phone: "+91 98765 22314",
    plan: "Quarterly Flex",
    trainer: "Riya Sen",
    status: "Attention",
    visitsThisMonth: 7,
    targetVisits: 16,
    lastVisit: "Yesterday, 06:40 PM",
    nextRenewal: "20 Mar 2026",
    outstanding: "$120",
  },
  {
    id: "GYM-1186",
    name: "Kabir Das",
    email: "kabir.das@fitmail.com",
    phone: "+91 98765 44211",
    plan: "Monthly Starter",
    trainer: "Vikram Das",
    status: "Frozen",
    visitsThisMonth: 3,
    targetVisits: 12,
    lastVisit: "10 Mar 2026",
    nextRenewal: "Paused",
    outstanding: "$0",
  },
  {
    id: "GYM-1204",
    name: "Maya Reddy",
    email: "maya.reddy@fitmail.com",
    phone: "+91 98765 55143",
    plan: "PT Premium",
    trainer: "Neha Sharma",
    status: "Active",
    visitsThisMonth: 22,
    targetVisits: 24,
    lastVisit: "Today, 09:05 AM",
    nextRenewal: "29 Apr 2026",
    outstanding: "$0",
  },
  {
    id: "GYM-1219",
    name: "Rohan Iyer",
    email: "rohan.iyer@fitmail.com",
    phone: "+91 98765 66091",
    plan: "Family Flex",
    trainer: "Riya Sen",
    status: "Attention",
    visitsThisMonth: 9,
    targetVisits: 18,
    lastVisit: "14 Mar 2026",
    nextRenewal: "22 Mar 2026",
    outstanding: "$80",
  },
  {
    id: "GYM-1257",
    name: "Nisha Roy",
    email: "nisha.roy@fitmail.com",
    phone: "+91 98765 77102",
    plan: "Annual Platinum",
    trainer: "Coach Aditya",
    status: "Active",
    visitsThisMonth: 16,
    targetVisits: 20,
    lastVisit: "Yesterday, 08:00 AM",
    nextRenewal: "15 Jun 2026",
    outstanding: "$0",
  },
];

const filters: Array<"All" | MemberStatus> = ["All", "Active", "Attention", "Frozen"];

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

const StatTile = ({
  label,
  value,
  icon,
  accent,
  helper,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accent: string;
  helper: string;
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

const MemberCard = ({ member }: { member: MemberRecord }) => {
  const muted = useColorModeValue("gray.600", "gray.300");
  const quiet = useColorModeValue("gray.500", "gray.400");
  const softSurface = useColorModeValue("gray.50", "whiteAlpha.50");
  const visitProgress = Math.min((member.visitsThisMonth / member.targetVisits) * 100, 100);
  const badgeTone =
    member.status === "Active" ? "green" : member.status === "Attention" ? "orange" : "gray";

  return (
    <SurfaceCard p={5} h="full">
      <VStack align="stretch" gap={5} h="full">
        <Flex justify="space-between" align="start" gap={4}>
          <HStack align="start" gap={3}>
            <Avatar.Root size="md">
              <Avatar.Fallback>
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap="1">
              <Heading size="sm">{member.name}</Heading>
              <Text fontSize="sm" color={muted}>
                {member.id}
              </Text>
            </VStack>
          </HStack>
          <Badge colorPalette={badgeTone} variant="subtle" px="3" py="1" borderRadius="full">
            {member.status}
          </Badge>
        </Flex>

        <Box p={4} borderRadius="2xl" bg={softSurface}>
          <SimpleGrid columns={2} gap={4}>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
                Plan
              </Text>
              <Text fontWeight="700">{member.plan}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
                Trainer
              </Text>
              <Text fontWeight="700">{member.trainer}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
                Last Visit
              </Text>
              <Text fontWeight="700">{member.lastVisit}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
                Renewal
              </Text>
              <Text fontWeight="700">{member.nextRenewal}</Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <VStack align="stretch" gap={3} flex="1">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="600" color={muted}>
              Monthly visit target
            </Text>
            <Text fontSize="sm" color={quiet}>
              {member.visitsThisMonth}/{member.targetVisits}
            </Text>
          </HStack>
          <Progress.Root value={visitProgress} size="sm" colorPalette="blue" borderRadius="full">
            <Progress.Track borderRadius="full">
              <Progress.Range borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
        </VStack>

        <Separator />

        <VStack align="stretch" gap={3}>
          <HStack gap={2} color={muted}>
            <LuMail />
            <Text fontSize="sm">{member.email}</Text>
          </HStack>
          <HStack gap={2} color={muted}>
            <LuPhone />
            <Text fontSize="sm">{member.phone}</Text>
          </HStack>
        </VStack>

        <Flex justify="space-between" align="center" pt={1}>
          <VStack align="start" gap="0">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet}>
              Outstanding
            </Text>
            <Text fontWeight="800">{member.outstanding}</Text>
          </VStack>
          <Badge variant="outline" borderRadius="full" px="3" py="1">
            CRM record
          </Badge>
        </Flex>
      </VStack>
    </SurfaceCard>
  );
};

const Members = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"All" | MemberStatus>("All");

  const appParam = searchParams.get("app");
  const appName = appCode || appParam || "myGym";
  const workspacePrefix = pathname.includes("/workspace")
    ? `${pathname.split("/workspace")[0]}/workspace`
    : "";

  const buildViewPath = (viewName: string) => {
    if (appCode) return `${workspacePrefix}/app/${appCode}/${viewName}`;
    return `${workspacePrefix}/${viewName}?app=${appName}`;
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleMembers = memberData.filter((member) => {
    const matchesFilter = activeFilter === "All" || member.status === activeFilter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.plan.toLowerCase().includes(normalizedQuery) ||
      member.id.toLowerCase().includes(normalizedQuery) ||
      member.trainer.toLowerCase().includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });

  const activeCount = memberData.filter((member) => member.status === "Active").length;
  const attentionCount = memberData.filter((member) => member.status === "Attention").length;
  const frozenCount = memberData.filter((member) => member.status === "Frozen").length;
  const outstandingCount = memberData.filter((member) => member.outstanding !== "$0").length;
  const renewalQueue = memberData.filter((member) => member.status !== "Active").slice(0, 4);
  const muted = useColorModeValue("gray.600", "gray.300");
  const quiet = useColorModeValue("gray.500", "gray.400");
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(16,185,129,0.08) 52%, rgba(249,115,22,0.08) 100%)",
    "linear-gradient(135deg, rgba(37,99,235,0.16) 0%, rgba(13,148,136,0.16) 52%, rgba(249,115,22,0.12) 100%)"
  );
  const searchBg = useColorModeValue("white", "rgba(255,255,255,0.04)");
  const borderColor = useColorModeValue("rgba(99,102,241,0.12)", "rgba(255,255,255,0.08)");
  const panelSurface = useColorModeValue("gray.50", "whiteAlpha.50");
  const emptyStateBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const emptyStateColor = useColorModeValue("blue.600", "blue.300");
  const teamNoteColor = useColorModeValue("blue.600", "blue.300");

  return (
    <VStack align="stretch" gap={6} pb={8}>
      <SurfaceCard p={{ base: 5, md: 7 }} bg={heroBg} overflow="hidden" position="relative">
        <Box
          position="absolute"
          right="-20px"
          top="-24px"
          w={{ base: "140px", md: "220px" }}
          h={{ base: "140px", md: "220px" }}
          borderRadius="full"
          bg="rgba(59,130,246,0.12)"
          filter="blur(42px)"
          pointerEvents="none"
        />
        <SimpleGrid columns={{ base: 1, xl: 2 }} gap={8} position="relative">
          <VStack align="start" gap={4}>
            <HStack flexWrap="wrap" gap="3">
              <Badge colorPalette="blue" variant="subtle" px="3" py="1" borderRadius="full">
                Member Directory
              </Badge>
              <Badge variant="outline" px="3" py="1" borderRadius="full">
                {memberData.length} total records
              </Badge>
              <Badge variant="outline" px="3" py="1" borderRadius="full">
                {attentionCount} follow-ups pending
              </Badge>
            </HStack>

            <VStack align="start" gap="2" maxW="2xl">
              <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight">
                Modern gym CRM view for member health, renewals and engagement.
              </Heading>
              <Text fontSize={{ base: "sm", md: "md" }} color={muted} lineHeight="tall">
                Review membership status, attendance momentum, trainer assignment and billing
                follow-up from one responsive member management screen.
              </Text>
            </VStack>

            <HStack flexWrap="wrap" gap="3">
              <Button colorPalette="blue" size="lg" borderRadius="xl" onClick={() => navigate(buildViewPath("AddMember"))}>
                <LuUserPlus />
                Add member
              </Button>
              <Button variant="outline" size="lg" borderRadius="xl" onClick={() => navigate(buildViewPath("Subscription"))}>
                <LuWallet />
                Review subscriptions
              </Button>
            </HStack>
          </VStack>

          <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
            <StatTile label="Active" value={String(activeCount)} icon={LuUsers} accent="green" helper="Members in good standing" />
            <StatTile label="Attention" value={String(attentionCount)} icon={LuShieldAlert} accent="orange" helper="Need outreach or renewal" />
            <StatTile label="Frozen" value={String(frozenCount)} icon={LuClock3} accent="gray" helper="Paused memberships" />
            <StatTile label="Outstanding" value={String(outstandingCount)} icon={LuActivity} accent="blue" helper="Payment follow-ups" />
          </SimpleGrid>
        </SimpleGrid>
      </SurfaceCard>

      <SurfaceCard p={{ base: 4, md: 5 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          align={{ base: "stretch", lg: "center" }}
          gap={4}
        >
          <Box position="relative" flex="1">
            <Box
              position="absolute"
              left="3"
              top="50%"
              transform="translateY(-50%)"
              color={quiet}
              zIndex={1}
            >
              <LuSearch />
            </Box>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, plan, trainer or member ID"
              pl="10"
              h="12"
              borderRadius="xl"
              bg={searchBg}
              borderColor={borderColor}
            />
          </Box>

          <HStack flexWrap="wrap" gap="2">
            <HStack gap="2" color={quiet} px="2">
              <LuFilter />
              <Text fontSize="sm" fontWeight="600">
                Filter
              </Text>
            </HStack>
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <Button
                  key={filter}
                  size="sm"
                  borderRadius="full"
                  variant={isActive ? "solid" : "outline"}
                  colorPalette={isActive ? "blue" : "gray"}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Button>
              );
            })}
          </HStack>
        </Flex>
      </SurfaceCard>

      <SimpleGrid columns={{ base: 1, xl: 3 }} gap={6}>
        <VStack align="stretch" gap={6} gridColumn={{ xl: "span 2" }}>
          <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
            <Box>
              <Heading size="md">Member cards</Heading>
              <Text fontSize="sm" color={quiet} mt={1}>
                Showing {visibleMembers.length} of {memberData.length} members
              </Text>
            </Box>
            <Badge variant="subtle" colorPalette="blue" px="3" py="1" borderRadius="full">
              Responsive CRM layout
            </Badge>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
            {visibleMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </SimpleGrid>

          {visibleMembers.length === 0 && (
            <SurfaceCard p={8}>
              <VStack align="center" gap={3}>
                <Circle size="14" bg={emptyStateBg} color={emptyStateColor}>
                  <LuUsers size="22px" />
                </Circle>
                <Heading size="sm">No members match this filter</Heading>
                <Text color={muted} textAlign="center" maxW="md">
                  Try a different search term or switch the status filter to see more member records.
                </Text>
              </VStack>
            </SurfaceCard>
          )}
        </VStack>

        <VStack align="stretch" gap={6}>
          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                  Renewal Queue
                </Text>
                <Heading size="sm">Members needing action</Heading>
              </Box>

              {renewalQueue.map((member) => (
                <Box key={member.id} p={4} borderRadius="2xl" bg={panelSurface}>
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" gap="1">
                        <Text fontWeight="700">{member.name}</Text>
                        <Text fontSize="sm" color={muted}>{member.plan}</Text>
                      </VStack>
                      <Badge colorPalette={member.status === "Attention" ? "orange" : "gray"} variant="subtle">
                        {member.status}
                      </Badge>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack gap={2} color={quiet}>
                        <LuCalendarClock />
                        <Text fontSize="sm">{member.nextRenewal}</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="700">
                        {member.outstanding}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              ))}

              <Button
                variant="outline"
                borderRadius="xl"
                onClick={() => navigate(buildViewPath("Subscription"))}
              >
                Open subscription desk
                <LuArrowRight />
              </Button>
            </VStack>
          </SurfaceCard>

          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                  Floor Snapshot
                </Text>
                <Heading size="sm">Usage momentum</Heading>
              </Box>

              <SimpleGrid columns={1} gap={4}>
                <Box p={4} borderRadius="2xl" bg={panelSurface}>
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="700">Morning attendance</Text>
                      <Text fontSize="sm" color={muted}>Peak traffic window</Text>
                    </VStack>
                    <Text fontSize="xl" fontWeight="900">82%</Text>
                  </HStack>
                </Box>
                <Box p={4} borderRadius="2xl" bg={panelSurface}>
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="700">PT utilization</Text>
                      <Text fontSize="sm" color={muted}>Trainer-led sessions</Text>
                    </VStack>
                    <Text fontSize="xl" fontWeight="900">76%</Text>
                  </HStack>
                </Box>
                <Box p={4} borderRadius="2xl" bg={panelSurface}>
                  <HStack justify="space-between">
                    <VStack align="start" gap="1">
                      <Text fontWeight="700">Equipment demand</Text>
                      <Text fontSize="sm" color={muted}>Strength zone today</Text>
                    </VStack>
                    <Text fontSize="xl" fontWeight="900">High</Text>
                  </HStack>
                </Box>
              </SimpleGrid>
            </VStack>
          </SurfaceCard>

          <SurfaceCard p={5}>
            <VStack align="stretch" gap={4}>
              <Box>
                <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2}>
                  Team Note
                </Text>
                <Heading size="sm">Suggested next action</Heading>
              </Box>
              <Text color={muted} fontSize="sm" lineHeight="tall">
                Focus the front desk on members with upcoming renewals and low visit counts.
                They are the highest-risk segment for churn this week.
              </Text>
              <HStack gap={2} color={teamNoteColor}>
                <LuDumbbell />
                <Text fontSize="sm" fontWeight="700">
                  Pair outreach with trainer check-in calls
                </Text>
              </HStack>
            </VStack>
          </SurfaceCard>
        </VStack>
      </SimpleGrid>
    </VStack>
  );
};

export default Members;
