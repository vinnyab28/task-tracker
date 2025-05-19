import type { RecordEntry } from "@/pages/AddRecord";
import type { TaskItem } from "@/pages/TaskManager";
import { PeriodType } from "@/utils/types";
import { Box, createListCollection, EmptyState, Portal, Select, Text, VStack } from "@chakra-ui/react";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { LuChartArea } from "react-icons/lu";
import LineChartComponent from "../Graphs/LineGraph";

interface WeeklyDashboardComponentProps {
	records: { [date: string]: RecordEntry[] };
	selectedDate: Dayjs;
	tasks: TaskItem[];
}

const WeeklyDashboardComponent = ({ records, selectedDate, tasks }: WeeklyDashboardComponentProps) => {
	const [selectedTask, setSelectedTask] = useState<string[]>([]);

	const taskCollection = createListCollection({
		items: tasks.map((task) => {
			return { label: task.taskName, value: task.taskName };
		}),
	});

	return (
		<VStack align="start">
			<Text fontWeight="semibold">Weekly Overview</Text>
			<Box w="full">
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
			</Box>
			{!selectedTask.length && (
				<EmptyState.Root>
					<EmptyState.Content>
						<EmptyState.Indicator>
							<LuChartArea />
						</EmptyState.Indicator>
						<VStack textAlign="center">
							<EmptyState.Title>Please select a task</EmptyState.Title>
							{/* <EmptyState.Description>Explore our products and add items to your cart</EmptyState.Description> */}
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			)}
			{selectedTask.length && (
				<Box w="full">
					<LineChartComponent records={records} selectedDate={selectedDate} selectedTask={selectedTask.length ? selectedTask[0] : ""} periodType={PeriodType.WEEKLY} />
				</Box>
			)}
		</VStack>
	);
};

export default WeeklyDashboardComponent;
