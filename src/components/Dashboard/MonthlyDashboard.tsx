import type { RecordEntry } from "@/pages/AddRecord";
import type { TaskItem } from "@/pages/TaskManager";
import { PeriodType } from "@/utils/types";
import { Box, Text, VStack } from "@chakra-ui/react";
import type { Dayjs } from "dayjs";
import BarChartComponent from "../Graphs/BarChart";

interface MonthlyDashboardComponentProps {
	records: { [date: string]: RecordEntry[] };
	selectedDate: Dayjs;
	tasks: TaskItem[];
}

const MonthlyDashboardComponent = ({ records, selectedDate }: MonthlyDashboardComponentProps) => {
	// const [selectedTask, setSelectedTask] = useState<string[]>([]);

	// const taskCollection = createListCollection({
	// 	items: tasks.map((task) => {
	// 		return { label: task.taskName, value: task.taskName };
	// 	}),
	// });

	return (
		<VStack align="start">
			<Text fontWeight="semibold">Monthly Overview</Text>
			{/* <Box w="full">
				<Select.Root collection={taskCollection} value={selectedTask} onValueChange={({ value }) => setSelectedTask(value)} size="sm" width="320px">
					<Select.HiddenSelect />
					<Select.Control>
						<Select.Trigger>
							<Select.ValueText placeholder="Select Task" />
						</Select.Trigger>
						<Select.IndicatorGroup>
							<Select.Indicator />
						</Select.IndicatorGroup>
					</Select.Control>
					<Portal>
						<Select.Positioner>
							<Select.Content>
								{taskCollection.items.map((task) => (
									<Select.Item item={task} key={task.value}>
										{task.label}
										<Select.ItemIndicator />
									</Select.Item>
								))}
							</Select.Content>
						</Select.Positioner>
					</Portal>
				</Select.Root>
			</Box> */}
			<Box w="full">
				{/* <LineChartComponent records={records} selectedDate={selectedDate} selectedTask={selectedTask.length ? selectedTask[0] : ""} periodType={PeriodType.MONTHLY} /> */}
				<BarChartComponent records={records} selectedDate={selectedDate} periodType={PeriodType.MONTHLY} />
			</Box>
		</VStack>
	);
};

export default MonthlyDashboardComponent;
