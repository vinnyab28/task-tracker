import { BarSegment, useChart, type BarListData } from "@chakra-ui/charts";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

const BarSegmentComponent = ({ data }) => {
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
		series: [{ name: "name", color: "teal.subtle" }],
	});

	return (
		<BarSegment.Root chart={chart} barSize={3}>
			<BarSegment.Content>
				{/* <BarSegment.Value /> */}
				<BarSegment.Bar />
				<BarSegment.Label />
			</BarSegment.Content>
			<BarSegment.Legend gap="2" textStyle="xs" showPercent />
		</BarSegment.Root>
	);
};

export default BarSegmentComponent;
