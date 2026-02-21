import React from 'react';

type WidgetComponent = React.FC<any>;

class Registry {
    private components: Map<string, WidgetComponent> = new Map();

    register(type: string, component: WidgetComponent) {
        if (this.components.has(type)) {
            console.warn(`Component type "${type}" is already registered. Overwriting.`);
        }
        this.components.set(type, component);
    }

    get(type: string): WidgetComponent | undefined {
        return this.components.get(type);
    }

    getAll() {
        return Object.fromEntries(this.components);
    }
}

export const WidgetRegistry = new Registry();
