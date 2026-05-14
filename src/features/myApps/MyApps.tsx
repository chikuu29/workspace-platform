import {
  Badge,
  Box,
  Circle,
  Flex,
  Image,
  Input,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  Icon,
  Heading,
  Center,
} from "@chakra-ui/react";
import { memo, useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import {
  Search,
  ChevronRight,
  LayoutGrid,
  Sparkles,
  Zap,
  Command,
  Bell,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Megaphone,
} from "lucide-react";
import * as dynamicFunctions from "../../script/myAppsScript";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";
// useAuthorization is a React hook — never call hooks inside useMemo/filter callbacks.
// Instead we read raw RBAC slices at the top level and use a pure helper below.
// (RootState is already imported on line 17)

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#3b82f6,#6366f1)",
  "linear-gradient(135deg,#10b981,#3b82f6)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#8b5cf6,#ec4899)",
  "linear-gradient(135deg,#06b6d4,#3b82f6)",
];

// ─── Updates Panel Config ─────────────────────────────────────────────────────

/**
 * Toggle this flag to show/hide the updates panel.
 * When wiring to a real API, replace MOCK_UPDATES with fetched data
 * and set this based on whether the API returns any items.
 */
const SHOW_UPDATES_PANEL = false;

interface UpdateItem {
  id: string;
  type: "info" | "warning" | "success" | "announcement";
  title: string;
  description: string;
  timestamp: string;
}

const UPDATE_ICON_MAP = {
  info: { icon: Info, accent: "blue.500", bg: "blue.500/10", border: "blue.500/20" },
  warning: { icon: AlertTriangle, accent: "orange.500", bg: "orange.500/10", border: "orange.500/20" },
  success: { icon: CheckCircle2, accent: "green.500", bg: "green.500/10", border: "green.500/20" },
  announcement: { icon: Megaphone, accent: "purple.500", bg: "purple.500/10", border: "purple.500/20" },
} as const;

/** Replace with real API data when ready */
const MOCK_UPDATES: UpdateItem[] = [
  {
    id: "1",
    type: "announcement",
    title: "Platform v2.4 Released",
    description: "New dashboard widgets, improved performance, and dark mode refinements are now live.",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "warning",
    title: "Scheduled Maintenance",
    description: "The platform will undergo maintenance on Sunday, 12:00–2:00 AM UTC.",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "success",
    title: "Billing Synced Successfully",
    description: "All subscription records have been reconciled with the payment gateway.",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "info",
    title: "New Integration Available",
    description: "Connect your workspace with Slack, Teams, or Discord for real-time alerts.",
    timestamp: "2 days ago",
  },
];

// ─── UpdatesFeed Component ────────────────────────────────────────────────────

const UpdatesFeed = memo(({ updates }: { updates: UpdateItem[] }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || updates.length === 0) return null;

  return (
    <Box
      borderRadius="2xl"
      border="1px solid"
      borderColor="app.card.border"
      bg="app.card.bg"
      backdropFilter="blur(12px)"
      overflow="hidden"
      animation="fade-in 0.4s ease-out"
    >
      {/* Panel header */}
      <Flex
        px={{ base: 4, md: 5 }}
        py={3}
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderColor="app.divider"
      >
        <HStack gap={2.5}>
          <Circle size="8" bg="brand.500/10" color="brand.500">
            <Bell size={14} />
          </Circle>
          <Text fontSize="sm" fontWeight="900" color="app.text.primary">
            Live Updates
          </Text>
          <Badge
            colorPalette="blue"
            variant="subtle"
            borderRadius="full"
            px={2}
            fontSize="2xs"
            fontWeight="900"
          >
            {updates.length}
          </Badge>
        </HStack>
        <Icon
          as={X}
          boxSize={4}
          color="app.text.muted"
          cursor="pointer"
          borderRadius="full"
          transition="all 0.15s"
          _hover={{ color: "app.text.primary", transform: "scale(1.1)" }}
          onClick={() => setDismissed(true)}
          aria-label="Dismiss updates"
        />
      </Flex>

      {/* Update items */}
      <VStack align="stretch" gap={0} maxH="260px" overflowY="auto">
        {updates.map((item, idx) => {
          const theme = UPDATE_ICON_MAP[item.type];
          const UpdateIcon = theme.icon;
          return (
            <HStack
              key={item.id}
              px={{ base: 4, md: 5 }}
              py={3.5}
              gap={3.5}
              borderBottom={idx < updates.length - 1 ? "1px solid" : undefined}
              borderColor="app.divider"
              cursor="pointer"
              transition="all 0.15s ease"
              _hover={{ bg: theme.bg }}
            >
              <Circle size="9" bg={theme.bg} color={theme.accent} flexShrink={0}>
                <UpdateIcon size={15} />
              </Circle>
              <VStack align="start" gap={0.5} flex={1} minW={0}>
                <HStack gap={2} w="full" justify="space-between">
                  <Text fontSize="sm" fontWeight="800" color="app.text.primary" truncate>
                    {item.title}
                  </Text>
                  <Text fontSize="2xs" color="app.text.muted" fontWeight="600" flexShrink={0}>
                    {item.timestamp}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="app.text.muted" fontWeight="600" lineClamp={1}>
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
});
UpdatesFeed.displayName = "UpdatesFeed";

const getGradient = (seed: string): string => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
  return APP_GRADIENTS[Math.abs(h) % APP_GRADIENTS.length];
};

// ─── AppCard ─────────────────────────────────────────────────────────────────

interface AppCardProps {
  appConfig: any;
  handleNavigate: (e: React.MouseEvent, appConfig: any) => void;
}

const AppCard: React.FC<AppCardProps> = memo(
  ({ appConfig, handleNavigate }) => {
    const { name, logo } = appConfig;
    const gradient = useMemo(() => getGradient(name), [name]);

    if (appConfig?.hidden) return null;

    return (
      <Box
        borderRadius="2xl"
        border="1px solid"
        borderColor="app.card.border"
        bg="app.card.bg"
        backdropFilter="blur(16px)"
        boxShadow="app.shadow.glass-glow"
        overflow="hidden"
        cursor="pointer"
        transition="all 0.22s cubic-bezier(0.4, 0, 0.2, 1)"
        onClick={(e) => handleNavigate(e, appConfig)}
        role="button"
        aria-label={`Open ${name}`}
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "0 20px 48px -8px rgba(99,102,241,0.22)",
          borderColor: "rgba(99,102,241,0.4)",
        }}
      >
        {/* ── Gradient accent strip ─────────────────────────────────────────── */}
        <Box h="4px" bgGradient={gradient} />

        <VStack gap={0} align="stretch" p={5}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box
              w="48px"
              h="48px"
              borderRadius="xl"
              bg={useColorModeValue("white", "whiteAlpha.100")}
              p={2}
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 12px rgba(0,0,0,0.08)"
              overflow="hidden"
            >
              {logo?.ShowSvg ? (
                <Box
                  w="full"
                  h="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color={logo?.iconColor || "brand.500"}
                  dangerouslySetInnerHTML={{ __html: logo.svgIcon }}
                  css={{
                    "& svg": {
                      width: "26px",
                      height: "26px",
                      stroke: "currentColor",
                      fill: "none",
                    },
                  }}
                />
              ) : (
                <Image
                  src={logo?.url}
                  alt={`${name} logo`}
                  objectFit="contain"
                  maxH="100%"
                  maxW="100%"
                />
              )}
            </Box>
            <Icon as={ChevronRight} color="app.text.muted" opacity={0.4} />
          </Flex>

          <VStack align="start" gap={1}>
            <Text
              fontSize="sm"
              fontWeight="700"
              color="app.text.primary"
              letterSpacing="-0.01em"
            >
              {name}
            </Text>
            <Text fontSize="xs" color="app.text.muted" lineClamp={1}>
              {appConfig.description || "Launch application"}
            </Text>
          </VStack>

          <Box borderTop="1px solid" borderColor="app.divider" mt={4} pt={3}>
            <Text
              fontSize="2xs"
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing="0.08em"
              color="app.text.accent"
            >
              Launch App
            </Text>
          </Box>
        </VStack>
      </Box>
    );
  },
);

AppCard.displayName = "AppCard";

// ─── main MyApps ─────────────────────────────────────────────────────────────

function MyApps() {
  const appConfig = useSelector((state: RootState) => state.app.appConfig);
  const error = useSelector((state: RootState) => state.app.error);
  const auth = useSelector((state: RootState) => state.auth);
  const organizations = useSelector((state: RootState) => state.organizations);
  const user_type = useSelector((state: RootState) => state.rbac.user_type);
  // Read raw RBAC state at hook-level so it can be safely closed-over inside useMemo.
  const rbacPermissions = useSelector((state: RootState) => state.rbac.permissions);
  const is_root_user = useSelector((state: RootState) => state.rbac.is_root_user);
  const is_superuser = useSelector((state: RootState) => state.rbac.is_superuser);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const appList = useMemo(() => appConfig?.config?.appList ?? [], [appConfig]);
  const subscribed_apps = useMemo(
    () => organizations?.organization?.subscribed_apps || [],
    [organizations?.organization?.subscribed_apps],
  );

  const filteredApps = useMemo(() => {
    // Inline permission check — rbacPermissions/is_root_user/is_superuser are closed-over
    // from the top-level selectors above, so no hook is called inside this callback.
    const userPerms: string[] = rbacPermissions || [];
    const isPrivileged = is_root_user || is_superuser;

    return appList.filter((app: any) => {
      const app_slug = app.app_slug || app.id;

      // Subscription gate — SYSTEM users bypass it.
      if (!subscribed_apps.includes(app_slug)) {
        if (user_type !== "SYSTEM") return false;
      } else {
        // Permission gate — inline logic, mirrors useAuthorization without calling a hook.
        const required: string[] = app.required_permissions || [];
        if (required.length > 0 && !isPrivileged) {
          const hasAll = required.every((reqPerm) =>
            userPerms.some((p) =>
              p === reqPerm || (p.endsWith(".*") && reqPerm.startsWith(p.slice(0, -2))) || p === "*"
            )
          );
          if (!hasAll) return false;
        }
      }

      return app.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, appList, subscribed_apps, user_type, rbacPermissions, is_root_user, is_superuser]);

  const handleDefaultNavigate = useCallback(
    (e: React.MouseEvent, cfg: any) => {
      e.preventDefault();
      if (!auth?.isAuthenticated) return;

      const organizationName = organizations?.organization?.name ?? "GHOST_ORG";

      const action = cfg.actions?.["onClick"];
      if (action && action in dynamicFunctions) {
        (dynamicFunctions as any)[action](e, cfg);
        return;
      }
      if (cfg.target) {
        navigate(`/${organizationName}${cfg.target}`);
      }
    },
    [auth?.isAuthenticated, organizations?.organization?.name, navigate],
  );

  return (
    <Box p="2">
      <VStack gap={6} align="stretch">
        {/* Header Section */}
        {/* ── Updates / Notifications Panel ──────────────────────────── */}
        {SHOW_UPDATES_PANEL && <UpdatesFeed updates={MOCK_UPDATES} />}

        {/* ── High-Tech Hero Header ─────────────────────────────────────── */}
        <Box
          position="sticky"
          top="-1px"
          zIndex={100}
          bg="app.card.bg"
          backdropFilter="blur(18px) saturate(160%)"
          borderBottom="1px solid"
          borderColor="app.card.border"
          borderRadius="2xl"
          overflow="hidden"
          boxShadow={useColorModeValue(
            "0 8px 32px -12px rgba(99,102,241,0.15)",
            "0 8px 32px -12px rgba(0,0,0,0.4)"
          )}
        >
          {/* Gradient accent strip */}
          <Box
            h="3px"
            bgGradient="to-r"
            gradientFrom="brand.500"
            gradientVia="purple.500"
            gradientTo="blue.500"
          />

          <Box px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}>
            <Flex
              justify="space-between"
              align={{ base: "start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              {/* Left: Icon + Title + Subtitle */}
              <HStack gap={4} align="start">
                {/* Animated glow icon */}
                <Circle
                  size="12"
                  bgGradient="to-br"
                  gradientFrom="brand.500"
                  gradientTo="purple.500"
                  color="white"
                  flexShrink={0}
                  boxShadow="0 0 20px rgba(99,102,241,0.35), 0 0 60px rgba(99,102,241,0.1)"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "rotate(12deg) scale(1.08)",
                    boxShadow: "0 0 28px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.15)",
                  }}
                >
                  <Command size={22} strokeWidth={2.5} />
                </Circle>

                <VStack align="start" gap={1}>
                  <HStack gap={2.5} align="center">
                    <Heading
                      size={{ base: "md", md: "lg" }}
                      fontWeight="900"
                      letterSpacing="-0.02em"
                      bgGradient="to-r"
                      gradientFrom="app.text.primary"
                      gradientTo="brand.500"
                      bgClip="text"
                    >
                      Command Center
                    </Heading>
                    <Badge
                      colorPalette="purple"
                      variant="subtle"
                      borderRadius="full"
                      px={2.5}
                      py={0.5}
                      fontSize="2xs"
                      fontWeight="900"
                      textTransform="uppercase"
                    >
                      <Zap size={10} /> {filteredApps.length} Apps
                    </Badge>
                  </HStack>

                  <Text
                    fontSize="sm"
                    color="app.text.muted"
                    fontWeight="600"
                  // maxW="420px"
                  >
                    Your complete workspace ecosystem — unified, connected, and easy to access.
                  </Text>

                  {/* Quick-stat chips */}
                  <HStack gap={2} mt={1} flexWrap="wrap">
                    <HStack
                      gap={1.5}
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      bg={useColorModeValue("blue.50", "blue.500/10")}
                      border="1px solid"
                      borderColor={useColorModeValue("blue.100", "blue.500/20")}
                    >
                      <Sparkles size={11} color="var(--chakra-colors-blue-500)" />
                      <Text fontSize="2xs" fontWeight="800" color="blue.500">
                        {appList.length} Total
                      </Text>
                    </HStack>
                    <HStack
                      gap={1.5}
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      bg={useColorModeValue("green.50", "green.500/10")}
                      border="1px solid"
                      borderColor={useColorModeValue("green.100", "green.500/20")}
                    >
                      <LayoutGrid size={11} color="var(--chakra-colors-green-500)" />
                      <Text fontSize="2xs" fontWeight="800" color="green.500">
                        {subscribed_apps.length} Subscribed
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </HStack>

              {/* Right: Search */}
              <Box minW={{ md: "280px" }} maxW={{ md: "320px" }} w={{ base: "full", md: "auto" }}>
                <InputGroup
                  flex="1"
                  startElement={
                    <Icon
                      as={Search}
                      color="app.text.muted"
                      boxSize={4}
                    />
                  }
                >
                  <Input
                    placeholder="Search apps..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={useColorModeValue("white", "whiteAlpha.50")}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor="app.card.border"
                    fontSize="sm"
                    fontWeight="600"
                    _placeholder={{ color: "app.text.muted", fontWeight: "500" }}
                    _focus={{
                      borderColor: "brand.500",
                      boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
                    }}
                    transition="all 0.2s ease"
                  />
                </InputGroup>
              </Box>
            </Flex>
          </Box>
        </Box>





        {/* Grid Section */}
        {!error && (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
          </SimpleGrid>
        )}

        {filteredApps.length === 0 && !error && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            py={20}
            opacity={0.6}
          >
            <Icon as={Search} boxSize={10} mb={4} color="app.text.muted" />
            <Text fontWeight="600" color="app.text.primary">
              No apps found
            </Text>
            <Text fontSize="sm" color="app.text.muted">
              Try a different search term
            </Text>
          </Flex>
        )}
      </VStack>
    </Box>
  );
}

export default memo(MyApps);
