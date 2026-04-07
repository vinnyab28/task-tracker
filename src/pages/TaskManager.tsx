import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { Box, Button, EmptyState, Field, Fieldset, Flex, Heading, HStack, IconButton, Input, List, Text, VStack } from "@chakra-ui/react";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { LuNotebookPen, LuTrash2 } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";
import Layout from "../components/Layout/Layout";

export interface TaskItem {
	_id: string;
	taskName: string;
	goals?: {
		daily?: number;
		weekly?: number;
		monthly?: number;
	};
}

const TaskManager = () => {
	const { user } = useAuth();
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [newTask, setNewTask] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	const fetchTasks = useCallback(async () => {
		const userTasksRef = user ? collection(db, "users", user.uid, "tasks") : null;
		const snapshot = await getDocs(userTasksRef!);
		const items: TaskItem[] = snapshot.docs.map((doc) => ({ ...doc.data(), _id: doc.id } as TaskItem));
		setTasks(items);
	}, [user]);

	useEffect(() => {
		fetchTasks();
	}, [fetchTasks]);

	const saveTaskToFirebase = async (task: TaskItem) => {
		try {
			setIsLoading(true);
			await setDoc(doc(db, "users", user!.uid, "tasks", task._id), task);
			toaster.success({ title: "Task created successfully." });
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

	const handleAddTask = async () => {
		setIsSubmitted(true);
		const trimmed = newTask.trim();
		if (!trimmed) {
			toaster.error({ title: "Please enter a task name." });
			return;
		}

		if (tasks.find((task) => task.taskName.toLowerCase() === trimmed.toLowerCase())) {
			toaster.create({ title: "Task already exists.", type: "error" });
			return;
		}

		const newItem: TaskItem = { _id: uuidv4(), taskName: trimmed };
		await saveTaskToFirebase(newItem);
		setTasks((prev) => [...prev, newItem]);
		setNewTask("");
		setIsSubmitted(false);
	};

	const handleDelete = async (_id: string) => {
		await deleteTaskFromFirebase(_id);
		setTasks((prev) => prev.filter((t) => t._id !== _id));
	};

	return (
		<Layout>
			<Box>
				<Heading size="xl" mb={4}>
					Task Manager
				</Heading>

				<Fieldset.Root mb={5}>
					<Fieldset.Content>
						<HStack direction="row" align="end">
							<Field.Root invalid={isSubmitted && !newTask}>
								<Field.Label>Task Name</Field.Label>
								<Input placeholder="New Task (e.g. Study, Exercise)" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
							</Field.Root>
							<Button type="submit" colorScheme="teal" onClick={handleAddTask} loading={isLoading}>
								Add
							</Button>
						</HStack>
					</Fieldset.Content>
				</Fieldset.Root>

				{tasks.length === 0 ? (
					<EmptyState.Root>
						<EmptyState.Content>
							<EmptyState.Indicator>
								<LuNotebookPen />
							</EmptyState.Indicator>
							<VStack textAlign="center">
								<EmptyState.Title>Your task list is empty</EmptyState.Title>
							</VStack>
						</EmptyState.Content>
					</EmptyState.Root>
				) : (
					<List.Root>
						{tasks.map((task) => (
							<List.Item key={task._id} display="flex" flexDir="column" my={2} p={3} border="1px solid" borderColor="gray.300" rounded="md">
								<Flex justify="space-between" align="center" gap={2}>
									<Text fontWeight="medium">{task.taskName}</Text>
									<IconButton aria-label="Delete" size="sm" colorScheme="red" variant="surface" colorPalette="red" onClick={() => handleDelete(task._id)}>
										<LuTrash2 />
									</IconButton>
								</Flex>
							</List.Item>
						))}
					</List.Root>
				)}
			</Box>
		</Layout>
	);
};

export default TaskManager;
