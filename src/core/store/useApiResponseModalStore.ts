import { create } from "zustand";

export type ApiResponseModalType = "success" | "error" | "warning" | "info";

export interface ApiResponseModalConfig {
  type: ApiResponseModalType;
  title: string;
  message?: string;
  autoClose?: boolean;
  duration?: number;
  onConfirm?: () => void;
}

interface ApiResponseModalState {
  open: boolean;
  config: ApiResponseModalConfig | null;
  openModal: (config: ApiResponseModalConfig) => void;
  closeModal: () => void;
}

export const useApiResponseModalStore = create<ApiResponseModalState>((set) => ({
  open: false,
  config: null,
  openModal: (config) => set({ open: true, config }),
  closeModal: () => set({ open: false, config: null }),
}));

