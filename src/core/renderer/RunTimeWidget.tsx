import React from "react";
import { Box } from "@chakra-ui/react";
import { useFormState, useFormContext } from "react-hook-form";
import { WidgetRegistry } from "../registry/WidgetRegistry";
import { useFormStore } from "../store/useFormStore";

const RunTimeWidgetRender: React.FC<any> = React.memo(({ configs, tabs, ...rest }) => {
  const { control, setValue, getValues } = useFormContext();
  const { errors } = useFormState({ control });
  const visibility = useFormStore(state => state.visibility);
  const uiProps = useFormStore(state => state.uiProps);

  // Sync Zustand values back to react-hook-form if they change via rule engine
  React.useEffect(() => {
    let previousValues = useFormStore.getState().values;

    const unsubscribe = useFormStore.subscribe((state) => {
      const nextValues = state.values;
      if (nextValues === previousValues) return;

      Object.keys(nextValues).forEach(key => {
        if (previousValues[key] === nextValues[key]) return;
        if (getValues(key) === nextValues[key]) return;

        setValue(key, nextValues[key], {
          shouldDirty: false,
          shouldTouch: false,
          shouldValidate: false,
        });
      });

      previousValues = nextValues;
    });

    return unsubscribe;
  }, [getValues, setValue]);

  // If tabs are provided at this level, render the TabsWidget directly
  if (tabs && tabs.length > 0) {
    const TabsWidgetComponent = WidgetRegistry.get("tabs");
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
          const TabsWidgetComponent = WidgetRegistry.get("tabs");
          if (TabsWidgetComponent) {
            return (
              <Box key={widgetConfig.name || "tabs-container"}>
                <TabsWidgetComponent tabs={widgetConfig.tabs} {...rest} />
              </Box>
            );
          }
        }

        return (
          <Box
            key={widgetConfig.name}
            gridColumn={widgetConfig.colSpan ? `span ${widgetConfig.colSpan}` : undefined}
            {...(widgetConfig.styles || {})}
          >
            {(() => {
              switch (widgetConfig.widget) {
                default:
                  const RegisteredComponent = WidgetRegistry.get(widgetConfig.widget);
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


