import { formatMinutes, minutesToTimeLabel, parseDurationToMinutes, timeToMinutes } from "@/utils/helpers";
import type { DayRecord } from "@/utils/types";
import { PeriodType } from "@/utils/types";
import { Box, HStack, Stat, Text, VStack } from "@chakra-ui/react";
import type { Dayjs } from "dayjs";
import BarListComponent from "../Graphs/BarList";

interface DailyDashboardComponentProps {
	records: { [date: string]: DayRecord };
	selectedDate: Dayjs;
}

const DailyDashboardComponent = ({ records, selectedDate }: DailyDashboardComponentProps) => {
	const dateStr = selectedDate.format("YYYY-MM-DD");
	const dayRecord = records[dateStr];

	const wakeTime = dayRecord?.wakeTime;
	const sleepTime = dayRecord?.sleepTime;
	const entries = dayRecord?.entries ?? [];

	const awakeMins = wakeTime && sleepTime
		? timeToMinutes(sleepTime) - timeToMinutes(wakeTime)
		: null;

	const trackedMins = entries.reduce((sum, e) => sum + parseDurationToMinutes(e.duration), 0);

	return (
		<VStack align="start" w="full" gap={4}>
			{wakeTime && (
				<HStack gap={6} w="full" align="start">
					<Stat.Root flex="1">
						<Stat.Label>Woke up</Stat.Label>
						<Stat.ValueText>{minutesToTimeLabel(timeToMinutes(wakeTime))}</Stat.ValueText>
					</Stat.Root>
					{sleepTime && (
						<Stat.Root flex="1">
							<Stat.Label>Slept</Stat.Label>
							<Stat.ValueText>{minutesToTimeLabel(timeToMinutes(sleepTime))}</Stat.ValueText>
						</Stat.Root>
					)}
					{awakeMins !== null && awakeMins > 0 && (
						<Stat.Root flex="1">
							<Stat.Label>Awake</Stat.Label>
							<Stat.ValueText>{formatMinutes(awakeMins)}</Stat.ValueText>
						</Stat.Root>
					)}
					{trackedMins > 0 && (
						<Stat.Root flex="1">
							<Stat.Label>Tracked</Stat.Label>
							<Stat.ValueText>{formatMinutes(trackedMins)}</Stat.ValueText>
							{awakeMins !== null && awakeMins > 0 && (
								<Stat.HelpText>of {formatMinutes(awakeMins)}</Stat.HelpText>
							)}
						</Stat.Root>
					)}
				</HStack>
			)}

			<Text fontWeight="semibold">Daily Overview</Text>
			<Box w="full">
				<BarListComponent records={records} selectedDate={selectedDate} periodType={PeriodType.DAILY} />
			</Box>
		</VStack>
	);
};

export default DailyDashboardComponent;
