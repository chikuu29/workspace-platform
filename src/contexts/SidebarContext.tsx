import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from "react";

// ─── Types ───────────────────────────────────────────────────────────
interface SidebarContextType {
    /** Whether the desktop sidebar is collapsed (icon-only mode) */
    isCollapsed: boolean;
    /** Toggle desktop sidebar between expanded and collapsed */
    toggleSidebar: () => void;
    /** Whether the mobile drawer is open */
    isMobileOpen: boolean;
    /** Open the mobile sidebar drawer */
    openMobile: () => void;
    /** Close the mobile sidebar drawer */
    closeMobile: () => void;
}

// ─── Storage key for persistence ─────────────────────────────────────
const SIDEBAR_STORAGE_KEY = "workspace_sidebar_collapsed";

// ─── Read persisted state (safe for SSR) ─────────────────────────────
const getPersistedCollapsed = (): boolean => {
    try {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        return stored === "true";
    } catch {
        return false;
    }
};

// ─── Context ─────────────────────────────────────────────────────────
const SidebarContext = createContext<SidebarContextType | null>(null);

// ─── Provider ────────────────────────────────────────────────────────
interface SidebarProviderProps {
    children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
    const [isCollapsed, setIsCollapsed] = useState(getPersistedCollapsed);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
            } catch {
                // localStorage might be full or blocked — fail silently
            }
            return next;
        });
    }, []);

    const openMobile = useCallback(() => setIsMobileOpen(true), []);
    const closeMobile = useCallback(() => setIsMobileOpen(false), []);

    // Memoize the context value to prevent unnecessary re-renders
    const value = useMemo<SidebarContextType>(
        () => ({
            isCollapsed,
            toggleSidebar,
            isMobileOpen,
            openMobile,
            closeMobile,
        }),
        [isCollapsed, toggleSidebar, isMobileOpen, openMobile, closeMobile]
    );

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    );
};

// ─── Hook ────────────────────────────────────────────────────────────
export const useSidebar = (): SidebarContextType => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export default SidebarContext;
