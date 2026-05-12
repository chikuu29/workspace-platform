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
    Spinner,
    Center,
    Avatar,
} from "@chakra-ui/react";
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
import { toaster } from "@/components/ui/toaster";
import UIPermissionGuard from "@/core/guards/UIPermissionGuard";
import { Users, Pencil, RefreshCw } from "lucide-react";
import { GETAPI, PUTAPI } from "@/app/api";
import { PageLayout } from "@/core/components/PageLayout";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    roles?: Role[];
}

interface Role {
    id: number;
    role_name: string;
}

// ─── OrganizationUsersView ─────────────────────────────────────────────────────────

const OrganizationUsersView = memo(() => {
    const [users, setUsers] = useState<User[]>([]);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [selectedUserRoles, setSelectedUserRoles] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // ── Data Fetching ────────────────────────────────────────────────────────

    const fetchData = useCallback(() => {
        setIsLoading(true);

        // Fetch organization users via platform user management (filtered by backend per organization-admin logic)
        // In this architecture, we use the standard user list but the backend scopes it.
        GETAPI({
            path: "/platform/users",
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) setUsers(res.data || []);
            setIsLoading(false);
        });

        // Fetch organization roles
        GETAPI({
            path: "/account/roles",
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) setAvailableRoles(res.data || []);
        });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ────────────────────────────────────────────────────────────

    const handleEditClick = useCallback((user: User) => {
        setSelectedUser(user);
        setSelectedUserRoles(user.roles?.map(r => r.id) || []);
        setIsOpen(true);
    }, []);

    const handleSave = useCallback(() => {
        if (!selectedUser) return;

        PUTAPI({
            path: `/account/users/${selectedUser.id}/roles`,
            data: { role_ids: selectedUserRoles },
            isPrivateApi: true,
        }).subscribe((res) => {
            if (res.success) {
                toaster.create({ title: "User Roles Updated", type: "success" });
                fetchData();
                setIsOpen(false);
            }
        });
    }, [selectedUser, selectedUserRoles, fetchData]);

    // ── Render Helpers ──────────────────────────────────────────────────────

    const userList = useMemo(() => (
        <Table.Root size="md" variant="line">
            <Table.Header>
                <Table.Row borderBottom="1px solid" borderColor="app.card.border">
                    <Table.ColumnHeader color="app.text.muted">User</Table.ColumnHeader>
                    <Table.ColumnHeader color="app.text.muted">username</Table.ColumnHeader>
                    <Table.ColumnHeader color="app.text.muted">Roles</Table.ColumnHeader>
                    <Table.ColumnHeader color="app.text.muted" textAlign="right">Actions</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {users.map((user) => (
                    <Table.Row key={user.id} _hover={{ bg: "rgba(255,255,255,0.02)" }}>
                        <Table.Cell>
                            <HStack gap={3}>
                                <Avatar.Root size="xs">
                                    <Avatar.Fallback name={typeof user.username === "string" ? user.username : ""} />
                                </Avatar.Root>
                                <VStack align="start" gap={0}>
                                    <Text fontWeight="600" color="app.text.primary">{user.first_name} {user.last_name}</Text>
                                    <Text fontSize="xs" color="app.text.muted">{user.email}</Text>
                                </VStack>
                            </HStack>
                        </Table.Cell>
                        <Table.Cell color="app.text.secondary" fontSize="sm">{user.username}</Table.Cell>
                        <Table.Cell>
                            <HStack gap={1} wrap="wrap">
                                {user.roles?.map(role => (
                                    <Badge key={role.id} variant="subtle" colorPalette="green" borderRadius="md" fontSize="2xs">
                                        {role.role_name}
                                    </Badge>
                                ))}
                            </HStack>
                        </Table.Cell>
                        <Table.Cell textAlign="right">
                            <UIPermissionGuard permissions={["ACCOUNT.ROLES.ASSIGN"]}>
                                <IconButton variant="ghost" size="xs" onClick={() => handleEditClick(user)}>
                                    <Pencil />
                                </IconButton>
                            </UIPermissionGuard>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    ), [users, handleEditClick]);

    return (
        <>
            <PageLayout
                title="Team"
                subtitle="Manage organization members and their access."
                onRefresh={fetchData}
                isRefreshing={isLoading}
            >
                {isLoading ? <Center py={20}><Spinner /></Center> : userList}
            </PageLayout>

            <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
                <DrawerBackdrop backdropFilter="blur(4px)" />
                <DrawerContent
                    bg="app.bg.primary"
                    display="flex"
                    flexDirection="column"
                    h="100dvh"
                >
                    <DrawerCloseTrigger color="app.text.muted" />
                    <DrawerHeader color="app.text.primary" borderBottom="1px solid" borderColor="app.card.border">Manage User Access</DrawerHeader>
                    <DrawerBody py={6} overflowY="auto" flex="1" className="custom-scrollbar">
                        <VStack gap={6} align="stretch">
                            <Box>
                                <Text fontWeight="700" color="app.text.primary">{selectedUser?.first_name} {selectedUser?.last_name}</Text>
                                <Text fontSize="xs" color="app.text.muted">{selectedUser?.email}</Text>
                            </Box>

                            <Box>
                                <Text mb={3} color="app.text.secondary" fontSize="sm" fontWeight="600">Assigned Roles</Text>
                                <VStack align="start" gap={3}>
                                    {availableRoles.map(role => (
                                        <Checkbox
                                            key={role.id}
                                            checked={selectedUserRoles.includes(role.id)}
                                            onCheckedChange={(e) => {
                                                if (e.checked) setSelectedUserRoles([...selectedUserRoles, role.id]);
                                                else setSelectedUserRoles(selectedUserRoles.filter(id => id !== role.id));
                                            }}
                                        >
                                            <Text fontSize="sm" ml={2}>{role.role_name}</Text>
                                        </Checkbox>
                                    ))}
                                </VStack>
                            </Box>
                        </VStack>
                    </DrawerBody>
                    <DrawerFooter borderTop="1px solid" borderColor="app.card.border" p={6}>
                        <Button w="full" colorPalette="green" size="lg" borderRadius="xl" onClick={handleSave}>Save Assignments</Button>
                    </DrawerFooter>
                </DrawerContent>
            </DrawerRoot>
        </>
    );
});

export default OrganizationUsersView;
