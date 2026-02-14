// Chakra Imports
import { Steps, Button, Icon } from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
// Custom Icons
import { IoMdMoon, IoMdSunny } from "react-icons/io";

export default function FixedPlugin(props: any) {
  const { ...rest } = props;
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Button
      {...rest}
      h="60px"
      w="60px"
      zIndex="99"

      position="fixed"
      visual="solid"

      right={10}
      bottom="30px"

      borderRadius="20px"
      onClick={toggleColorMode}
      display="flex"
      p="0px"
      align="center"
      justify="center"
    >
      <Icon
        h="24px"
        w="24px"
        as={colorMode === "light" ? IoMdSunny : IoMdMoon}
      />
    </Button>
  );
}
