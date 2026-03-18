import { IconButton, Input, Icon } from "@chakra-ui/react";
import { InputGroup } from "@/components/ui/input-group";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuSearch } from 'react-icons/lu';

export function SearchBar(props: any) {
  const { variant, background, children, placeholder, borderRadius, ...rest } =
    props;
  const searchIconColor = useColorModeValue("gray.700", "white");
  const inputBg = useColorModeValue("secondaryGray.300", "navy.900");
  const inputText = useColorModeValue("gray.700", "gray.100");

  return (
    <InputGroup
      w={{ base: "100%", md: "100%" }}
      startElement={
        <IconButton
          bg='inherit'
          borderRadius='inherit'
       
          _active={{
            bg: "inherit",
            transform: "none",
            borderColor: "transparent",
          }}
          _focus={{
            boxShadow: "none",
          }}
          aria-label={""}
        >
          <Icon as={LuSearch} color={searchIconColor} w='15px' h='15px' />
        </IconButton>
      }
      {...rest}
    >
      <Input
        variant='outline'
        fontSize='sm'
        bg={background ? background : inputBg}
        color={inputText}
        fontWeight='500'
        _placeholder={{ color: "gray.400", fontSize: "14px" }}
        borderRadius={borderRadius ? borderRadius : "30px"}
        placeholder={placeholder ? placeholder : "Search..."}
      />
    </InputGroup>
  );
}
