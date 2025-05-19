import { PeriodType } from "@/utils/types";
import { Box, Text, VStack } from "@chakra-ui/react";
import BarListComponent from "../Graphs/BarList";

const DailyDashboardComponent = ({ records, selectedDate }) => {
	return (
		<VStack align="start" w="full">
			<Text fontWeight="semibold">Daily Overview</Text>
			<Box w="full">
				<BarListComponent records={records} selectedDate={selectedDate} periodType={PeriodType.DAILY} />
			</Box>
			{/* <BarChartComponent records={records} selectedDate={selectedDate} periodType={PeriodType.DAILY} /> */}
		</VStack>
	);
};

export default DailyDashboardComponent;
