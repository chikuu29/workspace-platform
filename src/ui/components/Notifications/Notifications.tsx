import { Steps, Flex, Skeleton, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { GETAPI } from "../../../app/api";

export default function Notifications() {
//   const notifications = [
//     { id: 1, info: "You have a new message", aName: "Alice" },
//     { id: 2, info: "Class starts at 6 PM", aName: "Gym" },
//   ];
  const [notifications,setNotifications]=useState<any[]>([])
  const [loading,setLoading]=useState(true)

  useEffect(() => {
    setLoading(true)
    GETAPI({
      path: "app/getNotification",
      params: {},
      isPrivateApi: true,
      enableCache: true,
      cacheTTL: 200,
    }).subscribe((res: any) => {
      console.log("%c ==== GETTING NOTIFICATION ===", "color:red", res);
      setLoading(false)
      if(res.success && res.results){
        setNotifications(res["results"])
      }
    });
  }, []);

 
  if(loading){
    return (
      <VStack gap={4}>
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="100%" />
        <Skeleton height="20px" width="100%" />
      </VStack>
    );
  }

  return (
    <Flex flexDirection="column">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            _hover={{ bg: "none" }}
            _focus={{ bg: "none" }}
            p="2"
            borderRadius="8px"
            mb="10px"
          >
            <Text>
              {notification.aName} - {notification.info}
            </Text>
          </MenuItem>
        ))
      ) : (
        <Text>No new notifications</Text>
      )}
    </Flex>
  );
}
