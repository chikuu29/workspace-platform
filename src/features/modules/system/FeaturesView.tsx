import { memo, useEffect, useState, useCallback, useMemo } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    HStack,
    Button,
    Icon,
    Table,
    Badge,
    IconButton,
    Input,
    Textarea,
    Spinner,
    Center,
    Portal,
    Group,
    Stack,
    Grid,
    SimpleGrid,
} from "@chakra-ui/react";
import {
    PopoverRoot,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
} from "@/components/ui/popover";
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
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
    LuZap,
    LuPlus,
    LuPencil,
    LuTrash2,
    LuRefreshCw,
    LuShield,
    LuCheck,
    LuEye,
    LuSave,
    LuStar,
    LuCode,
    LuSearch,
    LuChevronDown,
    LuChevronRight,
    LuLayoutGrid
} from "react-icons/lu";
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface SaasFeature {
    id: string;
    app_id: string;
    code: string;
    name: string;
    description: string;
    is_base_feature: boolean;
    addon_price: number;
    currency: string;
    status: string;
    created_at?: string;
    updated_at?: string;
}

interface SaasApp {
    id: string;
    name: string;
    code: string;
}

// ─── FeaturesView ────────────────────────────────────────────────────────────

const FeaturesView = memo(() => {
    const [features, setFeatures] = useState<SaasFeature[]>([]);
    const [apps, setApps] = useState<SaasApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<SaasFeature | null>(null);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchApps = useCallback(() => {
        GETAPI({
            path: "/saas/get_apps",
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) {
                setApps(res.data || []);
            }
        });
    }, []);

    const fetchFeatures = useCallback((appId: string) => {
        if (!appId) {
            setFeatures([]);
            return;
        }
        setIsLoading(true);
        GETAPI({
            path: `/saas/${appId}/features`,
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) {
                setFeatures(res.data || []);
            }
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchApps();
    }, [fetchApps]);

    useEffect(() => {
        if (selectedAppId) {
            fetchFeatures(selectedAppId);
        }
    }, [selectedAppId, fetchFeatures]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        if (!selectedAppId) {
            toaster.create({ title: "Select an application first", type: "warning" });
            return;
        }
        setSelectedFeature(null);
        setIsOpen(true);
    }, [selectedAppId]);

    const handleEditClick = useCallback((feature: SaasFeature) => {
        setSelectedFeature(feature);
        setIsOpen(true);
    }, []);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const data = {
            code: formData.get("code"),
            name: formData.get("name"),
            description: formData.get("description"),
            is_base_feature: formData.get("is_base_feature") === "on",
            addon_price: parseFloat(formData.get("addon_price") as string || "0"),
            currency: formData.get("currency"),
            status: formData.get("status") ? "active" : "inactive",
        };

        const apiCall = selectedFeature
            ? PUTAPI({ path: `/saas/features/${selectedFeature.id}`, data, isPrivateApi: true })
            : POSTAPI({ path: `/saas/${selectedAppId}/features`, data, isPrivateApi: true });

        apiCall.subscribe((res) => {
            if (res.success) {
                toaster.create({
                    title: selectedFeature ? "Feature Updated" : "Feature Created",
                    type: "success",
                });
                fetchFeatures(selectedAppId);
                setIsOpen(false);
            } else {
                toaster.create({
                    title: "Error saving feature",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [selectedFeature, selectedAppId, fetchFeatures]);

    const handleDelete = useCallback((id: string) => {
        if (!window.confirm("Are you sure you want to delete this feature?")) return;

        DELETEAPI({
            path: `/saas/features/${id}`,
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) {
                toaster.create({ title: "Feature Deleted", type: "success" });
                fetchFeatures(selectedAppId);
            }
        });
    }, [selectedAppId, fetchFeatures]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const featureCards = useMemo(() => (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={6} p={6}>
            {features.map((feat) => (
                <Card
                    key={feat.id}
                    _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "0 20px 40px -12px rgba(139,92,246,0.25)",
                        borderColor: "purple.500/40",
                        "& .feature-actions": { opacity: 1, transform: "translateX(0)" }
                    }}
                >
                    {/* Status Badge */}
                    <Box position="absolute" top={4} right={4}>
                        <Badge
                            variant="subtle"
                            colorPalette={feat.status === "active" ? "green" : "red"}
                            borderRadius="full"
                            px={2}
                            fontSize="10px"
                            fontWeight="800"
                        >
                            {feat.status.toUpperCase()}
                        </Badge>
                    </Box>

                    <VStack align="start" gap={5}>
                        <HStack gap={4} w="full">
                            <Center
                                w={12}
                                h={12}
                                borderRadius="xl"
                                bg="rgba(139,92,246,0.1)"
                                border="1px solid"
                                borderColor="rgba(139,92,246,0.2)"
                                boxShadow="inner"
                            >
                                <Icon as={LuZap} boxSize={5} color="purple.400" />
                            </Center>
                            <VStack align="start" gap={0} flex={1}>
                                <Text fontWeight="800" color="app.text.primary" fontSize="md" letterSpacing="tight">
                                    {feat.name}
                                </Text>
                                <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                                    {feat.code}
                                </Text>
                            </VStack>
                        </HStack>

                        <Text fontSize="sm" color="app.text.secondary" lineClamp={2} minH="40px">
                            {feat.description || "No description provided for this module."}
                        </Text>

                        {/* Metadata Details */}
                        <HStack gap={4} fontSize="10px" color="app.text.muted" fontWeight="600">
                            <HStack gap={1}>
                                <LuCode size={12} />
                                <Text>{feat.id.split('-')[0]}...</Text>
                            </HStack>
                            {feat.created_at && (
                                <HStack gap={1}>
                                    <LuRefreshCw size={10} />
                                    <Text>{new Date(feat.created_at as string).toLocaleDateString()}</Text>
                                </HStack>
                            )}
                        </HStack>

                        <HStack justify="space-between" w="full" pt={4} borderTop="1px solid" borderColor="app.card.border">
                            <HStack gap={3}>
                                <Badge variant="solid" colorPalette={feat.is_base_feature ? "purple" : "pink"} borderRadius="lg" px={2} py={0.5}>
                                    {feat.is_base_feature ? "Included" : "Add-on"}
                                </Badge>
                                <Text fontSize="sm" fontWeight="900" color="app.text.primary">
                                    {feat.addon_price > 0 ? `${feat.currency} ${feat.addon_price}` : "Free"}
                                </Text>
                            </HStack>

                            <HStack gap={1} className="feature-actions" transition="all 0.2s" opacity={{ base: 1, md: 0.1 }} transform={{ base: "none", md: "translateX(4px)" }}>
                                <IconButton
                                    aria-label="Edit"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    onClick={() => handleEditClick(feat)}
                                    _hover={{ bg: "purple.500/10", color: "purple.400" }}
                                >
                                    <LuPencil size={14} />
                                </IconButton>
                                <IconButton
                                    aria-label="Delete"
                                    variant="ghost"
                                    size="sm"
                                    borderRadius="lg"
                                    colorPalette="red"
                                    onClick={() => handleDelete(feat.id)}
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
    ), [features, handleEditClick, handleDelete]);

    return (
        <>
            <PageLayout
                title={
                    <HStack gap={3}>
                        <Text>Features</Text>
                        {selectedAppId && (
                            <Badge colorPalette="purple" variant="subtle" size="lg" borderRadius="full" px={3} py={1} border="1px solid" borderColor="purple.500/20">
                                <HStack gap={1.5}>
                                    <Icon as={LuLayoutGrid} boxSize={3} />
                                    <Text fontSize="xs" fontWeight="700">
                                        {apps.find(a => a.id === selectedAppId)?.code}
                                    </Text>
                                </HStack>
                            </Badge>
                        )}
                    </HStack>
                }
                subtitle={
                    <Box>
                        Manage features and add-ons for {selectedAppId ? <strong>{apps.find(a => a.id === selectedAppId)?.name}</strong> : "your apps."}
                    </Box>
                }
                actions={
                    <HStack gap={4} align="flex-end">
                        {/* App Selector */}
                        <Box w="280px">
                            <Field label="Switch Application" color="app.text.secondary">
                                <PopoverRoot positioning={{ placement: "bottom-start" }}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            w="full"
                                            justifyContent="space-between"
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            h="44px"
                                            size="sm"
                                            _hover={{ bg: "rgba(255,255,255,0.04)", borderColor: "purple.500/40" }}
                                            transition="all 0.2s"
                                        >
                                            <HStack>
                                                <Icon as={LuLayoutGrid} color="purple.400" />
                                                <Text fontWeight="600">
                                                    {apps.find(a => a.id === selectedAppId)?.name || "Select Application"}
                                                </Text>
                                            </HStack>
                                            <LuChevronDown />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent bg="app.bg.primary" borderColor="app.card.border" w="320px" boxShadow="2xl" borderRadius="2xl" p={0} overflow="hidden">
                                        <Box p={3} borderBottom="1px solid" borderColor="app.card.border" bg="rgba(255,255,255,0.02)">
                                            <HStack gap={2}>
                                                <LuSearch color="var(--chakra-colors-app-text-muted)" />
                                                <Input
                                                    placeholder="Search by name or code..."
                                                    size="sm"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                            </HStack>
                                        </Box>
                                        <PopoverBody maxH="240px" overflowY="auto" p={1}>
                                            <VStack gap={1} align="stretch">
                                                {apps.filter(a =>
                                                    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    a.code.toLowerCase().includes(searchQuery.toLowerCase())
                                                ).map(app => (
                                                    <Button
                                                        key={app.id}
                                                        variant="ghost"
                                                        justifyContent="start"
                                                        size="md"
                                                        h="48px"
                                                        borderRadius="xl"
                                                        onClick={() => { setSelectedAppId(app.id); setSearchQuery(""); }}
                                                        color={selectedAppId === app.id ? "purple.400" : "app.text.secondary"}
                                                        bg={selectedAppId === app.id ? "rgba(139,92,246,0.08)" : "transparent"}
                                                        _hover={{ bg: "rgba(139,92,246,0.05)", color: "purple.400" }}
                                                    >
                                                        <VStack align="start" gap={0}>
                                                            <Text fontWeight="600" fontSize="sm">{app.name}</Text>
                                                            <Text fontSize="10px" color="app.text.muted" fontWeight="500">{app.code}</Text>
                                                        </VStack>
                                                    </Button>
                                                ))}
                                                {apps.length === 0 && (
                                                    <Center py={8}>
                                                        <Text color="app.text.muted" fontSize="sm">No apps found</Text>
                                                    </Center>
                                                )}
                                            </VStack>
                                        </PopoverBody>
                                    </PopoverContent>
                                </PopoverRoot>
                            </Field>
                        </Box>

                        {/*
                            Gradient: deep violet → soft purple → cyan accent
                            Disabled state desaturates via CSS filter — no extra state needed.
                        */}
                        <Button
                            onClick={handleAddClick}
                            disabled={!selectedAppId}
                            borderRadius="xl"
                            size="md"
                            h="44px"
                            px={6}
                            gap={2}
                            color="white"
                            fontWeight="700"
                            bg={
                                !selectedAppId
                                    ? "rgba(139,92,246,0.3)"
                                    : "linear-gradient(135deg, #7c3aed 0%, #a855f7 55%, #06b6d4 100%)"
                            }
                            boxShadow={!selectedAppId ? "none" : "0 4px 20px rgba(139,92,246,0.35)"}
                            transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
                            _hover={
                                !selectedAppId
                                    ? {}
                                    : {
                                          transform: "translateY(-2px) scale(1.02)",
                                          boxShadow: "0 8px 28px rgba(139,92,246,0.5)",
                                      }
                            }
                            _active={{ transform: "translateY(0) scale(1)", boxShadow: "none" }}
                            _disabled={{
                                opacity: 0.5,
                                filter: "saturate(0.4)",
                                cursor: "not-allowed",
                                transform: "none",
                            }}
                        >
                            <LuPlus strokeWidth={3} />
                            Create Feature
                        </Button>
                    </HStack>
                }
                onRefresh={() => fetchFeatures(selectedAppId)}
                isRefreshing={isLoading}
            >
                {!selectedAppId ? (
                    <Center py={32}>
                        <VStack gap={6} maxW="400px" textAlign="center">
                            <Center boxSize="80px" borderRadius="3xl" bg="rgba(139,92,246,0.05)" border="2px dashed" borderColor="purple.500/20">
                                <Icon as={LuLayoutGrid} boxSize={8} color="purple.400" />
                            </Center>
                            <VStack gap={2}>
                                <Heading size="lg" fontWeight="800">No App Selected</Heading>
                                <Text color="app.text.muted" fontSize="sm">
                                    Please select a SaaS application from the dropdown above to manage its specific functional modules and features.
                                </Text>
                            </VStack>
                        </VStack>
                    </Center>
                ) : isLoading ? (
                    <Center py={32}>
                        <VStack gap={4}>
                            <Spinner size="xl" color="purple.500" />
                            <Text color="app.text.muted" fontWeight="600" fontSize="sm" letterSpacing="widest">LOADING FEATURES...</Text>
                        </VStack>
                    </Center>
                ) : features.length === 0 ? (
                    <Center py={32}>
                        <VStack gap={6} maxW="400px" textAlign="center">
                            <Center boxSize="80px" borderRadius="3xl" bg="rgba(139,92,246,0.05)" border="2px dashed" borderColor="purple.500/20">
                                <Icon as={LuZap} boxSize={8} color="purple.400" />
                            </Center>
                            <VStack gap={2}>
                                <Heading size="lg" fontWeight="800">Empty Modules</Heading>
                                <Text color="app.text.muted" fontSize="sm">
                                    You haven't defined any functional features for <strong>{apps.find(a => a.id === selectedAppId)?.name}</strong> yet.
                                </Text>
                                <Button variant="ghost" size="sm" mt={2} colorPalette="purple" onClick={handleAddClick} fontWeight="700">
                                    Define your first module <LuChevronRight />
                                </Button>
                            </VStack>
                        </VStack>
                    </Center>
                ) : (
                    <Box animation="slide-up 0.4s ease-out">
                        {featureCards}
                    </Box>
                )}
            </PageLayout>

            {/* ── Drawer ───────────────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
                <DrawerBackdrop backdropFilter="blur(8px)" />
                <DrawerContent
                    bg="app.bg.primary"
                    borderLeft="1px solid"
                    borderColor="app.card.border"
                    boxShadow="-20px 0 60px rgba(0,0,0,0.5)"
                    display="flex"
                    flexDirection="column"
                    h="100dvh"
                >
                    <DrawerCloseTrigger color="app.text.muted" top={6} right={6} />
                    <DrawerHeader borderBottom="1px solid" borderColor="app.card.border" py={8} px={10}>
                        <HStack gap={5}>
                            <Center w={10} h={10} borderRadius="xl" bg="purple.500" color="white">
                                <Icon as={selectedFeature ? LuPencil : LuPlus} boxSize={5} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Heading size="xl" fontWeight="900" letterSpacing="tight" color="app.text.primary">
                                    {selectedFeature ? "Edit Feature" : "Define Module"}
                                </Heading>
                                <Text fontSize="sm" color="app.text.muted">
                                    {selectedFeature ? "Modify existing feature properties" : "Initialize new functional extension"}
                                </Text>
                            </VStack>
                        </HStack>
                    </DrawerHeader>

                    <DrawerBody py={10} px={10} overflowY="auto" flex="1" className="custom-scrollbar">
                        <form id="feature-form" onSubmit={handleSave}>
                            <VStack gap={8} align="stretch">
                                {/* Advanced App Selector (Matched with PermissionsView) */}
                                <Field label="Application Context" helperText="Deployment target for this module" color="app.text.secondary" fontWeight="600">
                                    <PopoverRoot lazyMount unmountOnExit positioning={{ placement: "bottom-start" }}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                w="full"
                                                justifyContent="space-between"
                                                bg="rgba(139,92,246,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="54px"
                                                fontWeight="600"
                                                _hover={{ borderColor: "purple.500/50", bg: "rgba(139,92,246,0.05)" }}
                                            >
                                                <HStack>
                                                    <Icon as={LuLayoutGrid} color="purple.400" />
                                                    <Text color={selectedAppId ? "app.text.primary" : "app.text.muted"}>
                                                        {apps.find(a => a.id === selectedAppId)?.name || "Select Application"}
                                                    </Text>
                                                </HStack>
                                                <LuChevronDown />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            bg="app.bg.primary"
                                            borderColor="app.card.border"
                                            p={0}
                                            w="340px"
                                            boxShadow="2xl"
                                            borderRadius="xl"
                                        >
                                            <Box p={3} borderBottom="1px solid" borderColor="app.card.border">
                                                <Group w="full">
                                                    <Input
                                                        placeholder="Search applications..."
                                                        size="sm"
                                                        value={searchQuery}
                                                        onChange={(e) => setSearchQuery(e.target.value)}
                                                        bg="rgba(255,255,255,0.03)"
                                                        borderRadius="lg"
                                                        autoFocus
                                                    />
                                                </Group>
                                            </Box>
                                            <PopoverBody maxH="240px" overflowY="auto" p={1}>
                                                <VStack gap={0} align="stretch">
                                                    {apps
                                                        .filter(app =>
                                                            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            app.code.toLowerCase().includes(searchQuery.toLowerCase())
                                                        )
                                                        .map(app => (
                                                            <Button
                                                                key={app.id}
                                                                variant="ghost"
                                                                justifyContent="start"
                                                                fontWeight="500"
                                                                size="md"
                                                                h="44px"
                                                                borderRadius="lg"
                                                                onClick={() => {
                                                                    setSelectedAppId(app.id);
                                                                    setSearchQuery("");
                                                                }}
                                                                _hover={{ bg: "rgba(139,92,246,0.1)", color: "purple.400" }}
                                                                color={selectedAppId === app.id ? "purple.400" : "app.text.secondary"}
                                                                bg={selectedAppId === app.id ? "rgba(139,92,246,0.05)" : "transparent"}
                                                            >
                                                                <VStack align="start" gap={0}>
                                                                    <Text fontSize="sm">{app.name}</Text>
                                                                    <Text fontSize="10px" color="app.text.muted">{app.code}</Text>
                                                                </VStack>
                                                            </Button>
                                                        ))}
                                                    {apps.length === 0 && (
                                                        <Text p={4} fontSize="xs" color="app.text.muted" textAlign="center">
                                                            No applications found
                                                        </Text>
                                                    )}
                                                </VStack>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </PopoverRoot>
                                </Field>

                                <Stack gap={6}>
                                    <Field label="Identification Code" helperText="e.g. 'crm:analytics', 'auth:mfa'" color="app.text.secondary">
                                        <Input
                                            name="code"
                                            defaultValue={selectedFeature?.code}
                                            placeholder="module:feature"
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            h="48px"
                                            _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                                        />
                                    </Field>

                                    <Field label="Display Label" color="app.text.secondary">
                                        <Input
                                            name="name"
                                            defaultValue={selectedFeature?.name}
                                            placeholder="e.g. Advanced CRM"
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            h="48px"
                                        />
                                    </Field>

                                    <Field label="Feature Description" color="app.text.secondary">
                                        <Textarea
                                            name="description"
                                            defaultValue={selectedFeature?.description}
                                            placeholder="Explain what functionality this feature unlocks..."
                                            bg="rgba(255,255,255,0.02)"
                                            borderColor="app.card.border"
                                            borderRadius="xl"
                                            rows={3}
                                        />
                                    </Field>

                                    <HStack gap={5}>
                                        <Field label="Add-on Price" color="app.text.secondary">
                                            <Input
                                                name="addon_price"
                                                type="number"
                                                step="0.01"
                                                defaultValue={selectedFeature?.addon_price || 0}
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="48px"
                                                textAlign="right"
                                            />
                                        </Field>
                                        <Field label="Currency" color="app.text.secondary">
                                            <NativeSelectRoot bg="rgba(255,255,255,0.02)" borderColor="app.card.border" borderRadius="xl">
                                                <NativeSelectField name="currency" defaultValue={selectedFeature?.currency || "INR"} fontWeight="700" h="48px">
                                                    <option value="INR">INR</option>
                                                    <option value="USD">USD</option>
                                                    <option value="EUR">EUR</option>
                                                </NativeSelectField>
                                            </NativeSelectRoot>
                                        </Field>
                                    </HStack>

                                    <Box p={4} bg="rgba(255,255,255,0.02)" borderRadius="xl" border="1px solid" borderColor="app.card.border">
                                        <HStack justify="space-between">
                                            <VStack align="start" gap={0}>
                                                <Text fontWeight="600" fontSize="sm">Base Module</Text>
                                                <Text fontSize="11px" color="app.text.muted">Included in standard subscription?</Text>
                                            </VStack>
                                            <Switch name="is_base_feature" defaultChecked={selectedFeature?.is_base_feature ?? true} colorPalette="purple" size="lg" />
                                        </HStack>
                                    </Box>
                                </Stack>

                                <Box
                                    p={4}
                                    bg="rgba(139,92,246,0.05)"
                                    borderRadius="xl"
                                    border="1px dashed"
                                    borderColor="purple.500/30"
                                >
                                    <HStack justify="space-between">
                                        <VStack align="start" gap={0}>
                                            <Text color="app.text.primary" fontSize="sm" fontWeight="600">Status</Text>
                                            <Text color="app.text.muted" fontSize="xs">Visible to organization admins?</Text>
                                        </VStack>
                                        <Switch
                                            name="status"
                                            defaultChecked={selectedFeature?.status === "active" || !selectedFeature}
                                            colorPalette="purple"
                                        />
                                    </HStack>
                                </Box>

                                <VStack align="stretch" gap={4} pt={4} borderTop="1px solid" borderColor="app.card.border">
                                    {selectedFeature && (
                                        <>
                                            <Text fontSize="xs" color="app.text.muted">ID: {selectedFeature.id}</Text>
                                            <Text fontSize="xs" color="app.text.muted">Created At: {selectedFeature.created_at ? new Date(selectedFeature.created_at as string).toLocaleString() : "N/A"}</Text>
                                            {selectedFeature.updated_at && (
                                                <Text fontSize="xs" color="app.text.muted">Last Updated: {new Date(selectedFeature.updated_at as string).toLocaleString()}</Text>
                                            )}
                                        </>
                                    )}
                                </VStack>
                            </VStack>
                        </form>
                    </DrawerBody>

                    <DrawerFooter borderTop="1px solid" borderColor="app.card.border" py={6} px={10}>
                        <Button
                            type="submit"
                            form="feature-form"
                            w="full"
                            colorPalette="purple"
                            size="lg"
                            borderRadius="xl"
                            h="54px"
                            boxShadow="0 8px 16px rgba(139,92,246,0.2)"
                            _active={{ transform: "scale(0.98)" }}
                        >
                            <LuSave style={{ marginRight: '8px' }} />
                            {selectedFeature ? "Update Feature" : "Generate Module"}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

FeaturesView.displayName = "FeaturesView";
export default FeaturesView;
