import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

import { parseDurationToMinutes } from "@/utils/helpers";
import type { DayRecord, PeriodType } from "@/utils/types";

type FormattedData = { name: string; value: number };

export const transformTaskData = (
    records: { [date: string]: DayRecord },
    selectedDate: dayjs.Dayjs,
    period: PeriodType
): FormattedData[] => {
    const grouped: { [taskName: string]: number } = {};

    for (const [dateStr, record] of Object.entries(records)) {
        const entries = record.entries ?? [];
        const date = dayjs(dateStr);
        const isMatch =
            period === "daily"
                ? date.isSame(selectedDate, "day")
                : period === "weekly"
                    ? date.isoWeek() === selectedDate.isoWeek() && date.year() === selectedDate.year()
                    : date.month() === selectedDate.month() && date.year() === selectedDate.year();

        if (!isMatch) continue;

        for (const entry of entries) {
            const minutes = parseDurationToMinutes(entry.duration);
            grouped[entry.task.taskName] = (grouped[entry.task.taskName] || 0) + minutes;
        }
    }

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};
