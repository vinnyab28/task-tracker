import { transformTaskData } from "@/utils/transformTaskData";
import { BarList, useChart, type BarListData } from "@chakra-ui/charts";

const BarListComponent = ({ records, selectedDate, periodType }) => {
	const data = transformTaskData(records, selectedDate, periodType);

	const chart = useChart<BarListData>({
		sort: { by: "value", direction: "desc" },
		data,
		series: [{ name: "name", color: "teal.subtle" }],
	});

	return (
		<BarList.Root chart={chart}>
			<BarList.Content>
				<BarList.Bar />
				<BarList.Value />
			</BarList.Content>
		</BarList.Root>
		// <Chart.Root boxSize="200px" mx="auto" chart={chart}>
		// 	<PieChart>
		// 		<Pie isAnimationActive={false} data={chart.data} dataKey={chart.key("value")}>
		// 			{chart.data.map((item) => (
		// 				<Cell key={item.name} />
		// 			))}
		// 		</Pie>
		// 	</PieChart>
		// </Chart.Root>
	);
};

export default BarListComponent;
