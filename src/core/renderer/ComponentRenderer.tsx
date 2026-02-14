import React from 'react';
import { Box } from "@chakra-ui/react";
import { ComponentRegistry } from "../registry/ComponentRegistry";
import { useFormContext } from "react-hook-form";

// Helper to resolve nested properties or conditions (placeholder for full RuleEngine)
const isVisible = (config: any, values: any) => {
    if (config.hidden) return false;
    // TODO: Add expression evaluation here
    return true;
};

interface ComponentRendererProps {
    config: any;
    [key: string]: any;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({ config, ...rest }) => {
    const { watch } = useFormContext();
    const formValues = watch();

    if (!config || !isVisible(config, formValues)) return null;

    const Component = ComponentRegistry.get(config.widget);

    if (!Component) {
        console.warn(`Widget type "${config.widget}" not found in registry.`);
        return null;
    }

    // Handle nested widgets (layouts)
    const children = config.widgets ? (
        config.widgets.map((childConfig: any) => (
            <ComponentRenderer key={childConfig.name} config={childConfig} {...rest} />
        ))
    ) : null;

    return (
        <Box {...config.styles}>
            <Component {...config} {...rest}>
                {children}
            </Component>
        </Box>
    );
};
