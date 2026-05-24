import { memo, useMemo } from "react";
import { VStack } from "@chakra-ui/react";

import type { HostelBuilding } from "../types/Hostel.types";
import { getFloors } from "../utils/hostel.utils";
import StatusLegend from "./StatusLegend";
import FloorSection from "./FloorSection";

interface RoomGridProps {
  building:           HostelBuilding;
  selectedRoomNumber: string | null;
  onRoomSelect:       (n: string) => void;
}

/**
 * RoomGrid — memoised room grid coordinator.
 *
 * Computes floor groups once with useMemo and delegates per-floor rendering
 * to FloorSection memos. This means clicking a room only re-renders:
 *   1. This component (skipped — props unchanged)
 *   2. The affected FloorSection
 *   3. The previously-active and newly-active RoomCells
 *
 * All other floors and cells remain frozen.
 */
const RoomGrid = memo(({ building, selectedRoomNumber, onRoomSelect }: RoomGridProps) => {
  const floorGroups = useMemo(
    () =>
      getFloors(building).map((f) => ({
        floor: f,
        rooms: building.rooms.filter((r) => r.f === f),
      })),
    [building],
  );

  return (
    <VStack align="stretch" gap={3}>
      <StatusLegend />
      {floorGroups.map(({ floor, rooms }) => (
        <FloorSection
          key={floor}
          floor={floor}
          rooms={rooms}
          building={building}
          selectedRoomNumber={selectedRoomNumber}
          onRoomSelect={onRoomSelect}
        />
      ))}
    </VStack>
  );
});

RoomGrid.displayName = "RoomGrid";
export default RoomGrid;
