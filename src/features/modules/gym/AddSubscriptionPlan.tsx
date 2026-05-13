/**
 * AddSubscriptionPlan.tsx
 *
 * Modern plan creation page with a two-column layout:
 * Left  → form sections (identity, pricing, features, branding)
 * Right → live preview card that updates in real-time
 *
 * Persists via POST /gym/plans.
 */

import { memo, useState, useCallback, useMemo, useEffect } from "react";
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
    Spinner,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import {
    ArrowLeft,
    Check,
    Coins,
    Crown,
    GripVertical,
    Palette,
    Plus,
    Rocket,
    Save,
    ShieldCheck,
    Sparkles,
    Tag,
    Trash2,
    X,
} from "lucide-react";
import { Field } from "@/components/ui/field";
import { Card } from "@/core/components/Card";
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";
import { GymApiService } from "./services/gymApi.service";
import type { CreatePlanPayload } from "./types/Gym.types";
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { PageHeader } from "@/core/components/PageHeader";

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCENT_COLORS = ["blue", "green", "purple", "orange", "cyan"] as const;

const BILLING_LABELS: Record<string, string> = {
    monthly: "mo",
    quarterly: "qtr",
    yearly: "yr",
};

// ─── Live Preview Card ──────────────────────────────────────────────────────

interface PreviewCardProps {
    name: string;
    price: string;
    billingCycle: string;
    features: string[];
    accentColor: string;
    isActive: boolean;
    description: string;
}

const PreviewCard = memo(({
    name, price, billingCycle, features, accentColor, isActive, description,
}: PreviewCardProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    const accent = accentColor || "blue";
    const cleanFeatures = features.filter((f) => f.trim().length > 0);
    const priceNum = parseFloat(price) || 0;

    return (
        <Card
            p={0}
            borderRadius="2xl"
            overflow="hidden"
            gap={0}
            _hover={{ transform: "none" }}
        >
            {/* Accent header bar */}
            <Box h="4px" bg={`${accent}.500`} />

            <VStack align="stretch" gap={5} p={6}>
                {/* Status + Name */}
                <Flex justify="space-between" align="start">
                    <VStack align="start" gap={1}>
                        <Badge
                            colorPalette={isActive ? accent : "gray"}
                            variant="subtle"
                            borderRadius="full"
                            px={3}
                            fontWeight="800"
                            fontSize="2xs"
                            textTransform="uppercase"
                            letterSpacing="wider"
                        >
                            {isActive ? "Live" : "Draft"}
                        </Badge>
                        <Heading size="lg" fontWeight="900" letterSpacing="tight">
                            {name || "Plan Name"}
                        </Heading>
                    </VStack>
                    <Circle size={10} bg={`${accent}.500/10`} color={`${accent}.500`}>
                        <Crown size={18} />
                    </Circle>
                </Flex>

                {/* Description */}
                {description && (
                    <Text fontSize="sm" color={muted} lineHeight="tall" lineClamp={2}>
                        {description}
                    </Text>
                )}

                {/* Price */}
                <HStack align="baseline" gap={1}>
                    <Text fontSize="4xl" fontWeight="900" letterSpacing="tighter" lineHeight="1">
                        ${priceNum.toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color={muted} fontWeight="600">
                        /{BILLING_LABELS[billingCycle] ?? "mo"}
                    </Text>
                </HStack>

                <Separator opacity={0.08} />

                {/* Features */}
                <VStack align="stretch" gap={2.5}>
                    {cleanFeatures.length > 0 ? cleanFeatures.map((f, i) => (
                        <HStack key={i} gap={2.5}>
                            <Circle size={5} bg={`${accent}.500/12`} color={`${accent}.500`} flexShrink={0}>
                                <Check size={10} />
                            </Circle>
                            <Text fontSize="sm" fontWeight="600">{f}</Text>
                        </HStack>
                    )) : (
                        <Text fontSize="sm" color={muted} fontStyle="italic">
                            Add features below…
                        </Text>
                    )}
                </VStack>

                {/* CTA preview */}
                <Button
                    mt={2}
                    w="full"
                    colorPalette={accent}
                    borderRadius="xl"
                    size="lg"
                    fontWeight="800"
                    pointerEvents="none"
                >
                    Select Plan
                </Button>
            </VStack>
        </Card>
    );
});
PreviewCard.displayName = "PreviewCard";

// ─── Section Header ─────────────────────────────────────────────────────────

interface SectionHeaderProps {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    accent?: string;
}

const SectionHeader = memo(({ icon: Icon, title, subtitle, accent = "brand" }: SectionHeaderProps) => {
    const muted = useColorModeValue("gray.500", "gray.400");
    return (
        <HStack gap={3} mb={1}>
            <Box w="3px" h="18px" borderRadius="full" bg={`${accent}.500`} />
            <VStack align="start" gap={0}>
                <Text fontSize="sm" fontWeight="800" color="app.text.primary">{title}</Text>
                {subtitle && <Text fontSize="xs" color={muted}>{subtitle}</Text>}
            </VStack>
        </HStack>
    );
});
SectionHeader.displayName = "SectionHeader";

// ─── Main Component ─────────────────────────────────────────────────────────

const AddSubscriptionPlan = memo(() => {
    const { navigateTo } = useWorkspaceRouter();

    // ── Form state ──
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("monthly");
    const [features, setFeatures] = useState<string[]>(["Access to gym floor", "Locker access"]);
    const [accentColor, setAccentColor] = useState("blue");
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mountNavActions = useNavActionStore((state) => state.setActions);
    const unmountNavActions = useNavActionStore((state) => state.clearActions);

    const validationErrors = useMemo(() => {
        const errors: string[] = [];
        if (!name.trim()) errors.push("Plan name is required");
        if (!code.trim()) errors.push("Plan code is required");
        if (!price || parseFloat(price) <= 0) errors.push("Price must be greater than 0");
        return errors;
    }, [name, code, price]);

    const isValid = validationErrors.length === 0;

    // ── Navigation ──
    const handleBack = useCallback(() => {
        navigateTo("GymSubscriptionPlans");
    }, [navigateTo]);

    // ── Feature management ──
    const handleAddFeature = useCallback(() => setFeatures((p) => [...p, ""]), []);

    const handleRemoveFeature = useCallback((idx: number) => {
        setFeatures((p) => p.filter((_, i) => i !== idx));
    }, []);

    const handleUpdateFeature = useCallback((idx: number, val: string) => {
        setFeatures((p) => { const n = [...p]; n[idx] = val; return n; });
    }, []);

    // ── Stable handler factories (avoid inline arrow in JSX) ──
    const mkFeatureChange = useCallback(
        (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => handleUpdateFeature(i, e.target.value),
        [handleUpdateFeature],
    );
    const mkFeatureRemove = useCallback(
        (i: number) => () => handleRemoveFeature(i),
        [handleRemoveFeature],
    );
    const mkColorSelect = useCallback(
        (c: string) => () => setAccentColor(c),
        [],
    );

    // ── Simple handlers ──
    const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value), []);
    const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.toUpperCase()), []);
    const handleDescChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value), []);
    const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value), []);
    const handleCurrencyChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value), []);
    const handleCycleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setBillingCycle(e.target.value as "monthly" | "quarterly" | "yearly");
    }, []);
    const handleActiveToggle = useCallback((e: { checked: boolean }) => setIsActive(e.checked), []);

    // ── Submit ──
    const handleSave = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) {
            validationErrors.forEach((err) => {
                toaster.create({ title: "Validation", description: err, type: "warning" });
            });
            return;
        }

        setIsSubmitting(true);
        const cleanFeatures = features.filter((f) => f.trim().length > 0);

        const payload: CreatePlanPayload = {
            name: name.trim(),
            code: code.trim(),
            description: description.trim(),
            price: parseFloat(price),
            currency,
            billing_cycle: billingCycle,
            is_active: isActive,
            features: cleanFeatures,
            accent_color: accentColor,
        };

        const sub = GymApiService.createPlan(payload).subscribe({
            next: (res) => {
                setIsSubmitting(false);
                if (res.success) {
                    toaster.create({
                        title: "Plan Created",
                        description: `"${payload.name}" is now ${isActive ? "live" : "saved as draft"}.`,
                        type: "success",
                    });
                    handleBack();
                } else {
                    toaster.create({ title: "Failed", description: (res as any).message ?? "Error", type: "error" });
                }
            },
            error: (err) => {
                setIsSubmitting(false);
                toaster.create({ title: "Network Error", description: err?.message ?? "Unreachable", type: "error" });
            },
        });
        return () => sub.unsubscribe();
    }, [isValid, validationErrors, name, code, description, price, currency, billingCycle, isActive, features, accentColor, handleBack]);

    useEffect(() => {
        mountNavActions(
            <HStack gap={2}>
                <Button
                    variant="outline"
                    borderRadius="sm"
                    size="md"
                    h="40px"
                    px={6}
                    onClick={handleBack}
                    fontWeight="800"
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "sm",
                        bg: "whiteAlpha.100",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s ease"
                >
                    <X size={14} /> Discard
                </Button>
                <Button
                    colorPalette="blue"
                    borderRadius="sm"
                    px={6}
                    size="md"
                    h="40px"
                    fontWeight="800"
                    disabled={!isValid || isSubmitting}
                    _hover={{
                        transform: "translateY(-1px)",
                        boxShadow: "0 10px 24px -8px var(--chakra-colors-blue-500)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s ease"
                    onClick={() =>
                        document.getElementById("plan-form")?.dispatchEvent(
                            new Event("submit", { cancelable: true, bubbles: true })
                        )
                    }
                >
                    {isSubmitting ? (
                        <HStack gap={2}><Spinner size="xs" /><Text>Publishing…</Text></HStack>
                    ) : (
                        <><Rocket size={14} /><Text ml={1}>Publish Plan</Text></>
                    )}
                </Button>
            </HStack>
        );
        return () => unmountNavActions();
    }, [mountNavActions, unmountNavActions, handleBack, isValid, isSubmitting]);

    // ── Theme ──
    const muted = useColorModeValue("gray.500", "gray.400");
    const fieldBg = useColorModeValue("gray.50", "whiteAlpha.50");

    return (
        <Box mt={4} w="full" animation="fade-in 0.5s ease-out">

            {/* ═══════════════ PAGE HEADER ═══════════════ */}
            <PageHeader
                title={
                    <HStack gap={3} align="center">
                        <IconButton
                            variant="ghost"
                            borderRadius="full"
                            size="sm"
                            onClick={handleBack}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={18} />
                        </IconButton>
                        <Text>New Subscription Plan</Text>
                    </HStack>
                }
                subtitle="Design a membership tier for your gym community"
            />

            {/* ═══════════════ CONTENT: Form + Preview ═══════════════ */}
            <SimpleGrid columns={{ base: 1, xl: 3 }} gap={6} pb={16}>

                {/* ── Left: Form (2 cols) ─────────────────────────── */}
                <Box gridColumn={{ xl: "span 2" }}>
                    <form id="plan-form" onSubmit={handleSave}>
                        <VStack gap={6} align="stretch">

                            {/* Section 1 — Identity */}
                            <Card p={6} borderRadius="2xl" gap={5} _hover={{ transform: "none" }}>
                                <SectionHeader icon={Tag} title="Plan Identity" subtitle="Name and internal code" />
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                                    <Field label="Plan Name" required>
                                        <Input
                                            placeholder="e.g. Performance Pro"
                                            h="48px"
                                            borderRadius="xl"
                                            fontWeight="600"
                                            value={name}
                                            onChange={handleNameChange}
                                        />
                                    </Field>
                                    <Field label="Plan Code" helperText="Auto-uppercased. Must be unique." required>
                                        <Input
                                            placeholder="GYM_PRO"
                                            h="48px"
                                            borderRadius="xl"
                                            fontWeight="bold"
                                            fontFamily="mono"
                                            textTransform="uppercase"
                                            letterSpacing="wider"
                                            value={code}
                                            onChange={handleCodeChange}
                                        />
                                    </Field>
                                </SimpleGrid>
                                <Field label="Description">
                                    <Textarea
                                        placeholder="Describe the value this plan delivers…"
                                        borderRadius="xl"
                                        rows={3}
                                        value={description}
                                        onChange={handleDescChange}
                                    />
                                </Field>
                            </Card>

                            {/* Section 2 — Pricing */}
                            <Card p={6} borderRadius="2xl" gap={5} _hover={{ transform: "none" }}>
                                <SectionHeader icon={Coins} title="Pricing & Billing" subtitle="Set base price and cycle" />
                                <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
                                    <Field label="Base Price" required>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            h="48px"
                                            borderRadius="xl"
                                            fontSize="lg"
                                            fontWeight="900"
                                            value={price}
                                            onChange={handlePriceChange}
                                        />
                                    </Field>
                                    <Field label="Currency">
                                        <NativeSelectRoot>
                                            <NativeSelectField
                                                h="48px"
                                                borderRadius="xl"
                                                fontWeight="600"
                                                value={currency}
                                                onChange={handleCurrencyChange}
                                            >
                                                <option value="USD">USD ($)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </NativeSelectField>
                                        </NativeSelectRoot>
                                    </Field>
                                    <Field label="Billing Cycle">
                                        <NativeSelectRoot>
                                            <NativeSelectField
                                                h="48px"
                                                borderRadius="xl"
                                                fontWeight="600"
                                                value={billingCycle}
                                                onChange={handleCycleChange}
                                            >
                                                <option value="monthly">Monthly</option>
                                                <option value="quarterly">Quarterly</option>
                                                <option value="yearly">Annual</option>
                                            </NativeSelectField>
                                        </NativeSelectRoot>
                                    </Field>
                                </SimpleGrid>
                            </Card>

                            {/* Section 3 — Features */}
                            <Card p={6} borderRadius="2xl" gap={5} _hover={{ transform: "none" }}>
                                <Flex justify="space-between" align="center">
                                    <SectionHeader icon={Sparkles} title="Plan Features" subtitle="What members get" />
                                    <Button
                                        size="sm"
                                        variant="surface"
                                        colorPalette="brand"
                                        borderRadius="full"
                                        onClick={handleAddFeature}
                                    >
                                        <Plus size={14} />
                                        <Text ml={1}>Add</Text>
                                    </Button>
                                </Flex>
                                <VStack align="stretch" gap={3}>
                                    {features.map((feature, idx) => (
                                        <HStack key={idx} gap={3}>
                                            <Box color={muted} flexShrink={0} cursor="grab">
                                                <GripVertical size={14} />
                                            </Box>
                                            <Input
                                                value={feature}
                                                onChange={mkFeatureChange(idx)}
                                                placeholder={`Feature #${idx + 1}`}
                                                h="44px"
                                                borderRadius="xl"
                                                flex="1"
                                            />
                                            <IconButton
                                                aria-label="Remove feature"
                                                variant="ghost"
                                                size="sm"
                                                colorPalette="red"
                                                borderRadius="full"
                                                onClick={mkFeatureRemove(idx)}
                                            >
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </HStack>
                                    ))}
                                    {features.length === 0 && (
                                        <Box p={6} textAlign="center" borderRadius="xl" bg={fieldBg}>
                                            <Text fontSize="sm" color={muted}>
                                                No features yet — click "Add" to start listing perks.
                                            </Text>
                                        </Box>
                                    )}
                                </VStack>
                            </Card>

                            {/* Section 4 — Branding & Status */}
                            <Card p={6} borderRadius="2xl" gap={5} _hover={{ transform: "none" }}>
                                <SectionHeader icon={Palette} title="Branding & Status" />
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                                    {/* Color picker */}
                                    <VStack align="start" gap={3} p={5} borderRadius="xl" bg={fieldBg}>
                                        <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                                            Accent Color
                                        </Text>
                                        <HStack gap={3}>
                                            {ACCENT_COLORS.map((color) => (
                                                <Circle
                                                    key={color}
                                                    size={9}
                                                    bg={`${color}.500`}
                                                    cursor="pointer"
                                                    border="3px solid"
                                                    borderColor={accentColor === color ? "white" : "transparent"}
                                                    boxShadow={accentColor === color
                                                        ? `0 0 0 2px var(--chakra-colors-${color}-500)`
                                                        : "none"
                                                    }
                                                    _hover={{ transform: "scale(1.15)" }}
                                                    transition="all 0.2s"
                                                    onClick={mkColorSelect(color)}
                                                >
                                                    {accentColor === color && <Check size={14} color="white" />}
                                                </Circle>
                                            ))}
                                        </HStack>
                                    </VStack>

                                    {/* Active toggle */}
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        p={5}
                                        borderRadius="xl"
                                        bg={fieldBg}
                                    >
                                        <VStack align="start" gap={0}>
                                            <Text fontSize="xs" fontWeight="800" color="app.text.primary">
                                                Go Live on Save
                                            </Text>
                                            <Text fontSize="xs" color={muted}>
                                                Members can immediately subscribe
                                            </Text>
                                        </VStack>
                                        <Switch
                                            colorPalette="green"
                                            size="lg"
                                            checked={isActive}
                                            onCheckedChange={handleActiveToggle}
                                        />
                                    </Flex>
                                </SimpleGrid>
                            </Card>
                        </VStack>
                    </form>
                </Box>

                {/* ── Right: Live Preview (sticky) ────────────────── */}
                <Box position={{ xl: "sticky" }} top={{ xl: "6rem" }} alignSelf="start">
                    <VStack align="stretch" gap={4}>
                        <HStack gap={2.5} px={1}>
                            <Box w="3px" h="16px" borderRadius="full" bg="brand.500" />
                            <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                Live Preview
                            </Text>
                            <Badge variant="subtle" colorPalette="brand" borderRadius="full" fontSize="2xs">
                                Real-time
                            </Badge>
                        </HStack>
                        <PreviewCard
                            name={name}
                            price={price}
                            billingCycle={billingCycle}
                            features={features}
                            accentColor={accentColor}
                            isActive={isActive}
                            description={description}
                        />
                        <Text fontSize="xs" color={muted} textAlign="center" fontWeight="500">
                            This is how members will see your plan
                        </Text>
                    </VStack>
                </Box>
            </SimpleGrid>
        </Box>
    );
});

AddSubscriptionPlan.displayName = "AddSubscriptionPlan";
export default AddSubscriptionPlan;
