import { memo, useMemo } from "react";
import {
  Badge,
  Box,
  Button,
  Grid,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BarChart3, Edit3 } from "lucide-react";

import type { BuildingStats, HostelBuilding } from "../types/Hostel.types";

interface BuildingInfoProps {
  building:  HostelBuilding;
  stats:     BuildingStats;
  onEdit:    () => void;
  onRevenue: () => void;
}

/**
 * BuildingInfo — memoised building details + occupancy breakdown panel.
 *
 * Info fields and breakdown rows are memoised with useMemo so the arrays
 * are not recreated on every render — only rebuilt when building or stats change.
 */
const BuildingInfo = memo(({ building, stats, onEdit, onRevenue }: BuildingInfoProps) => {
  const infoFields = useMemo<Array<[string, string]>>(
    () => [
      ["Building name", building.name],
      ["Location",      `${building.location}, Bhubaneswar`],
      ["Total floors",  building.floors.toString()],
      ["Total rooms",   stats.total.toString()],
    ],
    [building, stats.total],
  );

  const breakdown = useMemo<Array<[string, number, string]>>(
    () => [
      ["Occupied",    stats.occ,      building.color.gradStart],
      ["Vacant",      stats.vac,      "#22C55E"],
      ["Maintenance", stats.maint,    "#F97316"],
      ["Reserved",    stats.reserved, "#8B5CF6"],
    ],
    [stats, building.color.gradStart],
  );

  return (
    <Box
      border="1px solid"
      borderColor="app.card.border"
      borderRadius="xl"
      overflow="hidden"
      bg="app.card.bg"
    >
      {/* Brand gradient strip */}
      <Box
        h="3px"
        bgGradient={`linear(to-r, ${building.color.gradStart}, ${building.color.gradEnd})`}
      />

      <Box p={5}>
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {/* Left — building detail fields */}
          <VStack align="stretch" gap={3}>
            {infoFields.map(([label, value]) => (
              <Box key={label} bg="bg.subtle" borderRadius="lg" px={3.5} py={3}>
                <Text
                  fontSize="2xs"
                  color="app.text.muted"
                  fontWeight="900"
                  textTransform="uppercase"
                  letterSpacing="0.07em"
                  mb={1}
                >
                  {label}
                </Text>
                <Text fontSize="sm" color="app.text.primary" fontWeight="900">
                  {value}
                </Text>
              </Box>
            ))}
          </VStack>

          {/* Right — amenities + occupancy breakdown */}
          <VStack align="stretch" gap={4}>
            {/* Amenities */}
            <Box>
              <Text
                fontSize="2xs"
                color="app.text.muted"
                fontWeight="900"
                textTransform="uppercase"
                letterSpacing="0.07em"
                mb={2}
              >
                Amenities
              </Text>
              <HStack gap={1.5} flexWrap="wrap">
                {building.amenities.map((amenity) => (
                  <Badge key={amenity} colorPalette="gray" variant="subtle" borderRadius="full" px={3} py={1}>
                    {amenity}
                  </Badge>
                ))}
              </HStack>
            </Box>

            {/* Occupancy breakdown */}
            <Box>
              <Text
                fontSize="2xs"
                color="app.text.muted"
                fontWeight="900"
                textTransform="uppercase"
                letterSpacing="0.07em"
                mb={2}
              >
                Occupancy breakdown
              </Text>
              <SimpleGrid columns={2} gap={2}>
                {breakdown.map(([label, value, accent]) => (
                  <Box
                    key={label}
                    bg="bg.subtle"
                    borderRadius="lg"
                    p={3}
                    borderTop="2px solid"
                    borderColor={accent}
                  >
                    <Text fontSize="xl" color={accent} fontWeight="900" lineHeight="1">
                      {value}
                    </Text>
                    <Text fontSize="2xs" color="app.text.muted" fontWeight="800" mt={0.5}>
                      {label}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </Grid>

        {/* Action buttons */}
        <HStack pt={5} mt={5} borderTop="1px solid" borderColor="app.card.border" gap={2} flexWrap="wrap">
          <Button size="sm" variant="outline" borderRadius="lg" fontWeight="700" onClick={onEdit}>
            <Edit3 size={14} />
            Edit info
          </Button>
          <Button size="sm" variant="outline" borderRadius="lg" fontWeight="700" onClick={onRevenue}>
            <BarChart3 size={14} />
            Revenue
          </Button>
        </HStack>
      </Box>
    </Box>
  );
});

BuildingInfo.displayName = "BuildingInfo";
export default BuildingInfo;
