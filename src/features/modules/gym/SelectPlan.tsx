/**
 * SelectPlan.tsx
 *
 * Subscription enrollment page — post-member-registration landing.
 * Displays active plans fetched from the backend as selectable pricing cards
 * with a premium, glassmorphic UI and a sticky checkout sidebar.
 *
 * On confirmation, calls the POST /gym/subscriptions/activate API.
 * `member_id` query param identifies the enrolling member.
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
    IconButton,
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
import { useNavigate, useParams } from "react-router";
import {
    LuArrowLeft,
    LuArrowRight,
    LuCalendarDays,
    LuCheck,
    LuCrown,
    LuShieldCheck,
    LuZap,
    LuSparkles,
} from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { useGymMember } from "./hooks/useGymMember";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { PageLayout } from "@/core/components/PageLayout";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import type { SubscriptionPlanDocument, ActivateSubscriptionPayload } from "./types/Gym.types";

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

// ─── Plan Card ──────────────────────────────────────────────────────────────

interface PlanCardProps {
    plan: SubscriptionPlanDocument;
    isSelected: boolean;
    onSelect: (plan: SubscriptionPlanDocument) => void;
}

const PlanCard = memo(({ plan, isSelected, onSelect }: PlanCardProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const cardBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(15, 23, 42, 0.65)");
    const borderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");

    const planData = plan.data;
    const accent = planData.accent_color || "blue";

    const handleClick = useCallback(() => onSelect(plan), [plan, onSelect]);

    return (
        <Box
            position="relative"
            p="1.5px"
            borderRadius="3xl"
            bg={isSelected ? `gradient.${accent}` : "transparent"}
            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
            transform={isSelected ? "scale(1.02)" : "scale(1)"}
            _hover={{ transform: isSelected ? "scale(1.03)" : "translateY(-6px)" }}
        >
            <Card
                p={0}
                bg={cardBg}
                backdropFilter="blur(24px) saturate(180%)"
                border="1px solid"
                borderColor={isSelected ? "whiteAlpha.400" : borderColor}
                borderRadius="3xl"
                cursor="pointer"
                overflow="hidden"
                gap={0}
                h="full"
                onClick={handleClick}
                transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                boxShadow={isSelected ? "xl" : "none"}
                _hover={{
                    boxShadow: "2xl",
                    borderColor: isSelected ? "whiteAlpha.500" : `${accent}.500/30`,
                    bg: isSelected ? cardBg : useColorModeValue("white", "rgba(30, 41, 59, 0.5)"),
                }}
            >
                <VStack align="stretch" gap={5} p={7}>
                    {/* Header: Label + Icon */}
                    <Flex justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                            <HStack>
                                <Text fontSize="xl" fontWeight="900" color="app.text.primary" letterSpacing="tight">
                                    {planData.name}
                                </Text>
                                {planData.code.toLowerCase().includes("pro") && (
                                    <Icon color={`${accent}.500`}>
                                        <LuSparkles />
                                    </Icon>
                                )}
                            </HStack>
                            <Text fontSize="xs" color={muted} fontWeight="600" lineClamp={2}>
                                {planData.description || `Perfect for ${planData.name.toLowerCase()} seekers`}
                            </Text>
                        </VStack>

                        {isSelected ? (
                            <Circle
                                size={8}
                                bg={`${accent}.500`}
                                color="white"
                                boxShadow={`0 0 15px var(--chakra-colors-${accent}-500)`}
                            >
                                <LuCheck size={16} />
                            </Circle>
                        ) : (
                            <Circle size={8} border="2px solid" borderColor={borderColor} />
                        )}
                    </Flex>

                    {/* Pricing Section */}
                    <VStack align="start" gap={0}>
                        <HStack align="baseline" gap={1}>
                            <Text fontSize="4xl" fontWeight="900" color="app.text.primary" lineHeight="1">
                                {CURRENCY_SYMBOL}{planData.price.toLocaleString("en-IN")}
                            </Text>
                            <Text fontSize="sm" color={muted} fontWeight="700">
                                /{planData.billing_cycle === "monthly" ? "mo" : "yr"}
                            </Text>
                        </HStack>
                        <Text fontSize="xs" color={`${accent}.500`} fontWeight="800" textTransform="uppercase" letterSpacing="wider">
                            Best Value
                        </Text>
                    </VStack>

                    <Separator opacity={0.1} />

                    {/* Features List */}
                    <VStack align="stretch" gap={3}>
                        {planData.features.map((f) => (
                            <HStack key={f} gap={3}>
                                <Circle size={5} bg={`${accent}.500/10`} color={`${accent}.500`}>
                                    <LuCheck size={12} strokeWidth={3} />
                                </Circle>
                                <Text fontSize="sm" fontWeight="600" color="app.text.primary">
                                    {f}
                                </Text>
                            </HStack>
                        ))}
                    </VStack>

                    <Box pt={4}>
                        <Button
                            w="full"
                            size="lg"
                            h="58px"
                            borderRadius="2xl"
                            fontWeight="900"
                            fontSize="sm"
                            letterSpacing="wide"
                            textTransform="uppercase"
                            colorPalette={accent}
                            variant={isSelected ? "solid" : "outline"}
                            bg={isSelected ? `gradient.${accent}` : "transparent"}
                            borderColor={isSelected ? "transparent" : `${accent}.500/30`}
                            color={isSelected ? "white" : `${accent}.500`}
                            _hover={{
                                transform: "translateY(-3px)",
                                boxShadow: isSelected
                                    ? `0 15px 30px -10px var(--chakra-colors-${accent}-500)`
                                    : `0 8px 15px -5px var(--chakra-colors-${accent}-500/20)`,
                                bg: isSelected ? `gradient.${accent}` : `${accent}.500/8`,
                                borderColor: isSelected ? "transparent" : `${accent}.500`,
                            }}
                            _active={{ transform: "translateY(-1px)" }}
                            transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        >
                            <HStack gap={2}>
                                <Text>{isSelected ? "Plan Selected" : "Get Started"}</Text>
                                {isSelected ? <LuCheck size={16} /> : <LuArrowRight size={16} />}
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
        <Card p={12} borderRadius="3xl" bg={useColorModeValue("white", "rgba(15, 23, 42, 0.65)")} backdropFilter="blur(20px)" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}>
            <VStack gap={6} textAlign="center">
                <Circle size={20} bg="brand.500/10" color="brand.500">
                    <LuCrown size={32} />
                </Circle>
                <VStack gap={1}>
                    <Heading size="lg" fontWeight="900">No active plans</Heading>
                    <Text fontSize="md" color={muted} maxW="sm" fontWeight="500">
                        It looks like you haven't created any subscription plans yet.
                    </Text>
                </VStack>
                <Button
                    colorPalette="brand"
                    borderRadius="2xl"
                    size="xl"
                    h="60px"
                    px={10}
                    fontSize="md"
                    fontWeight="800"
                    onClick={handleCreatePlan}
                    boxShadow="0 10px 20px -5px var(--chakra-colors-brand-500)"
                >
                    Create Your First Plan
                </Button>
            </VStack>
        </Card>
    );
});
EmptyPlansState.displayName = "EmptyPlansState";

// ─── Main Component ──────────────────────────────────────────────────────────

const SelectPlan = memo(() => {
    const navigate = useNavigate();
    const { params: memberId } = useParams();
    const { member, loading: memberLoading } = useGymMember(memberId);


    // Fetch active plans from backend
    const { plans, loading: plansLoading } = useSubscriptionPlans({ activeOnly: true });

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [isPaid, setIsPaid] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Navigation ──
    const { navigateTo, goBack } = useWorkspaceRouter();

    const memberName = useMemo(() => {
        const d = member?.data;
        const first = d?.firstName || "";
        const last = d?.lastName || "";
        return `${first} ${last}`.trim() || memberId || "New Member";
    }, [member, memberId]);

    const subtotal = selectedPlan?.data.price ?? 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const renewalDate = useMemo(() => {
        if (!selectedPlan) return "";
        const d = new Date(startDate);
        const cycle = selectedPlan.data.billing_cycle;
        if (cycle === "monthly") d.setMonth(d.getMonth() + 1);
        else if (cycle === "quarterly") d.setMonth(d.getMonth() + 3);
        else d.setFullYear(d.getFullYear() + 1);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }, [startDate, selectedPlan]);

    // ── Handlers ──
    const handleBack = useCallback(() => {
        navigateTo("members");
    }, [navigateTo]);

    const handleSelectPlan = useCallback((plan: SubscriptionPlanDocument) => {
        setSelectedPlan(plan);
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    }, []);

    const handlePaidToggle = useCallback((e: { checked: boolean }) => {
        setIsPaid(e.checked);
    }, []);

    const handleConfirm = useCallback(() => {
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

        const payload: ActivateSubscriptionPayload = {
            member_id: effectiveMemberId,
            plan_code: selectedPlan.data.code,
            start_date: startDate,
            is_paid: isPaid,
            payment_amount: total,
        };

        const sub = GymApiService.activateSubscription(payload).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    toaster.create({
                        title: "Subscription Activated!",
                        description: `${memberName} is now on the ${res.data.plan_name} plan until ${new Date(res.data.end_date).toLocaleDateString()}.`,
                        type: "success",
                    });
                    handleBack();
                } else {
                    toaster.create({
                        title: "Activation Failed",
                        description: (res as any).message ?? "Something went wrong.",
                        type: "error",
                    });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({
                    title: "Network Error",
                    description: err?.message ?? "Failed to reach the server.",
                    type: "error",
                });
            },
        });

        return () => sub.unsubscribe();
    }, [selectedPlan, memberId, member?.data?.member_id, startDate, isPaid, total, memberName, handleBack]);

    // ── Theme & Styles ──
    const muted = useColorModeValue("gray.500", "gray.400");
    const settingBg = useColorModeValue("whiteAlpha.600", "rgba(255, 255, 255, 0.03)");

    // ── Nav Actions ──
    const setNavActions = useNavActionStore((state) => state.setActions);
    const clearNavActions = useNavActionStore((state) => state.clearActions);

    useEffect(() => {
        setNavActions(
            <HStack gap={3}>
                <Button
                    // colorPalette="brand"
                    size="md"
                    h="40px"
                    px={6}
                    // borderRadius="xl"
                    fontWeight="900"
                    onClick={handleConfirm}
                    disabled={!selectedPlan || isSubmitting || !member}
                    // bg="brand.500"
                    // boxShadow="0 8px 16px -4px var(--chakra-colors-brand-500)"
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 12px 20px -6px var(--chakra-colors-brand-500)",
                    }}
                >
                    {isSubmitting ? <Spinner size="xs" borderWidth="2px" /> : (
                        <HStack gap={2}>
                            <LuZap size={14} />
                            <Text>Activate</Text>
                        </HStack>
                    )}
                </Button>
            </HStack>
        );
        return () => clearNavActions();
    }, [setNavActions, clearNavActions, handleBack, handleConfirm, selectedPlan, isSubmitting, member]);

    // ── Not found ──
    if (!memberLoading && !member) {
        return (
            <PageLayout
                title="Member Not Found"
                subtitle={`No profile found for ID: ${memberId || "Unknown"}.`}
            >
                <Card p={12} borderRadius="3xl" bg={useColorModeValue("white", "rgba(15, 23, 42, 0.65)")} backdropFilter="blur(20px)" border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}>
                    <VStack gap={6} textAlign="center">
                        <Circle size={20} bg="red.500/10" color="red.500">
                            <LuShieldCheck size={32} />
                        </Circle>
                        <VStack gap={1}>
                            <Heading size="xl" fontWeight="900">Profile Unavailable</Heading>
                            <Text color={muted} fontWeight="600" fontSize="lg">
                                We couldn't find a member profile matching the ID: <Text as="span" color="app.text.primary" fontWeight="900">"{memberId}"</Text>.
                            </Text>
                        </VStack>
                        <Button 
                            colorPalette="brand" 
                            size="lg" 
                            px={10} 
                            borderRadius="2xl" 
                            fontWeight="900" 
                            onClick={handleBack}
                            bg="brand.500"
                            _hover={{ transform: "translateY(-2px)" }}
                        >
                            <LuArrowLeft size={18} /> Back to Directory
                        </Button>
                    </VStack>
                </Card>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title="Membership Selection"
            subtitle={memberLoading ? "Loading member data..." : `Step 2: Assigning premium plan to ${memberName}`}
            position="relative"
        >
            {/* Background Decorative Blurs - Moved inside to avoid clipping if necessary */}
            <Box
                position="absolute"
                top="-50px"
                right="-50px"
                w="400px"
                h="400px"
                bg="brand.500"
                filter="blur(140px)"
                opacity={0.05}
                zIndex={0}
                pointerEvents="none"
            />
            <Box
                position="absolute"
                top="15%"
                left="-50px"
                w="500px"
                h="500px"
                bg="purple.500"
                filter="blur(160px)"
                opacity={0.03}
                zIndex={0}
                pointerEvents="none"
            />

            {/* ── Content Grid ── */}
            <SimpleGrid columns={{ base: 1, xl: 4 }} gap={8} w="full" pb={20} position="relative" zIndex={1}>

                {/* Plans Selection */}
                <Box gridColumn={{ xl: "span 3" }}>
                    <VStack align="stretch" gap={8}>

                        {/* Section Label */}
                        <HStack justify="space-between" px={2}>
                            <VStack align="start" gap={0}>
                                <Text fontSize="lg" fontWeight="900" color="app.text.primary">
                                    Flexible Pricing
                                </Text>
                                <Text fontSize="sm" color={muted} fontWeight="500">
                                    Choose the best plan for {memberName}'s fitness journey
                                </Text>
                            </VStack>
                            {!plansLoading && (
                                <Badge variant="subtle" colorPalette="brand" borderRadius="full" px={4} py={1} fontSize="xs" fontWeight="800">
                                    {plans.length} PLANS AVAILABLE
                                </Badge>
                            )}
                        </HStack>

                        {/* Plan Cards */}
                        {plansLoading ? (
                            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} height="400px" borderRadius="3xl" />
                                ))}
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

                        {/* Configuration */}
                        <Card
                            p={8}
                            borderRadius="3xl"
                            bg="app.card.bg"
                            backdropFilter="blur(20px)"
                            border="1px solid"
                            borderColor="app.card.border"
                            gap={6}
                        >
                            <HStack gap={3}>
                                <Circle size={8} bg="brand.500/10" color="brand.500">
                                    <LuCalendarDays size={16} />
                                </Circle>
                                <Text fontSize="lg" fontWeight="900" color="app.text.primary">
                                    Subscription Settings
                                </Text>
                            </HStack>

                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
                                <Field label={<Text fontWeight="800" fontSize="sm" mb={1}>Start Date</Text>}>
                                    <Input
                                        type="date"
                                        h="56px"
                                        borderRadius="2xl"
                                        bg={settingBg}
                                        border="1px solid"
                                        borderColor="transparent"
                                        _focus={{ borderColor: "brand.500", bg: "whiteAlpha.100" }}
                                        value={startDate}
                                        onChange={handleDateChange}
                                        fontWeight="700"
                                    />
                                </Field>
                                <Field label={<Text fontWeight="800" fontSize="sm" mb={1}>Payment Status</Text>}>
                                    <HStack
                                        justify="space-between"
                                        h="56px"
                                        px={6}
                                        borderRadius="2xl"
                                        bg={settingBg}
                                        border="1px solid"
                                        borderColor={isPaid ? "green.500/30" : "transparent"}
                                    >
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                                Upfront Payment
                                            </Text>
                                            <Text fontSize="10px" fontWeight="700" color={isPaid ? "green.500" : "orange.500"} textTransform="uppercase">
                                                {isPaid ? "Marked as Paid" : "Pay Later"}
                                            </Text>
                                        </VStack>
                                        <Switch
                                            colorPalette="green"
                                            size="lg"
                                            checked={isPaid}
                                            onCheckedChange={handlePaidToggle}
                                        />
                                    </HStack>
                                </Field>
                            </SimpleGrid>
                        </Card>
                    </VStack>
                </Box>

                {/* Sidebar Summary */}
                <Box position={{ xl: "sticky" }} top={{ xl: "7rem" }} alignSelf="start">
                    <Card
                        p={7}
                        borderRadius="3xl"
                        bg="app.card.bg"
                        backdropFilter="blur(30px)"
                        border="2px solid"
                        borderColor="brand.500/10"
                        boxShadow="2xl"
                        gap={7}
                    >
                        <VStack align="stretch" gap={6}>
                            <HStack justify="space-between">
                                <Text fontSize="md" fontWeight="900" color="app.text.primary">Summary</Text>
                                <LuCrown color="var(--chakra-colors-brand-500)" size={18} />
                            </HStack>

                            {selectedPlan ? (
                                <Box
                                    p={5}
                                    borderRadius="2xl"
                                    bg={useColorModeValue("brand.50", "brand.500/10")}
                                    border="1px solid"
                                    borderColor={useColorModeValue("brand.100", "brand.500/20")}
                                >
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="900" fontSize="sm" color="app.text.primary">
                                            {selectedPlan.data.name}
                                        </Text>
                                        <Badge colorPalette="brand" borderRadius="lg" fontSize="10px" fontWeight="900">
                                            {selectedPlan.data.billing_cycle.toUpperCase()}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="xs" color={muted} fontWeight="600">
                                        Includes {selectedPlan.data.features.length} premium benefits
                                    </Text>
                                </Box>
                            ) : (
                                <Box p={6} borderRadius="2xl" bg={settingBg} border="1px dashed" borderColor="gray.500/30" textAlign="center">
                                    <Text fontSize="xs" color={muted} fontWeight="700" letterSpacing="wide">
                                        SELECT A PLAN TO CONTINUE
                                    </Text>
                                </Box>
                            )}

                            <VStack align="stretch" gap={4}>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase">Base Amount</Text>
                                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">{CURRENCY_SYMBOL}{subtotal.toLocaleString("en-IN")}</Text>
                                </Flex>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="xs" color={muted} fontWeight="700" textTransform="uppercase">GST (18%)</Text>
                                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">{CURRENCY_SYMBOL}{tax.toLocaleString("en-IN")}</Text>
                                </Flex>
                                <Separator opacity={0.08} />
                                <Flex justify="space-between" align="center" pt={2}>
                                    <Text fontSize="sm" fontWeight="900" color="app.text.primary">Payable Total</Text>
                                    <Text fontSize="2xl" fontWeight="900" color="brand.500" letterSpacing="tight">
                                        {CURRENCY_SYMBOL}{total.toLocaleString("en-IN")}
                                    </Text>
                                </Flex>
                            </VStack>

                            <Button
                                colorPalette="brand"
                                size="xl"
                                h="64px"
                                // borderRadius="2xl"
                                fontWeight="900"
                                fontSize="md"
                                onClick={handleConfirm}
                                disabled={!selectedPlan || isSubmitting}
                                // bg="brand.500"
                                // boxShadow="0 12px 25px -8px var(--chakra-colors-brand-500)"
                                _hover={{
                                    transform: "translateY(-3px)",
                                    boxShadow: "0 18px 35px -10px var(--chakra-colors-brand-500)",
                                }}
                            >
                                {isSubmitting ? <Spinner size="sm" borderWidth="3px" /> : (
                                    <HStack gap={2}>
                                        <Text>Complete Checkout</Text>
                                        <LuArrowRight size={18} />
                                    </HStack>
                                )}
                            </Button>

                            <VStack gap={2}>
                                {selectedPlan && renewalDate && (
                                    <HStack gap={2} color="green.500">
                                        <LuCalendarDays size={14} />
                                        <Text fontSize="xs" fontWeight="800">Renews on {renewalDate}</Text>
                                    </HStack>
                                )}
                                <HStack gap={2} color={muted} opacity={0.8}>
                                    <LuShieldCheck size={14} />
                                    <Text fontSize="10px" fontWeight="700" textTransform="uppercase">
                                        Bank-grade Security · Encrypted
                                    </Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </Card>
                </Box>
            </SimpleGrid>
        </PageLayout>
    );
});

SelectPlan.displayName = "SelectPlan";
export default SelectPlan;
