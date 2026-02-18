
import React from "react";
import { Text } from "@chakra-ui/react";
import { ViewRegistry } from "../registry/ViewRegistry";
import "../views";
import "../widgets"; // Ensure all widgets are registered globally

const ViewRenderer = ({ config }: { config: any }) => {

    const { UI_TYPE, ...rest } = config;
    console.log("UI_TYPE", UI_TYPE);

    if (!UI_TYPE) {
        return <>
            <Text>UI_TYPE is not defined</Text>
        </>
    }
    const { type, ...restUIConfig } = UI_TYPE;

    if (type === "") {
        return <>
            <Text>UI_TYPE is not defined</Text>
        </>
    }
    const Component = ViewRegistry.get(type);

    if (Component) {
        return (
            <Component config={config} />
        );
    }


    return <>
        <Text>UI_TYPE is not defined</Text>
    </>
};

export default React.memo(ViewRenderer);
