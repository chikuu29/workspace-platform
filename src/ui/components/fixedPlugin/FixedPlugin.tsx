// Chakra Imports
import { Steps, Button, Icon } from "@chakra-ui/react";
import { useColorMode } from "../../../components/ui/color-mode";
// Custom Icons
import { IoMdMoon, IoMdSunny } from "react-icons/io";

export default function FixedPlugin(props: any) {
  const { ...rest } = props;
  const { colorMode, toggleColorMode } = useColorMode();
  // let bgButton = "linear-gradient(135deg, #868CFF 0%, #4318FF 100%)";

  return (
    <Button
      {...rest}
      h="60px"
      w="60px"
      zIndex="99"
      // bg={bgButton}
      position="fixed"
      variant="outline"
      // left={document.documentElement.dir === "rtl" ? "35px" : ""}
      // right={document.documentElement.dir === "rtl" ? "" : "35px"}
      right={10}
      bottom="30px"
      border="1px solid"
      // borderColor="#6A53FF"
      borderRadius="8px"
      onClick={toggleColorMode}
      display="flex"
      p="0px"
      align="center"
      justify="center"
    >
      <Icon
        h="24px"
        w="24px"
        // color="white"
        as={colorMode === "light" ? IoMdSunny : IoMdMoon}
      />
    </Button>
  );
}
