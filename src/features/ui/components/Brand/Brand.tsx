import { Badge, Flex, Image } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { useNavigate } from "react-router";
import { useColorModeValue } from "@/components/ui/color-mode";

export default function Brand() {
  const navigate = useNavigate();
  const hoverBg = useColorModeValue("gray.100", "whiteAlpha.100");

  const onClickLogo = () => {
    navigate("/myApps");
  };

  return (
    <Tooltip content="Powered by Workspace AI" positioning={{ placement: "bottom-start" }}>
      <Flex
        position="relative"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        onClick={onClickLogo}
        // bg={useColorModeValue("white", "whiteAlpha.200")}
        p={3}
        borderRadius="xl"
        // boxShadow="lg"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "xl"
        }}
      >
        <Image
          src="/assets/icons/logo.png"
          alt="Workspace Logo"

          h="40px"
          w="auto"
          objectFit="contain"
        />
        <Badge
          position="absolute"
          bottom="1px"
          right="3px"
          colorPalette="gray"
          variant="plain"
          fontSize="0.5rem"
          fontWeight="bold"
          px={0}
          opacity={0.6}
        >
          v1.0.0
        </Badge>
      </Flex>
    </Tooltip>
  );
}
