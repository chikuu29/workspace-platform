/**
 * MemberCheckIn.tsx
 *
 * A high-impact, interaction-focused check-in cockpit.
 * Features a large input for Member ID, real-time status validation,
 * and prominent success/error visual feedback.
 */

import { memo, useState, useCallback, useRef, useEffect } from "react";
import {
  Box, VStack, HStack, Text, Heading, Input, Button, Circle,
  Flex, Icon, Spinner, Badge, Separator, Image,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  LuCheck, LuX, LuScan, LuUser, LuCreditCard, LuHistory,
  LuArrowRight, LuInfo,
} from "react-icons/lu";
import { toaster } from "@/components/ui/toaster";
import { GymApiService } from "./services/gymApi.service";

// ─── Sub-Components ─────────────────────────────────────────────────

const StatusIndicator = memo(({ status }: { status: "idle" | "success" | "error" | "loading" }) => {
  const colors = {
    idle: { bg: "gray.500/10", icon: LuScan, color: "gray.500" },
    success: { bg: "green.500", icon: LuCheck, color: "white" },
    error: { bg: "red.500", icon: LuX, color: "white" },
    loading: { bg: "blue.500", icon: Spinner, color: "white" },
  };

  const current = colors[status];

  return (
    <Circle
      size="120px" bg={current.bg} color={current.color}
      transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      boxShadow={status !== "idle" ? `0 0 40px ${current.bg}` : "none"}
      transform={status !== "idle" ? "scale(1.05)" : "scale(1)"}
    >
      {status === "loading" ? <Spinner size="xl" /> : <Icon as={current.icon} boxSize={current.status === "idle" ? 14 : 16} />}
    </Circle>
  );
});

// ─── Main Component ─────────────────────────────────────────────────

const MemberCheckIn = memo(() => {
  const [memberId, setMemberId] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error" | "loading">("idle");
  const [lastCheckin, setLastCheckin] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const panelBg = useColorModeValue("rgba(255,255,255,0.74)", "rgba(15,23,42,0.58)");
  const borderColor = useColorModeValue("rgba(226,232,240,0.84)", "rgba(255,255,255,0.12)");
  const muted = useColorModeValue("gray.500", "gray.400");

  const handleCheckIn = useCallback((id?: string) => {
    const targetId = id || memberId;
    if (!targetId) return;

    setStatus("loading");
    GymApiService.checkin(targetId).subscribe({
      next: (res) => {
        if (res.success) {
          setStatus("success");
          setLastCheckin(res.data);
          setMemberId("");
          toaster.create({ title: "Check-in Successful", type: "success" });
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          setStatus("error");
          toaster.create({ title: "Failed", description: res.message, type: "error" });
          setTimeout(() => setStatus("idle"), 4000);
        }
      },
      error: (err) => {
        setStatus("error");
        toaster.create({ title: "Network Error", description: err?.message, type: "error" });
        setTimeout(() => setStatus("idle"), 4000);
      },
    });
  }, [memberId]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheckIn();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Flex direction="column" align="center" justify="center" minH="70vh" w="full" py={10} animation="fade-in 0.6s ease">
      <VStack gap={10} w="full" maxW="600px">
        {/* Scanner Visualization */}
        <VStack gap={6}>
          <StatusIndicator status={status} />
          <VStack gap={1}>
            <Heading size="2xl" fontWeight="900" letterSpacing="tight">
              {status === "idle" ? "Scan Member ID" : status === "loading" ? "Validating..." : status === "success" ? "Access Granted" : "Access Denied"}
            </Heading>
            <Text color={muted} fontWeight="700">Enter or scan ID to record attendance</Text>
          </VStack>
        </VStack>

        {/* Input Terminal */}
        <Box
          p={8} borderRadius="3xl" bg={panelBg} border="2px solid"
          borderColor={status === "success" ? "green.500" : status === "error" ? "red.500" : borderColor}
          boxShadow="0 40px 80px -40px rgba(0,0,0,0.4)" w="full"
          transition="all 0.3s ease" backdropFilter="blur(20px)"
        >
          <VStack gap={6}>
            <HStack w="full" gap={3}>
              <Input
                ref={inputRef}
                value={memberId}
                onChange={(e) => setMemberId(e.target.value.toUpperCase())}
                onKeyDown={onKeyDown}
                placeholder="Ex: M-2024-001"
                size="xl"
                h="70px"
                fontSize="2xl"
                fontWeight="900"
                textAlign="center"
                letterSpacing="widest"
                borderRadius="2xl"
                bg="blackAlpha.50"
                border="none"
                _focus={{ bg: "blackAlpha.100", boxShadow: "none" }}
              />
            </HStack>
            <Button
              w="full" h="60px" size="xl" colorPalette="blue"
              borderRadius="2xl" fontWeight="900" onClick={() => handleCheckIn()}
              disabled={!memberId || status === "loading"}
            >
              RECORD CHECK-IN <LuArrowRight style={{ marginLeft: "8px" }} />
            </Button>
          </VStack>
        </Box>

        {/* Last Check-in Detail (Success State) */}
        {lastCheckin && status === "success" && (
          <Box
            w="full" p={6} borderRadius="3xl" bg="whiteAlpha.50"
            border="1px solid" borderColor="green.500/20"
            animation="slide-up 0.4s ease"
          >
            <HStack gap={5}>
              <Circle size="60px" bg="blue.500/10" color="blue.500">
                <LuUser size={30} />
              </Circle>
              <VStack align="start" gap={0} flex="1">
                <Text fontSize="xs" fontWeight="900" color="green.500" textTransform="uppercase">Recent Access</Text>
                <Heading size="md" fontWeight="900">{lastCheckin.data.member_name}</Heading>
                <HStack gap={3} mt={1}>
                  <Badge colorPalette="blue" variant="subtle" borderRadius="full">
                    {lastCheckin.data.member_id}
                  </Badge>
                  <Text fontSize="xs" color={muted} fontWeight="700">
                    {new Date(lastCheckin.data.timestamp).toLocaleTimeString()}
                  </Text>
                </HStack>
              </VStack>
              <VStack align="end" gap={1}>
                {lastCheckin.data.has_active_plan ? (
                  <Badge colorPalette="green" variant="solid" borderRadius="full" px={3}>
                    ACTIVE PLAN
                  </Badge>
                ) : (
                  <Badge colorPalette="orange" variant="solid" borderRadius="full" px={3}>
                    NO PLAN
                  </Badge>
                )}
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Shortcuts / Quick Tips */}
        <HStack gap={8} opacity={0.6}>
           <HStack gap={2}>
              <Circle size="6" bg="gray.500/20"><LuHistory size={12} /></Circle>
              <Text fontSize="xs" fontWeight="700">View Recent Logs</Text>
           </HStack>
           <HStack gap={2}>
              <Circle size="6" bg="gray.500/20"><LuInfo size={12} /></Circle>
              <Text fontSize="xs" fontWeight="700">Report Issue</Text>
           </HStack>
        </HStack>
      </VStack>
    </Flex>
  );
});

MemberCheckIn.displayName = "MemberCheckIn";
export default MemberCheckIn;
