import { BarList, useChart, type BarListData } from "@chakra-ui/charts";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const BarListComponent = ({ data }) => {
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

	// Convert the map to the desired output format
	for (const taskName in taskMap) {
		chartData.push({ name: taskName, value: taskMap[taskName].duration, color: taskMap[taskName].color });
	}

	const chart = useChart<BarListData>({
		sort: { by: "value", direction: "desc" },
		data: chartData,
		series: [{ name: "name", color: "yellow.subtle" }],
	});

	return (
		<BarList.Root chart={chart}>
			<BarList.Content>
				<BarList.Bar />
				<BarList.Value valueFormatter={(value) => dayjs.duration(value, "minutes").format("H[h] m[m]")} />
			</BarList.Content>
		</BarList.Root>
	);
};

export default BarListComponent;
