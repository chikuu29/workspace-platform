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
                            ruleEngine.applyAction(action, context);
                        });
                    } else if (rule.elseActions) {
                        rule.elseActions.forEach((action: any) => {
                            ruleEngine.applyAction(action, context);
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

    applyAction: (action: any, context?: any) => {
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

export const actionEngine = {
    trigger: (eventName: string, params: any) => {
        console.log(`[ActionEngine] Triggering ${eventName}`, params);
    }
};

