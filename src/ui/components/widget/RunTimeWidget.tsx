import React, { useMemo } from "react";

import TextArea from "./TextArea/TextArea";
import CollapsiblePanel from "./Panel/PanelComponet";
import { Steps, Box } from "@chakra-ui/react";
import RadioField from "./RadioField/RadioField";
import { useForm, useFormState } from "react-hook-form";
import TextField from "./TextField/TextField";
import UploadField from "./UploadField/UploadField";




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

const RunTimeWidgetRender: React.FC<any> = React.memo(({ configs,...rest}) => {
  console.log("====Calling RunTimeWidgetRender===");
  const {scriptFiles,...styles}=rest
  const {errors}=useFormState()
  if (!configs) return null;
  return (
    <>
      {configs.map((widgetConfig: any) => (
        <Box key={widgetConfig.name} {...styles}>
          {/* Added key here */}
          {(() => {
            switch (widgetConfig.widget) {
              case "textField":
                return <TextField {...widgetConfig}   errors={errors[widgetConfig.name]}/>;
              case "textAreaField":
                return <TextArea {...widgetConfig}  errors={errors[widgetConfig.name]}/>;
              case "uploadField":
                return <UploadField {...widgetConfig}  errors={errors[widgetConfig.name]}/>;
              case "panel":
                return (
                  <CollapsiblePanel
                    {...widgetConfig}
                    {...rest}
                    widgets={widgetConfig.widgets || []}
                    
                  />
                );
              case "radioField":
                return <RadioField {...widgetConfig} {...rest} errors={errors[widgetConfig.name]}/>
              default:
                return null; // Handle unknown widget types gracefully
            }
          })()}
          {/* IIFE to execute the switch statement */}
        </Box>
      ))}

    </>
  );
});

export default RunTimeWidgetRender;
