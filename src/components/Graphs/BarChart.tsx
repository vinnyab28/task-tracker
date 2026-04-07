import { formatMinutes } from "@/utils/helpers";
import { transformTaskData } from "@/utils/transformTaskData";
import { Chart, useChart } from "@chakra-ui/charts";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";

const BarChartComponent = ({ records, selectedDate, periodType }) => {
	const data = transformTaskData(records, selectedDate, periodType);

	const chart = useChart({
		data,
		series: [{ name: "value", color: "teal.solid" }],
	});

	return (
		<Chart.Root maxH="sm" chart={chart}>
			<BarChart data={chart.data}>
				<CartesianGrid stroke={chart.color("border.muted")} vertical={false} />
				<XAxis axisLine={false} tickLine={false} dataKey={chart.key("name")} />
				<YAxis axisLine={false} tickLine={false} domain={[0, "dataMax + 10"]} tickFormatter={(v) => formatMinutes(v)} />
			<Tooltip animationDuration={100} cursor={false} formatter={(v) => [formatMinutes(v as number), "Time"]} />
				{chart.series.map((item) => (
					<Bar key={item.name} isAnimationActive={false} dataKey={chart.key(item.name)} fill={chart.color(item.color)} />
				))}
			</BarChart>
		</Chart.Root>
	);
};

export default BarChartComponent;
