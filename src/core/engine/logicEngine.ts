import { useFormStore } from "../store/useFormStore";

export const ruleEngine = {
    evaluate: (name: string, value: any, eventName: string = 'change', context?: any) => {
        const store = useFormStore.getState();
        const widgetMeta = store.metadata[name];

        if (!widgetMeta) return;

        // Process Event-Based Rules (e.g., events.change)
        if (widgetMeta.events) {
            ruleEngine.processEvents(widgetMeta.events, value, eventName, context);
        }
    },

    processEvents: (events: any, value: any, eventName: string, context?: any) => {
        if (events && events[eventName]) {
            const rules = events[eventName];
            if (Array.isArray(rules)) {
                rules.forEach((rule: any) => {
                    const isMatch = ruleEngine.checkCondition(rule.condition, value);
                    if (isMatch || !rule.condition) { // Allow rules without condition
                        rule.actions.forEach((action: any) => {
                            ruleEngine.applyAction(action, context, value);
                        });
                    } else if (rule.elseActions) {
                        rule.elseActions.forEach((action: any) => {
                            ruleEngine.applyAction(action, context, value);
                        });
                    }
                });
            }
        }
    },

    checkCondition: (condition: string, value: any) => {
        if (!condition) return true;
        try {
            // Basic rule evaluation: "value == 'male'"
            const evalFunc = new Function('value', `return ${condition}`);
            return evalFunc(value);
        } catch (e) {
            console.error("Condition evaluation error:", e, condition);
            return false;
        }
    },

    applyAction: (action: any, context?: any, value?: any) => {
        const store = useFormStore.getState();
        // target can be optional for runScript
        const targets = action.target ? (Array.isArray(action.target) ? action.target : [action.target]) : [];

        switch (action.type) {
            case "show":
                store.changeUI(targets, { hidden: false });
                break;
            case "hide":
                store.changeUI(targets, { hidden: true });
                break;
            case "disabled":
                store.changeUI(targets, { disabled: action.value !== false });
                break;
            case "mandatory":
                store.changeUI(targets, { mandatory: action.value !== false });
                break;
            case "setValue":
                targets.forEach((t: string) => store.setFieldValue(t, action.value));
                break;
            case "setProp":
                const resolvedVal = typeof action.value === 'string' && action.value.includes('{{value}}')
                    ? action.value.replace('{{value}}', value ?? '')
                    : action.value;
                store.changeUI(targets, { [action.prop]: resolvedVal });
                break;
            case "runScript":
                const scriptName = action.script;
                const scriptFn = store.scripts && store.scripts[scriptName];
                if (typeof scriptFn === 'function') {
                    scriptFn(context, action.args);
                } else {
                    console.warn(`Script ${scriptName} not found or not a function`);
                }
                break;
            default:
                console.warn("Unknown action type:", action.type);
        }
    }
};

import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";

export const actionEngine = {
    trigger: (actionConfig: any, payload: any = {}, onSuccess?: () => void) => {
        const store = useFormStore.getState();
        console.log(`[ActionEngine] Executing Action:`, actionConfig, "with payload:", payload);

        if (!actionConfig) return;

        switch (actionConfig.type) {
            case "openPanel":
                // Trigger the global panel
                store.setPanelState(true, actionConfig.panelConfig, payload);
                break;
            case "closePanel":
                store.setPanelState(false);
                break;
            case "apiCall":
                const method = actionConfig.method?.toUpperCase() || "GET";
                let path = actionConfig.apiPath;

                // Replace path vars like {{id}} with payload data
                if (path && path.includes("{{") && payload) {
                    Object.keys(payload).forEach(key => {
                        path = path.replace(`{{${key}}}`, payload[key]);
                    });
                }

                const apiConfig = {
                    path,
                    serverName: actionConfig.serverName || "core",
                    isPrivateApi: true,
                    data: (method === "POST" || method === "PUT") ? payload : undefined
                };

                const executeCall = () => {
                    switch (method) {
                        case "POST": return POSTAPI(apiConfig).subscribe;
                        case "PUT": return PUTAPI(apiConfig).subscribe;
                        case "DELETE": return DELETEAPI(apiConfig).subscribe;
                        default: return GETAPI(apiConfig).subscribe;
                    }
                };

                executeCall()((res: any) => {
                    if (res.success) {
                        console.log("[ActionEngine] API Success", res);
                        store.setPanelState(false);
                        if (onSuccess) onSuccess();
                    }
                });
                break;
            case "navigate":
                let navPath = actionConfig.path;
                const organizationName = store.organizationName;

                if (navPath && payload) {
                    // Replace path vars like {{id}} with payload data
                    Object.keys(payload).forEach(key => {
                        navPath = navPath.replace(`{{${key}}}`, payload[key]);
                    });
                    // Also replace global vars
                    if (organizationName) {
                        navPath = navPath.replace(`{{organizationName}}`, organizationName);
                    }
                }

                if (store.navigate) {
                    console.log("[ActionEngine] Navigating to:", navPath);
                    store.navigate(navPath);
                } else {
                    console.error("[ActionEngine] Navigation function not found in store");
                }
                break;
            default:
                console.warn("[ActionEngine] Unknown action type:", actionConfig.type);
        }
    }
};

