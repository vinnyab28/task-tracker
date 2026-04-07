export type PeriodType = "daily" | "weekly" | "monthly";

export const PeriodType = {
    DAILY: "daily" as PeriodType,
    WEEKLY: "weekly" as PeriodType,
    MONTHLY: "monthly" as PeriodType,
};

export interface TaskItem {
    _id: string;
    taskName: string;
}

export interface RecordEntry {
    task: TaskItem;
    from: string;         // "HH:MM" — start time
    to: string;           // "HH:MM" — end time (explicit)
    duration: string;     // "Xh Ym" — pre-calculated from from/to
    description?: string;
}

export interface DayRecord {
    userId: string;
    date: string;         // "YYYY-MM-DD"
    wakeTime: string;     // "HH:MM"
    sleepTime?: string;   // "HH:MM" — optional until user wraps up
    entries: RecordEntry[];
}
