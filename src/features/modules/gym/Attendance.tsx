/**
 * MemberCheckIn.tsx
 *
 * A high-impact, interaction-focused check-in cockpit.
 * Features a dual-column workspace for reception desks, providing instant scanning feedback,
 * simulated biometric/card scanner HUD, Web Audio synthesized chimes, and a live check-in activity stream.
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Heading, Input, Button, Circle,
  Flex, Icon, Spinner, Badge, Grid, GridItem, Skeleton,
  SimpleGrid, IconButton,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  Check, X, Scan, User, CreditCard, History,
  ArrowRight, Info, RefreshCw, Volume2, VolumeX, Flame, Activity, Users,
  Maximize2, Minimize2
} from "lucide-react";
import { toaster } from "@/components/ui/toaster";
import { GymApiService } from "./services/gymApi.service";
import { PageHeader } from "@/core/components/PageHeader"; ``
import { useNavActionStore } from "@/core/store/useNavActionStore";
import { useMaximize } from "@/core/hooks/useMaximize";
import { useWorkspaceRouter } from "@/core/hooks/useWorkspaceRouter";
import { Avatar } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

// ─── Interfaces ──────────────────────────────────────────────────────

interface CheckInActivity {
  id: string;
  member_id: string;
  member_name: string;
  timestamp: string;
  has_active_plan: boolean;
  status: "success" | "error";
  error_message?: string;
}

// ─── Web Audio API Engine Hook ───────────────────────────────────────

const useAudioFeedback = (isMuted: boolean) => {
  const playSuccess = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.16); // D6

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Web Audio API blocked or not supported", err);
    }
  }, [isMuted]);

  const playError = useCallback(() => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.setValueAtTime(147, ctx.currentTime + 0.12); // D3

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (err) {
      console.warn("Web Audio API error", err);
    }
  }, [isMuted]);

  return { playSuccess, playError };
};

// ─── Sub-Components ───────────────────────────────────────────────────

/**
 * ScannerHUD Component
 * Renders a mock biometric/card scanning viewport with animated laser lines and target borders.
 */
interface ScannerHUDProps {
  status: "idle" | "loading" | "success" | "error";
  memberName?: string;
  errorMessage?: string;
  h?: string | number;
}

const ScannerHUD = memo(({ status, memberName, errorMessage, h = "240px" }: ScannerHUDProps) => {
  const statusColors = {
    idle: {
      color: "cyan.400",
      glowColor: "rgba(34, 211, 238, 0.15)",
    },
    loading: {
      color: "orange.400",
      glowColor: "rgba(251, 146, 60, 0.25)",
    },
    success: {
      color: "emerald.400",
      glowColor: "rgba(52, 211, 153, 0.4)",
    },
    error: {
      color: "rose.400",
      glowColor: "rgba(251, 113, 133, 0.4)",
    },
  };

  const current = statusColors[status] || statusColors.idle;

  return (
    <Box
      position="relative"
      w="full"
      h={h}
      bg="gray.950"
      borderRadius="2xl"
      overflow="hidden"
      border="2px solid"
      borderColor={status === "success" ? "emerald.500" : status === "error" ? "rose.500" : "whiteAlpha.100"}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow={status !== "idle" ? `inset 0 0 30px ${current.glowColor}, 0 0 30px ${current.glowColor}` : "inset 0 0 20px rgba(0,0,0,0.8)"}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Grid Background Pattern */}
      <Box
        position="absolute"
        inset={0}
        opacity={status === "loading" ? 0.35 : 0.15}
        background="linear-gradient(rgba(18, 24, 38, 0.95), rgba(18, 24, 38, 0.95)),
                    linear-gradient(0deg, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 20px 20px,
                    linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px) 0 0 / 20px 20px"
        animation={status === "loading" ? "grid-anim 0.8s linear infinite" : "none"}
        pointerEvents="none"
      />

      {/* Cyber Corners Brackets */}
      <Box position="absolute" top="4" left="4" w="6" h="6" borderTop="3px solid" borderLeft="3px solid" borderColor={current.color} transition="border-color 0.3s" />
      <Box position="absolute" top="4" right="4" w="6" h="6" borderTop="3px solid" borderRight="3px solid" borderColor={current.color} transition="border-color 0.3s" />
      <Box position="absolute" bottom="4" left="4" w="6" h="6" borderBottom="3px solid" borderLeft="3px solid" borderColor={current.color} transition="border-color 0.3s" />
      <Box position="absolute" bottom="4" right="4" w="6" h="6" borderBottom="3px solid" borderRight="3px solid" borderColor={current.color} transition="border-color 0.3s" />

      {/* Sweeping Scanning Laser */}
      {(status === "idle" || status === "loading") && (
        <Box
          position="absolute"
          left="4"
          right="4"
          h="2px"
          bg={status === "loading" ? "orange.400" : "cyan.400"}
          boxShadow={`0 0 10px ${status === "loading" ? "var(--chakra-colors-orange-400)" : "var(--chakra-colors-cyan-400)"}`}
          animation={`scan-line ${status === "loading" ? "1.2s" : "3s"} linear infinite`}
          pointerEvents="none"
        />
      )}

      {/* Overlay Status Content */}
      {status === "idle" && (
        <Flex direction="column" align="center" gap={3} pointerEvents="none" animation="pulse-light 2.5s infinite">
          <Circle size="12" bg="cyan.500/10" color="cyan.400" border="1px dashed" borderColor="cyan.400/30">
            <Scan size={22} />
          </Circle>
          <Text fontSize="xs" fontWeight="900" color="cyan.400" letterSpacing="widest" textTransform="uppercase">
            Ready for Scan
          </Text>
        </Flex>
      )}

      {status === "loading" && (
        <Flex direction="column" align="center" gap={3} pointerEvents="none">
          <Spinner size="md" color="orange.400" />
          <Text fontSize="xs" fontWeight="900" color="orange.400" letterSpacing="widest" textTransform="uppercase">
            Verifying ID
          </Text>
        </Flex>
      )}

      {status === "success" && (
        <Flex direction="column" align="center" gap={3} pointerEvents="none" animation="scale-up 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)">
          <Circle size="16" bg="emerald.500" color="white" boxShadow="0 0 25px rgba(16, 185, 129, 0.4)">
            <Check size={32} strokeWidth={3} />
          </Circle>
          <Flex direction="column" align="center" gap={0.5}>
            <Text fontSize="lg" fontWeight="950" color="white" textAlign="center" truncate maxW="380px">
              {memberName || "Access Granted"}
            </Text>
            <Text fontSize="2xs" fontWeight="900" color="emerald.400" letterSpacing="widest" textTransform="uppercase">
              Access Approved
            </Text>
          </Flex>
        </Flex>
      )}

      {status === "error" && (
        <Flex direction="column" align="center" gap={3} pointerEvents="none" animation="scale-up 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)">
          <Circle size="16" bg="rose.500" color="white" boxShadow="0 0 25px rgba(244, 63, 94, 0.4)">
            <X size={32} strokeWidth={3} />
          </Circle>
          <Flex direction="column" align="center" gap={0.5}>
            <Text fontSize="sm" fontWeight="950" color="white" textAlign="center" px={4} truncate maxW="380px">
              {errorMessage || "Invalid Member ID"}
            </Text>
            <Text fontSize="2xs" fontWeight="900" color="rose.400" letterSpacing="widest" textTransform="uppercase">
              Access Denied
            </Text>
          </Flex>
        </Flex>
      )}
    </Box>
  );
});

ScannerHUD.displayName = "ScannerHUD";

/**
 * StatsGrid Component
 * Displays key attendance stats computed on dashboard mount.
 */
interface StatsGridProps {
  checkinsToday: number;
  activeMembers: number;
  capacityLoad: number;
  loading: boolean;
}

const StatsGrid = memo(({ checkinsToday, activeMembers, capacityLoad, loading }: StatsGridProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const bg = useColorModeValue("rgba(255,255,255,0.76)", "rgba(15,23,42,0.52)");
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  return (
    <SimpleGrid columns={3} gap={4} w="full">
      {/* Scans Today */}
      <Box p={4} borderRadius="2xl" bg={bg} border="1px solid" borderColor={border} backdropFilter="blur(16px)">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0.5}>
            <Text fontSize="2xs" color={muted} fontWeight="900" textTransform="uppercase">
              Today's Scans
            </Text>
            <Skeleton loading={loading} h="6">
              <Heading size="md" fontWeight="950" letterSpacing="tight" color="app.text.primary">
                {checkinsToday}
              </Heading>
            </Skeleton>
          </VStack>
          <Circle size="8" bg="green.500/10" color="green.500">
            <Activity size={16} />
          </Circle>
        </HStack>
      </Box>

      {/* Active Members */}
      <Box p={4} borderRadius="2xl" bg={bg} border="1px solid" borderColor={border} backdropFilter="blur(16px)">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0.5}>
            <Text fontSize="2xs" color={muted} fontWeight="900" textTransform="uppercase">
              Active Users
            </Text>
            <Skeleton loading={loading} h="6">
              <Heading size="md" fontWeight="950" letterSpacing="tight" color="app.text.primary">
                {activeMembers}
              </Heading>
            </Skeleton>
          </VStack>
          <Circle size="8" bg="blue.500/10" color="blue.500">
            <Users size={16} />
          </Circle>
        </HStack>
      </Box>

      {/* Floor Density */}
      <Box p={4} borderRadius="2xl" bg={bg} border="1px solid" borderColor={border} backdropFilter="blur(16px)">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0.5}>
            <Text fontSize="2xs" color={muted} fontWeight="900" textTransform="uppercase">
              Capacity
            </Text>
            <Skeleton loading={loading} h="6">
              <Heading size="md" fontWeight="950" letterSpacing="tight" color="app.text.primary">
                {capacityLoad}%
              </Heading>
            </Skeleton>
          </VStack>
          <Circle size="8" bg="orange.500/10" color="orange.500">
            <Flame size={16} />
          </Circle>
        </HStack>
      </Box>
    </SimpleGrid>
  );
});

StatsGrid.displayName = "StatsGrid";

/**
 * LiveActivityStream Component
 * Scrolling logs container that renders checking logs from the current session.
 */
interface LiveActivityStreamProps {
  activities: CheckInActivity[];
  onViewMember: (memberId: string) => void;
}

const LiveActivityStream = memo(({ activities, onViewMember }: LiveActivityStreamProps) => {
  const muted = useColorModeValue("gray.500", "gray.400");
  const cardBg = useColorModeValue("rgba(255,255,255,0.76)", "rgba(15,23,42,0.52)");
  const border = useColorModeValue("rgba(226,232,240,0.8)", "rgba(255,255,255,0.08)");

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "00:00:00";
    }
  };

  return (
    <Box
      w="full"
      p={5}
      borderRadius="2xl"
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      backdropFilter="blur(16px)"
      boxShadow="0 15px 35px -20px rgba(0,0,0,0.3)"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={0.5}>
            <Heading size="sm" fontWeight="950" color="app.text.primary">
              Live Attendance Stream
            </Heading>
            <Text fontSize="xs" fontWeight="700" color={muted}>
              Recent front desk attendance scans
            </Text>
          </VStack>

          <HStack gap={1.5} align="center">
            <Circle size="2" bg="rose.500" animation="pulse-light 1.2s infinite" />
            <Badge colorPalette="rose" variant="subtle" borderRadius="full" px={2} py={0.5} fontSize="2xs" fontWeight="900">
              LIVE
            </Badge>
          </HStack>
        </HStack>

        <Box maxH="320px" overflowY="auto" pr={1} css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { bg: "transparent" },
          "&::-webkit-scrollbar-thumb": { bg: "rgba(255,255,255,0.1)", borderRadius: "2px" },
        }}>
          <VStack align="stretch" gap={2}>
            <AnimatePresence initial={false}>
              {activities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <HStack
                    justify="space-between"
                    p={3}
                    borderRadius="xl"
                    bg={activity.status === "success" ? "blue.500/8" : "rose.500/8"}
                    border="1px solid"
                    borderColor={activity.status === "success" ? "blue.500/12" : "rose.500/12"}
                    cursor="pointer"
                    _hover={{
                      bg: activity.status === "success" ? "blue.500/12" : "rose.500/12",
                      transform: "translateX(2px)"
                    }}
                    transition="all 0.18s ease"
                    onClick={() => onViewMember(activity.member_id)}
                  >
                    <HStack gap={3} minW={0}>
                      <Avatar name={activity.member_name} size="xs" shape="rounded" />
                      <VStack align="start" gap={0} minW={0}>
                        <Text fontSize="xs" fontWeight="950" color="app.text.primary" truncate>
                          {activity.member_name}
                        </Text>
                        <Text fontSize="3xs" color={muted} fontWeight="800">
                          {activity.member_id} • {formatTime(activity.timestamp)}
                        </Text>
                      </VStack>
                    </HStack>

                    <VStack align="end" gap={1} flexShrink={0}>
                      {activity.status === "success" ? (
                        activity.has_active_plan ? (
                          <Badge colorPalette="green" variant="solid" borderRadius="full" fontSize="3xs" px={1.5} py={0.5}>
                            Active
                          </Badge>
                        ) : (
                          <Badge colorPalette="orange" variant="solid" borderRadius="full" fontSize="3xs" px={1.5} py={0.5}>
                            No Plan
                          </Badge>
                        )
                      ) : (
                        <Badge colorPalette="rose" variant="solid" borderRadius="full" fontSize="3xs" px={1.5} py={0.5}>
                          Denied
                        </Badge>
                      )}
                    </VStack>
                  </HStack>
                </motion.div>
              ))}
            </AnimatePresence>

            {activities.length === 0 && (
              <VStack py={12} gap={2}>
                <Circle size="10" bg="whiteAlpha.50" color={muted}>
                  <History size={18} />
                </Circle>
                <Text fontSize="xs" color={muted} fontWeight="800">
                  No check-ins logged in this session.
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
});

LiveActivityStream.displayName = "LiveActivityStream";

/**
 * LiveClock Component
 * Displays the current date and time with a blinking scanner indicator.
 * Self-contained component to prevent dashboard-wide render cycles on clock ticks.
 */
const LiveClock = memo(() => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = time.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const textColor = useColorModeValue("cyan.600", "cyan.400");
  const bg = useColorModeValue("rgba(6, 182, 212, 0.05)", "rgba(6, 182, 212, 0.03)");
  const border = useColorModeValue("rgba(6, 182, 212, 0.2)", "rgba(6, 182, 212, 0.1)");

  return (
    <HStack
      px={4}
      py={1.5}
      borderRadius="xl"
      bg={bg}
      border="1px solid"
      borderColor={border}
      gap={2.5}
      align="center"
      fontSize="xs"
      fontWeight="900"
      color={textColor}
      fontFamily="monospace"
      boxShadow="0 2px 10px rgba(6, 182, 212, 0.03)"
      mt={1}
    >
      <Circle size="1.5" bg="cyan.400" animation="pulse-light 1s infinite" />
      <Text>{formattedDate}</Text>
      <Text opacity={0.4} fontWeight="normal">•</Text>
      <Text letterSpacing="wider">{formattedTime}</Text>
    </HStack>
  );
});

LiveClock.displayName = "LiveClock";

// ─── Main Component ───────────────────────────────────────────────────

const Attendance = memo(() => {
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [lastCheckin, setLastCheckin] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Stats dashboard state
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const { navigateTo } = useWorkspaceRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const panelBg = useColorModeValue("rgba(255,255,255,0.76)", "rgba(15,23,42,0.52)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.08)");
  const muted = useColorModeValue("gray.500", "gray.400");

  // Local storage sound & activity states
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("gym_checkin_sound_muted");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [recentCheckins, setRecentCheckins] = useState<CheckInActivity[]>(() => {
    try {
      const saved = localStorage.getItem("gym_recent_checkins");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sound chimes hook
  const { playSuccess, playError } = useAudioFeedback(isMuted);

  // Fetch KPI Stats for stats indicators
  const fetchKPIs = useCallback(() => {
    setStatsLoading(true);
    GymApiService.getGymKPIs().subscribe({
      next: (res) => {
        setStats(res);
        setStatsLoading(false);
      },
      error: () => {
        setStatsLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  // Main check-in core handler
  const handleCheckIn = useCallback(() => {
    if (!memberId) return;
    const targetId = memberId.trim().toUpperCase();

    setStatus("loading");
    GymApiService.checkin(targetId).subscribe({
      next: (res) => {
        if (res.success) {
          setStatus("success");
          setLastCheckin(res.data);
          setMemberId("");
          playSuccess();
          toaster.create({ title: "Check-in Successful", type: "success" });

          // Extract names and status safely
          const name = res.data?.data?.member_name || "Unknown Member";
          const hasActivePlan = res.data?.data?.has_active_plan ?? false;

          const newActivity: CheckInActivity = {
            id: Date.now().toString(),
            member_id: targetId,
            member_name: name,
            timestamp: new Date().toISOString(),
            has_active_plan: hasActivePlan,
            status: "success",
          };

          setRecentCheckins((prev) => {
            const updated = [newActivity, ...prev].slice(0, 15);
            try {
              localStorage.setItem("gym_recent_checkins", JSON.stringify(updated));
            } catch { }
            return updated;
          });

          // Increment scans today KPI locally
          setStats((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              kpis: {
                ...prev.kpis,
                checkins_today: (prev.kpis?.checkins_today || 0) + 1,
              },
            };
          });

          setTimeout(() => {
            setStatus("idle");
          }, 3000);
        } else {
          setStatus("error");
          setErrorMessage(res.message || "Failed to record check-in");
          playError();
          toaster.create({ title: "Access Denied", description: res.message, type: "error" });

          const newActivity: CheckInActivity = {
            id: Date.now().toString(),
            member_id: targetId,
            member_name: "Access Attempt Failed",
            timestamp: new Date().toISOString(),
            has_active_plan: false,
            status: "error",
            error_message: res.message,
          };

          setRecentCheckins((prev) => {
            const updated = [newActivity, ...prev].slice(0, 15);
            try {
              localStorage.setItem("gym_recent_checkins", JSON.stringify(updated));
            } catch { }
            return updated;
          });

          setTimeout(() => {
            setStatus("idle");
          }, 4000);
        }
      },
      error: (err) => {
        setStatus("error");
        const msg = err?.message || "Profile not found";
        setErrorMessage(msg);
        playError();
        toaster.create({ title: "Network Error", description: msg, type: "error" });

        const newActivity: CheckInActivity = {
          id: Date.now().toString(),
          member_id: targetId,
          member_name: "Verification Failed",
          timestamp: new Date().toISOString(),
          has_active_plan: false,
          status: "error",
          error_message: msg,
        };

        setRecentCheckins((prev) => {
          const updated = [newActivity, ...prev].slice(0, 15);
          try {
            localStorage.setItem("gym_recent_checkins", JSON.stringify(updated));
          } catch { }
          return updated;
        });

        setTimeout(() => {
          setStatus("idle");
        }, 4000);
      },
    });
  }, [memberId, playSuccess, playError]);

  // Stable Callbacks
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMemberId(e.target.value.toUpperCase());
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheckIn();
  }, [handleCheckIn]);

  const handleBtnSubmit = useCallback(() => {
    handleCheckIn();
  }, [handleCheckIn]);

  const handleReset = useCallback(() => {
    setMemberId("");
    setStatus("idle");
    setLastCheckin(null);
    setErrorMessage("");
  }, []);

  const handleViewHistory = useCallback(() => {
    navigateTo("attendanceReport");
  }, [navigateTo]);

  const handleViewMember = useCallback((id: string) => {
    navigateTo(`members/${id}`);
  }, [navigateTo]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const updated = !prev;
      try {
        localStorage.setItem("gym_checkin_sound_muted", JSON.stringify(updated));
      } catch { }
      return updated;
    });
  }, []);

  const handleFocusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Autofocus keyboard listener
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === "idle") {
      inputRef.current?.focus();
    }
  }, [status]);

  const setNavActionConfig = useNavActionStore((state) => state.setNavActionConfig);
  const clearActions = useNavActionStore((state) => state.clearActions);

  useEffect(() => {
    setNavActionConfig([
      {
        id: "refresh",
        icon: RefreshCw,
        bg: "gradient_cyan_purple",
        color: "white",
        ariaLabel: "Reset terminal",
        onClick: handleReset,
        flexShrink: 0,
      },
      {
        id: "history",
        label: "History",
        icon: History,
        bg: "gradient_cyan_purple",
        color: "white",
        onClick: handleViewHistory,
      },
    ]);
    return () => clearActions();
  }, [setNavActionConfig, clearActions, handleReset, handleViewHistory]);

  const kpis = stats?.kpis;
  const todayScans = kpis?.checkins_today || 0;
  const activeMembers = kpis?.active_members || 0;
  const capacityLoad = kpis?.trainer_utilization || 0;

  const pageRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const {
    isMaximized: isPageMaximized,
    toggle: togglePageMaximize,
    fullscreenProps: pageFullscreenProps,
    contentWrapperProps: pageWrapperProps,
  } = useMaximize(pageRef, { maxW: "1400px", centerContent: false });

  const {
    isMaximized: isTerminalMaximized,
    toggle: toggleTerminalMaximize,
    fullscreenProps: terminalFullscreenProps,
    contentWrapperProps: terminalWrapperProps,
  } = useMaximize(terminalRef, { maxW: "800px", centerContent: true });

  return (
    <Box ref={pageRef} {...pageFullscreenProps}>
      <Box {...pageWrapperProps}>
        <Flex direction="column" minH="70vh" w="full" py={6} animation="fade-in 0.4s ease-out">
          {/* Dynamic Keyframe Animations Injection */}
          <style>{`
        @keyframes scan-line {
          0% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
          100% { top: 0%; opacity: 0.3; }
        }
        @keyframes pulse-light {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        @keyframes grid-anim {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        @keyframes scale-up {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

          {/* Centered High-Tech Cockpit Header */}
          <VStack
            w="full"
            align="center"
            justify="center"
            gap={4}
            mb={6}
            textAlign="center"
            position="relative"
            py={2}
            onClick={togglePageMaximize}
            cursor="pointer"
            _hover={{ transform: "scale(1.01)", opacity: 0.95 }}
            transition="all 0.2s ease"
            title={isPageMaximized ? "Click to exit fullscreen" : "Click to enter fullscreen"}
          >
            <Flex
              align="center"
              justify="center"
              w="54px"
              h="54px"
              bg="linear-gradient(135deg, #06b6d4, #6366f1)"
              borderRadius="2xl"
              color="white"
              boxShadow="0 10px 25px -8px rgba(6, 182, 212, 0.6)"
              animation="pulse-light 3s infinite"
            >
              <Scan size={26} />
            </Flex>

            <VStack gap={1} align="center">
              <HStack gap={3} align="center" justify="center">
                <Heading
                  size="2xl"
                  fontWeight="950"
                  letterSpacing="tight"
                  bgGradient="linear-gradient(135deg, #06b6d4, #6366f1)"
                  bgClip="text"
                  color="transparent"
                >
                  Attendance Terminal
                </Heading>
                <Badge colorPalette="green" variant="solid" borderRadius="full" px={2.5} py={0.5} fontSize="3xs" fontWeight="900">
                  ONLINE
                </Badge>
              </HStack>

              <Text fontSize="sm" fontWeight="700" color={muted} maxW="600px">
                Secure barcode scanning and automated attendance verification console.
              </Text>

              <Box mt={1.5}>
                <LiveClock />
              </Box>
            </VStack>
          </VStack>

          <Grid templateColumns={{ base: "1fr", lg: "1.3fr 1fr" }} gap={8} w="full" mt={6} alignItems="start">
            {/* Left Column: Scanning Desk Terminal */}
            <GridItem w="full">
              <VStack gap={6} w="full">
                <Box ref={terminalRef} {...terminalFullscreenProps}>
                  <Box {...terminalWrapperProps}>
                    <Box
                      w="full"
                      p={isTerminalMaximized ? 8 : 6}
                      borderRadius="3xl"
                      bg={panelBg}
                      border="1px solid"
                      borderColor={status === "success" ? "emerald.500/40" : status === "error" ? "rose.500/40" : borderColor}
                      boxShadow={isTerminalMaximized ? "0 40px 80px -20px rgba(0, 0, 0, 0.6)" : "0 30px 60px -25px rgba(0, 0, 0, 0.4)"}
                      backdropFilter="blur(20px)"
                      transition="all 0.35s ease"
                      onClick={handleFocusInput}
                      cursor="pointer"
                    >
                      <VStack gap={5}>
                        {/* HUD Header */}
                        <HStack w="full" justify="space-between" align="center">
                          <HStack gap={2}>
                            <Circle size="2" bg={status === "idle" ? "cyan.400" : status === "loading" ? "orange.400" : status === "success" ? "emerald.400" : "rose.400"} />
                            <Text fontSize="xs" fontWeight="900" color="app.text.muted" letterSpacing="wider">
                              ATTENDANCE HUD
                            </Text>
                          </HStack>

                          <HStack gap={1.5}>
                            <IconButton
                              variant="ghost"
                              colorPalette="gray"
                              size="sm"
                              borderRadius="xl"
                              onClick={handleToggleMute}
                              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
                            >
                              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            </IconButton>
                            <IconButton
                              variant="ghost"
                              colorPalette="gray"
                              size="sm"
                              borderRadius="xl"
                              onClick={toggleTerminalMaximize}
                              aria-label={isTerminalMaximized ? "Exit fullscreen" : "Enter fullscreen"}
                            >
                              {isTerminalMaximized ? <Minimize2 size={15} strokeWidth={2.5} /> : <Maximize2 size={15} strokeWidth={2.5} />}
                            </IconButton>
                          </HStack>
                        </HStack>

                        {/* Interactive Scanner Viewport */}
                        <ScannerHUD
                          status={status}
                          memberName={lastCheckin?.data?.member_name}
                          errorMessage={errorMessage}
                          h={isTerminalMaximized ? "360px" : "240px"}
                        />

                        {/* Input Controls */}
                        <VStack w="full" gap={4} mt={2}>
                          <Input
                            ref={inputRef}
                            value={memberId}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="SCAN CARD OR ENTER MEMBER ID"
                            size="lg"
                            h="64px"
                            fontSize="xl"
                            fontWeight="950"
                            textAlign="center"
                            letterSpacing="widest"
                            borderRadius="2xl"
                            bg={useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(10, 15, 30, 0.65)")}
                            border="2px solid"
                            borderColor={useColorModeValue("gray.200", "whiteAlpha.100")}
                            backdropFilter="blur(10px)"
                            _hover={{
                              borderColor: useColorModeValue("cyan.400", "cyan.500/50"),
                              bg: useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(10, 15, 30, 0.75)"),
                            }}
                            _focus={{
                              borderColor: "cyan.500",
                              bg: useColorModeValue("white", "rgba(5, 6, 12, 0.9)"),
                              boxShadow: "0 0 20px rgba(6, 182, 212, 0.25)",
                            }}
                            _placeholder={{
                              color: useColorModeValue("gray.400", "whiteAlpha.400"),
                              fontSize: "sm",
                              fontWeight: "800",
                              letterSpacing: "widest",
                            }}
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                            disabled={status === "loading"}
                          />

                          <Button
                            w="full"
                            h="56px"
                            size="lg"
                            borderRadius="2xl"
                            fontWeight="950"
                            onClick={handleBtnSubmit}
                            disabled={!memberId || status === "loading"}
                            bgGradient="linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)"
                            color="white"
                            boxShadow="0 4px 20px rgba(6, 182, 212, 0.3)"
                            _hover={{
                              bgGradient: "linear-gradient(135deg, #22d3ee 0%, #60a5fa 50%, #818cf8 100%)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 8px 30px rgba(6, 182, 212, 0.5)",
                            }}
                            _active={{
                              transform: "translateY(0)",
                              boxShadow: "0 4px 15px rgba(6, 182, 212, 0.3)",
                            }}
                            _disabled={{
                              opacity: 0.4,
                              cursor: "not-allowed",
                              transform: "none",
                              boxShadow: "none",
                            }}
                            transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
                          >
                            LOG ATTENDANCE <ArrowRight style={{ marginLeft: "8px" }} size={16} />
                          </Button>
                        </VStack>
                      </VStack>
                    </Box>
                  </Box>
                </Box>

                {/* Sub-Card: Member quick lookup guidelines */}
                <HStack w="full" p={4} bg="whiteAlpha.50" border="1px solid" borderColor="whiteAlpha.100" borderRadius="2xl" gap={3}>
                  <Info size={16} style={{ color: "var(--chakra-colors-blue-500)", flexShrink: 0 }} />
                  <Text fontSize="xs" fontWeight="700" color={muted}>
                    Attendance focus is maintained automatically. Scan ID cards successively to log attendance.
                  </Text>
                </HStack>
              </VStack>
            </GridItem>

            {/* Right Column: KPIs & Live feed streams */}
            <GridItem w="full">
              <VStack gap={6} w="full">
                {/* KPI Counts */}
                <StatsGrid
                  checkinsToday={todayScans}
                  activeMembers={activeMembers}
                  capacityLoad={capacityLoad}
                  loading={statsLoading}
                />

                {/* Live Activities Stream log */}
                <LiveActivityStream
                  activities={recentCheckins}
                  onViewMember={handleViewMember}
                />
              </VStack>
            </GridItem>
          </Grid>
        </Flex>
      </Box>
    </Box>
  );
});

Attendance.displayName = "Attendance";
export default Attendance;
