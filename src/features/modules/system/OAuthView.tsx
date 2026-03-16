import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Flex,
  Text,
  Heading,
  HStack,
  Stack,
  Portal,
  Input,
  InputGroup,
  Button,
  IconButton,
  DialogPositioner,
} from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogBackdrop,
  DialogActionTrigger,
} from "@/components/ui/dialog";
import { Toaster, toaster } from "@/components/ui/toaster";
import { IoCreateOutline } from "react-icons/io5";
import { LuTriangleAlert, LuCopy, LuCheck, LuRefreshCw, LuShieldAlert, LuX } from "react-icons/lu";

import { GETAPI, PUTAPI, POSTAPI, DELETEAPI } from "@/app/api";
import { TableWidget } from "@/core/widgets/TableWidget";
import { PageLayout } from "@/core/components/PageLayout";
import { Card } from "@/core/components/Card";
import APIErrorScreen from "@/features/ui/components/Error/ApiErrosDisplay";

import { OAuthStats } from "./components/OAuthStats";
import { OAuthClientForm } from "./components/OAuthClientForm";

const OAuthView = () => {
  const [isLoading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [actionMode, setActionMode] = useState<string>("NEW");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [paginationSettings, setPaginationSettings] = useState({
    totalPages: 1,
    currentPage: 1,
    pageSize: 10,
  });
  const [error, setErrors] = useState<any | null>(null);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── One-time secret reveal state ──────────────────────────────────
  const [revealedSecret, setRevealedSecret] = useState<{ clientId: string; secret: string } | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const fetchClients = useCallback(() => {
    setLoading(true);
    GETAPI({
      path: "/applications/clients",
      isPrivateApi: true,
    }).subscribe((res: any) => {
      if (res.success) {
        const clients = res.data?.clients || res.data || [];
        const total = res.data?.total || clients.length || 0;
        setTableData(clients);
        setPaginationSettings(prev => ({
          ...prev,
          totalPages: Math.max(1, Math.ceil(total / prev.pageSize)),
        }));
      } else {
        setErrors(res);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget?.client_id) return;
    setIsDeleting(true);
    DELETEAPI({
      path: `/applications/clients/${deleteTarget.client_id}`,
      isPrivateApi: true,
    }).subscribe((res: any) => {
      setIsDeleting(false);
      setDeleteTarget(null);
      if (res.success) {
        toaster.create({ title: "Deleted", description: `Client "${deleteTarget.client_name || deleteTarget.client_id}" removed.`, type: "success" });
        fetchClients();
      } else {
        toaster.create({ title: "Error", description: res.message || "Failed to delete client", type: "error" });
      }
    });
  }, [deleteTarget, fetchClients]);

  const handleEvent = useCallback((e: any) => {
    setActionMode(e.action);
    setFormData(e.data);
    if (e.action === "EDIT" || e.action === "VIEW") {
      setOpenDialog(true);
    } else if (e.action === "DELETE") {
      setDeleteTarget(e.data);
    }
  }, []);

  const handleFormSubmit = useCallback((data: any) => {
    setServerErrors({});
    const isEdit = actionMode === "EDIT";
    const apiCall = isEdit
      ? PUTAPI({ path: `/applications/clients/${data.client_id}`, data, isPrivateApi: true })
      : POSTAPI({ path: "/applications/register", data, isPrivateApi: true });

    apiCall.subscribe((res: any) => {
      if (res.success) {
        fetchClients();
        setOpenDialog(false);

        if (!isEdit) {
          // ── Capture the one-time secret and show it immediately ──
          const plain_secret = res.data?.[0]?.plain_secret;
          const client_id = res.data?.[0]?.client_id || data.client_id;
          if (plain_secret) {
            setRevealedSecret({ clientId: client_id, secret: plain_secret });
          } else {
            toaster.create({ title: "Client Created", description: "Client registered successfully.", type: "success" });
          }
        } else {
          toaster.create({ title: "Updated", description: "Client updated successfully.", type: "success" });
        }
      } else {
        const bodyErrors = res?.error?.body || res?.data?.error?.body;
        if (bodyErrors && typeof bodyErrors === "object") {
          const mapped: Record<string, string> = {};
          for (const [field, detail] of Object.entries(bodyErrors)) {
            mapped[field] = (detail as any)?.msg || "Invalid value";
          }
          setServerErrors(mapped);
        } else {
          toaster.create({ title: "Error", description: res?.message || res?.data?.message || "Something went wrong", type: "error" });
        }
      }
    });
  }, [actionMode, fetchClients]);

  /** Regenerate the secret for the currently open client in EDIT mode */
  const handleRegenerateSecret = useCallback(() => {
    if (!formData?.client_id) return;
    setIsRegenerating(true);
    POSTAPI({
      path: `/applications/clients/${formData.client_id}/regenerate-secret`,
      data: {},
      isPrivateApi: true,
    }).subscribe((res: any) => {
      setIsRegenerating(false);
      if (res.success) {
        setOpenDialog(false);
        const plain_secret = res.data?.[0]?.plain_secret;
        if (plain_secret) {
          setRevealedSecret({ clientId: formData.client_id, secret: plain_secret });
        }
      } else {
        toaster.create({ title: "Error", description: res?.message || "Failed to regenerate secret", type: "error" });
      }
    });
  }, [formData]);

  const handleCopySecret = useCallback(() => {
    if (!revealedSecret) return;
    navigator.clipboard.writeText(revealedSecret.secret).then(() => {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2500);
    });
  }, [revealedSecret]);

  const activeOAuthCount = useMemo(() =>
    tableData.filter(c => c.skip_authorization === true || c.client_type === "confidential").length,
    [tableData]);

  if (error && error.success === false) {
    return <APIErrorScreen errors={error} setErrors={setErrors} />;
  }

  return (
    <>
      <Toaster />

      {/* Header */}
      <PageLayout
        title="OAuth Apps"
        subtitle="Manage client credentials and authorization flows."
        actions={
          <Button
            colorPalette="purple"
            variant="solid"
            borderRadius="xl"
            size="md"
            gap={2}
            onClick={() => { setActionMode("NEW"); setFormData(null); setOpenDialog(true); }}
            bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)"
            color="white"
            h="44px"
            px={6}
            boxShadow="0 4px 20px rgba(139,92,246,0.35)"
            transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
            _hover={{
              transform: "translateY(-2px) scale(1.02)",
              boxShadow: "0 8px 28px rgba(139,92,246,0.5)",
            }}
            _active={{ transform: "translateY(0) scale(1)", boxShadow: "none" }}
          >
            <IoCreateOutline size={18} />
            Create Client
          </Button>
        }
        onRefresh={fetchClients}
        isRefreshing={isLoading}
      >

        <OAuthStats totalClients={tableData.length} activeOAuth={activeOAuthCount} />

        <Card bg="app.navbar.bg" p={1} borderRadius="3xl" backdropFilter="blur(16px)" boxShadow="app.shadow.glass-glow">
          <TableWidget
            data={tableData}
            paginationRequired={true}
            paginationSettings={paginationSettings}
            filltersRequired={true}
            onEvent={handleEvent}
            activeLoader={isLoading}
          />
        </Card>
      </PageLayout>

      {/* ─── Delete Confirmation Dialog ─── */}
      <DialogRoot size="sm" placement="center" motionPreset="slide-in-bottom" open={!!deleteTarget} onOpenChange={(e: any) => { if (!e.open) setDeleteTarget(null); }}>
        <DialogContent borderRadius="2xl" bg="app.bg" border="1px solid" borderColor="app.navbar.border" boxShadow="2xl">
          <DialogHeader px={6} pt={6} pb={2}>
            <HStack gap={3}>
              <Flex align="center" justify="center" w={10} h={10} borderRadius="xl" bg="rgba(239, 68, 68, 0.12)">
                <LuTriangleAlert size={20} color="var(--chakra-colors-red-400)" />
              </Flex>
              <DialogTitle fontSize="lg" fontWeight="700" color="app.text.primary">Delete Client</DialogTitle>
            </HStack>
          </DialogHeader>
          <DialogBody px={6} py={4}>
            <Text fontSize="sm" color="app.text.muted" lineHeight="tall">
              Are you sure you want to delete{" "}
              <Text as="span" fontWeight="700" color="app.text.primary">{deleteTarget?.client_name || deleteTarget?.client_id}</Text>?
              {" "}This action is permanent.
            </Text>
          </DialogBody>
          <DialogFooter px={6} pb={6} pt={2} gap={3}>
            <Button variant="ghost" borderRadius="full" onClick={() => setDeleteTarget(null)} disabled={isDeleting}>Cancel</Button>
            <Button bg="red.500" color="white" borderRadius="full" px={6} fontWeight="600" _hover={{ bg: "red.600" }} onClick={confirmDelete} loading={isDeleting} loadingText="Deleting...">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* ─── Create / Edit Dialog ─── */}
      {/*
          size="xl" keeps the dialog contained and centered.
          The form has 5 sections; xl gives enough room without going full-screen.
          scrollBehavior="inside" keeps the header/footer pinned while the body scrolls.
      */}
      <DialogRoot
        size="xl"
        placement="center"
        motionPreset="slide-in-bottom"
        open={openDialog}
        onOpenChange={(e: any) => setOpenDialog(e.open)}
        scrollBehavior="inside"
        closeOnInteractOutside={false}
      >
        <DialogContent
          bg={'bg'}
          borderRadius="2xl"
          // bg="app.bg"
          border="1px solid"
          borderColor="rgba(139,92,246,0.25)"
          boxShadow="0 32px 80px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.12), 0 0 60px rgba(139,92,246,0.08)"
          backdropFilter="blur(30px)"
          maxH="92dvh"
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          {/* Top accent bar — violet gradient matching the Create Client button */}
          <Box
            h="3px"
            flexShrink={0}
            css={{
              background: "linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4, #7c3aed)",
              backgroundSize: "200% auto",
              animation: "auth-shimmer 4s linear infinite",
            }}
          />

          <DialogHeader

            borderBottom="1px solid"
            borderColor="rgba(139,92,246,0.12)"
            px={8}
            py={5}
            flexShrink={0}
          >
            {/* justify="space-between" pushes the X button to the far right */}
            <HStack gap={4} justify="space-between" align="center" w="full">
              <HStack gap={4}>
                {/* Icon badge */}
                <Flex
                  align="center"
                  justify="center"
                  w={10}
                  h={10}
                  borderRadius="xl"
                  flexShrink={0}
                  bg="rgba(139,92,246,0.12)"
                  border="1px solid"
                  borderColor="rgba(139,92,246,0.25)"
                >
                  <IoCreateOutline size={20} color="var(--chakra-colors-purple-400)" />
                </Flex>

                <Stack gap={0}>
                  <DialogTitle
                    fontSize="lg"
                    fontWeight="800"
                    letterSpacing="-0.02em"
                    color="app.text.primary"
                  >
                    {actionMode === "EDIT" ? "Edit OAuth Client" : "Register OAuth Client"}
                  </DialogTitle>
                  <Text fontSize="xs" color="app.text.muted" fontWeight="500">
                    {actionMode === "EDIT"
                      ? "Update credentials and settings for this client."
                      : "Configure a new OAuth 2.0 / OIDC client application."}
                  </Text>
                </Stack>
              </HStack>

              {/* Close button — top right; only way to dismiss (outside-click is disabled) */}
              <IconButton
                aria-label="Close dialog"
                variant="ghost"
                size="sm"
                borderRadius="lg"
                color="app.text.muted"
                flexShrink={0}
                onClick={() => setOpenDialog(false)}
                _hover={{
                  bg: "rgba(239,68,68,0.1)",
                  color: "red.400",
                  transform: "rotate(90deg)",
                }}
                transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
              >
                <LuX size={18} />
              </IconButton>
            </HStack>
          </DialogHeader>

          {/* Scrollable form body */}
          <DialogBody px={8} py={6} overflowY="auto" flex="1" minH={0}>
            <OAuthClientForm
              initialData={formData}
              onSubmit={handleFormSubmit}
              actionMode={actionMode}
              serverErrors={serverErrors}
            />
          </DialogBody>

          <DialogFooter
            borderTop="1px solid"
            borderColor="rgba(139,92,246,0.12)"
            px={8}
            py={5}
            gap={3}
            flexShrink={0}

          >
            {/* Cancel */}
            <DialogActionTrigger asChild>
              <Button
                variant="ghost"
                borderRadius="xl"
                color="app.text.muted"
                _hover={{ bg: "rgba(239,68,68,0.08)", color: "red.400" }}
                transition="all 0.2s"
              >
                Cancel
              </Button>
            </DialogActionTrigger>

            {/* Spacer pushes the primary actions right */}
            <Box flex={1} />

            {/* Regenerate Secret — EDIT mode only */}
            {actionMode === "EDIT" && (
              <Button
                variant="outline"
                borderRadius="xl"
                borderColor="rgba(34,197,94,0.35)"
                color="green.400"
                gap={2}
                px={5}
                _hover={{
                  bg: "rgba(34,197,94,0.08)",
                  borderColor: "green.400",
                  transform: "translateY(-1px)",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                onClick={handleRegenerateSecret}
                loading={isRegenerating}
                loadingText="Regenerating…"
              >
                <LuRefreshCw size={14} />
                Regenerate Secret
              </Button>
            )}

            {/* Primary submit */}
            <Button
              type="submit"
              form="client-form"
              borderRadius="xl"
              color="white"
              px={7}
              fontWeight="700"
              bg="linear-gradient(135deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)"
              boxShadow="0 4px 20px rgba(139,92,246,0.35)"
              transition="all 0.25s cubic-bezier(0.4,0,0.2,1)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 8px 28px rgba(139,92,246,0.5)",
              }}
              _active={{ transform: "translateY(0)", boxShadow: "none" }}
            >
              {actionMode === "EDIT" ? "Update Details" : "Register Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* ─── One-Time Secret Reveal Dialog ─── */}
      <DialogRoot
        size="md"
        placement="center"
        motionPreset="slide-in-bottom"
        open={!!revealedSecret}
        onOpenChange={(e: any) => { if (!e.open) { setRevealedSecret(null); setSecretCopied(false); } }}
      >
        <DialogContent borderRadius="2xl" bg="app.bg" border="1px solid" borderColor="orange.500" boxShadow="0 0 40px rgba(251,146,60,0.15), 2xl">
          <DialogHeader px={6} pt={6} pb={3}>
            <HStack gap={3}>
              <Flex align="center" justify="center" w={10} h={10} borderRadius="xl" bg="rgba(251,146,60,0.12)">
                <LuShieldAlert size={20} color="var(--chakra-colors-orange-400)" />
              </Flex>
              <DialogTitle fontSize="lg" fontWeight="800" color="orange.300">
                Save Your Client Secret
              </DialogTitle>
            </HStack>
          </DialogHeader>
          <DialogBody px={6} py={4}>
            <Text fontSize="sm" color="app.text.muted" mb={5} lineHeight="tall">
              This secret will <Text as="span" fontWeight="700" color="red.400">never be shown again</Text>.
              Copy it now and store it securely (e.g. in your vault or .env file).
            </Text>

            {/* Client ID badge */}
            <Text fontSize="xs" color="app.text.muted" mb={1} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
              Client ID
            </Text>
            <Box
              px={3} py={2} mb={5} borderRadius="lg"
              bg="rgba(99,102,241,0.08)" border="1px solid" borderColor="rgba(99,102,241,0.2)"
            >
              <Text fontSize="sm" fontFamily="mono" color="purple.300" fontWeight="600">
                {revealedSecret?.clientId}
              </Text>
            </Box>

            {/* Secret copy area */}
            <Text fontSize="xs" color="app.text.muted" mb={1} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
              Client Secret (copy now!)
            </Text>
            <HStack gap={2}>
              <Box
                flex={1} px={3} py={3} borderRadius="lg"
                bg="rgba(0,0,0,0.3)" border="1px solid" borderColor="orange.700"
                overflow="hidden"
              >
                <Text fontSize="sm" fontFamily="mono" color="orange.200" wordBreak="break-all">
                  {revealedSecret?.secret}
                </Text>
              </Box>
              <Button
                type="button"
                onClick={handleCopySecret}
                borderRadius="xl"
                size="sm"
                px={6}
                flexShrink={0}
                bg={secretCopied ? "green.600" : "orange.500"}
                color="white"
                _hover={{ bg: secretCopied ? "green.500" : "orange.400" }}
                transition="all 0.2s"
                minW="90px"
                cursor="pointer"

              >
                {secretCopied ? <><LuCheck size={14} />&nbsp;Copied!</> : <><LuCopy size={14} />&nbsp;Copy</>}
              </Button>
            </HStack>

            <Box mt={4} p={3} borderRadius="lg" bg="rgba(239,68,68,0.07)" border="1px solid" borderColor="rgba(239,68,68,0.2)">
              <Text fontSize="xs" color="red.400" fontWeight="500">
                ⚠️ Once you close this dialog, this secret cannot be retrieved. If you lose it, you must regenerate a new one.
              </Text>
            </Box>
          </DialogBody>
          <DialogFooter px={6} pb={6} pt={2}>
            <Button
              type="button"
              w="100%"
              borderRadius="xl"
              h="44px"
              px={6}
              // bg="app.gradient.premium"
              // color="white"
              // fontWeight="700"
              onClick={() => { setRevealedSecret(null); setSecretCopied(false); }}
              _hover={{ filter: "brightness(1.1)" }}
              cursor="pointer"
            >
              I've saved the secret — close
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default OAuthView;
