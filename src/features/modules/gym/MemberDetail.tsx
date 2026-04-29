/**
 * MemberDetail.tsx
 *
 * Modern SaaS member profile cockpit for the gym app.
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
  Skeleton,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useParams } from "react-router";
import {
  LuActivity,
  LuArrowLeft,
  LuCalendarDays,
  LuCreditCard,
  LuDumbbell,
  LuFileText,
  LuFingerprint,
  LuMail,
  LuMapPin,
  LuMessageSquare,
  LuPhone,
  LuRefreshCw,
  LuShieldCheck,
  LuSnowflake,
  LuTrash2,
  LuTrendingUp,
  LuUserCheck,
  LuUsers,
  LuZap,
} from "react-icons/lu";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymMember } from "./hooks/useGymMember";
import { MemberDocument } from "./types/Gym.types";

type StatusKey = "active" | "attention" | "frozen";

const statusMeta: Record<StatusKey, { label: string; colorPalette: string; accent: string; bg: string }> = {
  active: {
    label: "Active",
    colorPalette: "green",
    accent: "green.500",
    bg: "green.500/10",
  },
  attention: {
    label: "Needs attention",
    colorPalette: "orange",
    accent: "orange.500",
    bg: "orange.500/10",
  },
  frozen: {
    label: "Frozen",
    colorPalette: "blue",
    accent: "blue.500",
    bg: "blue.500/10",
  },
};

const getMemberName = (data?: MemberDocument["data"]) => {
  const first = data?.memberFirstName || data?.firstName || "";
  const last = data?.memberLastName || data?.lastName || "";

  return {
    full: `${first} ${last}`.trim() || "Unknown Member",
    initials: `${first?.[0] || ""}${last?.[0] || ""}` || "GM",
  };
};

const getContact = (data?: MemberDocument["data"]) => ({
  email: data?.memberEmail || data?.email || "No email recorded",
  phone: data?.memberPhone || data?.phone || "No phone recorded",
  address: data?.memberAddress || data?.address || "Address not recorded",
});

const formatDate = (date?: string) => {
  if (!date) return "Not recorded";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Not recorded";

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
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

const InfoTile = memo(({
  label,
  value,
  icon,
  accent = "blue.500",
}: {
  label: string;
  value?: React.ReactNode;
  icon: ElementType;
  accent?: string;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <HStack gap={3} align="start" minW={0}>
      <Circle size="10" bg={`${accent}/10`} color={accent} flexShrink={0}>
        <Icon as={icon} boxSize={4} />
      </Circle>
      <VStack align="start" gap={0.5} minW={0}>
        <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
          {label}
        </Text>
        <Text fontSize="sm" color="app.text.primary" fontWeight="800" truncate maxW="full">
          {value || "Not recorded"}
        </Text>
      </VStack>
    </HStack>
  );
});
InfoTile.displayName = "InfoTile";

const MetricTile = memo(({
  label,
  value,
  caption,
  icon,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  icon: ElementType;
  accent: string;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <SurfaceCard p={4}>
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={0}>
            <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
              {label}
            </Text>
            <Heading size="lg" color="app.text.primary">
              {value}
            </Heading>
          </VStack>
          <Circle size="10" bg={`${accent}/10`} color={accent}>
            <Icon as={icon} boxSize={4} />
          </Circle>
        </HStack>
        <Text fontSize="xs" color={muted} fontWeight="700">
          {caption}
        </Text>
      </VStack>
    </SurfaceCard>
  );
});
MetricTile.displayName = "MetricTile";

const ActionRow = memo(({
  label,
  icon,
  color = "blue",
  danger = false,
}: {
  label: string;
  icon: ElementType;
  color?: string;
  danger?: boolean;
}) => (
  <Button
    variant="ghost"
    justifyContent="start"
    h="12"
    px={3}
    borderRadius="xl"
    colorPalette={danger ? "red" : (color as any)}
    fontWeight="900"
    _hover={{ transform: "translateX(3px)" }}
  >
    <Circle size="8" bg={danger ? "red.500/10" : `${color}.500/10`}>
      <Icon as={icon} boxSize={4} />
    </Circle>
    {label}
  </Button>
));
ActionRow.displayName = "ActionRow";

const MemberDetail = memo(() => {
  const navigate = useNavigate();
  const { params } = useParams();

  const { member, loading, refresh } = useGymMember(params);

  const name = useMemo(() => getMemberName(member?.data), [member]);
  const contact = useMemo(() => getContact(member?.data), [member]);
  const status = (member?.data.status || "active") as StatusKey;
  const currentStatus = statusMeta[status] || statusMeta.active;

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.94) 50%, rgba(236,253,245,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.9) 50%, rgba(6,78,59,0.42))"
  );
  const borderColor = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  if (!loading && !member) {
    return (
      <Box mt={4} w="full">
        <PageHeader
          title="Member Not Found"
          subtitle={`No active member profile was found for ${params || "this record"}.`}
          actions={
            <Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900">
              <LuArrowLeft size={16} /> Back
            </Button>
          }
        />
        <SurfaceCard>
          <Flex direction="column" align="center" justify="center" py={20} gap={4}>
            <Circle size="16" bg="red.500/10" color="red.500">
              <LuShieldCheck size={30} />
            </Circle>
            <VStack gap={1} textAlign="center">
              <Heading size="md" fontWeight="900">
                Profile unavailable
              </Heading>
              <Text color={muted} fontWeight="600">
                The member may have been archived, deleted, or moved out of this organization.
              </Text>
            </VStack>
          </Flex>
        </SurfaceCard>
      </Box>
    );
  }

  return (
    <Box mt={4} w="full" animation="fade-in 0.5s ease-out">
      <PageHeader
        title="Member Profile"
        subtitle={loading ? "Loading member profile..." : `Operational profile for ${name.full}.`}
        actions={
          <HStack gap={3}>
            <Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900">
              <LuArrowLeft size={16} /> Directory
            </Button>
            <Button variant="outline" borderRadius="xl" onClick={refresh} loading={loading} fontWeight="900">
              <LuRefreshCw size={16} /> Refresh
            </Button>
          </HStack>
        }
      />

      <VStack align="stretch" gap={6} pb={8}>
        <SurfaceCard p={{ base: 5, lg: 7 }} bg={heroBg} borderColor={borderColor}>
          <Flex direction={{ base: "column", lg: "row" }} gap={7} align={{ base: "start", lg: "center" }} justify="space-between">
            <HStack gap={{ base: 4, md: 6 }} align="center" minW={0}>
              <Skeleton loading={loading} borderRadius="2xl">
                <Avatar.Root size="2xl" shape="rounded" border="1px solid" borderColor={borderColor}>
                  <Avatar.Fallback bg={currentStatus.bg} color={currentStatus.accent} fontSize="4xl" fontWeight="900">
                    {name.initials}
                  </Avatar.Fallback>
                </Avatar.Root>
              </Skeleton>
              <VStack align="start" gap={3} minW={0}>
                <Skeleton loading={loading}>
                  <HStack gap={3} flexWrap="wrap">
                    <Heading size={{ base: "xl", md: "3xl" }} letterSpacing="tight" color="app.text.primary">
                      {name.full}
                    </Heading>
                    <Badge colorPalette={currentStatus.colorPalette as any} borderRadius="full" px={3} py={1} fontWeight="900">
                      {currentStatus.label}
                    </Badge>
                  </HStack>
                </Skeleton>
                <HStack gap={3} flexWrap="wrap">
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg="blackAlpha.50" color={muted}>
                      <LuFingerprint size={15} />
                      <Text fontSize="sm" fontWeight="900" fontFamily="mono">
                        {member?._meta.record_id || params}
                      </Text>
                    </HStack>
                  </Skeleton>
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg={currentStatus.bg} color={currentStatus.accent}>
                      <LuDumbbell size={15} />
                      <Text fontSize="sm" fontWeight="900">
                        {member?.data.plan || "Standard Plan"}
                      </Text>
                    </HStack>
                  </Skeleton>
                </HStack>
              </VStack>
            </HStack>

            <HStack gap={3} flexWrap="wrap">
              <Button colorPalette="blue" borderRadius="xl" fontWeight="900">
                <LuMessageSquare size={17} /> Message
              </Button>
              <Button variant="outline" borderRadius="xl" fontWeight="900">
                <LuFileText size={17} /> Export
              </Button>
            </HStack>
          </Flex>
        </SurfaceCard>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
          <MetricTile label="Membership" value={member?.data.plan || "Standard"} caption="Current assigned plan" icon={LuCreditCard} accent="blue.500" />
          <MetricTile label="Joined" value={formatDate(member?._meta.created?.at)} caption="Original enrollment date" icon={LuCalendarDays} accent="green.500" />
          <MetricTile label="Status" value={currentStatus.label} caption="Account operational state" icon={LuUserCheck} accent={currentStatus.accent} />
          <MetricTile label="Version" value={`v${member?._meta.version || 1}`} caption="Profile record revision" icon={LuTrendingUp} accent="purple.500" />
        </SimpleGrid>

        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 360px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">
                        Contact & Identity
                      </Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        Primary member information used across operations.
                      </Text>
                    </VStack>
                    <Circle size="10" bg="blue.500/10" color="blue.500">
                      <LuUsers size={18} />
                    </Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <InfoTile label="Email" value={contact.email} icon={LuMail} accent="blue.500" />
                    <InfoTile label="Phone" value={contact.phone} icon={LuPhone} accent="green.500" />
                    <InfoTile label="Address" value={contact.address} icon={LuMapPin} accent="orange.500" />
                    <InfoTile label="Gender" value={member?.data.memberGender || member?.data.gender || "Not recorded"} icon={LuShieldCheck} accent="purple.500" />
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>

              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">
                        Fitness Snapshot
                      </Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        Goals and engagement signals for coaching workflows.
                      </Text>
                    </VStack>
                    <Circle size="10" bg="cyan.500/10" color="cyan.500">
                      <LuActivity size={18} />
                    </Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Box p={4} borderRadius="xl" bg="blue.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
                        Goal
                      </Text>
                      <Text mt={1} fontSize="md" fontWeight="900">
                        {member?.data.fitnessGoals || "General fitness"}
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="green.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
                        Attendance
                      </Text>
                      <Text mt={1} fontSize="md" fontWeight="900">
                        Consistent
                      </Text>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="purple.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">
                        Upsell fit
                      </Text>
                      <Text mt={1} fontSize="md" fontWeight="900">
                        Medium
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              <SurfaceCard>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">
                    Quick Actions
                  </Heading>
                  <VStack align="stretch" gap={2}>
                    <ActionRow icon={LuMessageSquare} label="Send Message" color="blue" />
                    <ActionRow icon={LuZap} label="Renew Membership" color="green" />
                    <ActionRow icon={LuSnowflake} label="Freeze Account" color="cyan" />
                    <ActionRow icon={LuFileText} label="Export Profile" color="purple" />
                    <ActionRow icon={LuTrash2} label="Deactivate Member" danger />
                  </VStack>
                </VStack>
              </SurfaceCard>

              <SurfaceCard bg="gray.950" color="white" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">
                      Account Health
                    </Heading>
                    <Badge colorPalette={currentStatus.colorPalette as any} borderRadius="full">
                      {currentStatus.label}
                    </Badge>
                  </HStack>
                  <Text color="gray.300" fontSize="sm" fontWeight="700" lineHeight="tall">
                    {status === "attention"
                      ? "This member needs staff follow-up. Review renewal status and contact history."
                      : status === "frozen"
                        ? "This account is paused. Confirm reactivation terms before allowing check-ins."
                        : "This profile is healthy and ready for regular member operations."}
                  </Text>
                  <Box h="10px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
                    <Box
                      h="full"
                      w={status === "active" ? "88%" : status === "attention" ? "54%" : "32%"}
                      bg={currentStatus.accent}
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

MemberDetail.displayName = "MemberDetail";
export default MemberDetail;
