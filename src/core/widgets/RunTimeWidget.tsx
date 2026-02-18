import React, { useMemo } from "react";

import TextArea from "./TextArea";
import CollapsiblePanel from "./Panel";
import { Steps, Box } from "@chakra-ui/react";
import RadioField from "./RadioField";
import { useForm, useFormState } from "react-hook-form";
import TextField from "./TextField";
import UploadField from "./UploadField";
import { ComponentRegistry } from "../registry/ComponentRegistry";



interface WidgetConfig {
  name: string;
  text: string;
  type: string;
  widget: string;
  [key: string]: any; // Allow other properties
}

interface RunTimeWidgetRendererProps {
  configs: Array<{
    name: string;
    type?: string;
    text: string;
    widget: string;
    hidden: boolean;
    styles: any;
    [key: string]: any; // Allows for additional properties
    widgets?: WidgetConfig[]; // Assuming WidgetConfig is defined elsewhere
  }>;
}

const RunTimeWidgetRender: React.FC<any> = React.memo(({ configs, tabs, ...rest }) => {
  const { errors } = useFormState();

  // If tabs are provided at this level, render the TabsWidget directly
  if (tabs && tabs.length > 0) {
    const TabsWidgetComponent = ComponentRegistry.get("tabs");
    if (TabsWidgetComponent) {
      return <TabsWidgetComponent tabs={tabs} {...rest} />;
    }
  }

  if (!configs || !Array.isArray(configs)) return null;

  return (
    <>
      {configs.map((widgetConfig: any) => {
        // If the widget itself has tabs, we should render them
        if (widgetConfig.tabs && widgetConfig.tabs.length > 0) {
          const TabsWidgetComponent = ComponentRegistry.get("tabs");
          if (TabsWidgetComponent) {
            return (
              <Box key={widgetConfig.name || "tabs-container"} {...rest}>
                <TabsWidgetComponent tabs={widgetConfig.tabs} {...rest} />
              </Box>
            );
          }
        }

        return (
          <Box key={widgetConfig.name} {...rest}>
            {(() => {
              switch (widgetConfig.widget) {
                default:
                  const RegisteredComponent = ComponentRegistry.get(widgetConfig.widget);
                  if (RegisteredComponent) {
                    return (
                      <RegisteredComponent
                        {...widgetConfig}
                        {...rest}
                        errors={errors[widgetConfig.name]}
                        widgets={widgetConfig.widgets}
                      />
                    );
                  }
                  return null;
              }
            })()}
          </Box>
        );
      })}
    </>
  );
});

export default RunTimeWidgetRender;
