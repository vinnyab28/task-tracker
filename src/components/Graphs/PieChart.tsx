import { transformTaskData } from "@/utils/transformTaskData";
import { Chart, useChart, type BarListData } from "@chakra-ui/charts";
import { PieChart, Pie, Cell } from "recharts";

const PieChartComponent = ({ records, selectedDate, periodType }) => {
	const data = transformTaskData(records, selectedDate, periodType);

	const chart = useChart<BarListData>({
		sort: { by: "value", direction: "desc" },
		data,
		series: [{ name: "name", color: "teal.subtle" }],
	});

	return (
		<Chart.Root boxSize="200px" mx="auto" chart={chart}>
			<PieChart>
				<Pie isAnimationActive={false} data={chart.data} dataKey={chart.key("value")}>
					{chart.data.map((item) => (
						<Cell key={item.name} />
					))}
				</Pie>
			</PieChart>
		</Chart.Root>
	);
};

export default PieChartComponent;
