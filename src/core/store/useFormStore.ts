import { create } from 'zustand';

interface WidgetProps {
    hidden?: boolean;
    disabled?: boolean;
    mandatory?: boolean;
    [key: string]: any;
}

interface FormState {
    values: Record<string, any>;
    visibility: Record<string, boolean>;
    uiProps: Record<string, WidgetProps>;
    errors: Record<string, any>;
    metadata: Record<string, any>;
    setFieldValue: (name: string, value: any) => void;
    setVisible: (name: string, visible: boolean) => void;
    setMetadata: (name: string, data: any) => void;
    initialize: (config: any[]) => void;
    getFieldValue: (name: string) => any;
    changeUI: (targets: string[], updates: Partial<WidgetProps>) => void;
    scripts: Record<string, any>;
    setScripts: (scripts: Record<string, any>) => void;
    // Global Panel State for CDUI
    panelOpen: boolean;
    panelConfig: any | null;
    panelData: any | null;
    setPanelState: (isOpen: boolean, config?: any, data?: any) => void;
    // Navigation context
    navigate?: (path: string) => void;
    setNavigate: (nav: any) => void;
    organizationName?: string;
    setOrganizationName: (name: string) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
    values: {},
    visibility: {},
    uiProps: {},
    errors: {},
    metadata: {},
    scripts: {},
    panelOpen: false,
    panelConfig: null,
    panelData: null,

    setPanelState: (isOpen, config = null, data = null) => set({
        panelOpen: isOpen,
        panelConfig: config ? config : get().panelConfig,
        panelData: data ? data : get().panelData,
    }),

    setScripts: (scripts) => set({ scripts }),
    setNavigate: (navigate) => set({ navigate }),
    setOrganizationName: (organizationName) => set({ organizationName }),

    initialize: (config: any[]) => {
        const currentValues = get().values || {};
        const values: Record<string, any> = { ...currentValues };
        const visibility: Record<string, boolean> = {};
        const uiProps: Record<string, WidgetProps> = {};
        const metadata: Record<string, any> = {};

        const processWidgets = (widgets: any[], currentTabName: string = "General") => {
            widgets.forEach((w: any) => {
                // Only set default if not already present AND name exists
                if (w.name) {
                    if (values[w.name] === undefined) {
                        values[w.name] = w.defaultValue ?? "";
                    }
                    visibility[w.name] = w.hidden === false || w.hidden === undefined;
                    uiProps[w.name] = {
                        hidden: w.hidden === true,
                        disabled: w.disabled === true,
                        mandatory: (w.mandatory === true || w.required === true),
                    };
                    metadata[w.name] = { ...w, tabName: currentTabName };
                }

                if (w.widgets) {
                    // If 'w' has a 'title' (like a tab) and no 'widget' type, it's likely a container/tab
                    const nextTabName = (!w.widget && (w.title || w.name)) ? (w.title || w.name) : currentTabName;
                    processWidgets(w.widgets, nextTabName);
                }
                if (w.tabs) {
                    w.tabs.forEach((t: any) => {
                        if (t.widgets) processWidgets(t.widgets, t.title || t.name || currentTabName);
                    });
                }
            });
        };

        processWidgets(config);
        set({ values, visibility, uiProps, metadata });
    },

    setFieldValue: (name, value) => set((state) => ({
        values: { ...state.values, [name]: value }
    })),

    setVisible: (name, visible) => set((state) => ({
        visibility: { ...state.visibility, [name]: visible },
        uiProps: {
            ...state.uiProps,
            [name]: { ...state.uiProps[name], hidden: !visible }
        }
    })),

    changeUI: (targets, updates) => set((state) => {
        const newUiProps = { ...state.uiProps };
        const newVisibility = { ...state.visibility };

        targets.forEach(name => {
            const currentProps = newUiProps[name] || {};
            newUiProps[name] = { ...currentProps, ...updates };

            if (updates.hidden !== undefined) {
                newVisibility[name] = !updates.hidden;
            }
        });

        return { uiProps: newUiProps, visibility: newVisibility };
    }),

    setMetadata: (name, data) => set((state) => ({
        metadata: { ...state.metadata, [name]: data }
    })),

    getFieldValue: (name) => get().values[name],
}));
