/**
 * ReviewOrder.tsx
 *
 * Step 3 in the gym membership sales flow.
 * Route: /:org/workspace/app/myGym/reviewOrder/:memberId?planCode=GYM_PRO
 *
 * Purpose:
 *   - Pure frontend preview — shows what WILL be purchased
 *   - Fetches member (existing endpoint) + plan (existing endpoint)
 *   - Displays computed order summary (price from DB plan data)
 *   - NO backend write on this page
 *   - "Generate Invoice" → POST /membership/create-invoice → navigate to invoiceView/:invoiceNumber
 *   - "Edit Plan" → back to selectMembershipPlan
 *
 * Architecture note:
 *   Tax shown as "Incl. GST (~18%)" estimate until invoice is generated.
 *   The real server-computed tax appears on the InvoiceDetails page.
 */

import { memo, useMemo, useCallback, useState } from "react";
import {
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
  Separator,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  Edit2,
  FileText,
  Loader2,
  User,
  Tag,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { PageLayout } from "@/core/components/PageLayout";
import { useGymMember } from "./hooks/useGymMember";
import { useGymPlan } from "./hooks/useGymPlan";
import { GymApiService } from "./services/gymApi.service";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";

// ─── Helpers ────────────────────────────────────────────────────────

const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const fmtDate = (d?: string) => {
  if (!d) return "N/A";
  const p = new Date(d);
  return isNaN(p.getTime())
    ? d
    : p.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const BILLING_CYCLE_FULL: Record<string, string> = {
  monthly: "1 Month",
  quarterly: "3 Months",
  yearly: "12 Months",
  "half-yearly": "6 Months",
};

// ─── Info Row ────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
}

const InfoRow = memo(({ label, value, mono }: InfoRowProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  return (
    <Flex
      justify="space-between"
      align="center"
      py={3}
      borderBottom="1px solid"
      borderColor="app.card.border"
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="xs" fontWeight="600" color={muted} textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      <Text
        fontSize="sm"
        fontWeight="700"
        color="app.text.primary"
        fontFamily={mono ? "mono" : "inherit"}
      >
        {value}
      </Text>
    </Flex>
  );
});
InfoRow.displayName = "InfoRow";

// ─── Section Card ────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SectionCard = memo(({ title, icon, children }: SectionCardProps) => {
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(11, 20, 55, 0.45)");
  const borderCol = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");

  return (
    <Box
      bg={cardBg}
      backdropFilter="blur(20px) saturate(180%)"
      border="1px solid"
      borderColor={borderCol}
      borderRadius="2xl"
      overflow="hidden"
    >
      <Flex
        px={6}
        py={4}
        gap={3}
        align="center"
        borderBottom="1px solid"
        borderColor={borderCol}
        bg={useColorModeValue("rgba(249,250,251,0.8)", "rgba(255,255,255,0.02)")}
      >
        <Circle size={8} bg="brand.500/10" color="brand.500">
          {icon}
        </Circle>
        <Text fontSize="sm" fontWeight="900" color="app.text.primary" letterSpacing="tight">
          {title}
        </Text>
      </Flex>
      <Box px={6} py={2}>
        {children}
      </Box>
    </Box>
  );
});
SectionCard.displayName = "SectionCard";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const ReviewOrder = memo(() => {
  const { params: memberId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { organizationName, appCode } = useWorkspaceRouter();

  const planCode = searchParams.get("planCode") ?? undefined;

  const { member, loading: memberLoading } = useGymMember(memberId);
  const { plan, loading: planLoading } = useGymPlan(planCode);

  const [isGenerating, setIsGenerating] = useState(false);

  const loading = memberLoading || planLoading;
  const muted = useColorModeValue("gray.500", "gray.400");

  // ── Derived values ────────────────────────────────────────────────

  const memberName = useMemo(() => {
    const d = member?.data;
    return `${d?.firstName || ""} ${d?.lastName || ""}`.trim() || memberId || "Member";
  }, [member, memberId]);

  const startDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const endDate = useMemo(() => {
    if (!plan) return "—";
    const d = new Date(startDate);
    switch (plan.data.billing_cycle) {
      case "monthly":
        d.setMonth(d.getMonth() + 1);
        break;
      case "quarterly":
        d.setMonth(d.getMonth() + 3);
        break;
      case "yearly":
        d.setFullYear(d.getFullYear() + 1);
        break;
      case "half-yearly":
        d.setMonth(d.getMonth() + 6);
        break;
      default:
        d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split("T")[0];
  }, [plan, startDate]);

  const estimatedTax = useMemo(() => {
    if (!plan) return 0;
    // 18% GST estimate (server computes actual amount on invoice creation)
    return Math.round(plan.data.price * 0.18);
  }, [plan]);

  const estimatedTotal = useMemo(() => {
    if (!plan) return 0;
    return plan.data.price + estimatedTax;
  }, [plan, estimatedTax]);

  const duration = useMemo(() => {
    return plan ? BILLING_CYCLE_FULL[plan.data.billing_cycle] ?? plan.data.billing_cycle : "—";
  }, [plan]);

  // ── Handlers ─────────────────────────────────────────────────────

  const handleEditPlan = useCallback(() => {
    navigate(
      `/${organizationName}/workspace/app/${appCode}/selectMembershipPlan/${memberId}`
    );
  }, [navigate, organizationName, appCode, memberId]);

  const handleGenerateInvoice = useCallback(() => {
    const effectiveMemberId = member?.data?.member_id || memberId;
    if (!effectiveMemberId || !planCode) {
      toaster.create({ title: "Missing data", description: "Member or plan not found.", type: "error" });
      return;
    }

    setIsGenerating(true);

    // This is the FIRST backend write in the entire sales flow.
    // Creates an invoice (no subscription created yet).
    const sub = GymApiService.createMembershipInvoice({
      member_id: effectiveMemberId,
      plan_code: planCode,
      start_date: startDate,
    }).subscribe({
      next: (res) => {
        setIsGenerating(false);
        if (res.success) {
          toaster.create({
            title: "Invoice Generated",
            description: `Invoice ${res.data.invoice_number} created. Review and collect payment.`,
            type: "success",
          });
          // Navigate to InvoiceDetails — subscription does NOT exist yet
          navigate(
            `/${organizationName}/workspace/app/${appCode}/invoiceView/${encodeURIComponent(res.data.invoice_number)}`
          );
        } else {
          toaster.create({
            title: "Invoice Creation Failed",
            description: (res as any).message ?? "An error occurred.",
            type: "error",
          });
        }
      },
      error: (err) => {
        setIsGenerating(false);
        toaster.create({
          title: "Error",
          description: err?.response?.data?.message || err?.message || "Failed to generate invoice.",
          type: "error",
        });
      },
    });

    return () => sub.unsubscribe();
  }, [member, memberId, planCode, startDate, navigate, organizationName, appCode]);

  // ── Loading skeleton ──────────────────────────────────────────────

  if (loading) {
    return (
      <PageLayout title="Review Order" subtitle="Loading order details...">
        <Grid templateColumns={{ base: "1fr", lg: "1fr 360px" }} gap={6}>
          <VStack gap={4} align="stretch">
            {[120, 200, 160].map((h) => (
              <Skeleton key={h} height={`${h}px`} borderRadius="2xl" />
            ))}
          </VStack>
          <Skeleton height="320px" borderRadius="2xl" />
        </Grid>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Review Order"
      subtitle="Verify the membership details before generating the invoice"
    >
      {/* Breadcrumb steps */}
      <HStack gap={2} mb={6} color={muted} fontSize="xs" fontWeight="700">
        <Text>Select Plan</Text>
        <ArrowRight size={12} />
        <Text color="brand.500">Review Order</Text>
        <ArrowRight size={12} />
        <Text>Invoice</Text>
        <ArrowRight size={12} />
        <Text>Payment</Text>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 380px" }} gap={6} alignItems="start">
        {/* ── Left: Details ── */}
        <VStack gap={5} align="stretch">
          {/* Member */}
          <SectionCard title="Member Information" icon={<User size={14} />}>
            <InfoRow label="Name" value={memberName} />
            <InfoRow label="Member ID" value={member?.data?.member_id || memberId || "—"} mono />
            <InfoRow label="Email" value={member?.data?.email || "N/A"} />
            <InfoRow label="Phone" value={member?.data?.phone || "N/A"} />
          </SectionCard>

          {/* Plan */}
          <SectionCard title="Selected Plan" icon={<Tag size={14} />}>
            <InfoRow label="Plan Name" value={plan?.data?.name || "—"} />
            <InfoRow label="Plan Code" value={planCode || "—"} mono />
            <InfoRow
              label="Price"
              value={plan ? formatINR(plan.data.price) : "—"}
            />
            <InfoRow
              label="Billing Cycle"
              value={duration}
            />
          </SectionCard>

          {/* Dates */}
          <SectionCard title="Subscription Period" icon={<CalendarDays size={14} />}>
            <InfoRow label="Start Date" value={fmtDate(startDate)} />
            <InfoRow label="End Date" value={fmtDate(endDate)} />
            <InfoRow label="Duration" value={duration} />
          </SectionCard>
        </VStack>

        {/* ── Right: Order Summary ── */}
        <Box position={{ base: "static", lg: "sticky" }} top="24px">
          <Box
            bg={useColorModeValue("rgba(255,255,255,0.8)", "rgba(11, 20, 55, 0.55)")}
            backdropFilter="blur(24px) saturate(200%)"
            border="1px solid"
            borderColor={useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)")}
            borderRadius="2xl"
            overflow="hidden"
          >
            {/* Header */}
            <Box
              px={6}
              py={4}
              bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
              color="white"
            >
              <HStack gap={3}>
                <Icon size="sm">
                  <FileText size={16} />
                </Icon>
                <Text fontWeight="900" fontSize="sm" letterSpacing="tight">
                  Order Summary
                </Text>
              </HStack>
            </Box>

            <VStack align="stretch" p={6} gap={4}>
              {/* Plan summary */}
              <VStack align="stretch" gap={0}>
                <Flex justify="space-between" py={3} borderBottom="1px solid" borderColor="app.card.border">
                  <Text fontSize="sm" color={muted} fontWeight="600">Plan</Text>
                  <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                    {plan?.data?.name || "—"}
                  </Text>
                </Flex>
                <Flex justify="space-between" py={3} borderBottom="1px solid" borderColor="app.card.border">
                  <Text fontSize="sm" color={muted} fontWeight="600">Subtotal</Text>
                  <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                    {plan ? formatINR(plan.data.price) : "—"}
                  </Text>
                </Flex>
                <Flex justify="space-between" py={3} borderBottom="1px solid" borderColor="app.card.border">
                  <VStack align="start" gap={0}>
                    <Text fontSize="sm" color={muted} fontWeight="600">Tax</Text>
                    <Text fontSize="9px" color={muted} fontWeight="500">~18% GST (estimated)</Text>
                  </VStack>
                  <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                    ≈ {plan ? formatINR(estimatedTax) : "—"}
                  </Text>
                </Flex>
              </VStack>

              <Separator opacity={0.1} />

              {/* Total */}
              <Flex justify="space-between" align="center">
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase" letterSpacing="wider">
                    Estimated Total
                  </Text>
                  <Text fontSize="9px" color={muted} fontWeight="500">
                    Exact amount confirmed on invoice
                  </Text>
                </VStack>
                <Text fontSize="2xl" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                  {plan ? formatINR(estimatedTotal) : "—"}
                </Text>
              </Flex>

              {/* Note */}
              <Box
                p={3}
                borderRadius="xl"
                bg={useColorModeValue("blue.50", "rgba(57, 101, 255, 0.08)")}
                border="1px solid"
                borderColor="blue.500/20"
              >
                <Text fontSize="xs" color="blue.500" fontWeight="600" lineHeight="relaxed">
                  💡 The exact GST amount will be computed by the server when you generate the invoice.
                </Text>
              </Box>

              {/* Actions */}
              <VStack gap={3} mt={2}>
                <Button
                  w="full"
                  h="52px"
                  borderRadius="xl"
                  fontWeight="900"
                  fontSize="sm"
                  letterSpacing="wide"
                  bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
                  color="white"
                  loading={isGenerating}
                  loadingText="Generating..."
                  onClick={handleGenerateInvoice}
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 15px 30px -10px var(--chakra-colors-brand-500)",
                  }}
                  transition="all 0.3s"
                  isDisabled={!plan || !member}
                >
                  <HStack gap={2}>
                    {isGenerating ? <Loader2 size={16} /> : <CheckCircle size={16} />}
                    <Text>Generate Invoice</Text>
                  </HStack>
                </Button>

                <Button
                  w="full"
                  h="44px"
                  variant="outline"
                  borderRadius="xl"
                  fontWeight="700"
                  fontSize="sm"
                  onClick={handleEditPlan}
                  borderColor={useColorModeValue("gray.200", "whiteAlpha.200")}
                  _hover={{ bg: "rgba(255,255,255,0.05)" }}
                >
                  <Edit2 size={14} />
                  <Text ml={2}>Edit Plan</Text>
                </Button>

                <Button
                  w="full"
                  h="38px"
                  variant="ghost"
                  borderRadius="xl"
                  fontWeight="600"
                  fontSize="xs"
                  color={muted}
                  onClick={() => navigate(-1)}
                  _hover={{ color: "app.text.primary", bg: "rgba(255,255,255,0.03)" }}
                >
                  <ArrowLeft size={13} />
                  <Text ml={1}>Go Back</Text>
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Box>
      </Grid>
    </PageLayout>
  );
});
ReviewOrder.displayName = "ReviewOrder";

export default ReviewOrder;
