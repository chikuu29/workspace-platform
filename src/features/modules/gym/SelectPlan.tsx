/**
 * SelectPlan.tsx
 *
 * Subscription enrollment page — post-member-registration landing.
 * Displays active plans fetched from the backend as selectable pricing cards
 * with a premium, glassmorphic UI and an interactive checkout wizard.
 *
 * Once checkout is completed, calls the POST /gym/subscriptions/activate API,
 * which creates the invoice in the backend. If pay upfront is enabled, the user
 * can select the payment method (Card, Cash, Payment Link) and record it.
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
    Input,
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
    CreditCard as CreditCardIcon,
    Coins,
    QrCode,
    Receipt,
    Lock,
    Printer,
    CheckCircle2,
    User,
    Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { useGymMember } from "./hooks/useGymMember";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import { PageLayout } from "@/core/components/PageLayout";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import type { SubscriptionPlanDocument, ActivateSubscriptionPayload } from "./types/Gym.types";
import confetti from "canvas-confetti";

// ─── Constants ──────────────────────────────────────────────────────────────

const TAX_RATE = 0.18;
const CURRENCY_SYMBOL = "₹";

/** Formats number to INR currency string */
const formatINR = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
};

// ─── Gradient Mappings ──────────────────────────────────────────────────────

const GRADIENT_MAP: Record<string, string> = {
    brand: "linear-gradient(135deg, #7551FF 0%, #422AFB 100%)",
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

// ─── Subcomponents ──────────────────────────────────────────────────────────

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
                {/* Popular Glow Bar */}
                {isSelected && (
                    <Box
                        h="4px"
                        bg={gradient}
                        w="full"
                    />
                )}

                <VStack align="stretch" gap={5} p={7}>
                    {/* Header: Label + Selection Status */}
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
                                {planData.description || `Premium training access for ${planData.name.toLowerCase()} seekers`}
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

                    {/* Pricing Block */}
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

                    {/* Features List */}
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

// ─── Empty State ────────────────────────────────────────────────────────────

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
                        Create your first subscription plan template in order to enroll members into billing terms.
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
                    bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
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

// ─── Step Indicator ─────────────────────────────────────────────────────────

const STEPS = [
    { id: "select", label: "Choose Plan", description: "Select membership level" },
    { id: "payment", label: "Secure Payment", description: "Collect billing details" },
    { id: "success", label: "Activation", description: "Complete enrollment" },
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
                        boxShadow={isActive ? "0 0 15px rgba(117,81,255,0.5)" : "none"}
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

// ─── Main Component ──────────────────────────────────────────────────────────

const SelectPlan = memo(() => {
    const { params: memberId } = useParams();
    const { member, loading: memberLoading, notFound: memberNotFound, error: memberError } = useGymMember(memberId);

    // Fetch active plans from backend
    const { plans, loading: plansLoading } = useSubscriptionPlans({ activeOnly: true });

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);

    // Enrollment config are auto-created
    const startDate = useMemo(() => new Date().toISOString().split("T")[0], []);
    const [sendPaymentLink, setSendPaymentLink] = useState(false);
    const isPaid = useMemo(() => !sendPaymentLink, [sendPaymentLink]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step state: 'select' | 'payment' | 'success'
    const [currentStep, setCurrentStep] = useState<"select" | "payment" | "success">("select");

    // Payment details
    const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "payment_link">("cash");
    const [cardNumber, setCardNumber] = useState("");
    const [cardHolder, setCardHolder] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [isCvvFocused, setIsCvvFocused] = useState(false);

    // Cash Till Calculator details
    const [cashReceived, setCashReceived] = useState("");

    // QR Code Simulator Countdown
    const [qrTimer, setQrTimer] = useState(300);
    const [qrStatus, setQrStatus] = useState<"awaiting" | "verifying" | "success">("awaiting");

    // Success response info
    const [successData, setSuccessData] = useState<{
        subscriptionId: string;
        invoiceNumber: string;
        total: number;
        balanceDue: number;
        status: string;
    } | null>(null);

    // ── Navigation ──
    const { navigateTo } = useWorkspaceRouter();

    const memberName = useMemo(() => {
        const d = member?.data;
        const first = d?.firstName || "";
        const last = d?.lastName || "";
        return `${first} ${last}`.trim() || memberId || "New Member";
    }, [member, memberId]);

    const subtotal = selectedPlan?.data.price ?? 0;
    const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const renewalDate = useMemo(() => {
        if (!selectedPlan) return "";
        const d = new Date(startDate);
        const cycle = selectedPlan.data.billing_cycle;
        if (cycle === "monthly") d.setMonth(d.getMonth() + 1);
        else if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
        else d.setFullYear(d.getFullYear() + 1);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }, [startDate, selectedPlan]);

    // QR Code expiry ticking
    useEffect(() => {
        if (currentStep !== "payment" || paymentMethod !== "payment_link" || qrTimer <= 0) return;
        const interval = setInterval(() => {
            setQrTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [currentStep, paymentMethod, qrTimer]);

    const formattedQrTime = useMemo(() => {
        const minutes = Math.floor(qrTimer / 60);
        const seconds = qrTimer % 60;
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    }, [qrTimer]);

    // QR Simulator Auto Success Flow
    useEffect(() => {
        if (currentStep === "payment" && paymentMethod === "payment_link") {
            setQrTimer(300);
            setQrStatus("awaiting");
        }
    }, [currentStep, paymentMethod]);

    // Celebration Confetti on Success Step
    useEffect(() => {
        if (currentStep === "success") {
            confetti({
                particleCount: 125,
                spread: 75,
                origin: { y: 0.65 },
                colors: ["#7551FF", "#422AFB", "#01B574", "#FFB547"],
            });
            const t = setTimeout(() => {
                confetti({
                    particleCount: 85,
                    spread: 110,
                    origin: { y: 0.75 },
                });
            }, 450);
            return () => clearTimeout(t);
        }
    }, [currentStep]);

    // Cash Return Calculation
    const changeToReturn = useMemo(() => {
        const received = parseFloat(cashReceived);
        if (isNaN(received)) return 0;
        return received - total;
    }, [cashReceived, total]);

    // ── Handlers ──
    const handleBack = useCallback(() => {
        navigateTo("members");
    }, [navigateTo]);

    const handleSelectPlan = useCallback((plan: SubscriptionPlanDocument) => {
        setSelectedPlan(plan);
    }, []);

    const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim());
    }, []);

    const handleCardHolderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCardHolder(e.target.value);
    }, []);

    const handleCardExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCardExpiry(e.target.value);
    }, []);

    const handleCardCvvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCardCvv(e.target.value.replace(/\D/g, ""));
    }, []);

    const handleCashReceivedChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCashReceived(e.target.value.replace(/[^\d.]/g, ""));
    }, []);

    const handleCvvFocus = useCallback(() => setIsCvvFocused(true), []);
    const handleCvvBlur = useCallback(() => setIsCvvFocused(false), []);

    const handlePaymentMethodCash = useCallback(() => setPaymentMethod("cash"), []);
    const handlePaymentMethodCard = useCallback(() => setPaymentMethod("card"), []);
    const handlePaymentMethodLink = useCallback(() => setPaymentMethod("payment_link"), []);

    const handleSetStepSelect = useCallback(() => setCurrentStep("select"), []);

    const handlePaymentLinkToggle = useCallback((e: { checked: boolean }) => {
        setSendPaymentLink(e.checked);
    }, []);

    const step2PaymentLink = "https://pay.gym.saas/checkout/pending";
    const handleCopyStep2Link = useCallback(() => {
        navigator.clipboard.writeText(step2PaymentLink);
        toaster.create({ title: "Link Copied", description: "Payment link copied to clipboard.", type: "success" });
    }, []);

    const handleCopyStep3Link = useCallback(() => {
        if (!successData?.invoiceNumber) return;
        const link = `https://pay.gym.saas/invoice/${successData.invoiceNumber}`;
        navigator.clipboard.writeText(link);
        toaster.create({ title: "Link Copied", description: "Payment link copied to clipboard.", type: "success" });
    }, [successData?.invoiceNumber]);

    const handleOpenStep3Link = useCallback(() => {
        if (!successData?.invoiceNumber) return;
        const link = `https://pay.gym.saas/invoice/${successData.invoiceNumber}`;
        window.open(link, "_blank");
    }, [successData?.invoiceNumber]);

    // Quick cash handlers
    const handleQuickCash500 = useCallback(() => setCashReceived(prev => {
        const current = parseFloat(prev) || 0;
        return (current + 500).toString();
    }), []);
    const handleQuickCash1000 = useCallback(() => setCashReceived(prev => {
        const current = parseFloat(prev) || 0;
        return (current + 1000).toString();
    }), []);
    const handleQuickCash2000 = useCallback(() => setCashReceived(prev => {
        const current = parseFloat(prev) || 0;
        return (current + 2000).toString();
    }), []);
    const handleQuickCashExact = useCallback(() => setCashReceived(total.toFixed(0)), [total]);
    const handleQuickCashClear = useCallback(() => setCashReceived(""), []);

    const handleConfirm = useCallback((isPaidOverride?: boolean) => {
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

        const shouldBePaid = isPaidOverride !== undefined
            ? isPaidOverride
            : (sendPaymentLink ? false : (paymentMethod === "payment_link" ? false : true));

        const payload: ActivateSubscriptionPayload = {
            member_id: effectiveMemberId,
            plan_code: selectedPlan.data.code,
            start_date: startDate,
            is_paid: shouldBePaid,
            payment_amount: total,
            payment_method: sendPaymentLink ? "payment_link" : paymentMethod,
            transaction_ref: shouldBePaid
                ? paymentMethod === "card"
                    ? "CRD-TXN-" + Math.floor(100000 + Math.random() * 900000)
                    : paymentMethod === "payment_link"
                    ? "UPI-QR-" + Math.floor(100000 + Math.random() * 900000)
                    : "CSH-" + Math.floor(100000 + Math.random() * 900000)
                : undefined,
        };

        const sub = GymApiService.activateSubscription(payload).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    toaster.create({
                        title: "Checkout Success!",
                        description: `Activated plan ${res.data.plan_name} for ${memberName}.`,
                        type: "success",
                    });

                    setSuccessData({
                        subscriptionId: res.data.subscription_id,
                        invoiceNumber: res.data.invoice?.invoice_number || "INV-GEN-DRAFT",
                        total: res.data.invoice?.total || total,
                        balanceDue: res.data.invoice?.balance_due || 0,
                        status: res.data.invoice?.status || (shouldBePaid ? "paid" : "sent"),
                    });

                    setCurrentStep("success");
                } else {
                    toaster.create({
                        title: "Checkout Failed",
                        description: (res as any).message ?? "Something went wrong.",
                        type: "error",
                    });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({
                    title: "Checkout Error",
                    description: err?.message ?? "Failed to complete checkout on server.",
                    type: "error",
                });
            },
        });

        return () => sub.unsubscribe();
    }, [selectedPlan, memberId, member?.data?.member_id, startDate, sendPaymentLink, total, paymentMethod, memberName]);

    const handleProcessCheckout = useCallback(() => {
        const shouldBePaid = paymentMethod === "payment_link" ? false : true;
        handleConfirm(shouldBePaid);
    }, [handleConfirm, paymentMethod]);

    const handleCheckoutNext = useCallback(() => {
        if (!selectedPlan) {
            toaster.create({ title: "Select a Plan", description: "Pick a subscription plan first.", type: "warning" });
            return;
        }
        if (sendPaymentLink) {
            handleConfirm(false);
        } else {
            setCurrentStep("payment");
        }
    }, [selectedPlan, sendPaymentLink, handleConfirm]);

    const simulateQrPayment = useCallback(() => {
        setQrStatus("verifying");
        setTimeout(() => {
            setQrStatus("success");
            toaster.create({
                title: "Mock Payment Received",
                description: "Simulated UPI Payment notification received.",
                type: "success",
            });
            handleConfirm(true);
        }, 1500);
    }, [handleConfirm]);

    const handlePrintInvoice = useCallback(() => {
        window.print();
    }, []);

    // ── Card Brand Logo Detector ──
    const cardBrand = useMemo(() => {
        const clean = cardNumber.replace(/\s+/g, "");
        if (clean.startsWith("4")) return "VISA";
        if (/^5[1-5]/.test(clean)) return "MASTERCARD";
        if (/^3[47]/.test(clean)) return "AMEX";
        return "CARD";
    }, [cardNumber]);

    const checkoutButtonText = useMemo(() => {
        if (isSubmitting) return "Processing...";
        return sendPaymentLink ? "Send Payment Link" : "Proceed to Payment";
    }, [isSubmitting, sendPaymentLink]);

    // ── Theme & Styles ──
    const muted = useColorModeValue("gray.500", "gray.400");
    const settingBg = useColorModeValue("whiteAlpha.600", "rgba(255, 255, 255, 0.03)");
    const stepBg = useColorModeValue("white", "rgba(11, 20, 55, 0.45)");
    const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
    const receiptBgStyle = useColorModeValue("#fcfcfc", "#121a3a");

    // ── Not found / Error ──
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
                                    : <>We couldn't find a member profile matching the ID: <Text as="span" color="app.text.primary" fontWeight="900">"{memberId}"</Text>.</>}
                            </Text>
                        </VStack>
                        <Button
                            colorPalette="brand"
                            size="lg"
                            px={10}
                            borderRadius="2xl"
                            fontWeight="900"
                            onClick={handleBack}
                            bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
                            _hover={{ transform: "translateY(-2px)" }}
                        >
                            <ArrowLeft size={18} /> Back to Directory
                        </Button>
                    </VStack>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Premium Plan Enrollment"
            subtitle={memberLoading ? "Loading member data..." : `Enrolling ${memberName} in subscription service`}
            position="relative"
        >
            {/* CSS style block for premium animations and flip features (No inline styles) */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes pulseBlob {
                    0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.08; }
                    33% { transform: scale(1.15) translate(30px, -40px); opacity: 0.12; }
                    66% { transform: scale(0.9) translate(-20px, 30px); opacity: 0.06; }
                }
                .bg-blob-1 {
                    animation: pulseBlob 20s infinite ease-in-out;
                }
                .bg-blob-2 {
                    animation: pulseBlob 25s infinite ease-in-out alternate;
                }
                .flip-card {
                    perspective: 1000px;
                    width: 100%;
                    height: 185px;
                }
                .flip-card-inner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform-style: preserve-3d;
                }
                .flip-card-inner.flipped {
                    transform: rotateY(180deg);
                }
                .flip-card-front, .flip-card-back {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    border-radius: 24px;
                }
                .flip-card-back {
                    transform: rotateY(180deg);
                }
                .receipt-jagged {
                    position: relative;
                }
                .receipt-jagged::before {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    height: 6px;
                    top: -6px;
                    background-size: 12px 6px;
                    background-repeat: repeat-x;
                    background-image: linear-gradient(135deg, transparent 50%, ${receiptBgStyle} 50%), linear-gradient(-135deg, transparent 50%, ${receiptBgStyle} 50%);
                }
                .receipt-jagged-bottom::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: -6px;
                    height: 6px;
                    background-size: 12px 6px;
                    background-repeat: repeat-x;
                    background-image: linear-gradient(45deg, transparent 50%, ${receiptBgStyle} 50%), linear-gradient(-45deg, transparent 50%, ${receiptBgStyle} 50%);
                }
            ` }} />

            {/* Background Blurs for premium depth */}
            <Box
                position="absolute"
                className="bg-blob-1"
                top="-80px"
                right="-80px"
                w="480px"
                h="480px"
                bg="brand.500"
                filter="blur(160px)"
                zIndex={0}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                className="bg-blob-2"
                bottom="-120px"
                left="-120px"
                w="450px"
                h="450px"
                bg="cyan.500"
                filter="blur(150px)"
                zIndex={0}
                pointerEvents="none"
            />

            {/* ── Redesigned Header: Glassmorphic Member Context Summary ── */}
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
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">EMAIL ADDRESS</Text>
                                <Text fontSize="xs" fontWeight="800" color="app.text.primary">{member?.data?.email || "N/A"}</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">PHONE NUMBER</Text>
                                <Text fontSize="xs" fontWeight="800" color="app.text.primary">{member?.data?.phone || "N/A"}</Text>
                            </VStack>
                            <VStack align="start" gap={0}>
                                <Text fontSize="8px" color={muted} fontWeight="900" letterSpacing="wider">PROFILE STATUS</Text>
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

            {/* Step indicators */}
            <StepTracker currentStep={currentStep} />

            {/* ── Step 1: Select Plan ── */}
            {currentStep === "select" && (
                <SimpleGrid columns={{ base: 1, xl: 4 }} gap={8} w="full" pb={20} position="relative" zIndex={1}>
                    {/* Main Cards list */}
                    <Box gridColumn={{ xl: "span 3" }}>
                        <VStack align="stretch" gap={8}>
                            {/* Section title */}
                            <HStack justify="space-between" px={2}>
                                <VStack align="start" gap={1}>
                                    <Text fontSize="lg" fontWeight="950" color="app.text.primary" letterSpacing="tight">
                                        Select Subscription Tier
                                    </Text>
                                    <Text fontSize="xs" color={muted} fontWeight="600">
                                        Choose the subscription plan that aligns with {memberName}'s fitness goals.
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

                            {/* Additional Options Card (Send Payment Link option) */}
                            <Card p={6} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" backdropFilter="blur(20px)" gap={4}>
                                <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                                    <HStack gap={3}>
                                        <Circle size={8} bg="purple.500/10" color="purple.500" border="1px solid" borderColor="purple.500/25">
                                            <QrCode size={16} />
                                        </Circle>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                                                Digital Billing Delivery
                                            </Text>
                                            <Text fontSize="10px" color={muted} fontWeight="600">
                                                Dispatch a secure billing page to the member's email/phone for remote checkout.
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <HStack
                                        justify="space-between"
                                        h="44px"
                                        px={4}
                                        borderRadius="xl"
                                        bg={sendPaymentLink ? "purple.500/5" : settingBg}
                                        border="1px solid"
                                        borderColor={sendPaymentLink ? "purple.500/25" : "transparent"}
                                        transition="all 0.3s"
                                        minW="180px"
                                    >
                                        <Text fontSize="xs" fontWeight="900" color={sendPaymentLink ? "purple.500" : "app.text.primary"}>
                                            {sendPaymentLink ? "Send Payment Link" : "Collect Immediately"}
                                        </Text>
                                        <Switch
                                            colorPalette="purple"
                                            size="md"
                                            checked={sendPaymentLink}
                                            onCheckedChange={handlePaymentLinkToggle}
                                        />
                                    </HStack>
                                </Flex>
                            </Card>
                        </VStack>
                    </Box>

                    {/* Sidebar Summary */}
                    <Box position={{ xl: "sticky" }} top={{ xl: "7rem" }} alignSelf="start">
                        <Card p={7} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" gap={6} backdropFilter="blur(20px)">
                            <VStack align="stretch" gap={5}>
                                <HStack justify="space-between">
                                    <Text fontSize="sm" fontWeight="950" color="app.text.primary" letterSpacing="wider" textTransform="uppercase">Summary</Text>
                                    <Crown color="var(--chakra-colors-brand-500)" size={16} />
                                </HStack>

                                {selectedPlan ? (
                                    <Box
                                        p={4}
                                        borderRadius="2xl"
                                        bg={useColorModeValue("brand.50", "brand.500/10")}
                                        border="1px solid"
                                        borderColor={useColorModeValue("brand.100", "brand.500/15")}
                                    >
                                        <Flex justify="space-between" align="center" mb={1}>
                                            <Text fontWeight="900" fontSize="xs" color="app.text.primary">
                                                {selectedPlan.data.name}
                                            </Text>
                                            <Badge colorPalette={selectedPlan.data.accent_color || "brand"} borderRadius="md" fontSize="8px" fontWeight="900">
                                                {selectedPlan.data.billing_cycle.toUpperCase()}
                                            </Badge>
                                        </Flex>
                                        <Text fontSize="10px" color={muted} fontWeight="700">
                                            Auto-Renews: {renewalDate}
                                        </Text>
                                    </Box>
                                ) : (
                                    <Box p={6} borderRadius="2xl" bg={settingBg} border="1px dashed" borderColor="gray.500/20" textAlign="center">
                                        <Text fontSize="10px" color={muted} fontWeight="800" letterSpacing="wider">
                                            SELECT A PLAN TO UNLOCK CHECKOUT
                                        </Text>
                                    </Box>
                                )}

                                <VStack align="stretch" gap={3}>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">Subtotal</Text>
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">{CURRENCY_SYMBOL}{subtotal.toLocaleString("en-IN")}</Text>
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">GST (18%)</Text>
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">{CURRENCY_SYMBOL}{tax.toLocaleString("en-IN")}</Text>
                                    </Flex>
                                    <Separator opacity={0.06} />
                                    <Flex justify="space-between" align="center" pt={1}>
                                        <Text fontSize="xs" fontWeight="950" color="app.text.primary" textTransform="uppercase" letterSpacing="wider">Grand Total</Text>
                                        <Text fontSize="xl" fontWeight="950" color="brand.500" letterSpacing="tight">
                                            {CURRENCY_SYMBOL}{total.toLocaleString("en-IN")}
                                        </Text>
                                    </Flex>
                                </VStack>

                                <Button
                                    colorPalette="brand"
                                    size="xl"
                                    h="58px"
                                    borderRadius="2xl"
                                    fontWeight="900"
                                    fontSize="xs"
                                    letterSpacing="widest"
                                    textTransform="uppercase"
                                    onClick={handleCheckoutNext}
                                    disabled={!selectedPlan || isSubmitting}
                                    bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
                                    _hover={{
                                        transform: "translateY(-3px)",
                                        boxShadow: "0 12px 25px -8px var(--chakra-colors-brand-500)",
                                    }}
                                    _active={{ transform: "translateY(-1px)" }}
                                    transition="all 0.3s"
                                >
                                    {isSubmitting ? <Spinner size="sm" /> : (
                                        <HStack gap={2}>
                                            <Text>{checkoutButtonText}</Text>
                                            <ArrowRight size={14} />
                                        </HStack>
                                    )}
                                </Button>
                            </VStack>
                        </Card>
                    </Box>
                </SimpleGrid>
            )}

            {/* ── Step 2: SECURE PAYMENT MODAL / PAGE ── */}
            {currentStep === "payment" && selectedPlan && (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} maxW="4xl" mx="auto" pb={20} position="relative" zIndex={1}>
                    {/* Payment Form & Simulators */}
                    <Card p={8} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" gap={6} backdropFilter="blur(20px)">
                        <Heading size="md" fontWeight="950" color="app.text.primary" letterSpacing="tight">Choose Payment Method</Heading>
                        <SimpleGrid columns={3} gap={4}>
                            <Button
                                h="64px"
                                borderRadius="2xl"
                                variant={paymentMethod === "cash" ? "solid" : "outline"}
                                colorPalette="brand"
                                bg={paymentMethod === "cash" ? "brand.500" : "transparent"}
                                borderColor={paymentMethod === "cash" ? "transparent" : borderColor}
                                color={paymentMethod === "cash" ? "white" : "app.text.primary"}
                                onClick={handlePaymentMethodCash}
                                flexDir="column"
                                gap={1}
                                _hover={{ bg: paymentMethod === "cash" ? "brand.500" : "whiteAlpha.50" }}
                            >
                                <Coins size={18} />
                                <Text fontSize="9px" fontWeight="900" letterSpacing="wider">CASH</Text>
                            </Button>
                            <Button
                                h="64px"
                                borderRadius="2xl"
                                variant={paymentMethod === "card" ? "solid" : "outline"}
                                colorPalette="brand"
                                bg={paymentMethod === "card" ? "brand.500" : "transparent"}
                                borderColor={paymentMethod === "card" ? "transparent" : borderColor}
                                color={paymentMethod === "card" ? "white" : "app.text.primary"}
                                onClick={handlePaymentMethodCard}
                                flexDir="column"
                                gap={1}
                                _hover={{ bg: paymentMethod === "card" ? "brand.500" : "whiteAlpha.50" }}
                            >
                                <CreditCardIcon size={18} />
                                <Text fontSize="9px" fontWeight="900" letterSpacing="wider">CARD</Text>
                            </Button>
                            <Button
                                h="64px"
                                borderRadius="2xl"
                                variant={paymentMethod === "payment_link" ? "solid" : "outline"}
                                colorPalette="brand"
                                bg={paymentMethod === "payment_link" ? "brand.500" : "transparent"}
                                borderColor={paymentMethod === "payment_link" ? "transparent" : borderColor}
                                color={paymentMethod === "payment_link" ? "white" : "app.text.primary"}
                                onClick={handlePaymentMethodLink}
                                flexDir="column"
                                gap={1}
                                _hover={{ bg: paymentMethod === "payment_link" ? "brand.500" : "whiteAlpha.50" }}
                            >
                                <QrCode size={18} />
                                <Text fontSize="9px" fontWeight="900" letterSpacing="wider">PAYMENT LINK</Text>
                            </Button>
                        </SimpleGrid>

                        <Separator opacity={0.06} />

                        {/* Method Specific Simulators */}

                        {/* ── Redesigned Cash Till Simulator ── */}
                        {paymentMethod === "cash" && (
                            <VStack align="stretch" gap={4} p={5} bg="rgba(0,0,0,0.02)" borderRadius="2xl" border="1px solid" borderColor={borderColor}>
                                <HStack justify="space-between">
                                    <Text fontSize="xs" fontWeight="950" color="brand.500" letterSpacing="wider" textTransform="uppercase">Digital Till Receipt</Text>
                                    <Coins size={15} color="var(--chakra-colors-brand-500)" />
                                </HStack>

                                <Separator opacity={0.1} />

                                <VStack align="stretch" gap={2}>
                                    <Flex justify="space-between">
                                        <Text fontSize="xs" color={muted} fontWeight="700">INVOICE TOTAL</Text>
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">{formatINR(total)}</Text>
                                    </Flex>

                                    <HStack justify="space-between" mt={1}>
                                        <Text fontSize="xs" color={muted} fontWeight="700">CASH RECEIVED</Text>
                                        <HStack maxW="120px">
                                            <Text fontSize="xs" fontWeight="900" color="app.text.primary">₹</Text>
                                            <Input
                                                placeholder={total.toFixed(0)}
                                                value={cashReceived}
                                                onChange={handleCashReceivedChange}
                                                h="34px"
                                                borderRadius="lg"
                                                bg={settingBg}
                                                border="1px solid"
                                                borderColor={borderColor}
                                                fontWeight="800"
                                                fontSize="xs"
                                                textAlign="right"
                                            />
                                        </HStack>
                                    </HStack>

                                    <Flex justify="space-between" align="center" mt={2} p={2.5} bg="brand.500/5" borderRadius="xl" border="1px solid" borderColor="brand.500/10">
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">CHANGE DUE</Text>
                                        <VStack align="end" gap={0}>
                                            <Text
                                                fontSize="md"
                                                fontWeight="950"
                                                color={changeToReturn < 0 ? "orange.500" : "green.500"}
                                                letterSpacing="tight"
                                            >
                                                {changeToReturn < 0 ? "-" : ""}{formatINR(Math.abs(changeToReturn))}
                                            </Text>
                                            <Badge colorPalette={changeToReturn < 0 ? "orange" : "green"} fontSize="8px" fontWeight="900">
                                                {changeToReturn < 0 ? "SHORT" : "RETURN"}
                                            </Badge>
                                        </VStack>
                                    </Flex>
                                </VStack>

                                <Separator opacity={0.1} />

                                {/* Quick Cash buttons for fast operators */}
                                <VStack align="stretch" gap={2}>
                                    <Text fontSize="10px" fontWeight="900" color={muted} letterSpacing="wider">QUICK CASH INPUTS</Text>
                                    <Flex gap={2} flexWrap="wrap">
                                        <Button size="xs" variant="outline" h="28px" borderRadius="lg" fontSize="10px" fontWeight="800" onClick={handleQuickCash500}>+ ₹500</Button>
                                        <Button size="xs" variant="outline" h="28px" borderRadius="lg" fontSize="10px" fontWeight="800" onClick={handleQuickCash1000}>+ ₹1000</Button>
                                        <Button size="xs" variant="outline" h="28px" borderRadius="lg" fontSize="10px" fontWeight="800" onClick={handleQuickCash2000}>+ ₹2000</Button>
                                        <Button size="xs" colorPalette="brand" h="28px" borderRadius="lg" fontSize="10px" fontWeight="800" onClick={handleQuickCashExact}>Exact Amount</Button>
                                        {cashReceived && (
                                            <Button size="xs" variant="ghost" colorPalette="red" h="28px" borderRadius="lg" fontSize="10px" fontWeight="800" onClick={handleQuickCashClear}>Clear</Button>
                                        )}
                                    </Flex>
                                </VStack>
                            </VStack>
                        )}

                        {paymentMethod === "card" && (
                            <VStack align="stretch" gap={5}>
                                {/* Visual Credit Card (Flippable) */}
                                <Box className="flip-card">
                                    <Box className={`flip-card-inner ${isCvvFocused ? "flipped" : ""}`}>
                                        {/* Front Side */}
                                        <Box
                                            className="flip-card-front"
                                            bgGradient="radial(circle at 10% 20%, #1e295b 0%, #0b1437 100%)"
                                            border="1px solid"
                                            borderColor="whiteAlpha.150"
                                            p={6}
                                            boxShadow="xl"
                                            color="white"
                                        >
                                            {/* Microchip & Brand */}
                                            <Flex justify="space-between" align="start" mb={6}>
                                                {/* Chip */}
                                                <Box w="36px" h="28px" bgGradient="linear(to-br, #ffe082, #e5a93b)" borderRadius="md" position="relative" border="1px solid" borderColor="rgba(0,0,0,0.1)">
                                                    <Box position="absolute" top="30%" left="0" w="full" h="1px" bg="rgba(0,0,0,0.2)" />
                                                    <Box position="absolute" top="60%" left="0" w="full" h="1px" bg="rgba(0,0,0,0.2)" />
                                                    <Box position="absolute" top="0" left="40%" w="1px" h="full" bg="rgba(0,0,0,0.2)" />
                                                </Box>
                                                <Text fontSize="sm" fontWeight="950" fontStyle="italic" letterSpacing="widest" color="whiteAlpha.800">
                                                    {cardBrand}
                                                </Text>
                                            </Flex>

                                            {/* Card Number */}
                                            <Text fontSize="md" fontWeight="900" letterSpacing="widest" mb={5} fontStyle="mono" color="whiteAlpha.900">
                                                {cardNumber || "•••• •••• •••• ••••"}
                                            </Text>

                                            <Flex justify="space-between" align="end">
                                                <VStack align="start" gap={0}>
                                                    <Text fontSize="7px" color="whiteAlpha.500" fontWeight="900" textTransform="uppercase" letterSpacing="wider">Card Holder</Text>
                                                    <Text fontSize="10px" fontWeight="900" color="whiteAlpha.900" maxW="150px" truncate>
                                                        {cardHolder.toUpperCase() || "MEMBER NAME"}
                                                    </Text>
                                                </VStack>
                                                <VStack align="end" gap={0}>
                                                    <Text fontSize="7px" color="whiteAlpha.500" fontWeight="900" textTransform="uppercase" letterSpacing="wider">Expires</Text>
                                                    <Text fontSize="10px" fontWeight="900" color="whiteAlpha.900">
                                                        {cardExpiry || "MM/YY"}
                                                    </Text>
                                                </VStack>
                                            </Flex>
                                        </Box>

                                        {/* Back Side */}
                                        <Box
                                            className="flip-card-back"
                                            bgGradient="radial(circle at 10% 20%, #171d3d 0%, #080d25 100%)"
                                            border="1px solid"
                                            borderColor="whiteAlpha.150"
                                            py={6}
                                            boxShadow="xl"
                                            color="white"
                                        >
                                            {/* Magnetic Strip */}
                                            <Box bg="black" h="38px" w="full" mt={2} mb={4} opacity={0.8} />

                                            {/* Signature & CVV */}
                                            <Box px={6}>
                                                <Text fontSize="7px" color="whiteAlpha.500" fontWeight="900" textTransform="uppercase" letterSpacing="wider" mb={1}>CVV CODE</Text>
                                                <Flex justify="space-between" align="center" bg="whiteAlpha.100" h="36px" borderRadius="md" px={3} border="1px solid" borderColor="whiteAlpha.100">
                                                    <Box flex={1} bgGradient="repeating-linear(45deg, rgba(255,255,255,0.05), rgba(255,255,255,0.05) 5px, transparent 5px, transparent 10px)" h="20px" mr={4} />
                                                    <Text fontWeight="950" fontStyle="mono" color="white" fontSize="xs" letterSpacing="wider">
                                                        {cardCvv || "•••"}
                                                    </Text>
                                                </Flex>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Card Inputs */}
                                <VStack align="stretch" gap={3}>
                                    <Field label={<Text fontWeight="900" fontSize="9px" color={muted} letterSpacing="wider">CARD NUMBER</Text>}>
                                        <Input
                                            placeholder="4111 2222 3333 4444"
                                            maxLength={19}
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            h="42px"
                                            borderRadius="xl"
                                            bg={settingBg}
                                            border="1px solid"
                                            borderColor={borderColor}
                                            _focus={{ borderColor: "brand.500" }}
                                            fontWeight="700"
                                        />
                                    </Field>
                                    <Field label={<Text fontWeight="900" fontSize="9px" color={muted} letterSpacing="wider">CARD HOLDER</Text>}>
                                        <Input
                                            placeholder="John Doe"
                                            value={cardHolder}
                                            onChange={handleCardHolderChange}
                                            h="42px"
                                            borderRadius="xl"
                                            bg={settingBg}
                                            border="1px solid"
                                            borderColor={borderColor}
                                            _focus={{ borderColor: "brand.500" }}
                                            fontWeight="700"
                                        />
                                    </Field>
                                    <SimpleGrid columns={2} gap={4}>
                                        <Field label={<Text fontWeight="900" fontSize="9px" color={muted} letterSpacing="wider">EXPIRY DATE</Text>}>
                                            <Input
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                value={cardExpiry}
                                                onChange={handleCardExpiryChange}
                                                h="42px"
                                                borderRadius="xl"
                                                bg={settingBg}
                                                border="1px solid"
                                                borderColor={borderColor}
                                                _focus={{ borderColor: "brand.500" }}
                                                fontWeight="700"
                                            />
                                        </Field>
                                        <Field label={<Text fontWeight="900" fontSize="9px" color={muted} letterSpacing="wider">CVV</Text>}>
                                            <Input
                                                placeholder="•••"
                                                maxLength={3}
                                                value={cardCvv}
                                                onChange={handleCardCvvChange}
                                                onFocus={handleCvvFocus}
                                                onBlur={handleCvvBlur}
                                                h="42px"
                                                borderRadius="xl"
                                                bg={settingBg}
                                                border="1px solid"
                                                borderColor={borderColor}
                                                _focus={{ borderColor: "brand.500" }}
                                                fontWeight="700"
                                            />
                                        </Field>
                                    </SimpleGrid>
                                </VStack>
                            </VStack>
                        )}

                        {paymentMethod === "payment_link" && (
                            <VStack align="center" gap={5} py={3}>
                                <Badge colorPalette="purple" variant="subtle" px={3} py={1} borderRadius="full" fontSize="9px" fontWeight="900" letterSpacing="widest">
                                    UPI TERMINAL SCANNER
                                </Badge>

                                {/* Dynamic custom styled QR Code */}
                                <Box p={4} bg="white" borderRadius="3xl" shadow="xl" display="inline-block" border="1px solid" borderColor="gray.100" position="relative">
                                    <svg width="150" height="150" viewBox="0 0 100 100">
                                        {/* Find/Alignment anchors (Three outer squares) */}
                                        <rect x="0" y="0" width="24" height="24" rx="4" fill="#422AFB" />
                                        <rect x="3" y="3" width="18" height="18" rx="2" fill="white" />
                                        <rect x="6" y="6" width="12" height="12" rx="1" fill="#7551FF" />

                                        <rect x="76" y="0" width="24" height="24" rx="4" fill="#422AFB" />
                                        <rect x="79" y="3" width="18" height="18" rx="2" fill="white" />
                                        <rect x="82" y="6" width="12" height="12" rx="1" fill="#7551FF" />

                                        <rect x="0" y="76" width="24" height="24" rx="4" fill="#422AFB" />
                                        <rect x="3" y="79" width="18" height="18" rx="2" fill="white" />
                                        <rect x="6" y="82" width="12" height="12" rx="1" fill="#7551FF" />

                                        {/* Simulated stylized dots inside QR grid */}
                                        <circle cx="38" cy="5" r="2.5" fill="#422AFB" />
                                        <circle cx="48" cy="12" r="2" fill="#7551FF" />
                                        <circle cx="58" cy="8" r="2.5" fill="#1b3bbb" />
                                        <circle cx="68" cy="15" r="2" fill="#422AFB" />

                                        <circle cx="34" cy="28" r="2.5" fill="#7551FF" />
                                        <circle cx="44" cy="34" r="2" fill="#1b3bbb" />
                                        <circle cx="54" cy="26" r="2" fill="#422AFB" />
                                        <circle cx="64" cy="38" r="2.5" fill="#7551FF" />
                                        <circle cx="74" cy="30" r="2" fill="#1b3bbb" />

                                        <circle cx="12" cy="38" r="2" fill="#422AFB" />
                                        <circle cx="22" cy="48" r="2.5" fill="#7551FF" />
                                        <circle cx="15" cy="58" r="2" fill="#1b3bbb" />

                                        <circle cx="38" cy="48" r="2" fill="#7551FF" />
                                        <circle cx="48" cy="58" r="2.5" fill="#422AFB" />
                                        <circle cx="58" cy="44" r="2" fill="#1b3bbb" />
                                        <circle cx="68" cy="56" r="2.5" fill="#7551FF" />
                                        <circle cx="78" cy="48" r="2" fill="#422AFB" />
                                        <circle cx="88" cy="58" r="2.5" fill="#1b3bbb" />

                                        <circle cx="38" cy="68" r="2.5" fill="#422AFB" />
                                        <circle cx="48" cy="78" r="2.5" fill="#7551FF" />
                                        <circle cx="58" cy="68" r="2.5" fill="#1b3bbb" />
                                        <circle cx="68" cy="78" r="2" fill="#422AFB" />

                                        <circle cx="78" cy="78" r="2" fill="#7551FF" />
                                        <circle cx="88" cy="78" r="2.5" fill="#1b3bbb" />
                                        <circle cx="78" cy="88" r="2.5" fill="#422AFB" />
                                        <circle cx="88" cy="88" r="2.5" fill="#7551FF" />

                                        {/* Center brand logo overlay */}
                                        <rect x="40" y="40" width="20" height="20" rx="5" fill="#422AFB" stroke="white" strokeWidth="2" />
                                        <path d="M46 50 L54 50 M50 46 L50 54" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                </Box>

                                <VStack gap={1} textAlign="center">
                                    <HStack gap={2} justify="center">
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">SCAN & PAY</Text>
                                        <Badge colorPalette="red" variant="solid" px={1.5} fontSize="9px" fontFamily="mono">
                                            {formattedQrTime}
                                        </Badge>
                                    </HStack>
                                    <Text fontSize="10px" color={muted} fontWeight="600" maxW="220px">
                                        Dynamic UPI code generated. Expires shortly.
                                    </Text>
                                </VStack>

                                {/* Mock Payment Link copyable block */}
                                <Field label={<Text fontSize="9px" fontWeight="900" color={muted} letterSpacing="wider" mb={1}>SECURE CHECKOUT URL</Text>} w="full" px={4}>
                                    <HStack w="full" gap={2}>
                                        <Input
                                            readOnly
                                            value={step2PaymentLink}
                                            h="36px"
                                            borderRadius="xl"
                                            bg="blackAlpha.200"
                                            border="1px solid"
                                            borderColor={borderColor}
                                            fontWeight="600"
                                            fontSize="xs"
                                        />
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            h="36px"
                                            borderRadius="xl"
                                            onClick={handleCopyStep2Link}
                                            minW="70px"
                                            color="app.text.primary"
                                        >
                                            <Text fontSize="10px" fontWeight="800">Copy</Text>
                                        </Button>
                                    </HStack>
                                </Field>

                                <VStack gap={2} w="full" px={4}>
                                    <HStack gap={3} w="full" justify="center" p={3} bg="whiteAlpha.50" borderRadius="xl" border="1px solid" borderColor={borderColor}>
                                        {qrStatus === "awaiting" && (
                                            <>
                                                <Spinner size="xs" color="brand.500" borderWidth="2px" />
                                                <Text fontSize="10px" color={muted} fontWeight="700">Awaiting customer scan...</Text>
                                            </>
                                        )}
                                        {qrStatus === "verifying" && (
                                            <>
                                                <Spinner size="xs" color="purple.500" borderWidth="2px" />
                                                <Text fontSize="10px" color="purple.500" fontWeight="700">Verifying payment notification...</Text>
                                            </>
                                        )}
                                        {qrStatus === "success" && (
                                            <>
                                                <Circle size={4} bg="green.500" color="white">
                                                    <Check size={8} strokeWidth={4} />
                                                </Circle>
                                                <Text fontSize="10px" color="green.500" fontWeight="900">Payment captured!</Text>
                                            </>
                                        )}
                                    </HStack>

                                    {qrStatus === "awaiting" && (
                                        <Button
                                            size="sm"
                                            w="full"
                                            variant="ghost"
                                            h="36px"
                                            borderRadius="xl"
                                            colorScheme="purple"
                                            color="purple.500"
                                            fontWeight="900"
                                            fontSize="10px"
                                            letterSpacing="widest"
                                            textTransform="uppercase"
                                            onClick={simulateQrPayment}
                                        >
                                            Simulate Pay Success
                                        </Button>
                                    )}
                                </VStack>
                            </VStack>
                        )}
                    </Card>

                    {/* Summary & Checkout Action */}
                    <Card p={8} borderRadius="3xl" bg="app.card.bg" borderColor="app.card.border" justifyContent="space-between" backdropFilter="blur(20px)">
                        <VStack align="stretch" gap={6}>
                            <HStack justify="space-between">
                                <Text fontSize="sm" fontWeight="950" color="app.text.primary" letterSpacing="wider" textTransform="uppercase">Checkout Overview</Text>
                                <Receipt color="var(--chakra-colors-brand-500)" size={16} />
                            </HStack>

                            <Box p={5} borderRadius="2xl" bg={useColorModeValue("brand.50", "brand.500/10")} border="1px solid" borderColor={borderColor}>
                                <VStack align="stretch" gap={3}>
                                    <HStack justify="space-between">
                                        <Text fontSize="xs" fontWeight="900" color="app.text.primary">{selectedPlan.data.name} Package</Text>
                                        <Badge colorPalette="brand" borderRadius="md" fontSize="8px" fontWeight="900">
                                            {selectedPlan.data.billing_cycle.toUpperCase()}
                                        </Badge>
                                    </HStack>
                                    <Separator opacity={0.06} />
                                    <SimpleGrid columns={2} gap={4}>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="8px" color={muted} fontWeight="800">ENROLLEE</Text>
                                            <Text fontSize="xs" fontWeight="900" color="app.text.primary" truncate>{memberName}</Text>
                                        </VStack>
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="8px" color={muted} fontWeight="800">EFFECTIVE FROM</Text>
                                            <Text fontSize="xs" fontWeight="900" color="app.text.primary">{startDate}</Text>
                                        </VStack>
                                    </SimpleGrid>
                                </VStack>
                            </Box>

                            <VStack align="stretch" gap={3}>
                                <Flex justify="space-between">
                                    <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">SUBTOTAL</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{formatINR(subtotal)}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text fontSize="10px" color={muted} fontWeight="800" textTransform="uppercase" letterSpacing="wider">TAX (GST 18%)</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{formatINR(tax)}</Text>
                                </Flex>
                                <Separator opacity={0.06} />
                                <Flex justify="space-between" align="baseline">
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="950" textTransform="uppercase" letterSpacing="wider">PAYABLE TOTAL</Text>
                                    <Text fontSize="2xl" color="brand.500" fontWeight="950" letterSpacing="tight">{formatINR(total)}</Text>
                                </Flex>
                            </VStack>
                        </VStack>

                        <VStack gap={4} mt={8}>
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
                                onClick={handleProcessCheckout}
                                disabled={
                                    isSubmitting ||
                                    (paymentMethod === "card" && (!cardNumber || !cardHolder || !cardCvv))
                                }
                                bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
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
                                            {paymentMethod === "payment_link" ? "GENERATE & SEND PAYMENT LINK" : "PROCESS SECURE CHECKOUT"}
                                        </Text>
                                    </HStack>
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                w="full"
                                size="lg"
                                h="46px"
                                borderRadius="xl"
                                fontWeight="800"
                                fontSize="xs"
                                color={muted}
                                onClick={handleSetStepSelect}
                                disabled={isSubmitting}
                            >
                                <ArrowLeft size={14} /> Back to Tiers
                            </Button>
                        </VStack>
                    </Card>
                </SimpleGrid>
            )}

            {/* ── Step 3: SUCCESS CONFIRMATION RECEIPT ── */}
            {currentStep === "success" && successData && selectedPlan && (
                <Box maxW="lg" mx="auto" pb={20} position="relative" zIndex={1}>
                    <Card
                        p={8}
                        borderRadius="3xl"
                        bg="app.card.bg"
                        borderColor="app.card.border"
                        gap={6}
                        alignItems="center"
                        textAlign="center"
                        backdropFilter="blur(20px)"
                    >
                        {/* Animated Check */}
                        <Circle
                            size={16}
                            bg="green.500"
                            color="white"
                            shadow="0 0 30px rgba(1,181,116,0.4)"
                        >
                            <CheckCircle2 size={32} strokeWidth={2.5} />
                        </Circle>

                        <VStack gap={1}>
                            <Heading size="lg" fontWeight="950" letterSpacing="tight">Subscription Enrolled</Heading>
                            <Text fontSize="xs" color={muted} fontWeight="600">
                                Membership activated successfully. Official invoice generated.
                            </Text>
                        </VStack>

                        <Separator opacity={0.06} />

                        {/* Invoice Receipt Mockup */}
                        <Box
                            w="full"
                            p={6}
                            bg={receiptBgStyle}
                            borderRadius="2xl"
                            border="1px solid"
                            borderColor={borderColor}
                            className="receipt-jagged receipt-jagged-bottom"
                            textAlign="left"
                        >
                            <VStack align="stretch" gap={4}>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">INVOICE NUMBER</Text>
                                    <Text fontSize="xs" color="brand.500" fontWeight="900">{successData.invoiceNumber}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">MEMBER NAME</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{memberName.toUpperCase()}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">ENROLLED TIER</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{selectedPlan.data.name.toUpperCase()}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">BILLING CYCLE</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{selectedPlan.data.billing_cycle.toUpperCase()}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">SUBSCRIPTION ID</Text>
                                    <Text fontSize="xs" color="app.text.primary" fontWeight="800">{successData.subscriptionId}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="9px" color={muted} fontWeight="800" letterSpacing="wider">BILLING STATUS</Text>
                                    <Badge colorPalette={successData.status === "paid" ? "green" : "orange"} variant="subtle" borderRadius="lg" fontSize="8px" fontWeight="900" px={2}>
                                        {successData.status.toUpperCase()}
                                    </Badge>
                                </Flex>
                                <Separator opacity={0.06} />
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="10px" color="app.text.primary" fontWeight="900" letterSpacing="wider">
                                        {successData.status === "paid" ? "AMOUNT COLLECTED" : "AMOUNT DUE"}
                                    </Text>
                                    <Text fontSize="md" color={successData.status === "paid" ? "green.500" : "orange.500"} fontWeight="950">
                                        {formatINR(successData.total)}
                                    </Text>
                                </Flex>
                            </VStack>
                        </Box>

                        {/* Dispatch Notice if unpaid link sent */}
                        {successData.status !== "paid" && (
                            <VStack bg="purple.500/5" border="1px solid" borderColor="purple.500/20" p={4} borderRadius="xl" gap={3} w="full" alignItems="stretch">
                                <HStack color="purple.500" gap={2}>
                                    <Info size={14} />
                                    <Text fontSize="xs" fontWeight="950">Payment Link Generated & Sent</Text>
                                </HStack>
                                <Text fontSize="10px" color={muted} fontWeight="600" lineHeight="normal" textAlign="left">
                                    A secure payment page has been dispatched to {member?.data?.email || "the customer's email"}. The operator can also copy or open the payment link directly below:
                                </Text>
                                <HStack w="full" gap={2}>
                                    <Input
                                        readOnly
                                        value={`https://pay.gym.saas/invoice/${successData.invoiceNumber}`}
                                        h="36px"
                                        borderRadius="xl"
                                        bg="blackAlpha.200"
                                        border="1px solid"
                                        borderColor={borderColor}
                                        fontWeight="600"
                                        fontSize="xs"
                                        color="app.text.primary"
                                    />
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        h="36px"
                                        borderRadius="xl"
                                        onClick={handleCopyStep3Link}
                                        minW="70px"
                                        color="app.text.primary"
                                    >
                                        <Text fontSize="10px" fontWeight="800">Copy</Text>
                                    </Button>
                                    <Button
                                        size="sm"
                                        colorPalette="purple"
                                        h="36px"
                                        borderRadius="xl"
                                        onClick={handleOpenStep3Link}
                                        minW="70px"
                                    >
                                        <Text fontSize="10px" fontWeight="800">Open</Text>
                                    </Button>
                                </HStack>
                            </VStack>
                        )}

                        {/* Post-Checkout Actions */}
                        <VStack gap={3} w="full" mt={4}>
                            <Button
                                colorPalette="brand"
                                size="xl"
                                h="56px"
                                w="full"
                                borderRadius="2xl"
                                fontWeight="900"
                                fontSize="xs"
                                letterSpacing="widest"
                                textTransform="uppercase"
                                onClick={handleBack}
                                bg="linear-gradient(135deg, #7551FF 0%, #422AFB 100%)"
                                _hover={{ transform: "translateY(-2px)", boxShadow: "0 10px 20px -5px rgba(66,42,251,0.3)" }}
                            >
                                BACK TO DIRECTORY
                            </Button>

                            <HStack gap={4} w="full">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    h="46px"
                                    flex={1}
                                    borderRadius="xl"
                                    fontWeight="800"
                                    fontSize="xs"
                                    borderColor={borderColor}
                                    onClick={handlePrintInvoice}
                                    color="app.text.primary"
                                >
                                    <Printer size={14} /> PRINT RECEIPT
                                </Button>
                            </HStack>
                        </VStack>
                    </Card>
                </Box>
            )}
        </PageLayout>
    );
});

SelectPlan.displayName = "SelectPlan";
export default SelectPlan;
