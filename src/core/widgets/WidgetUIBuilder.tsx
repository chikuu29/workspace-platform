import "./index";
import { Steps, Box, Button, Skeleton, SkeletonText } from "@chakra-ui/react";
import RunTimeWidgetRender from "../renderer/RunTimeWidget";
import { FormProvider, useForm } from "react-hook-form";
import { memo, useEffect, useState, forwardRef } from "react";
import { GETAPI } from "../../app/api";
import { ScriptProvider } from "../../features/ui/components/contexts/ScriptProvider";
import Loader from "../../features/ui/components/Loader/Loader";

const WidgetUIBuilder = forwardRef<any, any>(({ formData = {}, ...rest }, ref) => {
  console.log("%c===Widget UI Builder===", "color:green");
  // const {WidgetSubmitRef,WidgetResetButtonRef}=ref

  const { onSubmit, UITemplateID, WidgetSubmitRef, WidgetResetButtonRef } =
    rest;
  const [uiLoading, setUiloading] = useState(true);
  const [UITempate, setUITemplate] = useState<any[]>([]);
  const [scriptFiles, setScriptFiles] = useState<string[]>([]);
  useEffect(() => {
    const getUITemplate = async () => {
      console.log("Calling GetUITemplate");
      GETAPI({
        path: `app/ui_template?id=${UITemplateID}`,
        isPrivateApi: true,
        enableCache: false,
      }).subscribe(async (res: any) => {
        console.log(res);
        if (res.success && res["result"].length > 0) {
          setUITemplate(res["result"][0]["UI_VIEW"]["schema"]["config"]);
          setScriptFiles(res["result"][0]["scriptFiles"]);
          setUiloading(false);
        } else {
          setUiloading(false);
        }
      });
    };

    getUITemplate();
  }, [UITemplateID]);

  const methods = useForm({
    mode: "onChange", // Validate on every input change
    reValidateMode: "onChange",
    shouldFocusError: true,
    shouldUnregister: false,
    defaultValues: formData,
  });

  if (uiLoading) {
    return (
      <Box p="4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Box
            key={index}
            boxShadow="md"
            borderRadius="lg"
            borderWidth="2px"
            padding={2}
            mt={3}
            mb={3}
            w="100%"
          >
            <Skeleton height="20px" mb={2} width="30%" />

            {/* Skeleton for Input */}
            <Skeleton height="40px" mb={2} borderRadius="lg" width="100%" />

            {/* Skeleton for Form Helper Text */}
            <SkeletonText
              noOfLines={1}
              gap="4"
              width="50%"
            />
          </Box>
        ))}
      </Box>
    ); //
  }

  return (
    <>
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
          <ScriptProvider scriptFiles={scriptFiles}>
            <RunTimeWidgetRender
              configs={UITempate}
              scriptFiles={scriptFiles}
            ></RunTimeWidgetRender>
          </ScriptProvider>
          <Button
            ref={WidgetSubmitRef}
            variant="outline"
            fontWeight="500"
            w="100%"
            h="50"
            mb="24px"
            type="submit"
            display={"none"}
          >
            Save & Complete
          </Button>
          <Button
            ref={WidgetResetButtonRef}
            variant="outline"
            fontWeight="500"
            w="100%"
            h="50"
            mb="24px"
            type="button"
            display={"none"}
            onClick={() => methods.reset()}
          >
            Reset
          </Button>
        </form>
      </FormProvider>
    </>
  );
});

export default memo(WidgetUIBuilder);
