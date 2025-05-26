import { getTotalHoursForTaskPerDay } from "@/utils/getTotalHoursForTask";
import { Card, createListCollection, Field, Portal, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import DonutChartComponent from "../Graphs/DonutChart";

const GoalDonutComponent = ({ records, tasks, dateRange }) => {
	const [chartData, setChartData] = useState();
	const [selectedTask, setSelectedTask] = useState<string[]>([]);

	const taskCollection = createListCollection({
		items: tasks.map((task) => ({ value: task._id, label: task.taskName })),
	});

	useEffect(() => {
		const selectedTaskId = selectedTask[0];
		const data = getTotalHoursForTaskPerDay(records, tasks, dateRange, selectedTaskId);
		setChartData(data);
	}, [selectedTask, records, tasks, dateRange]);

	return (
		<Card.Root>
			<Card.Header>
				<Field.Root>
					<Select.Root collection={taskCollection} onValueChange={({ value }) => setSelectedTask(value)}>
						<Select.HiddenSelect />
						<Select.Label>Select Task</Select.Label>
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
				</Field.Root>
			</Card.Header>
			<Card.Body>{selectedTask.length && <DonutChartComponent data={chartData} tasks={tasks} selectedTaskId={selectedTask[0]} />}</Card.Body>
		</Card.Root>
	);
};

export default GoalDonutComponent;
