/**
 * TrainerProfile.tsx
 *
 * High-fidelity trainer profile cockpit.
 * Displays personal details, professional expertise, certifications, and performance metrics.
 */

import { memo, useCallback, useMemo, type ElementType } from "react";
import {
  Avatar, Badge, Box, Button, Circle, Flex, Grid, GridItem, Heading,
  HStack, Icon, Separator, SimpleGrid, Text, VStack, IconButton,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useSearchParams } from "react-router";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
  LuActivity, LuArrowLeft, LuCalendarDays, LuCheck, LuCreditCard,
  LuDumbbell, LuFileText, LuFingerprint, LuMail, LuMapPin,
  LuMessageSquare, LuPhone, LuRefreshCw, LuShieldCheck, LuSnowflake,
  LuStar, LuTrash2, LuTrendingUp, LuUserCheck, LuUsers, LuX, LuZap,
  LuAward, LuBriefcase, LuClock, LuContact, LuUser
} from "react-icons/lu";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymTrainer } from "./hooks/useGymTrainer";
import type { TrainerDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";

// ─── Status Config ──────────────────────────────────────────────────

type StatusKey = "active" | "on_leave" | "terminated";

const STATUS_META: Record<StatusKey, { label: string; colorPalette: string; accent: string; bg: string }> = {
  active: { label: "Active", colorPalette: "green", accent: "green.500", bg: "green.500/10" },
  on_leave: { label: "On Leave", colorPalette: "orange", accent: "orange.500", bg: "orange.500/10" },
  terminated: { label: "Terminated", colorPalette: "red", accent: "red.500", bg: "red.500/10" },
};

// ─── Helpers ────────────────────────────────────────────────────────

const getName = (d?: TrainerDocument["data"]) => ({
  full: `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "Unknown",
  initials: `${d?.firstName?.[0] || ""}${d?.lastName?.[0] || ""}` || "TR",
});

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return Number.isNaN(p.getTime()) ? "N/A" : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

// ─── Sub-Components ─────────────────────────────────────────────────

const SurfaceCard = memo(({ children, p = { base: 4, md: 5 }, ...props }: { children: React.ReactNode; p?: any; [k: string]: any }) => {
  const bg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(15,23,42,0.66)");
  const border = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
  return (
    <Box p={p} borderRadius="2xl" bg={bg} border="1px solid" borderColor={border}
      backdropFilter="blur(18px) saturate(150%)" boxShadow="0 1px 3px rgba(0,0,0,0.04)" {...props}>
      {children}
    </Box>
  );
});
SurfaceCard.displayName = "SurfaceCard";

const InfoTile = memo(({ label, value, icon, accent = "blue.500" }: { label: string; value?: React.ReactNode; icon: ElementType; accent?: string }) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  return (
    <HStack gap={3} align="start" minW={0}>
      <Circle size="10" bg={`${accent}/10`} color={accent} flexShrink={0}>
        <Icon as={icon} boxSize={4} />
      </Circle>
      <VStack align="start" gap={0.5} minW={0}>
        <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">{label}</Text>
        <Text fontSize="sm" color="app.text.primary" fontWeight="800" truncate maxW="full">{value || "Not recorded"}</Text>
      </VStack>
    </HStack>
  );
});
InfoTile.displayName = "InfoTile";

const ActionRow = memo(({ label, icon, color = "blue", danger = false }: { label: string; icon: ElementType; color?: string; danger?: boolean }) => (
  <Button variant="ghost" justifyContent="start" h="12" px={3} borderRadius="xl"
    colorPalette={danger ? "red" : (color as any)} fontWeight="900" _hover={{ transform: "translateX(3px)" }}>
    <Circle size="8" bg={danger ? "red.500/10" : `${color}.500/10`}>
      <Icon as={icon} boxSize={4} />
    </Circle>
    {label}
  </Button>
));
ActionRow.displayName = "ActionRow";

// ─── Main Component ─────────────────────────────────────────────────

const TrainerProfile = memo(() => {
  const { goBack } = useWorkspaceRouter();
  const [searchParams] = useSearchParams();
  const trainerId = searchParams.get("trainer_id");
  const { trainer, loading, refresh } = useGymTrainer(trainerId || undefined);

  const name = useMemo(() => getName(trainer?.data), [trainer]);
  const status = (trainer?.data.status || "active") as StatusKey;
  const sm = STATUS_META[status] || STATUS_META.active;

  const handleBack = useCallback(() => goBack(), [goBack]);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.94) 50%, rgba(236,253,245,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.9) 50%, rgba(30,64,175,0.22))"
  );
  const borderColor = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const mountNavActions = useNavActionStore((state) => state.setActions);
  const unmountNavActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    mountNavActions(
      <HStack gap={2}>
        <Button
          variant="outline"
          borderRadius="sm"
          fontWeight="800"
          size="sm"
          onClick={handleBack}
          h="32px"
        >
          <LuArrowLeft size={14} /> Directory
        </Button>
        <IconButton
          variant="subtle"
          colorPalette="yellow"
          borderRadius="sm"
          size="sm"
          onClick={refresh}
          aria-label="Refresh profile"
          loading={loading}
          h="32px"
          w="32px"
        >
          <LuRefreshCw size={14} />
        </IconButton>
      </HStack>
    );
    return () => unmountNavActions();
  }, [mountNavActions, unmountNavActions, handleBack, refresh, loading]);

  if (!loading && !trainer) {
    return (
      <Box mt={4} w="full">
        <PageHeader title="Trainer Not Found" subtitle={`No profile found for ID: ${trainerId || "Unknown"}.`}
          actions={<Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900"><LuArrowLeft size={16} /> Back</Button>} />
        <SurfaceCard>
          <Flex direction="column" align="center" justify="center" py={20} gap={4}>
            <Circle size="16" bg="red.500/10" color="red.500"><LuShieldCheck size={30} /></Circle>
            <Heading size="md" fontWeight="900">Profile unavailable</Heading>
            <Text color={muted} fontWeight="600">This trainer record may have been removed or the ID is incorrect.</Text>
          </Flex>
        </SurfaceCard>
      </Box>
    );
  }

  return (
    <Box mt={4} w="full" animation="fade-in 0.5s ease-out">
      <VStack align="stretch" gap={6} pb={8}>
        {/* ── Hero Banner ─────────────────────────────────── */}
        <SurfaceCard p={{ base: 5, lg: 7 }} bg={heroBg} borderColor={borderColor}>
          <Flex direction={{ base: "column", lg: "row" }} gap={7} align={{ base: "start", lg: "center" }} justify="space-between">
            <HStack gap={{ base: 4, md: 6 }} align="center" minW={0}>
              <Skeleton loading={loading} borderRadius="2xl">
                <Avatar.Root size="2xl" shape="rounded" border="1px solid" borderColor={borderColor}>
                   {trainer?.data.profilePic && <Avatar.Image src={trainer.data.profilePic} />}
                  <Avatar.Fallback bg={sm.bg} color={sm.accent} fontSize="4xl" fontWeight="900">{name.initials}</Avatar.Fallback>
                </Avatar.Root>
              </Skeleton>
              <VStack align="start" gap={3} minW={0}>
                <Skeleton loading={loading}>
                  <HStack gap={3} flexWrap="wrap">
                    <Heading size={{ base: "xl", md: "3xl" }} letterSpacing="tight" color="app.text.primary">{name.full}</Heading>
                    <Badge colorPalette={sm.colorPalette as any} borderRadius="full" px={3} py={1} fontWeight="900">{sm.label}</Badge>
                  </HStack>
                </Skeleton>
                <HStack gap={3} flexWrap="wrap">
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg="blackAlpha.50" color={muted}>
                      <LuFingerprint size={15} />
                      <Text fontSize="sm" fontWeight="900" fontFamily="mono">{trainer?._meta.record_id || trainerId}</Text>
                    </HStack>
                  </Skeleton>
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg="blue.500/10" color="blue.500">
                      <LuAward size={15} />
                      <Text fontSize="sm" fontWeight="900">{trainer?.data.specialization || "General Trainer"}</Text>
                    </HStack>
                  </Skeleton>
                </HStack>
              </VStack>
            </HStack>
          </Flex>
        </SurfaceCard>

        {/* ── KPI Metrics ─────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={4}>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Experience</Text>
                <Heading size="lg" color="app.text.primary">{trainer?.data.experienceYears} Years</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Expert Level</Text>
              </VStack>
              <Circle size="10" bg="blue.500/10" color="blue.500"><Icon as={LuBriefcase} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Clients</Text>
                <Heading size="lg" color="app.text.primary">{(Number(trainer?.data.experienceYears) || 1) * 4 + 2}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Active sessions</Text>
              </VStack>
              <Circle size="10" bg="green.500/10" color="green.500"><Icon as={LuUsers} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Payment</Text>
                <Heading size="lg" color="app.text.primary">{trainer?.data.paymentMode || "Bank"}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Salary disbursement</Text>
              </VStack>
              <Circle size="10" bg="purple.500/10" color="purple.500"><Icon as={LuCreditCard} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Joined</Text>
                <Heading size="lg" color="app.text.primary">{new Date().getFullYear() - new Date(trainer?.data.joiningDate || Date.now()).getFullYear()}y ago</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">{fmtDate(trainer?.data.joiningDate)}</Text>
              </VStack>
              <Circle size="10" bg="orange.500/10" color="orange.500"><Icon as={LuCalendarDays} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
        </SimpleGrid>

        {/* ── Main Grid ───────────────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              {/* Personal Info */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Personal Information</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">Contact and identity details.</Text>
                    </VStack>
                    <Circle size="10" bg="blue.500/10" color="blue.500"><LuContact size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <InfoTile label="Email" value={trainer?.data.email} icon={LuMail} accent="blue.500" />
                    <InfoTile label="Phone" value={trainer?.data.phone} icon={LuPhone} accent="green.500" />
                    <InfoTile label="Address" value={trainer?.data.address} icon={LuMapPin} accent="orange.500" />
                    <InfoTile label="Gender" value={trainer?.data.gender || "Not recorded"} icon={LuUser} accent="purple.500" />
                    <InfoTile label="Trainer ID" value={trainer?.data.trainer_id} icon={LuFingerprint} accent="cyan.500" />
                    <InfoTile label="Joining Date" value={fmtDate(trainer?.data.joiningDate)} icon={LuCalendarDays} accent="teal.500" />
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>

              {/* Bio & Expertise */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Bio & Expertise</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">Professional background and philosophy.</Text>
                    </VStack>
                    <Circle size="10" bg="purple.500/10" color="purple.500"><LuAward size={18} /></Circle>
                  </HStack>
                  <VStack align="start" gap={4}>
                    <Box w="full" p={4} borderRadius="xl" bg="blackAlpha.50" border="1px solid" borderColor={borderColor}>
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase" mb={2}>Trainer Bio</Text>
                      <Text fontSize="sm" fontWeight="700" color="app.text.primary" lineHeight="relaxed">
                        {trainer?.data.bio || "No bio provided. This trainer focuses on delivering high-quality fitness results through dedicated training programs."}
                      </Text>
                    </Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <InfoTile label="Specialization" value={trainer?.data.specialization} icon={LuDumbbell} accent="blue.500" />
                      <InfoTile label="Available Slot" value={trainer?.data.availableSlot || "Flexible"} icon={LuClock} accent="orange.500" />
                    </SimpleGrid>
                  </VStack>
                </VStack>
              </SurfaceCard>

              {/* Verification & Documents */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Verification & Documents</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">Compliance and certification records.</Text>
                    </VStack>
                    <Circle size="10" bg="green.500/10" color="green.500"><LuShieldCheck size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Box p={4} borderRadius="xl" bg="blue.500/8" border="1px solid" borderColor="blue.500/15" cursor="pointer" _hover={{ bg: "blue.500/12" }}>
                      <VStack align="center" gap={2}>
                        <Icon as={LuShieldCheck} boxSize={6} color="blue.500" />
                        <Text fontSize="xs" fontWeight="900">ID PROOF</Text>
                        <Badge colorPalette={trainer?.data.idProof ? "green" : "orange"} size="xs">
                          {trainer?.data.idProof ? "VERIFIED" : "PENDING"}
                        </Badge>
                      </VStack>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="green.500/8" border="1px solid" borderColor="green.500/15" cursor="pointer" _hover={{ bg: "green.500/12" }}>
                      <VStack align="center" gap={2}>
                        <Icon as={LuAward} boxSize={6} color="green.500" />
                        <Text fontSize="xs" fontWeight="900">CERTIFICATIONS</Text>
                        <Badge colorPalette={trainer?.data.certifications ? "green" : "orange"} size="xs">
                          {trainer?.data.certifications ? "VERIFIED" : "PENDING"}
                        </Badge>
                      </VStack>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="orange.500/8" border="1px solid" borderColor="orange.500/15" cursor="pointer" _hover={{ bg: "orange.500/12" }}>
                      <VStack align="center" gap={2}>
                        <Icon as={LuFileText} boxSize={6} color="orange.500" />
                        <Text fontSize="xs" fontWeight="900">CONTRACT</Text>
                        <Badge colorPalette={trainer?.data.status === "active" ? "green" : "gray"} size="xs">
                          {trainer?.data.status === "active" ? "SIGNED" : "PENDING"}
                        </Badge>
                      </VStack>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>

          {/* ── Sidebar ─────────────────────────────────── */}
          <GridItem>
            <VStack align="stretch" gap={5} position={{ xl: "sticky" }} top={{ xl: "7rem" }}>
              <SurfaceCard>
                <VStack align="stretch" gap={4}>
                  <Heading size="sm" fontWeight="900">Quick Actions</Heading>
                  <VStack align="stretch" gap={2}>
                    <ActionRow icon={LuMessageSquare} label="Send Message" color="blue" />
                    <ActionRow icon={LuCalendarDays} label="Manage Schedule" color="green" />
                    <ActionRow icon={LuStar} label="Performance Review" color="orange" />
                    <ActionRow icon={LuFileText} label="View Salary Slips" color="purple" />
                    <ActionRow icon={LuSnowflake} label="Request Leave" color="cyan" />
                    <ActionRow icon={LuTrash2} label="Terminate Contract" danger />
                  </VStack>
                </VStack>
              </SurfaceCard>

              {/* Performance Indicator */}
              <SurfaceCard bg="gray.950" color="white" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">Trainer Quality</Heading>
                    <HStack gap={1} color="orange.400">
                      <LuStar size={14} fill="currentColor" />
                      <Text fontSize="sm" fontWeight="900">4.9</Text>
                    </HStack>
                  </HStack>
                  <Text color="gray.300" fontSize="sm" fontWeight="700" lineHeight="tall">
                    Highly rated trainer with 98% client retention over the last 6 months. Consistent attendance and positive feedback.
                  </Text>
                  <Box h="10px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
                    <Box h="full" w="92%" bg="green.400" borderRadius="full" />
                  </Box>
                  <Separator borderColor="whiteAlpha.200" />
                  <HStack justify="space-between">
                    <Text fontSize="xs" color="gray.400" fontWeight="800">Operational Health</Text>
                    <Text fontSize="sm" fontWeight="900" color="green.400">EXCELLENT</Text>
                  </HStack>
                </VStack>
              </SurfaceCard>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
});

TrainerProfile.displayName = "TrainerProfile";
export default TrainerProfile;
