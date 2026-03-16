/**
 * Navigation Action Types
 */

// ─── Individual Action Types ─────────────────────────────────────────

/** Navigate to an internal route via React Router */
export interface RouteAction {
    readonly type: "route";
    readonly path: string;
}

/** Configurable dialog display options — driven by JSON config */
export interface DialogConfig {
    /** Chakra Dialog size: xs, sm, md, lg, xl, cover, full */
    readonly size?: "xs" | "sm" | "md" | "lg" | "xl" | "cover" | "full";
    /** Allow closing by clicking backdrop (default: true) */
    readonly closeOnOverlayClick?: boolean;
    /** Allow closing with Escape key (default: true) */
    readonly closeOnEsc?: boolean;
    /** Scroll behavior: inside dialog or entire body (default: inside) */
    readonly scrollBehavior?: "inside" | "outside";
}

/** Open a template inside a modal dialog */
export interface ModalAction {
    readonly type: "modal";
    readonly templateName: string;
    readonly appName?: string;
    /** Optional dialog display configuration */
    readonly config?: DialogConfig;
}

/** Open a template inside a drawer panel */
export interface DrawerAction {
    readonly type: "drawer";
    readonly templateName: string;
    readonly appName?: string;
}

/** Open an external URL in a new tab/window */
export interface ExternalAction {
    readonly type: "external";
    readonly url: string;
    readonly target?: string;
}

/** Execute a named callback from dynamicFunctions registry */
export interface CallbackAction {
    readonly type: "callback";
    readonly handler: string;
}

// ─── Union Type ──────────────────────────────────────────────────────

export type NavigationAction =
    | RouteAction
    | ModalAction
    | DrawerAction
    | ExternalAction
    | CallbackAction;

// ─── Execution Context ───────────────────────────────────────────────

/**
 * Context injected by the caller (e.g., MenuLink) into ActionEngine.
 */
export interface ActionExecutionContext {
    /** React Router navigate function */
    navigate: (path: string) => void;
    /** Opens a modal via Zustand store */
    openModal: (payload: { templateName: string; appName?: string; config?: DialogConfig }) => void;
    /** Current organization name for path building */
    organizationName: string;
    /** The raw menu config for callback handlers */
    menuConfig?: Record<string, unknown>;
}

// ─── Action Handler Signature ────────────────────────────────────────

export type ActionHandler = (
    action: NavigationAction,
    context: ActionExecutionContext
) => void;
