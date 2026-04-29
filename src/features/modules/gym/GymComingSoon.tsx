/**
 * GymComingSoon.tsx
 *
 * Reusable stub component for planned gym features.
 */
import { memo } from "react";
import { Box, Circle, Flex, Heading, Text, VStack, Badge } from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";

interface StubProps {
  title: string;
  description: string;
  icon: any;
  accent: string;
}

const StubPage = memo(({ title, description, icon: Icon, accent }: StubProps) => {
  const bg = useColorModeValue("white", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  return (
    <Flex align="center" justify="center" minH="60vh" p={6}>
      <Box 
        p={12} bg={bg} borderRadius="3xl" border="1px solid" borderColor={borderColor} 
        textAlign="center" maxW="lg" boxShadow="xl"
      >
        <VStack gap={6}>
          <Circle size="20" bg={`${accent}.50`} color={`${accent}.500`}>
            <Icon size={40} />
          </Circle>
          <VStack gap={2}>
            <Badge colorPalette={accent} variant="subtle" px={4} py={1} borderRadius="full">Coming Soon</Badge>
            <Heading size="xl" fontWeight="900">{title}</Heading>
            <Text color="gray.500" fontSize="md">{description}</Text>
          </VStack>
        </VStack>
      </Box>
    </Flex>
  );
});
StubPage.displayName = "StubPage";

// Named exports for the registry
import { LuSquareCheck, LuUsers, LuCalendarDays, LuTrendingUp, LuChartBar, LuCreditCard } from "react-icons/lu";

export const MemberCheckIn = () => <StubPage title="Member Check-In" description="Real-time scan and log system for gym entries." icon={LuSquareCheck} accent="teal" />;
export const ListTrainers = () => <StubPage title="Trainer Directory" description="Manage staff profiles and specializations." icon={LuUsers} accent="blue" />;
export const TrainerSchedules = () => <StubPage title="Trainer Schedules" description="Weekly timetables and PT booking slots." icon={LuCalendarDays} accent="green" />;
export const ListClasses = () => <StubPage title="Class Catalog" description="Group session management and capacity tracking." icon={LuCalendarDays} accent="purple" />;
export const AddClass = () => <StubPage title="Create Class" description="Define new group workout sessions." icon={LuCalendarDays} accent="purple" />;
export const ClassBookings = () => <StubPage title="Class Bookings" description="Registration and waitlist management." icon={LuSquareCheck} accent="cyan" />;
export const RevenueReport = () => <StubPage title="Revenue Report" description="Deep dive into MRR and collection rates." icon={LuTrendingUp} accent="green" />;
export const AttendanceReport = () => <StubPage title="Attendance Report" description="Visits analysis and peak hour heatmaps." icon={LuChartBar} accent="orange" />;
export const PerformanceReport = () => <StubPage title="Performance Report" description="Retention score and churn analysis." icon={LuChartBar} accent="blue" />;
export const PaymentsHistory = () => <StubPage title="Payment Ledger" description="Complete history of all membership dues." icon={LuCreditCard} accent="teal" />;
