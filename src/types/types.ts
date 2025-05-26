
export interface DayRecordEntry {
    dayStart: string;
    dayEnd: string;
    tasks: TaskLogItem[]
}

export interface TaskItem {
    _id: string;
    taskName: string;
    color: string;
    goals: {
        daily: number,
        weekly: number,
        monthly: number
    }
}

export interface TaskLogItem {
    taskId: string;
    startTime: string;
    comments?: string;
}

export interface DayLogForm {
    selectedDate: string;
    dayStart: string;
    dayEnd: string;
    taskId: string;
    taskStartTime: string;
    comments: string;
};
