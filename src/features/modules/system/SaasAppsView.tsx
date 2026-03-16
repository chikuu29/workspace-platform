import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
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
    Portal,
    Stack,
    Separator,
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
    LuLayoutGrid,
    LuPlus,
    LuPencil,
    LuTrash2,
    LuRefreshCw,
    LuChevronRight,
    LuShieldCheck,
    LuZap,
    LuSave,
    LuGlobe,
    LuCoins,
    LuActivity,
    LuChevronDown
} from "react-icons/lu";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AppPricing {
    id?: string;
    price: number;
    currency: string;
    country: string;
    is_active: boolean;
}

interface AppFeature {
    id: string;
    code: string;
    name: string;
    description: string;
    is_base_feature: boolean;
}

interface SaasApp {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    is_active: boolean;
    base_price: number;
    primary_currency: string;
    primary_country: string;
    pricing?: AppPricing[];
    features?: AppFeature[];
}

// ─── SaasAppsView ─────────────────────────────────────────────────────────────

const SaasAppsView = memo(() => {
    const [apps, setApps] = useState<SaasApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<SaasApp | null>(null);
    const navigate = useNavigate();
    const organizations = useSelector((state: RootState) => state.organizations);
    const organizationName = organizations?.organization?.name ?? "admin";

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchApps = useCallback(() => {
        setIsLoading(true);
        GETAPI({
            path: "/saas/get_apps",
            isPrivateApi: true,
        }).subscribe((res: APIResponse) => {
            if (res.success) {
                setApps(res.data || []);
            } else {
                toaster.create({
                    title: "Error fetching apps",
                    description: res.message,
                    type: "error",
                });
            }
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        setSelectedApp(null);
        setIsOpen(true);
    }, []);

    const handleEditClick = useCallback((app: SaasApp) => {
        setSelectedApp(app);
        setIsOpen(true);
    }, []);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const basePrice = parseFloat(formData.get("base_price") as string) || 0;
        const currency = formData.get("currency") as string;
        const country = formData.get("country") as string;

        const data = {
            name: formData.get("name"),
            code: formData.get("code"),
            description: formData.get("description"),
            icon: formData.get("icon") || "LuLayoutGrid",
            is_active: formData.get("is_active") === "on",
            pricing: [
                {
                    price: basePrice,
                    currency: currency,
                    country: country,
                    is_active: true
                }
            ],
            features: [],
        };

        const request = selectedApp
            ? PUTAPI({ path: `/saas/${selectedApp.id}`, data, isPrivateApi: true })
            : POSTAPI({ path: "/saas/register", data, isPrivateApi: true });

        request.subscribe((res: APIResponse) => {
            if (res.success) {
                toaster.create({
                    title: selectedApp ? "App Updated" : "App Registered",
                    type: "success",
                });
                fetchApps();
                setIsOpen(false);
            } else {
                toaster.create({
                    title: "Error saving app",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [selectedApp, fetchApps]);

    const handleDelete = useCallback((id: string) => {
        // Simple confirmation for now
        if (!window.confirm("Are you sure you want to delete this application? All associated features and permissions will be lost.")) return;

        DELETEAPI({
            path: `/saas/${id}`,
            isPrivateApi: true,
        }).subscribe((res: APIResponse) => {
            if (res.success) {
                toaster.create({
                    title: "App Deleted",
                    type: "success",
                });
                fetchApps();
            } else {
                toaster.create({
                    title: "Error deleting app",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [fetchApps]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const appCards = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6} p={0}>
            {apps.map((app) => (
                <Card
                    key={app.id}
                    _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 40px -12px rgba(6,182,212,0.25)",
                        borderColor: "cyan.500/40",
                        "& .app-actions": { opacity: 1, transform: "translateX(0)" }
                    }}
                >
                    {/* Status Badge */}
                    <Box position="absolute" top={4} right={4}>
                        <Badge
                            variant="subtle"
                            colorPalette={app.is_active ? "green" : "red"}
                            borderRadius="full"
                            px={2}
                            fontSize="10px"
                            fontWeight="800"
                        >
                            {app.is_active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                    </Box>

                    <VStack align="start" gap={5}>
                        <HStack gap={4} w="full">
                            <Center
                                w={12}
                                h={12}
                                borderRadius="xl"
                                bg="rgba(6,182,212,0.1)"
                                border="1px solid"
                                borderColor="rgba(6,182,212,0.2)"
                                boxShadow="inner"
                            >
                                <Icon as={LuLayoutGrid} boxSize={5} color="cyan.400" />
                            </Center>
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontWeight="800" color="app.text.primary" fontSize="md" letterSpacing="tight">
                                    {app.name}
                                </Text>
                                <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                                    {app.code}
                                </Text>
                            </VStack>
                        </HStack>

                        <Text fontSize="sm" color="app.text.secondary" lineClamp={2} minH="40px">
                            {app.description || "No description provided for this application."}
                        </Text>

                        <HStack gap={6} w="full" py={2}>
                            <VStack align="start" gap={0}>
                                <Text fontSize="10px" color="app.text.muted" fontWeight="700" textTransform="uppercase">
                                    Pricing
                                </Text>
                                <Text fontSize="sm" fontWeight="800" color="cyan.400">
                                    {app.primary_currency} {app.base_price?.toLocaleString()}
                                </Text>
                            </VStack>
                            <Separator orientation="vertical" h="24px" />
                            <VStack align="start" gap={0}>
                                <Text fontSize="10px" color="app.text.muted" fontWeight="700" textTransform="uppercase">
                                    Modules
                                </Text>
                                <Text fontSize="sm" fontWeight="800" color="app.text.primary">
                                    {app.features?.length || 0} Functional
                                </Text>
                            </VStack>
                        </HStack>

                        <HStack justify="space-between" w="full" pt={4} borderTop="1px solid" borderColor="app.card.border">
                            <HStack gap={2}>
                                <IconButton
                                    aria-label="Features"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    onClick={() => navigate(`/${organizationName}/Features?app=PlatformModules&app_id=${app.id}`)}
                                    _hover={{ bg: "cyan.500/10", color: "cyan.400" }}
                                    title="Manage Features"
                                >
                                    <LuZap size={16} />
                                </IconButton>
                                <IconButton
                                    aria-label="Permissions"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    onClick={() => navigate(`/${organizationName}/Permissions?app=PlatformModules&app_id=${app.id}`)}
                                    _hover={{ bg: "purple.500/10", color: "purple.400" }}
                                    title="Manage Permissions"
                                >
                                    <LuShieldCheck size={16} />
                                </IconButton>
                            </HStack>

                            <HStack gap={1} className="app-actions" transition="all 0.2s" opacity={{ base: 1, md: 0.1 }} transform={{ base: "none", md: "translateX(4px)" }}>
                                <IconButton
                                    aria-label="Edit"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    onClick={() => handleEditClick(app)}
                                    _hover={{ bg: "white/10", color: "white" }}
                                >
                                    <LuPencil size={14} />
                                </IconButton>
                                <IconButton
                                    aria-label="Delete"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    colorPalette="red"
                                    onClick={() => handleDelete(app.id)}
                                    _hover={{ bg: "red.500/10", color: "red.400" }}
                                >
                                    <LuTrash2 size={14} />
                                </IconButton>
                            </HStack>
                        </HStack>
                    </VStack>
                </Card>
            ))}
        </SimpleGrid>
    ), [apps, navigate, organizationName, handleEditClick]);

    return (
        <>
            <PageLayout
                title={
                    <HStack gap={3}>
                        <Center boxSize="40px" borderRadius="xl" bg="rgba(6,182,212,0.15)" color="cyan.400" border="1px solid" borderColor="cyan.400/20">
                            <LuLayoutGrid size={20} />
                        </Center>
                        <Text>Applications</Text>
                    </HStack>
                }
                subtitle={
                    <Box ml={1}>
                        Manage your products, pricing, and features.
                    </Box>
                }
                actions={
                    <HStack gap={4}>
                        <Button
                            colorPalette="cyan"
                            borderRadius="xl"
                            size="md"
                            onClick={handleAddClick}
                            boxShadow="0 8px 20px rgba(6,182,212,0.25)"
                            h="48px"
                            px={8}
                            fontWeight="700"
                            _hover={{ transform: "translateY(-1px)", boxShadow: "0 12px 24px rgba(6,182,212,0.35)" }}
                        >
                            <LuPlus style={{ strokeWidth: '3px', marginRight: '8px' }} size={18} /> Register Application
                        </Button>
                    </HStack>
                }
                onRefresh={fetchApps}
                isRefreshing={isLoading}
            >
                {isLoading && apps.length === 0 ? (
                    <Center py={32}>
                        <VStack gap={4}>
                            <Spinner size="xl" color="cyan.500" />
                            <Text color="app.text.muted" fontWeight="600" fontSize="sm" letterSpacing="widest">LOADING CATALOG...</Text>
                        </VStack>
                    </Center>
                ) : apps.length === 0 ? (
                    <Center py={32}>
                        <VStack gap={8} maxW="400px" textAlign="center">
                            <Center boxSize="100px" borderRadius="3xl" bg="rgba(255,255,255,0.02)" border="2px dashed" borderColor="app.card.border">
                                <LuLayoutGrid size={48} color="rgba(255,255,255,0.2)" />
                            </Center>
                            <VStack gap={2}>
                                <Heading size="xl" fontWeight="900">Project Zero</Heading>
                                <Text color="app.text.muted" fontSize="sm">
                                    No applications have been registered to your SaaS platform yet. Start by defining your first service.
                                </Text>
                            </VStack>
                            <Button colorPalette="cyan" size="lg" borderRadius="2xl" onClick={handleAddClick} px={8} h="54px" fontWeight="800">
                                Register Service <LuChevronRight />
                            </Button>
                        </VStack>
                    </Center>
                ) : (
                    appCards
                )}
            </PageLayout>

            {/* ── Drawer ───────────────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="lg">
                <DrawerBackdrop backdropFilter="blur(12px) saturate(150%)" bg="rgba(0,0,0,0.4)" />
                <DrawerContent
                    bg="app.bg.primary"
                    borderLeft="1px solid"
                    borderColor="app.card.border"
                    boxShadow="-40px 0 80px rgba(0,0,0,0.6)"
                    transition="transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)"
                    display="flex"
                    flexDirection="column"
                    h="100dvh"
                >
                    <DrawerCloseTrigger color="app.text.muted" top={8} right={8} p={2} _hover={{ bg: "white/5", color: "app.text.primary" }} />
                    <DrawerHeader borderBottom="1px solid" borderColor="app.card.border" py={10} px={12}>
                        <HStack gap={6}>
                            <Center w={16} h={16} borderRadius="2xl" bg="cyan.500" color="white" boxShadow="0 12px 24px rgba(6,182,212,0.3)">
                                <Icon as={selectedApp ? LuPencil : LuPlus} boxSize={8} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Heading size="2xl" fontWeight="900" letterSpacing="tight" color="app.text.primary">
                                    {selectedApp ? "Update App" : "Register App"}
                                </Heading>
                                <Text fontSize="sm" color="app.text.muted" fontWeight="500">
                                    {selectedApp ? "Modify application core configuration" : "Initialize a new SaaS offering in the catalog"}
                                </Text>
                            </VStack>
                        </HStack>
                    </DrawerHeader>

                    <DrawerBody py={12} px={12} className="custom-scrollbar" overflowY="auto" flex="1">
                        <form id="app-form" onSubmit={handleSave}>
                            <VStack gap={10} align="stretch">
                                {/* Identification Section */}
                                <Stack gap={6}>
                                    <HStack gap={2} mb={-2}>
                                        <LuActivity color="cyan.400" size={14} />
                                        <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="widest" color="cyan.400">Identification</Text>
                                    </HStack>

                                    <SimpleGrid columns={2} gap={6}>
                                        <Field label="Application Name" color="app.text.secondary">
                                            <Input
                                                name="name"
                                                defaultValue={selectedApp?.name}
                                                placeholder="e.g. CRM Plus"
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="48px"
                                                fontWeight="600"
                                                _focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px cyan.500" }}
                                            />
                                        </Field>

                                        <Field label="System Code" color="app.text.secondary">
                                            <Input
                                                name="code"
                                                defaultValue={selectedApp?.code}
                                                placeholder="CRM_PLUS"
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="48px"
                                                disabled={!!selectedApp}
                                                _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
                                                _focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px cyan.500" }}
                                            />
                                        </Field>
                                    </SimpleGrid>

                                    <Field label="Description" color="app.text.secondary">
                                        <Textarea
                                            name="description"
                                            defaultValue={selectedApp?.description}
                                            placeholder="Unified customer relationship management suite..."
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            rows={3}
                                            p={4}
                                            _focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px cyan.500" }}
                                        />
                                    </Field>
                                </Stack>

                                {/* Pricing Section */}
                                <Stack gap={6}>
                                    <HStack gap={2} mb={-2}>
                                        <LuCoins color="cyan.400" size={14} />
                                        <Text fontSize="xs" fontWeight="800" textTransform="uppercase" letterSpacing="widest" color="cyan.400">Commercial Configuration</Text>
                                    </HStack>

                                    <SimpleGrid columns={3} gap={6}>
                                        <Field label="Base Price" color="app.text.secondary">
                                            <Input
                                                name="base_price"
                                                type="number"
                                                defaultValue={selectedApp?.base_price || 1000}
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="48px"
                                                fontWeight="700"
                                                _focus={{ borderColor: "cyan.500", boxShadow: "0 0 0 1px cyan.500" }}
                                            />
                                        </Field>

                                        <Field label="Currency" color="app.text.secondary">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="currency"
                                                    defaultValue={selectedApp?.primary_currency || "INR"}
                                                    bg="rgba(255,255,255,0.02)"
                                                    borderColor="app.card.border"
                                                    borderRadius="xl"
                                                    h="48px"
                                                    fontWeight="600"
                                                >
                                                    <option value="INR">INR (₹)</option>
                                                    <option value="USD">USD ($)</option>
                                                    <option value="EUR">EUR (€)</option>
                                                    <option value="GBP">GBP (£)</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>

                                        <Field label="Target Country" color="app.text.secondary">
                                            <NativeSelectRoot>
                                                <NativeSelectField
                                                    name="country"
                                                    defaultValue={selectedApp?.primary_country || "IN"}
                                                    bg="rgba(255,255,255,0.02)"
                                                    borderColor="app.card.border"
                                                    borderRadius="xl"
                                                    h="48px"
                                                    fontWeight="600"
                                                >
                                                    <option value="IN">India</option>
                                                    <option value="US">USA</option>
                                                    <option value="UK">United Kingdom</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>
                                    </SimpleGrid>
                                </Stack>

                                {/* Visuals & Status */}
                                <SimpleGrid columns={2} gap={6}>
                                    <Field label="Visual Icon" color="app.text.secondary" helperText="React Icon key (e.g. LuGlobe)">
                                        <Input
                                            name="icon"
                                            defaultValue={selectedApp?.icon || "LuLayoutGrid"}
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            h="48px"
                                        />
                                    </Field>

                                    <Box p={4} bg="rgba(6,182,212,0.05)" borderRadius="xl" border="1px dashed" borderColor="cyan.500/30">
                                        <HStack justify="space-between" h="full">
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="600" fontSize="sm">Status</Text>
                                                <Text fontSize="11px" color="app.text.muted">Active in catalog?</Text>
                                            </VStack>
                                            <Switch
                                                name="is_active"
                                                defaultChecked={selectedApp?.is_active ?? true}
                                                colorPalette="cyan"
                                                size="lg"
                                            />
                                        </HStack>
                                    </Box>
                                </SimpleGrid>

                                <VStack align="stretch" gap={4} pt={4} borderTop="1px solid" borderColor="app.card.border">
                                    {selectedApp && (
                                        <HStack justify="space-between">
                                            <Text fontSize="xs" color="app.text.muted">Application ID: {selectedApp.id}</Text>
                                            <Badge variant="outline" size="sm" colorPalette="cyan">PLATFORM_RESOURCE</Badge>
                                        </HStack>
                                    )}
                                </VStack>
                            </VStack>
                        </form>
                    </DrawerBody>

                    <DrawerFooter borderTop="1px solid" borderColor="app.card.border" py={6} px={12}>
                        <Button
                            type="submit"
                            form="app-form"
                            w="full"
                            colorPalette="cyan"
                            size="lg"
                            borderRadius="xl"
                            h="60px"
                            boxShadow="0 12px 24px rgba(6,182,212,0.25)"
                            _active={{ transform: "scale(0.98)" }}
                        >
                            <LuSave style={{ marginRight: '8px' }} />
                            {selectedApp ? "Update Configuration" : "Initialize Application"}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

SaasAppsView.displayName = "SaasAppsView";
export default SaasAppsView;
