import { create } from "zustand";
import type { DialogConfig } from "@/core/action-engine/types";

/**
 * Modal Store (Zustand)
 *
 * Minimal global state for template dialogs.
 * No Context provider needed — only DialogRenderer subscribes.
 * Sidebar/navbar never re-render when modal opens.
 *
 * @module core/store/useModalStore
 */

interface ModalPayload {
    templateName: string;
    appName?: string;
    config?: DialogConfig;
}

interface ModalState {
    /** Whether the dialog is currently open */
    isOpen: boolean;
    /** Template page name to fetch from API */
    templateName: string | null;
    /** App name for the API query */
    appName: string | null;
    /** Dialog display configuration */
    dialogConfig: DialogConfig;
    /** Opens the dialog with given template info and optional config */
    openModal: (payload: ModalPayload) => void;
    /** Closes the dialog and resets state */
    closeModal: () => void;
}

/** Sensible defaults — can be overridden per action in JSON config */
const DEFAULT_DIALOG_CONFIG: DialogConfig = {
    size: "xl",
    closeOnOverlayClick: true,
    closeOnEsc: true,
    scrollBehavior: "inside",
};

export const useModalStore = create<ModalState>((set) => ({
    isOpen: false,
    templateName: null,
    appName: null,
    dialogConfig: DEFAULT_DIALOG_CONFIG,

    openModal: (payload: ModalPayload) =>
        set({
            isOpen: true,
            templateName: payload.templateName,
            appName: payload.appName ?? null,
            dialogConfig: { ...DEFAULT_DIALOG_CONFIG, ...payload.config },
        }),

    closeModal: () =>
        set({
            isOpen: false,
            templateName: null,
            appName: null,
            dialogConfig: DEFAULT_DIALOG_CONFIG,
        }),
}));
