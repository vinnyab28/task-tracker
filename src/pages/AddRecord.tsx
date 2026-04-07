import TimelineView from "@/components/ui/timeline-view";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { Box, Button, createListCollection, Field, Flex, Input, Portal, Select, Separator, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";
import type { TaskItem } from "./TaskManager";

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"));

export interface RecordEntry {
	task: TaskItem;
	from: string;
	duration?: string;
	description?: string;
}

const startDayTimes = createListCollection({
	items: [
		{ label: "4:00 AM", value: "4:00" },
		{ label: "5:00 AM", value: "5:00" },
		{ label: "6:00 AM", value: "6:00" },
		{ label: "7:00 AM", value: "7:00" },
		{ label: "8:00 AM", value: "8:00" },
		{ label: "9:00 AM", value: "9:00" },
		{ label: "10:00 AM", value: "10:00" },
	],
});

const endDayTimes = createListCollection({
	items: [
		{ label: "6:00 PM", value: "18:00" },
		{ label: "7:00 PM", value: "19:00" },
		{ label: "8:00 PM", value: "20:00" },
		{ label: "9:00 PM", value: "21:00" },
		{ label: "10:00 PM", value: "22:00" },
		{ label: "11:00 PM", value: "23:00" },
		{ label: "11:59 PM", value: "23:59" },
	],
});

const AddRecord = () => {
	const { user } = useAuth();
	const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [entries, setEntries] = useState<RecordEntry[]>([]);

	const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
	const [selectedStartTime, setSelectedStartTime] = useState<string[]>(() => [localStorage.getItem("dayStartTime") ?? "4:00"]);
	const [selectedEndTime, setSelectedEndTime] = useState<string[]>(() => [localStorage.getItem("dayEndTime") ?? "21:00"]);
	const [fromHour, setFromHour] = useState<string[]>([]);
	const [fromMinute, setFromMinute] = useState<string[]>([]);
	const [description, setDescription] = useState("");

	const addDurations = useCallback(
		(list: RecordEntry[]): RecordEntry[] => {
			return list.map((entry, index) => {
				let start = dayjs(`${date}T${entry.from}`);

				// Clamp first entry to selectedStartTime if it starts before it
				if (index === 0) {
					const adjustedStart = dayjs(`${date}T${selectedStartTime[0]}`);
					if (start.isBefore(adjustedStart)) {
						entry = { ...entry, from: selectedStartTime[0] };
						start = adjustedStart;
					}
				}

				const end =
					index === list.length - 1
						? dayjs(`${date}T${selectedEndTime[0]}`)
						: dayjs(`${date}T${list[index + 1].from}`);

				const diff = end.diff(start, "minute");
				if (diff <= 0) return { ...entry, duration: "" };

				const hours = Math.floor(diff / 60);
				const minutes = diff % 60;
				return {
					...entry,
					duration: `${hours ? `${hours}h ` : ""}${minutes}m`,
				};
			});
		},
		[date, selectedStartTime, selectedEndTime]
	);

	useEffect(() => {
		const loadTasks = async () => {
			if (!user) return;

			try {
				const taskSnapshot = await getDocs(collection(db, "users", user.uid, "tasks"));
				const fetchedTasks: TaskItem[] = taskSnapshot.docs.map((doc) => ({ ...(doc.data() as TaskItem) }));
				setTasks(fetchedTasks.sort((a, b) => a.taskName.localeCompare(b.taskName)));
			} catch (e) {
				console.error("Error loading tasks:", e);
				toaster.error({ title: "Failed to load tasks." });
			}
		};
		loadTasks();
	}, [user]);

	useEffect(() => {
		const loadRecordsForDate = async (selectedDate: string) => {
			const docRef = doc(db, "users", user!.uid, "records", `${selectedDate}`);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				const sorted = (docSnap.data().entries || []).sort((a: RecordEntry, b: RecordEntry) => (dayjs(`${date}T${a.from}`).isBefore(dayjs(`${date}T${b.from}`)) ? -1 : 1));
				setEntries(addDurations(sorted));
			} else {
				setEntries([]);
			}
		};
		if (user) loadRecordsForDate(date);
	}, [date, user, addDurations]);

	useEffect(() => { localStorage.setItem("dayStartTime", selectedStartTime[0]); }, [selectedStartTime]);
	useEffect(() => { localStorage.setItem("dayEndTime", selectedEndTime[0]); }, [selectedEndTime]);

	const saveRecordsForDate = async (selectedDate: string, updated: RecordEntry[]) => {
		const sorted = updated.sort((a, b) => (dayjs(`${date}T${a.from}`).isBefore(dayjs(`${date}T${b.from}`)) ? -1 : 1));
		const withDurations = addDurations(sorted);
		await setDoc(doc(db, "users", user!.uid, "records", `${selectedDate}`), {
			userId: user?.uid,
			date: selectedDate,
			entries: withDurations,
		});
		setEntries(withDurations);
	};

	const resetInputs = () => {
		setSelectedTaskIds([]);
		setFromHour([]);
		setFromMinute([]);
		setDescription("");
	};

	const handleAdd = () => {
		if (!selectedTaskIds.length || !fromHour.length || !fromMinute.length) {
			toaster.create({ title: "Please fill all required fields.", type: "warning" });
			return;
		}
		const selectedTask = tasks.find((t) => t._id === selectedTaskIds[0]);
		if (!selectedTask) {
			toaster.create({ title: "Invalid task selected.", type: "error" });
			return;
		}
		const from = `${fromHour[0]}:${fromMinute[0]}`;
		const newEntry: RecordEntry = { task: selectedTask, from, description };
		saveRecordsForDate(date, [...entries, newEntry]);
		resetInputs();
	};

	const handleDelete = (index: number) => {
		const updated = entries.filter((_, i) => i !== index);
		saveRecordsForDate(date, updated);
	};

	const taskCollection = createListCollection({
		items: tasks.map((task) => ({ value: task._id, label: task.taskName })),
	});

	const hourValues = createListCollection({
		items: HOURS.map((h) => ({ label: h, value: h })),
	});

	const minuteValues = createListCollection({
		items: MINUTES.map((m) => ({ label: m, value: m })),
	});

	return (
		<Layout>
			<VStack align="stretch" w="full">
				<Box p="4" borderWidth="1px" borderColor="border.muted">
					<Flex gap="6">
						<Field.Root>
							<Field.Label>Date</Field.Label>
							<Input type="date" max={dayjs().format("YYYY-MM-DD")} value={date} onChange={(e) => setDate(e.target.value)} />
						</Field.Root>
						<Field.Root>
							<Select.Root collection={startDayTimes} value={selectedStartTime} onValueChange={({ value }) => setSelectedStartTime(value)}>
								<Select.HiddenSelect />
								<Select.Label>Select Start Time</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select Start Time" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Portal>
									<Select.Positioner>
										<Select.Content>
											{startDayTimes.items.map((time) => (
												<Select.Item item={time} key={time.value}>
													{time.label}
													<Select.ItemIndicator />
												</Select.Item>
											))}
										</Select.Content>
									</Select.Positioner>
								</Portal>
							</Select.Root>
						</Field.Root>
						<Field.Root>
							<Select.Root collection={endDayTimes} value={selectedEndTime} onValueChange={({ value }) => setSelectedEndTime(value)}>
								<Select.HiddenSelect />
								<Select.Label>Select End Time</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select End Time" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Portal>
									<Select.Positioner>
										<Select.Content>
											{endDayTimes.items.map((time) => (
												<Select.Item item={time} key={time.value}>
													{time.label}
													<Select.ItemIndicator />
												</Select.Item>
											))}
										</Select.Content>
									</Select.Positioner>
								</Portal>
							</Select.Root>
						</Field.Root>
					</Flex>
					<Separator my="6" />
					<Flex flexWrap="wrap" gap={4}>
						<Field.Root width={["100%", "300px"]}>
							<Select.Root collection={taskCollection} value={selectedTaskIds} onValueChange={({ value }) => setSelectedTaskIds(value)}>
								<Select.HiddenSelect />
								<Select.Label>Select Task</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select Task" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Portal>
									<Select.Positioner>
										<Select.Content>
											{taskCollection.items.map((task) => (
												<Select.Item item={task} key={task.value}>
													{task.label}
													<Select.ItemIndicator />
												</Select.Item>
											))}
										</Select.Content>
									</Select.Positioner>
								</Portal>
							</Select.Root>
						</Field.Root>

						<Field.Root width="150px">
							<Select.Root collection={hourValues} value={fromHour} onValueChange={({ value }) => setFromHour(value)}>
								<Select.HiddenSelect />
								<Select.Label>Select Hour</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select Hour" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Portal>
									<Select.Positioner>
										<Select.Content>
											{hourValues.items.map((hour) => (
												<Select.Item item={hour} key={hour.value}>
													{hour.label}
													<Select.ItemIndicator />
												</Select.Item>
											))}
										</Select.Content>
									</Select.Positioner>
								</Portal>
							</Select.Root>
						</Field.Root>

						<Field.Root width="150px">
							<Select.Root collection={minuteValues} value={fromMinute} onValueChange={({ value }) => setFromMinute(value)}>
								<Select.HiddenSelect />
								<Select.Label>Select Minute</Select.Label>
								<Select.Control>
									<Select.Trigger>
										<Select.ValueText placeholder="Select Minute" />
									</Select.Trigger>
									<Select.IndicatorGroup>
										<Select.Indicator />
									</Select.IndicatorGroup>
								</Select.Control>
								<Portal>
									<Select.Positioner>
										<Select.Content>
											{minuteValues.items.map((minute) => (
												<Select.Item item={minute} key={minute.value}>
													{minute.label}
													<Select.ItemIndicator />
												</Select.Item>
											))}
										</Select.Content>
									</Select.Positioner>
								</Portal>
							</Select.Root>
						</Field.Root>

						<Field.Root flex="1">
							<Field.Label>Description</Field.Label>
							<Input value={description} onChange={(e) => setDescription(e.target.value)} />
						</Field.Root>

						<Field.Root alignSelf="end" flex="1">
							<Button colorScheme="blue" onClick={handleAdd}>
								Add
							</Button>
						</Field.Root>
					</Flex>
				</Box>

				<Box>
					<Text fontWeight="semibold" mb={6} fontSize="large">
						Records for {dayjs(date).format("DD MMM YYYY")}
					</Text>
					<TimelineView items={entries} onDelete={handleDelete} />
				</Box>
			</VStack>
		</Layout>
	);
};

export default AddRecord;
