import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import type { TaskItem } from "@/types/types";
import { Box, Button, CloseButton, ColorPicker, ColorSwatch, Dialog, EmptyState, Field, Fieldset, Flex, HStack, IconButton, Input, InputGroup, NumberInput, Portal, Separator, Table, Text, VStack } from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { LuGoal, LuNotebookPen, LuPlus, LuTrash2 } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";

const swatches = ["#000000", "#4A5568", "#F56565", "#ED64A6", "#9F7AEA", "#6B46C1", "#4299E1", "#0BC5EA", "#00B5D8", "#38B2AC", "#48BB78", "#68D391", "#ECC94B", "#DD6B20"];

const TaskManager = () => {
	const { user } = useAuth();
	const { handleSubmit, register, reset, setValue } = useForm<TaskItem>();

	const [taskItems, setTaskItems] = useState<TaskItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [dialogOpen, setDialogOpen] = useState<boolean>(false);
	const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

	const fetchTasks = useCallback(async () => {
		// Firebase collection path: users/{uid}/tasks
		const userTasksRef = user ? collection(db, "users", user.uid, "tasks") : null;
		const snapshot = await getDocs(userTasksRef!);
		const items: TaskItem[] = snapshot.docs.map((doc) => ({ ...doc.data() } as TaskItem));
		setTaskItems(items);
	}, [user]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	const saveTaskToFirebase = async (task: TaskItem) => {
		try {
			setIsLoading(true);
			await setDoc(doc(db, "users", user!.uid, "tasks", task._id), task);
			toaster.success({ title: "Task saved successfully." });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			toaster.error({ title: message });
		} finally {
			setIsLoading(false);
		}
	};

	const deleteTaskFromFirebase = async (taskId: string) => {
		try {
			await deleteDoc(doc(db, "users", user!.uid, "tasks", taskId));
			toaster.success({ title: "Task deleted successfully." });
		} catch (e) {
			const message = e instanceof Error ? e.message : String(e);
			toaster.error({ title: message });
		}
	};

	const handleSaveTask = async (values: TaskItem) => {
		if (!values._id && taskItems.find((task) => task.taskName.toLowerCase() === values.taskName.toLowerCase())) {
			toaster.error({ title: "Task already exists." });
			return;
		}

		if (values._id) {
			updateTask(values);
		} else {
			addTask(values);
		}

		setDialogOpen(false);
	};

	const addTask = (task: TaskItem) => {
		const newTaskItem: TaskItem = { ...task, _id: uuidv4() };
		saveTaskToFirebase(newTaskItem);
		setTaskItems((prevTasks) => [...prevTasks, newTaskItem]);
	};

	const updateTask = (task: TaskItem) => {
		const newTaskItem: TaskItem = { ...task };
		saveTaskToFirebase(newTaskItem);
		setTaskItems((prevTasks) => prevTasks.map((task) => (task._id === newTaskItem._id ? { ...task, ...newTaskItem } : task)));
	};

	const handleDelete = async (_id: string) => {
		await deleteTaskFromFirebase(_id);
		setTaskItems((prev) => prev.filter((t) => t._id !== _id));
	};

	const onEditTask = (task: TaskItem) => {
		setSelectedTask(task);
		setDialogOpen(true);
		Object.keys(task).forEach((fieldName) => {
			setValue(fieldName, task[fieldName]);
		});
	};

	return (
		<Box>
			{taskItems.length === 0 ? (
				<EmptyState.Root>
					<EmptyState.Content>
						<EmptyState.Indicator>
							<LuNotebookPen />
						</EmptyState.Indicator>
						<VStack textAlign="center">
							<EmptyState.Title>Your task list is empty</EmptyState.Title>
							{/* <EmptyState.Description>Explore our products and add items to your cart</EmptyState.Description> */}
						</VStack>
					</EmptyState.Content>
				</EmptyState.Root>
			) : (
				<VStack gap={4} alignItems="flex-end">
					<Dialog.Root lazyMount placement="center" size="lg" open={dialogOpen} onOpenChange={({ open }) => setDialogOpen(open)} onExitComplete={() => reset()}>
						<Dialog.Trigger asChild>
							<Button variant="solid" size="sm">
								<LuPlus /> Add Task
							</Button>
						</Dialog.Trigger>
						<Portal>
							<Dialog.Backdrop />
							<Dialog.Positioner>
								<Dialog.Content>
									<Dialog.Header>
										<Dialog.Title>
											{selectedTask ? "Edit" : "Add"} Task {selectedTask && `- ${selectedTask.taskName}`}
										</Dialog.Title>
									</Dialog.Header>
									<Dialog.Body>
										<VStack>
											<Fieldset.Root mb={5}>
												<Fieldset.Content>
													<VStack gap={4} alignItems="flex-start">
														<Field.Root>
															<Field.Label>Task Name</Field.Label>
															<Input placeholder="New Task (e.g. Study, Exercise)" {...register("taskName", { required: true })} />
														</Field.Root>
														<Field.Root>
															<Field.Label>Color</Field.Label>
															<ColorPicker.Root w="full" {...register("color")}>
																<ColorPicker.HiddenInput />
																<ColorPicker.SwatchGroup>
																	{swatches.map((item) => (
																		<ColorPicker.SwatchTrigger key={item} value={item}>
																			<ColorPicker.Swatch value={item}>
																				<ColorPicker.SwatchIndicator boxSize="3" bg="white" />
																			</ColorPicker.Swatch>
																		</ColorPicker.SwatchTrigger>
																	))}
																</ColorPicker.SwatchGroup>
															</ColorPicker.Root>
														</Field.Root>
														<Separator />
														<Flex alignItems="center" gap={2}>
															<LuGoal />
															<Text fontSize="xl" textAlign="left" fontWeight="bold">
																Goals
															</Text>
														</Flex>
														<HStack>
															<Field.Root>
																<Field.Label>Daily</Field.Label>
																<NumberInput.Root defaultValue="0">
																	<NumberInput.Control />
																	<InputGroup>
																		<NumberInput.Input min={0} max={24} {...register("goals.daily")} />
																	</InputGroup>
																</NumberInput.Root>
																<Field.HelperText>HOURS/day</Field.HelperText>
															</Field.Root>
															<Field.Root>
																<Field.Label>Weekly</Field.Label>
																<NumberInput.Root defaultValue="0">
																	<NumberInput.Control />
																	<InputGroup>
																		<NumberInput.Input min={0} max={7} {...register("goals.weekly")} />
																	</InputGroup>
																</NumberInput.Root>
																<Field.HelperText>DAYS/week</Field.HelperText>
															</Field.Root>
															<Field.Root>
																<Field.Label>Monthly</Field.Label>
																<NumberInput.Root defaultValue="0">
																	<NumberInput.Control />
																	<InputGroup>
																		<NumberInput.Input min={0} max={31} {...register("goals.monthly")} />
																	</InputGroup>
																</NumberInput.Root>
																<Field.HelperText>DAYS/month</Field.HelperText>
															</Field.Root>
														</HStack>
													</VStack>
												</Fieldset.Content>
											</Fieldset.Root>
										</VStack>
									</Dialog.Body>
									<Dialog.Footer>
										<Dialog.ActionTrigger asChild>
											<Button variant="outline">Cancel</Button>
										</Dialog.ActionTrigger>
										<Button onClick={handleSubmit(handleSaveTask)} loading={isLoading}>
											{selectedTask ? "Update" : "Save"}
										</Button>
									</Dialog.Footer>
									<Dialog.CloseTrigger asChild>
										<CloseButton size="sm" />
									</Dialog.CloseTrigger>
								</Dialog.Content>
							</Dialog.Positioner>
						</Portal>
					</Dialog.Root>
					<Table.Root size="lg" rounded="md" variant="outline">
						<Table.ColumnGroup>
							<Table.Column />
							<Table.Column htmlWidth="30%" />
							<Table.Column />
							<Table.Column />
						</Table.ColumnGroup>
						<Table.Header>
							<Table.Row>
								<Table.ColumnHeader>
									<Text fontSize="lg" fontWeight="bold"></Text>
								</Table.ColumnHeader>
								<Table.ColumnHeader>
									<Text fontSize="lg" fontWeight="bold">
										Task Name
									</Text>
								</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="center">
									<Text fontSize="lg" fontWeight="bold">
										Goals
									</Text>
								</Table.ColumnHeader>
								<Table.ColumnHeader textAlign="center">
									<Text fontSize="lg" fontWeight="bold">
										Actions
									</Text>
								</Table.ColumnHeader>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{taskItems.map((task) => {
								return (
									<>
										<Table.Row>
											<Table.Cell>
												<ColorSwatch value={task.color} />
											</Table.Cell>
											<Table.Cell>
												<Text fontWeight="medium">{task.taskName}</Text>
											</Table.Cell>
											<Table.Cell>
												<HStack gap="4">
													{task.goals.daily && (
														<>
															<Text fontSize="xs">D: {task.goals.daily} hrs/day</Text>
															<Separator orientation="vertical" height="4" />
														</>
													)}
													{task.goals.weekly && (
														<>
															<Text fontSize="xs">W: {task.goals.weekly} days/wk</Text>
															<Separator orientation="vertical" height="4" />
														</>
													)}
													{task.goals.monthly && <Text fontSize="xs">M: {task.goals.monthly} days/mnt</Text>}
												</HStack>
											</Table.Cell>
											<Table.Cell>
												<Flex justifyContent="center" gap={4}>
													<Button
														size="sm"
														onClick={() => {
															onEditTask(task);
														}}
														variant="subtle"
													>
														Edit
													</Button>
													<IconButton aria-label="Delete" size="sm" colorScheme="red" variant="surface" colorPalette="red" onClick={() => handleDelete(task._id)}>
														<LuTrash2 />
													</IconButton>
												</Flex>
											</Table.Cell>
										</Table.Row>
									</>
								);
							})}
						</Table.Body>
					</Table.Root>
				</VStack>
			)}
		</Box>
	);
};

export default TaskManager;
