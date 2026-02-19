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
}

export const useFormStore = create<FormState>((set, get) => ({
    values: {},
    visibility: {},
    uiProps: {},
    errors: {},
    metadata: {},
    scripts: {},

    setScripts: (scripts) => set({ scripts }),

    initialize: (config: any[]) => {
        const currentValues = get().values || {};
        const values: Record<string, any> = { ...currentValues };
        const visibility: Record<string, boolean> = {};
        const uiProps: Record<string, WidgetProps> = {};
        const metadata: Record<string, any> = {};

        const processWidgets = (widgets: any[]) => {
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
                        mandatory: w.required === true,
                    };
                    metadata[w.name] = w;
                }

                if (w.widgets) processWidgets(w.widgets);
                if (w.tabs) {
                    w.tabs.forEach((t: any) => {
                        if (t.widgets) processWidgets(t.widgets);
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
