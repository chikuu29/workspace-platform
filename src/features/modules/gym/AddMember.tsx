import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import WidgetUIBuilder from "../../../core/widgets/WidgetUIBuilder";
import { Steps, Box, Button, Heading, HStack, Separator } from "@chakra-ui/react";
import { POSTAPI } from "../../../app/api";
import { FaCheck, FaRedo } from "react-icons/fa";

export default function AddMember(params: any) {
  console.log("===CALLING GymRecord===");
  const WidgetSubmitRef = useRef<HTMLButtonElement>(null);
  const WidgetResetRef = useRef<HTMLButtonElement>(null);

  const handleChange = useCallback((formData: any, error: any) => {
    console.log("error:", error);
    console.log("Calling Handle", formData);
    POSTAPI({
      path: "gym/addMember",
      data: formData,
      isPrivateApi: true,
    }).subscribe((res: any) => {
      console.log("res", res);
    });
    // setFormData(formData)
  }, []);
  const initialFormData = useMemo(() => ({
  }), []);
  return (
    <>
      <Box>
        <Box minH={70}  >
          <Box
            // position={"fixed"}
            // width={"100%"}
            zIndex={9}
            // bg={"black"}
            overflow={"hidden"}
            transition="background-color 0.3s ease"
            px={4}
          >
            <Heading
              pt={2}
              pe={2}

              w="100%"
              size="md"
              // color="gray.700"
              // w={"100"}
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wide"
            >
              Add New Member
            </Heading>
            <Separator
              borderColor="red.500"
              borderWidth="2px"
              width="11.5%"
              mt={2}
            // mx="auto"
            />
          </Box>
        </Box>
        <WidgetUIBuilder
          onSubmit={handleChange}
          UITemplateID="1"
          formData={initialFormData}
          WidgetSubmitRef={WidgetSubmitRef}
          WidgetResetButtonRef={WidgetResetRef}
        ></WidgetUIBuilder>
        <HStack justifyContent="flex-end" width="100%" gap={4}>
          <Button
            colorPalette="green"
            variant="outline"
            type="button"
            onClick={() => WidgetSubmitRef.current?.click()}
            bg={useColorModeValue("white", "gray.950")}><FaCheck />Submit
          </Button>
          <Button
            variant="outline"
            type="button"
            colorPalette="red"
            onClick={() => WidgetResetRef.current?.click()}
            bg={useColorModeValue("white", "gray.950")}><FaRedo />Reset
          </Button>
        </HStack>
      </Box>
    </>
  );
}
