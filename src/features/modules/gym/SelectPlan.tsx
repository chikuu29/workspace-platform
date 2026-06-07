/**
 * SelectPlan.tsx
 *
 * Subscription enrollment page — post-member-registration landing.
 * 3-step wizard: Select Plan → Payment → Success.
 *
 * Key architectural decisions:
 *   - ALL prices come from the backend (never trust frontend)
 *   - Tax is computed server-side by the billing TaxEngine
 *   - Uses new /gym/membership/* endpoints for clean separation
 *   - Composes shared billing components for reusability
 */

import { memo, useState, useMemo, useCallback, useEffect } from "react";
import {
    Badge,
    Box,
    Button,
    Circle,
    Flex,
    Heading,
    HStack,
    Separator,
    SimpleGrid,
    Skeleton,
    Spinner,
    Text,
    VStack,
    Icon,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useParams } from "react-router";
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Crown,
    ShieldCheck,
    Sparkles,
    Lock,
    User,
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { useGymMember } from "./hooks/useGymMember";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import { PageLayout } from "@/core/components/PageLayout";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import type {
    SubscriptionPlanDocument,
    InvoiceTaxBreakdown,
} from "./types/Gym.types";
import confetti from "canvas-confetti";
const BRAND_HEX = "#422AFB";
const BRAND_ALT = "#7551FF";
const BRAND_GRADIENT = "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)";

// ── Shared Billing Components ────────────────────────────────────────
import {
    PaymentMethodSelector,
    CashTillCalculator,
    OrderSummaryCard,
    PaymentLinkDispatcher,
    PaymentSuccessReceipt,
} from "@/features/billing/components";
import type { PaymentMode, OnlineMethod } from "@/features/billing/components";

// ─── Constants ──────────────────────────────────────────────────────

const CURRENCY_SYMBOL = "₹";

/** Formats number to INR currency string */
const formatINR = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);

// ─── Gradient Mappings ──────────────────────────────────────────────

const GRADIENT_MAP: Record<string, string> = {
    brand: BRAND_GRADIENT,
    blue: "linear-gradient(135deg, #3965FF 0%, #002DFF 100%)",
    green: "linear-gradient(135deg, #01B574 0%, #00875A 100%)",
    orange: "linear-gradient(135deg, #FFB547 0%, #E67E00 100%)",
    red: "linear-gradient(135deg, #EE5D50 0%, #C52A1D 100%)",
    purple: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
    pink: "linear-gradient(135deg, #EC4899 0%, #D946EF 100%)",
    cyan: "linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)",
    emerald: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
};

const getGradient = (accent?: string) => {
    const key = accent?.toLowerCase() || "brand";
    return GRADIENT_MAP[key] || GRADIENT_MAP.brand;
};

// ─── Subcomponents ──────────────────────────────────────────────────

interface FeatureItemProps {
    text: string;
    accent: string;
}

const FeatureItem = memo(({ text, accent }: FeatureItemProps) => {
    const accentColor = useMemo(() => `${accent}.500`, [accent]);
    const bgAccent = useMemo(() => `${accent}.500/10`, [accent]);

    return (
        <HStack gap={3} align="start">
            <Circle size={5} bg={bgAccent} color={accentColor} mt="2px">
                <Check size={11} strokeWidth={3} />
            </Circle>
            <Text fontSize="sm" fontWeight="600" color="app.text.primary" lineHeight="shorter">
                {text}
            </Text>
        </HStack>
    );
});
FeatureItem.displayName = "FeatureItem";

// ─── Plan Card ──────────────────────────────────────────────────────

interface PlanCardProps {
    plan: SubscriptionPlanDocument;
    isSelected: boolean;
    onSelect: (plan: SubscriptionPlanDocument) => void;
}

const PlanCard = memo(({ plan, isSelected, onSelect }: PlanCardProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.75)", "rgba(11, 20, 55, 0.45)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");

    const planData = plan.data;
    const accent = planData.accent_color || "brand";
    const gradient = useMemo(() => getGradient(accent), [accent]);

    const handleClick = useCallback(() => onSelect(plan), [plan, onSelect]);

    const renderFeature = useCallback((f: string) => (
        <FeatureItem key={f} text={f} accent={accent} />
    ), [accent]);

    return (
        <Box
            position="relative"
            p="1.5px"
            borderRadius="3xl"
            bg={isSelected ? gradient : "transparent"}
            boxShadow={isSelected ? `0 15px 30px -10px var(--chakra-colors-${accent}-500)` : "none"}
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            transform={isSelected ? "scale(1.025)" : "scale(1)"}
            _hover={{ transform: isSelected ? "scale(1.03)" : "translateY(-6px)" }}
        >
            <Card
                p={0}
                bg={cardBg}
                backdropFilter="blur(24px) saturate(190%)"
                border="1px solid"
                borderColor={isSelected ? "whiteAlpha.400" : borderColor}
                borderRadius="3xl"
                cursor="pointer"
                overflow="hidden"
                gap={0}
                h="full"
                onClick={handleClick}
                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                boxShadow="none"
                _hover={{
                    bg: isSelected ? cardBg : useColorModeValue("white", "rgba(22, 33, 74, 0.6)"),
                    borderColor: isSelected ? "whiteAlpha.500" : `${accent}.500/40`,
                }}
            >
                {/* Top glow bar when selected */}
                {isSelected && <Box h="4px" bg={gradient} w="full" />}

                <VStack align="stretch" gap={5} p={7}>
                    {/* Header */}
                    <Flex justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                            <HStack>
                                <Text fontSize="xl" fontWeight="900" color="app.text.primary" letterSpacing="tight">
                                    {planData.name}
                                </Text>
                                {planData.code.toLowerCase().includes("pro") && (
                                    <Icon color={`${accent}.500`} size="sm">
                                        <Sparkles />
                                    </Icon>
                                )}
                            </HStack>
                            <Text fontSize="xs" color={muted} fontWeight="600" minH="32px" lineClamp={2}>
                                {planData.description || `Premium access for ${planData.name.toLowerCase()} seekers`}
                            </Text>
                        </VStack>

                        {isSelected ? (
                            <Circle
                                size={8}
                                bg={`${accent}.500`}
                                color="white"
                                boxShadow={`0 0 15px var(--chakra-colors-${accent}-500)`}
                            >
                                <Check size={14} strokeWidth={3} />
                            </Circle>
                        ) : (
                            <Circle size={8} border="2px solid" borderColor={borderColor} />
                        )}
                    </Flex>

                    {/* Pricing */}
                    <VStack align="start" gap={0}>
                        <HStack align="baseline" gap={1}>
                            <Text fontSize="4xl" fontWeight="950" color="app.text.primary" lineHeight="1" letterSpacing="tight">
                                {CURRENCY_SYMBOL}{planData.price.toLocaleString("en-IN")}
                            </Text>
                            <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase">
                                /{planData.billing_cycle === "monthly" ? "mo" : planData.billing_cycle === "quarterly" ? "qtr" : "yr"}
                            </Text>
                        </HStack>
                        <Badge variant="subtle" colorPalette={accent} borderRadius="md" px={2} mt={2} fontSize="9px" fontWeight="900" letterSpacing="wider">
                            {planData.billing_cycle.toUpperCase()} BILLING
                        </Badge>
                    </VStack>

                    <Separator opacity={0.06} />

                    {/* Features */}
                    <VStack align="stretch" gap={3} minH="120px">
                        {planData.features.map(renderFeature)}
                    </VStack>

                    <Box pt={4}>
                        <Button
                            w="full"
                            size="lg"
                            h="52px"
                            borderRadius="2xl"
                            fontWeight="900"
                            fontSize="xs"
                            letterSpacing="widest"
                            textTransform="uppercase"
                            colorPalette={accent}
                            variant={isSelected ? "solid" : "outline"}
                            bg={isSelected ? gradient : "transparent"}
                            borderColor={isSelected ? "transparent" : `${accent}.500/35`}
                            color={isSelected ? "white" : `${accent}.500`}
                            _hover={{
                                transform: "translateY(-3px)",
                                boxShadow: isSelected
                                    ? `0 12px 25px -8px var(--chakra-colors-${accent}-500)`
                                    : `0 8px 15px -5px var(--chakra-colors-${accent}-500/25)`,
                                bg: isSelected ? gradient : `${accent}.500/8`,
                                borderColor: isSelected ? "transparent" : `${accent}.500`,
                            }}
                            _active={{ transform: "translateY(-1px)" }}
                            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        >
                            <HStack gap={2}>
                                <Text>{isSelected ? "Selected Plan" : "Choose Plan"}</Text>
                                {isSelected ? <Check size={14} strokeWidth={3} /> : <ArrowRight size={14} />}
                            </HStack>
                        </Button>
                    </Box>
                </VStack>
            </Card>
        </Box>
    );
});
PlanCard.displayName = "PlanCard";

// ─── Empty State ────────────────────────────────────────────────────

const EmptyPlansState = memo(() => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const { navigateTo } = useWorkspaceRouter();

    const handleCreatePlan = useCallback(() => {
        navigateTo("AddSubscriptionPlan");
    }, [navigateTo]);

    return (
        <Card p={12} borderRadius="3xl" bg={useColorModeValue("white", "rgba(11, 20, 55, 0.45)")} backdropFilter="blur(20px)" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}>
            <VStack gap={6} textAlign="center" maxW="md" mx="auto">
                <Circle size={20} bg="brand.500/10" color="brand.500">
                    <Crown size={32} />
                </Circle>
                <VStack gap={2}>
                    <Heading size="lg" fontWeight="950" letterSpacing="tight">No Active Subscription Plans</Heading>
                    <Text fontSize="sm" color={muted} fontWeight="600">
                        Create your first subscription plan template to enroll members into billing terms.
                    </Text>
                </VStack>
                <Button
                    colorPalette="brand"
                    borderRadius="2xl"
                    size="xl"
                    h="56px"
                    px={10}
                    fontSize="sm"
                    fontWeight="900"
                    letterSpacing="wider"
                    onClick={handleCreatePlan}
                    bg={BRAND_GRADIENT}
                    _hover={{ transform: "translateY(-3px)", boxShadow: "0 15px 30px -10px var(--chakra-colors-brand-500)" }}
                    transition="all 0.3s"
                >
                    Create Your First Plan
                </Button>
            </VStack>
        </Card>
    );
});
EmptyPlansState.displayName = "EmptyPlansState";

// ─── Step Indicator ─────────────────────────────────────────────────

const STEPS = [
    { id: "select", label: "Choose Plan", description: "Select membership" },
    { id: "payment", label: "Collect Payment", description: "Cash or online" },
    { id: "success", label: "Activation", description: "Enrollment complete" },
] as const;

interface StepTrackerProps {
    currentStep: "select" | "payment" | "success";
}

const StepTracker = memo(({ currentStep }: StepTrackerProps) => {
    const brandColor = useColorModeValue("brand.500", "brand.400");
    const muted = useColorModeValue("gray.400", "gray.500");

    const getStepStatus = useCallback((stepId: "select" | "payment" | "success") => {
        if (currentStep === stepId) return "active";
        if (currentStep === "success") return "completed";
        if (currentStep === "payment" && stepId === "select") return "completed";
        return "upcoming";
    }, [currentStep]);

    const renderStep = useCallback((step: typeof STEPS[number], idx: number) => {
        const status = getStepStatus(step.id);
        const isActive = status === "active";
        const isCompleted = status === "completed";

        return (
            <HStack key={step.id} gap={3} position="relative">
                {idx > 0 && (
                    <Box
                        w={{ base: "12px", md: "40px" }}
                        h="2px"
                        bg={isCompleted || isActive ? "brand.500" : "rgba(255,255,255,0.08)"}
                        opacity={isCompleted ? 1 : 0.4}
                        transition="all 0.3s"
                    />
                )}
                <HStack gap={2}>
                    <Circle
                        size={8}
                        bg={isCompleted ? "green.500" : isActive ? brandColor : "rgba(255,255,255,0.05)"}
                        color={isCompleted || isActive ? "white" : muted}
                        fontWeight="900"
                        fontSize="xs"
                        border="1px solid"
                        borderColor={isCompleted ? "green.500" : isActive ? "transparent" : "whiteAlpha.100"}
                        boxShadow={isActive ? `0 0 15px ${BRAND_HEX}80` : "none"}
                        transition="all 0.3s"
                    >
                        {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                    </Circle>
                    <VStack align="start" gap={0} display={{ base: "none", md: "flex" }}>
                        <Text fontSize="xs" fontWeight="900" color={isActive ? "app.text.primary" : isCompleted ? "green.500" : "app.text.muted"}>
                            {step.label}
                        </Text>
                        <Text fontSize="10px" color={muted} fontWeight="600">
                            {step.description}
                        </Text>
                    </VStack>
                </HStack>
            </HStack>
        );
    }, [getStepStatus, brandColor, muted]);

    return (
        <HStack gap={4} mb={8} justify="center" zIndex={2} position="relative">
            {STEPS.map(renderStep)}
        </HStack>
    );
});
StepTracker.displayName = "StepTracker";

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

const SelectPlan = memo(() => {
    const { params: memberId } = useParams();
    const { member, loading: memberLoading, notFound: memberNotFound, error: memberError } = useGymMember(memberId);
    const { plans, loading: plansLoading } = useSubscriptionPlans({ activeOnly: true });

    // ── Step State ──
    const [currentStep, setCurrentStep] = useState<"select" | "payment" | "success">("select");
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Enrollment Data (from backend) ──
    const [enrollmentData, setEnrollmentData] = useState<{
        subscriptionId: string;
        orderNumber: string;
        orderTotal: number;
        orderSubtotal: number;
        orderTax: number;
        invoiceNumber: string | null;
        startDate: string;
        endDate: string;
    } | null>(null);

    // ── Payment State ──
    const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
    const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>("upi");
    const [cashReceived, setCashReceived] = useState("");
    const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);

    // ── Success State ──
    const [successData, setSuccessData] = useState<{
        subscriptionId: string;
        invoiceNumber: string;
        total: number;
        status: "paid" | "sent" | "partial";
        paymentMethod: string;
        paymentLinkUrl?: string;
    } | null>(null);

    // ── Derived Data ──
    const { navigateTo } = useWorkspaceRouter();
    const startDate = useMemo(() => new Date().toISOString().split("T")[0], []);

    const memberName = useMemo(() => {
        const d = member?.data;
        const first = d?.firstName || "";
        const last = d?.lastName || "";
        return `${first} ${last}`.trim() || memberId || "New Member";
    }, [member, memberId]);

    // Confetti on success
    useEffect(() => {
        if (currentStep === "success") {
            confetti({
                particleCount: 125,
                spread: 75,
                origin: { y: 0.65 },
                colors: [BRAND_HEX, BRAND_ALT, "#01B574", "#FFB547"],
            });
            const t = setTimeout(() => {
                confetti({ particleCount: 85, spread: 110, origin: { y: 0.75 } });
            }, 450);
            return () => clearTimeout(t);
        }
    }, [currentStep]);

    // ── Theme ──
    const muted = useColorModeValue("gray.500", "gray.400");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const stepBg = useColorModeValue("white", "rgba(11, 20, 55, 0.45)");

    // ═══════════════════════════════════════════════════════════════
    //  HANDLERS
    // ═══════════════════════════════════════════════════════════════

    const handleBack = useCallback(() => navigateTo("members"), [navigateTo]);

    const handleSelectPlan = useCallback((plan: SubscriptionPlanDocument) => {
        setSelectedPlan(plan);
    }, []);

    /**
     * Step 1 → Step 2: Enroll membership (create subscription + billing order)
     * Backend validates plan, reads price from DB, creates order with tax.
     * Invoice is NOT created here — it's created when payment is collected.
     * Frontend receives server-computed totals — zero client-side tax computation.
     */
    const handleProceedToPayment = useCallback(() => {
        const effectiveMemberId = member?.data?.member_id || memberId;

        if (!selectedPlan) {
            toaster.create({ title: "Select a Plan", description: "Pick a subscription plan first.", type: "warning" });
            return;
        }
        if (!effectiveMemberId) {
            toaster.create({ title: "No Member", description: "Member ID is missing.", type: "error" });
            return;
        }

        setIsSubmitting(true);

        const sub = GymApiService.enrollMembership({
            member_id: effectiveMemberId,
            plan_code: selectedPlan.data.code,
            start_date: startDate,
        }).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    setEnrollmentData({
                        subscriptionId: res.data.subscription_id,
                        orderNumber: res.data.order_number,
                        orderTotal: res.data.order_total,
                        orderSubtotal: res.data.order_subtotal,
                        orderTax: res.data.order_tax,
                        invoiceNumber: null,  // Created during collect-payment
                        startDate: res.data.start_date,
                        endDate: res.data.end_date,
                    });
                    setCurrentStep("payment");
                    toaster.create({
                        title: res.data.is_resumed ? "Resuming Enrollment" : "Enrollment Created",
                        description: `Order ${res.data.order_number} ready. Select payment method.`,
                        type: "success",
                    });
                } else {
                    toaster.create({
                        title: "Enrollment Failed",
                        description: (res as any).message ?? "Something went wrong.",
                        type: "error",
                    });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({
                    title: "Enrollment Error",
                    description: err?.response?.data?.message || err?.message || "Failed to create enrollment.",
                    type: "error",
                });
            },
        });

        return () => sub.unsubscribe();
    }, [selectedPlan, memberId, member?.data?.member_id, startDate]);

    /**
     * Step 2: Collect Cash/UPI/Card payment
     * Records payment via billing SDK → updates invoice status → activates member.
     */
    const handleCollectPayment = useCallback(() => {
        if (!enrollmentData) return;

        const method = paymentMode === "cash" ? "cash" : onlineMethod;
        if (method === "payment_link") return; // Handled separately

        setIsSubmitting(true);

        const sub = GymApiService.collectPayment(enrollmentData.subscriptionId, {
            payment_method: method as "cash" | "upi" | "card",
            transaction_ref: method === "cash"
                ? `CSH-${Math.floor(100000 + Math.random() * 900000)}`
                : method === "upi"
                ? `UPI-${Math.floor(100000 + Math.random() * 900000)}`
                : `CRD-${Math.floor(100000 + Math.random() * 900000)}`,
        }).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    setSuccessData({
                        subscriptionId: enrollmentData.subscriptionId,
                        invoiceNumber: res.data.invoice_number,
                        total: enrollmentData.orderTotal,
                        status: res.data.is_fully_paid ? "paid" : "partial",
                        paymentMethod: method,
                    });
                    setCurrentStep("success");
                    toaster.create({
                        title: "Payment Recorded!",
                        description: `${method.toUpperCase()} payment of ${formatINR(res.data.amount_paid)} recorded.`,
                        type: "success",
                    });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({
                    title: "Payment Error",
                    description: err?.response?.data?.message || err?.message || "Failed to record payment.",
                    type: "error",
                });
            },
        });

        return () => sub.unsubscribe();
    }, [enrollmentData, paymentMode, onlineMethod]);

    /**
     * Step 2: Send payment link for remote/later payment.
     * Generates Razorpay link and dispatches to customer.
     */
    const handleSendPaymentLink = useCallback((sendVia: "email" | "sms" | "both") => {
        if (!enrollmentData) return;

        setIsSubmitting(true);

        const sub = GymApiService.sendPaymentLink(enrollmentData.subscriptionId, {
            send_via: sendVia,
        }).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    setPaymentLinkUrl(res.data.payment_link_url);
                    setSuccessData({
                        subscriptionId: enrollmentData.subscriptionId,
                        invoiceNumber: res.data.invoice_number,
                        total: enrollmentData.orderTotal,
                        status: "sent",
                        paymentMethod: "payment_link",
                        paymentLinkUrl: res.data.payment_link_url,
                    });
                    setCurrentStep("success");
                    toaster.create({
                        title: "Payment Link Sent!",
                        description: `Link dispatched via ${sendVia} for ${formatINR(res.data.total)}.`,
                        type: "success",
                    });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({
                    title: "Link Generation Failed",
                    description: err?.response?.data?.message || err?.message || "Failed to generate payment link.",
                    type: "error",
                });
            },
        });

        return () => sub.unsubscribe();
    }, [enrollmentData]);

    const handleGoBackToSelect = useCallback(() => setCurrentStep("select"), []);

    const handlePrintInvoice = useCallback(() => window.print(), []);

    // ── Derived: Checkout summary from order data (server-computed) ──
    const invoiceSubtotal = enrollmentData?.orderSubtotal ?? selectedPlan?.data.price ?? 0;
    const invoiceTax: InvoiceTaxBreakdown = enrollmentData
        ? {
            total_tax: enrollmentData.orderTax,
            cgst_amount: enrollmentData.orderTax / 2,
            sgst_amount: enrollmentData.orderTax / 2,
            igst_amount: 0,
            tax_rate: 18,
        }
        : { total_tax: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, tax_rate: 18 };
    const invoiceTotal = enrollmentData?.orderTotal ?? invoiceSubtotal;

    // ── Pre-enroll: show plan price in summary (fallback before API call) ──
    const displaySubtotal = enrollmentData ? enrollmentData.orderSubtotal : selectedPlan?.data.price ?? 0;
    const displayTax: InvoiceTaxBreakdown = enrollmentData
        ? invoiceTax
        : { total_tax: 0, cgst_amount: 0, sgst_amount: 0, igst_amount: 0, tax_rate: 0 };
    const displayTotal = enrollmentData ? enrollmentData.orderTotal : displaySubtotal;

    // ═══════════════════════════════════════════════════════════════
    //  RENDER: NOT FOUND
    // ═══════════════════════════════════════════════════════════════

    if (!memberLoading && (memberNotFound || memberError || !member)) {
        return (
            <PageLayout
                title="Member Not Found"
                subtitle={`No profile found for ID: ${memberId || "Unknown"}.`}
            >
                <Card p={12} borderRadius="3xl" bg={stepBg} backdropFilter="blur(20px)" border="1px solid" borderColor={borderColor}>
                    <VStack gap={6} textAlign="center">
                        <Circle size={20} bg="red.500/10" color="red.500">
                            <ShieldCheck size={32} />
                        </Circle>
                        <VStack gap={1}>
                            <Heading size="xl" fontWeight="950" letterSpacing="tight">Profile Unavailable</Heading>
                            <Text color={muted} fontWeight="600" fontSize="md">
                                {memberError
                                    ? `An error occurred: ${memberError}`
                                    : <>We couldn't find a member matching ID: <Text as="span" color="app.text.primary" fontWeight="900">"{memberId}"</Text>.</>}
                            </Text>
                        </VStack>
                        <Button
                            colorPalette="brand"
                            size="lg"
                            px={10}
                            borderRadius="2xl"
                            fontWeight="900"
                            onClick={handleBack}
                            bg={BRAND_GRADIENT}
                            _hover={{ transform: "translateY(-2px)" }}
                        >
                            <ArrowLeft size={18} /> Back to Directory
                        </Button>
                    </VStack>
                </Card>
            </PageLayout>
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //  RENDER: MAIN
    // ═══════════════════════════════════════════════════════════════

    return (
        <PageLayout
            title="Premium Plan Enrollment"
            subtitle={memberLoading ? "Loading member data..." : `Enrolling ${memberName} in subscription service`}
            position="relative"
        >
            {/* Background Blurs */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulseBlob {
                    0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.08; }
                    33% { transform: scale(1.15) translate(30px, -40px); opacity: 0.12; }
                    66% { transform: scale(0.9) translate(-20px, 30px); opacity: 0.06; }
                }
                .bg-blob-1 { animation: pulseBlob 20s infinite ease-in-out; }
                .bg-blob-2 { animation: pulseBlob 25s infinite ease-in-out alternate; }
            ` }} />

            <Box position="absolute" className="bg-blob-1" top="-80px" right="-80px" w="480px" h="480px" bg="brand.500" filter="blur(160px)" zIndex={0} pointerEvents="none" />
            <Box position="absolute" className="bg-blob-2" bottom="-120px" left="-120px" w="450px" h="450px" bg="cyan.500" filter="blur(150px)" zIndex={0} pointerEvents="none" />

            {/* Member Context Header */}
            {!memberLoading && member && (
                <Card p={5} borderRadius="2xl" bg="app.card.bg" borderColor="app.card.border" backdropFilter="blur(20px)" mb={6} transition="all 0.3s">
                    <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                        <HStack gap={4}>
                            <Circle size={10} bg="brand.500/10" color="brand.500" border="1px solid" borderColor="brand.500/25">
                                <User size={18} />
                            </Circle>
                            <VStack align="start" gap={0}>
                                <Text fontSize="sm" fontWeight="950" color="app.text.primary">{memberName}</Text>
                                <Text fontSize="10px" color={muted} fontWeight="700">Member ID: {member?.data?.member_id || memberId}</Text>
                            </VStack>
                        </HStack>
                        <HStack gap={6} flexWrap="wrap">
                            <VStack align="start" gap={0}>
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">EMAIL</Text>
                                <Text fontSize="xs" fontWeight="800" color="app.text.primary">{member?.data?.email || "N/A"}</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">PHONE</Text>
                                <Text fontSize="xs" fontWeight="800" color="app.text.primary">{member?.data?.phone || "N/A"}</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">STATUS</Text>
                                <Badge
                                    colorPalette={member?.data?.status === "active" ? "green" : member?.data?.status === "attention" ? "orange" : "gray"}
                                    variant="subtle"
                                    borderRadius="lg"
                                    px={2.5}
                                    py={0.5}
                                    fontSize="9px"
                                    fontWeight="900"
                                >
                                    {member?.data?.status?.toUpperCase() || "FROZEN"}
                                </Badge>
                            </VStack>
                        </HStack>
                    </Flex>
                </Card>
            )}

            {/* Step Tracker */}
            <StepTracker currentStep={currentStep} />

            {/* ═══════════════════════════════════════════════════════════
                STEP 1: SELECT PLAN
            ═══════════════════════════════════════════════════════════ */}
            {currentStep === "select" && (
                <SimpleGrid columns={{ base: 1, xl: 4 }} gap={8} w="full" pb={20} position="relative" zIndex={1}>
                    {/* Plan Cards */}
                    <Box gridColumn={{ xl: "span 3" }}>
                        <VStack align="stretch" gap={8}>
                            <HStack justify="space-between" px={2}>
                                <VStack align="start" gap={1}>
                                    <Text fontSize="lg" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                                        Select Subscription Tier
                                    </Text>
                                    <Text fontSize="xs" color={muted} fontWeight="600">
                                        Choose the plan that aligns with {memberName}'s fitness goals.
                                    </Text>
                                </VStack>
                                {!plansLoading && plans.length > 0 && (
                                    <Badge variant="subtle" colorPalette="brand" borderRadius="full" px={4} py={1} fontSize="9px" fontWeight="900">
                                        {plans.length} PLANS ACTIVE
                                    </Badge>
                                )}
                            </HStack>

                            {plansLoading ? (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                    <Skeleton height="380px" borderRadius="3xl" />
                                    <Skeleton height="380px" borderRadius="3xl" />
                                    <Skeleton height="380px" borderRadius="3xl" />
                                </SimpleGrid>
                            ) : plans.length === 0 ? (
                                <EmptyPlansState />
                            ) : (
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                    {plans.map((plan) => (
                                        <PlanCard
                                            key={plan._id}
                                            plan={plan}
                                            isSelected={selectedPlan?._id === plan._id}
                                            onSelect={handleSelectPlan}
                                        />
                                    ))}
                                </SimpleGrid>
                            )}
                        </VStack>
                    </Box>

                    {/* Sidebar Summary */}
                    <Box position={{ xl: "sticky" }} top={{ xl: "7rem" }} alignSelf="start">
                        <Card p={7} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" gap={6} backdropFilter="blur(20px)">
                            <VStack align="stretch" gap={5}>
                                <OrderSummaryCard
                                    planName={selectedPlan?.data.name ?? "—"}
                                    billingCycle={selectedPlan?.data.billing_cycle ?? "monthly"}
                                    memberName={memberName}
                                    startDate={startDate}
                                    subtotal={displaySubtotal}
                                    taxBreakdown={displayTax}
                                    total={displayTotal}
                                    currency={CURRENCY_SYMBOL}
                                />

                                {!selectedPlan && (
                                    <Box p={6} borderRadius="2xl" bg={useColorModeValue("gray.50", "whiteAlpha.50")} border="1px dashed" borderColor="gray.500/20" textAlign="center">
                                        <Text fontSize="10px" color={muted} fontWeight="800" letterSpacing="wider">
                                            SELECT A PLAN TO UNLOCK CHECKOUT
                                        </Text>
                                    </Box>
                                )}

                                <Button
                                    colorPalette="brand"
                                    size="xl"
                                    h="58px"
                                    borderRadius="2xl"
                                    fontWeight="900"
                                    fontSize="xs"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    onClick={handleProceedToPayment}
                                    disabled={!selectedPlan || isSubmitting}
                                    bg={BRAND_GRADIENT}
                                    _hover={{
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 12px 25px -8px var(--chakra-colors-brand-500)",
                                    }}
                                    _active={{ transform: "translateY(-1px)" }}
                                    transition="all 0.3s"
                                >
                                    {isSubmitting ? <Spinner size="sm" /> : (
                                        <HStack gap={2}>
                                            <Text>Proceed to Payment</Text>
                                            <ArrowRight size={14} />
                                        </HStack>
                                    )}
                                </Button>
                            </VStack>
                        </Card>
                    </Box>
                </SimpleGrid>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 2: COLLECT PAYMENT
            ═══════════════════════════════════════════════════════════ */}
            {currentStep === "payment" && selectedPlan && enrollmentData && (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} maxW="4xl" mx="auto" pb={20} position="relative" zIndex={1}>
                    {/* Left: Payment Method + Inputs */}
                    <Card p={8} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" gap={6} backdropFilter="blur(20px)">
                        <Heading size="md" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                            Collect Payment
                        </Heading>

                        {/* Payment Method Selector (shared component) */}
                        <PaymentMethodSelector
                            paymentMode={paymentMode}
                            onlineMethod={onlineMethod}
                            onPaymentModeChange={setPaymentMode}
                            onOnlineMethodChange={setOnlineMethod}
                        />

                        <Separator opacity={0.06} />

                        {/* Method-specific UI */}
                        {paymentMode === "cash" && (
                            <CashTillCalculator
                                invoiceTotal={invoiceTotal}
                                cashReceived={cashReceived}
                                onCashReceivedChange={setCashReceived}
                                currencySymbol={CURRENCY_SYMBOL}
                            />
                        )}

                        {paymentMode === "online" && onlineMethod === "payment_link" && (
                            <PaymentLinkDispatcher
                                paymentLinkUrl={paymentLinkUrl}
                                invoiceNumber={enrollmentData.orderNumber}
                                total={invoiceTotal}
                                memberEmail={member?.data?.email}
                                isLoading={isSubmitting}
                                onSendLink={handleSendPaymentLink}
                                currencySymbol={CURRENCY_SYMBOL}
                            />
                        )}

                        {paymentMode === "online" && onlineMethod !== "payment_link" && (
                            <VStack
                                align="center"
                                gap={4}
                                p={5}
                                borderRadius="2xl"
                                border="1px solid"
                                borderColor={borderColor}
                                bg={useColorModeValue("gray.50", "whiteAlpha.50")}
                            >
                                <Badge
                                    colorPalette="brand"
                                    variant="subtle"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    fontSize="9px"
                                    fontWeight="900"
                                    letterSpacing="widest"
                                >
                                    {onlineMethod === "upi" ? "UPI PAYMENT" : "CARD PAYMENT"}
                                </Badge>
                                <Text fontSize="11px" color={muted} fontWeight="600" textAlign="center" maxW="250px">
                                    {onlineMethod === "upi"
                                        ? "Customer pays via Google Pay, PhonePe, or BHIM at the counter."
                                        : "Swipe or tap customer's debit/credit card at POS terminal."}
                                </Text>
                                <Text fontSize="2xl" fontWeight="950" color="brand.500" letterSpacing="tight">
                                    {formatINR(invoiceTotal)}
                                </Text>
                            </VStack>
                        )}
                    </Card>

                    {/* Right: Order Summary + Action */}
                    <Card p={8} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" justifyContent="space-between" backdropFilter="blur(20px)">
                        <VStack align="stretch" gap={6}>
                            <OrderSummaryCard
                                planName={selectedPlan.data.name}
                                billingCycle={selectedPlan.data.billing_cycle}
                                memberName={memberName}
                                startDate={enrollmentData.startDate}
                                subtotal={invoiceSubtotal}
                                taxBreakdown={invoiceTax}
                                total={invoiceTotal}
                                currency={CURRENCY_SYMBOL}
                                invoiceNumber={enrollmentData.invoiceNumber ?? enrollmentData.orderNumber}
                                invoiceStatus="pending"
                            />
                        </VStack>

                        <VStack gap={4} mt={8}>
                            {/* Main action: Collect or Send (not for payment_link — that has its own button) */}
                            {!(paymentMode === "online" && onlineMethod === "payment_link") && (
                                <Button
                                    colorPalette="brand"
                                    size="xl"
                                    h="60px"
                                    w="full"
                                    borderRadius="2xl"
                                    fontWeight="900"
                                    fontSize="xs"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    onClick={handleCollectPayment}
                                    disabled={isSubmitting}
                                    bg={BRAND_GRADIENT}
                                    _hover={{
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 12px 25px -8px var(--chakra-colors-brand-500)",
                                    }}
                                    _active={{ transform: "translateY(-1px)" }}
                                >
                                    {isSubmitting ? <Spinner size="sm" /> : (
                                        <HStack gap={2}>
                                            <Lock size={13} />
                                            <Text>
                                                {paymentMode === "cash"
                                                    ? "CONFIRM CASH COLLECTION"
                                                    : `CONFIRM ${onlineMethod.toUpperCase()} PAYMENT`}
                                            </Text>
                                        </HStack>
                                    )}
                                </Button>
                            )}

                            <Button
                                variant="ghost"
                                w="full"
                                size="lg"
                                h="46px"
                                borderRadius="xl"
                                fontWeight="800"
                                fontSize="xs"
                                color={muted}
                                onClick={handleGoBackToSelect}
                                disabled={isSubmitting}
                            >
                                <ArrowLeft size={14} /> Back to Plans
                            </Button>
                        </VStack>
                    </Card>
                </SimpleGrid>
            )}

            {/* ═══════════════════════════════════════════════════════════
                STEP 3: SUCCESS
            ═══════════════════════════════════════════════════════════ */}
            {currentStep === "success" && successData && selectedPlan && (
                <PaymentSuccessReceipt
                    invoiceNumber={successData.invoiceNumber}
                    subscriptionId={successData.subscriptionId}
                    memberName={memberName}
                    planName={selectedPlan.data.name}
                    billingCycle={selectedPlan.data.billing_cycle}
                    total={successData.total}
                    status={successData.status}
                    paymentMethod={successData.paymentMethod}
                    paymentLinkUrl={successData.paymentLinkUrl}
                    memberEmail={member?.data?.email}
                    startDate={enrollmentData?.startDate}
                    endDate={enrollmentData?.endDate}
                    currencySymbol={CURRENCY_SYMBOL}
                    onBackToDirectory={handleBack}
                    onPrintReceipt={handlePrintInvoice}
                />
            )}
        </PageLayout>
    );
});

SelectPlan.displayName = "SelectPlan";
export default SelectPlan;
