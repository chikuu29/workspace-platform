import { Badge, Flex, Image } from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
import { useNavigate } from "react-router";

export default function Brand() {
  const navigate = useNavigate();

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
        minW={0}
        flexShrink={1}
        // bg={useColorModeValue("white", "whiteAlpha.200")}
        p={{ base: 0.5, sm: 1, md: 3 }}
        borderRadius="xl"
        // boxShadow="lg"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "xl"
        }}
      >
        <Image
          src="/assets/icons/workspace-logo.svg"
          alt="Workspace Logo"

          h={{ base: "38px", sm: "44px", md: "52px" }}
          maxW={{ base: "128px", sm: "172px", md: "260px" }}
          w="auto"
          objectFit="contain"
        />
        <Badge
          display={{ base: "none", sm: "inline-flex" }}
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
