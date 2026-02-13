import { Steps, Flex, Icon, useBreakpointValue, Text, Image, Box } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { useColorModeValue } from "../../../components/ui/color-mode";
import { GrDocumentStore } from "react-icons/gr";
import { useNavigate } from "react-router-dom";

export default function Brand() {
  const navigate = useNavigate(); // Move useNavigate here

  const onClickLogo = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/myApps");

    //  console.log("onClick",e);
  };
  return (
    <Tooltip content="Powered by myApps" aria-label="A tooltip">
      <Box
        onClick={onClickLogo}
        cursor={"pointer"}
        position="relative"
        display="inline-block"
      >
        <Image
          src="/assets/icons/logo.png"
          alt="Logo"
          // boxSize="100px"
          height="50px"
          objectFit="contain"
          // backgroundColor="transparent"
          // background="transparent" // Ensures the image itself is transparent
          display="block" // Prevents any inline-block space around the image
    
        />

       
        <Text
          textAlign={useBreakpointValue({ base: "center", md: "left" })}
          fontFamily={"heading"}
          // fontWeight={"bold"}
          // color={useColorModeValue("gray.800", "white")}
          // flexGrow={1}
          position="absolute"
          // bottom="-16px"
          // fontSize="lg"
          fontWeight="bold"
          bottom="-1"
          right="-7"
          fontSize="10px"
          // fontWeight="bold"
          mb={2} // Optional margin at the bottom for spacing
          mr={2} // Optional margin on the right for spacing
          transform="translateX(-50%)"
          color="red"
        >
          {/* <Text as="sub" color={"red"}> */}
          v1.0.0
          {/* </Text> */}
        </Text>
      </Box>
    </Tooltip>
  );
}
