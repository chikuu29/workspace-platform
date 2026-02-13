import { Steps, Box, Grid, GridItem, Stat, Heading } from "@chakra-ui/react";
import { useColorModeValue } from "../../../components/ui/color-mode";
import {
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from "recharts";
import LoadIcon from "../../../utils/hooks/LoadIcon";


export default function RevenuAnalytics() {

  console.log("===Calling RevenuAnalytics===");
  const chartData = [
    { name: "Jan", newMember: 2400, renewMember: 4000, totalRevenue: 6400 },
    { name: "Feb", newMember: 3000, renewMember: 3000, totalRevenue: 6000 },
    { name: "Mar", newMember: 2000, renewMember: 1500, totalRevenue: 3500 },
    { name: "Apr", newMember: 2780, renewMember: 2000, totalRevenue: 4080 },
    { name: "May", newMember: 1890, renewMember: 2390, totalRevenue: 4300 },
    { name: "Jun", newMember: 2390, renewMember: 3490, totalRevenue: 2000 },
    { name: "Jul", newMember: 3490, renewMember: 3000, totalRevenue: 2500 },
  ];

  const cardData:any[] = [
    { title: "Revenue", value: "$34,500", icon: "FcMoneyTransfer" },
    { title: "Members", value: "2,100", icon: "FcBusinessman" },
    { title: "Visitors", value: "5,400", icon: "FcGlobe" },
    { title: "Trainers", value: "15", icon: "FcSportsMode" }
  ];

  return (
    <Box width="100%"  mt={2}>
      <Grid
        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "2fr 3fr" }}
        gap={2}
        height="100%" // Ensures the grid stretches
      >
        
        <GridItem >
          <Grid
            templateRows={{ base: "repeat(1, 1fr)", sm: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }}
            templateColumns={{ base: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)" }}
            gap={4}
            height="100%" // Ensures the nested grid stretches
          >
            {cardData.length>0 && cardData.map((card, index) => (
              <GridItem
                bg={useColorModeValue("white", "gray.950")}
                cursor={'pointer'}
                colSpan={1}
                key={index}
                borderWidth="2px"
                borderRadius="lg"
                // boxShadow="md"
                boxShadow={'2xl'}
                display="flex" // Flex ensures it stretches
                flexDirection="column"
                transition="all 0.3s ease"
                _hover={{
                  transform: "scale(1.05)",
                  boxShadow: "xl",
                }}
              >
                <Stat.Root padding="3" textAlign="left" flexGrow={1}>
                  <Stat.Label display="flex" alignItems="center" gap={2}>
                    {/* <AsyncLoadIcon iconName={card.icon} /> */}
                    <LoadIcon iconName={card.icon}/>
                    {/* <Box as={card.icon} size="24px" /> */}
                    {/* <i className={card.icon}></i> Render Font Awesome Icon */}
                    {card.title}
                  </Stat.Label>
                  <Stat.ValueText fontSize="2xl" color="blue.600">
                    {card.value}
                  </Stat.ValueText>
                </Stat.Root>
              </GridItem>
            ))}
          </Grid>
        </GridItem>
        <GridItem>
          <Box
            padding="3"
            borderWidth="2px"
            borderRadius="lg"
            // boxShadow="md"
            boxShadow={'2xl'}
            textAlign="left"
            height="100%"
            display="flex" // Flex ensures it stretches
            flexDirection="column"
            bg={useColorModeValue("white", "gray.950")}
          >
            <Heading size="sm" mb={2} textAlign="left">
              Revenue Analytics
            </Heading>
            <Box  height={{base:"20vh",md:'100%',lg:"100%"}} flexGrow={1}>
              {/* FlexGrow allows it to take remaining space */}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}
                width={500}
                height={400}
                margin={{
                  top: 20,
                  right: 5,
                  bottom: 0,
                  left: 5,
                }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="newMember" fill="#3182ce" />
                  <Bar dataKey="renewMember" fill="#e53e3e" />
                  <Bar dataKey="totalRevenue" fill="#a0aec0" />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
}


