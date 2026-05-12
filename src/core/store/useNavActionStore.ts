import type { ReactNode } from "react";
import { create } from "zustand";

interface NavActionState {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
  clearActions: () => void;
}

/**
 * Global store for managing contextual navbar actions (Page Actions).
 * Used to "portal" buttons and controls from deep pages up into the global Breadcrumb/Navbar area.
 */
export const useNavActionStore = create<NavActionState>((set) => ({
  actions: null,
  setActions: (actions) => set({ actions }),
  clearActions: () => set({ actions: null }),
}));
