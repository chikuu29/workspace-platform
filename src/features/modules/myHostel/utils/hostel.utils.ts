/**
 * Hostel module — static constants & pure utility functions.
 *
 * Kept outside components so they are never re-created during renders.
 * Import only what you need — each export is tree-shakeable.
 */

import { Building, Building2, GraduationCap, Leaf } from "lucide-react";
import type { BuildingStats, GuestStatus, HostelBuilding, RoomStatus } from "../types/Hostel.types";

// ─── Status Metadata ─────────────────────────────────────────────────────────

export const ROOM_STATUS_META: Record<
  RoomStatus,
  { label: string; bg: string; border: string; color: string; dot: string; palette: string }
> = {
  vacant:      { label: "Vacant",      bg: "#F0FDF4", border: "#86EFAC", color: "#15803D", dot: "#22C55E", palette: "green"  },
  occupied:    { label: "Occupied",    bg: "#EFF6FF", border: "#93C5FD", color: "#1D4ED8", dot: "#3B82F6", palette: "blue"   },
  maintenance: { label: "Maintenance", bg: "#FFF7ED", border: "#FDBA74", color: "#C2410C", dot: "#F97316", palette: "orange" },
  reserved:    { label: "Reserved",    bg: "#F5F3FF", border: "#C4B5FD", color: "#6D28D9", dot: "#8B5CF6", palette: "purple" },
};

export const GUEST_STATUS_META: Record<GuestStatus, { label: string; palette: string }> = {
  "checked-in":  { label: "Checked-in",  palette: "green"  },
  reserved:      { label: "Reserved",    palette: "purple" },
  "checked-out": { label: "Checked-out", palette: "gray"   },
};

// ─── Static Building Data ─────────────────────────────────────────────────────

export const BUILDINGS: HostelBuilding[] = [
  {
    id: "B1",
    name: "Sunrise Hostel",
    location: "Saheed Nagar",
    floors: 3,
    color: { bg: "#E6F1FB", icon: "#185FA5", bar: "#378ADD", gradStart: "#3B82F6", gradEnd: "#1D4ED8" },
    icon: Building2,
    amenities: ["WiFi", "AC", "Laundry", "Gym"],
    rooms: [
      { f: 1, n: "101", t: "Single",  s: "occupied",    g: "Arjun S.",  p: 800  },
      { f: 1, n: "102", t: "Double",  s: "occupied",    g: "Priya M.",  p: 1200 },
      { f: 1, n: "103", t: "Single",  s: "vacant",      g: "-",         p: 800  },
      { f: 1, n: "104", t: "Suite",   s: "occupied",    g: "Rahul K.",  p: 2200 },
      { f: 1, n: "105", t: "Single",  s: "occupied",    g: "Sneha R.",  p: 800  },
      { f: 1, n: "106", t: "Single",  s: "maintenance", g: "-",         p: 800  },
      { f: 1, n: "107", t: "Double",  s: "occupied",    g: "Vikram T.", p: 1200 },
      { f: 1, n: "108", t: "Single",  s: "occupied",    g: "Meera J.",  p: 800  },
      { f: 2, n: "201", t: "Single",  s: "occupied",    g: "Pooja L.",  p: 800  },
      { f: 2, n: "202", t: "Double",  s: "vacant",      g: "-",         p: 1200 },
      { f: 2, n: "203", t: "Single",  s: "occupied",    g: "Kiran V.",  p: 800  },
      { f: 2, n: "204", t: "Single",  s: "maintenance", g: "-",         p: 800  },
      { f: 2, n: "205", t: "Single",  s: "vacant",      g: "-",         p: 800  },
      { f: 2, n: "206", t: "Double",  s: "occupied",    g: "Suresh P.", p: 1200 },
      { f: 2, n: "207", t: "Suite",   s: "reserved",    g: "Nisha K.",  p: 2200 },
      { f: 2, n: "208", t: "Single",  s: "occupied",    g: "Amit G.",   p: 800  },
      { f: 3, n: "301", t: "Single",  s: "vacant",      g: "-",         p: 800  },
      { f: 3, n: "302", t: "Double",  s: "occupied",    g: "Deepa R.",  p: 1200 },
      { f: 3, n: "303", t: "Single",  s: "vacant",      g: "-",         p: 800  },
      { f: 3, n: "304", t: "Single",  s: "occupied",    g: "Raj M.",    p: 800  },
      { f: 3, n: "305", t: "Suite",   s: "vacant",      g: "-",         p: 2200 },
      { f: 3, n: "306", t: "Single",  s: "occupied",    g: "Asha T.",   p: 800  },
      { f: 3, n: "307", t: "Single",  s: "maintenance", g: "-",         p: 800  },
      { f: 3, n: "308", t: "Single",  s: "occupied",    g: "Nitin J.",  p: 800  },
    ],
    guests: [
      { name: "Arjun Sharma", room: "101", cin: "18 May", cout: "25 May", status: "checked-in" },
      { name: "Priya Mehta",  room: "102", cin: "20 May", cout: "27 May", status: "checked-in" },
      { name: "Rahul Kumar",  room: "104", cin: "21 May", cout: "28 May", status: "checked-in" },
      { name: "Nisha Kaur",   room: "207", cin: "26 May", cout: "2 Jun",  status: "reserved"   },
    ],
  },
  {
    id: "B2",
    name: "Green Valley PG",
    location: "Patia",
    floors: 4,
    color: { bg: "#EAF3DE", icon: "#3B6D11", bar: "#639922", gradStart: "#22C55E", gradEnd: "#15803D" },
    icon: Leaf,
    amenities: ["WiFi", "Meals", "Parking", "CCTV"],
    rooms: [
      { f: 1, n: "101", t: "Single", s: "occupied",    g: "Ravi N.",    p: 700  },
      { f: 1, n: "102", t: "Single", s: "occupied",    g: "Divya M.",   p: 700  },
      { f: 1, n: "103", t: "Double", s: "vacant",      g: "-",          p: 1100 },
      { f: 1, n: "104", t: "Single", s: "occupied",    g: "Sanjay K.",  p: 700  },
      { f: 1, n: "105", t: "Single", s: "occupied",    g: "Lakshmi P.", p: 700  },
      { f: 1, n: "106", t: "Single", s: "maintenance", g: "-",          p: 700  },
      { f: 2, n: "201", t: "Double", s: "occupied",    g: "Prathik S.", p: 1100 },
      { f: 2, n: "202", t: "Single", s: "vacant",      g: "-",          p: 700  },
      { f: 2, n: "203", t: "Single", s: "occupied",    g: "Anita R.",   p: 700  },
      { f: 2, n: "204", t: "Suite",  s: "occupied",    g: "Dev M.",     p: 2000 },
      { f: 2, n: "205", t: "Single", s: "reserved",    g: "Kavya N.",   p: 700  },
      { f: 2, n: "206", t: "Single", s: "vacant",      g: "-",          p: 700  },
      { f: 3, n: "301", t: "Single", s: "occupied",    g: "Rohit S.",   p: 700  },
      { f: 3, n: "302", t: "Double", s: "occupied",    g: "Sunita K.",  p: 1100 },
      { f: 3, n: "303", t: "Single", s: "vacant",      g: "-",          p: 700  },
      { f: 3, n: "304", t: "Single", s: "occupied",    g: "Mohan P.",   p: 700  },
      { f: 4, n: "401", t: "Suite",  s: "occupied",    g: "VIP Guest",  p: 2500 },
      { f: 4, n: "402", t: "Single", s: "vacant",      g: "-",          p: 700  },
      { f: 4, n: "403", t: "Single", s: "occupied",    g: "Arun T.",    p: 700  },
      { f: 4, n: "404", t: "Double", s: "maintenance", g: "-",          p: 1100 },
    ],
    guests: [
      { name: "Ravi Narayan", room: "101", cin: "19 May", cout: "26 May", status: "checked-in" },
      { name: "Dev Mishra",   room: "204", cin: "22 May", cout: "29 May", status: "checked-in" },
      { name: "Kavya Nair",   room: "205", cin: "25 May", cout: "1 Jun",  status: "reserved"   },
    ],
  },
  {
    id: "B3",
    name: "City Centre Stay",
    location: "Master Canteen",
    floors: 5,
    color: { bg: "#EEEDFE", icon: "#3C3489", bar: "#7F77DD", gradStart: "#8B5CF6", gradEnd: "#6D28D9" },
    icon: Building,
    amenities: ["WiFi", "AC", "Rooftop", "Cafe"],
    rooms: [
      { f: 1, n: "101", t: "Single",    s: "occupied",    g: "Guest A",      p: 900  },
      { f: 1, n: "102", t: "Double",    s: "occupied",    g: "Guest B",      p: 1400 },
      { f: 1, n: "103", t: "Single",    s: "vacant",      g: "-",            p: 900  },
      { f: 1, n: "104", t: "Single",    s: "occupied",    g: "Guest C",      p: 900  },
      { f: 1, n: "105", t: "Single",    s: "occupied",    g: "Guest D",      p: 900  },
      { f: 2, n: "201", t: "Suite",     s: "occupied",    g: "Guest E",      p: 2500 },
      { f: 2, n: "202", t: "Single",    s: "vacant",      g: "-",            p: 900  },
      { f: 2, n: "203", t: "Double",    s: "occupied",    g: "Guest F",      p: 1400 },
      { f: 2, n: "204", t: "Single",    s: "maintenance", g: "-",            p: 900  },
      { f: 2, n: "205", t: "Single",    s: "reserved",    g: "Guest G",      p: 900  },
      { f: 3, n: "301", t: "Single",    s: "occupied",    g: "Guest H",      p: 900  },
      { f: 3, n: "302", t: "Single",    s: "vacant",      g: "-",            p: 900  },
      { f: 3, n: "303", t: "Double",    s: "occupied",    g: "Guest I",      p: 1400 },
      { f: 3, n: "304", t: "Single",    s: "occupied",    g: "Guest J",      p: 900  },
      { f: 4, n: "401", t: "Suite",     s: "vacant",      g: "-",            p: 2500 },
      { f: 4, n: "402", t: "Single",    s: "occupied",    g: "Guest K",      p: 900  },
      { f: 4, n: "403", t: "Double",    s: "occupied",    g: "Guest L",      p: 1400 },
      { f: 5, n: "501", t: "Penthouse", s: "occupied",    g: "VIP",          p: 4000 },
      { f: 5, n: "502", t: "Suite",     s: "reserved",    g: "Corp Booking", p: 2500 },
      { f: 5, n: "503", t: "Single",    s: "vacant",      g: "-",            p: 900  },
    ],
    guests: [
      { name: "Corporate Client", room: "502", cin: "27 May", cout: "3 Jun",  status: "reserved"   },
      { name: "VIP Stay",         room: "501", cin: "20 May", cout: "25 May", status: "checked-in" },
    ],
  },
  {
    id: "B4",
    name: "Student Nest",
    location: "Infocity",
    floors: 2,
    color: { bg: "#FAECE7", icon: "#993C1D", bar: "#D85A30", gradStart: "#F97316", gradEnd: "#C2410C" },
    icon: GraduationCap,
    amenities: ["WiFi", "Study Room", "Mess", "Laundry"],
    rooms: [
      { f: 1, n: "101", t: "Dorm 6", s: "occupied",    g: "6 students",  p: 350 },
      { f: 1, n: "102", t: "Dorm 6", s: "occupied",    g: "5 students",  p: 350 },
      { f: 1, n: "103", t: "Dorm 4", s: "occupied",    g: "4 students",  p: 420 },
      { f: 1, n: "104", t: "Dorm 4", s: "vacant",      g: "-",           p: 420 },
      { f: 1, n: "105", t: "Single", s: "occupied",    g: "Coordinator", p: 700 },
      { f: 1, n: "106", t: "Single", s: "maintenance", g: "-",           p: 700 },
      { f: 2, n: "201", t: "Dorm 6", s: "occupied",    g: "6 students",  p: 350 },
      { f: 2, n: "202", t: "Dorm 6", s: "occupied",    g: "4 students",  p: 350 },
      { f: 2, n: "203", t: "Dorm 4", s: "vacant",      g: "-",           p: 420 },
      { f: 2, n: "204", t: "Dorm 4", s: "reserved",    g: "New batch",   p: 420 },
      { f: 2, n: "205", t: "Single", s: "occupied",    g: "Warden",      p: 700 },
      { f: 2, n: "206", t: "Single", s: "vacant",      g: "-",           p: 700 },
    ],
    guests: [
      { name: "Batch 12A", room: "101", cin: "1 May", cout: "30 Jun", status: "checked-in" },
      { name: "New Batch", room: "204", cin: "1 Jun", cout: "30 Jul", status: "reserved"   },
    ],
  },
];

// ─── Tab Definitions ─────────────────────────────────────────────────────────

import { Building as BuildingIcon, Info, Users } from "lucide-react";
import type { BuildingTab } from "../types/Hostel.types";
import type { LucideIcon } from "lucide-react";

export const TAB_ITEMS: Array<{ value: BuildingTab; label: string; icon: LucideIcon }> = [
  { value: "rooms",  label: "Rooms",  icon: BuildingIcon },
  { value: "guests", label: "Guests", icon: Users        },
  { value: "info",   label: "Info",   icon: Info         },
];

// ─── Pure Utility Functions ───────────────────────────────────────────────────

import type { Room } from "../types/Hostel.types";

/** Derive occupancy stats for a building in one pass. */
export const calcStats = (building: HostelBuilding): BuildingStats => {
  const total    = building.rooms.length;
  const occ      = building.rooms.filter((r) => r.s === "occupied").length;
  const vac      = building.rooms.filter((r) => r.s === "vacant").length;
  const maint    = building.rooms.filter((r) => r.s === "maintenance").length;
  const reserved = building.rooms.filter((r) => r.s === "reserved").length;
  return { total, occ, vac, maint, reserved, pct: total ? Math.round((occ / total) * 100) : 0 };
};

/** Return sorted unique floor numbers for a building. */
export const getFloors = (building: HostelBuilding): number[] =>
  Array.from(new Set(building.rooms.map((r) => r.f))).sort((a, b) => a - b);

/** Format a nightly rate in Indian Rupee notation. */
export const formatRate = (value: number): string => `₹${value.toLocaleString("en-IN")}/night`;

/** Return a Chakra colorPalette string based on occupancy percentage. */
export const getOccupancyPalette = (pct: number): string =>
  pct >= 80 ? "red" : pct >= 50 ? "orange" : "green";

/**
 * Resolves bed capacity and occupancy for a room based on its type and current guest information.
 * Single: 1 bed.
 * Double: 2 beds.
 * Suite: 2 beds.
 * Penthouse: 3 beds.
 * Dorm 4: 4 beds.
 * Dorm 6: 6 beds.
 */
export interface BedOccupancyInfo {
  total: number;
  occupied: number;
  vacant: number;
}

export const getBedOccupancy = (room: Room): BedOccupancyInfo => {
  let total = 1;
  const type = room.t.toLowerCase();
  
  if (type.includes("dorm")) {
    const num = parseInt(type.replace(/\D/g, ""), 10);
    total = isNaN(num) ? 4 : num;
  } else if (type.includes("double") || type.includes("suite")) {
    total = 2;
  } else if (type.includes("penthouse") || type.includes("triple")) {
    total = 3;
  } else {
    total = 1;
  }

  if (room.s === "vacant") {
    return { total, occupied: 0, vacant: total };
  }
  
  if (room.s === "maintenance" || room.s === "reserved") {
    return { total, occupied: 0, vacant: total };
  }

  // If status is occupied:
  let occupied = total;
  if (room.g && room.g !== "-") {
    const match = room.g.match(/^(\d+)\s+/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num <= total) {
        occupied = num;
      }
    } else {
      // If it's a double room but guest name is just a single person ("Arjun S."), 
      // assume 1 bed is occupied and the other is available to show partial occupancy.
      if (total === 2 && !room.g.includes("&") && !room.g.includes("and")) {
        occupied = 1;
      }
    }
  }

  return {
    total,
    occupied,
    vacant: Math.max(0, total - occupied),
  };
};
