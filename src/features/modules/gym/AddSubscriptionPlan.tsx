import { memo, useState, useCallback } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
    Input,
    Textarea,
    SimpleGrid,
    Separator,
    Flex,
    Circle,
    IconButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router";
import {
    LuArrowLeft,
    LuSave,
    LuPlus,
    LuTrash2,
    LuTimer,
    LuCoins,
    LuCheck,
    LuPalette,
    LuSparkles,
} from "react-icons/lu";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { NativeSelectRoot, NativeSelectField } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { toaster } from "@/components/ui/toaster";

const AddSubscriptionPlan = memo(() => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { appCode } = useParams();
    const [searchParams] = useSearchParams();
    const [features, setFeatures] = useState<string[]>(["Access to gym floor", "Locker access"]);

    const appParam = searchParams.get("app");
    const appName = appCode || appParam || "myGym";
    const workspacePrefix = pathname.includes("/workspace")
        ? `${pathname.split("/workspace")[0]}/workspace`
        : "";

    const handleBack = () => {
        const backPath = appCode 
            ? `${workspacePrefix}/app/${appCode}/GymSubscriptionPlans`
            : `${workspacePrefix}/GymSubscriptionPlans?app=${appName}`;
        navigate(backPath);
    };

    const addFeature = () => setFeatures([...features, ""]);
    const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
    const updateFeature = (index: number, value: string) => {
        const next = [...features];
        next[index] = value;
        setFeatures(next);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        toaster.create({
            title: "Plan Created Successfully",
            description: "Your new subscription tier is now live.",
            type: "success",
        });
        handleBack();
    };

    const muted = useColorModeValue("gray.600", "gray.400");
    const sectionBg = useColorModeValue("rgba(0,0,0,0.02)", "whiteAlpha.50");

    return (
        <PageLayout
            title={
                <HStack gap={4}>
                    <IconButton
                        aria-label="Back"
                        variant="ghost"
                        onClick={handleBack}
                        borderRadius="full"
                    >
                        <LuArrowLeft size={20} />
                    </IconButton>
                    <Text>Design New Subscription Plan</Text>
                </HStack>
            }
            subtitle="Create a premium membership tier tailored for your gym's community."
            actions={
                <HStack gap={4}>
                    <Button variant="ghost" onClick={handleBack} borderRadius="xl">
                        Discard Draft
                    </Button>
                    <Button
                        colorPalette="blue"
                        borderRadius="xl"
                        px={8}
                        shadow="0 10px 20px -5px rgba(59, 130, 246, 0.4)"
                        onClick={() => document.getElementById("add-plan-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
                    >
                        <LuSave style={{ marginRight: "8px" }} /> Publish Plan
                    </Button>
                </HStack>
            }
        >
            <Box maxW="5xl" mx="auto" pb={20}>
                <form id="add-plan-form" onSubmit={handleSave}>
                    <VStack gap={8} align="stretch">
                        
                        {/* ── Section 1: Basic Identity ────────────────────────────── */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <HStack gap={3}>
                                    <Circle size={8} bg="blue.500/10" color="blue.500">
                                        <LuTimer size={16} />
                                    </Circle>
                                    <Heading size="md" letterSpacing="tight">Plan Identity</Heading>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
                                    <Field label="Plan Name" helperText="e.g., Performance Pro, Morning Warrior">
                                        <Input
                                            name="name"
                                            placeholder="Enter membership name"
                                            h="54px"
                                            borderRadius="2xl"
                                            fontSize="lg"
                                            fontWeight="600"
                                        />
                                    </Field>
                                    <Field label="Plan Code" helperText="Unique identifier for internal use">
                                        <Input
                                            name="code"
                                            placeholder="GYM_PRO_01"
                                            h="54px"
                                            borderRadius="2xl"
                                            fontWeight="bold"
                                            textTransform="uppercase"
                                        />
                                    </Field>
                                </SimpleGrid>
                                <Field label="Public Description">
                                    <Textarea
                                        name="description"
                                        placeholder="Describe the value this plan brings to your members..."
                                        borderRadius="2xl"
                                        rows={4}
                                        fontSize="md"
                                    />
                                </Field>
                            </VStack>
                        </Card>

                        {/* ── Section 2: Commercial Flow ───────────────────────────── */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <HStack gap={3}>
                                    <Circle size={8} bg="blue.500/10" color="blue.500">
                                        <LuCoins size={16} />
                                    </Circle>
                                    <Heading size="md" letterSpacing="tight">Commercial Structure</Heading>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                                    <Field label="Base Price">
                                        <Input
                                            name="price"
                                            type="number"
                                            placeholder="0.00"
                                            h="54px"
                                            borderRadius="2xl"
                                            fontSize="xl"
                                            fontWeight="900"
                                        />
                                    </Field>
                                    <Field label="Currency">
                                        <NativeSelectRoot>
                                            <NativeSelectField h="54px" borderRadius="2xl" fontWeight="600">
                                                <option value="USD">USD ($)</option>
                                                <option value="INR">INR (₹)</option>
                                                <option value="EUR">EUR (€)</option>
                                            </NativeSelectField>
                                        </NativeSelectRoot>
                                    </Field>
                                    <Field label="Billing Frequency">
                                        <NativeSelectRoot>
                                            <NativeSelectField h="54px" borderRadius="2xl" fontWeight="600">
                                                <option value="monthly">Monthly Billing</option>
                                                <option value="quarterly">Quarterly Billing</option>
                                                <option value="yearly">Annual Billing</option>
                                            </NativeSelectField>
                                        </NativeSelectRoot>
                                    </Field>
                                </SimpleGrid>
                            </VStack>
                        </Card>

                        {/* ── Section 3: Value Pillars (Features) ────────────────── */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <Flex justify="space-between" align="center">
                                    <HStack gap={3}>
                                        <Circle size={8} bg="blue.500/10" color="blue.500">
                                            <LuSparkles size={16} />
                                        </Circle>
                                        <Heading size="md" letterSpacing="tight">Membership Perks</Heading>
                                    </HStack>
                                    <Button
                                        size="sm"
                                        variant="surface"
                                        colorPalette="blue"
                                        borderRadius="full"
                                        onClick={addFeature}
                                    >
                                        <LuPlus /> Add Perk
                                    </Button>
                                </Flex>
                                <VStack align="stretch" gap={4}>
                                    {features.map((feature, index) => (
                                        <HStack key={index} gap={4}>
                                            <Input
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                placeholder={`Perk #${index + 1}`}
                                                h="50px"
                                                borderRadius="xl"
                                            />
                                            <IconButton
                                                aria-label="Remove"
                                                variant="ghost"
                                                colorPalette="red"
                                                onClick={() => removeFeature(index)}
                                            >
                                                <LuTrash2 size={18} />
                                            </IconButton>
                                        </HStack>
                                    ))}
                                </VStack>
                            </VStack>
                        </Card>

                        {/* ── Section 4: Visuals & Activation ────────────────────── */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <HStack gap={3}>
                                    <Circle size={8} bg="blue.500/10" color="blue.500">
                                        <LuPalette size={16} />
                                    </Circle>
                                    <Heading size="md" letterSpacing="tight">Branding & Availability</Heading>
                                </HStack>
                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
                                    <VStack align="start" gap={4} p={6} borderRadius="2xl" bg={sectionBg}>
                                        <Box>
                                            <Text fontWeight="800" fontSize="sm">Accent Identity</Text>
                                            <Text fontSize="xs" color={muted}>This color will be used for the plan's UI elements.</Text>
                                        </Box>
                                        <HStack gap={3}>
                                            {["blue", "green", "purple", "orange", "cyan"].map((color) => (
                                                <Circle
                                                    key={color}
                                                    size={8}
                                                    bg={`${color}.500`}
                                                    cursor="pointer"
                                                    border="2px solid"
                                                    borderColor="transparent"
                                                    _hover={{ transform: "scale(1.2)" }}
                                                    transition="all 0.2s"
                                                />
                                            ))}
                                        </HStack>
                                    </VStack>
                                    <Flex justify="space-between" align="center" px={6}>
                                        <Box>
                                            <Text fontWeight="800" fontSize="sm">Launch Immediately</Text>
                                            <Text fontSize="xs" color={muted}>Make this plan available for signup upon saving.</Text>
                                        </Box>
                                        <Switch colorPalette="blue" size="lg" defaultChecked />
                                    </Flex>
                                </SimpleGrid>
                            </VStack>
                        </Card>

                        <HStack justify="flex-end" pt={4} gap={4}>
                            <Button variant="ghost" size="lg" onClick={handleBack} borderRadius="xl">
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                colorPalette="blue"
                                size="lg"
                                px={12}
                                h="60px"
                                borderRadius="2xl"
                                fontWeight="900"
                                shadow="0 15px 30px -10px rgba(59, 130, 246, 0.5)"
                            >
                                <LuSave style={{ marginRight: "10px" }} /> Save & Launch Plan
                            </Button>
                        </HStack>
                    </VStack>
                </form>
            </Box>
        </PageLayout>
    );
});

AddSubscriptionPlan.displayName = "AddSubscriptionPlan";
export default AddSubscriptionPlan;
