import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Stack,
  Text,
  Badge,
  Grid,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Bot,
  Code,
  Terminal,
  Key,
  CreditCard,
  TrendingUp,
  Dumbbell,
  Hotel,
  Utensils,
} from "lucide-react";
import {
  ProgressCircleRoot,
  ProgressCircleRing,
  ProgressCircleValueText,
} from "@/components/ui/progress-circle";
import { Status } from "@/components/ui/status";

const MotionBox = motion.create(Box);
const MotionHeading = motion.create(Heading);
const MotionText = motion.create(Text);

interface SlideData {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
}

const SLIDES: SlideData[] = [
  {
    id: "ai",
    category: "AI AGENTIC APPS",
    title: "Agentic App Builder",
    description:
      "Deploy and orchestrate autonomous AI agents to automate complex workflows, customer assistance, and semantic search queries.",
    icon: Sparkles,
    gradientFrom: "purple.500",
    gradientTo: "pink.500",
    glowColor: "rgba(167, 139, 250, 0.12)",
  },
  {
    id: "custom",
    category: "CUSTOM SOFTWARE",
    title: "Bespoke SaaS Modules",
    description:
      "Compose tailored business modules, custom database grids, interactive forms, and analytical dashboards built for your specific operation.",
    icon: Code,
    gradientFrom: "blue.500",
    gradientTo: "cyan.500",
    glowColor: "rgba(59, 130, 246, 0.12)",
  },
  {
    id: "dev",
    category: "DEVELOPMENT SUPPORT",
    title: "Developer Console & CLI",
    description:
      "Access enterprise-grade deployment controls, secure API keys, live webhooks, and code compilation execution logs in real-time.",
    icon: Terminal,
    gradientFrom: "emerald.500",
    gradientTo: "teal.500",
    glowColor: "rgba(16, 185, 129, 0.12)",
  },
  {
    id: "saas",
    category: "SAAS SERVICES",
    title: "Multi-Tenant Subscriptions",
    description:
      "Manage organizations, adjust seat quotas, monitor MRR growth metrics, and process secure client billing under one unified portal.",
    icon: CreditCard,
    gradientFrom: "amber.500",
    gradientTo: "red.500",
    glowColor: "rgba(245, 158, 11, 0.12)",
  },
];

// --- Static Premium Showcases constructed via native Chakra UI v3 components ---

// 1. AI Workspace Chat Showcase
const AiWorkspaceShowcase: React.FC = React.memo(() => {
  return (
    <Stack gap={4} p={5} h="full" w="full" justify="space-between">
      {/* Header bar */}
      <Flex justify="space-between" align="center" pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={2}>
          <Box p={1.5} bg="purple.950" borderRadius="lg" border="1px solid" borderColor="purple.500/30">
            <Bot size={16} color="#c084fc" />
          </Box>
          <Text fontSize="xs" fontWeight="700" color="white">
            Workspace AI Copilot
          </Text>
        </Flex>
        <Status value="success" fontSize="2xs" fontWeight="600" color="whiteAlpha.700">
          Active
        </Status>
      </Flex>

      {/* Message space */}
      <Stack gap={3} flex="1" justify="center">
        {/* User Query */}
        <Flex justify="flex-end">
          <Box
            bg="whiteAlpha.100"
            border="1px solid"
            borderColor="whiteAlpha.200"
            px={3}
            py={2}
            borderRadius="xl"
            borderBottomRightRadius="2px"
            maxW="80%"
          >
            <Text fontSize="2xs" color="whiteAlpha.800" fontWeight="500">
              Draft an enterprise access policy for audit-logs.
            </Text>
          </Box>
        </Flex>

        {/* AI Answer */}
        <Flex justify="flex-start" gap={2}>
          <Box p={1} bg="purple.950" borderRadius="full" h="fit-content" border="1px solid" borderColor="purple.500/20">
            <Sparkles size={10} color="#c084fc" />
          </Box>
          <Box
            bg="purple.950/40"
            border="1px solid"
            borderColor="purple.500/20"
            px={3}
            py={2.5}
            borderRadius="xl"
            borderBottomLeftRadius="2px"
            maxW="85%"
          >
            <Text fontSize="2xs" color="purple.200" fontWeight="600" mb={1} textTransform="uppercase" letterSpacing="wider">
              AI Suggestion
            </Text>
            <Text fontSize="2xs" color="whiteAlpha.900" fontWeight="500" lineHeight="1.4">
              Access level verified. Policy generated: Enforces encrypted Read-Only permissions scoped to organization administrator role.
            </Text>
          </Box>
        </Flex>
      </Stack>

      {/* Fake Input */}
      <Flex
        align="center"
        justify="space-between"
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        px={3}
        py={2}
      >
        <Text fontSize="2xs" color="whiteAlpha.500">
          Message AI Copilot...
        </Text>
        <Send size={12} color="#a78bfa" />
      </Flex>
    </Stack>
  );
});
AiWorkspaceShowcase.displayName = "AiWorkspaceShowcase";

// 2. Custom Software Showcase
const CustomSoftwareShowcase: React.FC = React.memo(() => {
  const modules = useMemo(() => [
    { name: "Invoicing System", status: "Active", color: "emerald" },
    { name: "Customer CRM Portal", status: "Active", color: "blue" },
    { name: "Inventory Asset Log", status: "In Progress", color: "amber" },
  ], []);

  return (
    <Stack gap={3.5} p={5} h="full" w="full" justify="center">
      <Flex justify="space-between" align="center" pb={1} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Text fontSize="xs" fontWeight="800" color="white">
          Bespoke Business Modules
        </Text>
        <Badge colorPalette="blue" size="sm" variant="subtle" fontWeight="700">
          Tailored System
        </Badge>
      </Flex>
      <Stack gap={2.5}>
        {modules.map((mod, idx) => (
          <Flex
            key={idx}
            align="center"
            justify="space-between"
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.100"
            borderRadius="xl"
            px={3.5}
            py={2.5}
          >
            <Flex align="center" gap={2.5}>
              <Box p={1} bg="whiteAlpha.100" borderRadius="md">
                <Code size={14} color="#3b82f6" />
              </Box>
              <Text fontSize="2xs" color="white" fontWeight="600">
                {mod.name}
              </Text>
            </Flex>
            <Badge colorPalette={mod.color} size="sm" variant="subtle" fontWeight="700">
              {mod.status}
            </Badge>
          </Flex>
        ))}
      </Stack>
    </Stack>
  );
});
CustomSoftwareShowcase.displayName = "CustomSoftwareShowcase";

// 3. Developer Console Showcase
const DevSupportShowcase: React.FC = React.memo(() => {
  return (
    <Stack gap={4} p={5} h="full" w="full" justify="space-between">
      {/* Header bar */}
      <Flex justify="space-between" align="center" pb={2} borderBottom="1px solid" borderColor="whiteAlpha.100">
        <Flex align="center" gap={2}>
          <Box p={1.5} bg="blue.950" borderRadius="lg" border="1px solid" borderColor="blue.500/30">
            <Terminal size={16} color="#38bdf8" />
          </Box>
          <Text fontSize="xs" fontWeight="700" color="white">
            Developer Engine Console
          </Text>
        </Flex>
        <Flex align="center" gap={1.5}>
          <Box w={1.5} h={1.5} borderRadius="full" bg="emerald.500" />
          <Text fontSize="3xs" fontWeight="700" color="whiteAlpha.600" textTransform="uppercase">
            Live CLI
          </Text>
        </Flex>
      </Flex>

      {/* Code Console */}
      <Box
        flex="1"
        bg="blackAlpha.600"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        p={3}
        fontFamily="monospace"
        fontSize="3xs"
        color="emerald.400"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        gap={1.5}
      >
        <Text color="whiteAlpha.500">$ workspace-cli deploy --env=prod</Text>
        <Text color="emerald.300">✔ Build optimized (rolldown-runtime)</Text>
        <Text color="emerald.300">✔ API endpoints generated successfully</Text>
        <Text color="cyan.300">ℹ Webhook listening on /api/v1/callback</Text>
      </Box>

      {/* API Key box */}
      <Flex
        align="center"
        justify="space-between"
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="xl"
        px={3}
        py={2}
      >
        <Flex align="center" gap={1.5}>
          <Key size={12} color="#8F9BBA" />
          <Text fontSize="3xs" color="whiteAlpha.600" fontWeight="600">
            API_KEY
          </Text>
        </Flex>
        <Text fontSize="3xs" color="whiteAlpha.800" fontWeight="700">
          wk_live_7a8d••••••••f3a
        </Text>
      </Flex>
    </Stack>
  );
});
DevSupportShowcase.displayName = "DevSupportShowcase";

// 4. SaaS Business Subscriptions Showcase
const SaaSBusinessShowcase: React.FC = React.memo(() => {
  const services = useMemo(() => [
    { label: "Gym Management", icon: Dumbbell, color: "#10b981" },
    { label: "Hostel Booking", icon: Hotel, color: "#3b82f6" },
    { label: "Restaurant Systems", icon: Utensils, color: "#f59e0b" },
  ], []);

  return (
    <Grid templateColumns="4fr 5fr" gap={4} p={5} h="full" w="full" alignContent="center" alignItems="center">
      {/* Circle Progress Widget */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        bg="whiteAlpha.50"
        border="1px solid"
        borderColor="whiteAlpha.100"
        borderRadius="2xl"
        p={4}
        gap={2.5}
        h="full"
      >
        <ProgressCircleRoot value={92} size="lg" colorPalette="amber">
          <ProgressCircleRing cap="round" />
          <ProgressCircleValueText fontSize="sm" fontWeight="800" color="white">
            92%
          </ProgressCircleValueText>
        </ProgressCircleRoot>
        <Text fontSize="2xs" fontWeight="700" color="whiteAlpha.600" textTransform="uppercase" letterSpacing="wider">
          Active Services
        </Text>
        <Badge colorPalette="amber" size="sm" variant="subtle" fontWeight="700">
          Uptime 99.9%
        </Badge>
      </Flex>

      {/* Services List */}
      <Stack gap={2.5}>
        {services.map((service, idx) => {
          const IconComponent = service.icon;
          return (
            <Flex
              key={idx}
              align="center"
              gap={3}
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="whiteAlpha.100"
              borderRadius="xl"
              px={3.5}
              py={3}
            >
              <Box p={1.5} bg="whiteAlpha.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                <IconComponent size={14} color={service.color} />
              </Box>
              <Text fontSize="xs" color="white" fontWeight="700">
                {service.label}
              </Text>
            </Flex>
          );
        })}
      </Stack>
    </Grid>
  );
});
SaaSBusinessShowcase.displayName = "SaaSBusinessShowcase";

export const MarketingShowcase: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Auto-rotating slides effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const selectSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const slideData = useMemo(() => SLIDES[currentSlide], [currentSlide]);

  const renderActiveShowcase = (id: string) => {
    switch (id) {
      case "ai":
        return <AiWorkspaceShowcase />;
      case "custom":
        return <CustomSoftwareShowcase />;
      case "dev":
        return <DevSupportShowcase />;
      case "saas":
        return <SaaSBusinessShowcase />;
      default:
        return null;
    }
  };

  const navItemHover = useMemo(() => ({ scale: 1.05 }), []);

  return (
    <Stack
      gap={8}
      w="full"
      h="full"
      justifyContent="center"
      position="relative"
      px={{ base: 4, lg: 8 }}
      py={8}
    >
      {/* Decorative Orbs behind the Marketing Showcase */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={slideData.id + "-orb"}
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="380px"
          h="380px"
          borderRadius="full"
          bg={slideData.glowColor}
          filter="blur(80px)"
          zIndex="0"
          pointerEvents="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Main Glassmorphic Panel */}
      <MotionBox
        zIndex="1"
        p={5}
        borderRadius="3xl"
        bg="whiteAlpha.50"
        // backdropFilter="blur(20px)"
        // border="1px solid"
        // borderColor="whiteAlpha.100"
        // boxShadow="0 25px 60px -15px rgba(0, 0, 0, 0.4)"
        boxShadow={"sm"}
        position="relative"
        overflow="hidden"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Flex
          direction="column"
          h={{ base: "240px", md: "280px" }}
          w="full"
          bg="navy.900"
          borderRadius="2xl"
          overflow="hidden"
          border="1px solid"
          borderColor="whiteAlpha.50"
          mb={6}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={slideData.id}
              w="full"
              h="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderActiveShowcase(slideData.id)}
            </MotionBox>
          </AnimatePresence>
        </Flex>

        {/* Feature Details Content (Auto-updated) */}
        <Stack gap={2} minH="110px">
          <AnimatePresence mode="wait">
            <MotionBox
              key={slideData.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Text
                fontSize="xs"
                fontWeight="800"
                letterSpacing="widest"
                bgGradient="to-r"
                gradientFrom={slideData.gradientFrom}
                gradientTo={slideData.gradientTo}
                bgClip="text"
                textTransform="uppercase"
                mb={1}
              >
                {slideData.category}
              </Text>
              <MotionHeading
                fontSize="xl"
                fontWeight="800"
                color="app.text.accent"
                mb={2}
                letterSpacing="tight"
              >
                {slideData.title}
              </MotionHeading>
              <MotionText
                fontSize="sm"
                color="secondaryGray.500"
                lineHeight="tall"
                fontWeight="500"
              >
                {slideData.description}
              </MotionText>
            </MotionBox>
          </AnimatePresence>
        </Stack>
      </MotionBox>

      {/* Manual Selection Tabs / Indicators */}
      <Flex zIndex="1" gap={3} mt={2} align="center" justify="center">
        {SLIDES.map((slide, idx) => {
          const IconComponent = slide.icon;
          const isActive = idx === currentSlide;
          return (
            <MotionBox
              key={slide.id}
              whileHover={navItemHover}
              onClick={() => selectSlide(idx)}
              cursor="pointer"
              position="relative"
            >
              <Flex
                align="center"
                justify="center"
                h="10"
                w={isActive ? "32" : "10"}
                borderRadius="full"
                border="1px solid"
                borderColor={isActive ? "brand.400" : "whiteAlpha.100"}
                bg={isActive ? "#728fea" : "whiteAlpha.50"}
                transition="all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)"
                gap={2}
                px={isActive ? 4 : 0}
              >
                <IconComponent
                  size={16}
                  color={isActive ? "#f1f1f1" : "#a3aed0"}
                  style={{ transition: "color 0.3s" }}
                />
                {isActive && (
                  <Text
                    fontSize="xs"
                    fontWeight="800"
                    color="white"
                    whiteSpace="nowrap"
                  >
                    {slide.id.toUpperCase()}
                  </Text>
                )}
              </Flex>
            </MotionBox>
          );
        })}
      </Flex>
    </Stack>
  );
};

export default React.memo(MarketingShowcase);
