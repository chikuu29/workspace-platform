/**
 * MemberDetail.tsx
 *
 * Modern SaaS member profile cockpit with enriched subscription data.
 * Displays member info, active subscription, plan features, and history.
 */

import { memo, useCallback, useMemo, type ElementType } from "react";
import {
  Avatar, Badge, Box, Button, Circle, Flex, Grid, GridItem, Heading,
  HStack, Icon, Separator, SimpleGrid, Text, VStack, IconButton,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useParams } from "react-router";
import {
  LuActivity, LuArrowLeft, LuCalendarDays, LuCheck, LuCreditCard,
  LuDumbbell, LuFileText, LuFingerprint, LuMail, LuMapPin,
  LuMessageSquare, LuPhone, LuRefreshCw, LuShieldCheck, LuSnowflake,
  LuStar, LuTrash2, LuTrendingUp, LuUserCheck, LuUsers, LuX, LuZap,
} from "react-icons/lu";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymMember } from "./hooks/useGymMember";
import type { MemberDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";
import { useGymNavigation } from "./utils/useGymNavigation";

// ─── Status Config ──────────────────────────────────────────────────

type StatusKey = "active" | "attention" | "frozen";

const STATUS_META: Record<StatusKey, { label: string; colorPalette: string; accent: string; bg: string }> = {
  active: { label: "Active", colorPalette: "green", accent: "green.500", bg: "green.500/10" },
  attention: { label: "Needs attention", colorPalette: "orange", accent: "orange.500", bg: "orange.500/10" },
  frozen: { label: "Frozen", colorPalette: "blue", accent: "blue.500", bg: "blue.500/10" },
};

// ─── Helpers ────────────────────────────────────────────────────────

const getName = (d?: MemberDocument["data"]) => ({
  full: `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "Unknown",
  initials: `${d?.firstName?.[0] || ""}${d?.lastName?.[0] || ""}` || "GM",
});

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return Number.isNaN(p.getTime()) ? "N/A" : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// ─── Sub-Components ─────────────────────────────────────────────────

const SurfaceCard = memo(({ children, p = { base: 4, md: 5 }, ...props }: { children: React.ReactNode; p?: any;[k: string]: any }) => {
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

const MemberDetail = memo(() => {
  const navigate = useNavigate();
  const { params: memberId } = useParams();
  const { member, loading, refresh } = useGymMember(memberId);
  
  const { 
    goToSelectPlan, 
    goBack 
  } = useGymNavigation();

  const name = useMemo(() => getName(member?.data), [member]);
  const status = (member?.data.status || "frozen") as StatusKey;
  const sm = STATUS_META[status] || STATUS_META.frozen;
  const sub = member?.subscription;
  const planDetails = member?.plan_details;
  const history = member?.subscription_history || [];

  const handleBack = useCallback(() => goBack(), [goBack]);

  const handleAssignPlan = useCallback(() => {
    if (!memberId) return;
    goToSelectPlan(memberId);
  }, [goToSelectPlan, memberId]);

  // ── Days remaining calc ──
  const daysRemaining = useMemo(() => {
    if (!sub?.end_date) return null;
    const end = new Date(sub.end_date);
    if (Number.isNaN(end.getTime())) return null;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  }, [sub]);

  const heroBg = useColorModeValue(
    "linear-gradient(135deg, rgba(239,246,255,0.98), rgba(255,255,255,0.94) 50%, rgba(236,253,245,0.9))",
    "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.9) 50%, rgba(6,78,59,0.42))"
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

  // ── Not found ──
  if (!loading && !member) {
    return (
      <Box mt={4} w="full">
        <PageHeader title="Member Not Found" subtitle={`No profile found for ${memberId || "this record"}.`}
          actions={<Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900"><LuArrowLeft size={16} /> Back</Button>} />
        <SurfaceCard>
          <Flex direction="column" align="center" justify="center" py={20} gap={4}>
            <Circle size="16" bg="red.500/10" color="red.500"><LuShieldCheck size={30} /></Circle>
            <Heading size="md" fontWeight="900">Profile unavailable</Heading>
            <Text color={muted} fontWeight="600">The member may have been archived or deleted.</Text>
          </Flex>
        </SurfaceCard>
      </Box>
    );
  }

  return (
    <Box mt={4} w="full" animation="fade-in 0.5s ease-out">
      {/* <PageHeader title="Member Profile"
        subtitle={loading ? "Loading..." : `Operational profile for ${name.full}.`}
        actions={
          <HStack gap={3}>
            <Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900"><LuArrowLeft size={16} /> Directory</Button>
            <Button variant="outline" borderRadius="xl" onClick={refresh} loading={loading} fontWeight="900"><LuRefreshCw size={16} /> Refresh</Button>
          </HStack>
        }
      /> */}

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── Hero Banner ─────────────────────────────────── */}
        <SurfaceCard p={{ base: 5, lg: 7 }} bg={heroBg} borderColor={borderColor}>
          <Flex direction={{ base: "column", lg: "row" }} gap={7} align={{ base: "start", lg: "center" }} justify="space-between">
            <HStack gap={{ base: 4, md: 6 }} align="center" minW={0}>
              <Skeleton loading={loading} borderRadius="2xl">
                <Avatar.Root size="2xl" shape="rounded" border="1px solid" borderColor={borderColor}>
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
                      <Text fontSize="sm" fontWeight="900" fontFamily="mono">{member?._meta.record_id || memberId}</Text>
                    </HStack>
                  </Skeleton>
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg={member?.has_plan ? sm.bg : "red.500/10"}
                      color={member?.has_plan ? sm.accent : "red.500"}>
                      <LuDumbbell size={15} />
                      <Text fontSize="sm" fontWeight="900">
                        {member?.has_plan ? (sub?.plan_name || member?.data.plan || "Active Plan") : "No Plan"}
                      </Text>
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
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Plan</Text>
                <Heading size="lg" color="app.text.primary">{sub?.plan_name || "None"}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">{sub ? fmtCurrency(sub.price, sub.currency) + " / " + sub.billing_cycle : "Not subscribed"}</Text>
              </VStack>
              <Circle size="10" bg="blue.500/10" color="blue.500"><Icon as={LuCreditCard} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Expires</Text>
                <Heading size="lg" color="app.text.primary">{daysRemaining !== null ? `${daysRemaining}d` : "N/A"}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">{sub ? fmtDate(sub.end_date) : "No active sub"}</Text>
              </VStack>
              <Circle size="10" bg="orange.500/10" color="orange.500"><Icon as={LuCalendarDays} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Payment</Text>
                <Heading size="lg" color="app.text.primary">{sub?.is_paid ? "Paid" : "Unpaid"}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">{sub ? fmtCurrency(sub.price, sub.currency) : "No dues"}</Text>
              </VStack>
              <Circle size="10" bg={sub?.is_paid ? "green.500/10" : "red.500/10"} color={sub?.is_paid ? "green.500" : "red.500"}>
                <Icon as={sub?.is_paid ? LuCheck : LuX} boxSize={4} />
              </Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Status</Text>
                <Heading size="lg" color="app.text.primary">{sm.label}</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Joined {fmtDate(member?._meta.created?.at)}</Text>
              </VStack>
              <Circle size="10" bg={sm.bg} color={sm.accent}><Icon as={LuUserCheck} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
        </SimpleGrid>

        {/* ── Main Grid ───────────────────────────────────── */}
        <Grid templateColumns={{ base: "1fr", xl: "minmax(0, 1fr) 380px" }} gap={{ base: 6, xl: 8 }}>
          <GridItem minW={0}>
            <VStack align="stretch" gap={6}>
              {/* Contact & Identity */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Contact & Identity</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">Primary member information.</Text>
                    </VStack>
                    <Circle size="10" bg="blue.500/10" color="blue.500"><LuUsers size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <InfoTile label="Email" value={member?.data.email} icon={LuMail} accent="blue.500" />
                    <InfoTile label="Phone" value={member?.data.phone} icon={LuPhone} accent="green.500" />
                    <InfoTile label="Address" value={member?.data.address} icon={LuMapPin} accent="orange.500" />
                    <InfoTile label="Gender" value={member?.data.gender || "Not recorded"} icon={LuShieldCheck} accent="purple.500" />
                    <InfoTile label="Member ID" value={member?.data.member_id} icon={LuFingerprint} accent="cyan.500" />
                    <InfoTile label="Joined" value={fmtDate(member?._meta.created?.at)} icon={LuCalendarDays} accent="teal.500" />
                  </SimpleGrid>
                </VStack>
              </SurfaceCard>

              {/* Active Subscription */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Active Subscription</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">
                        {member?.has_plan ? "Current plan and billing details." : "No active subscription."}
                      </Text>
                    </VStack>
                    <Badge colorPalette={member?.has_plan ? "green" : "red"} borderRadius="full" px={3} fontWeight="900">
                      {member?.has_plan ? "Active" : "None"}
                    </Badge>
                  </HStack>

                  {sub ? (
                    <VStack align="stretch" gap={4}>
                      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                        <Box p={4} borderRadius="xl" bg="blue.500/8" border="1px solid" borderColor="blue.500/15">
                          <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Plan</Text>
                          <Text mt={1} fontSize="lg" fontWeight="900">{sub.plan_name}</Text>
                          <Text fontSize="xs" color={muted} fontWeight="700">{sub.billing_cycle}</Text>
                        </Box>
                        <Box p={4} borderRadius="xl" bg="green.500/8" border="1px solid" borderColor="green.500/15">
                          <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Price</Text>
                          <Text mt={1} fontSize="lg" fontWeight="900">{fmtCurrency(sub.price, sub.currency)}</Text>
                          <Text fontSize="xs" color={muted} fontWeight="700">
                            {sub.is_paid ? "✓ Payment received" : "⚠ Payment pending"}
                          </Text>
                        </Box>
                        <Box p={4} borderRadius="xl" bg="orange.500/8" border="1px solid" borderColor="orange.500/15">
                          <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Validity</Text>
                          <Text mt={1} fontSize="lg" fontWeight="900">{daysRemaining !== null ? `${daysRemaining} days` : "N/A"}</Text>
                          <Text fontSize="xs" color={muted} fontWeight="700">{fmtDate(sub.start_date)} → {fmtDate(sub.end_date)}</Text>
                        </Box>
                      </SimpleGrid>

                      {/* Plan Features */}
                      {planDetails?.features && planDetails.features.length > 0 && (
                        <Box p={4} borderRadius="xl" bg="purple.500/6" border="1px solid" borderColor="purple.500/12">
                          <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase" mb={3}>Plan Features</Text>
                          <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                            {planDetails.features.map((f) => (
                              <HStack key={f} gap={2}>
                                <Circle size="5" bg="purple.500/15" color="purple.500"><LuCheck size={10} /></Circle>
                                <Text fontSize="sm" fontWeight="700">{f}</Text>
                              </HStack>
                            ))}
                          </SimpleGrid>
                        </Box>
                      )}
                    </VStack>
                  ) : (
                    <Flex direction="column" align="center" py={10} gap={3}>
                      <Circle size="14" bg="red.500/10" color="red.500"><LuCreditCard size={28} /></Circle>
                      <Text fontWeight="900" color="red.500">No Active Subscription</Text>
                      <Text fontSize="sm" color={muted} fontWeight="600">Enroll this member in a plan to activate their account.</Text>
                      <Button 
                        colorPalette="blue" 
                        borderRadius="xl" 
                        mt={2} 
                        fontWeight="900"
                        onClick={handleAssignPlan}
                      >
                        <LuZap size={16} /> Assign Plan
                      </Button>
                    </Flex>
                  )}
                </VStack>
              </SurfaceCard>

              {/* Subscription History */}
              {history.length > 0 && (
                <SurfaceCard>
                  <VStack align="stretch" gap={4}>
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Heading size="md" fontWeight="900">Subscription History</Heading>
                        <Text fontSize="sm" color={muted} fontWeight="700">{history.length} record(s)</Text>
                      </VStack>
                      <Circle size="10" bg="purple.500/10" color="purple.500"><LuTrendingUp size={18} /></Circle>
                    </HStack>
                    <VStack align="stretch" gap={3}>
                      {history.map((h, i) => {
                        const isActive = h.status === "active";
                        const hAccent = isActive ? "green" : h.status === "expired" ? "orange" : "gray";
                        return (
                          <HStack key={h.subscription_id || i} p={3} borderRadius="xl"
                            bg={`${hAccent}.500/6`} border="1px solid" borderColor={`${hAccent}.500/12`}
                            gap={3} justify="space-between">
                            <HStack gap={3} minW={0}>
                              <Circle size="8" bg={`${hAccent}.500/12`} color={`${hAccent}.500`} fontWeight="900" fontSize="xs">
                                {i + 1}
                              </Circle>
                              <VStack align="start" gap={0} minW={0}>
                                <Text fontSize="sm" fontWeight="900" truncate>{h.plan_name}</Text>
                                <Text fontSize="xs" color={muted} fontWeight="700">
                                  {fmtDate(h.start_date)} → {fmtDate(h.end_date)}
                                </Text>
                              </VStack>
                            </HStack>
                            <HStack gap={2}>
                              <Badge colorPalette={hAccent} variant="subtle" borderRadius="full" fontSize="2xs" fontWeight="900">
                                {h.status}
                              </Badge>
                              <Badge colorPalette={h.is_paid ? "green" : "red"} variant="subtle" borderRadius="full" fontSize="2xs" fontWeight="900">
                                {h.is_paid ? "Paid" : "Unpaid"}
                              </Badge>
                              <Text fontSize="xs" fontWeight="900" color="app.text.primary">
                                {fmtCurrency(h.price, sub?.currency)}
                              </Text>
                            </HStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  </VStack>
                </SurfaceCard>
              )}

              {/* Fitness */}
              <SurfaceCard>
                <VStack align="stretch" gap={5}>
                  <HStack justify="space-between">
                    <VStack align="start" gap={0}>
                      <Heading size="md" fontWeight="900">Fitness Snapshot</Heading>
                      <Text fontSize="sm" color={muted} fontWeight="700">Goals and engagement signals.</Text>
                    </VStack>
                    <Circle size="10" bg="cyan.500/10" color="cyan.500"><LuActivity size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    <Box p={4} borderRadius="xl" bg="blue.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Goal</Text>
                      <Text mt={1} fontSize="md" fontWeight="900">{member?.data.fitnessGoals || "General fitness"}</Text>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="green.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Attendance</Text>
                      <Text mt={1} fontSize="md" fontWeight="900">Consistent</Text>
                    </Box>
                    <Box p={4} borderRadius="xl" bg="purple.500/10">
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Upsell Fit</Text>
                      <Text mt={1} fontSize="md" fontWeight="900">Medium</Text>
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
                    <ActionRow icon={LuZap} label="Renew Membership" color="green" />
                    <ActionRow icon={LuSnowflake} label="Freeze Account" color="cyan" />
                    <ActionRow icon={LuFileText} label="Export Profile" color="purple" />
                    <ActionRow icon={LuTrash2} label="Deactivate Member" danger />
                  </VStack>
                </VStack>
              </SurfaceCard>

              {/* Account Health */}
              <SurfaceCard bg="gray.950" color="white" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">Account Health</Heading>
                    <Badge colorPalette={sm.colorPalette as any} borderRadius="full">{sm.label}</Badge>
                  </HStack>
                  <Text color="gray.300" fontSize="sm" fontWeight="700" lineHeight="tall">
                    {status === "attention"
                      ? "This member needs staff follow-up. Review renewal status and contact history."
                      : status === "frozen"
                        ? "No active subscription. Assign a plan to reactivate this account."
                        : "This profile is healthy and ready for regular member operations."}
                  </Text>
                  <Box h="10px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
                    <Box h="full" w={status === "active" ? "88%" : status === "attention" ? "54%" : "22%"}
                      bg={sm.accent} borderRadius="full" transition="width 0.5s ease" />
                  </Box>
                  {daysRemaining !== null && (
                    <>
                      <Separator borderColor="whiteAlpha.200" />
                      <HStack justify="space-between">
                        <Text fontSize="xs" color="gray.400" fontWeight="800">Days Remaining</Text>
                        <Text fontSize="sm" fontWeight="900" color={daysRemaining <= 7 ? "orange.400" : "green.400"}>
                          {daysRemaining} days
                        </Text>
                      </HStack>
                    </>
                  )}
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
