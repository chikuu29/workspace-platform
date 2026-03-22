import { memo, useState, useMemo } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
    Input,
    SimpleGrid,
    Separator,
    Flex,
    Circle,
    IconButton,
    Avatar,
    InputGroup,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router";
import {
    LuArrowLeft,
    LuSearch,
    LuShieldCheck,
    LuCalendarDays,
    LuCreditCard,
    LuReceipt,
    LuUserSearch,
    LuZap,
} from "react-icons/lu";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { toaster } from "@/components/ui/toaster";

const MOCK_MEMBERS = [
    { id: "M1", name: "Aarav Mehta", email: "aarav@fitmail.com" },
    { id: "M2", name: "Sara Khan", email: "sara@fitmail.com" },
    { id: "M3", name: "Rohan Iyer", email: "rohan@fitmail.com" },
];

const MOCK_PLANS = [
    { id: "P1", name: "Basic Starter", price: 49, color: "blue" },
    { id: "P2", name: "Pro Performance", price: 89, color: "green" },
    { id: "P3", name: "Annual Platinum", price: 899, color: "purple" },
];

const CreateSubscription = memo(() => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { appCode } = useParams();
    const [searchParams] = useSearchParams();

    const [selectedMember, setSelectedMember] = useState<typeof MOCK_MEMBERS[0] | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<typeof MOCK_PLANS[0] | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const appParam = searchParams.get("app");
    const appName = appCode || appParam || "myGym";
    const workspacePrefix = pathname.includes("/workspace")
        ? `${pathname.split("/workspace")[0]}/workspace`
        : "";

    const handleBack = () => {
        const backPath = appCode 
            ? `${workspacePrefix}/app/${appCode}/Subscription`
            : `${workspacePrefix}/Subscription?app=${appName}`;
        navigate(backPath);
    };

    const handleConfirm = () => {
        if (!selectedMember || !selectedPlan) {
            toaster.create({
                title: "Incomplete Details",
                description: "Please select both a member and a plan.",
                type: "warning",
            });
            return;
        }
        toaster.create({
            title: "Subscription Activated!",
            description: `${selectedMember.name} is now enrolled in the ${selectedPlan.name} plan.`,
            type: "success",
        });
        handleBack();
    };

    const subtotal = selectedPlan?.price || 0;
    const tax = subtotal * 0.18; // 18% GST/Tax
    const total = subtotal + tax;

    const filteredMembers = useMemo(() => 
        MOCK_MEMBERS.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase())), 
    [searchQuery]);

    const muted = useColorModeValue("gray.600", "gray.400");
    const highlightBg = useColorModeValue("blue.50", "rgba(59, 130, 246, 0.1)");

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
                    <Text>New Membership Enrollment</Text>
                </HStack>
            }
            subtitle="Securely assign a subscription plan to a gym member and activate their access."
            actions={
                <Button
                    colorPalette="blue"
                    borderRadius="xl"
                    px={8}
                    h="52px"
                    shadow="0 10px 20px -5px rgba(59, 130, 246, 0.4)"
                    onClick={handleConfirm}
                    disabled={!selectedMember || !selectedPlan}
                >
                    <LuZap style={{ marginRight: "8px" }} /> Activate Subscription
                </Button>
            }
        >
            <Box maxW="6xl" mx="auto" pb={20}>
                <SimpleGrid columns={{ base: 1, lg: 3 }} gap={8}>
                    
                    {/* ── Left Column: Selection Flow ────────────────────────── */}
                    <VStack align="stretch" gap={8} gridColumn={{ lg: "span 2" }}>
                        
                        {/* Member Selection */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <HStack gap={3}>
                                    <Circle size={8} bg="blue.500/10" color="blue.500">
                                        <LuUserSearch size={16} />
                                    </Circle>
                                    <Heading size="md" letterSpacing="tight">1. Select Member</Heading>
                                </HStack>

                                {selectedMember ? (
                                    <HStack p={4} borderRadius="2xl" bg={highlightBg} border="1px solid" borderColor="blue.500/20" justify="space-between">
                                        <HStack gap={4}>
                                            <Avatar.Root size="md">
                                                <Avatar.Fallback>{selectedMember.name[0]}</Avatar.Fallback>
                                            </Avatar.Root>
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="800" fontSize="lg">{selectedMember.name}</Text>
                                                <Text fontSize="sm" color={muted}>{selectedMember.email}</Text>
                                            </VStack>
                                        </HStack>
                                        <Button size="sm" variant="ghost" colorPalette="blue" onClick={() => setSelectedMember(null)}>
                                            Change Choice
                                        </Button>
                                    </HStack>
                                ) : (
                                    <VStack align="stretch" gap={4}>
                                        <InputGroup
                                            flex="1"
                                            startElement={<LuSearch size={18} />}
                                            w="full"
                                        >
                                            <Input
                                                placeholder="Search by name or email..."
                                                h="54px"
                                                borderRadius="xl"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </InputGroup>
                                        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                                            {filteredMembers.map(m => (
                                                <Box
                                                    key={m.id}
                                                    p={4}
                                                    borderRadius="xl"
                                                    borderWidth="1px"
                                                    cursor="pointer"
                                                    _hover={{ borderColor: "blue.500", bg: "blue.500/5" }}
                                                    onClick={() => setSelectedMember(m)}
                                                >
                                                    <Text fontWeight="700" fontSize="md">{m.name}</Text>
                                                    <Text fontSize="xs" color={muted}>{m.email}</Text>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </VStack>
                                )}
                            </VStack>
                        </Card>

                        {/* Plan Selection */}
                        <Card p={8} borderRadius="3xl">
                            <VStack align="stretch" gap={6}>
                                <HStack gap={3}>
                                    <Circle size={8} bg="blue.500/10" color="blue.500">
                                        <LuCreditCard size={16} />
                                    </Circle>
                                    <Heading size="md" letterSpacing="tight">2. Choose Membership Tier</Heading>
                                </HStack>

                                <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                                    {MOCK_PLANS.map(p => {
                                        const isSelected = selectedPlan?.id === p.id;
                                        return (
                                            <VStack
                                                key={p.id}
                                                p={6}
                                                borderRadius="2xl"
                                                borderWidth="2px"
                                                borderColor={isSelected ? `${p.color}.500` : "transparent"}
                                                bg={isSelected ? `${p.color}.500/5` : useColorModeValue("gray.50", "whiteAlpha.50")}
                                                cursor="pointer"
                                                transition="all 0.2s"
                                                onClick={() => setSelectedPlan(p)}
                                                position="relative"
                                            >
                                                {isSelected && (
                                                    <Circle size={5} bg={`${p.color}.500`} color="white" position="absolute" top={2} right={2}>
                                                        <LuShieldCheck size={12} />
                                                    </Circle>
                                                )}
                                                <Text fontWeight="800" fontSize="md">{p.name}</Text>
                                                <Heading size="lg" color={`${p.color}.500`}>${p.price}</Heading>
                                                <Text fontSize="xs" color={muted}>Selected Tier</Text>
                                            </VStack>
                                        );
                                    })}
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} gap={6} pt={4}>
                                    <Field label="Start Activation Date">
                                        <Input type="date" h="54px" borderRadius="xl" defaultValue={new Date().toISOString().split('T')[0]} />
                                    </Field>
                                    <Field label="Payment Status">
                                        <HStack justify="space-between" h="54px" px={6} borderRadius="xl" bg={useColorModeValue("gray.50", "whiteAlpha.50")}>
                                            <Text fontWeight="700" fontSize="sm">Mark as Paid</Text>
                                            <Switch colorPalette="blue" size="lg" defaultChecked />
                                        </HStack>
                                    </Field>
                                </SimpleGrid>
                            </VStack>
                        </Card>
                    </VStack>

                    {/* ── Right Column: Summary Card ─────────────────────────── */}
                    <Card p={8} borderRadius="3xl" position="sticky" top={8}>
                        <VStack align="stretch" gap={6}>
                            <HStack gap={3}>
                                <Circle size={8} bg="blue.500/10" color="blue.500">
                                    <LuReceipt size={16} />
                                </Circle>
                                <Heading size="md" letterSpacing="tight">Order Summary</Heading>
                            </HStack>

                            <VStack align="stretch" gap={4} py={4}>
                                <Flex justify="space-between">
                                    <Text color={muted} fontWeight="600">Base Membership</Text>
                                    <Text fontWeight="800">${subtotal.toLocaleString()}</Text>
                                </Flex>
                                <Flex justify="space-between">
                                    <Text color={muted} fontWeight="600">Tax & Surcharge (18%)</Text>
                                    <Text fontWeight="800">${tax.toFixed(2)}</Text>
                                </Flex>
                                <Separator />
                                <Flex justify="space-between" pt={2}>
                                    <Heading size="md" fontWeight="900">Grand Total</Heading>
                                    <Heading size="md" fontWeight="900" color="blue.500">${total.toFixed(2)}</Heading>
                                </Flex>
                            </VStack>

                            <VStack p={4} borderRadius="xl" bg="blue.500/10" color="blue.500" gap={3}>
                                <HStack gap={3}>
                                    <LuZap size={18} />
                                    <Text fontSize="sm" fontWeight="800">Instant Activation</Text>
                                </HStack>
                                <Text fontSize="xs" textAlign="center" opacity={0.8}>
                                    Upon confirmation, the member will receive a digital membership kit via email.
                                </Text>
                            </VStack>

                            <Button
                                colorPalette="blue"
                                size="xl"
                                h="64px"
                                borderRadius="2xl"
                                fontWeight="900"
                                shadow="0 15px 30px -10px rgba(59, 130, 246, 0.4)"
                                onClick={handleConfirm}
                                disabled={!selectedMember || !selectedPlan}
                            >
                                Confirm Checkout
                            </Button>

                            <HStack justify="center" gap={2} pt={2} color={muted}>
                                <LuCalendarDays size={14} />
                                <Text fontSize="xs" fontWeight="700">Next renewal: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</Text>
                            </HStack>
                        </VStack>
                    </Card>

                </SimpleGrid>
            </Box>
        </PageLayout>
    );
});

CreateSubscription.displayName = "CreateSubscription";
export default CreateSubscription;
