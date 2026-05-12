import { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
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
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Switch } from "@/components/ui/switch";
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
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { APIResponse } from "@/app/interfaces/app.interface";
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Users,
    Database,
    Globe,
    Coins,
    Timer,
    Ticket,
    ShieldCheck,
    ArrowRight,
    Layers,
} from "lucide-react";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface PlanVersion {
    id: string;
    version: number;
    price: number;
    currency: string;
    country: string;
    billing_cycle: "monthly" | "yearly";
    max_users: number | null;
    max_branches: number | null;
    storage_limit_gb: number | null;
    effective_from: string;
    is_current: boolean;
    created_at: string;
}

interface Plan {
    id: string;
    plan_code: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    current_version?: PlanVersion;
    versions: PlanVersion[];
}

const SubscriptionPlansView = memo(() => {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const auth = useSelector((state: RootState) => state.auth);

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchPlans = useCallback(() => {
        setIsLoading(true);
        GETAPI({
            path: "/plans/available_plans",
            isPrivateApi: true,
        }).subscribe((res: APIResponse) => {
            if (res.success) {
                setPlans(res.data || []);
            } else {
                toaster.create({
                    title: "Error fetching plans",
                    description: res.message,
                    type: "error",
                });
            }
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchPlans();
    }, [fetchPlans]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        setSelectedPlan(null);
        setIsOpen(true);
    }, []);

    const handleEditClick = useCallback((plan: Plan) => {
        setSelectedPlan(plan);
        setIsOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        if (!window.confirm("Are you sure you want to delete this subscription plan? This cannot be undone.")) return;

        DELETEAPI({
            path: `/plans/${id}`,
            isPrivateApi: true,
        }).subscribe((res: APIResponse) => {
            if (res.success) {
                toaster.create({
                    title: "Plan Deleted",
                    type: "success",
                });
                fetchPlans();
            } else {
                toaster.create({
                    title: "Error deleting plan",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [fetchPlans]);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const data = {
            plan_code: formData.get("plan_code"),
            plan_name: formData.get("plan_name"),
            description: formData.get("description"),
            price: parseFloat(formData.get("price") as string) || 0,
            currency: formData.get("currency"),
            country: formData.get("country"),
            billing_cycle: formData.get("billing_cycle"),
            max_users: parseInt(formData.get("max_users") as string) || null,
            max_branches: parseInt(formData.get("max_branches") as string) || null,
            storage_limit_gb: parseInt(formData.get("storage_limit_gb") as string) || null,
            is_active: formData.get("is_active") === "on",
        };

        const request = selectedPlan
            ? PUTAPI({ path: `/plans/${selectedPlan.id}`, data, isPrivateApi: true })
            : POSTAPI({ path: "/plans/", data, isPrivateApi: true });

        request.subscribe((res: APIResponse) => {
            if (res.success) {
                toaster.create({
                    title: selectedPlan ? "Plan Updated" : "Plan Created",
                    type: "success",
                });
                fetchPlans();
                setIsOpen(false);
            } else {
                toaster.create({
                    title: "Error saving plan",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [selectedPlan, fetchPlans]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const planCards = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6}>
            {plans.map((plan) => {
                const version = plan.current_version;
                return (
                    <Card
                        key={plan.id}
                        p={6}
                        _hover={{
                            transform: "translateY(-4px)",
                            borderColor: "cyan.500/50",
                            boxShadow: "0 12px 30px -10px rgba(0, 255, 255, 0.15), 0 0 20px rgba(0, 255, 255, 0.05)",
                        }}
                    >
                        {/* Status & Menu */}
                        <HStack justify="space-between" mb={6}>
                            <Badge
                                variant="subtle"
                                colorPalette={plan.is_active ? "cyan" : "gray"}
                                borderRadius="full"
                                px={3}
                                py={0.5}
                                textTransform="none"
                                fontWeight="600"
                                fontSize="xs"
                            >
                                <HStack gap={1.5}>
                                    <Box boxSize={1.5} borderRadius="full" bg={plan.is_active ? "cyan.400" : "gray.400"} />
                                    {plan.is_active ? "Active" : "Archived"}
                                </HStack>
                            </Badge>
                            <HStack gap={1}>
                                <IconButton
                                    aria-label="Edit"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    onClick={() => handleEditClick(plan)}
                                    _hover={{ bg: "cyan.500/10", color: "cyan.400" }}
                                >
                                    <Pencil size={14} />
                                </IconButton>
                                <IconButton
                                    aria-label="Delete"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    colorPalette="red"
                                    onClick={() => handleDelete(plan.id)}
                                    _hover={{ bg: "red.500/10", color: "red.400" }}
                                >
                                    <Trash2 size={14} />
                                </IconButton>
                            </HStack>
                        </HStack>

                        {/* Title & Price */}
                        <VStack align="start" gap={1} mb={6}>
                            <Heading size="md" color="white" fontWeight="bold">
                                {plan.name}
                            </Heading>
                            <Text fontSize="xs" color="cyan.400" fontWeight="bold" letterSpacing="widest">
                                {plan.plan_code}
                            </Text>

                            <HStack align="baseline" mt={4} gap={1}>
                                <Text fontSize="3xl" fontWeight="900" color="white">
                                    {version?.currency === "INR" ? "₹" : "$"}
                                    {version?.price.toLocaleString()}
                                </Text>
                                <Text fontSize="sm" color="app.text.muted" fontWeight="600">
                                    / {version?.billing_cycle}
                                </Text>
                            </HStack>
                        </VStack>

                        <Text fontSize="sm" color="app.text.muted" mb={8} lineClamp={2} minH="40px">
                            {plan.description || "No description provided."}
                        </Text>

                        {/* Resource Limits */}
                        <Separator mb={6} opacity={0.1} />

                        <VStack align="stretch" gap={4}>
                            <HStack justify="space-between">
                                <HStack gap={3}>
                                    <Circle size={8} bg="cyan.500/10" border="1px solid" borderColor="cyan.500/20">
                                        <Icon as={Users} boxSize="14px" color="cyan.400" />
                                    </Circle>
                                    <Text fontSize="sm" color="app.text.secondary">Users Limit</Text>
                                </HStack>
                                <Text fontSize="sm" fontWeight="bold" color="white">
                                    {version?.max_users ?? "Unlimited"}
                                </Text>
                            </HStack>

                            <HStack justify="space-between">
                                <HStack gap={3}>
                                    <Circle size={8} bg="cyan.500/10" border="1px solid" borderColor="cyan.500/20">
                                        <Icon as={Layers} boxSize="14px" color="cyan.400" />
                                    </Circle>
                                    <Text fontSize="sm" color="app.text.secondary">Branches</Text>
                                </HStack>
                                <Text fontSize="sm" fontWeight="bold" color="white">
                                    {version?.max_branches ?? "Unlimited"}
                                </Text>
                            </HStack>

                            <HStack justify="space-between">
                                <HStack gap={3}>
                                    <Circle size={8} bg="cyan.500/10" border="1px solid" borderColor="cyan.500/20">
                                        <Icon as={Database} boxSize="14px" color="cyan.400" />
                                    </Circle>
                                    <Text fontSize="sm" color="app.text.secondary">Storage</Text>
                                </HStack>
                                <Text fontSize="sm" fontWeight="bold" color="white">
                                    {version?.storage_limit_gb ? `${version.storage_limit_gb} GB` : "Unlimited"}
                                </Text>
                            </HStack>
                        </VStack>

                        {/* Footer Info */}
                        <HStack mt={8} pt={6} borderTop="1px dashed" borderColor="app.card.border" justify="space-between">
                            <HStack gap={1.5}>
                                <Icon as={Globe} boxSize="12px" color="app.text.muted" />
                                <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                                    {version?.country}
                                </Text>
                            </HStack>
                            <HStack gap={1.5}>
                                <Icon as={ShieldCheck} boxSize="12px" color="emerald.400" />
                                <Text fontSize="xs" color="app.text.muted">
                                    v{version?.version || 1}
                                </Text>
                            </HStack>
                        </HStack>
                    </Card>
                );
            })}
        </SimpleGrid>
    ), [plans, handleEditClick, handleDelete]);

    return (
        <>
            <PageLayout
                title={
                    <HStack gap={3}>
                        <Icon as={Ticket} boxSize={6} color="cyan.500" />
                        <Text>Plans & Pricing</Text>
                    </HStack>
                }
                subtitle={
                    <Box ml={9}>
                        Configure subscription tiers, limits, and billing.
                    </Box>
                }
                actions={
                    <HStack gap={3}>

                        <Button
                            colorPalette="cyan"
                            borderRadius="xl"
                            size="md"
                            height="44px"
                            px={6}
                            onClick={handleAddClick}
                            boxShadow="0 8px 16px -4px rgba(0, 255, 255, 0.2)"
                        >
                            <Plus style={{ marginRight: "8px" }} /> Create Plan
                        </Button>
                    </HStack>
                }
                onRefresh={fetchPlans}
                isRefreshing={isLoading}
            >

                {/* ── Content ──────────────────────────────────────────────────── */}
                {isLoading && plans.length === 0 ? (
                    <Center h="400px">
                        <VStack gap={4}>
                            <Spinner size="xl" color="cyan.500" />
                            <Text color="app.text.muted" fontWeight="600">Fetching available plans...</Text>
                        </VStack>
                    </Center>
                ) : plans.length === 0 ? (
                    <Center h="400px" bg="app.card.bg" borderRadius="3xl" border="1px dashed" borderColor="app.card.border">
                        <VStack gap={6}>
                            <Icon as={Ticket} boxSize={12} color="white/10" />
                            <VStack gap={1}>
                                <Text color="white" fontWeight="bold" fontSize="lg">No Subscription Plans Found</Text>
                                <Text color="app.text.muted" maxW="300px" textAlign="center">
                                    Start by creating a plan with specific resource limits and pricing.
                                </Text>
                            </VStack>
                            <Button colorPalette="cyan" variant="outline" borderRadius="xl" onClick={handleAddClick}>
                                Create Your First Plan
                            </Button>
                        </VStack>
                    </Center>
                ) : (
                    planCards
                )}
            </PageLayout>

            {/* ── Drawer ───────────────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
                <DrawerBackdrop backdropFilter="blur(8px)" bg="black/40" />
                <DrawerContent
                    bg="app.bg.primary"
                    borderLeft="1px solid"
                    borderColor="app.card.border"
                    boxShadow="-20px 0 40px rgba(0,0,0,0.5)"
                    display="flex"
                    flexDirection="column"
                    h="100dvh"
                >
                    <DrawerCloseTrigger color="app.text.muted" top={4} right={4} />
                    <DrawerHeader pt={8} pb={6} borderBottom="1px solid" borderColor="app.card.border">
                        <VStack align="start" gap={1}>
                            <Text fontSize="xs" fontWeight="900" color="cyan.500" letterSpacing="widest" textTransform="uppercase">
                                {selectedPlan ? "Configuration" : "Initialization"}
                            </Text>
                            <Heading size="xl" fontWeight="bold" color="white">
                                {selectedPlan ? "Edit Plan Details" : "Create New Tier"}
                            </Heading>
                        </VStack>
                    </DrawerHeader>

                    <DrawerBody py={8} overflowY="auto" flex="1" className="custom-scrollbar">
                        <form id="plan-form" onSubmit={handleSave}>
                            <VStack gap={8} align="stretch">
                                {/* Basic Info */}
                                <VStack align="stretch" gap={4}>
                                    <HStack gap={2} mb={2}>
                                        <Icon as={Timer} color="cyan.400" boxSize="16px" />
                                        <Text fontSize="sm" fontWeight="bold" color="white">Logical Identity</Text>
                                    </HStack>
                                    <SimpleGrid columns={2} gap={4}>
                                        <Field label="Plan Code" disabled={!!selectedPlan} helperText="Unique identifier (e.g. CORE_BASIC)">
                                            <Input
                                                name="plan_code"
                                                defaultValue={selectedPlan?.plan_code}
                                                h="48px"
                                                fontSize="sm"
                                                bg="white/5"
                                                borderRadius="xl"
                                                fontWeight="600"
                                                borderColor="white/10"
                                                _focus={{ borderColor: "cyan.500", bg: "cyan.500/5" }}
                                            />
                                        </Field>
                                        <Field label="Tier Name" helperText="Display name for clients">
                                            <Input
                                                name="plan_name"
                                                defaultValue={selectedPlan?.name}
                                                h="48px"
                                                fontSize="sm"
                                                bg="white/5"
                                                borderRadius="xl"
                                                fontWeight="600"
                                                borderColor="white/10"
                                                _focus={{ borderColor: "cyan.500", bg: "cyan.500/5" }}
                                            />
                                        </Field>
                                    </SimpleGrid>
                                    <Field label="Short Description">
                                        <Textarea
                                            name="description"
                                            defaultValue={selectedPlan?.description ?? ""}
                                            placeholder="What does this plan offer?"
                                            rows={2}
                                            bg="white/5"
                                            fontSize="sm"
                                            borderRadius="xl"
                                            borderColor="white/10"
                                            _focus={{ borderColor: "cyan.500", bg: "cyan.500/5" }}
                                        />
                                    </Field>
                                </VStack>

                                <Separator opacity={0.1} />

                                {/* Pricing Configuration */}
                                <VStack align="stretch" gap={4}>
                                    <HStack gap={2} mb={2}>
                                        <Icon as={Coins} color="cyan.400" boxSize="16px" />
                                        <Text fontSize="sm" fontWeight="bold" color="white">Commercial Tiers</Text>
                                    </HStack>
                                    <SimpleGrid columns={3} gap={4}>
                                        <Field label="Base Price">
                                            <Input
                                                name="price"
                                                type="number"
                                                defaultValue={selectedPlan?.current_version?.price}
                                                h="48px"
                                                bg="white/5"
                                                borderRadius="xl"
                                                borderColor="white/10"
                                            />
                                        </Field>
                                        <Field label="Currency">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="currency"
                                                    defaultValue={selectedPlan?.current_version?.currency ?? "INR"}
                                                    h="48px"
                                                    bg="white/5"
                                                    borderRadius="xl"
                                                    borderColor="white/10"
                                                >
                                                    <option value="INR">INR (₹)</option>
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>
                                        <Field label="Cycle">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="billing_cycle"
                                                    defaultValue={selectedPlan?.current_version?.billing_cycle ?? "monthly"}
                                                    h="48px"
                                                    bg="white/5"
                                                    borderRadius="xl"
                                                    borderColor="white/10"
                                                >
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>
                                    </SimpleGrid>
                                    <Field label="Region / Country">
                                        <NativeSelectRoot>
                                            <NativeSelectField
                                                name="country"
                                                defaultValue={selectedPlan?.current_version?.country ?? "IN"}
                                                h="48px"
                                                bg="white/5"
                                                borderRadius="xl"
                                                borderColor="white/10"
                                            >
                                                <option value="IN">India (IN)</option>
                                                <option value="US">United States (US)</option>
                                                <option value="EU">European Union (EU)</option>
                                                <option value="UK">United Kingdom (UK)</option>
                                            </NativeSelectField>
                                        </NativeSelectRoot>
                                    </Field>
                                </VStack>

                                <Separator opacity={0.1} />

                                {/* Resource Limits */}
                                <VStack align="stretch" gap={4}>
                                    <HStack gap={2} mb={2}>
                                        <Icon as={Layers} color="cyan.400" boxSize="16px" />
                                        <Text fontSize="sm" fontWeight="bold" color="white">Resource Constraints</Text>
                                    </HStack>
                                    <SimpleGrid columns={3} gap={4}>
                                        <Field label="Max Users" helperText="0 for unlimited">
                                            <Input
                                                name="max_users"
                                                type="number"
                                                defaultValue={selectedPlan?.current_version?.max_users ?? 0}
                                                h="48px"
                                                bg="white/5"
                                                borderRadius="xl"
                                                borderColor="white/10"
                                            />
                                        </Field>
                                        <Field label="Max Branches" helperText="0 for unlimited">
                                            <Input
                                                name="max_branches"
                                                type="number"
                                                defaultValue={selectedPlan?.current_version?.max_branches ?? 0}
                                                h="48px"
                                                bg="white/5"
                                                borderRadius="xl"
                                                borderColor="white/10"
                                            />
                                        </Field>
                                        <Field label="Storage (GB)" helperText="0 for unlimited">
                                            <Input
                                                name="storage_limit_gb"
                                                type="number"
                                                defaultValue={selectedPlan?.current_version?.storage_limit_gb ?? 0}
                                                h="48px"
                                                bg="white/5"
                                                borderRadius="xl"
                                                borderColor="white/10"
                                            />
                                        </Field>
                                    </SimpleGrid>
                                </VStack>

                                <Separator opacity={0.1} />

                                <Flex justify="space-between" align="center">
                                    <Box>
                                        <Text fontWeight="600" color="white" fontSize="sm">Publish Plan</Text>
                                        <Text fontSize="xs" color="app.text.muted">Immediately available for new subscriptions</Text>
                                    </Box>
                                    <Switch
                                        name="is_active"
                                        defaultChecked={selectedPlan?.is_active ?? true}
                                        colorPalette="cyan"
                                    />
                                </Flex>
                            </VStack>
                        </form>
                    </DrawerBody>
                    <DrawerFooter borderTop="1px solid" borderColor="app.card.border" p={6}>
                        <Button
                            type="submit"
                            form="plan-form"
                            w="full"
                            colorPalette="cyan"
                            size="lg"
                            h="54px"
                            borderRadius="xl"
                            boxShadow="0 10px 20px -5px rgba(0, 255, 255, 0.2)"
                        >
                            {selectedPlan ? "Apply Upgrade" : "Launch Subscription Plan"}
                            <Icon as={ArrowRight} ml={2} />
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

SubscriptionPlansView.displayName = "SubscriptionPlansView";
export default SubscriptionPlansView;

