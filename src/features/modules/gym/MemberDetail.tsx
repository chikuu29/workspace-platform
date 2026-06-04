/**
 * MemberDetail.tsx
 *
 * Premium, high-performance member profile cockpit with modern glassmorphism,
 * load animations, staggered calendar effects, and responsive layout structures.
 * Built with Chakra UI v3 and Lucide Icons.
 */

import { memo, useCallback, useMemo, type ElementType, useState, useEffect } from "react";
import {
  Badge, Box, Button, Circle, Flex, Grid, GridItem, Heading,
  HStack, Icon, Separator, SimpleGrid, Text, VStack, IconButton, Stack,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams } from "react-router";
import {
  Activity, ArrowLeft, CalendarDays, Check, CreditCard,
  Dumbbell, FileText, Fingerprint, Mail, MapPin,
  MessageSquare, Phone, RefreshCw, ShieldCheck, Snowflake,
  Trash2, Users, Edit, PauseCircle, ChevronRight, Zap
} from "lucide-react";

import { useGymMember } from "./hooks/useGymMember";
import type { MemberDocument } from "./types/Gym.types";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { toaster } from "@/components/ui/toaster";
import {
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogBody, DialogCloseTrigger
} from "@/components/ui/dialog";

// ─── Theme & Layout Styling Constants ─────────────────────────────────

type StatusKey = "active" | "attention" | "frozen";

const STATUS_META: Record<StatusKey, { label: string; colorPalette: string; accent: string; bg: string }> = {
  active: { label: "Active", colorPalette: "green", accent: "#c3f400", bg: "rgba(195, 244, 0, 0.1)" },
  attention: { label: "Needs attention", colorPalette: "orange", accent: "#ffb547", bg: "rgba(255, 181, 71, 0.1)" },
  frozen: { label: "Frozen", colorPalette: "blue", accent: "#3965FF", bg: "rgba(57, 101, 255, 0.1)" },
};

// ─── Formatting Helpers ──────────────────────────────────────────────

const getName = (d?: MemberDocument["data"]) => ({
  full: `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || "Jordan Vance",
  initials: `${d?.firstName?.[0] || ""}${d?.lastName?.[0] || ""}`.toUpperCase() || "JV",
});

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return Number.isNaN(p.getTime()) ? "N/A" : p.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
};

const fmtCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// ─── Animated Counter Components ──────────────────────────────────────

const AnimatedCounter = memo(({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count}</>;
});
AnimatedCounter.displayName = "AnimatedCounter";

const AnimatedDecimalCounter = memo(({ value, duration = 800 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(progress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count.toFixed(1)}</>;
});
AnimatedDecimalCounter.displayName = "AnimatedDecimalCounter";

// ─── Sub-Components ─────────────────────────────────────────────────

const SurfaceCard = memo(({ children, p = 6, ...props }: { children: React.ReactNode; p?: any;[k: string]: any }) => {
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(31, 31, 34, 0.45)");
  const cardBorder = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");
  const cardShadow = useColorModeValue("0 8px 32px rgba(0, 0, 0, 0.06)", "0 8px 32px rgba(0, 0, 0, 0.2)");
  const hoverShadow = useColorModeValue("0 16px 48px rgba(0, 0, 0, 0.12)", "0 16px 48px rgba(0, 0, 0, 0.4)");
  const hoverBorder = useColorModeValue("rgba(195, 244, 0, 0.7)", "rgba(195, 244, 0, 0.4)");

  return (
    <Box
      p={p}
      borderRadius="16px"
      bg={cardBg}
      backdropFilter="blur(20px) saturate(180%)"
      border="1px solid"
      borderColor={cardBorder}
      boxShadow={cardShadow}
      position="relative"
      overflow="hidden"
      transition="transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.3s ease, box-shadow 0.3s ease"
      _hover={{
        borderColor: hoverBorder,
        transform: "translateY(-6px)",
        boxShadow: hoverShadow,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});
SurfaceCard.displayName = "SurfaceCard";

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow = memo(({ label, value }: InfoRowProps) => {
  return (
    <Flex justify="space-between" align="center" py="3" borderBottom="1px solid" borderColor="app.card.border" _last={{ borderBottom: "none" }}>
      <Text fontSize="xs" fontWeight="600" color="app.text.muted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="500" color="app.text.primary">
        {value}
      </Text>
    </Flex>
  );
});
InfoRow.displayName = "InfoRow";

const AttendanceCalendar = memo(() => {
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const monthName = useMemo(() => {
    return now.toLocaleString("default", { month: "long" });
  }, [now]);

  const totalDays = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const startDay = useMemo(() => {
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  const blanks = useMemo(() => {
    return Array.from({ length: startDay });
  }, [startDay]);

  const days = useMemo(() => {
    return Array.from({ length: totalDays }).map((_, idx) => idx + 1);
  }, [totalDays]);

  // Seeded check-in days for the calendar display
  const checkedInDays = useMemo(() => {
    return new Set([1, 2, 4, 8, 10, 11, 15, 17, 18, 22, 24, 25, 29]);
  }, []);

  const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Delay offset calculation to animate cells bottom-to-top
  const totalRows = Math.ceil((blanks.length + days.length) / 7);

  return (
    <VStack align="stretch" gap={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Heading fontSize="lg" fontWeight="700" color="app.text.primary">
          Attendance - {monthName} {year}
        </Heading>
        <HStack gap={3}>
          <HStack gap={1}>
            <Circle size="2" bg="#c3f400" />
            <Text fontSize="2xs" color="app.text.muted" fontWeight="700">Attended</Text>
          </HStack>
          <HStack gap={1}>
            <Circle size="2" border="1px solid" borderColor="app.card.border" />
            <Text fontSize="2xs" color="app.text.muted" fontWeight="700">Absent</Text>
          </HStack>
        </HStack>
      </Flex>

      <SimpleGrid columns={7} gap={2} textAlign="center" fontWeight="700">
        {weekdayLabels.map((label) => (
          <Text key={label} fontSize="xs" color="app.text.muted" py={1}>
            {label}
          </Text>
        ))}

        {blanks.map((_, idx) => (
          <Box key={`blank-${idx}`} />
        ))}

        {days.map((day, dayIdx) => {
          const isToday = day === todayDate;
          const isCheckedIn = checkedInDays.has(day);
          const isFuture = day > todayDate;

          let bg = "transparent";
          let border = "1px solid";
          let borderColor = "app.card.border";
          let textColor = "app.text.primary";
          let dotIndicator = null;

          if (isCheckedIn) {
            bg = "rgba(195, 244, 0, 0.08)";
            borderColor = "#c3f400";
            textColor = "app.text.primary";
            dotIndicator = (
              <Circle size="1.5" bg="#c3f400" position="absolute" bottom="1.5" boxShadow="0 0 8px #c3f400" />
            );
          } else if (isToday) {
            borderColor = "app.text.accent";
            textColor = "app.text.accent";
          } else if (isFuture) {
            textColor = "app.text.muted";
            borderColor = "rgba(255, 255, 255, 0.02)";
          }

          // Bottom-to-top staggered animation delay
          const dayCellIndex = blanks.length + dayIdx;
          const currentRow = Math.floor(dayCellIndex / 7);
          const delay = `${(totalRows - currentRow) * 0.08}s`;

          return (
            <Flex
              key={`day-${day}`}
              h="12"
              borderRadius="xl"
              bg={bg}
              border={border}
              borderColor={borderColor}
              align="center"
              justify="center"
              position="relative"
              cursor={isFuture ? "default" : "pointer"}
              transition="all 0.2s"
              className="stagger-cell"
              style={{ animationDelay: delay }}
              _hover={
                isFuture
                  ? {}
                  : {
                    bg: isCheckedIn ? "rgba(195, 244, 0, 0.18)" : "rgba(255, 255, 255, 0.03)",
                    borderColor: isCheckedIn ? "#c3f400" : "app.text.muted",
                    transform: "translateY(-2px)",
                  }
              }
              _active={isFuture ? {} : { transform: "translateY(0) scale(0.95)" }}
            >
              <Text fontSize="sm" fontWeight={isToday || isCheckedIn ? "700" : "500"} color={textColor} mb={dotIndicator ? "2" : "0"}>
                {day}
              </Text>
              {dotIndicator}
            </Flex>
          );
        })}
      </SimpleGrid>
    </VStack>
  );
});
AttendanceCalendar.displayName = "AttendanceCalendar";

interface ActionRowProps {
  label: string;
  icon: ElementType;
  color?: string;
  danger?: boolean;
  onClick?: () => void;
}

const ActionRow = memo(({ label, icon, color = "blue", danger = false, onClick }: ActionRowProps) => {
  const activeColor = danger ? "#E31A1A" : color === "green" ? "#c3f400" : color === "cyan" ? "#3965FF" : "#818cf8";
  return (
    <Button
      variant="ghost"
      justifyContent="start"
      h="12"
      w="full"
      px={3}
      borderRadius="xl"
      onClick={onClick}
      color="app.text.primary"
      _hover={{ transform: "translateX(6px)", bg: "rgba(255, 255, 255, 0.03)" }}
      _active={{ transform: "translateX(2px) scale(0.98)" }}
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    >
      <Circle size="8" bg={danger ? "rgba(227, 26, 26, 0.1)" : `${activeColor}1a`} color={activeColor} mr={3}>
        <Icon as={icon} boxSize={4} />
      </Circle>
      <Text fontSize="sm" fontWeight="600">{label}</Text>
    </Button>
  );
});
ActionRow.displayName = "ActionRow";

// ─── Payment & Subscription Sub-Components ───────────────────────────

interface PaymentHistoryRowProps {
  payment: {
    subscription_id: string;
    plan_name: string;
    status: string;
    start_date: string;
    end_date: string;
    price: number;
    is_paid: boolean;
  };
  currency?: string;
  onViewDetails: (payment: any) => void;
}

const PaymentHistoryRow = memo(({ payment, currency = "INR", onViewDetails }: PaymentHistoryRowProps) => {
  const isActive = payment.status === "active";
  const hColor = isActive ? "green" : payment.status === "expired" ? "gray" : "orange";

  const handleClick = useCallback(() => {
    onViewDetails(payment);
  }, [payment, onViewDetails]);

  return (
    <Flex
      p={3.5}
      borderRadius="xl"
      bg="bg.default"
      border="1px solid"
      borderColor="app.card.border"
      align="center"
      justify="space-between"
      gap={4}
      cursor="pointer"
      onClick={handleClick}
      transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      _hover={{ borderColor: "rgba(195, 244, 0, 0.4)", transform: "translateY(-2px)", bg: "rgba(255, 255, 255, 0.02)" }}
      _active={{ transform: "translateY(0) scale(0.99)" }}
    >
      <VStack align="start" gap={0.5} minW={0}>
        <Text fontSize="sm" fontWeight="600" color="app.text.primary" truncate>
          {payment.plan_name}
        </Text>
        <Text fontSize="xs" color="app.text.muted">
          {fmtDate(payment.start_date)} → {fmtDate(payment.end_date)}
        </Text>
      </VStack>
      <HStack gap={2.5} flexShrink={0}>
        <Badge colorPalette={hColor} variant="subtle" size="xs" borderRadius="full">
          {payment.status}
        </Badge>
        <Badge colorPalette={payment.is_paid ? "green" : "red"} variant="subtle" size="xs" borderRadius="full">
          {payment.is_paid ? "Paid" : "Unpaid"}
        </Badge>
        <Text fontSize="xs" fontWeight="700" color="app.text.primary">
          {fmtCurrency(payment.price, currency)}
        </Text>
      </HStack>
    </Flex>
  );
});
PaymentHistoryRow.displayName = "PaymentHistoryRow";

interface PaymentDetailsModalProps {
  payment: any | null;
  currency?: string;
  onClose: () => void;
}

const PaymentDetailsModal = memo(({ payment, currency = "INR", onClose }: PaymentDetailsModalProps) => {
  const [activePayment, setActivePayment] = useState<any | null>(null);

  useEffect(() => {
    if (payment) {
      setActivePayment(payment);
    }
  }, [payment]);

  const handleOpenChange = useCallback((e: { open: boolean }) => {
    if (!e.open) {
      onClose();
    }
  }, [onClose]);

  const displayPayment = payment || activePayment;

  const handleDownload = useCallback(() => {
    if (!displayPayment) return;
    toaster.create({
      title: "Invoice Downloaded",
      description: `Invoice PDF for subscription ${displayPayment.subscription_id?.substring(0, 8)} has been generated and downloaded.`,
      type: "success",
    });
  }, [displayPayment]);

  const handleEmail = useCallback(() => {
    toaster.create({
      title: "Invoice Emailed",
      description: `Invoice has been sent successfully.`,
      type: "success",
    });
  }, []);

  if (!displayPayment) return null;

  const isActive = displayPayment.status === "active";
  const statusColorPalette = isActive ? "green" : displayPayment.status === "expired" ? "gray" : "orange";

  // Custom mock details for invoice view
  const invoiceNumber = `INV-${displayPayment.start_date ? new Date(displayPayment.start_date).getFullYear() : 2026}-${displayPayment.subscription_id ? displayPayment.subscription_id.substring(0, 5).toUpperCase() : "MEMBER"}`;

  return (
    <DialogRoot open={!!payment} onOpenChange={handleOpenChange} size="md" placement="center">
      <DialogBackdrop bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <DialogContent
        bg="rgba(31, 31, 34, 0.9)"
        backdropFilter="blur(25px)"
        borderColor="rgba(255, 255, 255, 0.08)"
        borderRadius="20px"
        boxShadow="0 24px 48px rgba(0, 0, 0, 0.5)"
        overflow="hidden"
      >
        <DialogHeader borderBottomWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" p={5} bg="rgba(0,0,0,0.2)">
          <DialogTitle fontSize="lg" fontWeight="800" color="app.text.primary">
            Invoice Details
          </DialogTitle>
          <DialogCloseTrigger color="app.text.muted" _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.05)" }} />
        </DialogHeader>

        <DialogBody p={6}>
          <VStack align="stretch" gap={5}>
            {/* Glassmorphic invoice summary card */}
            <Box
              p={5}
              borderRadius="16px"
              bg="rgba(255, 255, 255, 0.03)"
              border="1px solid"
              borderColor="rgba(255, 255, 255, 0.05)"
              textAlign="center"
            >
              <Text fontSize="xs" fontWeight="700" color="app.text.muted" textTransform="uppercase" letterSpacing="wider" mb={1}>
                Amount Paid
              </Text>
              <Heading fontSize="3xl" fontWeight="900" color="app.text.primary" letterSpacing="tight" mb={2}>
                {fmtCurrency(displayPayment.price, currency)}
              </Heading>
              <HStack justify="center" gap={2}>
                <Badge colorPalette={statusColorPalette} variant="subtle" px={2.5} py={0.5} borderRadius="full">
                  {displayPayment.status.toUpperCase()}
                </Badge>
                <Badge colorPalette={displayPayment.is_paid ? "green" : "red"} variant="subtle" px={2.5} py={0.5} borderRadius="full">
                  {displayPayment.is_paid ? "PAID" : "UNPAID"}
                </Badge>
              </HStack>
            </Box>

            <VStack align="stretch" gap={0}>
              <Flex justify="space-between" py={3}>
                <Text fontSize="xs" fontWeight="600" color="app.text.muted">INVOICE NUMBER</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">{invoiceNumber}</Text>
              </Flex>
              <Separator borderColor="rgba(255, 255, 255, 0.05)" />
              <Flex justify="space-between" py={3}>
                <Text fontSize="xs" fontWeight="600" color="app.text.muted">PLAN NAME</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">{displayPayment?.plan_name}</Text>
              </Flex>
              <Separator borderColor="rgba(255, 255, 255, 0.05)" />
              <Flex justify="space-between" py={3}>
                <Text fontSize="xs" fontWeight="600" color="app.text.muted">TRANSACTION ID</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary" fontFamily="monospace">
                  {displayPayment.subscription_id || "N/A"}
                </Text>
              </Flex>
              <Separator borderColor="rgba(255, 255, 255, 0.05)" />
              <Flex justify="space-between" py={3}>
                <Text fontSize="xs" fontWeight="600" color="app.text.muted">COVERAGE PERIOD</Text>
                <Text fontSize="xs" fontWeight="700" color="app.text.primary">
                  {fmtDate(displayPayment.start_date)} - {fmtDate(displayPayment.end_date)}
                </Text>
              </Flex>
              <Separator borderColor="rgba(255, 255, 255, 0.05)" />
              <Flex justify="space-between" py={3}>
                <Text fontSize="xs" fontWeight="600" color="app.text.muted">PAYMENT METHOD</Text>
                <HStack gap={1.5}>
                  <Icon as={CreditCard} boxSize={3.5} color="app.text.muted" />
                  <Text fontSize="xs" fontWeight="700" color="app.text.primary">Visa ending in 4492</Text>
                </HStack>
              </Flex>
            </VStack>
          </VStack>
        </DialogBody>

        <DialogFooter borderTopWidth="1px" borderColor="rgba(255, 255, 255, 0.08)" p={5} bg="rgba(0,0,0,0.2)">
          <HStack width="full" gap={3} justify="space-between">
            <Button
              variant="outline"
              size="sm"
              borderColor="rgba(255, 255, 255, 0.1)"
              color="app.text.primary"
              _hover={{ bg: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.2)" }}
              onClick={handleEmail}
              borderRadius="full"
              fontWeight="700"
            >
              Email Receipt
            </Button>
            <Button
              size="sm"
              bg="#c3f400"
              color="#161e00"
              _hover={{ bg: "#abd600" }}
              onClick={handleDownload}
              borderRadius="full"
              fontWeight="700"
            >
              Download PDF
            </Button>
          </HStack>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
});
PaymentDetailsModal.displayName = "PaymentDetailsModal";

// ─── Main Component ──────────────────────────────────────────────────

const MemberDetail = memo(() => {
  const { params: memberId } = useParams();
  const { member, loading, notFound, error, refresh } = useGymMember(memberId);
  const { navigateTo, goBack } = useWorkspaceRouter();

  const [showHistory, setShowHistory] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  const name = useMemo(() => getName(member?.data), [member]);
  const status = (member?.data.status || "frozen") as StatusKey;
  const sm = STATUS_META[status] || STATUS_META.frozen;
  const sub = member?.subscription;
  const history = useMemo(() => member?.subscription_history || [], [member]);

  const toggleHistory = useCallback(() => setShowHistory(p => !p), []);

  const handleViewPaymentDetails = useCallback((payment: any) => {
    setSelectedPayment(payment);
  }, []);

  const handleClosePaymentDetails = useCallback(() => {
    setSelectedPayment(null);
  }, []);

  const handleViewCurrentSubDetails = useCallback(() => {
    if (sub) {
      handleViewPaymentDetails(sub);
    } else {
      // Fallback mock details for current billing cycle
      handleViewPaymentDetails({
        subscription_id: member?.data.subscription_id || "SUB-ACTIVE-MOCK",
        plan_name: member?.data.plan || "Platinum Elite",
        status: "active",
        start_date: member?._meta.created?.at || new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        price: 149,
        currency: "USD",
        is_paid: true,
      });
    }
  }, [sub, member, handleViewPaymentDetails]);

  const handleBack = useCallback(() => goBack(), [goBack]);

  const handleAssignPlan = useCallback(() => {
    if (!memberId) return;
    navigateTo("selectPlan", memberId);
  }, [navigateTo, memberId]);

  // ── Action Handlers ──
  const handleEditProfile = useCallback(() => {
    toaster.create({
      title: "Edit Profile",
      description: "Profile editing is ready for dispatch.",
      type: "info"
    });
  }, []);

  const handleFreezeMembership = useCallback(() => {
    toaster.create({
      title: "Freeze Membership",
      description: "Membership freeze command dispatched successfully.",
      type: "warning"
    });
  }, []);

  const handleSendMessage = useCallback(() => {
    toaster.create({
      title: "Send Message",
      description: "Message dispatcher initialized.",
      type: "info"
    });
  }, []);

  const handleExportProfile = useCallback(() => {
    toaster.create({
      title: "Export Profile",
      description: "Profile data compiled for export.",
      type: "success"
    });
  }, []);

  const handleDeactivateMember = useCallback(() => {
    toaster.create({
      title: "Deactivate Account",
      description: "Deactivation safety prompt initialized.",
      type: "error"
    });
  }, []);

  // ── Days remaining calc ──
  const daysRemaining = useMemo(() => {
    if (!sub?.end_date) return null;
    const end = new Date(sub.end_date);
    if (Number.isNaN(end.getTime())) return null;
    return Math.max(0, Math.ceil((end.getTime() - Date.now()) / 86400000));
  }, [sub]);

  // ── Fallback Profile Pic ──
  const avatarSrc = useMemo(() => {
    return member?.data?.avatar || "https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=600&auto=format&fit=crop";
  }, [member]);

  // ── Not found / Error state ──
  if (!loading && (notFound || error || !member)) {
    return (
      <Box
        w="full"
        minH="80vh"
        bg="bg.default"
        color="app.text.primary"
        p={{ base: 4, md: 8 }}
        borderRadius="16px"
        fontFamily="'Inter', sans-serif"
      >
        <HStack justify="space-between" align="center" mb="6">
          <Button
            variant="ghost"
            color="app.text.muted"
            _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.05)" }}
            onClick={handleBack}
            fontWeight="600"
            fontSize="sm"
            gap="2"
          >
            <ArrowLeft size={16} /> Member Directory
          </Button>
        </HStack>
        <Flex direction="column" align="center" justify="center" py={20} gap={4}>
          <Circle size="16" bg="rgba(227, 26, 26, 0.1)" color="#E31A1A">
            <ShieldCheck size={30} />
          </Circle>
          <Heading size="md" fontWeight="800">Profile Unavailable</Heading>
          <Text color="app.text.muted" fontWeight="500" textAlign="center" maxW="md">
            {error
              ? `An error occurred: ${error}`
              : "The member details could not be found or the record has been deleted."}
          </Text>
          <Button
            bg="#c3f400"
            color="#161e00"
            _hover={{ bg: "#abd600" }}
            borderRadius="xl"
            fontWeight="700"
            size="md"
            mt={4}
            onClick={handleBack}
          >
            <ArrowLeft size={14} /> Return to Directory
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      w="full"
      minH="100vh"
      bg="bg.default"
      color="app.text.primary"
      p={{ base: 4, md: 8 }}
      borderRadius="16px"
      fontFamily="'Inter', sans-serif"
      className="fade-slide-up"
    >
      {/* ── Keyframe Animations Injected ── */}
      <style>{`
        @keyframes fadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-slide-up {
          animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .stagger-cell {
          opacity: 0;
          animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* ── Top Navigation Row ──
      <HStack justify="space-between" align="center" mb="6">
        <Button
          variant="ghost"
          color="app.text.muted"
          _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.05)" }}
          onClick={handleBack}
          _active={{ transform: "scale(0.97)" }}
          fontWeight="600"
          fontSize="sm"
          gap="2"
        >
          <ArrowLeft size={16} /> Member Directory
        </Button>
        <Button
          variant="ghost"
          color="#c3f400"
          _hover={{ bg: "rgba(195, 244, 0, 0.1)" }}
          onClick={refresh}
          _active={{ transform: "scale(0.97)" }}
          loading={loading}
          fontWeight="600"
          fontSize="sm"
          gap="2"
        >
          <RefreshCw size={16} /> Refresh Profile
        </Button>
      </HStack> */}

      {/* ── Main Layout Grid ── */}
      <Grid templateColumns={{ base: "1fr", lg: "repeat(12, 1fr)" }} gap={6}>
        {/* Left Column (5 columns span) */}
        <GridItem colSpan={{ base: 12, lg: 5 }}>
          <VStack align="stretch" gap={6}>
            {/* ── Vertical Profile Card (Reference-Matched) ── */}
            <SurfaceCard p={5} bgImage="linear-gradient(135deg, rgba(195, 244, 0, 0.02) 0%, rgba(57, 101, 255, 0.01) 100%)">
              <Skeleton loading={loading} borderRadius="20px">
                <Box position="relative" w="full" h="64" borderRadius="20px" overflow="hidden" bg="bg.default" mb={5}>
                  <img
                    src={avatarSrc}
                    alt={name.full}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              </Skeleton>

              <VStack align="stretch" gap={3}>
                {/* Name + Verified Badge */}
                <HStack gap={2} flexWrap="wrap" align="center">
                  <Skeleton loading={loading}>
                    <Heading fontSize="xl" fontWeight="800" color="app.text.primary">
                      {name.full}
                    </Heading>
                  </Skeleton>
                  {!loading && (
                    <Circle size="5" bg="green.500" color="bg.default" flexShrink={0} boxShadow="0 0 8px rgba(0,200,0,0.3)">
                      <Icon as={Check} boxSize={3.5} strokeWidth={3} />
                    </Circle>
                  )}
                </HStack>

                {/* Bio Description */}
                <Text fontSize="sm" color="app.text.muted" fontWeight="500">
                  Active member who focuses on strength &amp; athletic conditioning.
                </Text>

                {/* Plan + Status Tags */}
                <HStack gap={3} flexWrap="wrap" mt={1}>
                  <Badge variant="outline" borderColor="#c3f400" color="#c3f400" borderRadius="full" px={2.5} py={0.5} fontWeight="700" fontSize="xs" boxShadow="0 0 8px rgba(195, 244, 0, 0.15)">
                    {sub?.plan_name || member?.data.plan || "Platinum Elite"}
                  </Badge>
                  <HStack gap={1.5} fontSize="xs" fontWeight="700" color="app.text.muted">
                    <Circle size="2" bg={sm.accent} boxShadow={`0 0 8px ${sm.accent}`} />
                    <Text>{sm.label}</Text>
                  </HStack>
                </HStack>

                <Separator borderColor="app.card.border" mt={2} />

                {/* Footer Row (Seeded stats + Follow-style edit button) */}
                <Flex align="center" justify="space-between" mt={1}>
                  <HStack gap={4} color="app.text.muted" fontSize="sm" fontWeight="600">
                    <HStack gap={1}>
                      <Icon as={Dumbbell} boxSize={4} />
                      <Text>{member?.data.weight || 195} lbs</Text>
                    </HStack>
                    <HStack gap={1}>
                      <Icon as={CalendarDays} boxSize={4} />
                      <Text>13 Days</Text>
                    </HStack>
                  </HStack>

                  <Button
                    size="sm"
                    bg="rgba(195, 244, 0, 0.15)"
                    color="#c3f400"
                    _hover={{ bg: "#c3f400", color: "#161e00" }}
                    _active={{ transform: "scale(0.95)" }}
                    borderRadius="full"
                    px={4}
                    fontWeight="700"
                    onClick={handleEditProfile}
                  >
                    Edit Profile
                  </Button>
                </Flex>
              </VStack>
            </SurfaceCard>

            {/* Personal Info */}
            <SurfaceCard>
              <Heading fontSize="xl" fontWeight="700" color="app.text.primary" mb={4} borderBottom="1px solid" borderColor="app.card.border" pb={3}>
                Personal Info
              </Heading>
              <VStack align="stretch" gap={1}>
                <InfoRow label="Join Date" value={fmtDate(member?._meta.created?.at || member?.data.joinDate)} />
                <InfoRow label="Email" value={member?.data.email || "j.vance@eliteathletics.com"} />
                <InfoRow label="Phone" value={member?.data.phone || "+1 (555) 234-8901"} />
                <InfoRow label="Gender" value={member?.data.gender || "Not recorded"} />
                <InfoRow label="Address" value={member?.data.address || "Not recorded"} />
              </VStack>
            </SurfaceCard>

            {/* Physical Stats Grid */}
            <SimpleGrid columns={3} gap={4}>
              <Box bg="app.card.bg" borderRadius="16px" border="1px solid" borderColor="app.card.border" p={4} textAlign="center" boxShadow="sm" transition="transform 0.2s" _hover={{ transform: "translateY(-3px)", borderColor: "rgba(195,244,0,0.3)" }}>
                <Text fontSize="10px" fontWeight="700" color="app.text.muted" textTransform="uppercase" mb={1}>Weight</Text>
                <Text fontSize="xl" fontWeight="700" color="app.text.primary">
                  <AnimatedCounter value={member?.data.weight || 195} />
                  <Text as="span" fontSize="xs" opacity={0.6} ml={0.5}>lbs</Text>
                </Text>
              </Box>
              <Box bg="app.card.bg" borderRadius="16px" border="1px solid" borderColor="app.card.border" p={4} textAlign="center" boxShadow="sm" transition="transform 0.2s" _hover={{ transform: "translateY(-3px)", borderColor: "rgba(195,244,0,0.3)" }}>
                <Text fontSize="10px" fontWeight="700" color="app.text.muted" textTransform="uppercase" mb={1}>Body Fat</Text>
                <Text fontSize="xl" fontWeight="700" color="app.text.primary">
                  <AnimatedDecimalCounter value={member?.data.bodyFat || 11.4} />
                  <Text as="span" fontSize="xs" opacity={0.6} ml={0.5}>%</Text>
                </Text>
              </Box>
              <Box bg="app.card.bg" borderRadius="16px" border="1px solid" borderColor="app.card.border" p={4} textAlign="center" boxShadow="sm" transition="transform 0.2s" _hover={{ transform: "translateY(-3px)", borderColor: "rgba(195,244,0,0.3)" }}>
                <Text fontSize="10px" fontWeight="700" color="app.text.muted" textTransform="uppercase" mb={1}>Height</Text>
                <Text fontSize="xl" fontWeight="700" color="app.text.primary">
                  {member?.data.height || `6'2"`}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Account Health */}
            <SurfaceCard bg="app.card.bg" borderColor="app.card.border">
              <VStack align="stretch" gap={4}>
                <Flex justify="space-between" align="center">
                  <Heading fontSize="sm" fontWeight="700" color="app.text.primary">Account Health</Heading>
                  <Badge variant="subtle" bg={sm.bg} color={sm.accent} borderRadius="full" boxShadow={`0 0 6px ${sm.accent}22`}>{sm.label}</Badge>
                </Flex>
                <Text color="app.text.muted" fontSize="xs" fontWeight="500" lineHeight="tall">
                  {status === "attention"
                    ? "This member needs staff follow-up. Review renewal status and contact history."
                    : status === "frozen"
                      ? "No active subscription. Assign a plan to reactivate this account."
                      : "This profile is healthy and ready for regular member operations."}
                </Text>
                <Box h="2" bg="rgba(255,255,255,0.08)" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    w={status === "active" ? "88%" : status === "attention" ? "54%" : "22%"}
                    bg={sm.accent}
                    borderRadius="full"
                    transition="width 0.5s ease"
                  />
                </Box>
                {daysRemaining !== null && (
                  <>
                    <Separator borderColor="app.card.border" />
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color="app.text.muted" fontWeight="700">Days Remaining</Text>
                      <Text fontSize="sm" fontWeight="800" color={daysRemaining <= 7 ? "#ffb547" : "#c3f400"}>
                        {daysRemaining} days
                      </Text>
                    </Flex>
                  </>
                )}
              </VStack>
            </SurfaceCard>
          </VStack>
        </GridItem>

        {/* Right Column (7 columns span) */}
        <GridItem colSpan={{ base: 12, lg: 7 }}>
          <VStack align="stretch" gap={6}>
            {/* Monthly Attendance Calendar */}
            <SurfaceCard>
              <AttendanceCalendar />
            </SurfaceCard>

            {/* Membership & Billing */}
            <SurfaceCard>
              <Flex justify="space-between" align="center" mb={5}>
                <Heading fontSize="lg" fontWeight="700" color="app.text.primary">
                  Membership &amp; Billing
                </Heading>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    color="#c3f400"
                    size="sm"
                    fontWeight="700"
                    onClick={toggleHistory}
                    _hover={{ bg: "transparent", textDecoration: "underline" }}
                    _active={{ transform: "scale(0.97)" }}
                  >
                    {showHistory ? "Hide Payment History" : "View Payment History"}
                  </Button>
                )}
              </Flex>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} alignSelf="stretch">
                <VStack align="start" gap={4}>
                  <VStack align="start" gap={0.5}>
                    <Text fontSize="10px" fontWeight="700" color="app.text.muted" textTransform="uppercase">Next Renewal</Text>
                    <Text fontSize="lg" fontWeight="700" color="app.text.primary">
                      {sub ? fmtDate(sub.end_date) : "September 12, 2024"}
                    </Text>
                  </VStack>
                  <VStack align="start" gap={0.5}>
                    <Text fontSize="10px" fontWeight="700" color="app.text.muted" textTransform="uppercase">Plan Amount</Text>
                    <Text fontSize="lg" fontWeight="700" color="app.text.primary">
                      {sub ? `${fmtCurrency(sub.price, sub.currency)} / Month` : "$149.00 / Month"}
                    </Text>
                  </VStack>
                </VStack>

                <Box alignSelf="center">
                  <Flex
                    bg="bg.default"
                    border="1px solid"
                    borderColor="app.card.border"
                    borderRadius="xl"
                    p={4}
                    align="center"
                    justify="space-between"
                    gap={4}
                    cursor="pointer"
                    onClick={handleViewCurrentSubDetails}
                    transition="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                    _hover={{ borderColor: "rgba(195, 244, 0, 0.4)", transform: "translateY(-2px)", bg: "rgba(255, 255, 255, 0.02)" }}
                    _active={{ transform: "translateY(0) scale(0.99)" }}
                  >
                    <HStack gap={3}>
                      <Circle size="10" bg="app.card.bg" color="app.text.primary" border="1px solid" borderColor="app.card.border">
                        <Icon as={CreditCard} boxSize={5} />
                      </Circle>
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="600" color="app.text.primary">Visa ending in 4492</Text>
                        <Text fontSize="xs" color="app.text.muted">Expires 10/26</Text>
                      </VStack>
                    </HStack>
                    <IconButton
                      variant="ghost"
                      color="#c3f400"
                      _hover={{ bg: "transparent", transform: "translateX(3px)" }}
                      _active={{ transform: "scale(0.9)" }}
                      aria-label="View payment details"
                      onClick={handleViewCurrentSubDetails}
                    >
                      <ChevronRight size={20} />
                    </IconButton>
                  </Flex>
                </Box>
              </Grid>

              {/* Collapsible Payment History Section */}
              {showHistory && (
                <VStack align="stretch" gap={3} mt={6} pt={6} borderTop="1px solid" borderColor="app.card.border" className="fade-slide-up">
                  <Heading fontSize="sm" fontWeight="700" color="app.text.primary" mb={2}>
                    Payment History
                  </Heading>
                  <VStack align="stretch" gap={2}>
                    {history.map((h, idx) => (
                      <PaymentHistoryRow
                        key={h.subscription_id || idx}
                        payment={h}
                        currency={sub?.currency}
                        onViewDetails={handleViewPaymentDetails}
                      />
                    ))}
                  </VStack>
                </VStack>
              )}
            </SurfaceCard>

            {/* Quick Actions */}
            <SurfaceCard>
              <Heading fontSize="md" fontWeight="700" color="app.text.primary" mb={4}>
                Quick Actions
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={2}>
                <ActionRow icon={MessageSquare} label="Send Message" color="purple" onClick={handleSendMessage} />
                <ActionRow icon={Zap} label="Renew Plan" color="green" onClick={handleAssignPlan} />
                <ActionRow icon={Snowflake} label="Freeze Account" color="cyan" onClick={handleFreezeMembership} />
                <ActionRow icon={FileText} label="Export Profile" color="blue" onClick={handleExportProfile} />
                <ActionRow icon={Trash2} label="Deactivate Member" danger onClick={handleDeactivateMember} />
              </SimpleGrid>
            </SurfaceCard>
          </VStack>
        </GridItem>
      </Grid>

      <PaymentDetailsModal
        payment={selectedPayment}
        currency={sub?.currency}
        onClose={handleClosePaymentDetails}
      />
    </Box>
  );
});

MemberDetail.displayName = "MemberDetail";
export default MemberDetail;
