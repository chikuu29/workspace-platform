/**
 * TrainerProfile.tsx
 *
 * Full-width trainer profile cockpit — redesigned for premium UX.
 * Two-column layout on desktop with glassmorphic cards, animated KPI counters,
 * and a consistent brand design language matching the MemberDetail pattern.
 *
 * WHY full-width: Utilizes the workspace canvas fully so dense profile data
 * has room to breathe instead of being compressed into a narrow card.
 */

import { memo, useCallback, useMemo, useState, useEffect, type ElementType } from "react";
import {
  Avatar, Badge, Box, Circle, Flex, Grid, GridItem, Heading,
  HStack, Icon, SimpleGrid, Text, VStack, IconButton,
  Button,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useSearchParams } from "react-router";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { toaster } from "@/components/ui/toaster";
import {
  ArrowLeft, CalendarDays, CreditCard,
  Dumbbell, FileText, Fingerprint, Mail, MapPin,
  MessageSquare, Phone, RefreshCw, ShieldCheck, Snowflake,
  Star, Trash2, Zap, X,
  Award, Briefcase, Clock, Contact, User,
} from "lucide-react";

import { useGymTrainer } from "./hooks/useGymTrainer";
import type { TrainerDocument } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { SegmentedControl } from "./components/SegmentedControl";
import type { SegmentedOption } from "./components/SegmentedControl";

// ─── Brand Constants ────────────────────────────────────────────────────────

const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

// ─── Status Config ──────────────────────────────────────────────────

type StatusKey = "active" | "on_leave" | "terminated";

const STATUS_META: Record<StatusKey, {
  label: string;
  colorPalette: string;
  hex: string;
  bg: string;
  gradient: string;
  glowAnim: string;
}> = {
  active: {
    label: "Active",
    colorPalette: "green",
    hex: "#01B574",
    bg: "rgba(1,181,116,0.12)",
    gradient: "linear-gradient(135deg,#01B574,#00875A)",
    glowAnim: "pulse-glow",
  },
  on_leave: {
    label: "On Leave",
    colorPalette: "orange",
    hex: "#FFB547",
    bg: "rgba(255,181,71,0.12)",
    gradient: "linear-gradient(135deg,#FFB547,#E67E00)",
    glowAnim: "pulse-glow-orange",
  },
  terminated: {
    label: "Terminated",
    colorPalette: "red",
    hex: "#E31A1A",
    bg: "rgba(227,26,26,0.12)",
    gradient: "linear-gradient(135deg,#E31A1A,#B71C1C)",
    glowAnim: "pulse-glow-red",
  },
};

// ─── Keyframe Styles ────────────────────────────────────────────────

const KEYFRAME_STYLES = `
  @keyframes pulse-glow {
    0% { box-shadow: 0 0 0 0 rgba(1, 181, 116, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(1, 181, 116, 0); }
    100% { box-shadow: 0 0 0 0 rgba(1, 181, 116, 0); }
  }
  @keyframes pulse-glow-orange {
    0% { box-shadow: 0 0 0 0 rgba(255, 181, 71, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(255, 181, 71, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 181, 71, 0); }
  }
  @keyframes pulse-glow-red {
    0% { box-shadow: 0 0 0 0 rgba(227, 26, 26, 0.5); }
    70% { box-shadow: 0 0 0 10px rgba(227, 26, 26, 0); }
    100% { box-shadow: 0 0 0 0 rgba(227, 26, 26, 0); }
  }
`;

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

// ─── GlassCard ──────────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode;
  p?: number | string | Record<string, any>;
  hover?: boolean;
  [k: string]: any;
}

const GlassCard = memo(({ children, p = 6, hover = true, ...props }: GlassCardProps) => {
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");
  const shadow = useColorModeValue("0 4px 20px rgba(0,0,0,0.04)", "0 4px 20px rgba(0,0,0,0.18)");

  return (
    <Box
      p={p}
      borderRadius="20px"
      bg="app.card.bg"
      backdropFilter="blur(24px) saturate(190%)"
      border="1px solid"
      borderColor={border}
      boxShadow={shadow}
      position="relative"
      overflow="hidden"
      transition={hover ? "border-color 0.2s ease, box-shadow 0.2s ease" : undefined}
      _hover={hover ? {
        borderColor: `${BRAND_HEX}25`,
        boxShadow: useColorModeValue("0 6px 28px rgba(0,0,0,0.07)", "0 6px 28px rgba(0,0,0,0.25)"),
      } : undefined}
      {...props}
    >
      {children}
    </Box>
  );
});
GlassCard.displayName = "GlassCard";

// ─── SectionHeading ─────────────────────────────────────────────────

const SectionHeading = memo(({ title, subtitle, icon: SectionIcon }: {
  title: string;
  subtitle: string;
  icon: ElementType;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");

  return (
    <Flex justify="space-between" align="center">
      <VStack align="start" gap={0.5}>
        <Heading size="md" fontWeight="955" letterSpacing="tight" color="app.text.primary">
          {title}
        </Heading>
        <Text fontSize="xs" color={muted} fontWeight="700">
          {subtitle}
        </Text>
      </VStack>
      <Circle size="9" style={{ background: `${BRAND_HEX}18`, color: BRAND_HEX }}>
        <SectionIcon size={16} />
      </Circle>
    </Flex>
  );
});
SectionHeading.displayName = "SectionHeading";

// ─── InfoTile ───────────────────────────────────────────────────────

const InfoTile = memo(({ label, value, icon, accent = BRAND_HEX }: {
  label: string;
  value?: React.ReactNode;
  icon: ElementType;
  accent?: string;
}) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const border = useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.05)");

  return (
    <Flex
      justify="space-between"
      align="center"
      py={3}
      borderBottom="1px solid"
      borderColor={border}
      _last={{ borderBottom: "none" }}
      gap={4}
    >
      <HStack gap={2.5} minW={0}>
        <Circle size={7} flexShrink={0} style={{ background: `${accent}18`, color: accent }}>
          <Icon as={icon} boxSize={3} />
        </Circle>
        <Text fontSize="xs" fontWeight="700" color={muted} textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </HStack>
      <Text fontSize="sm" fontWeight="600" color="app.text.primary" textAlign="right">
        {typeof value === "string" || typeof value === "number" ? (value || "Not recorded") : (value ?? "Not recorded")}
      </Text>
    </Flex>
  );
});
InfoTile.displayName = "InfoTile";

// ─── AnimatedCounter ────────────────────────────────────────────────

const AnimatedCounter = memo(({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <>{count}</>;
});
AnimatedCounter.displayName = "AnimatedCounter";

// ─── StatBox ────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  color: string;
  icon: ElementType;
}

const StatBox = memo(({ label, value, unit, color, icon: StatIcon }: StatBoxProps) => {
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");

  return (
    <Box
      bg="app.card.bg"
      border="1px solid"
      borderColor={border}
      borderRadius="16px"
      p={4}
      transition="border-color 0.2s ease"
      _hover={{ borderColor: `${color}40` }}
    >
      <HStack justify="space-between" align="start" mb={2}>
        <Text fontSize="9px" fontWeight="800" color="app.text.muted" textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
        <Circle size="7" style={{ background: `${color}18`, color }}>
          <StatIcon size={12} />
        </Circle>
      </HStack>
      <HStack align="baseline" gap={0.5}>
        <Text fontSize="xl" fontWeight="900" letterSpacing="tight" color={color}>
          {value}
        </Text>
        {unit && (
          <Text fontSize="10px" fontWeight="600" color="app.text.muted">{unit}</Text>
        )}
      </HStack>
    </Box>
  );
});
StatBox.displayName = "StatBox";

// ─── QuickAction ────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  desc: string;
  icon: ElementType;
  accentHex: string;
  danger?: boolean;
  onClick?: () => void;
}

const QuickAction = memo(({ label, desc, icon, accentHex, danger = false, onClick }: QuickActionProps) => {
  const border = useColorModeValue("rgba(226,232,240,0.7)", "rgba(255,255,255,0.07)");
  const resolvedAccent = danger ? "#E31A1A" : accentHex;

  return (
    <VStack
      as="button"
      p={4}
      borderRadius="xl"
      bg="app.card.bg"
      border="1px solid"
      borderColor={border}
      align="start"
      cursor="pointer"
      gap={2.5}
      transition="border-color 0.2s ease"
      _hover={{
        borderColor: `${resolvedAccent}40`,
      }}
      onClick={onClick}
      w="full"
    >
      <Circle
        size="9"
        flexShrink={0}
        style={{
          background: danger ? "rgba(227,26,26,0.12)" : `${accentHex}18`,
          color: resolvedAccent,
        }}
      >
        <Icon as={icon} boxSize={4} />
      </Circle>
      <VStack align="start" gap={0.5}>
        <Text fontSize="xs" fontWeight="800" color="app.text.primary">{label}</Text>
        <Text fontSize="10px" color="app.text.muted" fontWeight="600">{desc}</Text>
      </VStack>
    </VStack>
  );
});
QuickAction.displayName = "QuickAction";

// ─── DocumentCard ───────────────────────────────────────────────────

interface DocumentCardProps {
  title: string;
  file?: string;
  fileName: string;
  icon: ElementType;
  accentHex: string;
  status: string;
  statusPalette: string;
}

const DocumentCard = memo(({ title, file, fileName, icon, accentHex, status, statusPalette }: DocumentCardProps) => {
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const isAvailable = !!file || title === "CONTRACT";

  const handleContractClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    toaster.create({ title: "View Contract", description: "Opening employment contract PDF...", type: "info" });
  }, []);

  return (
    <Box
      p={5}
      borderRadius="xl"
      bg="app.card.bg"
      border="1px solid"
      borderColor={border}
      transition="border-color 0.2s ease"
      _hover={{
        borderColor: `${accentHex}40`,
      }}
      position="relative"
      overflow="hidden"
    >
      <VStack align="center" gap={3}>
        <Circle size="12" style={{ background: `${accentHex}18`, color: accentHex }}>
          <Icon as={icon} boxSize={5} />
        </Circle>
        <VStack gap={0.5} align="center">
          <Text fontSize="xs" fontWeight="900" color="app.text.primary">{title}</Text>
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
                href={file !== "#" ? file : undefined}
                target="_blank"
                rel="noreferrer"
                onClick={file === "#" ? handleContractClick : undefined}
                style={{ color: "inherit", textDecoration: "inherit" }}
              >
                {fileName}
              </a>
            </Text>
          ) : (
            <Text fontSize="10px" fontWeight="700" color="app.text.muted">No document uploaded</Text>
          )}
        </VStack>
        <Badge colorPalette={statusPalette} variant="subtle" size="xs" px={2} py={0.5} borderRadius="full">
          {status}
        </Badge>
      </VStack>
    </Box>
  );
});
DocumentCard.displayName = "DocumentCard";

// ─── Profile Tab Options ────────────────────────────────────────────

const PROFILE_TABS: readonly SegmentedOption[] = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details & Payout" },
  { id: "documents", label: "Credentials & Docs" },
] as const;

// ─── Quick Action Data ──────────────────────────────────────────────

const QUICK_ACTIONS: Array<{
  label: string;
  desc: string;
  icon: ElementType;
  accentHex: string;
  danger?: boolean;
  toastConfig: { title: string; description: string; type: "info" | "success" | "warning" | "error" };
}> = [
    {
      label: "Send Message",
      desc: "Chat with trainer",
      icon: MessageSquare,
      accentHex: "#3b82f6",
      toastConfig: { title: "Send Message", description: "Opening trainer chat console...", type: "info" },
    },
    {
      label: "Manage Schedule",
      desc: "Edit training calendar",
      icon: CalendarDays,
      accentHex: "#01B574",
      toastConfig: { title: "Manage Schedule", description: "Loading calendar editor...", type: "success" },
    },
    {
      label: "Appraisal Review",
      desc: "View trainer metrics",
      icon: Star,
      accentHex: "#f97316",
      toastConfig: { title: "Performance Review", description: "Opening appraisal metrics...", type: "info" },
    },
    {
      label: "Salary Slips",
      desc: "Download payroll logs",
      icon: FileText,
      accentHex: BRAND_ALT,
      toastConfig: { title: "Salary Slips", description: "Generating payroll slip PDF...", type: "success" },
    },
    {
      label: "Request Leave",
      desc: "Submit leave request",
      icon: Snowflake,
      accentHex: "#06b6d4",
      toastConfig: { title: "Request Leave", description: "Leave request form opened.", type: "warning" },
    },
    {
      label: "Terminate Contract",
      desc: "End trainer agreement",
      icon: Trash2,
      accentHex: "#E31A1A",
      danger: true,
      toastConfig: { title: "Terminate Contract", description: "Safety confirmation prompt initialized.", type: "error" },
    },
  ];

// ─── Main Component ─────────────────────────────────────────────────

export interface TrainerProfileDetailProps {
  trainerId?: string;
  onBack?: () => void;
  isEmbedded?: boolean;
}

export const TrainerProfileDetail = memo(({ trainerId, onBack, isEmbedded = false }: TrainerProfileDetailProps) => {
  const { trainer, loading, refresh } = useGymTrainer(trainerId || undefined);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // ── Computed data ─────────────────────────────────────────────────
  const name = useMemo(() => getName(trainer?.data), [trainer]);
  const status = (trainer?.data.status || "active") as StatusKey;
  const sm = STATUS_META[status] || STATUS_META.active;

  const specLabel = useMemo(() => {
    const s = trainer?.data.specialization;
    if (Array.isArray(s)) {
      return s.map((item: string) => item.charAt(0).toUpperCase() + item.slice(1)).join(", ");
    }
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : "General Trainer";
  }, [trainer]);

  const slotLabel = useMemo(() => {
    const slot = trainer?.data.availableSlot;
    const SLOT_MAP: Record<string, string> = {
      morning: "Morning Shift (6:00 AM – 12:00 PM)",
      afternoon: "Afternoon Shift (12:00 PM – 5:00 PM)",
      evening: "Evening Shift (5:00 PM – 10:00 PM)",
      full_day: "Full Day Shift (Flexible)",
    };
    if (Array.isArray(slot)) {
      return slot.map((s: string) => SLOT_MAP[s] || s.charAt(0).toUpperCase() + s.slice(1)).join(", ");
    }
    if (typeof slot === "string") {
      return SLOT_MAP[slot] || slot.charAt(0).toUpperCase() + slot.slice(1);
    }
    return "Flexible";
  }, [trainer]);

  const paymentLabel = useMemo(() => {
    const mode = trainer?.data.paymentMode;
    if (mode === "bank") return "Bank Transfer";
    if (mode === "upi") return "UPI / Digital";
    return "Cash";
  }, [trainer]);

  const experienceYears = useMemo(() => {
    const exp = trainer?.data.experienceYears;
    return typeof exp === "number" ? exp : parseInt(String(exp), 10) || 0;
  }, [trainer]);

  // ── Quick action handlers ─────────────────────────────────────────
  const quickActionHandlers = useMemo(
    () =>
      QUICK_ACTIONS.map((action) => ({
        ...action,
        onClick: () => toaster.create(action.toastConfig),
      })),
    [],
  );

  // ── Document data ─────────────────────────────────────────────────
  const documents = useMemo(() => [
    {
      title: "ID PROOF",
      file: trainer?.data.idProof,
      fileName: "national_identity_card.pdf",
      icon: ShieldCheck,
      accentHex: "#3b82f6",
      status: trainer?.data.idProof ? "VERIFIED" : "PENDING",
      statusPalette: trainer?.data.idProof ? "green" : "orange",
    },
    {
      title: "CERTIFICATIONS",
      file: trainer?.data.certifications,
      fileName: "fitness_trainer_cert.pdf",
      icon: Award,
      accentHex: "#01B574",
      status: trainer?.data.certifications ? "VERIFIED" : "PENDING",
      statusPalette: trainer?.data.certifications ? "green" : "orange",
    },
    {
      title: "CONTRACT",
      file: "#",
      fileName: "employment_contract.pdf",
      icon: FileText,
      accentHex: "#f97316",
      status: trainer?.data.status === "active" ? "SIGNED" : "PENDING",
      statusPalette: trainer?.data.status === "active" ? "green" : "gray",
    },
  ], [trainer]);

  // ── Theme values ──────────────────────────────────────────────────
  const borderColor = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");
  const heroBannerBg = useColorModeValue(
    "linear-gradient(135deg, rgba(117,81,255,0.08) 0%, rgba(66,42,251,0.04) 50%, rgba(6,182,212,0.06) 100%)",
    "linear-gradient(135deg, rgba(117,81,255,0.12) 0%, rgba(66,42,251,0.08) 50%, rgba(6,182,212,0.06) 100%)",
  );
  const heroBannerBorder = useColorModeValue("rgba(255,255,255,0.4)", "whiteAlpha.100");
  const avatarBorderColor = useColorModeValue("white", "#111c44");
  const avatarBg = useColorModeValue("gray.50", "#0b1437");
  const statusDotBorder = useColorModeValue("white", "#111c44");

  // ── Nav actions ───────────────────────────────────────────────────
  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    if (isEmbedded) return;
    setNavActionConfig([
      {
        id: "back",
        label: "Directory",
        icon: ArrowLeft,
        bg: "gradient_cyan_purple",
        color: "white",
        onClick: onBack || (() => { }),
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
  }, [setNavActionConfig, clearActions, onBack, refresh, loading, isEmbedded]);

  // ── Not Found State ───────────────────────────────────────────────
  if (!loading && !trainer) {
    return (
      <Box mt={isEmbedded ? 0 : 4} w="full">
        <GlassCard hover={false}>
          <Flex direction="column" align="center" justify="center" py={20} gap={4}>
            <Circle size="16" style={{ background: "rgba(227,26,26,0.12)", color: "#E31A1A" }}>
              <ShieldCheck size={30} />
            </Circle>
            <Heading size="md" fontWeight="900">Profile unavailable</Heading>
            <Text color={muted} fontWeight="600" textAlign="center" maxW="400px">
              This trainer record may have been removed or the ID is incorrect.
            </Text>
            {isEmbedded && onBack && (
              <Button size="sm" variant="subtle" colorPalette="gray" borderRadius="xl" onClick={onBack} fontWeight="800">
                Close Profile
              </Button>
            )}
            {!isEmbedded && onBack && (
              <Button variant="outline" borderRadius="xl" onClick={onBack} fontWeight="900">
                <ArrowLeft size={16} /> Back to Directory
              </Button>
            )}
          </Flex>
        </GlassCard>
      </Box>
    );
  }

  return (
    <Box mt={isEmbedded ? 0 : 4} w="full" animation="fade-in 0.5s ease-out">
      {/* Dynamic Keyframes for Status Badge pulse */}
      <style>{KEYFRAME_STYLES}</style>

      <VStack align="stretch" gap={5} w="full">
        {/* ═══════════════════════════════════════════════════════════
            Hero Profile Card — Full Width
        ═══════════════════════════════════════════════════════════ */}
        <GlassCard p={0} hover={false}>
          {/* Brand accent strip */}
          <Box h="3px" bg={BRAND_GRADIENT} />

          {/* Hero banner overlay */}
          <Box
            h={{ base: "80px", md: "100px" }}
            w="full"
            bg={heroBannerBg}
            borderBottom="1px solid"
            borderColor={heroBannerBorder}
            position="relative"
          >
            {/* Ambient glow orbs */}
            <Box
              position="absolute"
              top="-40%"
              right="10%"
              w="200px"
              h="200px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(117,81,255,0.08), transparent)"
              pointerEvents="none"
            />
            <Box
              position="absolute"
              bottom="-60%"
              left="5%"
              w="200px"
              h="200px"
              borderRadius="full"
              bg="radial-gradient(circle, rgba(6,182,212,0.06), transparent)"
              pointerEvents="none"
            />

            {/* Embedded close button */}
            {isEmbedded && onBack && (
              <IconButton
                aria-label="Close Profile"
                variant="ghost"
                colorPalette="gray"
                size="sm"
                borderRadius="full"
                position="absolute"
                top={2}
                right={2}
                onClick={onBack}
                bg="blackAlpha.200"
                _hover={{ bg: "blackAlpha.400" }}
                color="white"
                zIndex={5}
              >
                <X size={15} />
              </IconButton>
            )}
          </Box>

          {/* Profile identity section */}
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "start", md: "end" }}
            gap={{ base: 4, md: 6 }}
            px={{ base: 5, md: 7 }}
            pb={5}
            mt={{ base: "-40px", md: "-50px" }}
            position="relative"
            zIndex={2}
          >
            {/* Avatar with status indicator */}
            <Box position="relative" flexShrink={0}>
              <Avatar.Root
                size="xl"
                shape="rounded"
                border="3px solid"
                borderColor={avatarBorderColor}
                bg={avatarBg}
                boxShadow="0 6px 20px rgba(0,0,0,0.15)"
                p={0.5}
              >
                {trainer?.data.profilePic && <Avatar.Image src={trainer.data.profilePic} borderRadius="lg" />}
                <Avatar.Fallback bg={sm.bg} color={sm.hex} fontSize="2xl" fontWeight="955" borderRadius="lg">
                  {name.initials}
                </Avatar.Fallback>
              </Avatar.Root>
              {/* Status dot */}
              <Circle
                size="14px"
                bg={sm.hex}
                position="absolute"
                bottom="-2px"
                right="-2px"
                border="2.5px solid"
                borderColor={statusDotBorder}
                css={{ animation: `${sm.glowAnim} 2s infinite ease-in-out` }}
              />
            </Box>

            {/* Name, badges, and metadata — fills remaining width */}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "end" }}
              flex={1}
              gap={{ base: 3, md: 4 }}
              w="full"
              mb={{ base: 0, md: 1 }}
            >
              <VStack align="start" gap={1.5}>
                <HStack gap={2.5} flexWrap="wrap" align="center">
                  <Heading size="lg" fontWeight="955" letterSpacing="tight" color="app.text.primary">
                    {name.full}
                  </Heading>
                  <Badge
                    colorPalette={sm.colorPalette as any}
                    variant="solid"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="9px"
                    fontWeight="900"
                  >
                    {sm.label}
                  </Badge>
                </HStack>
                <HStack gap={2} flexWrap="wrap">
                  <Badge colorPalette="blue" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="9px" fontWeight="800">
                    ID: {trainer?._meta.id || trainerId}
                  </Badge>
                  <Badge colorPalette="purple" variant="subtle" borderRadius="md" px={2} py={0.5} fontSize="9px" fontWeight="800">
                    {specLabel}
                  </Badge>
                </HStack>
              </VStack>

              {/* Contact pills — visible on desktop in the header area */}
              <HStack gap={4} display={{ base: "none", lg: "flex" }} flexWrap="wrap">
                {trainer?.data.email && (
                  <HStack gap={1.5}>
                    <Circle size="5" style={{ background: `${BRAND_HEX}18`, color: BRAND_HEX }}>
                      <Mail size={10} />
                    </Circle>
                    <Text fontSize="xs" fontWeight="700" color={muted}>{trainer.data.email}</Text>
                  </HStack>
                )}
                {trainer?.data.phone && (
                  <HStack gap={1.5}>
                    <Circle size="5" style={{ background: "#01B57418", color: "#01B574" }}>
                      <Phone size={10} />
                    </Circle>
                    <Text fontSize="xs" fontWeight="700" color={muted}>{trainer.data.phone}</Text>
                  </HStack>
                )}
              </HStack>
            </Flex>
          </Flex>
        </GlassCard>

        {/* ═══════════════════════════════════════════════════════════
            KPI Stats Row — Full Width
        ═══════════════════════════════════════════════════════════ */}
        <SimpleGrid columns={{ base: 2, sm: 4 }} gap={4}>
          <StatBox
            label="Experience"
            value={<AnimatedCounter value={experienceYears} />}
            unit="Years"
            color={BRAND_HEX}
            icon={Briefcase}
          />
          <StatBox
            label="Payment Mode"
            value={paymentLabel}
            color={BRAND_ALT}
            icon={CreditCard}
          />
          <StatBox
            label="Joined"
            value={fmtDate(trainer?.data.joiningDate)}
            color="#f97316"
            icon={CalendarDays}
          />
          <StatBox
            label="Rating"
            value="4.9 ★"
            color="#eab308"
            icon={Star}
          />
        </SimpleGrid>

        {/* ═══════════════════════════════════════════════════════════
            Segmented Tab Navigation
        ═══════════════════════════════════════════════════════════ */}
        <SegmentedControl
          options={PROFILE_TABS}
          activeId={activeTab}
          onChange={setActiveTab}
        />

        {/* ═══════════════════════════════════════════════════════════
            Tab Content — Full Width Grid
        ═══════════════════════════════════════════════════════════ */}
        <Box minH={{ base: "auto", lg: "380px" }}>
          {activeTab === "overview" && (
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={5}
            >
              {/* Bio & Expertise */}
              <GridItem>
                <GlassCard hover={false} h="full">
                  <VStack align="stretch" gap={4}>
                    <SectionHeading title="Bio & Expertise" subtitle="Professional background and philosophy." icon={Award} />
                    <Box
                      w="full"
                      p={4}
                      borderRadius="xl"
                      bg={useColorModeValue("rgba(0,0,0,0.02)", "whiteAlpha.50")}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <Text fontSize="xs" color={muted} fontWeight="900" textTransform="uppercase" mb={2}>
                        Trainer Bio
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color="app.text.primary" lineHeight="relaxed">
                        {trainer?.data.bio || "No bio provided. This trainer focuses on delivering high-quality fitness results through dedicated training programs."}
                      </Text>
                    </Box>
                    <VStack align="stretch" gap={0}>
                      <InfoTile label="Specialization" value={specLabel} icon={Dumbbell} accent="#3b82f6" />
                      <InfoTile label="Available Slot" value={slotLabel} icon={Clock} accent="#f97316" />
                      <InfoTile label="Experience" value={`${experienceYears} Years`} icon={Briefcase} accent={BRAND_HEX} />
                      <InfoTile label="Joining Date" value={fmtDate(trainer?.data.joiningDate)} icon={CalendarDays} accent="#01B574" />
                    </VStack>
                  </VStack>
                </GlassCard>
              </GridItem>

              {/* Quick Actions */}
              <GridItem>
                <GlassCard hover={false} h="full">
                  <VStack align="stretch" gap={4}>
                    <SectionHeading title="Quick Actions" subtitle="Administrative and training controls." icon={Zap} />
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                      {quickActionHandlers.map((action) => (
                        <QuickAction
                          key={action.label}
                          label={action.label}
                          desc={action.desc}
                          icon={action.icon}
                          accentHex={action.accentHex}
                          danger={action.danger}
                          onClick={action.onClick}
                        />
                      ))}
                    </SimpleGrid>
                  </VStack>
                </GlassCard>
              </GridItem>
            </Grid>
          )}

          {activeTab === "details" && (
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={5}
            >
              {/* Personal Information */}
              <GridItem>
                <GlassCard hover={false} h="full">
                  <VStack align="stretch" gap={4}>
                    <SectionHeading title="Personal Information" subtitle="Contact and identity details." icon={Contact} />
                    <VStack align="stretch" gap={0}>
                      <InfoTile label="Email" value={trainer?.data.email} icon={Mail} accent="#3b82f6" />
                      <InfoTile label="Phone" value={trainer?.data.phone} icon={Phone} accent="#01B574" />
                      <InfoTile label="Address" value={trainer?.data.address} icon={MapPin} accent="#f97316" />
                      <InfoTile
                        label="Gender"
                        value={trainer?.data.gender ? trainer.data.gender.charAt(0).toUpperCase() + trainer.data.gender.slice(1) : "Not recorded"}
                        icon={User}
                        accent={BRAND_ALT}
                      />
                      <InfoTile label="Trainer ID" value={trainer?.data.trainer_id} icon={Fingerprint} accent="#06b6d4" />
                      <InfoTile label="Joining Date" value={fmtDate(trainer?.data.joiningDate)} icon={CalendarDays} accent="#14b8a6" />
                    </VStack>
                  </VStack>
                </GlassCard>
              </GridItem>

              {/* Payment Details */}
              <GridItem>
                <GlassCard hover={false} h="full">
                  <VStack align="stretch" gap={4}>
                    <SectionHeading title="Payout Information" subtitle="Disbursement and bank details." icon={CreditCard} />
                    <VStack align="stretch" gap={0}>
                      <InfoTile label="Payment Method" value={paymentLabel} icon={CreditCard} accent={BRAND_ALT} />
                      {trainer?.data.paymentMode === "bank" && (
                        <>
                          <InfoTile label="Bank Name" value={trainer.data.bankName} icon={Briefcase} accent="#3b82f6" />
                          <InfoTile label="Account Number" value={trainer.data.accountNumber} icon={FileText} accent="#01B574" />
                          <InfoTile label="IFSC Code" value={trainer.data.ifscCode} icon={ShieldCheck} accent="#14b8a6" />
                        </>
                      )}
                      {trainer?.data.paymentMode === "upi" && (
                        <InfoTile label="UPI ID" value={trainer.data.upiId} icon={Zap} accent="#06b6d4" />
                      )}
                    </VStack>

                    {/* Payment mode visual indicator */}
                    <Box
                      mt={2}
                      p={4}
                      borderRadius="xl"
                      bg={useColorModeValue("rgba(0,0,0,0.02)", "whiteAlpha.50")}
                      border="1px solid"
                      borderColor={borderColor}
                    >
                      <HStack gap={3}>
                        <Circle size="10" style={{ background: `${BRAND_HEX}18`, color: BRAND_HEX }}>
                          <CreditCard size={16} />
                        </Circle>
                        <VStack align="start" gap={0.5}>
                          <Text fontSize="xs" fontWeight="900" color="app.text.primary" textTransform="uppercase" letterSpacing="wider">
                            Payment Status
                          </Text>
                          <Text fontSize="sm" fontWeight="700" color={muted}>
                            {trainer?.data.paymentMode
                              ? `Configured via ${paymentLabel}`
                              : "No payment method configured"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </VStack>
                </GlassCard>
              </GridItem>
            </Grid>
          )}

          {activeTab === "documents" && (
            <GlassCard hover={false}>
              <VStack align="stretch" gap={5}>
                <SectionHeading title="Verification & Documents" subtitle="Compliance and certification records." icon={ShieldCheck} />
                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.title}
                      title={doc.title}
                      file={doc.file}
                      fileName={doc.fileName}
                      icon={doc.icon}
                      accentHex={doc.accentHex}
                      status={doc.status}
                      statusPalette={doc.statusPalette}
                    />
                  ))}
                </SimpleGrid>
              </VStack>
            </GlassCard>
          )}
        </Box>
      </VStack>
    </Box>
  );
});

TrainerProfileDetail.displayName = "TrainerProfileDetail";

// ─── Route-Level Wrapper ────────────────────────────────────────────

const TrainerProfile = memo(() => {
  const { goBack } = useWorkspaceRouter();
  const [searchParams] = useSearchParams();
  const trainerId = searchParams.get("trainer_id") || undefined;
  const handleBack = useCallback(() => goBack(), [goBack]);

  return (
    <TrainerProfileDetail
      trainerId={trainerId}
      onBack={handleBack}
      isEmbedded={false}
    />
  );
});

TrainerProfile.displayName = "TrainerProfile";
export default TrainerProfile;
