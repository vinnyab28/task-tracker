import { minutesToTimeLabel, timeToMinutes } from "@/utils/helpers";
import type { RecordEntry } from "@/utils/types";
import { Box, IconButton, Text, Timeline, VStack } from "@chakra-ui/react";
import { LuBed, LuClipboardList, LuClock3, LuPencil, LuPlus, LuSunrise, LuTrash2 } from "react-icons/lu";
import { toaster } from "./toaster";

interface TimelineViewProps {
	wakeTime: string;
	sleepTime?: string;
	items: RecordEntry[];
	onDelete: (index: number) => void;
	onEdit: (index: number) => void;
	onInsertAfter?: (index: number) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ wakeTime, sleepTime, items, onDelete, onEdit, onInsertAfter }) => {
	const handleDelete = (idx: number) => {
		onDelete(idx);
		toaster.create({ title: "Entry deleted", type: "info", duration: 2000, closable: true });
	};

	return (
		<Timeline.Root px={4}>
			{/* Wake up marker */}
			<Timeline.Item>
				<Timeline.Connector>
					<Timeline.Separator />
					<Timeline.Indicator color="orange.400">
						<LuSunrise />
					</Timeline.Indicator>
				</Timeline.Connector>
				<Timeline.Content>
					<Text fontWeight="medium">Wake up</Text>
					<Text fontSize="sm" color="fg.muted">{minutesToTimeLabel(timeToMinutes(wakeTime))}</Text>
				</Timeline.Content>
			</Timeline.Item>

			{/* Entries */}
			{items.map((item, idx) => (
				<Timeline.Item key={`${item.task._id}-${item.from}-${idx}`}>
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
								<Box display="flex" gap={1}>
									<IconButton size="xs" variant="ghost" aria-label="Edit" onClick={() => onEdit(idx)}>
										<LuPencil />
									</IconButton>
									<IconButton size="xs" variant="ghost" colorPalette="red" aria-label="Delete" onClick={() => handleDelete(idx)}>
										<LuTrash2 />
									</IconButton>
								</Box>
							</Box>
							<Text fontSize="sm" color="fg.muted">
								{minutesToTimeLabel(timeToMinutes(item.from))} → {item.to ? minutesToTimeLabel(timeToMinutes(item.to)) : "?"}
							</Text>
							{item.description && (
								<Text fontSize="sm" color="fg.subtle">{item.description}</Text>
							)}
							{item.duration && (
								<Text fontSize="xs" color="fg.muted" display="flex" alignItems="center" gap={1}>
									<LuClock3 /> {item.duration}
								</Text>
							)}
							{onInsertAfter && (
								<IconButton
									size="2xs"
									variant="ghost"
									colorPalette="teal"
									aria-label="Insert entry after"
									title="Insert entry after this"
									onClick={() => onInsertAfter(idx)}
								>
									<LuPlus />
								</IconButton>
							)}
						</VStack>
					</Timeline.Content>
				</Timeline.Item>
			))}

			{/* Sleep marker */}
			{sleepTime && (
				<Timeline.Item>
					<Timeline.Connector>
						<Timeline.Separator />
						<Timeline.Indicator color="indigo.400">
							<LuBed />
						</Timeline.Indicator>
					</Timeline.Connector>
					<Timeline.Content>
						<Text fontWeight="medium">Sleep</Text>
						<Text fontSize="sm" color="fg.muted">{minutesToTimeLabel(timeToMinutes(sleepTime!))}</Text>
					</Timeline.Content>
				</Timeline.Item>
			)}
		</Timeline.Root>
	);
};

export default TimelineView;
