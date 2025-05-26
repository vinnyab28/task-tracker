import { getTotalHoursForTaskPerDay } from "@/utils/getTotalHoursForTask";
import { Box, Card, createListCollection, EmptyState, Grid, GridItem, Portal, Select, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { LuChartArea } from "react-icons/lu";
import LineChartComponent from "../Graphs/LineGraph";

const MonthlyDashboardComponent = ({ records, dateRange, tasks }) => {
	const [data, setData] = useState(null);
	const [selectedTask, setSelectedTask] = useState<string[]>([]);

	const taskCollection = createListCollection({
		items: tasks.map((task) => {
			return { label: task.taskName, value: task._id };
		}),
	});

	const getData = useCallback((selectedTaskId) => getTotalHoursForTaskPerDay(records, tasks, dateRange, selectedTaskId), [records, tasks, dateRange]);

	useEffect(() => {
		if (selectedTask.length > 0) {
			const fetchedData = getData(selectedTask[0]);
			setData(fetchedData);
		}
	}, [selectedTask, getData]);

	return (
		<VStack align="start">
			<Grid templateColumns="repeat(3, 1fr)" gap="6" w="full">
				{/* <GridItem>
					<Card.Root>
						<Card.Body></Card.Body>
					</Card.Root>
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
							<VStack gap={6} alignItems="flex-end">
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
							</VStack>
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
							{selectedTask.length && data && (
								<Box w="full">
									<LineChartComponent data={data} />
								</Box>
							)}
						</Card.Body>
					</Card.Root>
				</GridItem>
			</Grid>
		</VStack>
	);
};

export default MonthlyDashboardComponent;
