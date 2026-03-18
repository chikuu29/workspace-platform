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
    <SurfaceCard p={6} className="hover-lift animate-entrance">
      <VStack align="stretch" gap={5}>
        <Circle size="12" bg={iconBg} color={iconColor} className="glow-icon">
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="800" textTransform="uppercase" letterSpacing="widest" color={muted}>
            {label}
          </Text>
          <Heading size="xl" fontWeight="900" letterSpacing="tight">{value}</Heading>
          <Text fontSize="sm" color={muted} fontWeight="600">
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
  const softSurface = useColorModeValue("rgba(0,0,0,0.03)", "whiteAlpha.50");
  const visitProgress = Math.min((member.visitsThisMonth / member.targetVisits) * 100, 100);
  const badgeTone =
    member.status === "Active" ? "green" : member.status === "Attention" ? "orange" : "gray";

  return (
    <SurfaceCard p={6} h="full" className="hover-lift animate-entrance delay-2">
      <VStack align="stretch" gap={6} h="full">
        <Flex justify="space-between" align="start" gap={4}>
          <HStack align="start" gap={4}>
            <Avatar.Root size="lg">
              <Avatar.Fallback>
                {member.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap="1">
              <Heading size="md" fontWeight="800" letterSpacing="tight">{member.name}</Heading>
              <Text fontSize="sm" color={muted} fontWeight="500">
                {member.id}
              </Text>
            </VStack>
          </HStack>
          <Badge colorPalette={badgeTone} variant="subtle" px="4" py="1.5" borderRadius="full" fontWeight="bold">
            {member.status}
          </Badge>
        </Flex>

        <Box p={5} borderRadius="2xl" bg={softSurface}>
          <SimpleGrid columns={2} gap={5}>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} fontWeight="700">
                Plan
              </Text>
              <Text fontWeight="800" fontSize="md">{member.plan}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} fontWeight="700">
                Trainer
              </Text>
              <Text fontWeight="800" fontSize="md">{member.trainer}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} fontWeight="700">
                Last Visit
              </Text>
              <Text fontWeight="800" fontSize="md">{member.lastVisit}</Text>
            </VStack>
            <VStack align="start" gap="1">
              <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} fontWeight="700">
                Renewal
              </Text>
              <Text fontWeight="800" fontSize="md">{member.nextRenewal}</Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <VStack align="stretch" gap={3} flex="1">
          <HStack justify="space-between">
            <Text fontSize="sm" fontWeight="700" color={muted}>
              Monthly visit target
            </Text>
            <Text fontSize="sm" fontWeight="800" color={quiet}>
              {member.visitsThisMonth} / {member.targetVisits}
            </Text>
          </HStack>
          <Progress.Root value={visitProgress} size="md" colorPalette="blue" borderRadius="full">
            <Progress.Track borderRadius="full">
              <Progress.Range borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
        </VStack>

        <Separator opacity={0.5} />

        <VStack align="stretch" gap={4}>
          <HStack gap={3} color={muted}>
            <LuMail size="18" />
            <Text fontSize="sm" fontWeight="600">{member.email}</Text>
          </HStack>
          <HStack gap={3} color={muted}>
            <LuPhone size="18" />
            <Text fontSize="sm" fontWeight="600">{member.phone}</Text>
          </HStack>
        </VStack>

        <Flex justify="space-between" align="center" pt={2}>
          <VStack align="start" gap="1">
            <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest" color={quiet} fontWeight="700">
              Outstanding
            </Text>
            <Text fontWeight="900" fontSize="lg" color={member.outstanding !== "$0" ? useColorModeValue("orange.600", "orange.400") : "inherit"}>{member.outstanding}</Text>
          </VStack>
          <Button variant="outline" size="sm" borderRadius="full" className="hover-lift">
            <LuArrowRight /> Open record
          </Button>
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
    "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(16,185,129,0.1) 52%, rgba(249,115,22,0.1) 100%)",
    "linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(13,148,136,0.2) 52%, rgba(249,115,22,0.15) 100%)"
  );
  const searchBg = useColorModeValue("rgba(255,255,255,0.8)", "rgba(15,23,42,0.6)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(255, 255, 255, 0.08)");
  const panelSurface = useColorModeValue("rgba(0,0,0,0.03)", "whiteAlpha.100");
  const emptyStateBg = useColorModeValue("blue.50", "whiteAlpha.100");
  const emptyStateColor = useColorModeValue("blue.600", "blue.300");
  const teamNoteColor = useColorModeValue("blue.600", "blue.300");

  const blob1 = useColorModeValue("rgba(59,130,246,0.25)", "rgba(59,130,246,0.15)");
  const blob2 = useColorModeValue("rgba(16,185,129,0.2)", "rgba(16,185,129,0.1)");
  
  return (
    <Box position="relative" w="full" minH="100%">
      <style>{animations}</style>

      {/* Decorative Orbs */}
      <Box position="absolute" top="-10%" left="5%" w="350px" h="350px" bg={blob1} filter="blur(110px)" borderRadius="full" pointerEvents="none" zIndex={0} />
      <Box position="absolute" top="40%" right="-5%" w="400px" h="400px" bg={blob2} filter="blur(120px)" borderRadius="full" pointerEvents="none" zIndex={0} />

      <VStack align="stretch" gap={8} pb={12} position="relative" zIndex={1}>
        <SurfaceCard p={{ base: 6, md: 8 }} bg={heroBg} overflow="hidden" position="relative" className="animate-entrance">
          <Box
            position="absolute"
            right="-20px"
            top="-30px"
            w={{ base: "180px", md: "280px" }}
            h={{ base: "180px", md: "280px" }}
            borderRadius="full"
            bg="rgba(255,255,255,0.15)"
            filter="blur(40px)"
            pointerEvents="none"
          />
          <SimpleGrid columns={{ base: 1, xl: 2 }} gap={10} position="relative">
            <VStack align="start" gap={6}>
              <HStack flexWrap="wrap" gap="3">
                <Badge colorPalette="blue" variant="solid" px="4" py="1.5" borderRadius="full" fontWeight="bold">
                  Member Directory
                </Badge>
                <Badge variant="surface" px="4" py="1.5" bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="full">
                  {memberData.length} records
                </Badge>
                <Badge variant="surface" px="4" py="1.5" bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="full">
                  <Box as="span" w="2" h="2" borderRadius="full" bg="orange.500" display="inline-block" mr={2} />
                  {attentionCount} pending
                </Badge>
              </HStack>

              <VStack align="start" gap="3" maxW="2xl">
                <Heading size={{ base: "2xl", md: "3xl" }} letterSpacing="tight" fontWeight="900">
                  Modern gym CRM view for member health and engagement.
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color={muted} lineHeight="tall" fontWeight="500">
                  Review membership status, attendance momentum, trainer assignment and billing
                  follow-up from one responsive member management screen.
                </Text>
              </VStack>

              <HStack flexWrap="wrap" gap="4" pt={2}>
                <Button colorPalette="blue" size="xl" borderRadius="2xl" px={8} className="hover-lift" onClick={() => navigate(buildViewPath("AddMember"))}>
                  <LuUserPlus />
                  Add member
                </Button>
                <Button variant="surface" size="xl" borderRadius="2xl" px={8} className="hover-lift" bg={useColorModeValue("white", "whiteAlpha.200")} onClick={() => navigate(buildViewPath("Subscription"))}>
                  <LuWallet />
                  Review subscriptions
                </Button>
              </HStack>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 4 }} gap={5}>
              <StatTile label="Active" value={String(activeCount)} icon={LuUsers} accent="green" helper="In good standing" />
              <StatTile label="Attention" value={String(attentionCount)} icon={LuShieldAlert} accent="orange" helper="Need outreach" />
              <StatTile label="Frozen" value={String(frozenCount)} icon={LuClock3} accent="gray" helper="Paused passes" />
              <StatTile label="Outstanding" value={String(outstandingCount)} icon={LuActivity} accent="blue" helper="Payments due" />
            </SimpleGrid>
          </SimpleGrid>
        </SurfaceCard>

        <SurfaceCard p={{ base: 4, md: 6 }} className="animate-entrance delay-1">
          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "stretch", lg: "center" }}
            gap={6}
          >
            <Box position="relative" flex="1">
              <Box
                position="absolute"
                left="4"
                top="50%"
                transform="translateY(-50%)"
                color={quiet}
                zIndex={1}
              >
                <LuSearch size="20" />
              </Box>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, plan, trainer or member ID"
                pl="12"
                h="14"
                fontSize="lg"
                fontWeight="500"
                borderRadius="2xl"
                bg={searchBg}
                borderColor={borderColor}
                boxShadow={useColorModeValue("inset 0 2px 4px rgba(0,0,0,0.02)", "inset 0 2px 4px rgba(0,0,0,0.2)")}
                _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px var(--chakra-colors-blue-400), inset 0 2px 4px rgba(0,0,0,0.02)" }}
              />
            </Box>

            <HStack flexWrap="wrap" gap="3">
              <HStack gap="2" color={quiet} px="3" py="2" bg={panelSurface} borderRadius="xl">
                <LuFilter />
                <Text fontSize="sm" fontWeight="700" letterSpacing="wide">
                  FILTER
                </Text>
              </HStack>
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Button
                    key={filter}
                    size="lg"
                    borderRadius="xl"
                    variant={isActive ? "solid" : "surface"}
                    colorPalette={isActive ? "blue" : "gray"}
                    onClick={() => setActiveFilter(filter)}
                    className="hover-lift"
                    fontWeight="700"
                    bg={isActive ? undefined : useColorModeValue("white", "whiteAlpha.200")}
                  >
                    {filter}
                  </Button>
                );
              })}
            </HStack>
          </Flex>
        </SurfaceCard>

        <SimpleGrid columns={{ base: 1, xl: 3 }} gap={8}>
          <VStack align="stretch" gap={8} gridColumn={{ xl: "span 2" }}>
            <Flex justify="space-between" align={{ base: "start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3} px={2} className="animate-entrance delay-2">
              <Box>
                <Heading size="xl" fontWeight="900" letterSpacing="tight">Member directory</Heading>
                <Text fontSize="md" color={muted} mt={2} fontWeight="500">
                  Showing {visibleMembers.length} out of {memberData.length} total members matched
                </Text>
              </Box>
              <Badge variant="subtle" colorPalette="blue" px="4" py="2" borderRadius="full" fontWeight="bold">
                Live CRM sync
              </Badge>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
              {visibleMembers.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </SimpleGrid>

            {visibleMembers.length === 0 && (
              <SurfaceCard p={10} className="animate-entrance delay-2">
                <VStack align="center" gap={5}>
                  <Circle size="20" bg={emptyStateBg} color={emptyStateColor}>
                    <LuUsers size="32px" />
                  </Circle>
                  <Heading size="lg" fontWeight="800" letterSpacing="tight">No members match this filter</Heading>
                  <Text color={muted} textAlign="center" maxW="md" fontSize="lg" fontWeight="500">
                    Try a different search term or switch the status filter to see more member records.
                  </Text>
                </VStack>
              </SurfaceCard>
            )}
          </VStack>

          <VStack align="stretch" gap={8}>
            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-3">
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="800">
                    Renewal Queue
                  </Text>
                  <Heading size="lg" letterSpacing="tight" fontWeight="800">Needs action</Heading>
                </Box>

                {renewalQueue.map((member) => (
                  <Box key={member.id} p={5} borderRadius="2xl" bg={panelSurface} className="hover-lift">
                    <VStack align="stretch" gap={4}>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" gap="1">
                          <Text fontWeight="800" fontSize="md">{member.name}</Text>
                          <Text fontSize="sm" color={muted} fontWeight="600">{member.plan}</Text>
                        </VStack>
                        <Badge colorPalette={member.status === "Attention" ? "orange" : "gray"} variant="subtle" px="3" py="1" borderRadius="full" fontWeight="bold">
                          {member.status}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <HStack gap={2} color={quiet}>
                          <LuCalendarClock />
                          <Text fontSize="sm" fontWeight="700">{member.nextRenewal}</Text>
                        </HStack>
                        <Text fontSize="md" fontWeight="800" color={member.outstanding !== "$0" ? useColorModeValue("orange.600", "orange.400") : "inherit"}>
                          {member.outstanding}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                ))}

                <Button
                  variant="outline"
                  borderRadius="xl"
                  size="xl"
                  mt={2}
                  className="hover-lift"
                  onClick={() => navigate(buildViewPath("Subscription"))}
                >
                  Open billing desk
                  <LuArrowRight />
                </Button>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-4">
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={quiet} mb={2} fontWeight="800">
                    Floor Snapshot
                  </Text>
                  <Heading size="lg" letterSpacing="tight" fontWeight="800">Usage momentum</Heading>
                </Box>

                <SimpleGrid columns={1} gap={4}>
                  <Box p={5} borderRadius="2xl" bg={panelSurface} className="hover-lift">
                    <HStack justify="space-between">
                      <VStack align="start" gap="1">
                        <Text fontWeight="800">Morning attendance</Text>
                        <Text fontSize="sm" color={muted} fontWeight="500">Peak traffic window</Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="900">82%</Text>
                    </HStack>
                  </Box>
                  <Box p={5} borderRadius="2xl" bg={panelSurface} className="hover-lift">
                    <HStack justify="space-between">
                      <VStack align="start" gap="1">
                        <Text fontWeight="800">PT utilization</Text>
                        <Text fontSize="sm" color={muted} fontWeight="500">Trainer-led sessions</Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="900">76%</Text>
                    </HStack>
                  </Box>
                  <Box p={5} borderRadius="2xl" bg={panelSurface} className="hover-lift">
                    <HStack justify="space-between">
                      <VStack align="start" gap="1">
                        <Text fontWeight="800">Equipment demand</Text>
                        <Text fontSize="sm" color={muted} fontWeight="500">Strength zone today</Text>
                      </VStack>
                      <Text fontSize="2xl" fontWeight="900" color={useColorModeValue("orange.600", "orange.400")}>High</Text>
                    </HStack>
                  </Box>
                </SimpleGrid>
              </VStack>
            </SurfaceCard>

            <SurfaceCard p={{ base: 6, md: 8 }} className="animate-entrance delay-5" bg={useColorModeValue("blue.50", "blue.900")} borderColor={useColorModeValue("blue.100", "blue.800")}>
              <VStack align="stretch" gap={5}>
                <Box>
                  <Text fontSize="sm" textTransform="uppercase" letterSpacing="widest" color={useColorModeValue("blue.600", "blue.300")} mb={2} fontWeight="800">
                    Team Note
                  </Text>
                  <Heading size="md" letterSpacing="tight" fontWeight="800">Suggested next action</Heading>
                </Box>
                <Text color={useColorModeValue("gray.700", "gray.300")} fontSize="md" lineHeight="tall" fontWeight="500">
                  Focus the front desk on members with upcoming renewals and low visit counts.
                  They are the highest-risk segment for churn this week.
                </Text>
                <HStack gap={3} color={teamNoteColor} p={3} bg={useColorModeValue("white", "whiteAlpha.200")} borderRadius="xl" mt={2}>
                  <LuDumbbell size="20" />
                  <Text fontSize="sm" fontWeight="800" letterSpacing="tight">
                    Pair outreach with trainer check-in calls
                  </Text>
                </HStack>
              </VStack>
            </SurfaceCard>
          </VStack>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Members;
