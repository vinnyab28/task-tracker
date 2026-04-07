import { getLineChartData } from "@/utils/getLineChartData";
import { formatMinutes } from "@/utils/helpers";
import { Chart, useChart } from "@chakra-ui/charts";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

const LineChartComponent = ({ records, selectedDate, selectedTask, periodType }) => {
	const data = useMemo(() => getLineChartData(records, selectedDate, selectedTask, periodType), [records, selectedDate, selectedTask, periodType]);

	const chart = useChart({
		data,
		series: [{ name: "value", color: "teal.solid" }],
	});

	return (
		<Chart.Root maxH="sm" chart={chart}>
			<LineChart data={chart.data}>
				<CartesianGrid stroke={chart.color("border")} vertical={false} />
				<XAxis axisLine={false} dataKey={chart.key("date")} tickFormatter={(value) => value.slice(0, 3)} stroke={chart.color("border")} />
				<YAxis axisLine={false} tickLine={false} tickMargin={10} stroke={chart.color("border")} tickFormatter={(v) => formatMinutes(v)} />
				<Tooltip animationDuration={100} cursor={false} formatter={(v) => [formatMinutes(v as number), "Time"]} />
				{chart.series.map((item) => (
					<Line key={item.name} isAnimationActive={false} dataKey={chart.key(item.name)} stroke={chart.color(item.color)} strokeWidth={2} dot={false} />
				))}
			</LineChart>
		</Chart.Root>
	);
};

export default LineChartComponent;
