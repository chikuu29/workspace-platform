import { Steps, Box, Flex, Input, Field } from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { useEffect, useState } from "react";
import React from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { useScriptInstance } from "../../components/contexts/ScriptProvider";
interface TEXTFIELD {
  name: string;
  text: string;
  required?: boolean;
  description?: string;
  type?: string;
  disabled?: boolean; // Optional property
  hidden?: boolean; // Optional property
  widget?: string; // Optional property
  oneLiner?: boolean; // Optional property
  outLineBorder?: boolean;
  maxLength?: number;
  minLength?: number;
  listeners?: {
    change?: {
      methodName: string; // Name of the method to call
      param: string; // Parameter to pass to the method
    };
    [key: string]: any;
  };
  errors: FieldError;
}

const TextField = ({
  name,
  text,
  description,
  type = "string",
  disabled = false,
  hidden = false,
  widget,
  oneLiner = false,
  outLineBorder = true,
  required = false,
  listeners = {},
  maxLength,
  minLength,
  errors,
}: TEXTFIELD) => {
  if (hidden) return null;
  console.log("===EXECUTE TextField===");
  // If hidden is true, do not render anything
  const [dynamicMethods, setDynamicMethods] = useState<any>({});
  const { getScriptInstance, scriptFiles } = useScriptInstance();

  useEffect(() => {
    const loadDynamicMethods = async () => {
      try {
        const methods = getScriptInstance[0];
        const filteredMethods = Object.keys(listeners).reduce(
          (acc: any, key: any) => {
            const methodName = listeners[key]["methodName"];
            if (methods[methodName]) {
              acc[methodName] = methods[methodName];
            }
            return acc;
          },
          {}
        );
        setDynamicMethods(filteredMethods);
      } catch (error) {
        console.error("%c Error loading scripts:", "color:red", error);
      }
    };
    loadDynamicMethods();
  }, [getScriptInstance]);
  const methods = useFormContext();
  const control = methods.control;

  const inputChanges = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const methodName = listeners[event.type]
      ? listeners[event.type]["methodName"]
      : "";
    const method = dynamicMethods[methodName];
    if (methodName) {
      if (method && typeof method === "function") {
        method(methods, {
          name,
          value: event.target.value,
          text,
          description,
          type,
          disabled,
          widget,
          oneLiner,
          outLineBorder,
          listeners,
        });
      } else {
        console.log(
          `%c ====CHECK YOUR METHOD NAME ${methodName}() NOT FOUND IN ${scriptFiles} ==== `,
          "color:red"
        );
      }
    }
  };

  var styles: any = {
    direction: "column",
    align: "flex-start",
  };

  if (oneLiner) {
    styles = {
      direction: { base: "column", md: "row" },
      align: "center",
    };
  }

  return (
    <Box
      m={2}
      p={3}
      bg={useColorModeValue("white", "gray.950")}
      {...(outLineBorder && {
        boxShadow: "2xl",
        borderRadius: "lg",
        borderWidth: "2px",
      })}
    >
      <Field.Root invalid={!!errors} required={required}>
        <Flex gap={1} {...styles}>
          <Field.Label
            htmlFor={name}
            m={0}
            width={{ base: "100%", md: "30%" }}
            fontSize={{ base: "sm", md: "md" }} // Responsive font size
            fontWeight="bold" // Bold text
            color="gray.600"
          >
            {text}
          </Field.Label>
          <Flex direction="column" width="100%">
            <Input
              {...methods.register(name, {
                required: required ? `${text} Field Is Required` : false,
                ...(maxLength && {
                  maxLength: {
                    value: maxLength,
                    message: `Maximum length is ${maxLength}`,
                  },
                }),
                ...(minLength && {
                  minLength: {
                    value: minLength,
                    message: `Minimun length is ${minLength}`,
                  },
                }),
              })}
              type={type}
              variant="main"
              id={name}
              placeholder={description}
              onValueChange={(e) => {
                inputChanges(e);
                methods.setValue(name, e.target.value, {
                  shouldValidate: true,
                });
              }}
              {...(outLineBorder && {
                boxShadow: "md",
                borderRadius: "lg",
                borderWidth: "2px",
              })}
            />
            {/* Display current input length and max length */}
            <Flex alignItems={"center"} justify={"space-between"}>
              {maxLength && (
                <Field.HelperText
                  fontSize="sm"
                  color={!!errors ? "red.500" : "gray.500"}
                  fontWeight={"600"}
                  mt={1}
                >
                  {useWatch({
                    control,
                    name,
                  })?.length || 0}
                  /{maxLength}
                </Field.HelperText>
              )}
              <Field.ErrorText>{errors?.message?.toString()}</Field.ErrorText>
            </Flex>
          </Flex>
        </Flex>
      </Field.Root>
    </Box>
  );
};

export default React.memo(TextField);
