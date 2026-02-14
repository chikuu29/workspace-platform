export class RuleEngine {
    static evaluate(expression: string, context: any): boolean {
        try {
            // Simple evaluation for now. In production, use a safe parser like 'filtrex' or 'jexl'.
            // This is a placeholder for a more robust engine.
            // DANGER: new Function is unsafe for user input without sanitization. 
            // We will assume trusted config for now or restrict scope.
            const func = new Function('context', `with(context) { return ${expression} }`);
            return func(context);
        } catch (e) {
            console.error(`Error evaluating rule "${expression}":`, e);
            return false;
        }
    }

    static isVisible(config: any, context: any): boolean {
        if (config.hidden === true) return false;
        if (typeof config.hidden === 'string') {
            return !this.evaluate(config.hidden, context);
        }
        // Check 'visible' property if exists
        if (config.visible && typeof config.visible === 'string') {
            return this.evaluate(config.visible, context);
        }
        return true;
    }
}
