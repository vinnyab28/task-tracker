import type { DayRecord, TaskItem } from "@/utils/types";
import { PeriodType } from "@/utils/types";
import { Box, createListCollection, EmptyState, Portal, Select, Separator, Text, VStack } from "@chakra-ui/react";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { LuChartArea } from "react-icons/lu";
import LineChartComponent from "../Graphs/LineGraph";
import WakeSleepChart from "../Graphs/WakeSleepChart";

interface MonthlyDashboardComponentProps {
	records: { [date: string]: DayRecord };
	selectedDate: Dayjs;
	tasks: TaskItem[];
}

const MonthlyDashboardComponent = ({ records, selectedDate, tasks }: MonthlyDashboardComponentProps) => {
	const [selectedTask, setSelectedTask] = useState<string[]>([]);

	const taskCollection = createListCollection({
		items: tasks.map((task) => ({ label: task.taskName, value: task.taskName })),
	});

	return (
		<VStack align="start" gap={6} w="full">
			<VStack align="start" w="full">
				<Text fontWeight="semibold">Monthly Overview</Text>
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
							</VStack>
						</EmptyState.Content>
					</EmptyState.Root>
				)}
				{selectedTask.length > 0 && (
					<Box w="full">
						<LineChartComponent records={records} selectedDate={selectedDate} selectedTask={selectedTask[0]} periodType={PeriodType.MONTHLY} />
					</Box>
				)}
			</VStack>

			<Separator />

			<WakeSleepChart records={records} selectedDate={selectedDate} period="monthly" />
		</VStack>
	);
};

export default MonthlyDashboardComponent;
