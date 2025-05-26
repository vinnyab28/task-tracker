"use client";

import DailyDashboardComponent from "@/components/Dashboard/DailyDashboard";
import MonthlyDashboardComponent from "@/components/Dashboard/MonthlyDashboard";
import WeeklyDashboardComponent from "@/components/Dashboard/WeeklyDashboard";
import Loader from "@/components/ui/Loader";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import useTasks from "@/hooks/useTasks";
import type { DayRecordEntry } from "@/types/types";
import { PeriodType } from "@/utils/types";
import { Box, Button, Card, EmptyState, Flex, Separator, Tabs, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { LuArrowLeft, LuArrowRight, LuCookingPot } from "react-icons/lu";

dayjs.extend(isoWeek);

const Dashboard = () => {
	const { user } = useAuth();

	const [dayRecords, setDayRecords] = useState<{ [date: string]: DayRecordEntry | null } | null>(null);
	const { tasks } = useTasks();
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [tab, setTab] = useState<PeriodType>(PeriodType.DAILY);
	const [loadingData, setLoadingData] = useState(false);
	const [selectedDateRange, setSelectedDateRange] = useState<string[]>([]); // Use state instead of ref

	const adjustDate = (date: dayjs.Dayjs, adjustment: number) => {
		switch (tab) {
			case PeriodType.DAILY:
				return date.add(adjustment, "day");
			case PeriodType.WEEKLY:
				return date.add(adjustment, "week");
			case PeriodType.MONTHLY:
				return date.add(adjustment, "month");
			default:
				return date;
		}
	};

	const handlePrev = () => {
		setSelectedDate((prev) => {
			const newDate = adjustDate(prev, -1);
			updateDateRange(newDate, tab); // Update the date range
			return newDate;
		});
	};
	const handleNext = () => {
		setSelectedDate((prev) => {
			const next = adjustDate(prev, 1);
			const now = dayjs();
			if (next.isAfter(now, tab === PeriodType.MONTHLY ? "month" : tab === PeriodType.WEEKLY ? "week" : "day")) return prev;
			updateDateRange(next, tab); // Update the date range
			return next;
		});
	};

	const updateDateRange = (date: dayjs.Dayjs, tab) => {
		const snapshotDates: string[] = [];
		if (tab === PeriodType.DAILY) {
			snapshotDates.push(date.format("YYYY-MM-DD"));
		} else if (tab === PeriodType.WEEKLY) {
			const startOfWeek = date.startOf("week");
			for (let i = 0; i < 7; i++) {
				snapshotDates.push(startOfWeek.add(i, "day").format("YYYY-MM-DD"));
			}
		} else if (tab === PeriodType.MONTHLY) {
			const daysInMonth = date.daysInMonth();
			for (let i = 1; i <= daysInMonth; i++) {
				snapshotDates.push(date.date(i).format("YYYY-MM-DD"));
			}
		}
		setSelectedDateRange(snapshotDates); // Update the date range state
	};

	useEffect(() => {
		const fetchData = async () => {
			setLoadingData(true);
			try {
				const newRecords = await Promise.all(
					selectedDateRange.map(async (date) => {
						const docRef = doc(db, "users", user!.uid, "records", date);
						const recordsDoc = await getDoc(docRef);
						return recordsDoc.exists() ? { [date]: recordsDoc.data() as DayRecordEntry } : { [date]: null };
					})
				);

				setDayRecords(Object.assign({}, ...newRecords));
			} catch (error) {
				console.error("Failed to fetch data from Firestore:", error);
			} finally {
				setLoadingData(false);
			}
		};

		if (user) {
			fetchData();
		}
	}, [selectedDateRange, user]);

	const noValues = dayRecords && Object.values(dayRecords!).every((record) => record === null);

	return (
		<Box textAlign="center">
			<Tabs.Root
				value={tab}
				variant="enclosed"
				colorScheme="blue"
				lazyMount
				unmountOnExit
				defaultValue={PeriodType.DAILY}
				onValueChange={({ value }) => {
					setTab(value as PeriodType);
					setSelectedDate(dayjs()); // reset view when switching tab
					updateDateRange(dayjs(), value); // Update date range when switching tabs
				}}
			>
				<Tabs.List>
					<Tabs.Trigger value={PeriodType.DAILY}>Daily</Tabs.Trigger>
					<Tabs.Trigger value={PeriodType.WEEKLY}>Weekly</Tabs.Trigger>
					<Tabs.Trigger value={PeriodType.MONTHLY}>Monthly</Tabs.Trigger>
				</Tabs.List>
				<Separator my={6} />
				<Tabs.ContentGroup>
					<Flex justify="space-between" align="center" w="full" mb={6}>
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

					{noValues && (
						<Card.Root>
							<Card.Body>
								<EmptyState.Root>
									<EmptyState.Content>
										<EmptyState.Indicator>
											<LuCookingPot />
										</EmptyState.Indicator>
										<VStack textAlign="center">
											<EmptyState.Title>Oops, it's empty!</EmptyState.Title>
											<EmptyState.Description>Kindly log your daily activities to see your progress</EmptyState.Description>
										</VStack>
									</EmptyState.Content>
								</EmptyState.Root>
							</Card.Body>
						</Card.Root>
					)}

					{loadingData && !noValues && (
						<Box w="full" h="full">
							<Loader showText />
						</Box>
					)}
					{!loadingData && !noValues && (
						<>
							<Tabs.Content value={PeriodType.DAILY}>{dayRecords && <DailyDashboardComponent records={dayRecords!} dateRange={selectedDateRange} tasks={tasks} />}</Tabs.Content>
							<Tabs.Content value={PeriodType.WEEKLY}>{dayRecords && <WeeklyDashboardComponent records={dayRecords} dateRange={selectedDateRange} tasks={tasks} />}</Tabs.Content>
							<Tabs.Content value={PeriodType.MONTHLY}>{dayRecords && <MonthlyDashboardComponent records={dayRecords} dateRange={selectedDateRange} tasks={tasks} />}</Tabs.Content>
						</>
					)}
				</Tabs.ContentGroup>
			</Tabs.Root>
		</Box>
	);
};

export default Dashboard;
