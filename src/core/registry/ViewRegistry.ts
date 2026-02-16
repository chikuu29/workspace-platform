import React from 'react';

type ViewComponent = React.FC<any>;

export enum ViewType {
    SECTION_VIEW = "SECTION_VIEW",

}

class Registry {
    private components: Map<ViewType, ViewComponent> = new Map();

    register(type: ViewType, component: ViewComponent) {
        if (this.components.has(type)) {
            console.warn(`Component type "${type}" is already registered. Overwriting.`);
        }
        this.components.set(type, component);
    }

    get(type: ViewType): ViewComponent | undefined {
        return this.components.get(type);
    }

    getAll() {
        return Object.fromEntries(this.components);
    }
}

export const ViewRegistry = new Registry();
