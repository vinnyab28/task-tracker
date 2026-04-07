import type { RecordEntry } from "@/pages/AddRecord";
import { Box, IconButton, Text, Timeline, VStack } from "@chakra-ui/react";
import { LuClipboardList, LuClock3, LuPencil, LuTrash2 } from "react-icons/lu";
import { toaster } from "./toaster";

interface TimelineViewProps {
	items: RecordEntry[];
	onDelete: (index: number) => void;
	onEdit: (index: number) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ items, onDelete, onEdit }) => {
	const handleDelete = (idx: number) => {
		onDelete(idx);
		toaster.create({
			title: "Task deleted",
			type: "info",
			duration: 2000,
			closable: true,
		});
	};

	if (items.length === 0) {
		return (
			<Box px={4}>
				<Text color="gray.500">No tasks recorded for this date.</Text>
			</Box>
		);
	}

	return (
		<Timeline.Root px={4}>
			{items.map((item, idx) => (
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
								<Box display="flex" gap={1}>
									<IconButton size="xs" variant="ghost" aria-label="Edit" onClick={() => onEdit(idx)}>
										<LuPencil />
									</IconButton>
									<IconButton size="xs" colorScheme="red" variant="ghost" aria-label="Delete" onClick={() => handleDelete(idx)}>
										<LuTrash2 />
									</IconButton>
								</Box>
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
