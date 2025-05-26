import { getTotalHoursForTaskPerDay } from "@/utils/getTotalHoursForTask";
import { Card, Grid, GridItem, VStack } from "@chakra-ui/react";
import BarListComponent from "../Graphs/BarList";
import BarSegmentComponent from "../Graphs/BarSegment";

const DailyDashboardComponent = ({ records, tasks, dateRange }) => {
	const data = getTotalHoursForTaskPerDay(records, tasks, dateRange);

	return (
		<VStack align="start" w="full">
			<Grid templateColumns="repeat(3, 1fr)" gap="6" w="full">
				{/* <GridItem>
					<GoalDonutComponent tasks={tasks} records={records} dateRange={dateRange} />
				</GridItem>
				<GridItem>
					<Card.Root>
						<Card.Body></Card.Body>
					</Card.Root>
				</GridItem>
				<GridItem>
					<Card.Root>
						<Card.Body></Card.Body>
					</Card.Root>
				</GridItem> */}
				<GridItem colSpan={3}>
					<Card.Root>
						<Card.Body>
							<BarSegmentComponent data={data} />
						</Card.Body>
					</Card.Root>
				</GridItem>
				<GridItem colSpan={3}>
					<Card.Root>
						<Card.Body>
							<BarListComponent data={data} />
						</Card.Body>
					</Card.Root>
				</GridItem>
			</Grid>
		</VStack>
	);
};

export default DailyDashboardComponent;
