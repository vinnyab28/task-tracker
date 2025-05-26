import type { DayRecordEntry, TaskItem } from "@/types/types";
import type { BarListData } from "@chakra-ui/charts";
import dayjs from "dayjs";

type ChartData = BarListData["data"];

interface TaskPerDay {
    [date: string]: {
        taskId: string,
        taskName: string,
        duration: number
    }[]
}

/**
 * Calculates task durations from DayRecordEntry and formats for Chakra BarList
 */
export const getTotalHoursForTaskPerDay = (
    records: { [date: string]: DayRecordEntry },
    taskItems: TaskItem[],
    dateRange: string[],
    taskId: string = ""
): ChartData => {
    const taskMap = Object.fromEntries(taskItems.map((t) => [t._id, { taskName: t.taskName, color: t.color }]));
    const taskDurations: { [taskId: string]: number } = {};

    const result: TaskPerDay = {};

    for (const date of dateRange) {
        result[date] = [];

        const dayRecord = records[date];
        if (!dayRecord || !dayRecord.tasks || dayRecord.tasks.length === 0) continue;

        // Sort tasks by startTime
        const sortedTasks = [...dayRecord.tasks].sort((a, b) =>
            dayjs(`${date} ${a.startTime}`).isAfter(`${date} ${b.startTime}`) ? 1 : -1
        );

        for (let i = 0; i < sortedTasks.length; i++) {
            const current = sortedTasks[i];
            const next = sortedTasks[i + 1];

            if (taskId && current.taskId !== taskId) {
                continue;
            }

            const start = dayjs(`${date} ${current.startTime}`);
            const end = next ? dayjs(`${date} ${next.startTime}`) : dayjs(`${date} ${dayRecord.dayEnd}`);

            const duration = end.diff(start, "minute");

            if (!taskDurations[current.taskId]) taskDurations[current.taskId] = 0;
            taskDurations[current.taskId] += duration;
        }

        const data: ChartData = Object.entries(taskDurations).map(([taskId, duration]) => ({
            taskId: taskId,
            taskName: taskMap[taskId].taskName || "Unknown Task",
            duration,
            color: taskMap[taskId].color
        }));
        result[date] = data;
    }

    return result;
}
