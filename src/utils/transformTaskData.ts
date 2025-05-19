import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

import type { RecordEntry } from "@/pages/AddRecord";
import type { PeriodType } from "@/utils/types";

type FormattedData = { name: string; value: number };

export const transformTaskData = (
    records: { [date: string]: RecordEntry[] },
    selectedDate: dayjs.Dayjs,
    period: PeriodType
): FormattedData[] => {
    const grouped: { [taskName: string]: number } = {};

    for (const [dateStr, entries] of Object.entries(records)) {
        const date = dayjs(dateStr);
        const isMatch =
            period === "daily"
                ? date.isSame(selectedDate, "day")
                : period === "weekly"
                    ? date.isoWeek() === selectedDate.isoWeek() && date.year() === selectedDate.year()
                    : date.month() === selectedDate.month() && date.year() === selectedDate.year();

        if (!isMatch) continue;

        const sortedEntries = [...entries].sort((a, b) => a.from.localeCompare(b.from));

        for (let i = 0; i < sortedEntries.length; i++) {
            const current = sortedEntries[i];
            const fromTime = dayjs(`${dateStr}T${current.from}`);

            const nextTime =
                i < sortedEntries.length - 1
                    ? dayjs(`${dateStr}T${sortedEntries[i + 1].from}`)
                    : date.isSame(dayjs(), "day")
                        ? dayjs()
                        : fromTime;

            const minutes = Math.max(nextTime.diff(fromTime, "minute"), 0);
            grouped[current.task.taskName] = (grouped[current.task.taskName] || 0) + minutes;
        }
    }

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
};
