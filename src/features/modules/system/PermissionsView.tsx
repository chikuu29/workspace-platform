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
} from "@chakra-ui/react";
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
import {
    PopoverBody,
    PopoverContent,
    PopoverRoot,
    PopoverTrigger,
} from "@/components/ui/popover";
import { NativeSelectField, NativeSelectRoot } from "@/components/ui/native-select";
import { toaster } from "@/components/ui/toaster";
import {
    Zap,
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Shield,
    Check,
    Eye,
    Save,
    Star,
    Code,
    Search,
    ChevronDown,
    LayoutGrid,
    Lock
} from "lucide-react";
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Grid, SimpleGrid, Group, Stack } from "@chakra-ui/react";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface GlobalPermission {
    id: string;
    app_id: string;
    app_name?: string;
    code: string;
    name: string;
    description: string;
    is_active: boolean;
    is_platform_only: boolean;
}

interface SaasApp {
    id: string;
    name: string;
    code: string;
}

// ─── PermissionsView ────────────────────────────────────────────────────────────

const PermissionsView = memo(() => {
    const [permissions, setPermissions] = useState<GlobalPermission[]>([]);
    const [apps, setApps] = useState<SaasApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<GlobalPermission | null>(null);
    const [selectedAppId, setSelectedAppId] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState<string>("");

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchData = useCallback(() => {
        setIsLoading(true);

        GETAPI({
            path: "/saas/get_apps",
            isPrivateApi: true,
            serverName: 'identity'
        }).subscribe((res) => {
            if (res.success) {
                setApps(res.data || []);
            }
        });

        GETAPI({
            path: "/platform/permissions",
            isPrivateApi: true,
            serverName: 'identity'
        }).subscribe((res) => {
            if (res.success) {
                setPermissions(res.data || []);
            } else {
                toaster.create({
                    title: "Error fetching permissions",
                    description: res.message,
                    type: "error",
                });
            }
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleAddClick = useCallback(() => {
        setSelectedPermission(null);
        setSelectedAppId("");
        setSearchQuery("");
        setIsOpen(true);
    }, []);

    const handleEditClick = useCallback((perm: GlobalPermission) => {
        setSelectedPermission(perm);
        setSelectedAppId(perm.app_id);
        setSearchQuery("");
        setIsOpen(true);
    }, []);

    const handleSave = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Collect checked actions
        const actions: string[] = [];
        event.currentTarget.querySelectorAll('input[name="actions"]:checked').forEach((el: any) => {
            actions.push(el.value);
        });

        const data: any = {
            app_id: formData.get("app_id"),
            is_active: formData.get("is_active") === "on",
            is_platform_only: formData.get("is_platform_only") === "on",
            description: formData.get("description"),
        };

        if (selectedPermission) {
            data.name = formData.get("name");
            data.code = formData.get("code");
        } else {
            data.object_name = formData.get("object_name");
            data.actions = actions;
        }

        const apiCall = selectedPermission
            ? PUTAPI({ path: `/platform/permissions/${selectedPermission.id}`, data, isPrivateApi: true, serverName: 'identity' })
            : POSTAPI({ path: "/platform/permissions", data, isPrivateApi: true, serverName: 'identity' });

        apiCall.subscribe((res) => {
            if (res.success) {
                toaster.create({
                    title: selectedPermission ? "Permission Updated" : `${res.data.length} Permission(s) Created`,
                    type: "success",
                });
                fetchData();
                setIsOpen(false);
            } else {
                toaster.create({
                    title: "Error saving permission",
                    description: res.message,
                    type: "error",
                });
            }
        });
    }, [selectedPermission, fetchData]);

    const handleDelete = useCallback((id: string) => {
        if (!window.confirm("Are you sure you want to delete this permission?")) return;

        DELETEAPI({
            path: `/platform/permissions/${id}`,
            isPrivateApi: true,
            serverName: 'identity'
        }).subscribe((res) => {
            if (res.success) {
                toaster.create({ title: "Permission Deleted", type: "success" });
                fetchData();
            }
        });
    }, [fetchData]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const filteredPermissions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return permissions;
        return permissions.filter(perm =>
            perm.name.toLowerCase().includes(query) ||
            perm.code.toLowerCase().includes(query) ||
            (perm.description && perm.description.toLowerCase().includes(query))
        );
    }, [permissions, searchQuery]);

    const permissionList = useMemo(() => (
        <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }}
            gap={6}
            px={4}
        >
            {filteredPermissions.map((perm) => (
                <Card
                    key={perm.id}
                >
                    {/* Top Section */}
                    <HStack justify="space-between" align="start">
                        <VStack align="start" gap={1}>
                            <HStack>
                                <Center
                                    w={8}
                                    h={8}
                                    borderRadius="lg"
                                    bg="rgba(139,92,246,0.1)"
                                    border="1px solid"
                                    borderColor="rgba(139,92,246,0.2)"
                                >
                                    <Icon as={Shield} boxSize={4} color="purple.400" />
                                </Center>
                                <Text fontWeight="700" color="app.text.primary" fontSize="lg">
                                    {perm.name}
                                </Text>
                            </HStack>
                            <Badge colorPalette="purple" size="sm" variant="subtle" borderRadius="md">
                                {perm.code}
                            </Badge>
                        </VStack>
                        <VStack align="end" gap={1}>
                            <Badge
                                colorPalette={perm.is_active ? "green" : "red"}
                                variant="subtle"
                                borderRadius="full"
                                px={2}
                            >
                                {perm.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {perm.is_platform_only && (
                                <Badge
                                    colorPalette="orange"
                                    variant="subtle"
                                    borderRadius="full"
                                    px={2}
                                >
                                    <Icon as={Lock} boxSize={3} mr={1} />
                                    Platform Only
                                </Badge>
                            )}
                        </VStack>
                    </HStack>

                    {/* Middle Section */}
                    <Box flex="1">
                        <Text fontSize="sm" color="app.text.muted" lineClamp={2}>
                            {perm.description || "No description provided."}
                        </Text>
                    </Box>

                    {/* Bottom Section */}
                    <HStack justify="space-between" align="center" pt={4} borderTop="1px solid" borderColor="app.card.border" mt="auto">
                        <Badge variant="subtle" colorPalette="cyan" borderRadius="md" size="sm">
                            <Icon as={LayoutGrid} mr={1} />
                            {apps.find(a => a.id === perm.app_id)?.code || "System"}
                        </Badge>

                        <HStack gap={1}>
                            <IconButton
                                aria-label="Edit"
                                variant="ghost"
                                size="sm"
                                color="app.text.muted"
                                _hover={{ color: "purple.400", bg: "purple.500/10" }}
                                onClick={() => handleEditClick(perm)}
                            >
                                <Pencil />
                            </IconButton>
                            <IconButton
                                aria-label="Delete"
                                variant="ghost"
                                size="sm"
                                color="app.text.muted"
                                _hover={{ color: "red.400", bg: "red.500/10" }}
                                onClick={() => handleDelete(perm.id)}
                            >
                                <Trash2 />
                            </IconButton>
                        </HStack>
                    </HStack>
                </Card>
            ))}
        </Grid>
    ), [filteredPermissions, apps, handleEditClick, handleDelete]);

    return (
        <>
            {/* ── Header & Content ───────────────────────────────────────────────────── */}
            <PageLayout
                title="Global Permissions"
                subtitle="Define and manage access controls across all your apps."
                icon={Shield}
                actions={
                    <HStack gap={3}>

                        <Button
                            colorPalette="purple"
                            borderRadius="xl"
                            size="md"
                            onClick={handleAddClick}
                            boxShadow="0 4px 12px rgba(139,92,246,0.3)"
                        >
                            <Plus style={{ marginRight: '8px' }} /> Create Permission
                        </Button>
                    </HStack>
                }
                searchPlaceholder="Search permissions by name, code, or description..."
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                onRefresh={fetchData}
                isRefreshing={isLoading}
            >
                {isLoading && permissions.length === 0 ? (
                    <Center py={20}><Spinner color="purple.500" /></Center>
                ) : filteredPermissions.length === 0 ? (
                    <Center py={20}>
                        <VStack gap={3}>
                            <Icon as={Search} boxSize={8} color="app.text.muted" />
                            <Text color="app.text.muted">No permissions found matching your search.</Text>
                        </VStack>
                    </Center>
                ) : (
                    permissionList
                )}
            </PageLayout>

            {/* ── Drawer ───────────────────────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
                <DrawerBackdrop backdropFilter="blur(8px)" />
                <DrawerContent
                    bg="app.bg.primary"
                    borderLeft="1px solid"
                    borderColor="app.card.border"
                    boxShadow="-20px 0 40px rgba(0,0,0,0.4)"
                    display="flex"
                    flexDirection="column"
                    h="100dvh"
                >
                    <DrawerCloseTrigger color="app.text.muted" />
                    <DrawerHeader
                        borderBottom="1px solid"
                        borderColor="app.card.border"
                        pb={4}
                    >
                        <HStack gap={3}>
                            <Center w={10} h={10} borderRadius="xl" bg="purple.500" color="white">
                                <Icon as={selectedPermission ? Pencil : Plus} boxSize={5} />
                            </Center>
                            <VStack align="start" gap={0}>
                                <Heading size="md" color="app.text.primary">
                                    {selectedPermission ? "Edit Permission" : "Register Permissions"}
                                </Heading>
                                <Text fontSize="xs" color="app.text.muted">
                                    {selectedPermission ? "Modify existing permission details" : "Automatically generate standard feature codes"}
                                </Text>
                            </VStack>
                        </HStack>
                    </DrawerHeader>

                    <DrawerBody py={8} px={8} overflowY="auto" flex="1" className="custom-scrollbar">
                        <form id="permission-form" onSubmit={handleSave}>
                            <VStack gap={8} align="stretch">
                                {/* App Selection */}
                                <Field label="Application Scope" helperText="Which application does this belong to?" color="app.text.secondary">
                                    <input type="hidden" name="app_id" value={selectedAppId} />
                                    <PopoverRoot positioning={{ placement: "bottom-start" }}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                w="full"
                                                justifyContent="space-between"
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                                h="48px"
                                                _hover={{ bg: "rgba(255,255,255,0.04)" }}
                                                disabled={!!selectedPermission}
                                            >
                                                <HStack>
                                                    <Icon as={LayoutGrid} color="purple.400" />
                                                    <Text color={selectedAppId ? "app.text.primary" : "app.text.muted"}>
                                                        {apps.find(a => a.id === selectedAppId)?.name || "Select Application"}
                                                    </Text>
                                                </HStack>
                                                <ChevronDown />
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

                                {!selectedPermission ? (
                                    <>
                                        {/* Structured Creation */}
                                        <Stack gap={6}>
                                            <Field label="Object / Module Name" helperText="e.g. 'member', 'invoice', 'project'" color="app.text.secondary">
                                                <Input
                                                    name="object_name"
                                                    placeholder="Enter module name..."
                                                    bg="rgba(255,255,255,0.02)"
                                                    borderColor="app.card.border"
                                                    borderRadius="xl"
                                                    h="48px"
                                                    _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
                                                />
                                            </Field>

                                            <VStack align="stretch" gap={3}>
                                                <Text color="app.text.secondary" fontSize="sm" fontWeight="600">
                                                    Allowed Actions
                                                </Text>
                                                <SimpleGrid columns={2} gap={4}>
                                                    {[
                                                        { val: "*", lab: "All Access (*)", icon: Star, colorScheme: "yellow" }
                                                    ].map((item) => (
                                                        <Checkbox
                                                            key={item.val}
                                                            value={item.val}
                                                            name="actions"
                                                            colorPalette={item.colorScheme as any}
                                                            variant="subtle"
                                                            _hover={{ bg: "rgba(255,255,255,0.03)" }}
                                                            borderRadius="lg"
                                                            p={3}
                                                            border="1px solid"
                                                            borderColor="app.card.border"
                                                            transition="all 0.2s"
                                                        >
                                                            <HStack gap={2}>
                                                                <Icon as={item.icon} boxSize={3.5} />
                                                                <Text fontSize="sm" fontWeight="500">{item.lab}</Text>
                                                            </HStack>
                                                        </Checkbox>
                                                    ))}
                                                </SimpleGrid>
                                            </VStack>
                                        </Stack>
                                    </>
                                ) : (
                                    <>
                                        {/* Classic Edit Mode */}
                                        <Field label="Permission Code" color="app.text.secondary">
                                            <Input
                                                name="code"
                                                defaultValue={selectedPermission.code}
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                            />
                                        </Field>
                                        <Field label="Display Name" color="app.text.secondary">
                                            <Input
                                                name="name"
                                                defaultValue={selectedPermission.name}
                                                bg="rgba(255,255,255,0.02)"
                                                borderColor="app.card.border"
                                                borderRadius="xl"
                                            />
                                        </Field>
                                    </>
                                )}

                                <Field label="Description (Optional)" color="app.text.secondary">
                                    <Textarea
                                        name="description"
                                        defaultValue={selectedPermission?.description}
                                        placeholder="Briefly describe the purpose..."
                                        bg="rgba(255,255,255,0.02)"
                                        borderColor="app.card.border"
                                        borderRadius="xl"
                                        rows={3}
                                    />
                                </Field>

                                <VStack gap={4} align="stretch">
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
                                                name="is_active"
                                                defaultChecked={selectedPermission?.is_active ?? true}
                                                colorPalette="purple"
                                            />
                                        </HStack>
                                    </Box>

                                    <Box
                                        p={4}
                                        bg="rgba(251,146,60,0.05)"
                                        borderRadius="xl"
                                        border="1px dashed"
                                        borderColor="orange.500/30"
                                    >
                                        <HStack justify="space-between">
                                            <VStack align="start" gap={0}>
                                                <HStack gap={2}>
                                                    <Icon as={Lock} color="orange.400" boxSize={4} />
                                                    <Text color="app.text.primary" fontSize="sm" fontWeight="600">Platform Only</Text>
                                                </HStack>
                                                <Text color="app.text.muted" fontSize="xs">
                                                    Restrict this permission to platform administrators only.
                                                    Organization users will not be able to assign it.
                                                </Text>
                                            </VStack>
                                            <Switch
                                                name="is_platform_only"
                                                defaultChecked={selectedPermission?.is_platform_only ?? false}
                                                colorPalette="orange"
                                            />
                                        </HStack>
                                    </Box>
                                </VStack>
                            </VStack>
                        </form>
                    </DrawerBody>

                    <DrawerFooter borderTop="1px solid" borderColor="app.card.border" py={6} px={8}>
                        <Button
                            type="submit"
                            form="permission-form"
                            w="full"
                            colorPalette="purple"
                            size="lg"
                            borderRadius="xl"
                            h="54px"
                            boxShadow="0 8px 16px rgba(139,92,246,0.2)"
                            _active={{ transform: "scale(0.98)" }}
                        >
                            <Save style={{ marginRight: '8px' }} />
                            {selectedPermission ? "Update Permission" : "Generate Permissions"}
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

PermissionsView.displayName = "PermissionsView";
export default PermissionsView;
