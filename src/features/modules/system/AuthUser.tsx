import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  Stack,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { Plus, RefreshCw, Eye, Pencil } from "lucide-react";
import { RootState } from "@/app/store";
import { GETAPI, POSTAPI } from "@/app/api";
import { UserDirectoryGrid } from "@/core/widgets/UserDirectoryGrid";
import { UserCardAction } from "@/core/widgets/UserCard";
import UserModal from "./components/UserModal";
import { toaster } from "@/components/ui/toaster";
import { PageLayout } from "@/core/components/PageLayout";

// ─── Stable constants (prevent new references on each render) ─────────────────

const USER_ACTIONS: UserCardAction[] = [
  {
    label: "View Details",
    icon: <Eye />,
    colorPalette: "blue",
    actionType: "VIEW",
  },
  {
    label: "Edit User",
    icon: <Pencil />,
    colorPalette: "yellow",
    actionType: "EDIT",
  },
];

const SEARCH_FIELDS = ["username", "email", "first_name", "last_name", "role"];

// ─── AuthUsers ────────────────────────────────────────────────────────────────

const AuthUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isSubmitting, setSubmitting] = useState<boolean>(false);
  const [editUser, setEditUser] = useState<any | null>(null); // null = create mode
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20, // Larger limit suits a card grid better than a table
  });

  const organizations = useSelector((state: RootState) => state.organizations);
  const organizationName = organizations?.organization?.name || "";

  // ── Data fetching ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(
    (page = 1) => {
      setLoading(true);
      GETAPI({
        path: "/account/organization/users",
        params: { page, limit: pagination.limit },
        isPrivateApi: true,
        serverName: 'identity'
      }).subscribe({
        next: (res: any) => {
          if (res.success) {
            setUsers(res.data || []);
            setPagination((prev) => ({
              ...prev,
              total: res.extra_meta?.total || 0,
              page: res.extra_meta?.page || 1,
            }));
          }
          setLoading(false);
        },
        error: (err: any) => {
          console.error("Fetch users error:", err);
          setLoading(false);
        },
      });
    },
    [pagination.limit]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ── Create user ─────────────────────────────────────────────────────────────
  const handleCreateUser = useCallback(
    (userData: any) => {
      setSubmitting(true);
      POSTAPI({
        path: "/account/organization/users",
        data: userData,
        isPrivateApi: true,
      }).subscribe({
        next: (res: any) => {
          if (res.success) {
            toaster.create({
              title: "User Created",
              description: "The user has been added to your workspace.",
              type: "success",
            });
            setModalOpen(false);
            fetchUsers();
          } else {
            toaster.create({
              title: "Error",
              description: res.message || "Failed to create user",
              type: "error",
            });
          }
          setSubmitting(false);
        },
      });
    },
    [fetchUsers]
  );

  // ── Card action handler ─────────────────────────────────────────────────────
  const handleCardAction = useCallback((actionType: string, user: any) => {
    if (actionType === "VIEW") {
      console.log("View user:", user);
    } else if (actionType === "EDIT") {
      setEditUser(user);   // pre-fill the modal
      setModalOpen(true);
    }
  }, []);

  // ── Toolbar right slot — passed into the grid component ────────────────────
  const toolbarEnd = useMemo(
    () => (
      <HStack gap={2}>
        <IconButton
          aria-label="Refresh users"
          size="sm"
          variant="outline"
          borderRadius="full"
          onClick={() => fetchUsers()}
          loading={isLoading}
        >
          <RefreshCw />
        </IconButton>
        <Button
          size="sm"
          borderRadius="full"
          px={5}
          fontWeight="600"
          bg="app.gradient.premium"
          color="white"
          _hover={{ filter: "brightness(1.1)", transform: "translateY(-1px)" }}
          boxShadow="0 6px 16px -4px rgba(99,102,241,0.4)"
          transition="all 0.2s"
          onClick={() => { setEditUser(null); setModalOpen(true); }}
        >
          <Plus />
          Add User
        </Button>
      </HStack>
    ),
    [isLoading, fetchUsers]
  );

  return (
    <>
      <PageLayout
        title="User Directory"
        subtitle={
          <>
            Manage and collaborate with members in{" "}
            <Text as="span" fontWeight="700" color="app.text.accent">
              {organizationName}
            </Text>
          </>
        }
      >
        <VStack gap={8} align="stretch">

          {/* ── User grid (the toolbar, search, filter & cards live here) ── */}
          <UserDirectoryGrid
            users={users}
            isLoading={isLoading}
            actions={USER_ACTIONS}
            onAction={handleCardAction}
            toolbarEnd={toolbarEnd}
            searchFields={SEARCH_FIELDS}
            statusField="is_active"
          />
        </VStack>
      </PageLayout>

      {/* ── Create user modal ───────────────────────────────────────────── */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null); }}
        onSubmit={handleCreateUser}
        isLoading={isSubmitting}
        organizationName={organizationName}
        initialData={editUser}
      />
    </>
  );
};

export default AuthUsers;
