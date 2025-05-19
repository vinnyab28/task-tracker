"use client";

import DailyDashboardComponent from "@/components/Dashboard/DailyDashboard";
import MonthlyDashboardComponent from "@/components/Dashboard/MonthlyDashboard";
import WeeklyDashboardComponent from "@/components/Dashboard/WeeklyDashboard";
import Loader from "@/components/ui/Loader";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { PeriodType } from "@/utils/types";
import { Box, Button, Flex, Heading, Tabs, Text } from "@chakra-ui/react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuPlus } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import type { RecordEntry } from "./AddRecord";
import type { TaskItem } from "./TaskManager";

dayjs.extend(isoWeek);

const Dashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [records, setRecords] = useState<{ [date: string]: RecordEntry[] }>({});
	// const [goals, setGoals] = useState<{ [key: string]: number }>({});
	const [tasks, setTasks] = useState<TaskItem[]>([]);

	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [tab, setTab] = useState<PeriodType>(PeriodType.DAILY);
	const [loadingData, setLoadingData] = useState(false);

	const handlePrev = () => {
		setSelectedDate((prev) => (tab === PeriodType.DAILY ? prev.subtract(1, "day") : tab === PeriodType.WEEKLY ? prev.subtract(1, "week") : prev.subtract(1, "month")));
	};

	const handleNext = () => {
		const now = dayjs();
		const next = tab === PeriodType.DAILY ? selectedDate.add(1, "day") : tab === PeriodType.WEEKLY ? selectedDate.add(1, "week") : selectedDate.add(1, "month");
		if (next.isAfter(now, tab === PeriodType.MONTHLY ? "month" : tab === PeriodType.WEEKLY ? "week" : "day")) return;
		setSelectedDate(next);
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoadingData(true);
			try {
				const snapshotDates: string[] = [];

				if (tab === PeriodType.DAILY) {
					snapshotDates.push(selectedDate.format("YYYY-MM-DD"));
				} else if (tab === PeriodType.WEEKLY) {
					for (let i = 0; i < 7; i++) {
						snapshotDates.push(selectedDate.startOf("week").add(i, "day").format("YYYY-MM-DD"));
					}
				} else if (tab === PeriodType.MONTHLY) {
					const daysInMonth = selectedDate.daysInMonth();
					for (let i = 1; i <= daysInMonth; i++) {
						snapshotDates.push(selectedDate.date(i).format("YYYY-MM-DD"));
					}
				}

				const newRecords: { [date: string]: RecordEntry[] } = {};

				for (const date of snapshotDates) {
					const docRef = doc(db, "users", user!.uid, "records", date);
					const recordsDoc = await getDoc(docRef);
					if (recordsDoc.exists()) {
						const data = recordsDoc.data();
						newRecords[date] = data.entries || [];
					}
				}

				setRecords(newRecords);

				// Uncomment below if you want to fetch goals too
				// const goalsDoc = await getDoc(doc(db, USER_DOC_PATH, GOALS_DOC_ID));
				// if (goalsDoc.exists()) {
				// 	setGoals(goalsDoc.data() as { [key: string]: number });
				// }
			} catch (error) {
				console.error("Failed to fetch data from Firestore:", error);
			}
			setLoadingData(false);
		};

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

		if (user) {
			fetchData();
			loadTasks();
		}
	}, [selectedDate, user]);

	return (
		<Layout>
			<Box>
				<Flex justifyContent="space-between">
					<Heading size="lg" mb={4}>
						Dashboard
					</Heading>
					<Button colorScheme="teal" onClick={() => navigate("/add")}>
						<LuPlus />
						Record Tasks
					</Button>
				</Flex>

				<Tabs.Root
					value={tab}
					defaultChecked={true}
					variant="line"
					colorScheme="blue"
					onValueChange={({ value }) => {
						setTab(value as PeriodType);
						setSelectedDate(dayjs()); // reset view when switching tab
					}}
				>
					<Tabs.List>
						<Tabs.Trigger value={PeriodType.DAILY}>Daily</Tabs.Trigger>
						<Tabs.Trigger value={PeriodType.WEEKLY}>Weekly</Tabs.Trigger>
						<Tabs.Trigger value={PeriodType.MONTHLY}>Monthly</Tabs.Trigger>
					</Tabs.List>

					<Tabs.ContentGroup>
						<Flex justify="space-between" align="center" w="full" my={6}>
							<Button variant="outline" onClick={handlePrev}>
								<LuArrowLeft />
							</Button>
							<Text fontWeight="semibold">
								{tab === "daily" ? selectedDate.format("MMM D, YYYY") : tab === "weekly" ? `${selectedDate.startOf("week").format("MMM D")} – ${selectedDate.endOf("week").format("MMM D, YYYY")}` : selectedDate.format("MMMM YYYY")}
							</Text>
							<Button variant="outline" onClick={handleNext} disabled={selectedDate.isSame(dayjs(), tab === "monthly" ? "month" : tab === "weekly" ? "week" : "day")}>
								<LuArrowRight />
							</Button>
						</Flex>

						{loadingData && (
							<Box w="full" h="full">
								<Loader showText />
							</Box>
						)}
						{!loadingData && (
							<>
								<Tabs.Content value="daily">
									<DailyDashboardComponent records={records} selectedDate={selectedDate} />
								</Tabs.Content>
								<Tabs.Content value="weekly">
									<WeeklyDashboardComponent records={records} selectedDate={selectedDate} tasks={tasks} />
								</Tabs.Content>
								<Tabs.Content value="monthly">
									<MonthlyDashboardComponent records={records} selectedDate={selectedDate} tasks={tasks} />
								</Tabs.Content>
							</>
						)}
					</Tabs.ContentGroup>
				</Tabs.Root>
			</Box>
		</Layout>
	);
};

export default Dashboard;
