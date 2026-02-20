import React from "react";
import { Box } from "@chakra-ui/react";
import { useFormState, useFormContext } from "react-hook-form";
import { ComponentRegistry } from "../registry/ComponentRegistry";
import { useFormStore } from "../store/useFormStore";

const RunTimeWidgetRender: React.FC<any> = React.memo(({ configs, tabs, ...rest }) => {
  const { errors } = useFormState();
  const visibility = useFormStore(state => state.visibility);
  const uiProps = useFormStore(state => state.uiProps);
  const values = useFormStore(state => state.values);
  const { setValue } = useFormContext() || {};

  // Sync Zustand values back to react-hook-form if they change via rule engine
  React.useEffect(() => {
    if (setValue) {
      Object.keys(values).forEach(key => {
        setValue(key, values[key]);
      });
    }
  }, [values, setValue]);

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
        const isVisible = visibility[widgetConfig.name] !== false;
        if (!isVisible) return null;

        const props = uiProps[widgetConfig.name] || {};

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
                        {...props}
                        mandatory={props.mandatory ?? widgetConfig.mandatory ?? widgetConfig.required}
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

