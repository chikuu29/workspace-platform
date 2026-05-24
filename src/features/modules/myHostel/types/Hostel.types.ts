/**
 * Hostel module — shared domain types.
 * Centralised here so every component imports from a single source of truth.
 */

export type RoomStatus  = "occupied" | "vacant" | "maintenance" | "reserved";
export type GuestStatus = "checked-in" | "reserved" | "checked-out";
export type BuildingTab = "rooms" | "guests" | "info";

export interface Room {
  f: number;   // floor number
  n: string;   // room number label
  t: string;   // room type (Single / Double / Suite / Dorm …)
  s: RoomStatus;
  g: string;   // guest name ("-" when empty)
  p: number;   // nightly rate (INR)
}

export interface Guest {
  name:   string;
  room:   string;
  cin:    string;   // check-in date string
  cout:   string;   // check-out date string
  status: GuestStatus;
}

export interface BuildingTheme {
  bg:        string;   // light background tint
  icon:      string;   // icon / accent foreground
  bar:       string;   // progress-bar fill
  gradStart: string;   // gradient start colour
  gradEnd:   string;   // gradient end colour
}

export interface HostelBuilding {
  id:        string;
  name:      string;
  location:  string;
  floors:    number;
  color:     BuildingTheme;
  icon:      React.ElementType;  // LucideIcon compatible
  amenities: string[];
  rooms:     Room[];
  guests:    Guest[];
}

export interface BuildingStats {
  total:    number;
  occ:      number;
  vac:      number;
  maint:    number;
  reserved: number;
  pct:      number;   // occupancy %
}

// Allow React import in type file (needed for React.ElementType)
import type React from "react";
