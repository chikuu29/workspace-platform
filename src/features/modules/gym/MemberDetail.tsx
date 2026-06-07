/**
 * MemberDetail.tsx
 *
 * Member profile cockpit — redesigned to match the unified brand design system:
 *   • Primary gradient: #7551FF → #422AFB
 *   • Glassmorphism cards (blur + translucent bg)
 *   • Consistent button styles matching plans
 *   • Status colors: Active=#01B574, Attention=#FFB547, Frozen=#3965FF
 *   • All interactive elements share the same hover/transition vocabulary
 */

import { memo, useCallback, useMemo, type ElementType, useState, useEffect } from "react";
import {
  Badge, Box, Button, Circle, Flex, Grid, GridItem, Heading,
  HStack, Icon, Separator, SimpleGrid, Text, VStack, IconButton, Input, Textarea,
} from "@chakra-ui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams } from "react-router";
import { useForm } from "react-hook-form";
import {
  ArrowLeft, CalendarDays, Check, CheckCircle2, CreditCard,
  Dumbbell, Edit, FileText, Mail, MessageSquare,
  Phone, RefreshCw, ShieldCheck, Snowflake,
  Trash2, Zap, ChevronRight, TrendingUp, Clock,
  User, MapPin, Sparkles,
} from "lucide-react";

import { useGymMember } from "./hooks/useGymMember";
import type { MemberDocument } from "./types/Gym.types";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { toaster } from "@/components/ui/toaster";
import { MemberMembershipAndBilling } from "./components/MemberMembershipAndBilling";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import {
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader,
  DialogFooter, DialogTitle, DialogBody, DialogCloseTrigger,
} from "@/components/ui/dialog";


const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

type StatusKey = "active" | "attention" | "frozen";

const STATUS_META: Record<StatusKey, {
  label: string;
  hex: string;
  bg: string;
  gradient: string;
}> = {
  active: { label: "Active", hex: "#01B574", bg: "rgba(1,181,116,0.12)", gradient: "linear-gradient(135deg,#01B574,#00875A)" },
  attention: { label: "Needs Attention", hex: "#FFB547", bg: "rgba(255,181,71,0.12)", gradient: "linear-gradient(135deg,#FFB547,#E67E00)" },
  frozen: { label: "Frozen", hex: "#3965FF", bg: "rgba(57,101,255,0.12)", gradient: "linear-gradient(135deg,#3965FF,#002DFF)" },
};

/** Human-readable billing cycle labels matching plans */
const BILLING_LABEL: Record<string, string> = {
  monthly: "month",
  quarterly: "quarter",
  yearly: "year",
  "half-yearly": "6 months",
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const getName = (d?: MemberDocument["data"]) => ({
  full: `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "Unknown Member",
  initials: `${d?.firstName?.[0] || ""}${d?.lastName?.[0] || ""}`.toUpperCase() || "?",
});

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return Number.isNaN(p.getTime())
    ? "N/A"
    : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// ─── Animated Counter ─────────────────────────────────────────────────────────

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

const AnimatedDecimalCounter = memo(({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setCount(progress * value);
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <>{count.toFixed(1)}</>;
});
AnimatedDecimalCounter.displayName = "AnimatedDecimalCounter";

// ─── GlassCard ───────────────────────────────────────────────────────────────
// Unified card primitive — matches plans's card style

interface GlassCardProps {
  children: React.ReactNode;
  p?: number | string | Record<string, any>;
  hover?: boolean;
  [k: string]: any;
}

const GlassCard = memo(({ children, p = 6, hover = true, ...props }: GlassCardProps) => {
  const bg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(18,22,40,0.72)");
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)");
  const shadow = useColorModeValue("0 8px 32px rgba(0,0,0,0.06)", "0 8px 32px rgba(0,0,0,0.22)");

  return (
    <Box
      p={p}
      borderRadius="20px"
      bg={bg}
      backdropFilter="blur(24px) saturate(190%)"
      border="1px solid"
      borderColor={border}
      boxShadow={shadow}
      position="relative"
      overflow="hidden"
      transition={hover ? "transform 0.3s cubic-bezier(0.175,0.885,0.32,1.275), border-color 0.25s, box-shadow 0.3s" : undefined}
      _hover={hover ? {
        transform: "translateY(-4px)",
        borderColor: `${BRAND_HEX}35`,
        boxShadow: useColorModeValue("0 16px 48px rgba(0,0,0,0.10)", "0 16px 48px rgba(0,0,0,0.36)"),
      } : undefined}
      {...props}
    >
      {children}
    </Box>
  );
});
GlassCard.displayName = "GlassCard";

// ─── SectionHeading ───────────────────────────────────────────────────────────

const SectionHeading = memo(({ children }: { children: React.ReactNode }) => (
  <HStack gap={2} mb={4}>
    <Box w={1} h={5} bg={BRAND_GRADIENT} borderRadius="full" />
    <Heading fontSize="sm" fontWeight="800" color="app.text.primary" letterSpacing="tight">
      {children}
    </Heading>
  </HStack>
));
SectionHeading.displayName = "SectionHeading";

// ─── InfoRow ─────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon?: ElementType;
  label: string;
  value: string;
  iconColor?: string;
}

const InfoRow = memo(({ icon, label, value, iconColor = BRAND_HEX }: InfoRowProps) => {
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
        {icon && (
          <Circle size={6} flexShrink={0} style={{ background: `${iconColor}18`, color: iconColor }}>
            <Icon as={icon} boxSize={3} />
          </Circle>
        )}
        <Text fontSize="xs" fontWeight="700" color="app.text.muted" textTransform="uppercase" letterSpacing="wider">
          {label}
        </Text>
      </HStack>
      <Text fontSize="sm" fontWeight="600" color="app.text.primary" textAlign="right">
        {value}
      </Text>
    </Flex>
  );
});
InfoRow.displayName = "InfoRow";

// ─── StatBox ─────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  color: string;
}

const StatBox = memo(({ label, value, unit, color }: StatBoxProps) => {
  const bg = useColorModeValue("rgba(255,255,255,0.7)", "rgba(18,22,40,0.6)");
  const border = useColorModeValue("rgba(226,232,240,0.7)", "rgba(255,255,255,0.07)");
  return (
    <Box
      bg={bg}
      backdropFilter="blur(16px)"
      border="1px solid"
      borderColor={border}
      borderRadius="16px"
      p={4}
      textAlign="center"
      transition="transform 0.25s, border-color 0.25s"
      _hover={{ transform: "translateY(-3px)", borderColor: `${BRAND_HEX}30` }}
    >
      <Text fontSize="9px" fontWeight="800" color="app.text.muted" textTransform="uppercase" letterSpacing="wider" mb={1.5}>
        {label}
      </Text>
      <HStack justify="center" align="baseline" gap={0.5}>
        <Text
          fontSize="2xl"
          fontWeight="900"
          letterSpacing="tight"
          color={color}
        >
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

// ─── AttendanceCalendar ───────────────────────────────────────────────────────

const AttendanceCalendar = memo(() => {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const monthName = useMemo(() => now.toLocaleString("default", { month: "long" }), [now]);
  const totalDays = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const startDay = useMemo(() => new Date(year, month, 1).getDay(), [year, month]);
  const blanks = useMemo(() => Array.from({ length: startDay }), [startDay]);
  const days = useMemo(() => Array.from({ length: totalDays }).map((_, i) => i + 1), [totalDays]);
  const checkedIn = useMemo(() => new Set([1, 2, 4, 8, 10, 11, 15, 17, 18, 22, 24, 25, 29]), []);
  const totalRows = Math.ceil((blanks.length + days.length) / 7);
  const weekLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const bgCell = useColorModeValue("rgba(226,232,240,0.3)", "rgba(255,255,255,0.03)");
  const border = useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)");

  return (
    <VStack align="stretch" gap={4}>
      <Flex justify="space-between" align="center">
        <HStack gap={2}>
          <Box w={1} h={5} bg={BRAND_GRADIENT} borderRadius="full" />
          <Heading fontSize="sm" fontWeight="800" color="app.text.primary">
            Attendance · {monthName} {year}
          </Heading>
        </HStack>
        <HStack gap={3}>
          <HStack gap={1.5}>
            <Circle size="2" bg="#01B574" boxShadow="0 0 6px #01B57480" />
            <Text fontSize="10px" color="app.text.muted" fontWeight="700">Attended</Text>
          </HStack>
          <HStack gap={1.5}>
            <Circle size="2" border="1.5px solid" borderColor={border} />
            <Text fontSize="10px" color="app.text.muted" fontWeight="700">Absent</Text>
          </HStack>
        </HStack>
      </Flex>

      <SimpleGrid columns={7} gap={1.5} textAlign="center">
        {weekLabels.map((l) => (
          <Text key={l} fontSize="10px" fontWeight="800" color="app.text.muted" py={1}>{l}</Text>
        ))}
        {blanks.map((_, i) => <Box key={`b-${i}`} />)}
        {days.map((day, dayIdx) => {
          const isToday = day === todayDate;
          const isChecked = checkedIn.has(day);
          const isFuture = day > todayDate;
          const rowDelay = `${(totalRows - Math.floor((blanks.length + dayIdx) / 7)) * 0.07}s`;

          return (
            <Flex
              key={`d-${day}`}
              h="11"
              borderRadius="lg"
              align="center"
              justify="center"
              position="relative"
              cursor={isFuture ? "default" : "pointer"}
              transition="all 0.2s"
              className="stagger-cell"
              style={{ animationDelay: rowDelay }}
              bg={isChecked ? "rgba(1,181,116,0.1)" : isToday ? `${BRAND_HEX}12` : bgCell}
              border="1px solid"
              borderColor={
                isChecked ? "#01B57460"
                  : isToday ? `${BRAND_HEX}50`
                    : isFuture ? "transparent"
                      : border
              }
              _hover={isFuture ? {} : {
                transform: "translateY(-2px)",
                bg: isChecked ? "rgba(1,181,116,0.18)" : `${BRAND_HEX}12`,
                borderColor: isChecked ? "#01B574" : BRAND_HEX,
              }}
            >
              <Text
                fontSize="xs"
                fontWeight={isToday || isChecked ? "800" : "500"}
                color={
                  isChecked ? "#01B574"
                    : isToday ? BRAND_HEX
                      : isFuture ? "app.text.muted"
                        : "app.text.primary"
                }
                mb={isChecked ? "2" : "0"}
              >
                {day}
              </Text>
              {isChecked && (
                <Circle
                  size="1.5"
                  bg="#01B574"
                  position="absolute"
                  bottom="1.5"
                  boxShadow="0 0 6px #01B574"
                />
              )}
            </Flex>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
});
AttendanceCalendar.displayName = "AttendanceCalendar";

// ─── QuickActionButton ────────────────────────────────────────────────────────

interface QuickActionProps {
  label: string;
  icon: ElementType;
  gradient: string;
  accentHex: string;
  danger?: boolean;
  onClick?: () => void;
}

const QuickAction = memo(({ label, icon, gradient, accentHex, danger = false, onClick }: QuickActionProps) => {
  const bg = useColorModeValue("rgba(255,255,255,0.6)", "rgba(255,255,255,0.04)");
  const border = useColorModeValue("rgba(226,232,240,0.7)", "rgba(255,255,255,0.07)");

  return (
    <Button
      variant="ghost"
      justifyContent="start"
      h="12"
      w="full"
      px={3}
      borderRadius="xl"
      bg={bg}
      border="1px solid"
      borderColor={border}
      onClick={onClick}
      color="app.text.primary"
      transition="all 0.2s cubic-bezier(0.175,0.885,0.32,1.275)"
      _hover={{
        transform: "translateX(5px) translateY(-1px)",
        bg: `${accentHex}0d`,
        borderColor: `${accentHex}35`,
        boxShadow: `0 4px 16px ${accentHex}22`,
      }}
      _active={{ transform: "translateX(2px) scale(0.98)" }}
    >
      <Circle
        size="8"
        style={{ background: danger ? "rgba(227,26,26,0.12)" : `${accentHex}18`, color: danger ? "#E31A1A" : accentHex }}
        mr={3}
        flexShrink={0}
      >
        <Icon as={icon} boxSize={4} />
      </Circle>
      <Text fontSize="sm" fontWeight="700">{label}</Text>
    </Button>
  );
});
QuickAction.displayName = "QuickAction";



// ─── EditMemberModal ──────────────────────────────────────────────────────────
// Pre-populated dialog replicating the addMember.json field schema.
// Tabs: Personal Details | Fitness Goals
// Submit fires PUT /gym/members/:id — replace toaster stub with real API call.

type EditFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  fitnessGoals: string;
};

interface EditMemberModalProps {
  open: boolean;
  member: any | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const EDIT_TABS = ["Personal Details", "Fitness Goals"] as const;
type EditTab = (typeof EDIT_TABS)[number];

const EditMemberModal = memo(({ open, member, onClose, onSuccess }: EditMemberModalProps) => {
  const [activeTab, setActiveTab] = useState<EditTab>("Personal Details");
  const [saving, setSaving] = useState(false);

  const overlayBg = useColorModeValue("rgba(0,0,0,0.45)", "rgba(0,0,0,0.7)");
  const dialogBg = useColorModeValue("rgba(255,255,255,0.97)", "rgba(14,18,36,0.97)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const inputBg = useColorModeValue("rgba(248,250,252,0.9)", "rgba(255,255,255,0.04)");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const muted = useColorModeValue("gray.500", "gray.400");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditFormValues>();

  // Pre-populate form when modal opens or member data changes
  useEffect(() => {
    if (open && member?.data) {
      reset({
        firstName: member.data.firstName || "",
        lastName: member.data.lastName || "",
        email: member.data.email || "",
        phone: member.data.phone || "",
        gender: member.data.gender || "",
        address: member.data.address || "",
        fitnessGoals: member.data.fitnessGoals || "",
      });
      setActiveTab("Personal Details");
    }
  }, [open, member, reset]);

  const handleOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open) onClose();
  }, [onClose]);

  const onSubmit = useCallback(async (data: EditFormValues) => {
    setSaving(true);
    try {
      // TODO: wire to real API — PUT /gym/members/:id
      await new Promise(r => setTimeout(r, 900)); // stub delay
      toaster.create({ title: "Profile Updated", description: "Member details saved successfully.", type: "success" });
      onSuccess?.();
      onClose();
    } catch {
      toaster.create({ title: "Update Failed", description: "Could not save changes. Try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  }, [onClose, onSuccess]);

  const inputStyles = {
    bg: inputBg,
    border: "1px solid",
    borderColor,
    borderRadius: "xl" as const,
    fontSize: "sm" as const,
    fontWeight: "600" as const,
    h: "42px",
    px: 4 as const,
    color: "app.text.primary" as const,
    _focus: { borderColor: `${BRAND_HEX}60`, boxShadow: `0 0 0 3px ${BRAND_HEX}18` },
    _hover: { borderColor: `${BRAND_HEX}40` },
    transition: "all 0.2s",
  };

  const FieldLabel = ({ children, required }: { children: string; required?: boolean }) => (
    <Text fontSize="10px" fontWeight="800" color={labelColor} textTransform="uppercase" letterSpacing="wider" mb={1.5}>
      {children}{required && <Box as="span" color="red.400" ml={0.5}>*</Box>}
    </Text>
  );

  // Pre-compute values needed inside map callbacks (hooks can't be called inside callbacks)
  const genderBorder = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");
  const tabBarBg = useColorModeValue("gray.100", "rgba(255,255,255,0.04)");
  const closeHoverBg = useColorModeValue("gray.100", "rgba(255,255,255,0.05)");
  const statusBoxBg = useColorModeValue("rgba(248,250,252,0.6)", "rgba(255,255,255,0.02)");
  const cancelHoverBg = useColorModeValue("gray.50", "rgba(255,255,255,0.04)");

  // NOTE: intentionally NO early return here — all hooks must run unconditionally
  // (Rules of Hooks). The DialogRoot open prop controls visibility instead.

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange} size="lg" placement="center">
      <DialogBackdrop bg={overlayBg} backdropFilter="blur(12px)" />
      <DialogContent
        bg={dialogBg}
        backdropFilter="blur(28px)"
        borderColor={borderColor}
        border="1px solid"
        borderRadius="24px"
        boxShadow="0 40px 80px rgba(0,0,0,0.4)"
        overflow="hidden"
        maxH="90vh"
        display="flex"
        flexDirection="column"
      >
        {/* Brand accent strip */}
        <Box h="3px" bg={BRAND_GRADIENT} flexShrink={0} />

        {/* Header */}
        <DialogHeader
          borderBottomWidth="1px"
          borderColor={borderColor}
          p={5}
          flexShrink={0}
        >
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <Circle size={10} style={{ background: BRAND_GRADIENT }} color="white">
                <Edit size={16} />
              </Circle>
              <VStack align="start" gap={0}>
                <DialogTitle fontSize="md" fontWeight="900" color="app.text.primary">
                  Edit Member Profile
                </DialogTitle>
                <Text fontSize="xs" color={muted}>
                  {member?.data?.firstName} {member?.data?.lastName}
                </Text>
              </VStack>
            </HStack>
            <DialogCloseTrigger
              color="app.text.muted"
              _hover={{ color: "app.text.primary", bg: closeHoverBg }}
              borderRadius="lg"
            />
          </HStack>

          {/* Tab strip */}
          <HStack gap={1} mt={4} p={1} borderRadius="12px" bg={tabBarBg}>
            {EDIT_TABS.map(tab => {
              const isActive = activeTab === tab;
              return (
                <Button
                  key={tab}
                  flex={1}
                  h="34px"
                  borderRadius="10px"
                  fontSize="xs"
                  fontWeight="800"
                  onClick={() => setActiveTab(tab)}
                  style={isActive ? { background: BRAND_GRADIENT, color: "white" } : {}}
                  variant={isActive ? undefined : "ghost"}
                  color={isActive ? "white" : "app.text.muted"}
                  boxShadow={isActive ? `0 4px 12px ${BRAND_HEX}59` : undefined}
                  transition="all 0.2s"
                >
                  {tab}
                </Button>
              );
            })}
          </HStack>
        </DialogHeader>

        {/* Body */}
        <DialogBody p={6} overflowY="auto" flex={1}>
          <form id="edit-member-form" onSubmit={handleSubmit(onSubmit)}>
            {activeTab === "Personal Details" && (
              <VStack align="stretch" gap={5}>
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box>
                    <FieldLabel required>First Name</FieldLabel>
                    <Input
                      {...register("firstName", { required: "Required" })}
                      placeholder="First name"
                      {...inputStyles}
                    />
                    {errors.firstName && (
                      <Text fontSize="10px" color="red.400" mt={1} fontWeight="700">{errors.firstName.message}</Text>
                    )}
                  </Box>
                  <Box>
                    <FieldLabel required>Last Name</FieldLabel>
                    <Input
                      {...register("lastName", { required: "Required" })}
                      placeholder="Last name"
                      {...inputStyles}
                    />
                    {errors.lastName && (
                      <Text fontSize="10px" color="red.400" mt={1} fontWeight="700">{errors.lastName.message}</Text>
                    )}
                  </Box>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
                  <Box>
                    <FieldLabel required>Email Address</FieldLabel>
                    <Input
                      {...register("email", {
                        required: "Required",
                        pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                      })}
                      type="email"
                      placeholder="member@example.com"
                      {...inputStyles}
                    />
                    {errors.email && (
                      <Text fontSize="10px" color="red.400" mt={1} fontWeight="700">{errors.email.message}</Text>
                    )}
                  </Box>
                  <Box>
                    <FieldLabel required>Phone Number</FieldLabel>
                    <Input
                      {...register("phone", { required: "Required" })}
                      type="tel"
                      placeholder="+91 9876543210"
                      {...inputStyles}
                    />
                    {errors.phone && (
                      <Text fontSize="10px" color="red.400" mt={1} fontWeight="700">{errors.phone.message}</Text>
                    )}
                  </Box>
                </Grid>

                <Box>
                  <FieldLabel required>Gender</FieldLabel>
                  <HStack gap={3}>
                    {(["male", "female", "other"] as const).map(g => (
                      // Use native <label> — Chakra Box does not forward htmlFor
                      <label
                        key={g}
                        htmlFor={`gender-${g}`}
                        style={{ flex: 1, cursor: "pointer" }}
                      >
                        <input
                          id={`gender-${g}`}
                          type="radio"
                          value={g}
                          {...register("gender", { required: "Required" })}
                          style={{ display: "none" }}
                        />
                        <Flex
                          h="42px"
                          align="center"
                          justify="center"
                          borderRadius="xl"
                          border="1px solid"
                          borderColor={genderBorder}
                          bg={inputBg}
                          fontSize="sm"
                          fontWeight="700"
                          color="app.text.primary"
                          textTransform="capitalize"
                          transition="all 0.18s"
                          _hover={{ borderColor: `${BRAND_HEX}50`, bg: `${BRAND_HEX}06` }}
                        >
                          {g}
                        </Flex>
                      </label>
                    ))}
                  </HStack>
                  {errors.gender && (
                    <Text fontSize="10px" color="red.400" mt={1} fontWeight="700">{errors.gender.message}</Text>
                  )}
                </Box>

                <Box>
                  <FieldLabel>Residential Address</FieldLabel>
                  <Textarea
                    {...register("address")}
                    placeholder="Enter full address..."
                    rows={3}
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="600"
                    color="app.text.primary"
                    px={4}
                    py={3}
                    resize="none"
                    _focus={{ borderColor: `${BRAND_HEX}60`, boxShadow: `0 0 0 3px ${BRAND_HEX}18` }}
                    _hover={{ borderColor: `${BRAND_HEX}40` }}
                    transition="all 0.2s"
                  />
                </Box>
              </VStack>
            )}

            {activeTab === "Fitness Goals" && (
              <VStack align="stretch" gap={5}>
                {/* Status chip */}
                <Box
                  p={4}
                  borderRadius="16px"
                  border="1px solid"
                  borderColor={borderColor}
                  bg={statusBoxBg}
                >
                  <Text fontSize="xs" color={muted} fontWeight="600" mb={1}>
                    Member status controls access and billing. Contact admin to change status.
                  </Text>
                  <HStack gap={2}>
                    <Circle size={2} style={{ background: BRAND_HEX }} />
                    <Text fontSize="sm" fontWeight="700" color="app.text.primary" textTransform="capitalize">
                      {member?.data?.status || "N/A"}
                    </Text>
                  </HStack>
                </Box>

                <Box>
                  <FieldLabel>Fitness Objectives</FieldLabel>
                  <Textarea
                    {...register("fitnessGoals")}
                    placeholder="e.g. Weight loss, Muscle gain, Flexibility improvement..."
                    rows={5}
                    bg={inputBg}
                    border="1px solid"
                    borderColor={borderColor}
                    borderRadius="xl"
                    fontSize="sm"
                    fontWeight="600"
                    color="app.text.primary"
                    px={4}
                    py={3}
                    resize="none"
                    _focus={{ borderColor: `${BRAND_HEX}60`, boxShadow: `0 0 0 3px ${BRAND_HEX}18` }}
                    _hover={{ borderColor: `${BRAND_HEX}40` }}
                    transition="all 0.2s"
                  />
                </Box>

                {/* Read-only info rows */}
                <VStack align="stretch" gap={0}>
                  {[
                    { label: "Member ID", value: member?.data?.member_id || "—" },
                    { label: "Joined", value: fmtDate(member?._meta?.created?.at) },
                    { label: "Current Plan", value: member?.subscription?.plan_name || "No plan" },
                  ].map(({ label, value }, idx) => (
                    <Box key={label}>
                      {idx > 0 && <Separator borderColor={borderColor} />}
                      <Flex justify="space-between" align="center" py={3}>
                        <Text fontSize="10px" fontWeight="800" color={muted} letterSpacing="wider" textTransform="uppercase">{label}</Text>
                        <Text fontSize="xs" fontWeight="700" color="app.text.primary">{value}</Text>
                      </Flex>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            )}
          </form>
        </DialogBody>

        {/* Footer */}
        <DialogFooter
          borderTopWidth="1px"
          borderColor={borderColor}
          p={5}
          flexShrink={0}
        >
          <HStack w="full" justify="space-between">
            <Button
              variant="outline"
              h="42px"
              px={6}
              borderRadius="xl"
              fontWeight="700"
              borderColor={borderColor}
              color="app.text.primary"
              onClick={onClose}
              _hover={{ bg: useColorModeValue("gray.50", "rgba(255,255,255,0.04)") }}
            >
              Cancel
            </Button>
            <HStack gap={3}>
              {activeTab === "Personal Details" && (
                <Button
                  h="42px"
                  px={6}
                  borderRadius="xl"
                  fontWeight="900"
                  variant="outline"
                  borderColor={`${BRAND_HEX}40`}
                  style={{ color: BRAND_HEX }}
                  _hover={{ bg: `${BRAND_HEX}0d` }}
                  onClick={() => setActiveTab("Fitness Goals")}
                >
                  Next →
                </Button>
              )}
              <Button
                type="submit"
                form="edit-member-form"
                h="42px"
                px={8}
                borderRadius="xl"
                fontWeight="900"
                style={{ background: BRAND_GRADIENT, color: "white" }}
                boxShadow={`0 6px 18px ${BRAND_HEX}66`}
                loading={saving}
                _hover={{ transform: "translateY(-1px)", boxShadow: `0 10px 24px ${BRAND_HEX}80` }}
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.25s cubic-bezier(0.175,0.885,0.32,1.275)"
              >
                Save Changes
              </Button>
            </HStack>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
});
EditMemberModal.displayName = "EditMemberModal";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const MemberDetail = memo(() => {
  const { params: memberId } = useParams();
  const { member, loading, notFound, error, refresh } = useGymMember(memberId);
  const { navigateTo, goBack } = useWorkspaceRouter();

  const [editOpen, setEditOpen] = useState(false);

  const name = useMemo(() => getName(member?.data), [member]);
  const status = (member?.data.status || "frozen") as StatusKey;
  const sm = STATUS_META[status] ?? STATUS_META.frozen;
  const sub = member?.subscription;

  const pageBg = useColorModeValue("rgba(248,250,252,1)", "bg.default");
  const muted = useColorModeValue("gray.500", "gray.400");
  const handleBack = useCallback(() => goBack(), [goBack]);
  // Must be declared BEFORE the useEffect below that closes over it
  const handleEditProfile = useCallback(() => setEditOpen(true), []);
  const handleCloseEdit = useCallback(() => setEditOpen(false), []);

  const { setActions, clearActions } = useNavActionStore();

  // ── Portal Edit + Refresh buttons into the AppBreadcrumb nav slot ──
  // useEffect re-runs whenever loading changes so the Refresh spinner stays
  // in sync. clearActions on unmount prevents stale buttons leaking into
  // other pages when navigating away.
  useEffect(() => {
    setActions(
      <HStack gap={2}>
        <Button
          variant="outline"
          size="sm"
          h="34px"
          px={4}
          borderRadius="md"
          fontWeight="700"
          borderColor="rgba(226,232,240,0.8)"
          color="app.text.primary"
          onClick={handleEditProfile}
          _hover={{ bg: `${BRAND_HEX}0d`, borderColor: `${BRAND_HEX}40` }}
          _active={{ transform: "scale(0.97)" }}
        >
          <HStack gap={1.5}>
            <Edit size={13} />
            <Text>Edit</Text>
          </HStack>
        </Button>
        <Button
          size="sm"
          h="34px"
          px={4}
          borderRadius="md"
          fontWeight="700"
          style={{ background: BRAND_GRADIENT, color: "white" }}
          boxShadow={`0 4px 14px ${BRAND_HEX}59`}
          onClick={() => refresh()}
          loading={loading}
          _hover={{ transform: "translateY(-1px)", boxShadow: `0 8px 20px ${BRAND_HEX}80` }}
          _active={{ transform: "scale(0.97)" }}
        >
          <HStack gap={1.5}>
            <RefreshCw size={13} />
            <Text>Refresh</Text>
          </HStack>
        </Button>
      </HStack>
    );
    // Clear nav actions when leaving this page
    return () => clearActions();
  }, [loading, handleEditProfile, refresh, setActions, clearActions]);

  const handleAssignPlan = useCallback(() => {
    if (!memberId) return;
    navigateTo("plans", memberId);
  }, [navigateTo, memberId]);

  const handleViewInvoice = useCallback((invoiceNumber: string) => {
    navigateTo("invoiceView", encodeURIComponent(invoiceNumber));
  }, [navigateTo]);

  const handleViewOrder = useCallback((orderNumber: string) => {
    navigateTo("orderView", encodeURIComponent(orderNumber));
  }, [navigateTo]);

  const handleFreeze = useCallback(() => {
    toaster.create({ title: "Freeze Membership", description: "Freeze command dispatched.", type: "warning" });
  }, []);
  const handleMessage = useCallback(() => {
    toaster.create({ title: "Send Message", description: "Messaging initialized.", type: "info" });
  }, []);
  const handleExport = useCallback(() => {
    toaster.create({ title: "Export Profile", description: "Profile compiled for export.", type: "success" });
  }, []);
  const handleDeactivate = useCallback(() => {
    toaster.create({ title: "Deactivate Account", description: "Deactivation prompt initialized.", type: "error" });
  }, []);

  const daysRemaining = useMemo(() => {
    if (!sub?.end_date) return null;
    const end = new Date(sub.end_date);
    if (Number.isNaN(end.getTime())) return null;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  }, [sub]);

  const avatarSrc = useMemo(() =>
    member?.data?.avatar || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=600&auto=format&fit=crop",
    [member]
  );

  // ── Error / Not Found ──
  if (!loading && (notFound || error || !member)) {
    return (
      <Box w="full" minH="80vh" bg={pageBg} p={{ base: 4, md: 8 }} borderRadius="16px">
        <Flex direction="column" align="center" justify="center" py={20} gap={5}>
          <Circle size={20} style={{ background: "rgba(227,26,26,0.1)", color: "#E31A1A" }}>
            <ShieldCheck size={32} />
          </Circle>
          <VStack gap={2} textAlign="center">
            <Heading size="md" fontWeight="900">Profile Unavailable</Heading>
            <Text color="app.text.muted" maxW="sm">
              {error ? `Error: ${error}` : "Member record not found or has been deleted."}
            </Text>
          </VStack>
          <Button
            h="44px" px={7} borderRadius="xl" fontWeight="900"
            style={{ background: BRAND_GRADIENT, color: "white" }}
            boxShadow={`0 8px 24px ${BRAND_HEX}66`}
            onClick={handleBack}
            _hover={{ transform: "translateY(-2px)", boxShadow: `0 14px 32px ${BRAND_HEX}80` }}
            _active={{ transform: "scale(0.98)" }}
          >
            Return to Directory
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      bg={pageBg}
      fontFamily="'Inter', sans-serif"
    >
      {/* Ambient orbs */}
      <Box
        position="fixed" top="-80px" right="-80px"
        w="400px" h="400px" borderRadius="full"
        bg={`${BRAND_HEX}12`} filter="blur(110px)"
        pointerEvents="none" zIndex={0}
      />

      {/* Premium Member Hero Banner */}
      <Box
        w="full"
        mb={6}
        borderRadius="24px"
        bg={useColorModeValue("rgba(255,255,255,0.85)", "rgba(18,22,40,0.72)")}
        backdropFilter="blur(24px) saturate(190%)"
        border="1px solid"
        borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.07)")}
        boxShadow={useColorModeValue("0 8px 32px rgba(0,0,0,0.04)", "0 8px 32px rgba(0,0,0,0.18)")}
        overflow="hidden"
        position="relative"
        zIndex={1}
      >
        {/* Colored top gradient decoration */}
        <Box h="120px" bg={BRAND_GRADIENT} position="relative" />

        {/* Banner Info Area */}
        <Flex
          direction={{ base: "column", md: "row" }}
          px={8}
          pb={6}
          pt={0}
          align={{ base: "start", md: "center" }}
          gap={6}
          mt="-50px"
          position="relative"
          zIndex={2}
        >
          {/* Large Profile Initials Circle */}
          <Circle
            size="100px"
            bg={useColorModeValue("white", "rgba(18,22,40,1)")}
            border="4px solid"
            borderColor={useColorModeValue("white", "rgba(18,22,40,1)")}
            boxShadow="lg"
            overflow="hidden"
            flexShrink={0}
          >
            <Circle
              size="100%"
              bg={`linear-gradient(135deg, ${BRAND_HEX}22, ${BRAND_ALT}22)`}
              color={BRAND_HEX}
              fontWeight="900"
              fontSize="3xl"
            >
              {name.initials}
            </Circle>
          </Circle>

          {/* Name, ID and Status Details */}
          <VStack
            align="start"
            gap={1.5}
            flex={1}
            p={3.5}
            px={5}
            borderRadius="2xl"
            bg={useColorModeValue("rgba(255,255,255,0.5)", "rgba(255,255,255,0.02)")}
            border="1px solid"
            borderColor={useColorModeValue("rgba(226,232,240,0.5)", "rgba(255,255,255,0.04)")}
            backdropFilter="blur(10px)"
          >
            <HStack gap={3} flexWrap="wrap" align="center">
              <Skeleton loading={loading}>
                <Heading fontSize="2xl" fontWeight="950" color="app.text.primary" letterSpacing="tight" lineHeight="1.2">
                  {name.full}
                </Heading>
              </Skeleton>
              <Skeleton loading={loading}>
                <Badge
                  fontSize="10px"
                  fontWeight="900"
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg={`${sm.hex}22`}
                  color={sm.hex}
                  border={`1px solid ${sm.hex}40`}
                  boxShadow={`0 0 10px ${sm.hex}20`}
                >
                  {sm.label.toUpperCase()}
                </Badge>
              </Skeleton>
            </HStack>
            <HStack gap={4} flexWrap="wrap" color={muted} fontSize="xs" fontWeight="600">
              <Text fontFamily="mono">{member?.data.member_id || memberId}</Text>
              <Text>•</Text>
              <Text>Joined {fmtDate(member?._meta.created?.at || member?.data.joinDate)}</Text>
              {sub?.plan_name && (
                <>
                  <Text>•</Text>
                  <Text color={BRAND_HEX}>{sub.plan_name}</Text>
                </>
              )}
            </HStack>
            <Button
              h="38px"
              px={5}
              borderRadius="xl"
              fontWeight="900"
              fontSize="xs"
              style={{ background: BRAND_GRADIENT, color: "white" }}
              boxShadow={`0 6px 18px ${BRAND_HEX}66`}
              onClick={handleAssignPlan}
              _hover={{ transform: "translateY(-2px)", boxShadow: `0 12px 28px ${BRAND_HEX}80` }}
              _active={{ transform: "scale(0.98)" }}
              transition="all 0.25s"
              mt={2}
            >
              <Zap size={13} />
              <Text ml={1.5}>{sub ? "Renew Membership Plan" : "Assign Plan Template"}</Text>
            </Button>
          </VStack>
        </Flex>
      </Box>

      {/* Main Grid */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(12,1fr)" }}
        gap={6}
        position="relative"
        zIndex={1}
        mb={6}
      >
        {/* ════ LEFT COLUMN ════ */}
        <GridItem colSpan={{ base: 12, lg: 4 }}>
          <VStack align="stretch" gap={5}>
            
            {/* Personal Info */}
            <GlassCard>
              <SectionHeading>Personal Info</SectionHeading>
              <VStack align="stretch" gap={0}>
                <InfoRow icon={CalendarDays} label="Join Date" value={fmtDate(member?._meta.created?.at || member?.data.joinDate)} iconColor={BRAND_HEX} />
                <InfoRow icon={Mail} label="Email" value={member?.data.email || "Not recorded"} iconColor="#06B6D4" />
                <InfoRow icon={Phone} label="Phone" value={member?.data.phone || "Not recorded"} iconColor="#01B574" />
                <InfoRow icon={User} label="Gender" value={member?.data.gender || "Not recorded"} iconColor="#FFB547" />
                <InfoRow icon={MapPin} label="Address" value={member?.data.address || "Not recorded"} iconColor="#EE5D50" />
              </VStack>
            </GlassCard>

            {/* Fitness & Health Metrics Card */}
            <GlassCard>
              <SectionHeading>Fitness & Health Metrics</SectionHeading>
              <SimpleGrid columns={3} gap={3} mb={4}>
                <StatBox
                  label="Weight"
                  value={<AnimatedCounter value={member?.data.weight || 195} />}
                  unit="lbs"
                  color="blue"
                />
                <StatBox
                  label="Body Fat"
                  value={<AnimatedDecimalCounter value={member?.data?.bodyFat || 11.4} />}
                  unit="%"
                  color="green"
                />
                <StatBox
                  label="Height"
                  value={member?.data.height || `6'2"`}
                  color="red"
                />
              </SimpleGrid>

              {member?.data.fitnessGoals && (
                <>
                  <Separator borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")} my={4} />
                  <VStack align="start" gap={1.5}>
                    <Text fontSize="10px" fontWeight="800" color="app.text.muted" textTransform="uppercase" letterSpacing="wider">
                      Fitness Objectives
                    </Text>
                    <Text fontSize="xs" color="app.text.primary" fontWeight="600" lineHeight="relaxed">
                      {member?.data.fitnessGoals}
                    </Text>
                  </VStack>
                </>
              )}
            </GlassCard>

            {/* Account Health */}
            <GlassCard>
              <SectionHeading>Account Health</SectionHeading>
              <VStack align="stretch" gap={4}>
                {/* Health bar */}
                <Box>
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="xs" fontWeight="700" color="app.text.muted">Health Score</Text>
                    <Text fontSize="xs" fontWeight="900" style={{ color: sm.hex }}>
                      {status === "active" ? "88%" : status === "attention" ? "54%" : "22%"}
                    </Text>
                  </Flex>
                  <Box
                    h="6px"
                    bg={useColorModeValue("gray.100", "rgba(255,255,255,0.06)")}
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      w={status === "active" ? "88%" : status === "attention" ? "54%" : "22%"}
                      style={{ background: sm.gradient }}
                      borderRadius="full"
                      transition="width 0.6s ease"
                    />
                  </Box>
                </Box>

                <Text fontSize="xs" color={muted} fontWeight="500" lineHeight="tall">
                  {status === "attention"
                    ? "This member needs staff follow-up. Review renewal status and contact history."
                    : status === "frozen"
                      ? "No active subscription. Assign a plan to reactivate this account."
                      : "This profile is healthy and ready for regular member operations."}
                </Text>

                {daysRemaining !== null && (
                  <>
                    <Separator borderColor={useColorModeValue("rgba(226,232,240,0.6)", "rgba(255,255,255,0.06)")} />
                    <Flex justify="space-between" align="center">
                      <HStack gap={2}>
                        <Clock size={13} color={muted} />
                        <Text fontSize="xs" color={muted} fontWeight="700">Days Remaining</Text>
                      </HStack>
                      <Badge
                        px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="900"
                        style={{
                          background: daysRemaining <= 7 ? "rgba(255,181,71,0.15)" : `${BRAND_HEX}15`,
                          color: daysRemaining <= 7 ? "#FFB547" : BRAND_HEX,
                          border: `1px solid ${daysRemaining <= 7 ? "#FFB547" : BRAND_HEX}30`,
                        }}
                      >
                        {daysRemaining}d
                      </Badge>
                    </Flex>
                  </>
                )}
              </VStack>
            </GlassCard>
          </VStack>
        </GridItem>

        {/* ════ RIGHT COLUMN ════ */}
        <GridItem colSpan={{ base: 12, lg: 8 }}>
          <VStack align="stretch" gap={5} h="full">
            {/* Attendance Calendar */}
            <GlassCard>
              <AttendanceCalendar />
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard flex={1}>
              <SectionHeading>Quick Actions</SectionHeading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                <QuickAction icon={MessageSquare} label="Send Message" gradient={BRAND_GRADIENT} accentHex={BRAND_HEX} onClick={handleMessage} />
                <QuickAction icon={Zap} label="Assign / Renew" gradient={BRAND_GRADIENT} accentHex={BRAND_ALT} onClick={handleAssignPlan} />
                <QuickAction icon={Snowflake} label="Freeze Account" gradient="linear-gradient(135deg,#3965FF,#002DFF)" accentHex="#3965FF" onClick={handleFreeze} />
                <QuickAction icon={FileText} label="Export Profile" gradient="linear-gradient(135deg,#06B6D4,#0891B2)" accentHex="#06B6D4" onClick={handleExport} />
                <QuickAction icon={Trash2} label="Deactivate Member" gradient="linear-gradient(135deg,#EE5D50,#C52A1D)" accentHex="#EE5D50" danger onClick={handleDeactivate} />
              </SimpleGrid>
            </GlassCard>
          </VStack>
        </GridItem>
      </Grid>

      {/* ── Membership & Billing — FULL WIDTH ── */}
      <GlassCard hover={false} position="relative" zIndex={1}>
        {memberId && (
          <MemberMembershipAndBilling
            memberId={memberId}
            onAssignPlan={handleAssignPlan}
            onViewInvoice={handleViewInvoice}
            onViewOrder={handleViewOrder}
          />
        )}
      </GlassCard>

      {/* ── Edit Member Dialog ── */}
      <EditMemberModal
        open={editOpen}
        member={member}
        onClose={handleCloseEdit}
        onSuccess={refresh}
      />
    </Box>
  );
});

MemberDetail.displayName = "MemberDetail";
export default MemberDetail;
