import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Badge,
  IconButton,
  Input,
  Textarea,
  Spinner,
  Center,
  Grid,
  GridItem,
  Flex,
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
import { toaster } from "@/components/ui/toaster";
import {
  LuShieldCheck,
  LuPlus,
  LuPencil,
  LuTrash2,
  LuShield,
  LuFileText,
  LuUsers,
  LuLock,
} from "react-icons/lu";
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";
import { Checkbox } from "@/components/ui/checkbox";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import { Tooltip } from "@/components/ui/tooltip";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogCloseTrigger,
} from "@/components/ui/dialog";
import UIPermissionGuard from "@/core/guards/UIPermissionGuard";

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface PolicyStatement {
  id: string;
  effect: "ALLOW" | "DENY";
  permissions?: any[];
}

interface Policy {
  id: string;
  name: string;
  policy_type: string;
  statements?: PolicyStatement[];
}

interface Role {
  id: number;
  role_name: string;
  description?: string;
  is_system_role: boolean;
  is_active: boolean;
  policies?: Policy[];
}

interface RoleFormValues {
  role_name: string;
  description: string;
}

// ─── Deterministic gradient per role name ────────────────────────────────────

const ROLE_GRADIENTS = [
  "linear-gradient(135deg, #6366f1, #8b5cf6)",
  "linear-gradient(135deg, #3b82f6, #6366f1)",
  "linear-gradient(135deg, #10b981, #3b82f6)",
  "linear-gradient(135deg, #f59e0b, #ef4444)",
  "linear-gradient(135deg, #8b5cf6, #ec4899)",
  "linear-gradient(135deg, #06b6d4, #3b82f6)",
  "linear-gradient(135deg, #f97316, #f59e0b)",
  "linear-gradient(135deg, #ef4444, #f97316)",
];

const getGradient = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return ROLE_GRADIENTS[Math.abs(h) % ROLE_GRADIENTS.length];
};

// ─── RoleCard ────────────────────────────────────────────────────────────────

const MAX_DISPLAY_POLICIES = 3;

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (id: number) => void;
}

/**
 * RoleCard — glassmorphic card with gradient accent strip.
 * Shows role name, type badge, attached policies, and actions.
 */
const RoleCard = memo(({ role, onEdit, onDelete }: RoleCardProps) => {
  const gradient = getGradient(role.role_name);
  const policies = role.policies ?? [];
  const visiblePolicies = policies.slice(0, MAX_DISPLAY_POLICIES);
  const extraCount = policies.length - MAX_DISPLAY_POLICIES;

  const handleEdit = useCallback(() => {
    onEdit(role);
  }, [onEdit, role]);

  const handleDelete = useCallback(() => {
    onDelete(role.id);
  }, [onDelete, role.id]);

  return (
    <Card
      boxShadow="app.shadow.glass-glow"
      p={0}
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
        borderColor: "rgba(99,102,241,0.4)",
      }}
    >
      {/* ── Gradient accent strip ─────────────────────────────────── */}
      <Box h="4px" bgGradient={gradient} />

      <VStack gap={0} align="stretch" p={5}>
        {/* ── Header ──────────────────────────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={3}>
          <HStack gap={3} flex={1} overflow="hidden">
            {/* Role icon */}
            <Box
              w="40px"
              h="40px"
              borderRadius="xl"
              bgGradient={gradient}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
              boxShadow="0 4px 12px -4px rgba(99,102,241,0.4)"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="2px"
                left="4px"
                right="4px"
                h="8px"
                borderRadius="full"
                bg="rgba(255,255,255,0.22)"
              />
              <Icon as={LuShieldCheck} boxSize={4} color="white" zIndex={1} />
            </Box>

            <VStack gap={0} align="start" overflow="hidden">
              <Text
                fontWeight="700"
                fontSize="sm"
                color="app.text.primary"
                letterSpacing="-0.2px"
                lineClamp={1}
                title={role.role_name}
              >
                {role.role_name}
              </Text>
              {role.description && (
                <Text
                  fontSize="2xs"
                  color="app.text.muted"
                  lineClamp={1}
                  title={role.description}
                >
                  {role.description}
                </Text>
              )}
            </VStack>
          </HStack>

          {/* Type + Status badges */}
          <HStack gap={1.5} flexShrink={0} ml={2}>
            <Badge
              variant="subtle"
              colorPalette={role.is_system_role ? "blue" : "purple"}
              borderRadius="full"
              px={2.5}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {role.is_system_role ? "System" : "Custom"}
            </Badge>
            <Badge
              variant="subtle"
              colorPalette={role.is_active ? "green" : "red"}
              borderRadius="full"
              px={2}
              py={0.5}
              fontSize="2xs"
              fontWeight="700"
            >
              {role.is_active ? "Active" : "Inactive"}
            </Badge>
          </HStack>
        </Flex>

        {/* ── Attached Policies ───────────────────────────────────── */}
        <Box mb={4}>
          <HStack gap={1.5} mb={2}>
            <Icon as={LuFileText} boxSize={3} color="app.text.muted" />
            <Text
              fontSize="2xs"
              fontWeight="700"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.muted"
            >
              Policies ({policies.length})
            </Text>
          </HStack>

          {policies.length === 0 ? (
            <Box
              py={3}
              px={4}
              borderRadius="lg"
              bg="rgba(99,102,241,0.04)"
              border="1px dashed"
              borderColor="app.card.border"
              textAlign="center"
            >
              <Text fontSize="2xs" color="app.text.muted" fontWeight="500">
                No policies attached — assign via Policy Management
              </Text>
            </Box>
          ) : (
            <HStack wrap="wrap" gap={1.5}>
              {visiblePolicies.map((policy) => (
                <Badge
                  key={policy.id}
                  variant="subtle"
                  colorPalette="indigo"
                  borderRadius="full"
                  px={2.5}
                  py={0.5}
                  fontSize="2xs"
                  fontWeight="600"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Icon as={LuLock} boxSize={2.5} />
                  {policy.name}
                </Badge>
              ))}
              {extraCount > 0 && (
                <Tooltip content={policies.slice(MAX_DISPLAY_POLICIES).map((p) => p.name).join(", ")}>
                  <Badge
                    variant="subtle"
                    colorPalette="gray"
                    borderRadius="full"
                    px={2.5}
                    py={0.5}
                    fontSize="2xs"
                    fontWeight="600"
                    cursor="default"
                  >
                    +{extraCount} more
                  </Badge>
                </Tooltip>
              )}
            </HStack>
          )}
        </Box>

        {/* ── Actions Footer ─────────────────────────────────────── */}
        <Box borderTop="1px solid" borderColor="app.divider" pt={3}>
          <Flex align="center" justify="space-between">
            <HStack gap={1}>
              {/* <UIPermissionGuard permissions={["ACCOUNT.ROLES.EDIT"]}> */}
              <Tooltip content="Edit Role">
                <IconButton
                  variant="ghost"
                  size="xs"
                  borderRadius="lg"
                  onClick={handleEdit}
                  aria-label="Edit role"
                  color="app.text.accent"
                  _hover={{ bg: "rgba(99,102,241,0.08)" }}
                >
                  <LuPencil />
                </IconButton>
              </Tooltip>
              {/* </UIPermissionGuard> */}
              {!role.is_system_role && (
                // <UIPermissionGuard permissions={["ACCOUNT.ROLES.DELETE"]}>
                <Tooltip content="Delete Role">
                  <IconButton
                    variant="ghost"
                    size="xs"
                    borderRadius="lg"
                    colorPalette="red"
                    onClick={handleDelete}
                    aria-label="Delete role"
                    _hover={{ bg: "rgba(239,68,68,0.08)" }}
                  >
                    <LuTrash2 />
                  </IconButton>
                </Tooltip>
                // </UIPermissionGuard>
              )}
            </HStack>

            {role.is_system_role && (
              <HStack gap={1}>
                <Icon as={LuLock} boxSize={3} color="app.text.muted" />
                <Text fontSize="2xs" color="app.text.muted" fontWeight="600">
                  Protected
                </Text>
              </HStack>
            )}
          </Flex>
        </Box>
      </VStack>
    </Card>
  );
});

RoleCard.displayName = "RoleCard";

// ─── OrganizationRolesView ───────────────────────────────────────────────────

const OrganizationRolesView = memo(() => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [availablePolicies, setAvailablePolicies] = useState<Policy[]>([]);
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([]);

  // Policy Details Preview State
  const [previewPolicy, setPreviewPolicy] = useState<Policy | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ── React Hook Form ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    defaultValues: { role_name: "", description: "" },
  });

  // ── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(() => {
    setIsLoading(true);
    GETAPI({
      path: "/account/roles",
      isPrivateApi: true,
    }).subscribe((res) => {
      if (res.success) setRoles(res.data || []);

      GETAPI({
        path: "/account/policies",
        isPrivateApi: true,
      }).subscribe((policyRes: any) => {
        if (policyRes.success) setAvailablePolicies(policyRes.data || []);
        setIsLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Global State ─────────────────────────────────────────────────────────
  const { user_type } = useSelector((state: RootState) => state.rbac);
  const isPlatformUser = user_type === "SYSTEM";
  console.log("isPlatformUser", isPlatformUser);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddClick = useCallback(() => {
    setSelectedRole(null);
    setSelectedPolicyIds([]);
    reset({ role_name: "", description: "" });
    setIsOpen(true);
  }, [reset]);

  const handleEditClick = useCallback((role: Role) => {
    setSelectedRole(role);
    setSelectedPolicyIds(role.policies?.map(p => p.id) || []);
    reset({ role_name: role.role_name, description: role.description || "" });
    setIsOpen(true);
  }, [reset]);

  const handleSave = useCallback(
    (data: RoleFormValues) => {
      const { role_name, description } = data;

      if (!role_name?.trim()) {
        toaster.create({ title: "Role name is required", type: "error" });
        return;
      }

      const attachPolicies = (roleId: number) => {
        PUTAPI({
          path: `/account/roles/${roleId}/policies`,
          data: { policy_ids: selectedPolicyIds },
          isPrivateApi: true,
        }).subscribe((res) => {
          if (res.success) {
            toaster.create({ title: "Role saved successfully", type: "success" });
            fetchData();
            setIsOpen(false);
          } else {
            toaster.create({ title: res.message || "Failed to attach policies", type: "error" });
          }
        });
      };

      if (selectedRole) {
        // Update existing role
        PUTAPI({
          path: `/account/roles/${selectedRole.id}`,
          data: { role_name: role_name.trim(), description: description?.trim() || undefined },
          isPrivateApi: true,
        }).subscribe((res) => {
          if (res.success) {
            attachPolicies(selectedRole.id);
          } else {
            toaster.create({ title: res.message || "Failed to update role", type: "error" });
          }
        });
      } else {
        // Create new role
        POSTAPI({
          path: "/account/roles",
          data: { role_name: role_name.trim(), description: description?.trim() || undefined },
          isPrivateApi: true,
        }).subscribe((res) => {
          if (res.success && res.data?.id) {
            attachPolicies(res.data.id);
          } else {
            toaster.create({ title: res.message || "Failed to create role", type: "error" });
          }
        });
      }
    },
    [fetchData, selectedRole, selectedPolicyIds]
  );

  const handleDelete = useCallback(
    (id: number) => {
      if (!window.confirm("Are you sure you want to delete this role? This action cannot be undone.")) return;
      DELETEAPI({
        path: `/account/roles/${id}`,
        isPrivateApi: true,
      }).subscribe((res) => {
        if (res.success) {
          toaster.create({ title: "Role Deleted", type: "success" });
          fetchData();
        }
      });
    },
    [fetchData]
  );

  // ── Derived ────────────────────────────────────────────────────────────

  const systemRoles = useMemo(() => roles.filter((r) => r.is_system_role), [roles]);
  const customRoles = useMemo(() => roles.filter((r) => !r.is_system_role), [roles]);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      <PageLayout
        title="Organization Roles"
        subtitle="Manage roles for your organization. Assign permissions through policies."
        actions={
          // <UIPermissionGuard permissions={["ACCOUNT.ROLES.CREATE"]}>
          <Button
            colorPalette="purple"
            borderRadius="xl"
            size="sm"
            onClick={handleAddClick}
          >
            <LuPlus style={{ marginRight: "6px" }} /> New Role
          </Button>
          // </UIPermissionGuard>
        }
        onRefresh={fetchData}
        isRefreshing={isLoading}
      >
        {isLoading ? (
          <Center py={20}>
            <VStack gap={4}>
              <Spinner size="xl" color="app.text.accent" borderWidth="3px" />
              <Text fontSize="sm" color="app.text.muted" fontWeight="500">
                Loading roles…
              </Text>
            </VStack>
          </Center>
        ) : roles.length === 0 ? (
          <Center py={20}>
            <VStack gap={3}>
              <Box
                w={16}
                h={16}
                borderRadius="2xl"
                bg="rgba(99,102,241,0.08)"
                border="1px dashed"
                borderColor="app.card.border"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={LuUsers} boxSize={7} color="app.text.muted" />
              </Box>
              <Text fontWeight="600" color="app.text.primary">
                No roles found
              </Text>
              <Text fontSize="sm" color="app.text.muted">
                Create your first role to start managing access.
              </Text>
              {/* <UIPermissionGuard permissions={["ACCOUNT.ROLES.CREATE"]}> */}
              <Button
                colorPalette="purple"
                borderRadius="xl"
                size="sm"
                mt={2}
                onClick={handleAddClick}
              >
                <LuPlus style={{ marginRight: "6px" }} /> Create Role
              </Button>
              {/* </UIPermissionGuard> */}
            </VStack>
          </Center>
        ) : (
          <VStack gap={8} align="stretch">
            {/* ── System Roles ────────────────────────────────────────── */}
            {systemRoles.length > 0 && (
              <Box>
                <HStack gap={2} mb={4}>
                  <Icon as={LuShield} boxSize={4} color="app.text.muted" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    color="app.text.muted"
                  >
                    System Roles ({systemRoles.length})
                  </Text>
                </HStack>
                <Grid
                  templateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  }}
                  gap={4}
                >
                  {systemRoles.map((role) => (
                    <GridItem key={role.id}>
                      <RoleCard role={role} onEdit={handleEditClick} onDelete={handleDelete} />
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            )}

            {/* ── Custom Roles ────────────────────────────────────────── */}
            {customRoles.length > 0 && (
              <Box>
                <HStack gap={2} mb={4}>
                  <Icon as={LuShieldCheck} boxSize={4} color="app.text.muted" />
                  <Text
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.1em"
                    color="app.text.muted"
                  >
                    Custom Roles ({customRoles.length})
                  </Text>
                </HStack>
                <Grid
                  templateColumns={{
                    base: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                    xl: "repeat(4, 1fr)",
                  }}
                  gap={4}
                >
                  {customRoles.map((role) => (
                    <GridItem key={role.id}>
                      <RoleCard role={role} onEdit={handleEditClick} onDelete={handleDelete} />
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            )}
          </VStack>
        )}
      </PageLayout>

      {/* ── Create / Edit Drawer ──────────────────────────────────────── */}
      <DrawerRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="md">
        <DrawerBackdrop backdropFilter="blur(8px)" bg="rgba(0,0,0,0.4)" />
        <DrawerContent
          bg="app.bg.primary"
          display="flex"
          flexDirection="column"
          h="100dvh"
          borderLeft="1px solid"
          borderColor="app.card.border"
        >
          <DrawerCloseTrigger color="app.text.muted" />
          <DrawerHeader
            color="app.text.primary"
            borderBottom="1px solid"
            borderColor="app.card.border"
            py={5}
          >
            <VStack align="start" gap={1}>
              <Text fontSize="lg" fontWeight="700" letterSpacing="-0.3px">
                {selectedRole ? "Edit Role" : "Create New Role"}
              </Text>
              <Text fontSize="xs" color="app.text.muted" fontWeight="500">
                {selectedRole
                  ? "Update role details. Manage permissions via Policy Management."
                  : "Define a new role. You can attach policies later for permissions."}
              </Text>
            </VStack>
          </DrawerHeader>

          <DrawerBody py={6} overflowY="auto" flex="1" className="custom-scrollbar">
            <form id="role-form" onSubmit={handleSubmit(handleSave)}>
              <VStack gap={6} align="stretch">
                {/* ── Role Name ─────────────────────────────────── */}
                <Box>
                  <Text
                    mb={2}
                    color="app.text.secondary"
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    Role Name *
                  </Text>
                  <Input
                    {...register("role_name", { required: "Role name is required" })}
                    placeholder="e.g. Project Manager"
                    disabled={selectedRole?.is_system_role}
                    borderRadius="xl"
                    bg="app.bg.secondary"
                    border="1px solid"
                    borderColor={errors.role_name ? "red.500" : "app.card.border"}
                    _focus={{
                      borderColor: errors.role_name ? "red.400" : "rgba(99,102,241,0.5)",
                      boxShadow: errors.role_name ? "0 0 0 3px rgba(239,68,68,0.1)" : "0 0 0 3px rgba(99,102,241,0.1)",
                    }}
                    color="app.text.primary"
                    fontSize="sm"
                  />
                  {errors.role_name && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.role_name.message}
                    </Text>
                  )}
                </Box>

                {/* ── Description ─────────────────────────────── */}
                <Box>
                  <Text
                    mb={2}
                    color="app.text.secondary"
                    fontSize="xs"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.06em"
                  >
                    Description
                  </Text>
                  <Textarea
                    {...register("description")}
                    placeholder="Describe what this role is for…"
                    disabled={selectedRole?.is_system_role}
                    borderRadius="xl"
                    bg="app.bg.secondary"
                    border="1px solid"
                    borderColor="app.card.border"
                    _focus={{
                      borderColor: "rgba(99,102,241,0.5)",
                      boxShadow: "0 0 0 3px rgba(99,102,241,0.1)",
                    }}
                    color="app.text.primary"
                    fontSize="sm"
                    rows={3}
                    resize="none"
                  />
                  {errors.description && (
                    <Text color="red.500" fontSize="xs" mt={1}>
                      {errors.description.message}
                    </Text>
                  )}
                </Box>

                {/* ── Policy Selection ──────────────────────── */}
                <Box>
                  <HStack justify="space-between" mb={3} align="flex-end">
                    <VStack align="start" gap={0}>
                      <Text
                        color="app.text.secondary"
                        fontSize="xs"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="0.06em"
                      >
                        Attached Policies
                      </Text>
                      <Text fontSize="2xs" color="app.text.muted">
                        Select policies to grant permissions to this role
                      </Text>
                    </VStack>
                    <Badge colorPalette="purple" variant="solid" borderRadius="full" px={2}>
                      {availablePolicies.length} Available
                    </Badge>
                  </HStack>

                  {/* Policies List */}
                  <VStack gap={3} align="stretch" maxH="300px" overflowY="auto" className="custom-scrollbar" pr={2}>
                    {availablePolicies.length === 0 ? (
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg="rgba(99,102,241,0.04)"
                        border="1px dashed"
                        borderColor="app.card.border"
                        textAlign="center"
                      >
                        <Text fontSize="xs" color="app.text.muted" fontWeight="500">
                          No policies found. Create some in Policy Management first.
                        </Text>
                      </Box>
                    ) : (
                      availablePolicies.map((policy) => {
                        const isSelected = selectedPolicyIds.includes(policy.id);
                        return (
                          <Box
                            key={policy.id}
                            p={3}
                            borderRadius="xl"
                            border="1px solid"
                            borderColor={isSelected ? "rgba(99,102,241,0.6)" : "app.card.border"}
                            bg={isSelected ? "rgba(99,102,241,0.08)" : "app.bg.secondary"}
                            transition="all 0.22s"
                            cursor="pointer"
                            _hover={{
                              bg: isSelected ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.05)",
                              borderColor: isSelected ? "rgba(99,102,241,0.8)" : "rgba(255,255,255,0.15)",
                            }}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedPolicyIds(selectedPolicyIds.filter((id) => id !== policy.id));
                              } else {
                                setSelectedPolicyIds([...selectedPolicyIds, policy.id]);
                              }
                            }}
                          >
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => { }} // Click handled by Box
                              colorPalette="purple"
                              size="md"
                            >
                              <VStack align="start" gap={1} ml={2} w="full">
                                <HStack justify="space-between" w="full">
                                  <Text fontWeight="600" fontSize="sm" color={isSelected ? "white" : "app.text.primary"}>
                                    {policy.name}
                                  </Text>
                                  <HStack gap={2}>
                                    {policy.statements && policy.statements.length > 0 && (
                                      <HStack gap={1}>
                                        {policy.statements.filter(s => s.effect === "ALLOW").length > 0 && (
                                          <Badge colorPalette="green" variant="subtle" size="xs">
                                            {policy.statements.filter(s => s.effect === "ALLOW").reduce((acc, s) => acc + (s.permissions?.length || 0), 0)} ALLOW
                                          </Badge>
                                        )}
                                        {policy.statements.filter(s => s.effect === "DENY").length > 0 && (
                                          <Badge colorPalette="red" variant="subtle" size="xs">
                                            {policy.statements.filter(s => s.effect === "DENY").reduce((acc, s) => acc + (s.permissions?.length || 0), 0)} DENY
                                          </Badge>
                                        )}
                                      </HStack>
                                    )}
                                    <Tooltip content="View Policy Details" showArrow>
                                      <Box
                                        as="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewPolicy(policy);
                                          setIsPreviewOpen(true);
                                        }}
                                        p={1}
                                        borderRadius="md"
                                        _hover={{ bg: "rgba(255,255,255,0.1)", color: "white" }}
                                        color="app.text.muted"
                                        transition="all 0.2s"
                                      >
                                        <Icon as={LuFileText} boxSize={3.5} />
                                      </Box>
                                    </Tooltip>
                                  </HStack>
                                </HStack>
                                <HStack justify="space-between" w="full">
                                  <Text fontSize="2xs" color="app.text.muted" lineClamp={1} maxW="250px">
                                    {policy.policy_type || "PBAC Policy"} • {policy.statements?.length || 0} statement{(policy.statements?.length || 0) !== 1 ? 's' : ''}
                                  </Text>
                                </HStack>
                              </VStack>
                            </Checkbox>
                          </Box>
                        );
                      })
                    )}
                  </VStack>
                </Box>
              </VStack>
            </form>
          </DrawerBody>

          <DrawerFooter borderTop="1px solid" borderColor="app.card.border" p={6}>
            <HStack gap={3} w="full">
              <Button
                variant="ghost"
                borderRadius="xl"
                flex={1}
                onClick={() => setIsOpen(false)}
                color="app.text.secondary"
              >
                Cancel
              </Button>
              {selectedRole?.is_system_role && !isPlatformUser ? (
                <Tooltip content="System roles are predefined and cannot be modified by Organization users.">
                  <Box flex={2}>
                    <Button
                      disabled
                      colorPalette="purple"
                      size="lg"
                      borderRadius="xl"
                      fontWeight="700"
                      w="full"
                      opacity={0.6}
                    >
                      Update Role
                    </Button>
                  </Box>
                </Tooltip>
              ) : (
                <Button
                  type="submit"
                  form="role-form"
                  flex={2}
                  colorPalette="purple"
                  size="lg"
                  borderRadius="xl"
                  fontWeight="700"
                >
                  {selectedRole ? "Update Role" : "Create Role"}
                </Button>
              )}
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </DrawerRoot>

      {/* ── Policy Details Preview Dialog ───────────────────────────── */}
      <DialogRoot open={isPreviewOpen} onOpenChange={(e) => setIsPreviewOpen(e.open)} size="lg" placement="center" motionPreset="slide-in-bottom">
        <DialogContent bg="app.bg" borderRadius="2xl" border="1px solid" borderColor="app.card.border" boxShadow="xl">
          <DialogHeader pb={2}>
            <VStack align="start" gap={1}>
              <DialogTitle fontSize="lg" fontWeight="700" color="app.text.primary">
                {previewPolicy?.name}
              </DialogTitle>
              <Text fontSize="xs" color="app.text.muted">
                {previewPolicy?.policy_type || "PBAC Policy"} Preview
              </Text>
            </VStack>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pt={4} pb={6} className="custom-scrollbar" maxH="60vh" overflowY="auto">
            {previewPolicy?.statements && previewPolicy.statements.length > 0 ? (
              <VStack gap={4} align="stretch">
                {previewPolicy.statements.map((stmt) => (
                  <Box
                    key={stmt.id}
                    p={4}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={stmt.effect === "ALLOW" ? "green.500/20" : "red.500/20"}
                    bg={stmt.effect === "ALLOW" ? "green.500/5" : "red.500/5"}
                  >
                    <HStack justify="space-between" mb={3}>
                      <Badge colorPalette={stmt.effect === "ALLOW" ? "green" : "red"} variant="solid" size="sm">
                        {stmt.effect}
                      </Badge>
                      <Text fontSize="xs" color="app.text.muted" fontWeight="600">
                        {stmt.permissions?.length || 0} Permissions
                      </Text>
                    </HStack>

                    {stmt.permissions && stmt.permissions.length > 0 ? (
                      <Box display="flex" flexWrap="wrap" gap={2}>
                        {stmt.permissions.map((perm) => (
                          <Badge
                            key={perm.id}
                            variant="outline"
                            color={stmt.effect === "ALLOW" ? "green.300" : "red.300"}
                            borderColor={stmt.effect === "ALLOW" ? "green.500/30" : "red.500/30"}
                            size="sm"
                            px={2}
                            py={1}
                            borderRadius="md"
                            textTransform="none"
                            fontWeight="500"
                          >
                            {perm.code}
                          </Badge>
                        ))}
                      </Box>
                    ) : (
                      <Text fontSize="xs" color="app.text.muted" fontStyle="italic">No permissions defined.</Text>
                    )}
                  </Box>
                ))}
              </VStack>
            ) : (
              <Box p={6} textAlign="center" borderRadius="xl" border="1px dashed" borderColor="app.card.border">
                <Text fontSize="sm" color="app.text.muted">No statements found in this policy.</Text>
              </Box>
            )}
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
});

OrganizationRolesView.displayName = "OrganizationRolesView";
export default OrganizationRolesView;
