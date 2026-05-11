import React, { memo, useCallback, useEffect, useState } from "react";
import {
    Box,
    Flex,
    Heading,
    Text,
    VStack,
    HStack,
    Icon,
    IconButton,
    Badge,
    Button,
    Avatar,
} from "@chakra-ui/react";
import { Shield, RefreshCw, Mail, ShieldAlert } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { GETAPI, PUTAPI } from "@/app/api";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";
import { UserDirectoryGrid } from "@/core/widgets/UserDirectoryGrid";
import { UserCardAction, UserCardData } from "@/core/widgets/UserCard";
import {
    DrawerRoot,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    DrawerBackdrop,
    DrawerCloseTrigger,
} from "@/components/ui/drawer";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCESS_ACTIONS: UserCardAction[] = [
    {
        label: "Manage Access",
        icon: <ShieldAlert />,
        colorPalette: "purple",
        actionType: "MANAGE_ACCESS",
    },
];

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface Role {
    id: number;
    role_name: string;
}

// ─── OrganizationAccessView ──────────────────────────────────────────────────

const OrganizationAccessView = memo(() => {
    const [users, setUsers] = useState<UserCardData[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserCardData | null>(null);
    const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const organizations = useSelector((state: RootState) => state.organizations);
    const organizationName = organizations?.organization?.name || "Organization";

    const fetchData = useCallback(() => {
        setIsLoading(true);
        GETAPI({
            path: "/account/organization/users",
            isPrivateApi: true,
serverName:'identity'
        }).subscribe({
            next: (res: any) => {
                if (res.success) {
                    setUsers(res.data || []);
                } else {
                    toaster.create({ title: "Error", description: res.message || "Failed to fetch users", type: "error" });
                }
                setIsLoading(false);
            },
            error: (err) => {
                console.error("Fetch users error:", err);
                setIsLoading(false);
            }
        });

        GETAPI({
            path: "/account/roles",
            isPrivateApi: true,
serverName:'identity'
        }).subscribe((res: any) => {
            if (res.success) setAvailableRoles(res.data || []);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAction = useCallback((actionType: string, user: UserCardData) => {
        if (actionType === "MANAGE_ACCESS") {
            setSelectedUser(user);
            setSelectedRoleIds(user.roles?.map((r: any) => r.id) || []);
            setIsOpen(true);
        }
    }, []);

    const handleSaveAccess = useCallback(() => {
        if (!selectedUser) return;
        setIsSaving(true);

        PUTAPI({
            path: `/account/users/${selectedUser.id}/roles`,
            data: { role_ids: selectedRoleIds },
            isPrivateApi: true,
serverName:'identity'
        }).subscribe({
            next: (res: any) => {
                if (res.success) {
                    toaster.create({ title: "Success", description: "User access updated successfully", type: "success" });
                    fetchData();
                    setIsOpen(false);
                } else {
                    toaster.create({ title: "Error", description: res.message || "Failed to update roles", type: "error" });
                }
                setIsSaving(false);
            },
            error: (err) => {
                toaster.create({ title: "Error", description: "Network error", type: "error" });
                setIsSaving(false);
            }
        });
    }, [selectedUser, selectedRoleIds, fetchData]);

    return (
        <PageLayout
            title="Organization Access"
            subtitle={
                <>
                    Select available users and assign security roles for{" "}
                    <Text as="span" fontWeight="700" color="app.text.accent">{organizationName}</Text>
                </>
            }
        >
            <VStack gap={8} align="stretch">
                <UserDirectoryGrid
                    users={users}
                    isLoading={isLoading}
                    actions={ACCESS_ACTIONS}
                    onAction={handleAction}
                    statusField="is_active"
                    toolbarEnd={
                        <IconButton
                            aria-label="Refresh users"
                            size="sm"
                            variant="outline"
                            borderRadius="full"
                            onClick={fetchData}
                            loading={isLoading}
                        >
                            <RefreshCw />
                        </IconButton>
                    }
                />
            </VStack>

            {/* ── Access Management Drawer ─────────────────────────────────── */}
            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
                <DrawerBackdrop backdropFilter="blur(12px)" bg="black/40" />
                <DrawerContent
                    // bg="rgba(15, 15, 20, 0.85)"
                    backdropFilter="blur(24px)"
                    borderLeft="1px solid"
                    borderColor="rgba(255, 255, 255, 0.08)"
                    boxShadow="-20px 0 80px rgba(0,0,0,0.5)"
                    position="relative"
                >
                    {/* Subtle top reflection glow */}
                    {/* <Box
                        position="absolute" top={0} left={0} right={0} h="1px"
                        bgGradient="linear(to-r, transparent, rgba(255,255,255,0.1), transparent)"
                    /> */}

                    <DrawerCloseTrigger color="app.text.muted" mt={3} mr={2} />

                    <DrawerHeader borderBottom="1px solid" borderColor="rgba(255,255,255,0.06)" pb={6} pt={8}>
                        <VStack align="start" gap={2}>
                            <Badge colorPalette="purple" variant="subtle" borderRadius="full" px={3} py={0.5} fontSize="2xs">Security Management</Badge>
                            <Heading size="lg" color="white" fontWeight="800" letterSpacing="-0.5px">User Access Control</Heading>
                            <Text fontSize="xs" color="app.text.muted" fontWeight="500">Configure multi-role permissions for your team.</Text>
                        </VStack>
                    </DrawerHeader>

                    <DrawerBody py={8} className="custom-scrollbar">
                        {selectedUser && (
                            <VStack align="stretch" gap={10}>
                                {/* User Info Header — Glass Card */}
                                <HStack
                                    gap={4} p={5}
                                    // bg="rgba(255, 255, 255, 0.03)"
                                    borderRadius="2xl"
                                    border="1px solid"
                                    borderColor="rgba(255, 255, 255, 0.06)"
                                    boxShadow="inner"
                                >
                                    <Avatar.Root size="xl" boxShadow="2xl">
                                        <Avatar.Fallback name={typeof selectedUser.username === "string" ? selectedUser.username : ""} />
                                    </Avatar.Root>
                                    <VStack align="start" gap={0}>
                                        <Text fontWeight="800" color="white" fontSize="lg" letterSpacing="-0.3px">
                                            {selectedUser.first_name} {selectedUser.last_name}
                                        </Text>
                                        <HStack fontSize="xs" color="app.text.muted" fontWeight="600">
                                            <Mail size={12} />
                                            <Text>{selectedUser.email}</Text>
                                        </HStack>
                                    </VStack>
                                </HStack>

                                <Box>
                                    <HStack justify="space-between" mb={5} align="flex-end">
                                        <VStack align="start" gap={0}>
                                            <Text fontWeight="800" color="white" fontSize="sm" textTransform="uppercase" letterSpacing="0.05em">Available Roles</Text>
                                            <Text fontSize="2xs" color="app.text.muted">Select one or more roles to assign</Text>
                                        </VStack>
                                        <Badge colorPalette="purple" variant="solid" borderRadius="full" px={2}>{availableRoles.length}</Badge>
                                    </HStack>

                                    <VStack align="stretch" gap={3}>
                                        {availableRoles.map(role => {
                                            const isSelected = selectedRoleIds.includes(role.id);
                                            return (
                                                <Box
                                                    key={role.id}
                                                    p={4}
                                                    borderRadius="xl"
                                                    border="1px solid"
                                                    borderColor={isSelected ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.06)"}
                                                    bg={isSelected ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)"}
                                                    transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
                                                    cursor="pointer"
                                                    _hover={{ bg: isSelected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)", borderColor: isSelected ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.15)" }}
                                                    onClick={() => {
                                                        if (isSelected) setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id));
                                                        else setSelectedRoleIds([...selectedRoleIds, role.id]);
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => { }} // Controlled via Box click
                                                        colorPalette="purple"
                                                        size="lg"
                                                    >
                                                        <VStack align="start" gap={1} ml={3}>
                                                            <Text fontWeight="700" fontSize="sm" color={isSelected ? "white" : "app.text.secondary"}>
                                                                {role.role_name}
                                                            </Text>
                                                            <Text fontSize="2xs" color="app.text.muted" fontWeight="500">
                                                                {role.role_name === "Root Admin" ? "Full administrative control" : "Standard organization access"}
                                                            </Text>
                                                        </VStack>
                                                    </Checkbox>
                                                </Box>
                                            );
                                        })}
                                    </VStack>
                                </Box>
                            </VStack>
                        )}
                    </DrawerBody>

                    <DrawerFooter borderTop="1px solid" borderColor="rgba(255,255,255,0.06)" p={8} >
                        <HStack w="full" gap={4}>
                            <Button
                                variant="ghost"
                                flex={1}
                                borderRadius="2xl"
                                color="app.text.muted"
                                _hover={{ bg: "rgba(255,255,255,0.05)", color: "white" }}
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                flex={2}
                                bg="linear-gradient(135deg, #6366f1, #a855f7)"
                                color="white !important"
                                borderRadius="2xl"
                                fontWeight="800"
                                fontSize="sm"
                                letterSpacing="0.02em"
                                loading={isSaving}
                                onClick={handleSaveAccess}
                                boxShadow="0 8px 24px -6px rgba(99,102,241,0.5)"
                                _hover={{ filter: "brightness(1.15)", transform: "translateY(-2px)", boxShadow: "0 12px 32px -8px rgba(99,102,241,0.6)" }}
                                _active={{ transform: "translateY(0)" }}
                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                            >
                                <Text color="white">Sync Permissions</Text>
                            </Button>
                        </HStack>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </PageLayout>
    );
});

OrganizationAccessView.displayName = "OrganizationAccessView";
export default OrganizationAccessView;
