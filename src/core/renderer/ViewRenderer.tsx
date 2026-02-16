
import { Text } from "@chakra-ui/react";
import { ViewRegistry } from "../registry/ViewRegistry";
import "../views";

const ViewRenderer = ({ config }: { config: any }) => {

    const { UI_TYPE, ...rest } = config;
    console.log("UI_TYPE", UI_TYPE);

    if (!UI_TYPE) {
        return <>
            <Text>UI_TYPE is not defined</Text>
        </>
    }
    const { type, ...RESTUI_TYPE } = UI_TYPE;

    if (type === "") {
        return <>
            <Text>UI_TYPE is not defined</Text>
        </>
    }
    const Component = ViewRegistry.get(type);

    if (Component) {
        return (
            <Component {...RESTUI_TYPE} {...rest} />
        );
    }


    return <>
        <Text>UI_TYPE is not defined</Text>
    </>
};

export default ViewRenderer;
