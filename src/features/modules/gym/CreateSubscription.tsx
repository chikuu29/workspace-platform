/**
 * CreateSubscription.tsx
 *
 * Subscription enrollment page — post-registration landing.
 * Displays active plans as selectable pricing cards with a sticky checkout sidebar.
 * `member_id` query param identifies the enrolling member.
 */

import { memo, useState, useMemo, useCallback } from "react";
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
    Text,
    VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router";
import {
    LuArrowLeft,
    LuArrowRight,
    LuCalendarDays,
    LuCheck,
    LuCrown,
    LuReceipt,
    LuShieldCheck,
    LuZap,
} from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { Card } from "@/core/components/Card";
import { useGymMember } from "./hooks/useGymMember";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubscriptionPlan {
    id: string;
    name: string;
    tagline: string;
    price: number;
    billing_cycle: "monthly" | "quarterly" | "yearly";
    accent: string;
    features: string[];
    recommended?: boolean;
}

// ─── Plans (replace with API when backend ready) ─────────────────────────────

const PLANS: SubscriptionPlan[] = [
    {
        id: "P1",
        name: "Starter",
        tagline: "Everything you need to get moving",
        price: 49,
        billing_cycle: "monthly",
        accent: "blue",
        features: ["Gym Floor Access", "Locker Room", "1 PT Session / mo"],
    },
    {
        id: "P2",
        name: "Pro",
        tagline: "For committed athletes who want more",
        price: 89,
        billing_cycle: "monthly",
        accent: "green",
        features: ["Full Gym Access", "Group Classes", "Nutrition Guide", "2 PT Sessions / mo"],
        recommended: true,
    },
    {
        id: "P3",
        name: "Platinum",
        tagline: "The ultimate all-inclusive experience",
        price: 899,
        billing_cycle: "yearly",
        accent: "purple",
        features: ["Priority PT Slots", "Unlimited Classes", "Nutrition Review", "Free Supplements", "Spa Access"],
    },
];

const TAX_RATE = 0.18;

// ─── Plan Card ──────────────────────────────────────────────────────────────

interface PlanCardProps {
    plan: SubscriptionPlan;
    isSelected: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}

const PlanCard = memo(({ plan, isSelected, onSelect }: PlanCardProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");

    const handleClick = useCallback(() => onSelect(plan), [plan, onSelect]);

    return (
        <Card
            p={0}
            border="2px solid"
            borderColor={isSelected ? `${plan.accent}.500` : "transparent"}
            borderRadius="2xl"
            cursor="pointer"
            overflow="hidden"
            gap={0}
            transition="all 0.25s cubic-bezier(0.16,1,0.3,1)"
            _hover={{
                transform: "translateY(-6px)",
                borderColor: `${plan.accent}.500`,
                boxShadow: `0 20px 40px -16px var(--chakra-colors-${plan.accent}-500)`,
            }}
            onClick={handleClick}
        >
            {/* Recommended ribbon */}
            {plan.recommended && (
                <HStack justify="center" gap={1.5} bg={`${plan.accent}.500`} color="white" py={1.5}>
                    <LuCrown size={13} />
                    <Text fontSize="xs" fontWeight="800" letterSpacing="wider" textTransform="uppercase">
                        Recommended
                    </Text>
                </HStack>
            )}

            {/* Top accent line for non-recommended */}
            {!plan.recommended && (
                <Box h="3px" bg={`${plan.accent}.500`} opacity={isSelected ? 1 : 0.3} transition="opacity 0.2s" />
            )}

            <VStack align="stretch" gap={4} p={6}>
                {/* Name + selected check */}
                <Flex justify="space-between" align="start">
                    <VStack align="start" gap={0}>
                        <Text fontSize="lg" fontWeight="900" color="app.text.primary">
                            {plan.name}
                        </Text>
                        <Text fontSize="xs" color={muted} fontWeight="500">
                            {plan.tagline}
                        </Text>
                    </VStack>
                    {isSelected && (
                        <Circle size={7} bg={`${plan.accent}.500`} color="white" flexShrink={0}>
                            <LuCheck size={15} />
                        </Circle>
                    )}
                </Flex>

                {/* Price */}
                <HStack align="baseline" gap={1}>
                    <Text fontSize="3xl" fontWeight="900" color="app.text.primary" lineHeight="1">
                        ${plan.price}
                    </Text>
                    <Text fontSize="xs" color={muted} fontWeight="600">
                        /{plan.billing_cycle}
                    </Text>
                </HStack>

                <Separator opacity={0.06} />

                {/* Features */}
                <VStack align="stretch" gap={2}>
                    {plan.features.map((f) => (
                        <HStack key={f} gap={2}>
                            <Box color={`${plan.accent}.500`} flexShrink={0}>
                                <LuCheck size={14} />
                            </Box>
                            <Text fontSize="sm" fontWeight="600" color="app.text.primary">
                                {f}
                            </Text>
                        </HStack>
                    ))}
                </VStack>

                {/* CTA */}
                <Button
                    mt={1}
                    w="full"
                    size="md"
                    borderRadius="xl"
                    fontWeight="700"
                    colorPalette={plan.accent}
                    variant={isSelected ? "solid" : "outline"}
                    transition="all 0.2s"
                >
                    {isSelected ? "Selected" : "Select"}
                </Button>
            </VStack>
        </Card>
    );
});
PlanCard.displayName = "PlanCard";

// ─── Main ───────────────────────────────────────────────────────────────────

const CreateSubscription = memo(() => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { appCode } = useParams();
    const [searchParams] = useSearchParams();

    const memberId = searchParams.get("member_id") ?? undefined;
    const { member, loading: memberLoading } = useGymMember(memberId);

    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
    const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [isPaid, setIsPaid] = useState(true);

    // ── Derived ──
    const workspacePrefix = useMemo(() => {
        return pathname.includes("/workspace")
            ? `${pathname.split("/workspace")[0]}/workspace`
            : "";
    }, [pathname]);

    const appName = appCode || searchParams.get("app") || "myGym";

    const memberName = useMemo(() => {
        const d = member?.data;
        const first = d?.firstName || "";
        const last = d?.lastName || "";
        return `${first} ${last}`.trim() || memberId || "New Member";
    }, [member, memberId]);

    const subtotal = selectedPlan?.price ?? 0;
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;

    const renewalDate = useMemo(() => {
        if (!selectedPlan) return "";
        const d = new Date(startDate);
        if (selectedPlan.billing_cycle === "monthly") d.setMonth(d.getMonth() + 1);
        else if (selectedPlan.billing_cycle === "quarterly") d.setMonth(d.getMonth() + 3);
        else d.setFullYear(d.getFullYear() + 1);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }, [startDate, selectedPlan]);

    // ── Handlers ──
    const handleBack = useCallback(() => {
        const back = appCode
            ? `${workspacePrefix}/app/${appCode}/Subscription`
            : `${workspacePrefix}/Subscription?app=${appName}`;
        navigate(back);
    }, [appCode, appName, workspacePrefix, navigate]);

    const handleSelectPlan = useCallback((plan: SubscriptionPlan) => {
        setSelectedPlan(plan);
    }, []);

    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
    }, []);

    const handlePaidToggle = useCallback((e: { checked: boolean }) => {
        setIsPaid(e.checked);
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedPlan) {
            toaster.create({ title: "Select a Plan", description: "Pick a subscription plan first.", type: "warning" });
            return;
        }
        toaster.create({
            title: "Subscription Activated!",
            description: `${memberName} is now on the ${selectedPlan.name} plan.`,
            type: "success",
        });
        handleBack();
    }, [selectedPlan, memberName, handleBack]);

    // ── Theme ──
    const muted = useColorModeValue("gray.500", "gray.400");
    const panelBg = useColorModeValue("rgba(255,255,255,0.82)", "rgba(15,23,42,0.66)");
    const panelBorder = useColorModeValue("rgba(226,232,240,0.86)", "rgba(255,255,255,0.12)");
    const settingBg = useColorModeValue("gray.50", "whiteAlpha.50");

    return (
        <Box mt={4} w="full" animation="fade-in 0.5s ease-out">

            {/* ═══════════════════════════════════════════════════════════
                PAGE HEADER — single-line with back, title, member, CTA
            ═══════════════════════════════════════════════════════════ */}
            <Flex
                justify="space-between"
                align="center"
                mb={6}
                p={5}
                bg="app.card.bg"
                border="1px solid"
                borderColor="app.card.border"
                borderRadius="2xl"
                backdropFilter="blur(16px)"
                flexWrap="wrap"
                gap={3}
            >
                {/* Left: back + title + member */}
                <HStack gap={3} flexWrap="wrap" align="center">
                    <Button
                        variant="ghost"
                        borderRadius="full"
                        size="sm"
                        onClick={handleBack}
                        aria-label="Go back"
                    >
                        <LuArrowLeft size={18} />
                    </Button>
                    <Heading size="xl" fontWeight="900" letterSpacing="tight" color="app.text.primary">
                        Activate Membership
                    </Heading>
                    <Separator orientation="vertical" h="20px" opacity={0.15} />
                    <Skeleton loading={memberLoading}>
                        <HStack gap={2}>
                            <Text fontSize="sm" color={muted} fontWeight="600">for</Text>
                            <Badge
                                colorPalette="brand"
                                variant="subtle"
                                borderRadius="full"
                                px={3}
                                py={0.5}
                                fontWeight="800"
                            >
                                {memberName}
                            </Badge>
                            {memberId && (
                                <Text fontSize="xs" color={muted} fontWeight="700" fontFamily="mono">
                                    ({memberId})
                                </Text>
                            )}
                        </HStack>
                    </Skeleton>
                </HStack>

                {/* Right: CTA */}
                <Button
                    colorPalette="brand"
                    size="lg"
                    borderRadius="xl"
                    fontWeight="800"
                    px={7}
                    onClick={handleConfirm}
                    disabled={!selectedPlan}
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 24px -8px var(--chakra-colors-brand-500)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s ease"
                >
                    <LuZap size={16} />
                    Activate
                </Button>
            </Flex>

            {/* ═══════════════════════════════════════════════════════════
                CONTENT: Plans (3 cols) + Summary (1 col)
            ═══════════════════════════════════════════════════════════ */}
            <SimpleGrid columns={{ base: 1, xl: 4 }} gap={6} w="full" pb={16}>

                {/* ── Plans Column ────────────────────────────────────── */}
                <Box gridColumn={{ xl: "span 3" }}>
                    <VStack align="stretch" gap={5}>

                        {/* Section label */}
                        <HStack gap={2.5} px={1}>
                            <Box w="3px" h="16px" borderRadius="full" bg="brand.500" />
                            <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                Membership Plans
                            </Text>
                            <Badge variant="subtle" colorPalette="brand" borderRadius="full" fontSize="xs" fontWeight="700">
                                {PLANS.length} active
                            </Badge>
                            <Text fontSize="xs" color={muted} fontWeight="500">
                                — compare and select one to continue
                            </Text>
                        </HStack>

                        {/* Plan cards */}
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
                            {PLANS.map((plan) => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    isSelected={selectedPlan?.id === plan.id}
                                    onSelect={handleSelectPlan}
                                />
                            ))}
                        </SimpleGrid>

                        {/* Activation settings */}
                        <Card p={6} borderRadius="2xl" gap={5}>
                            <HStack gap={2.5}>
                                <Box w="3px" h="16px" borderRadius="full" bg="brand.500" />
                                <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                    Activation Settings
                                </Text>
                            </HStack>
                            <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                <Field label="Start Date">
                                    <Input
                                        type="date"
                                        h="48px"
                                        borderRadius="xl"
                                        value={startDate}
                                        onChange={handleDateChange}
                                    />
                                </Field>
                                <Field label="Payment Status">
                                    <HStack justify="space-between" h="48px" px={5} borderRadius="xl" bg={settingBg}>
                                        <Text fontSize="sm" fontWeight="700" color="app.text.primary">
                                            Mark as Paid
                                        </Text>
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

                {/* ── Summary Sidebar ────────────────────────────────── */}
                <Box position={{ xl: "sticky" }} top={{ xl: "6rem" }} alignSelf="start">
                    <Card p={6} borderRadius="2xl" gap={0}>
                        <VStack align="stretch" gap={5}>
                            {/* Header */}
                            <HStack gap={2.5}>
                                <Box w="3px" h="16px" borderRadius="full" bg="brand.500" />
                                <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                    Order Summary
                                </Text>
                            </HStack>

                            {/* Selected plan chip */}
                            {selectedPlan ? (
                                <Box
                                    p={4}
                                    borderRadius="xl"
                                    bg={`${selectedPlan.accent}.500/8`}
                                    border="1px solid"
                                    borderColor={`${selectedPlan.accent}.500/20`}
                                >
                                    <Flex justify="space-between" align="center" mb={1}>
                                        <Text fontWeight="800" fontSize="sm" color="app.text.primary">
                                            {selectedPlan.name}
                                        </Text>
                                        <Badge colorPalette={selectedPlan.accent} borderRadius="full" variant="subtle" fontSize="xs">
                                            {selectedPlan.billing_cycle}
                                        </Badge>
                                    </Flex>
                                    <Text fontSize="xs" color={muted} fontWeight="600">
                                        {selectedPlan.features.length} features included
                                    </Text>
                                </Box>
                            ) : (
                                <Box p={5} borderRadius="xl" bg={settingBg} textAlign="center">
                                    <Text fontSize="sm" color={muted} fontWeight="600">
                                        No plan selected yet
                                    </Text>
                                </Box>
                            )}

                            {/* Pricing */}
                            <VStack align="stretch" gap={3}>
                                <Flex justify="space-between">
                                    <Text fontSize="sm" color={muted} fontWeight="600">Base Price</Text>
                                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">${subtotal.toLocaleString()}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text fontSize="sm" color={muted} fontWeight="600">Tax (18%)</Text>
                                    <Text fontSize="sm" fontWeight="800" color="app.text.primary">${tax.toFixed(2)}</Text>
                                </Flex>
                                <Separator opacity={0.1} />
                                <Flex justify="space-between" pt={1}>
                                    <Text fontWeight="900" color="app.text.primary">Total</Text>
                                    <Text fontWeight="900" fontSize="xl" color="brand.500">${total.toFixed(2)}</Text>
                                </Flex>
                            </VStack>

                            {/* Instant activation */}
                            <Box p={3} borderRadius="xl" bg="brand.500/8" border="1px solid" borderColor="brand.500/15">
                                <HStack gap={2} justify="center" color="brand.500">
                                    <LuZap size={14} />
                                    <Text fontSize="xs" fontWeight="800">Instant Activation</Text>
                                </HStack>
                            </Box>

                            {/* Confirm */}
                            <Button
                                colorPalette="brand"
                                size="lg"
                                h="52px"
                                borderRadius="xl"
                                fontWeight="800"
                                onClick={handleConfirm}
                                disabled={!selectedPlan}
                                _hover={{
                                    transform: "translateY(-1px)",
                                    boxShadow: "0 10px 24px -8px var(--chakra-colors-brand-500)",
                                }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s ease"
                            >
                                Confirm & Activate
                                <LuArrowRight size={16} />
                            </Button>

                            {/* Footer info */}
                            <VStack gap={1}>
                                {selectedPlan && renewalDate && (
                                    <HStack justify="center" gap={1.5} color={muted}>
                                        <LuCalendarDays size={12} />
                                        <Text fontSize="xs" fontWeight="700">Renews {renewalDate}</Text>
                                    </HStack>
                                )}
                                <HStack justify="center" gap={1.5} color={muted}>
                                    <LuShieldCheck size={12} />
                                    <Text fontSize="xs" fontWeight="600">Secure · Cancel anytime</Text>
                                </HStack>
                            </VStack>
                        </VStack>
                    </Card>
                </Box>
            </SimpleGrid>
        </Box>
    );
});

CreateSubscription.displayName = "CreateSubscription";
export default CreateSubscription;
