import type { ReactNode } from "react";
import { create } from "zustand";

interface BreadcrumbActionsState {
  actions: ReactNode | null;
  setActions: (actions: ReactNode | null) => void;
  clearActions: () => void;
}

export const useBreadcrumbActionsStore = create<BreadcrumbActionsState>((set) => ({
  actions: null,
  setActions: (actions) => set({ actions }),
  clearActions: () => set({ actions: null }),
}));
