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
    LuRefreshCw,
    LuUsers,
    LuDatabase,
    LuGlobe,
    LuCoins,
    LuTimer,
    LuTicket,
    LuShieldCheck,
    LuArrowRight,
    LuLayers,
    LuActivity,
} from "react-icons/lu";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { Switch } from "@/components/ui/switch";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface GymPlanFeature {
    id: string;
    text: string;
}

interface GymPlan {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    billing_cycle: "monthly" | "quarterly" | "yearly";
    is_active: boolean;
    features: string[];
    accent_color: string;
}

const MOCK_PLANS: GymPlan[] = [
    {
        id: "1",
        code: "GYM_BASIC",
        name: "Basic Starter",
        description: "Perfect for beginners who want access to the main gym floor.",
        price: 49,
        currency: "USD",
        billing_cycle: "monthly",
        is_active: true,
        accent_color: "blue",
        features: ["Access to Gym Floor", "Locker Room Access", "1 PT Session/mo"],
    },
    {
        id: "2",
        code: "GYM_PRO",
        name: "Pro Performance",
        description: "Complete access for regular gym-goers including classes.",
        price: 89,
        currency: "USD",
        billing_cycle: "monthly",
        is_active: true,
        accent_color: "green",
        features: ["Full Gym Access", "Group Classes", "Nutrition Guide", "2 PT Sessions/mo"],
    },
    {
        id: "3",
        code: "GYM_PLATINUM",
        name: "Annual Platinum",
        description: "Our best value plan for long-term fitness goals.",
        price: 899,
        currency: "USD",
        billing_cycle: "yearly",
        is_active: true,
        accent_color: "purple",
        features: ["Priority PT Slots", "Nutrition Review", "Free Supplements", "Unlimited Classes", "Spa Access"],
    },
];

const GymSubscriptionPlans = memo(() => {
    const [plans, setPlans] = useState<GymPlan[]>(MOCK_PLANS);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<GymPlan | null>(null);

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
    const cardBg = useColorModeValue("white", "rgba(15, 23, 42, 0.6)");
    const borderColor = useColorModeValue("gray.100", "rgba(255, 255, 255, 0.08)");

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchPlans = useCallback(() => {
        setIsLoading(true);
        // Simulate API fetch
        setTimeout(() => {
            setPlans(MOCK_PLANS);
            setIsLoading(false);
        }, 800);
    }, []);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        const backPath = appCode 
            ? `${workspacePrefix}/app/${appCode}/AddSubscriptionPlan`
            : `${workspacePrefix}/AddSubscriptionPlan?app=${appName}`;
        navigate(backPath);
    }, [appCode, appName, workspacePrefix, navigate]);

    const handleEditClick = useCallback((plan: GymPlan) => {
        // For now, edit can still stay as a drawer or also move to a page.
        // The user specifically asked for a SEPARATE page to CREATE.
        setSelectedPlan(plan);
        setIsOpen(true);
    }, []);

    const handleDelete = useCallback((id: string) => {
        if (!window.confirm("Are you sure you want to delete this plan?")) return;
        setPlans(prev => prev.filter(p => p.id !== id));
        toaster.create({
            title: "Plan Removed",
            type: "success",
        });
    }, []);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        
        const newPlan: GymPlan = {
            id: selectedPlan?.id || Math.random().toString(36).substr(2, 9),
            code: formData.get("code") as string,
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            price: parseFloat(formData.get("price") as string) || 0,
            currency: "USD",
            billing_cycle: formData.get("billing_cycle") as any,
            is_active: formData.get("is_active") === "on",
            features: [
                "Gym Floor Access",
                "Trainer Support"
            ],
            accent_color: "blue"
        };

        if (selectedPlan) {
            setPlans(prev => prev.map(p => p.id === selectedPlan.id ? newPlan : p));
        } else {
            setPlans(prev => [...prev, newPlan]);
        }

        toaster.create({
            title: selectedPlan ? "Plan Updated" : "Plan Created",
            type: "success",
        });
        setIsOpen(false);
    }, [selectedPlan]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const planCards = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={8}>
            {plans.map((plan) => (
                <Card
                    key={plan.id}
                    p={8}
                    bg={cardBg}
                    borderWidth="1px"
                    borderColor={borderColor}
                    borderRadius="3xl"
                    transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    _hover={{
                        transform: "translateY(-8px)",
                        boxShadow: `0 20px 40px -12px rgba(59, 130, 246, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.1)`,
                        borderColor: "blue.500/30",
                    }}
                >
                    <VStack align="stretch" gap={6} h="full">
                        <Flex justify="space-between" align="start">
                            <Badge
                                variant="subtle"
                                colorPalette={plan.is_active ? plan.accent_color : "gray"}
                                px={4}
                                py={1.5}
                                borderRadius="full"
                                textTransform="none"
                                fontWeight="800"
                                letterSpacing="wide"
                            >
                                {plan.is_active ? "Live" : "Inactive"}
                            </Badge>
                            <HStack gap={1}>
                                <IconButton
                                    aria-label="Edit"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditClick(plan)}
                                    _hover={{ bg: "blue.500/10", color: "blue.500" }}
                                >
                                    <LuPencil size={16} />
                                </IconButton>
                                <IconButton
                                    aria-label="Delete"
                                    variant="ghost"
                                    size="sm"
                                    colorPalette="red"
                                    onClick={() => handleDelete(plan.id)}
                                >
                                    <LuTrash2 size={16} />
                                </IconButton>
                            </HStack>
                        </Flex>

                        <VStack align="start" gap={1}>
                            <Heading size="lg" fontWeight="900" letterSpacing="tight">
                                {plan.name}
                            </Heading>
                            <Text fontSize="xs" color="blue.500" fontWeight="bold" letterSpacing="widest" textTransform="uppercase">
                                {plan.code}
                            </Text>
                        </VStack>

                        <HStack align="baseline" gap={1}>
                            <Text fontSize="4xl" fontWeight="900">
                                ${plan.price.toLocaleString()}
                            </Text>
                            <Text fontSize="sm" color={muted} fontWeight="600">
                                / {plan.billing_cycle}
                            </Text>
                        </HStack>

                        <Text fontSize="md" color={muted} minH="48px" lineHeight="tall">
                            {plan.description}
                        </Text>

                        <Separator opacity={0.1} />

                        <VStack align="stretch" gap={3} flex="1">
                            <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="widest" color={muted}>
                                Plan Features
                            </Text>
                            {plan.features.map((feature, idx) => (
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
                            onClick={() => handleEditClick(plan)}
                        >
                            Modify Plan Details
                        </Button>
                    </VStack>
                </Card>
            ))}
        </SimpleGrid>
    ), [plans, cardBg, borderColor, muted, handleEditClick, handleDelete]);

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
                onRefresh={fetchPlans}
                isRefreshing={isLoading}
            >
                {isLoading ? (
                    <Center h="400px">
                        <VStack gap={4}>
                            <Spinner size="xl" color="blue.500" />
                            <Text color={muted} fontWeight="600">Syncing plan data...</Text>
                        </VStack>
                    </Center>
                ) : (
                    planCards
                )}
            </PageLayout>

            {/* ── Configuration Drawer ────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
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
                                {selectedPlan ? "Configuration" : "Initialization"}
                            </Text>
                            <Heading size="xl" fontWeight="900">
                                {selectedPlan ? "Edit Plan Details" : "Create New Plan"}
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
                                                defaultValue={selectedPlan?.code}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                        <Field label="Display Name" helperText="What members see">
                                            <Input
                                                name="name"
                                                defaultValue={selectedPlan?.name}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                    </SimpleGrid>
                                    <Field label="Description">
                                        <Textarea
                                            name="description"
                                            defaultValue={selectedPlan?.description}
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
                                                defaultValue={selectedPlan?.price}
                                                borderRadius="xl"
                                                h="48px"
                                            />
                                        </Field>
                                        <Field label="Billing Cycle">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="billing_cycle"
                                                    defaultValue={selectedPlan?.billing_cycle ?? "monthly"}
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
                                        defaultChecked={selectedPlan?.is_active ?? true}
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
                        >
                            {selectedPlan ? "Save Plan Changes" : "Launch This Plan"}
                            <LuArrowRight style={{ marginLeft: "8px" }} />
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

GymSubscriptionPlans.displayName = "GymSubscriptionPlans";
export default GymSubscriptionPlans;
