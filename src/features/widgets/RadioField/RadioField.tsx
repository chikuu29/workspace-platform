import { Steps, Box, Button, Flex, RadioGroup, Spacer, Stack, Field } from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import { useEffect, useState } from "react";
import { FieldError, useFormContext, useWatch } from "react-hook-form";
import { useScriptInstance } from "../../ui/components/contexts/ScriptProvider";
import { FaTimes } from "react-icons/fa";
import React from "react";

interface RADIO {
  name: string;
  text: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: string;
  required?: boolean;
  oneLiner?: boolean;
  outLineBorder?: boolean;
  listeners?: {
    change?: {
      methodName: string;
      param: string;
    };
    [key: string]: any;
  };
  errors: FieldError;
}

const RadioField = ({
  name,
  text,
  options,
  disabled = false,
  hidden = false,
  defaultValue = "",
  required = false,
  oneLiner = false,
  outLineBorder = true,
  listeners = {},
  errors,
}: RADIO) => {
  if (hidden) return null;
  console.log("===EXECUTE RadioField===");
  const [dynamicMethods, setDynamicMethods] = useState<any>({});
  const { getScriptInstance, scriptFiles } = useScriptInstance();
  const methods = useFormContext();

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

  const inputChanges = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const methodName = listeners[event.type]
      ? listeners[event.type]["methodName"]
      : "";
    const method = dynamicMethods[methodName];
    if (methodName && method && typeof method === "function") {
      method(methods, {
        name,
        value: event.target.value,
        text,
        disabled,
        oneLiner,
        outLineBorder,
        listeners,
      });
    }
  };

  const clearSelection = () => {
    console.log(methods.getValues());
    methods.setValue(name, "", { shouldValidate: true });
  };

  return (
    <Box
      m={2}
      p={3}
      {...(outLineBorder && {
        boxShadow: "2xl",
        borderRadius: "lg",
        borderWidth: "2px",
      })}
      bg={useColorModeValue("white", "gray.950")}
    >
      <Field.Root
        invalid={!!errors}
        required={required}
        disabled={disabled}
      >
        <Flex gap={1} direction="column" align="flex-start">
          <Field.Label
            htmlFor={name}
            m={0}
            width={{ base: "100%", md: "30%" }}
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="bold"
            color="gray.600"
          >
            {text}
          </Field.Label>
          <RadioGroup.Root
            width={"100%"}
            id={name}
            disabled={disabled}
            value={String(useWatch({
              name,
            }))}
            color="gray.600">
            <Flex direction="row" align="center" gap={2} width="100%">
              <Stack
                flex="1"
                direction="row"
                bg={useColorModeValue("white", "gray.950")}
                {...(outLineBorder && {
                  boxShadow: "sm",
                  borderRadius: "lg",
                  borderWidth: "2px",
                })}
                p="2"
                flexWrap="wrap"
              >
                {options.map((option) => (
                  <RadioGroup.Item
                    key={option.value}
                    value={String(option.value)}
                    color="gray.600"
                    {...methods.register(name, {
                      required: required ? `${text} Field Is Required` : false,
                    })}
                  >
                    <RadioGroup.ItemHiddenInput
                      onChange={(e) => {
                        inputChanges(e);
                        methods.setValue(name, e.target.value, {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <RadioGroup.ItemControl />
                    <RadioGroup.ItemText fontWeight="medium">{option.label}</RadioGroup.ItemText>
                  </RadioGroup.Item>
                ))}
              </Stack>

              <Button
                onClick={clearSelection}
                // colorScheme="red"
                variant="outline"
                aria-label="Clear"
              >
                <FaTimes />
              </Button>
            </Flex>
          </RadioGroup.Root>
          <Field.ErrorText>{errors?.message?.toString()}</Field.ErrorText>
        </Flex>
      </Field.Root>
    </Box>
  );
};

export default React.memo(RadioField);
