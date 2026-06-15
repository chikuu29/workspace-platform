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
import { toaster } from "@/components/ui/toaster";
import {
  Activity, ArrowLeft, CalendarDays, Check, CreditCard,
  Dumbbell, FileText, Fingerprint, Mail, MapPin,
  MessageSquare, Phone, RefreshCw, ShieldCheck, Snowflake,
  Star, Trash2, TrendingUp, UserCheck, Users, X, Zap,
  Award, Briefcase, Clock, Contact, User
} from "lucide-react";

import { PageHeader } from "@/core/components/PageHeader";
import { useGymTrainer } from "./hooks/useGymTrainer";
import type { TrainerDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useEffect } from "react";

// ─── Status Config ──────────────────────────────────────────────────

type StatusKey = "active" | "on_leave" | "terminated";

const STATUS_META: Record<StatusKey, { label: string; colorPalette: string; accent: string; bg: string; glowAnim: string }> = {
  active: { label: "Active", colorPalette: "green", accent: "green.500", bg: "green.500/10", glowAnim: "pulse-glow" },
  on_leave: { label: "On Leave", colorPalette: "orange", accent: "orange.500", bg: "orange.500/10", glowAnim: "pulse-glow-orange" },
  terminated: { label: "Terminated", colorPalette: "red", accent: "red.500", bg: "red.500/10", glowAnim: "pulse-glow-red" },
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

const SurfaceCard = memo(({ children, p = { base: 4, md: 5 }, bg = "app.card.bg", ...props }: { children: React.ReactNode; p?: any; bg?: string; [k: string]: any }) => {
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
        <Text fontSize="sm" color="app.text.primary" fontWeight="800">{value || "Not recorded"}</Text>
      </VStack>
    </HStack>
  );
});
InfoTile.displayName = "InfoTile";

const ActionRow = memo(({ label, icon, onClick, color = "blue", danger = false }: { label: string; icon: ElementType; onClick?: () => void; color?: string; danger?: boolean }) => {
  const hoverBg = useColorModeValue(
    danger ? "red.50" : `${color}.50`,
    danger ? "rgba(239, 68, 68, 0.08)" : `rgba(117, 81, 255, 0.08)`
  );
  const iconColor = danger ? "red.500" : `${color}.500`;
  const textColor = danger ? "red.600" : "app.text.primary";
  const hoverBorderColor = useColorModeValue(
    danger ? "red.200" : `${color}.200`,
    danger ? "rgba(239, 68, 68, 0.2)" : "rgba(117, 81, 255, 0.2)"
  );
  const borderColor = useColorModeValue("transparent", "transparent");

  return (
    <Button
      variant="outline"
      justifyContent="start"
      h="48px"
      w="full"
      px={4}
      borderRadius="xl"
      borderColor={borderColor}
      bg="transparent"
      color={textColor}
      fontWeight="700"
      fontSize="sm"
      gap={3}
      onClick={onClick}
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: "translateX(4px)",
        bg: hoverBg,
        borderColor: hoverBorderColor,
      }}
    >
      <Circle size="8" bg={danger ? "red.500/10" : `${color}.500/10`} color={iconColor} transition="all 0.2s">
        <Icon as={icon} boxSize={4} />
      </Circle>
      <Text fontSize="sm" fontWeight="inherit">{label}</Text>
    </Button>
  );
});
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

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "back",
        label: "Directory",
        icon: ArrowLeft,
        bg: "gradient_cyan_purple",
        color: "white",
        onClick: handleBack,
      },
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Refresh profile",
        onClick: refresh,
        loading: loading,
        flexShrink: 0,
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, handleBack, refresh, loading]);

  if (!loading && !trainer) {
    return (
      <Box mt={4} w="full">
        <PageHeader title="Trainer Not Found" subtitle={`No profile found for ID: ${trainerId || "Unknown"}.`}
          actions={<Button variant="outline" borderRadius="xl" onClick={handleBack} fontWeight="900"><ArrowLeft size={16} /> Back</Button>} />
        <SurfaceCard>
          <Flex direction="column" align="center" justify="center" py={20} gap={4}>
            <Circle size="16" bg="red.500/10" color="red.500"><ShieldCheck size={30} /></Circle>
            <Heading size="md" fontWeight="900">Profile unavailable</Heading>
            <Text color={muted} fontWeight="600">This trainer record may have been removed or the ID is incorrect.</Text>
          </Flex>
        </SurfaceCard>
      </Box>
    );
  }

  const specLabel = useMemo(() => {
    const s = trainer?.data.specialization;
    if (Array.isArray(s)) {
      return s.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join(", ");
    }
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "General Trainer";
  }, [trainer]);

  // Helper mapping available slots array for display
  const slotLabel = useMemo(() => {
    const slot = trainer?.data.availableSlot;
    if (Array.isArray(slot)) {
      return slot
        .map((s: string) => {
          if (s === "morning") return "Morning Shift (6:00 AM - 12:00 PM)";
          if (s === "afternoon") return "Afternoon Shift (12:00 PM - 5:00 PM)";
          if (s === "evening") return "Evening Shift (5:00 PM - 10:00 PM)";
          if (s === "full_day") return "Full Day Shift (Flexible)";
          return s.charAt(0).toUpperCase() + s.slice(1);
        })
        .join(", ");
    }
    if (typeof slot === "string") {
      if (slot === "morning") return "Morning Shift (6:00 AM - 12:00 PM)";
      if (slot === "afternoon") return "Afternoon Shift (12:00 PM - 5:00 PM)";
      if (slot === "evening") return "Evening Shift (5:00 PM - 10:00 PM)";
      if (slot === "full_day") return "Full Day Shift (Flexible)";
      return slot.charAt(0).toUpperCase() + slot.slice(1);
    }
    return "Flexible";
  }, [trainer]);

  return (
    <Box mt={4} w="full" animation="fade-in 0.5s ease-out">
      {/* Dynamic Keyframes for Status Badge pulse */}
      <style>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }
        @keyframes pulse-glow-orange {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
        }
        @keyframes pulse-glow-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>

      <VStack align="stretch" gap={6} pb={8}>
        {/* ── Hero Banner ─────────────────────────────────── */}
        <SurfaceCard p={{ base: 5, lg: 7 }} bg={heroBg} borderColor={borderColor}>
          <Flex direction={{ base: "column", lg: "row" }} gap={7} align={{ base: "start", lg: "center" }} justify="space-between">
            <HStack gap={{ base: 4, md: 6 }} align="center" minW={0}>
              <Skeleton loading={loading} borderRadius="2xl">
                <Box position="relative">
                  <Avatar.Root size="2xl" shape="rounded" border="1.5px solid" borderColor={borderColor} p={0.5} bg="transparent">
                    {trainer?.data.profilePic && <Avatar.Image src={trainer.data.profilePic} borderRadius="2xl" />}
                    <Avatar.Fallback bg={sm.bg} color={sm.accent} fontSize="4xl" fontWeight="900" borderRadius="2xl">{name.initials}</Avatar.Fallback>
                  </Avatar.Root>
                  {/* Glowing Status Dot */}
                  <Box
                    position="absolute"
                    bottom="-2px"
                    right="-2px"
                    w="16px"
                    h="16px"
                    borderRadius="full"
                    bg={sm.accent}
                    border="3px solid"
                    borderColor={useColorModeValue("white", "#0f172a")}
                    css={{
                      animation: `${sm.glowAnim} 2s infinite ease-in-out`
                    }}
                  />
                </Box>
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
                      <Fingerprint size={15} />
                      <Text fontSize="sm" fontWeight="900" fontFamily="mono">{trainer?._meta.id || trainerId}</Text>
                    </HStack>
                  </Skeleton>
                  <Skeleton loading={loading}>
                    <HStack px={4} py={2} borderRadius="xl" bg="blue.500/10" color="blue.500">
                      <Award size={15} />
                      <Text fontSize="sm" fontWeight="900">{specLabel}</Text>
                    </HStack>
                  </Skeleton>
                </HStack>
              </VStack>
            </HStack>
          </Flex>
        </SurfaceCard>

        {/* ── KPI Metrics ─────────────────────────────────── */}
        <SimpleGrid columns={{ base: 1, md: 3, xl: 3 }} gap={4}>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Experience</Text>
                <Heading size="lg" color="app.text.primary">{trainer?.data.experienceYears} Years</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Expert Level</Text>
              </VStack>
              <Circle size="10" bg="blue.500/10" color="blue.500"><Icon as={Briefcase} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Payment</Text>
                <Heading size="lg" color="app.text.primary">
                  {trainer?.data.paymentMode === "bank" ? "Bank" : trainer?.data.paymentMode === "upi" ? "UPI" : "Cash"}
                </Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">Salary disbursement</Text>
              </VStack>
              <Circle size="10" bg="purple.500/10" color="purple.500"><Icon as={CreditCard} boxSize={4} /></Circle>
            </HStack>
          </SurfaceCard>
          <SurfaceCard p={4}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={0}>
                <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Joined</Text>
                <Heading size="lg" color="app.text.primary">{new Date().getFullYear() - new Date(trainer?.data.joiningDate || Date.now()).getFullYear()}y ago</Heading>
                <Text fontSize="xs" color={muted} fontWeight="700">{fmtDate(trainer?.data.joiningDate)}</Text>
              </VStack>
              <Circle size="10" bg="orange.500/10" color="orange.500"><Icon as={CalendarDays} boxSize={4} /></Circle>
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
                    <Circle size="10" bg="blue.500/10" color="blue.500"><Contact size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <InfoTile label="Email" value={trainer?.data.email} icon={Mail} accent="blue.500" />
                    <InfoTile label="Phone" value={trainer?.data.phone} icon={Phone} accent="green.500" />
                    <InfoTile label="Address" value={trainer?.data.address} icon={MapPin} accent="orange.500" />
                    <InfoTile label="Gender" value={trainer?.data.gender ? (trainer.data.gender.charAt(0).toUpperCase() + trainer.data.gender.slice(1)) : "Not recorded"} icon={User} accent="purple.500" />
                    <InfoTile label="Trainer ID" value={trainer?.data.trainer_id} icon={Fingerprint} accent="cyan.500" />
                    <InfoTile label="Joining Date" value={fmtDate(trainer?.data.joiningDate)} icon={CalendarDays} accent="teal.500" />
                  </SimpleGrid>

                  {/* Payment Details Section */}
                  {trainer?.data.paymentMode && (
                    <>
                      <Separator borderColor={borderColor} my={2} />
                      <VStack align="start" gap={3} w="full">
                        <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase">Payment & Disbursement details</Text>
                        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} w="full">
                          <InfoTile label="Payment Method" value={trainer.data.paymentMode === "bank" ? "Bank Transfer" : trainer.data.paymentMode === "upi" ? "UPI / Digital" : "Cash"} icon={CreditCard} accent="purple.500" />
                          {trainer.data.paymentMode === "bank" && (
                            <>
                              <InfoTile label="Bank Name" value={trainer.data.bankName} icon={Briefcase} accent="blue.500" />
                              <InfoTile label="Account Number" value={trainer.data.accountNumber} icon={FileText} accent="green.500" />
                              <InfoTile label="IFSC Code" value={trainer.data.ifscCode} icon={ShieldCheck} accent="teal.500" />
                            </>
                          )}
                          {trainer.data.paymentMode === "upi" && (
                            <InfoTile label="UPI ID" value={trainer.data.upiId} icon={Zap} accent="cyan.500" />
                          )}
                        </SimpleGrid>
                      </VStack>
                    </>
                  )}
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
                    <Circle size="10" bg="purple.500/10" color="purple.500"><Award size={18} /></Circle>
                  </HStack>
                  <VStack align="start" gap={4}>
                    <Box w="full" p={4} borderRadius="xl" bg="blackAlpha.50" border="1px solid" borderColor={borderColor}>
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase" mb={2}>Trainer Bio</Text>
                      <Text fontSize="sm" fontWeight="700" color="app.text.primary" lineHeight="relaxed">
                        {trainer?.data.bio || "No bio provided. This trainer focuses on delivering high-quality fitness results through dedicated training programs."}
                      </Text>
                    </Box>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} w="full">
                      <InfoTile label="Specialization" value={specLabel} icon={Dumbbell} accent="blue.500" />
                       <InfoTile label="Available Slot" value={slotLabel} icon={Clock} accent="orange.500" />
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
                    <Circle size="10" bg="green.500/10" color="green.500"><ShieldCheck size={18} /></Circle>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                    {[
                      {
                        title: "ID PROOF",
                        file: trainer?.data.idProof,
                        fileName: "national_identity_card.pdf",
                        icon: ShieldCheck,
                        color: "blue",
                        status: trainer?.data.idProof ? "VERIFIED" : "PENDING",
                        statusPalette: trainer?.data.idProof ? "green" : "orange"
                      },
                      {
                        title: "CERTIFICATIONS",
                        file: trainer?.data.certifications,
                        fileName: "fitness_trainer_cert.pdf",
                        icon: Award,
                        color: "green",
                        status: trainer?.data.certifications ? "VERIFIED" : "PENDING",
                        statusPalette: trainer?.data.certifications ? "green" : "orange"
                      },
                      {
                        title: "CONTRACT",
                        file: "#",
                        fileName: "employment_contract.pdf",
                        icon: FileText,
                        color: "orange",
                        status: trainer?.data.status === "active" ? "SIGNED" : "PENDING",
                        statusPalette: trainer?.data.status === "active" ? "green" : "gray"
                      }
                    ].map((doc) => {
                      const isAvailable = !!doc.file || doc.title === "CONTRACT";
                      return (
                        <Box
                          key={doc.title}
                          p={4}
                          borderRadius="xl"
                          bg={`${doc.color}.500/5`}
                          border="1px solid"
                          borderColor={useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)")}
                          transition="all 0.25s ease"
                          _hover={{
                            bg: `${doc.color}.500/10`,
                            transform: "translateY(-2px)",
                            borderColor: `${doc.color}.500/30`
                          }}
                          position="relative"
                          overflow="hidden"
                        >
                          <VStack align="center" gap={3}>
                            <Circle size="12" bg={`${doc.color}.500/10`} color={`${doc.color}.500`}>
                              <Icon as={doc.icon} boxSize={5} />
                            </Circle>
                            <VStack gap={0.5} align="center">
                              <Text fontSize="xs" fontWeight="900" color="app.text.primary">{doc.title}</Text>
                              {isAvailable ? (
                                <Text
                                  as="span"
                                  fontSize="10px"
                                  fontWeight="700"
                                  color="blue.500"
                                  _hover={{ textDecoration: "underline" }}
                                  cursor="pointer"
                                >
                                  <a
                                    href={doc.file !== "#" ? doc.file : undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={doc.file === "#" ? (e) => { e.preventDefault(); toaster.create({ title: "View Contract", description: "Opening employment contract PDF...", type: "info" }); } : undefined}
                                    style={{ color: "inherit", textDecoration: "inherit" }}
                                  >
                                    {doc.fileName}
                                  </a>
                                </Text>
                              ) : (
                                <Text fontSize="10px" fontWeight="700" color="app.text.muted">No document uploaded</Text>
                              )}
                            </VStack>
                            <Badge colorPalette={doc.statusPalette} variant="subtle" size="xs" px={2} py={0.5} borderRadius="full">
                              {doc.status}
                            </Badge>
                          </VStack>
                        </Box>
                      );
                    })}
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
                    <ActionRow icon={MessageSquare} label="Send Message" color="blue" onClick={() => toaster.create({ title: "Send Message", description: "Opening trainer chat console...", type: "info" })} />
                    <ActionRow icon={CalendarDays} label="Manage Schedule" color="green" onClick={() => toaster.create({ title: "Manage Schedule", description: "Loading calendar editor...", type: "success" })} />
                    <ActionRow icon={Star} label="Performance Review" color="orange" onClick={() => toaster.create({ title: "Performance Review", description: "Opening appraisal metrics...", type: "info" })} />
                    <ActionRow icon={FileText} label="View Salary Slips" color="purple" onClick={() => toaster.create({ title: "Salary Slips", description: "Generating payload slip PDF...", type: "success" })} />
                    <ActionRow icon={Snowflake} label="Request Leave" color="cyan" onClick={() => toaster.create({ title: "Request Leave", description: "Leave request form opened.", type: "warning" })} />
                    <ActionRow icon={Trash2} label="Terminate Contract" danger onClick={() => toaster.create({ title: "Terminate Contract", description: "Safety confirmation prompt initialized.", type: "error" as any })} />
                  </VStack>
                </VStack>
              </SurfaceCard>

              {/* Performance Indicator */}
              <SurfaceCard bg="gray.950" color="white" borderColor="whiteAlpha.200">
                <VStack align="stretch" gap={4}>
                  <HStack justify="space-between">
                    <Heading size="sm" fontWeight="900">Trainer Quality</Heading>
                    <HStack gap={1} color="orange.400">
                      <Star size={14} fill="currentColor" />
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
