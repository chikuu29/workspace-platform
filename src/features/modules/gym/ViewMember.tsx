/**
 * ViewMember.tsx
 *
 * Modern SaaS member directory for the gym app.
 */

import { memo, useCallback, useMemo, useState } from "react";
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
  IconButton,
  Separator,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import {
  LuActivity,
  LuArrowRight,
  LuCalendarDays,
  LuFilter,
  LuMail,
  LuPhone,
  LuPlus,
  LuRefreshCw,
  LuSparkles,
  LuUserCheck,
  LuUsers,
} from "react-icons/lu";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymMembers } from "./hooks/useGymMembers";
import { MemberDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";

type MemberFilter = "all" | "active" | "attention" | "frozen";

const getMemberName = (data: MemberDocument["data"]) => {
  const first = data.firstName || "";
  const last = data.lastName || "";

  return {
    full: `${first} ${last}`.trim() || "Unknown Member",
    initials: `${first?.[0] || ""}${last?.[0] || ""}` || "GM",
  };
};

const getMemberContact = (data: MemberDocument["data"]) => ({
  email: data.email || "No email",
  phone: data.phone || "No phone"
});

const formatDate = (date?: string) => {
  if (!date) return "Recently added";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Recently added";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const statusStyles = {
  active: {
    label: "Active",
    colorPalette: "green",
    accent: "green.400",
    bg: "green.500/10",
    border: "green.500/20",
  },
  attention: {
    label: "Needs attention",
    colorPalette: "orange",
    accent: "orange.400",
    bg: "orange.500/10",
    border: "orange.500/20",
  },
  frozen: {
    label: "Frozen",
    colorPalette: "blue",
    accent: "blue.400",
    bg: "blue.500/10",
    border: "blue.500/20",
  },
} as const;

const StatTile = memo(({
  label,
  value,
  caption,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  caption: string;
  icon: React.ElementType;
  accent: string;
}) => {
  const tileBg = useColorModeValue("rgba(255,255,255,0.78)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("whiteAlpha.900", "whiteAlpha.200");

  return (
    <Box
      p={{ base: 4, md: 5 }}
      borderRadius="2xl"
      bg={tileBg}
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(18px) saturate(160%)"
      boxShadow="0 18px 42px -30px rgba(15, 23, 42, 0.55)"
    >
      <HStack justify="space-between" align="start" gap={4}>
        <VStack align="start" gap={1}>
          <Text fontSize="xs" color="app.text.muted" fontWeight="800" textTransform="uppercase">
            {label}
          </Text>
          <Heading size="xl" color="app.text.primary" letterSpacing="tight">
            {value}
          </Heading>
          <Text fontSize="xs" color="app.text.muted" fontWeight="600">
            {caption}
          </Text>
        </VStack>
        <Circle size="11" bg={`${accent}/12`} color={accent}>
          <Icon as={icon} boxSize={5} />
        </Circle>
      </HStack>
    </Box>
  );
});
StatTile.displayName = "StatTile";

const FilterButton = memo(({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <Button
    size="sm"
    variant={active ? "solid" : "ghost"}
    colorPalette={active ? "blue" : "gray"}
    borderRadius="xl"
    px={4}
    fontWeight="800"
    onClick={onClick}
  >
    {label}
  </Button>
));
FilterButton.displayName = "FilterButton";

const MemberTile = memo(({
  member,
  onClick,
}: {
  member: MemberDocument;
  onClick: (id: string) => void;
}) => {
  const { data, _meta } = member;
  const name = getMemberName(data);
  const contact = getMemberContact(data);
  const status = data.status || "active";
  const statusTheme = statusStyles[status] || statusStyles.active;
  const cardBg = useColorModeValue("rgba(255,255,255,0.86)", "rgba(15,23,42,0.7)");
  const cardBorder = useColorModeValue("rgba(226,232,240,0.78)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box
      role="group"
      p={5}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      boxShadow="0 18px 44px -34px rgba(15, 23, 42, 0.72)"
      backdropFilter="blur(18px) saturate(150%)"
      position="relative"
      overflow="hidden"
      cursor="pointer"
      transition="all 0.24s cubic-bezier(0.4, 0, 0.2, 1)"
      onClick={() => onClick(_meta.record_id)}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        h: "3px",
        bg: statusTheme.accent,
      }}
      _hover={{
        transform: "translateY(-5px)",
        borderColor: statusTheme.accent,
        boxShadow: "0 26px 56px -34px rgba(37, 99, 235, 0.72)",
      }}
    >
      <VStack align="stretch" gap={4}>
        <Flex justify="space-between" align="start" gap={3}>
          <HStack gap={3} minW={0}>
            <Avatar.Root size="lg" shape="rounded" border="1px solid" borderColor={cardBorder}>
              <Avatar.Fallback bg={statusTheme.bg} color={statusTheme.accent} fontWeight="900">
                {name.initials}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" gap={0.5} minW={0}>
              <Text fontSize="md" fontWeight="900" color="app.text.primary" truncate>
                {name.full}
              </Text>
              <Text fontSize="xs" color={muted} fontWeight="700" fontFamily="mono" truncate>
                {data?.member_id}
              </Text>
            </VStack>
          </HStack>
          <Badge
            colorPalette={statusTheme.colorPalette}
            variant="subtle"
            borderRadius="full"
            px={3}
            py={1}
            fontSize="10px"
            fontWeight="900"
          >
            {statusTheme.label}
          </Badge>
        </Flex>

        <SimpleGrid columns={1} gap={2}>
          <HStack gap={2.5} color={muted} minW={0}>
            <Icon as={LuMail} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700" truncate>
              {contact.email}
            </Text>
          </HStack>
          <HStack gap={2.5} color={muted}>
            <Icon as={LuPhone} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700">
              {contact.phone}
            </Text>
          </HStack>
          <HStack gap={2.5} color={muted}>
            <Icon as={LuCalendarDays} boxSize={3.5} />
            <Text fontSize="sm" fontWeight="700">
              Joined {formatDate(_meta.created?.at)}
            </Text>
          </HStack>
        </SimpleGrid>

        <Separator opacity={0.35} />

        <HStack justify="space-between" gap={3}>
          {member.has_plan === false ? (
            <HStack
              flex={1} p={2.5} borderRadius="xl"
              bg="red.500/8" border="1px solid" borderColor="red.500/15"
              gap={2.5}
            >
              <Circle size="7" bg="red.500/15" color="red.500">
                <LuActivity size={12} />
              </Circle>
              <VStack align="start" gap={0} minW={0}>
                <Text fontSize="xs" fontWeight="900" color="red.500">
                  No Plan Assigned
                </Text>
                <Text fontSize="2xs" color={muted} fontWeight="700">
                  Enroll in a subscription
                </Text>
              </VStack>
            </HStack>
          ) : (
            <HStack
              flex={1} p={2.5} borderRadius="xl"
              bg={statusTheme.bg} border="1px solid" borderColor={statusTheme.border}
              gap={2.5} minW={0}
            >
              <Circle size="7" bg={statusTheme.bg} color={statusTheme.accent}>
                <LuCalendarDays size={12} />
              </Circle>
              <VStack align="start" gap={0} flex={1} minW={0}>
                <Text fontSize="xs" fontWeight="900" color="app.text.primary" truncate>
                  {member.subscription?.plan_name || data.plan || "Standard Plan"}
                </Text>
                {member.subscription && (
                  <Text fontSize="2xs" color={muted} fontWeight="700">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: member.subscription.currency || "USD",
                      maximumFractionDigits: 0,
                    }).format(member.subscription.price)}
                    {" / "}
                    {member.subscription.billing_cycle}
                    {member.subscription.is_paid
                      ? " · ✓ Paid"
                      : " · Unpaid"}
                    {" · Exp "}
                    {formatDate(member.subscription.end_date)}
                  </Text>
                )}
              </VStack>
            </HStack>
          )}
          <Circle
            size="9"
            bg={statusTheme.bg}
            color={statusTheme.accent}
            transition="all 0.2s"
            _groupHover={{ transform: "translateX(2px)" }}
          >
            <LuArrowRight size={16} />
          </Circle>
        </HStack>
      </VStack>
    </Box>
  );
});
MemberTile.displayName = "MemberTile";

const ViewMember = memo(() => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { appCode } = useParams();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MemberFilter>("all");

  const { members, total, loading, refresh } = useGymMembers();

  const appParam = searchParams.get("app");
  const appName = useMemo(() => appCode || appParam || "myGym", [appCode, appParam]);
  const prefix = useMemo(
    () => (pathname.includes("/workspace") ? `${pathname.split("/workspace")[0]}/workspace` : ""),
    [pathname]
  );

  const navigateTo = useCallback((view: string) => {
    const path = appCode ? `${prefix}/app/${appCode}/${view}` : `${prefix}/${view}?app=${appName}`;
    navigate(path);
  }, [appCode, appName, navigate, prefix]);

  const mountNavActions = useNavActionStore((state) => state.setActions);
  const unmountNavActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    mountNavActions(
      <HStack gap={2}>
        <IconButton
          // variant="ghost"
          colorPalette="yellow"
          borderRadius="sm"
          size="md"
          h="40px"
          px={6}
          onClick={refresh}
          aria-label="Refresh members"
          loading={loading}
        >
          <LuRefreshCw size={14} />
        </IconButton>
        <Button
          colorPalette="blue"
          borderRadius="sm"
          size="md"
          h="40px"
          px={6}
          fontWeight="800"
          onClick={() => navigateTo("AddMember")}
        >
          <LuPlus size={16} /> New Member
        </Button>
      </HStack>
    );
    return () => unmountNavActions();
  }, [mountNavActions, unmountNavActions, refresh, loading, navigateTo]);

  const metrics = useMemo(() => {
    const active = members.filter((member) => member.data.status === "active").length;
    const attention = members.filter((member) => member.data.status === "attention").length;
    const frozen = members.filter((member) => member.data.status === "frozen").length;
    const retention = members.length ? Math.round((active / members.length) * 100) : 0;

    return { active, attention, frozen, retention };
  }, [members]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return members.filter((member) => {
      const name = getMemberName(member.data);
      const contact = getMemberContact(member.data);
      const matchesFilter = activeFilter === "all" || member.data.status === activeFilter;
      const matchesSearch = !q ||
        name.full.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.phone.toLowerCase().includes(q) ||
        member._meta.record_id.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, members, searchQuery]);

  const membersRequiringAttention = useMemo(
    () => members.filter((member) => member.data.status === "attention").slice(0, 5),
    [members]
  );

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(240,249,255,0.96), rgba(255,255,255,0.92) 48%, rgba(240,253,244,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.94), rgba(30,41,59,0.88) 52%, rgba(6,78,59,0.42))"
  );
  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Box mt={4} animation="fade-in 0.5s ease-out" w="full">
      <Box
        p={{ base: 5, lg: 7 }}
        mb="3"
        borderRadius="2xl"
        bg={heroBg}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        position="relative"
        boxShadow="0 1px 3px rgba(0,0,0,0.04)"
      >
        <Grid templateColumns={{ base: "1fr", xl: "1.1fr 1.6fr" }} gap={6} alignItems="stretch">
          <VStack align="start" gap={3}>
            <VStack align="start" gap={3}>
              <Badge colorPalette="blue" variant="subtle" borderRadius="full" px={3} py={1} fontWeight="900">
                Live Member Ops
              </Badge>
              <Heading size={{ base: "xl", md: "2xl" }} letterSpacing="tight" color="app.text.primary">
                Manage members with a cleaner operating cockpit.
              </Heading>
              <Text color={muted} fontSize="sm" maxW="560px" fontWeight="600">
                Track active members, renewal attention, frozen accounts, and member contact records from one modern SaaS view.
              </Text>
            </VStack>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
            <StatTile label="Total members" value={total || members.length} caption="Registered profiles" icon={LuUsers} accent="blue.500" />
            <StatTile label="Active" value={metrics.active} caption={`${metrics.retention}% retention`} icon={LuUserCheck} accent="green.500" />
            <StatTile label="Attention" value={metrics.attention} caption="Renewal follow-up" icon={LuActivity} accent="orange.500" />
            <StatTile label="Frozen" value={metrics.frozen} caption="Paused accounts" icon={LuSparkles} accent="cyan.500" />
          </SimpleGrid>
        </Grid>
      </Box>
      <PageHeader
        title="Member Directory"
        subtitle={`${total} registered members across plans, renewals, and attendance workflows.`}
        onSearchChange={setSearchQuery}
        searchValue={searchQuery}
        searchPlaceholder="Search members, email, phone or ID..."
      />
      <VStack align="stretch" gap={6} pb={8}>


        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={5}>
              <Flex
                align={{ base: "start", md: "center" }}
                justify="space-between"
                direction={{ base: "column", md: "row" }}
                gap={4}
                p={4}
                borderRadius="2xl"
                bg={panelBg}
                border="1px solid"
                borderColor={borderColor}
              >
                <HStack gap={2}>
                  <Circle size="9" bg="blue.500/10" color="blue.500">
                    <LuFilter size={16} />
                  </Circle>
                  <VStack align="start" gap={0}>
                    <Text fontWeight="900" color="app.text.primary">
                      Directory
                    </Text>
                    <Text fontSize="xs" color={muted} fontWeight="700">
                      Showing {filteredMembers.length} matching records
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={2} flexWrap="wrap">
                  <FilterButton label="All" active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
                  <FilterButton label="Active" active={activeFilter === "active"} onClick={() => setActiveFilter("active")} />
                  <FilterButton label="Attention" active={activeFilter === "attention"} onClick={() => setActiveFilter("attention")} />
                  <FilterButton label="Frozen" active={activeFilter === "frozen"} onClick={() => setActiveFilter("frozen")} />
                </HStack>
              </Flex>

              {loading ? (
                <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} gap={4}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Skeleton key={item} height="238px" borderRadius="2xl" />
                  ))}
                </SimpleGrid>
              ) : filteredMembers.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, "2xl": 3 }} gap={4}>
                  {filteredMembers.map((member) => (
                    <MemberTile
                      key={member._id}
                      member={member}
                      onClick={(id) => navigateTo(`memberDetails/${id}`)}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Flex
                  direction="column"
                  align="center"
                  justify="center"
                  py={20}
                  gap={4}
                  borderRadius="2xl"
                  bg={panelBg}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Circle size="16" bg="blue.500/10" color="blue.500">
                    <LuUsers size={30} />
                  </Circle>
                  <VStack gap={1}>
                    <Heading size="sm" fontWeight="900">
                      No members found
                    </Heading>
                    <Text fontSize="sm" color={muted} fontWeight="600">
                      Try a different search, clear the filter, or enroll a new member.
                    </Text>
                  </VStack>
                </Flex>
              )}
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="sm" fontWeight="900">
                        Priority Queue
                      </Heading>
                      <Text fontSize="xs" color={muted} fontWeight="700">
                        Members needing renewal or staff review
                      </Text>
                    </VStack>
                    <Badge colorPalette="orange" borderRadius="full" variant="solid">
                      {membersRequiringAttention.length}
                    </Badge>
                  </HStack>

                  <VStack align="stretch" gap={3}>
                    {membersRequiringAttention.map((member) => {
                      const name = getMemberName(member.data);
                      return (
                        <HStack
                          key={member._id}
                          p={3}
                          borderRadius="xl"
                          bg="orange.500/10"
                          border="1px solid"
                          borderColor="orange.500/20"
                          gap={3}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{ transform: "translateX(2px)", bg: "orange.500/15" }}
                          onClick={() => navigateTo(`members/${member._meta.record_id}`)}
                        >
                          <Avatar.Root size="sm" shape="rounded">
                            <Avatar.Fallback fontWeight="900" color="orange.600">
                              {name.initials}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <VStack align="start" gap={0} flex={1} minW={0}>
                            <Text fontSize="sm" fontWeight="900" truncate>
                              {name.full}
                            </Text>
                            <Text fontSize="xs" color="orange.600" fontWeight="800">
                              Renewal due
                            </Text>
                          </VStack>
                          <LuArrowRight size={15} color="var(--chakra-colors-orange-500)" />
                        </HStack>
                      );
                    })}
                    {membersRequiringAttention.length === 0 && (
                      <Box p={4} borderRadius="xl" bg="green.500/10" border="1px solid" borderColor="green.500/20">
                        <Text fontSize="sm" color="green.600" fontWeight="800" textAlign="center">
                          All member accounts are current.
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </VStack>
              </Box>

              <Box p={5} borderRadius="2xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">
                    Retention Health
                  </Heading>
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color={muted} fontWeight="800">
                        Active ratio
                      </Text>
                      <Text fontSize="sm" color="green.500" fontWeight="900">
                        {metrics.retention}%
                      </Text>
                    </HStack>
                    <Box h="10px" bg="blackAlpha.100" borderRadius="full" overflow="hidden">
                      <Box h="full" w={`${metrics.retention}%`} bg="green.500" borderRadius="full" />
                    </Box>
                    <Separator opacity={0.35} />
                    <SimpleGrid columns={2} gap={3}>
                      <Box p={3} borderRadius="xl" bg="blue.500/10">
                        <Text fontSize="xs" color={muted} fontWeight="800">
                          Search result
                        </Text>
                        <Text fontSize="lg" fontWeight="900">
                          {filteredMembers.length}
                        </Text>
                      </Box>
                      <Box p={3} borderRadius="xl" bg="purple.500/10">
                        <Text fontSize="xs" color={muted} fontWeight="800">
                          Plans tracked
                        </Text>
                        <Text fontSize="lg" fontWeight="900">
                          {new Set(members.map((member) => member.data.plan || "Standard")).size}
                        </Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

ViewMember.displayName = "ViewMember";
export default ViewMember;
