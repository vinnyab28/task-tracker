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

type PeriodUnit = "day" | "week" | "month";

const PERIOD_UNIT: Record<PeriodType, PeriodUnit> = {
	daily: "day",
	weekly: "week",
	monthly: "month",
};

const getSnapshotDates = (tab: PeriodType, date: dayjs.Dayjs): string[] => {
	if (tab === PeriodType.DAILY) {
		return [date.format("YYYY-MM-DD")];
	}
	if (tab === PeriodType.WEEKLY) {
		return Array.from({ length: 7 }, (_, i) =>
			date.startOf("isoWeek").add(i, "day").format("YYYY-MM-DD")
		);
	}
	return Array.from({ length: date.daysInMonth() }, (_, i) =>
		date.date(i + 1).format("YYYY-MM-DD")
	);
};

const getDateLabel = (tab: PeriodType, date: dayjs.Dayjs): string => {
	if (tab === PeriodType.DAILY) return date.format("MMM D, YYYY");
	if (tab === PeriodType.WEEKLY) {
		return `${date.startOf("isoWeek").format("MMM D")} – ${date.endOf("isoWeek").format("MMM D, YYYY")}`;
	}
	return date.format("MMMM YYYY");
};

const Dashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const [records, setRecords] = useState<{ [date: string]: RecordEntry[] }>({});
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [tab, setTab] = useState<PeriodType>(PeriodType.DAILY);
	const [loadingData, setLoadingData] = useState(false);

	const unit = PERIOD_UNIT[tab];
	const dateLabel = getDateLabel(tab, selectedDate);
	const isAtLimit = selectedDate.isSame(dayjs(), unit);

	const handlePrev = () => setSelectedDate((prev) => prev.subtract(1, unit));
	const handleNext = () => {
		const next = selectedDate.add(1, unit);
		if (!next.isAfter(dayjs(), unit)) setSelectedDate(next);
	};

	useEffect(() => {
		const loadTasks = async () => {
			try {
				const snapshot = await getDocs(collection(db, "users", user!.uid, "tasks"));
				const fetched: TaskItem[] = snapshot.docs.map((d) => ({ ...(d.data() as TaskItem) }));
				setTasks(fetched.sort((a, b) => a.taskName.localeCompare(b.taskName)));
			} catch (e) {
				console.error("Error loading tasks:", e);
				toaster.error({ title: "Failed to load tasks." });
			}
		};
		if (user) loadTasks();
	}, [user]);

	useEffect(() => {
		const fetchRecords = async () => {
			if (!user) return;
			setLoadingData(true);
			try {
				const dates = getSnapshotDates(tab, selectedDate);
				const snaps = await Promise.all(
					dates.map((date) => getDoc(doc(db, "users", user.uid, "records", date)))
				);
				const newRecords: { [date: string]: RecordEntry[] } = {};
				snaps.forEach((snap, i) => {
					if (snap.exists()) newRecords[dates[i]] = snap.data().entries || [];
				});
				setRecords(newRecords);
			} catch (error) {
				console.error("Failed to fetch records:", error);
			}
			setLoadingData(false);
		};
		fetchRecords();
	}, [selectedDate, tab, user]);

	return (
		<Layout>
			<Box>
				<Flex justifyContent="space-between">
					<Heading size="lg" mb={4}>Dashboard</Heading>
					<Button colorScheme="teal" onClick={() => navigate("/add")}>
						<LuPlus />
						Record Tasks
					</Button>
				</Flex>

				<Tabs.Root
					value={tab}
					variant="line"
					colorScheme="blue"
					onValueChange={({ value }) => {
						setTab(value as PeriodType);
						setSelectedDate(dayjs());
					}}
				>
					<Tabs.List>
						<Tabs.Trigger value={PeriodType.DAILY}>Daily</Tabs.Trigger>
						<Tabs.Trigger value={PeriodType.WEEKLY}>Weekly</Tabs.Trigger>
						<Tabs.Trigger value={PeriodType.MONTHLY}>Monthly</Tabs.Trigger>
					</Tabs.List>

					<Tabs.ContentGroup>
						<Flex justify="space-between" align="center" w="full" my={6}>
							<Button variant="outline" onClick={handlePrev}><LuArrowLeft /></Button>
							<Text fontWeight="semibold">{dateLabel}</Text>
							<Button variant="outline" onClick={handleNext} disabled={isAtLimit}><LuArrowRight /></Button>
						</Flex>

						{loadingData ? (
							<Loader showText />
						) : (
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
