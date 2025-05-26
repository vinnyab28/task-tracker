import { PeriodType } from "@/utils/types";
import { Chart, useChart } from "@chakra-ui/charts";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const DonutChartComponent = ({ data, tasks, selectedTaskId }) => {
	const chartData = [];

	// Create a map to store the aggregated values
	const taskMap = {};

	// Iterate through each date in the data
	for (const date in data) {
		data[date].forEach((task) => {
			// If the task already exists in the map, add the duration
			if (taskMap[task.taskName]) {
				taskMap[task.taskName].duration += task.duration;
			} else {
				// Otherwise, initialize it with the current duration
				taskMap[task.taskName] = { duration: task.duration, color: task.color };
			}
		});
	}

	const selectedTask = tasks.filter((task) => task._id === selectedTaskId)[0];
	const goalValue = selectedTask.goals[PeriodType.DAILY] * 60;
	taskMap["goal"] = { duration: goalValue, color: "fg.muted" };

	// Convert the map to the desired output format
	for (const taskName in taskMap) {
		chartData.push({ name: taskName, value: taskMap[taskName].duration, color: taskMap[taskName].color });
	}

	const chart = useChart({
		data: chartData,
	});

	return (
		<Chart.Root boxSize="200px" mx="auto" chart={chart}>
			<PieChart>
				<Tooltip cursor={false} animationDuration={100} content={<Chart.Tooltip hideLabel />} />
				<Pie innerRadius={80} outerRadius={100} isAnimationActive={false} data={chart.data} dataKey={chart.key("value")} nameKey="name">
					{chart.data.map((item) => {
						return <Cell key={item.name} fill={chart.color(item.color)} />;
					})}
				</Pie>
			</PieChart>
		</Chart.Root>
	);
};

export default DonutChartComponent;
