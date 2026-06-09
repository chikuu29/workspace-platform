import type { ElementType, ReactNode } from "react";
import { create } from "zustand";

export interface NavActionConfig {
  id?: string; // Optional: key will fall back to index if not provided
  label?: string;
  icon?: ElementType; // e.g. Users, Plus, RefreshCw (LucideIcon or other icon component)
  onClick: () => void;
  type?: "button" | "icon-button"; // "icon-button" renders IconButton, "button" renders Button
  flexMobile?: boolean; // Set to true to use flex="1" on mobile
  [key: string]: any; // Allow forwarding any Chakra UI or custom HTML props
}


interface NavActionState {
  actions: ReactNode | NavActionConfig[] | null;
  setActions: (actions: ReactNode | null) => void;
  setNavActionConfig: (config: NavActionConfig[] | null) => void;
  clearActions: () => void;
}

/**
 * Global store for managing contextual navbar actions (Page Actions).
 * Used to "portal" buttons and controls from deep pages up into the global Breadcrumb/Navbar area.
 */
export const useNavActionStore = create<NavActionState>((set) => ({
  actions: null,
  setActions: (actions) => set({ actions }),
  setNavActionConfig: (config) => set({ actions: config }),
  clearActions: () => set({ actions: null }),
}));

