import { Chart, useChart } from "@chakra-ui/charts";
import { Box, HStack, Stack, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";

const LineChartComponent = ({ data }) => {
	console.log(data);
	const formattedData = Object.entries(data).map(([date, tasks]) => {
		return {
			date,
			duration: tasks.length > 0 ? tasks[0].duration : 0,
		};
	});

	const chart = useChart({
		data: formattedData,
		series: [{ name: "duration", label: "No. of hours", color: "teal.solid" }],
	});

	function CustomTooltip(props: TooltipProps<string, string>) {
		const { active, payload, label } = props;
		if (!active || !payload || payload.length === 0) return null;
		return (
			<Box w="40" rounded="sm" bg="teal.subtle" p="3">
				<HStack>
					<span>{dayjs(label).format("MMM D")}</span>
				</HStack>
				<Stack>
					{payload.map((item) => (
						<HStack key={item.name}>
							<Box boxSize="2" bg={item.color} />
							<Text textStyle="xl">{dayjs.duration(item.value, "minutes").format("H[h] m[m]")}</Text>
						</HStack>
					))}
				</Stack>
			</Box>
		);
	}

	return (
		<Chart.Root maxH="sm" chart={chart}>
			<LineChart data={chart.data} margin={{ top: 40, bottom: 20 }}>
				<CartesianGrid stroke={chart.color("border")} strokeDasharray="3 3" vertical={false} />
				<XAxis axisLine={false} dataKey={chart.key("date")} tickMargin={20} tickSize={1} tickFormatter={(value) => dayjs(value).format("MMM D")} stroke={chart.color("border")} />
				<YAxis axisLine={false} tickLine={false} tickMargin={10} stroke={chart.color("border")} tickFormatter={(value) => dayjs.duration(value, "minutes").format("H[h] m[m]")} />
				<Tooltip animationDuration={100} cursor={{ stroke: chart.color("border") }} content={<CustomTooltip />} />
				{chart.series.map((item) => (
					<Line key={item.name} isAnimationActive={false} dataKey={chart.key(item.name)} stroke={chart.color(item.color)} strokeWidth={2} dot={false}>
						{/* <LabelList
							dataKey={chart.key("duration")}
							position="top"
							offset={10}
							style={{
								fontWeight: "600",
								fill: chart.color("fg"),
							}}
							formatter={(value) => dayjs.duration(value, "minutes").format("H[h] m[m]")}
						/> */}
					</Line>
				))}
			</LineChart>
		</Chart.Root>
	);
};

export default LineChartComponent;
