import { minutesToTimeLabel, timeToMinutes } from "@/utils/helpers";
import type { DayRecord } from "@/utils/types";
import { Chart, useChart } from "@chakra-ui/charts";
import { HStack, Stat, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from "recharts";

dayjs.extend(isoWeek);

interface WakeSleepChartProps {
	records: { [date: string]: DayRecord };
	selectedDate: dayjs.Dayjs;
	period: "weekly" | "monthly";
}

const WakeSleepChart = ({ records, selectedDate, period }: WakeSleepChartProps) => {
	const dates: string[] =
		period === "weekly"
			? Array.from({ length: 7 }, (_, i) =>
					selectedDate.startOf("isoWeek").add(i, "day").format("YYYY-MM-DD")
				)
			: Array.from({ length: selectedDate.daysInMonth() }, (_, i) =>
					selectedDate.date(i + 1).format("YYYY-MM-DD")
				);

	const data = dates.map((date) => {
		const record = records[date];
		const label = dayjs(date).format(period === "weekly" ? "ddd" : "D");
		return {
			date: label,
			wake: record?.wakeTime ? timeToMinutes(record.wakeTime) : null,
			sleep: record?.sleepTime ? timeToMinutes(record.sleepTime) : null,
		};
	});

	const wakeValues = data.filter((d) => d.wake !== null).map((d) => d.wake as number);
	const sleepValues = data.filter((d) => d.sleep !== null).map((d) => d.sleep as number);
	const avgWake = wakeValues.length
		? Math.round(wakeValues.reduce((a, b) => a + b, 0) / wakeValues.length)
		: null;
	const avgSleep = sleepValues.length
		? Math.round(sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length)
		: null;

	const chart = useChart({
		data,
		series: [
			{ name: "wake", color: "orange.solid" },
			{ name: "sleep", color: "indigo.solid" },
		],
	});

	if (!wakeValues.length && !sleepValues.length) return null;

	return (
		<VStack align="start" w="full" gap={3}>
			<Text fontWeight="semibold">Wake &amp; Sleep</Text>
			{(avgWake !== null || avgSleep !== null) && (
				<HStack gap={6} w="full">
					{avgWake !== null && (
						<Stat.Root flex="1">
							<Stat.Label>Avg Wake</Stat.Label>
							<Stat.ValueText>{minutesToTimeLabel(avgWake)}</Stat.ValueText>
						</Stat.Root>
					)}
					{avgSleep !== null && (
						<Stat.Root flex="1">
							<Stat.Label>Avg Sleep</Stat.Label>
							<Stat.ValueText>{minutesToTimeLabel(avgSleep)}</Stat.ValueText>
						</Stat.Root>
					)}
				</HStack>
			)}
			<Chart.Root maxH="xs" chart={chart} w="full">
				<LineChart data={chart.data}>
					<CartesianGrid stroke={chart.color("border")} vertical={false} />
					<XAxis axisLine={false} dataKey={chart.key("date")} stroke={chart.color("border")} />
					<YAxis
						axisLine={false}
						tickLine={false}
						tickMargin={10}
						stroke={chart.color("border")}
						tickFormatter={(v) => minutesToTimeLabel(v)}
						domain={["dataMin - 30", "dataMax + 30"]}
						reversed
					/>
					<Tooltip
						animationDuration={100}
						cursor={false}
						formatter={(v) => [minutesToTimeLabel(v as number)]}
					/>
					{chart.series.map((item) => (
						<Line
							key={item.name}
							isAnimationActive={false}
							dataKey={chart.key(item.name)}
							stroke={chart.color(item.color)}
							strokeWidth={2}
							dot={false}
							connectNulls={false}
						/>
					))}
				</LineChart>
			</Chart.Root>
		</VStack>
	);
};

export default WakeSleepChart;
