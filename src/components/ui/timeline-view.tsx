import type { RecordEntry } from "@/pages/AddRecord";
import { Box, IconButton, Text, Timeline, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { LuClipboardList, LuClock3, LuTrash2 } from "react-icons/lu";
import { toaster } from "./toaster";

interface TimelineViewProps {
	items: RecordEntry[];
	dateKey: string;
	onUpdate: (newItems: RecordEntry[]) => void;
	onDelete: (index: number) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ items, dateKey, onUpdate }) => {
	const [timelineItems, setTimelineItems] = useState<RecordEntry[]>([]);

	useEffect(() => {
		setTimelineItems(items);
	}, [items]);

	// Recalculates duration after deletion or update
	const recalculateDurations = (list: RecordEntry[]) => {
		const sorted = [...list].sort((a, b) => a.from.localeCompare(b.from));
		const updated = sorted.map((entry, index) => {
			const currentTime = dayjs(`${dateKey}T${entry.from}`);
			let nextTime: dayjs.Dayjs;

			if (index < sorted.length - 1) {
				nextTime = dayjs(`${dateKey}T${sorted[index + 1].from}`);
			} else {
				nextTime = dayjs(dateKey).isSame(dayjs(), "day") ? dayjs() : currentTime;
			}

			const mins = Math.max(nextTime.diff(currentTime, "minute"), 0);
			const hrs = Math.floor(mins / 60);
			const remMins = mins % 60;
			const durationStr = `${hrs > 0 ? `${hrs}h ` : ""}${remMins}mins`;

			return { ...entry, duration: durationStr };
		});

		return updated;
	};

	const handleDelete = (idx: number) => {
		const updatedItems = [...timelineItems];
		updatedItems.splice(idx, 1);
		const recalculated = recalculateDurations(updatedItems);
		setTimelineItems(recalculated);
		onUpdate(recalculated);

		toaster.create({
			title: "Task deleted",
			type: "info",
			duration: 2000,
			closable: true,
		});
	};

	if (timelineItems.length === 0) {
		return (
			<Box px={4}>
				<Text color="gray.500">No tasks recorded for this date.</Text>
			</Box>
		);
	}

	return (
		<Timeline.Root px={4}>
			{timelineItems.map((item, idx) => (
				<Timeline.Item key={`${item.task._id}-${item.from}`}>
					<Timeline.Connector>
						<Timeline.Separator />
						<Timeline.Indicator color="teal.500">
							<LuClipboardList />
						</Timeline.Indicator>
					</Timeline.Connector>
					<Timeline.Content>
						<VStack align="start" w="full">
							<Box display="flex" justifyContent="space-between" w="full">
								<Text fontWeight="medium">{item.task.taskName}</Text>
								<IconButton size="xs" colorScheme="red" variant="ghost" aria-label="Delete" onClick={() => handleDelete(idx)}>
									<LuTrash2 />
								</IconButton>
							</Box>
							<Text fontSize="sm" color="gray.500">
								Started at {item.from}
							</Text>
							{item.description && (
								<Text fontSize="sm" color="gray.600">
									{item.description}
								</Text>
							)}
							{item.duration && (
								<Text fontSize="xs" color="gray.400" mt={1} display="flex" alignItems="center" gap={1}>
									<LuClock3 /> Duration: {item.duration}
								</Text>
							)}
						</VStack>
					</Timeline.Content>
				</Timeline.Item>
			))}
		</Timeline.Root>
	);
};

export default TimelineView;
