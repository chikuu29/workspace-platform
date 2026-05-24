import { useFormStore } from "../store/useFormStore";
import { GETAPI, POSTAPI, PUTAPI, DELETEAPI } from "@/app/api";

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
                console.log(`[RuleEngine] Setting value on targets:`, targets, "value:", action.value);
                targets.forEach((t: string) => {
                    store.setFieldValue(t, action.value);
                    context?.setValue(t, action.value, { shouldValidate: true, shouldDirty: true });
                    context?.clearErrors(t);
                });
                break;
            case "setProp":
                const resolvedVal = typeof action.value === 'string' && action.value.includes('{{value}}')
                    ? action.value.replace('{{value}}', value ?? '')
                    : action.value;
                console.log(`[RuleEngine] Setting prop on targets:`, targets, "prop:", action.prop, "value:", resolvedVal);
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
            case "apiCall": {
                if (!action.apiPath) break;
                if (!value) {
                    if (action.next) {
                        const nextActions = Array.isArray(action.next) ? action.next : [action.next];
                        nextActions.forEach((nextAct: any) => {
                            if (nextAct.type === "setValue") {
                                store.setFieldValue(nextAct.target, "");
                                context?.setValue(nextAct.target, "", { shouldValidate: true, shouldDirty: true });
                                context?.clearErrors(nextAct.target);
                            } else {
                                ruleEngine.applyAction(nextAct, context, "");
                            }
                        });
                    }
                    break;
                }

                // 1. Resolve path parameters
                let resolvedPath = action.apiPath.replace('{{value}}', value ?? '');
                const pathMatches = resolvedPath.match(/\{\{([^}]+)\}\}/g);
                if (pathMatches) {
                    pathMatches.forEach((m: string) => {
                        const fieldName = m.replace('{{', '').replace('}}', '');
                        if (fieldName !== 'value') {
                            const fieldValue = context?.getValues ? context.getValues(fieldName) : (store.values[fieldName] ?? '');
                            resolvedPath = resolvedPath.replace(m, fieldValue ?? '');
                        }
                    });
                }

                // 2. Resolve body/data parameters
                let resolvedData = action.data || action.body;
                if (resolvedData && typeof resolvedData === 'object') {
                    let dataStr = JSON.stringify(resolvedData);
                    dataStr = dataStr.replace('{{value}}', value ?? '');
                    const dataMatches = dataStr.match(/\{\{([^}]+)\}\}/g);
                    if (dataMatches) {
                        dataMatches.forEach((m: string) => {
                            const fieldName = m.replace('{{', '').replace('}}', '');
                            if (fieldName !== 'value') {
                                const fieldValue = context?.getValues ? context.getValues(fieldName) : (store.values[fieldName] ?? '');
                                dataStr = dataStr.replace(m, fieldValue ?? '');
                            }
                        });
                    }
                    resolvedData = JSON.parse(dataStr);
                }

                const method = (action.method || 'GET').toUpperCase();
                const serverName = action.serverName || "core";

                const apiConfig = {
                    path: resolvedPath,
                    serverName: serverName as any,
                    isPrivateApi: true,
                    data: resolvedData
                };

                const executeCall = () => {
                    switch (method) {
                        case "POST": return POSTAPI(apiConfig);
                        case "PUT": return PUTAPI(apiConfig);
                        case "DELETE": return DELETEAPI(apiConfig);
                        default: return GETAPI(apiConfig);
                    }
                };

                console.log(`[RuleEngine] Triggering generic apiCall. Method: ${method}, URL: ${resolvedPath}`);

                 executeCall().subscribe({
                    next: (res: any) => {
                        console.log("[RuleEngine] apiCall response received:", res);
                        if (res.success && res.data && action.next) {
                            const nextActions = Array.isArray(action.next) ? action.next : [action.next];
                            
                            // Recursive helper to resolve tokens safely without JSON stringify/parse
                            const resolveTokens = (obj: any, data: any, triggerVal: any): any => {
                                if (typeof obj === 'string') {
                                    let resolved = obj.replace('{{value}}', triggerVal ?? '');
                                    const matches = resolved.match(/\{\{([^}]+)\}\}/g);
                                    if (matches) {
                                        matches.forEach((m: string) => {
                                            const cleanMatch = m.replace('{{', '').replace('}}', '');
                                            const parts = cleanMatch.split('.');
                                            const propPath = (parts.length > 1 && (parts[0] === 'data' || parts[0] === 'response'))
                                                ? parts.slice(1).join('.')
                                                : cleanMatch;
                                            
                                            const propValue = (data && data[propPath] !== undefined)
                                                ? data[propPath]
                                                : '';
                                            resolved = resolved.replace(m, String(propValue));
                                        });
                                    }
                                    return resolved;
                                } else if (Array.isArray(obj)) {
                                    return obj.map(item => resolveTokens(item, data, triggerVal));
                                } else if (obj !== null && typeof obj === 'object') {
                                    const result: any = {};
                                    for (const key in obj) {
                                        if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                            result[key] = resolveTokens(obj[key], data, triggerVal);
                                        }
                                    }
                                    return result;
                                }
                                return obj;
                            };

                            nextActions.forEach((nextAct: any, idx: number) => {
                                try {
                                    console.log(`[RuleEngine] Processing pipeline action #${idx + 1}:`, nextAct);
                                    const resolvedNextAction = resolveTokens(nextAct, res.data, value);
                                    console.log(`[RuleEngine] Resolved pipeline action #${idx + 1}:`, resolvedNextAction);
                                    ruleEngine.applyAction(resolvedNextAction, context, value);
                                } catch (err) {
                                    console.error(`[RuleEngine] Failed to execute pipeline action #${idx + 1}:`, err);
                                }
                            });
                        }
                    },
                    error: (err) => {
                        console.error("[logicEngine] ruleEngine apiCall failed:", err);
                    }
                });
                break;
            }
            default:
                console.warn("Unknown action type:", action.type);
        }
    }
};

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
                console.log(`[ActionEngine] Preparing API call:`, actionConfig, "with payload:", payload);
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
                        case "POST": return POSTAPI(apiConfig);
                        case "PUT": return PUTAPI(apiConfig);
                        case "DELETE": return DELETEAPI(apiConfig);
                        default: return GETAPI(apiConfig);
                    }
                };

                executeCall().subscribe({
                    next: (res: any) => {
                        if (res.success) {
                            console.log("[ActionEngine] API Success", res);
                            store.setPanelState(false);
                            if (onSuccess) onSuccess();
                        }
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

