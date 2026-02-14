import React, { useEffect, useState } from "react";
import { Steps, Box, Flex, Text, Icon, Heading, Grid, GridItem } from "@chakra-ui/react";
import {
  FaDatabase,
  FaCubes,
  FaEye,
  FaBox,
  FaBalanceScale,
  FaHdd,
  FaChartPie,
  FaFile,
  FaCheckCircle,
} from "react-icons/fa";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { APP_CONFIG_STATE } from "@/app/types/appConfigInterface";
import { GETAPI } from "@/app/api";
import Loader from "@/features/ui/components/Loader/Loader";

const DatabaseStatistics = () => {
  const [report, setReport] = useState<any>({});
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    GETAPI({
      path: "app/getDataBaseStatisics",
      isPrivateApi: true,
      enableCache: true,
    }).subscribe((res) => {
      if (res.success) {
        setLoading(false)
        console.log(res);
        setReport(res["result"]);
        console.log(report);

      }
    });
  }, []);

  //   return (<></>)
  if (loading) {
    return (<Loader></Loader>)
  }

  return (
    <Box mx="auto" p={4}>
      <Heading as="h2" size="lg" mb={6} textAlign="center">
        MongoDB Statistics
      </Heading>

      {/* <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}> */}
      <Flex wrap="wrap" justify="center" gap={6}>
        {/* Database Name */}
        <StatBox icon={FaDatabase} label="Database Name" value={report.db} />

        {/* Collections */}
        <StatBox
          icon={FaCubes}
          label="Collections"
          value={report.collections}
        />

        {/* Views */}
        <StatBox icon={FaEye} label="Views" value={report.views} />

        {/* Objects */}
        <StatBox icon={FaBox} label="Objects" value={report.objects} />

        {/* Avg Object Size */}
        <StatBox
          icon={FaBalanceScale}
          label="Avg Object Size"
          value={`${report.avgObjSize.toFixed(2)} bytes`}
        />

        {/* Data Size */}
        <StatBox
          icon={FaHdd}
          label="Data Size"
          value={`${report.dataSize} bytes`}
        />

        {/* Storage Size */}
        <StatBox
          icon={FaChartPie}
          label="Storage Size"
          value={`${report.storageSize} bytes`}
        />

        {/* Indexes */}
        <StatBox icon={FaCubes} label="Indexes" value={report.indexes} />

        {/* Index Size */}
        <StatBox
          icon={FaFile}
          label="Index Size"
          value={`${report.indexSize} bytes`}
        />

        {/* Status */}
        <StatBox
          icon={FaCheckCircle}
          label="Status"
          value={report.ok === 1 ? "OK" : "Not OK"}
        />
      </Flex>
    </Box>
  );
};

// StatBox Component to handle individual stats display
const StatBox = ({ icon, label, value }: any) => (
  <GridItem
    w={{ base: "45%", md: "200px" }}
    p={4}
    borderWidth="1px"
    borderRadius="lg"
    alignItems="center"
    background={['white', 'transparent']}
    asChild
  ><Flex>
      <Icon as={icon} w={8} h={8} mr={4} color="teal.500" />
      <Box>
        <Text fontWeight="bold">{label}</Text>
        <Text>{value}</Text>
      </Box>
    </Flex></GridItem>
);

export default DatabaseStatistics;
