/*eslint-disable*/
import { Steps, Flex, Link, List, Text } from "@chakra-ui/react";

import { useColorModeValue } from "../../../components/ui/color-mode";

export default function Footer() {
  let textColor = useColorModeValue("gray.400", "white");
  let linkColor = useColorModeValue({ base: "gray.400", lg: "white" }, "white");
  return (
    <Flex
      zIndex='3'
      flexDirection={{
        base: "column",
        lg: "row",
      }}
      alignItems={{
        base: "center",
        xl: "start",
      }}
      justifyContent='space-between'
      px={{ base: "30px", md: "0px" }}
      pb='30px'>
      <Text
        color={textColor}
        textAlign={{
          base: "center",
          xl: "start",
        }}
        mb={{ base: "20px", lg: "0px" }}>
        {" "}
        &copy; {1900 + new Date().getFullYear()}
        <Text as='span' fontWeight='500' ms='4px'>
          Horizon UI. All Rights Reserved. Made with love by
          <Link
            mx='3px'
            color={textColor}
            href='https://www.simmmple.com?ref=horizon-chakra-free'
            target='_blank'
            fontWeight='700'>
            Simmmple!
          </Link>
        </Text>
      </Text>
      <List.Root display='flex'>
        <List.Item
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='mailto:hello@simmmple.com?ref=horizon-chakra-free'>
            Support
          </Link>
        </List.Item>
        <List.Item
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://www.simmmple.com/licenses?ref=horizon-chakra-free'>
            License
          </Link>
        </List.Item>
        <List.Item
          me={{
            base: "20px",
            md: "44px",
          }}>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://simmmple.com/terms-of-service?ref=horizon-chakra-free'>
            Terms of Use
          </Link>
        </List.Item>
        <List.Item>
          <Link
            fontWeight='500'
            color={linkColor}
            href='https://www.blog.simmmple.com/?ref=horizon-chakra-free'>
            Blog
          </Link>
        </List.Item>
      </List.Root>
    </Flex>
  );
}