/**
 * GymSubscriptionPlans.tsx
 *
 * Full plan management page — list, edit (drawer), delete.
 * Fetches plans from backend via useSubscriptionPlans hook.
 * Edit saves via GymApiService.updatePlan().
 * Delete via GymApiService.deletePlan().
 */

import { memo, useState, useCallback, useMemo } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Badge,
    IconButton,
    Input,
    Textarea,
    SimpleGrid,
    Spinner,
    Center,
    Separator,
    Flex,
    Circle,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router";
import {
    DrawerRoot,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerBackdrop,
    DrawerCloseTrigger,
} from "@/components/ui/drawer";
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
    LuPlus,
    LuPencil,
    LuTrash2,
    LuShieldCheck,
    LuArrowRight,
    LuActivity,
    LuTimer,
    LuCoins,
} from "react-icons/lu";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { Switch } from "@/components/ui/switch";
import { useSubscriptionPlans } from "./hooks/useSubscriptionPlans";
import { GymApiService } from "./services/gymApi.service";
import type { SubscriptionPlanDocument } from "./types/Gym.types";

// ─── Main Component ─────────────────────────────────────────────────────────

const GymSubscriptionPlans = memo(() => {
    const { plans, loading: isLoading, refetch } = useSubscriptionPlans();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanDocument | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { appCode } = useParams();
    const [searchParams] = useSearchParams();

    const appParam = searchParams.get("app");
    const appName = appCode || appParam || "myGym";
    const workspacePrefix = pathname.includes("/workspace")
        ? `${pathname.split("/workspace")[0]}/workspace`
        : "";

    const muted = useColorModeValue("gray.600", "gray.400");
    const borderColor = useColorModeValue("gray.100", "rgba(255, 255, 255, 0.08)");

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        const path = appCode
            ? `${workspacePrefix}/app/${appCode}/AddSubscriptionPlan`
            : `${workspacePrefix}/AddSubscriptionPlan?app=${appName}`;
        navigate(path);
    }, [appCode, appName, workspacePrefix, navigate]);

    const handleEditClick = useCallback((plan: SubscriptionPlanDocument) => {
        setSelectedPlan(plan);
        setIsOpen(true);
    }, []);

    const handleDelete = useCallback((plan: SubscriptionPlanDocument) => {
        if (!window.confirm(`Delete plan "${plan.data.name}"? This cannot be undone.`)) return;

        const identifier = plan._meta.record_id;
        const sub = GymApiService.deletePlan(identifier).subscribe({
            next: (res) => {
                if (res.success) {
                    toaster.create({ title: "Plan Removed", type: "success" });
                    refetch();
                } else {
                    toaster.create({ title: "Failed to delete", description: (res as any).message, type: "error" });
                }
            },
            error: (err) => {
                toaster.create({ title: "Network Error", description: err?.message, type: "error" });
            },
        });
        return () => sub.unsubscribe();
    }, [refetch]);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedPlan) return;

        setIsSaving(true);
        const formData = new FormData(event.currentTarget);

        const updatePayload = {
            code: formData.get("code") as string,
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            price: parseFloat(formData.get("price") as string) || 0,
            billing_cycle: formData.get("billing_cycle") as string,
            is_active: formData.get("is_active") === "on",
        };

        const identifier = selectedPlan._meta.record_id;
        const sub = GymApiService.updatePlan(identifier, updatePayload).subscribe({
            next: (res) => {
                setIsSaving(false);
                if (res.success) {
                    toaster.create({ title: "Plan Updated", type: "success" });
                    setIsOpen(false);
                    refetch();
                } else {
                    toaster.create({ title: "Update Failed", description: (res as any).message, type: "error" });
                }
            },
            error: (err) => {
                setIsSaving(false);
                toaster.create({ title: "Network Error", description: err?.message, type: "error" });
            },
        });

        return () => sub.unsubscribe();
    }, [selectedPlan, refetch]);

    const handleDrawerOpenChange = useCallback((e: { open: boolean }) => {
        setIsOpen(e.open);
    }, []);

    // ── Plan Card Factory ───────────────────────────────────────────────────

    const createEditHandler = useCallback(
        (plan: SubscriptionPlanDocument) => () => handleEditClick(plan),
        [handleEditClick]
    );

    const createDeleteHandler = useCallback(
        (plan: SubscriptionPlanDocument) => () => handleDelete(plan),
        [handleDelete]
    );

    // ── Render ──────────────────────────────────────────────────────────────

    const planCards = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={8}>
            {plans.map((plan) => {
                const accent = plan.data.accent_color || "blue";
                return (
                    <Card
                        key={plan._id}
                        p={8}
                        borderRadius="3xl"
                    >
                        <VStack align="stretch" gap={6} h="full">
                            <Flex justify="space-between" align="start">
                                <Badge
                                    variant="subtle"
                                    colorPalette={plan.data.is_active ? accent : "gray"}
                                    px={4}
                                    py={1.5}
                                    borderRadius="full"
                                    textTransform="none"
                                    fontWeight="800"
                                    letterSpacing="wide"
                                >
                                    {plan.data.is_active ? "Live" : "Inactive"}
                                </Badge>
                                <HStack gap={1}>
                                    <IconButton
                                        aria-label="Edit"
                                        variant="ghost"
                                        size="sm"
                                        onClick={createEditHandler(plan)}
                                        _hover={{ bg: "blue.500/10", color: "blue.500" }}
                                    >
                                        <LuPencil size={16} />
                                    </IconButton>
                                    <IconButton
                                        aria-label="Delete"
                                        variant="ghost"
                                        size="sm"
                                        colorPalette="red"
                                        onClick={createDeleteHandler(plan)}
                                    >
                                        <LuTrash2 size={16} />
                                    </IconButton>
                                </HStack>
                            </Flex>

                            <VStack align="start" gap={1}>
                                <Heading size="lg" fontWeight="900" letterSpacing="tight">
                                    {plan.data.name}
                                </Heading>
                                <Text fontSize="xs" color="blue.500" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
                                    {plan.data.code}
                                </Text>
                            </VStack>

                            <HStack align="baseline" gap={1}>
                                <Text fontSize="4xl" fontWeight="900">
                                    ${plan.data.price.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" color={muted} fontWeight="600">
                                    / {plan.data.billing_cycle}
                                </Text>
                            </HStack>

                            <Text fontSize="md" color={muted} minH="48px" lineHeight="tall">
                                {plan.data.description}
                            </Text>

                            <Separator opacity={0.1} />

                            <VStack align="stretch" gap={3} flex="1">
                                <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="widest" color={muted}>
                                    Plan Features
                                </Text>
                                {plan.data.features.map((feature, idx) => (
                                    <HStack key={idx} gap={3}>
                                        <Circle size={6} bg="blue.500/10" color="blue.500">
                                            <LuShieldCheck size={14} />
                                        </Circle>
                                        <Text fontSize="sm" fontWeight="600">{feature}</Text>
                                    </HStack>
                                ))}
                            </VStack>

                            <Button
                                mt={4}
                                variant="surface"
                                colorPalette="blue"
                                w="full"
                                borderRadius="2xl"
                                fontWeight="800"
                                h="50px"
                                onClick={createEditHandler(plan)}
                            >
                                Modify Plan Details
                            </Button>
                        </VStack>
                    </Card>
                );
            })}
        </SimpleGrid>
    ), [plans, muted, createEditHandler, createDeleteHandler]);

    return (
        <>
            <PageLayout
                title={
                    <HStack gap={4}>
                        <Circle size={10} bg="blue.500" color="white" shadow="0 0 20px rgba(59, 130, 246, 0.4)">
                            <LuActivity size={20} />
                        </Circle>
                        <Text>Gym Subscription Plans</Text>
                    </HStack>
                }
                subtitle="Configure the membership tiers and pricing models for your gym."
                actions={
                    <Button
                        colorPalette="blue"
                        borderRadius="2xl"
                        size="lg"
                        px={8}
                        h="52px"
                        shadow="0 10px 20px -5px rgba(59, 130, 246, 0.3)"
                        onClick={handleAddClick}
                    >
                        <LuPlus style={{ marginRight: "8px" }} /> Add New Plan
                    </Button>
                }
                onRefresh={refetch}
                isRefreshing={isLoading}
            >
                {isLoading ? (
                    <Center h="400px">
                        <VStack gap={4}>
                            <Spinner size="xl" color="blue.500" />
                            <Text color={muted} fontWeight="600">Syncing plan data...</Text>
                        </VStack>
                    </Center>
                ) : plans.length === 0 ? (
                    <Center h="300px">
                        <VStack gap={4} textAlign="center">
                            <Heading size="md" color={muted}>No plans created yet</Heading>
                            <Text fontSize="sm" color={muted}>Click "Add New Plan" to get started.</Text>
                        </VStack>
                    </Center>
                ) : (
                    planCards
                )}
            </PageLayout>

            {/* ── Configuration Drawer ────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={handleDrawerOpenChange} size="md">
                <DrawerBackdrop backdropFilter="blur(8px)" bg="black/40" />
                <DrawerContent
                    bg={useColorModeValue("white", "gray.900")}
                    borderLeft="1px solid"
                    borderColor={borderColor}
                >
                    <DrawerCloseTrigger top={4} right={4} />
                    <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} p={8}>
                        <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="900" color="blue.500" letterSpacing="widest" textTransform="uppercase">
                                Configuration
                            </Text>
                            <Heading size="xl" fontWeight="900">
                                Edit Plan Details
                            </Heading>
                        </VStack>
                    </DrawerHeader>

                    <DrawerBody p={8}>
                        <form id="gym-plan-form" onSubmit={handleSave}>
                            <VStack gap={8} align="stretch">
                                <VStack align="stretch" gap={4}>
                                    <HStack gap={2} mb={2}>
                                        <LuTimer color="blue" />
                                        <Text fontSize="sm" fontWeight="bold">Identity & Identification</Text>
                                    </HStack>
                                    <SimpleGrid columns={2} gap={4}>
                                        <Field label="Plan Code" helperText="Used for internal tracking">
                                            <Input
                                                name="code"
                                                defaultValue={selectedPlan?.data.code}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                        <Field label="Display Name" helperText="What members see">
                                            <Input
                                                name="name"
                                                defaultValue={selectedPlan?.data.name}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                    </SimpleGrid>
                                    <Field label="Description">
                                        <Textarea
                                            name="description"
                                            defaultValue={selectedPlan?.data.description}
                                            borderRadius="xl"
                                            rows={3}
                                        />
                                    </Field>
                                </VStack>

                                <Separator opacity={0.1} />

                                <VStack align="stretch" gap={4}>
                                    <HStack gap={2} mb={2}>
                                        <LuCoins color="blue" />
                                        <Text fontSize="sm" fontWeight="bold">Pricing Model</Text>
                                    </HStack>
                                    <SimpleGrid columns={2} gap={4}>
                                        <Field label="Base Price ($)">
                                            <Input
                                                name="price"
                                                type="number"
                                                defaultValue={selectedPlan?.data.price}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                        <Field label="Billing Cycle">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="billing_cycle"
                                                    defaultValue={selectedPlan?.data.billing_cycle ?? "monthly"}
                                                    borderRadius="xl"
                                                    h="48px"
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="yearly">Yearly</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>
                                    </SimpleGrid>
                                </VStack>

                                <Separator opacity={0.1} />

                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <Text fontWeight="800" fontSize="sm">Active Status</Text>
                                        <Text fontSize="xs" color={muted}>Should this plan be available for new signups?</Text>
                                    </Box>
                                    <Switch
                                        name="is_active"
                                        defaultChecked={selectedPlan?.data.is_active ?? true}
                                        colorPalette="blue"
                                        size="lg"
                                    />
                                </Flex>
                            </VStack>
                        </form>
                    </DrawerBody>

                    <DrawerFooter borderTopWidth="1px" borderColor={borderColor} p={8}>
                        <Button
                            type="submit"
                            form="gym-plan-form"
                            w="full"
                            colorPalette="blue"
                            size="xl"
                            h="56px"
                            borderRadius="2xl"
                            fontWeight="900"
                            shadow="0 10px 25px -5px rgba(59, 130, 246, 0.4)"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <HStack gap={2}>
                                    <Spinner size="sm" />
                                    <Text>Saving...</Text>
                                </HStack>
                            ) : (
                                <>
                                    Save Plan Changes
                                    <LuArrowRight style={{ marginLeft: "8px" }} />
                                </>
                            )}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

GymSubscriptionPlans.displayName = "GymSubscriptionPlans";
export default GymSubscriptionPlans;
