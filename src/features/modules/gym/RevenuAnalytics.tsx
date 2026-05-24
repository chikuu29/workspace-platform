import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Progress,
  SimpleGrid,
  Badge,
  Flex,
  Separator,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { motion } from "framer-motion";
import { ArrowUpRight, Users, TrendingUp, Activity } from "lucide-react";
import LoadIcon from "@/core/utils/hooks/LoadIcon";

const MotionBox = motion.create(Box as any);

/**
 * MetricTile
 * A compact metric display for the intelligence hub.
 */
const MetricTile = ({ title, value, icon, change, color }: any) => {
  const bg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <MotionBox
      whileHover={{ y: -2 }}
      p={4}
      bg={bg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      flex="1"
    >
      <HStack justify="space-between" mb={2}>
        <Box p={2} borderRadius="lg" bg={`${color}.100/20`} color={`${color}.500`}>
          <LoadIcon iconName={icon} size="20px" />
        </Box>
        <Badge colorPalette={change > 0 ? "green" : "red"} variant="subtle" size="sm">
          {change > 0 ? "+" : ""}{change}%
        </Badge>
      </HStack>
      <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>{title}</Text>
      <Heading size="md" fontWeight="800">{value}</Heading>
    </MotionBox>
  );
};

/**
 * RevenueStreamPulse
 * Segmented progress bars showing revenue distribution.
 */
const RevenueStreamPulse = () => {
  const streams = [
    { label: "Memberships", value: 32100, color: "blue", percentage: 71 },
    { label: "Personal Training", value: 8400, color: "teal", percentage: 18 },
    { label: "Merchandise", value: 4731, color: "purple", percentage: 11 },
  ];

  return (
    <VStack align="stretch" gap={4} w="full">
      <HStack justify="space-between">
        <Heading size="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Revenue Stream Pulse</Heading>
        <Badge variant="outline" colorPalette="blue">Monthly Total: $45,231</Badge>
      </HStack>
      <Box borderRadius="full" overflow="hidden" h="12px" bg="gray.100/10" display="flex">
        {streams.map((s, i) => (
          <Box key={i} h="full" w={`${s.percentage}%`} bg={`${s.color}.500`} transition="width 1s ease-in-out" />
        ))}
      </Box>
      <SimpleGrid columns={3} gap={4}>
        {streams.map((s, i) => (
          <HStack key={i} gap={2}>
            <Box w="3px" h="12px" borderRadius="full" bg={`${s.color}.500`} />
            <VStack align="start" gap={0}>
              <Text fontSize="10px" fontWeight="700" color="gray.500">{s.label}</Text>
              <Text fontSize="sm" fontWeight="800">${s.value.toLocaleString()}</Text>
            </VStack>
          </HStack>
        ))}
      </SimpleGrid>
    </VStack>
  );
};

/**
 * MembershipHealthMatrix
 * Shows retention vs churn in a visual matrix.
 */
const MembershipHealthMatrix = () => {
  return (
    <VStack align="stretch" gap={4} w="full" p={5} borderRadius="2xl" bg="blue.600" color="white" boxShadow="xl">
      <HStack justify="space-between">
        <Heading size="xs" fontWeight="700" opacity={0.8} textTransform="uppercase">Membership Health</Heading>
        <Activity size="16px" />
      </HStack>
      <VStack align="center" py={4} gap={1}>
        <Text fontSize="4xl" fontWeight="900">92.4%</Text>
        <Text fontSize="xs" fontWeight="600" opacity={0.9}>Retention Index Score</Text>
        <Badge colorPalette="green" variant="solid" mt={2} px={3}>Extremely Healthy</Badge>
      </VStack>
      <Separator opacity={0.2} />
      <SimpleGrid columns={2} gap={4} textAlign="center">
        <Box>
          <Text fontSize="xs" opacity={0.7} mb={1}>Churn Rate</Text>
          <Text fontSize="md" fontWeight="800">2.1%</Text>
        </Box>
        <Box borderLeft="1px solid rgba(255,255,255,0.2)">
          <Text fontSize="xs" opacity={0.7} mb={1}>Growth Rate</Text>
          <Text fontSize="md" fontWeight="800">+12.4%</Text>
        </Box>
      </SimpleGrid>
    </VStack>
  );
};

/**
 * GrowthMatrix
 * Shows ranked membership plans with visual density.
 */
const GrowthMatrix = () => {
  const plans = [
    { name: "Annual Platinum", members: 452, density: 100, trend: "+12%" },
    { name: "Family Flex", members: 231, density: 51, trend: "+5%" },
    { name: "Morning Warrior", members: 184, density: 40, trend: "-2%" },
    { name: "Student Pro", members: 92, density: 20, trend: "+18%" },
  ];

  return (
    <VStack align="stretch" gap={4} w="full">
      <Heading size="xs" fontWeight="700" color="gray.500" textTransform="uppercase">Membership Growth Matrix</Heading>
      <VStack align="stretch" gap={3}>
        {plans.map((p, i) => (
          <HStack key={i} justify="space-between" p={3} borderRadius="xl" bg={useColorModeValue("gray.50", "whiteAlpha.50")} border="1px solid" borderColor={useColorModeValue("gray.100", "whiteAlpha.100")}>
            <VStack align="start" gap={0} flex="1">
              <Text fontSize="sm" fontWeight="700">{p.name}</Text>
              <Box w="full" mt={2} h="4px" borderRadius="full" bg="gray.100/20">
                <Box h="4px" borderRadius="full" w={`${p.density}%`} bg="blue.500" />
              </Box>
            </VStack>
            <VStack align="end" gap={0} ml={4}>
              <Text fontSize="sm" fontWeight="800">{p.members}</Text>
              <Text fontSize="10px" fontWeight="700" color={p.trend.startsWith("+") ? "green.500" : "red.500"}>{p.trend}</Text>
            </VStack>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};

/**
 * RevenuAnalytics
 * Redesigned Financial Intelligence Hub for Gym Dashboard.
 * Replaces traditional charts with high-density analytical views.
 */
export default function RevenuAnalytics() {
  // const bg = useColorModeValue("white", "gray.950");
  const bg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Box w="full" mt={4}>
      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6}>
        {/* Retention & Health Hub */}
        <VStack align="stretch" gap={6}>
          <MembershipHealthMatrix />
          <SimpleGrid columns={2} gap={4}>
            <MetricTile title="Net Growth" value="+142" icon="FcLineChart" change={12} color="green" />
            <MetricTile title="Lifetime Value" value="$2.4k" icon="FcDebt" change={5} color="blue" />
          </SimpleGrid>
        </VStack>

        {/* Intelligence Hub Main */}
        <Box
          gridColumn={{ lg: "span 2" }}
          p={6}
          bg={bg}
          borderRadius="3xl"
          border="1px solid"
          borderColor={borderColor}
          boxShadow="2xl"
          position="relative"
          overflow="hidden"
        >
          <VStack align="stretch" gap={8}>
            <HStack justify="space-between">
              <Box>
                <Heading size="md" fontWeight="900" mb={1}>Financial Intelligence Hub</Heading>
                <Text fontSize="xs" color="gray.500" fontWeight="600">Real-time analytical depth across all revenue streams</Text>
              </Box>
              <Badge variant="subtle" size="lg" colorPalette="blue" px={4} py={1} borderRadius="full">
                Q1 Performance Report
              </Badge>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={10}>
              <RevenueStreamPulse />
              <GrowthMatrix />
            </SimpleGrid>

            {/* Micro analytics footer */}
            <HStack gap={8} pt={4} borderTop="1px solid" borderColor={borderColor}>
              <HStack gap={2}>
                <Users color="#3182ce" />
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" fontWeight="700" color="gray.500">Peak Hours Density</Text>
                  <Text fontSize="sm" fontWeight="800">Extremely High</Text>
                </VStack>
              </HStack>
              <HStack gap={2}>
                <TrendingUp color="#38A169" />
                <VStack align="start" gap={0}>
                  <Text fontSize="xs" fontWeight="700" color="gray.500">Quarterly Target</Text>
                  <Text fontSize="sm" fontWeight="800">82% Achieved</Text>
                </VStack>
              </HStack>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
