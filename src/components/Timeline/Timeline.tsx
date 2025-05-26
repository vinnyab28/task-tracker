import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import type { DayRecordEntry, TaskItem } from "@/types/types";
import { Box, Button, Card, EmptyState, Field, Flex, HStack, Input, Text, Timeline, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuCircleCheckBig, LuMoon, LuNotebook, LuNotebookPen, LuSun } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { toaster } from "../ui/toaster";
import { useDialogComponent } from "../ui/useDialogComponent";

const TimelineComponent = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { openDialog } = useDialogComponent();
	const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
	const [timelineData, setTimelineData] = useState<any[]>([]);
	const [dayRecord, setDayRecord] = useState<DayRecordEntry | null>(null);
	const [userTasks, setUserTasks] = useState<TaskItem[]>();

	useEffect(() => {
		const loadRecordsForDate = async (selectedDate: string) => {
			const docRef = doc(db, "users", user!.uid, "records", `${selectedDate}`);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				setDayRecord(docSnap.data() as DayRecordEntry);
			} else {
				setDayRecord(null);
			}
		};
		if (user) loadRecordsForDate(date);
	}, [date, user]);

	useEffect(() => {
		const loadTasks = async () => {
			if (!user) return;

			try {
				const taskSnapshot = await getDocs(collection(db, "users", user.uid, "tasks"));
				const fetchedTasks: TaskItem[] = taskSnapshot.docs.map((doc) => ({ ...(doc.data() as TaskItem) }));
				setUserTasks(fetchedTasks.sort((a, b) => a.taskName.localeCompare(b.taskName)));
			} catch (e) {
				console.error("Error loading tasks:", e);
				toaster.error({ title: "Failed to load tasks." });
			}
		};
		loadTasks();
	}, [user]);

	useEffect(() => {
		if (dayRecord) {
			const dayTasks = dayRecord.tasks.map((entry, index) => {
				const currentTime = dayjs(`${date}T${entry.startTime}`);
				let nextTime: dayjs.Dayjs;

				if (index < dayRecord.tasks.length - 1) {
					nextTime = dayjs(`${date}T${dayRecord.tasks[index + 1].startTime}`);
				} else {
					nextTime = dayjs(`${date}T${dayRecord.dayEnd}`);
				}

				const mins = Math.max(nextTime.diff(currentTime, "minute"), 0);
				const hrs = Math.floor(mins / 60);
				const remMins = mins % 60;
				const durationStr = `${hrs > 0 ? `${hrs}h ` : ""}${remMins}mins`;

				const taskItem = userTasks?.find((taskItem) => taskItem._id === entry.taskId);
				return { startTime: entry.startTime, comments: entry.comments, durationStr, taskItem };
			});
			if (dayRecord.dayStart) {
				dayTasks.unshift({
					startTime: dayRecord.dayStart,
					taskItem: { _id: "", taskName: "Day Started" },
					comments: undefined,
					durationStr: "",
				});
			}
			if (dayRecord.dayEnd) {
				dayTasks.push({
					startTime: dayRecord.dayEnd,
					taskItem: { _id: "", taskName: "Day Ended" },
					comments: undefined,
					durationStr: "",
				});
			}
			setTimelineData(dayTasks);
		} else {
			setTimelineData([]);
		}
	}, [date, dayRecord, userTasks]);

	return (
		<Box w="350px" p={4} boxShadow="md" maxH="full">
			<VStack align="stretch" justify="flex-start" h="full">
				<HStack justifyContent="space-between">
					<Text fontWeight="bold" fontSize="2xl">
						Timeline
					</Text>
					<Button colorScheme="teal" size="xs" onClick={() => navigate("/add")}>
						<LuNotebookPen />
						Log Task
					</Button>
				</HStack>
				<Field.Root>
					<Field.Label>Date</Field.Label>
					<Input type="date" max={dayjs().format("YYYY-MM-DD")} value={date} onChange={(e) => setDate(e.target.value)} />
				</Field.Root>
				<Box h="full" overflow="auto">
					{!dayRecord && (
						<EmptyState.Root>
							<EmptyState.Content>
								<EmptyState.Indicator>
									<LuNotebook />
								</EmptyState.Indicator>
								<VStack textAlign="center">
									<EmptyState.Title>No Log Created</EmptyState.Title>
									<EmptyState.Description>Kindly add tasks to your daily log.</EmptyState.Description>
								</VStack>
							</EmptyState.Content>
						</EmptyState.Root>
					)}
					{dayRecord && (
						<Timeline.Root size="sm" mt={6}>
							{timelineData.map((data, index) => (
								<Timeline.Item key={data._id}>
									<Timeline.Content width="auto">
										<Timeline.Title whiteSpace="nowrap" borderBottomWidth={1} borderBottomColor={data.taskItem.color} color="fg.muted">
											{data.startTime}
										</Timeline.Title>
									</Timeline.Content>
									<Timeline.Connector>
										<Timeline.Separator />
										<Timeline.Indicator>
											{index === 0 && <LuSun />}
											{index > 0 && index < timelineData.length - 1 && <LuCircleCheckBig />}
											{index === timelineData.length - 1 && <LuMoon />}
										</Timeline.Indicator>
									</Timeline.Connector>
									<Timeline.Content>
										<Timeline.Title>
											<Flex alignItems="flex-start" justifyContent="space-between" w="full">
												<Text fontWeight="bold">{data.taskItem.taskName}</Text>
												{/* <Button size="2xs" variant="plain" colorPalette="red" onClick={openDialog}>
													<LuTrash2 />
												</Button> */}
											</Flex>
										</Timeline.Title>
										<Timeline.Description>{data.durationStr}</Timeline.Description>
										{data.comments && (
											<Card.Root size="sm">
												<Card.Body textStyle="xs" lineHeight="short">
													{data.comments}
												</Card.Body>
											</Card.Root>
										)}
									</Timeline.Content>
								</Timeline.Item>
							))}
						</Timeline.Root>
					)}
				</Box>
			</VStack>
		</Box>
	);
};

export default TimelineComponent;
