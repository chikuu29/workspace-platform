/**
 * FloorCapacityGauge.tsx
 *
 * Dark-surface card showing trainer utilization as a
 * progress bar with percentage readout.
 */
import { memo } from "react";
import { Box, Button, Heading, HStack, Progress, Separator, Text, VStack } from "@chakra-ui/react";
import { CalendarDays } from "lucide-react";

interface FloorCapacityGaugeProps {
  utilization: number;
  onViewSchedule: () => void;
}

const getUtilizationPalette = (value: number): string => {
  if (value >= 80) return "red";
  if (value >= 50) return "orange";
  return "green";
};

const FloorCapacityGauge = memo(({ utilization, onViewSchedule }: FloorCapacityGaugeProps) => {
  const palette = getUtilizationPalette(utilization);

  return (
    <Box p={5} borderRadius="2xl" bg="linear-gradient(145deg, #0f172a, #1e293b)" color="white" border="1px solid" borderColor="whiteAlpha.100" boxShadow="0 4px 24px rgba(0,0,0,0.25)">
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Heading size="sm" fontWeight="900">Floor Capacity</Heading>
            <Text fontSize="xs" color="gray.400" fontWeight="700">Trainer utilization</Text>
          </VStack>
          <CalendarDays size={18} />
        </HStack>
        <Progress.Root value={utilization} colorPalette={palette} size="sm">
          <Progress.Track bg="whiteAlpha.200" borderRadius="full">
            <Progress.Range borderRadius="full" />
          </Progress.Track>
        </Progress.Root>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.300" fontWeight="700">Current load</Text>
          <Text fontSize="xl" fontWeight="900" letterSpacing="tight">{utilization}%</Text>
        </HStack>
        <Separator borderColor="whiteAlpha.200" />
        <Button variant="surface" bg="white" color="gray.950" borderRadius="xl" fontWeight="900" size="sm" _hover={{ bg: "gray.100" }} onClick={onViewSchedule}>
          View Class Schedule
        </Button>
      </VStack>
    </Box>
  );
});

FloorCapacityGauge.displayName = "FloorCapacityGauge";
export default FloorCapacityGauge;
