import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import useTasks from "@/hooks/useTasks";
import type { DayLogForm, DayRecordEntry, TaskLogItem } from "@/types/types";
import { Button, createListCollection, Field, Flex, Grid, GridItem, Input, Portal, Select, Separator, Textarea, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const AddRecord = () => {
	const { user } = useAuth();
	const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
	const { tasks: userTasks } = useTasks();

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
	} = useForm<DayLogForm>({
		defaultValues: {
			selectedDate: date,
			dayStart: "04:00",
			dayEnd: "20:00",
		},
	});
	const [dayRecord, setDayRecord] = useState<DayRecordEntry | null>(null);

	useEffect(() => {
		if (!user || !date) return;
		const loadRecordsForDate = async () => {
			const docRef = doc(db, "users", user!.uid, "records", `${date}`);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				setDayRecord(docSnap.data() as DayRecordEntry);
			} else {
				setDayRecord(null);
			}
		};
		loadRecordsForDate();
	}, [user, date]);

	useEffect(() => {
		setValue("selectedDate", date);
	}, [date, setValue]);

	const saveRecordsForDate = async (selectedDate: string, dayRecord: DayRecordEntry) => {
		try {
			await setDoc(doc(db, "users", user!.uid, "records", `${selectedDate}`), dayRecord);
			setDayRecord(dayRecord);
			toaster.success({ title: "Add log successfully" });
		} catch (e: any) {
			toaster.error({ title: e.message ?? "Error occurred!" });
		}
	};

	const handleAdd = (values: DayLogForm) => {
		const newTask: TaskLogItem = { taskId: values.taskId, startTime: values.taskStartTime, comments: values.comments };
		const currentTasks: TaskLogItem[] = dayRecord?.tasks.slice() ?? [];

		// const updatedTasks: TaskLogItem[] = [...currentTasks, newTask].sort((taskA, taskB) => (taskA.startTime.localeCompare(taskB.startTime) ? 1 : -1));
		const updatedTasks: TaskLogItem[] = [...currentTasks, newTask].sort((a, b) => {
			// Use dayjs to parse the startTime strings
			const aTime = dayjs(`${values.selectedDate} ${a.startTime}`);
			const bTime = dayjs(`${values.selectedDate} ${b.startTime}`);

			// Compare the dayjs objects and return the appropriate value for sorting
			if (aTime.isBefore(bTime)) return -1;
			if (aTime.isAfter(bTime)) return 1;
			return 0;
		});

		const updatedRecords: DayRecordEntry = { dayStart: values.dayStart, dayEnd: values.dayEnd, tasks: [...updatedTasks] };

		saveRecordsForDate(values.selectedDate, updatedRecords);
		reset({
			selectedDate: date,
			dayStart: values.dayStart,
			dayEnd: values.dayEnd,
			taskId: "",
			taskStartTime: "",
			comments: "",
		});
	};

	const taskCollection = createListCollection({
		items: userTasks.map((task) => ({ value: task._id, label: task.taskName })),
	});

	return (
		<form
			onSubmit={handleSubmit(handleAdd, () => {
				toaster.error({ title: "Invalid Form" });
			})}
		>
			<VStack align="stretch" w="full">
				<Flex gap="6">
					<Field.Root invalid={!!errors.selectedDate}>
						<Field.Label>Date</Field.Label>
						<Input
							type="date"
							max={dayjs().format("YYYY-MM-DD")}
							{...register("selectedDate", {
								required: true,
								onChange: (e) => {
									setDate(e.target.value);
								},
							})}
						/>
					</Field.Root>
					<Field.Root invalid={!!errors.dayStart}>
						<Field.Label>Day Start</Field.Label>
						<Input type="time" {...register("dayStart", { required: true })} />
					</Field.Root>
					<Field.Root invalid={!!errors.dayEnd}>
						<Field.Label>Day End</Field.Label>
						<Input type="time" {...register("dayEnd", { required: true })} />
					</Field.Root>
				</Flex>
				<Separator my="6" />
				<Grid columns={2} gridTemplateColumns="1fr 1fr" gap={4}>
					<GridItem>
						<Field.Root invalid={!!errors.taskId}>
							<Select.Root collection={taskCollection} onValueChange={({ value }) => setValue("taskId", value[0])} {...register("taskId", { required: true })}>
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
					</GridItem>
					<GridItem>
						<Field.Root invalid={!!errors.taskStartTime}>
							<Field.Label>Start Time</Field.Label>
							<Input type="time" {...register("taskStartTime", { required: true })} />
							<Field.ErrorText>{errors.taskStartTime?.message}</Field.ErrorText>
						</Field.Root>
					</GridItem>
					<GridItem colSpan={2}>
						<Field.Root>
							<Field.Label>Comments</Field.Label>
							<Textarea rows={6} placeholder="Enter comments..." {...register("comments")} />
						</Field.Root>
					</GridItem>
				</Grid>
				<Flex justifyContent="center" mt={4}>
					<Field.Root alignItems="center">
						<Button colorScheme="blue" type="submit" px={8}>
							Add Log
						</Button>
					</Field.Root>
				</Flex>
			</VStack>
		</form>
	);
};

export default AddRecord;
