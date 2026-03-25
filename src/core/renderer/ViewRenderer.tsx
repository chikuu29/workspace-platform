
import React, { useMemo } from "react";
import { ViewRegistry, ViewType } from "../registry/ViewRegistry";
import FallbackRenderer from "./FallbackRenderer";
import "../views";
import "../widgets"; // Ensure all widgets are registered globally

const ViewRenderer = ({ config }: { config: any }) => {
    console.log("===Rendering ViewRenderer with config===");
    const UI_TYPE = config?.UI_TYPE;
    if (!UI_TYPE) {
        return <FallbackRenderer reason="MISSING_UI_TYPE" config={config} />;
    }
    // Use useMemo for component lookup to optimize performance
    const Component = useMemo(() => {
        if (!UI_TYPE?.type) return null;
        return ViewRegistry.get(UI_TYPE.type as ViewType);
    }, [UI_TYPE?.type]);



    if (!UI_TYPE.type || UI_TYPE.type === "") {
        return <FallbackRenderer reason="INVALID_TYPE" config={config} />;
    }

    if (!Component) {
        return (
            <FallbackRenderer
                reason="COMPONENT_NOT_FOUND"
                type={UI_TYPE.type}
                config={config}
            />
        );
    }

    return <Component config={config} />;
};

export default React.memo(ViewRenderer);
