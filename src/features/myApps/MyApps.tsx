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
import { memo, useEffect, useState, useCallback, useMemo, useRef } from "react";
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

  // Define sticky-state colors at the top level to follow Rules of Hooks
  const stuckBg = useColorModeValue("app.card.bg", "navy.700");
  const stuckBorder = useColorModeValue("brand.500", "rgba(199, 153, 255, 0.3)");
  const normalBorder = useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.1)");
  const stuckShadow = useColorModeValue("0 8px 30px rgba(0,0,0,0.08)", "0 20px 60px rgba(0,0,0,0.6)");
  const normalShadow = useColorModeValue("0 4px 20px -5px rgba(0,0,0,0.05)", "0 10px 40px -20px rgba(0,0,0,0.5)");

  const [isStuck, setIsStuck] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;

    // We use rootMargin: "-1px 0px 0px 0px" to detect when the element 
    // hits the top of the screen (sticky position).
    const observer = new IntersectionObserver(
      ([e]) => {
        setIsStuck(e.intersectionRatio < 1);
      },
      { threshold: [1], rootMargin: "-1px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

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
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header Section */}
        {/* ── Updates / Notifications Panel ──────────────────────────── */}
        {SHOW_UPDATES_PANEL && <UpdatesFeed updates={MOCK_UPDATES} />}

        {/* ── High-Tech Hero Header ─────────────────────────────────────── */}
        {/* ── High-Tech Hero Banner (Static) ─────────────────────────────────── */}
        <Box
          // bg={useColorModeValue("rgba(255, 255, 255, 0.4)", "rgba(15, 15, 25, 0.4)")}
          bg="app.card.bg"
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={useColorModeValue("rgba(0,0,0,0.05)", "rgba(255,255,255,0.05)")}
          borderRadius="3xl"
          overflow="hidden"
          p={{ base: 3, md: 8 }}
          transition="all 0.3s ease"
        >
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={6}
          >
            {/* Branding & Intelligence */}
            <HStack gap={{ base: 4, md: 6 }} align="start" w="full">
              <Circle
                size={{ base: "12", md: "14" }}
                bgGradient="to-br"
                gradientFrom="#6366f1"
                gradientTo="#c799ff"
                color="white"
                flexShrink={0}
                boxShadow="0 8px 30px rgba(99,102,241,0.3)"
              >
                <Command size={26} strokeWidth={2.5} />
              </Circle>

              <VStack align="start" gap={1.5} w="full">
                <HStack gap={3} align="center" flexWrap="wrap">
                  <Heading
                    size={{ base: "md", md: "xl" }}
                    fontWeight="900"
                    letterSpacing="-0.03em"
                    bgGradient="to-br"
                    gradientFrom={useColorModeValue("gray.900", "white")}
                    gradientTo={useColorModeValue("gray.600", "gray.400")}
                    bgClip="text"
                  >
                    Command Center
                  </Heading>
                  <Badge
                    bg={useColorModeValue("purple.50", "rgba(199, 153, 255, 0.1)")}
                    color={useColorModeValue("purple.600", "#c799ff")}
                    variant="subtle"
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontSize="xs"
                    fontWeight="800"
                  >
                    <HStack gap={1.5}>
                      <Zap size={12} fill="currentColor" />
                      <Text>{filteredApps.length} ACTIVE</Text>
                    </HStack>
                  </Badge>
                </HStack>

                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  color={useColorModeValue("gray.500", "gray.400")}
                  fontWeight="500"
                  maxW="600px"
                >
                  Manage your unified workspace ecosystem with connected tools and intelligence.
                </Text>

                <HStack gap={3} mt={1} flexWrap="wrap">
                  <HStack
                    gap={1.5}
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={useColorModeValue("blue.50/50", "rgba(59, 130, 246, 0.05)")}
                    border="1px solid"
                    borderColor={useColorModeValue("blue.100", "rgba(59, 130, 246, 0.1)")}
                  >
                    <Sparkles size={12} color="#3b82f6" />
                    <Text fontSize="10px" fontWeight="800" color="blue.500" textTransform="uppercase" letterSpacing="widest">
                      {appList.length} Nodes
                    </Text>
                  </HStack>
                  <HStack
                    gap={1.5}
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={useColorModeValue("green.50/50", "rgba(34, 197, 94, 0.05)")}
                    border="1px solid"
                    borderColor={useColorModeValue("green.100", "rgba(34, 197, 94, 0.1)")}
                  >
                    <LayoutGrid size={12} color="#22c55e" />
                    <Text fontSize="10px" fontWeight="800" color="green.500" textTransform="uppercase" letterSpacing="widest">
                      {subscribed_apps.length} Connected
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </Flex>
        </Box>

        {/* ── Sticky Command Search Bar ─────────────────────────────────────── */}
        <Box
          ref={stickyRef}
          position="sticky"
          top="-1px"
          zIndex={999}
          bg={isStuck ? stuckBg : "app.card.bg"}
          backdropFilter="blur(20px) saturate(180%)"
          borderBottom="1px solid"
          borderColor={isStuck ? stuckBorder : normalBorder}
          borderRadius={isStuck ? "lg" : "2xl"}
          mx={{ base: "-2", md: "1" }}
          p={2}
          transition="all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
          boxShadow={isStuck ? stuckShadow : normalShadow}
        >
          <InputGroup
            w="full"
            startElement={
              <Icon
                as={Search}
                color={useColorModeValue("gray.400", "gray.500")}
                boxSize={4}
              />
            }
          >
            <Input
              placeholder="Search your workspace commands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg="transparent"
              borderRadius="xl"
              h="12"
              border="none"
              fontSize="md"
              fontWeight="600"
              _placeholder={{ color: "gray.500", fontWeight: "500" }}
              _focus={{
                boxShadow: "none",
              }}
            />
          </InputGroup>
        </Box>





        {/* Grid Section */}
        {!error && (
          <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 4, xl: 5 }} gap={4}>
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
            {/* {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))}
            {filteredApps.map((app: any, index: number) => (
              <AppCard
                key={index}
                appConfig={app}
                handleNavigate={handleDefaultNavigate}
              />
            ))} */}
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
