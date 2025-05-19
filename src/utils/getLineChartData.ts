import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { PeriodType } from "./types";

dayjs.extend(weekOfYear)

type RecordEntry = {
    from: string
    task: { taskName: string }
}

type RecordsMap = {
    [dateStr: string]: RecordEntry[]
}

export const getLineChartData = (
    records: RecordsMap,
    selectedDate: dayjs.Dayjs,
    taskName: string,
    period: PeriodType
): { date: string; value: number }[] => {
    const result: { [label: string]: number } = {}
    for (const [dateStr, entries] of Object.entries(records)) {
        const date = dayjs(dateStr)
        const isInPeriod =
            period === PeriodType.WEEKLY
                ? date.week() === selectedDate.week() &&
                date.year() === selectedDate.year()
                : date.month() === selectedDate.month() &&
                date.year() === selectedDate.year()

        if (!isInPeriod) continue

        const label = date.format("MMM D") // e.g., "May 19"
        let totalMins = 0

        const sorted = [...entries].sort((a, b) => a.from.localeCompare(b.from))

        for (let i = 0; i < sorted.length; i++) {
            const entry = sorted[i]
            if (entry.task.taskName !== taskName) continue

            const from = dayjs(`${dateStr}T${entry.from}`)
            const to =
                i < sorted.length - 1
                    ? dayjs(`${dateStr}T${sorted[i + 1].from}`)
                    : from

            const mins = Math.max(to.diff(from, "minute"), 0)
            totalMins += mins
        }

        result[label] = (result[label] || 0) + totalMins;
    }

    return Object.entries(result).map(([date, value]) => ({ date, value }))
}
