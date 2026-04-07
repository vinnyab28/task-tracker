import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

import type { RecordEntry } from "@/pages/AddRecord";
import { parseDurationToMinutes } from "@/utils/helpers";
import { PeriodType } from "./types";

export const getLineChartData = (
    records: { [dateStr: string]: RecordEntry[] },
    selectedDate: dayjs.Dayjs,
    taskName: string,
    period: PeriodType
): { date: string; value: number }[] => {
    const result: { [label: string]: number } = {};

    for (const [dateStr, entries] of Object.entries(records)) {
        const date = dayjs(dateStr);
        const isInPeriod =
            period === PeriodType.WEEKLY
                ? date.isoWeek() === selectedDate.isoWeek() && date.year() === selectedDate.year()
                : date.month() === selectedDate.month() && date.year() === selectedDate.year();

        if (!isInPeriod) continue;

        const label = date.format("MMM D");
        let totalMins = 0;

        for (const entry of entries) {
            if (entry.task.taskName !== taskName) continue;
            totalMins += parseDurationToMinutes(entry.duration);
        }

        result[label] = (result[label] || 0) + totalMins;
    }

    return Object.entries(result).map(([date, value]) => ({ date, value }));
};
