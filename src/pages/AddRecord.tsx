import TimelineView from "@/components/ui/timeline-view";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { calcDuration, minutesToTimeLabel, timeToMinutes } from "@/utils/helpers";
import type { DayRecord, RecordEntry, TaskItem } from "@/utils/types";
import { Box, Button, createListCollection, Field, Flex, Heading, Input, Portal, Select, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import Layout from "../components/Layout/Layout";

const rechainEntries = (entries: RecordEntry[], wakeTime: string): RecordEntry[] =>
    entries.map((entry, i) => {
        const from = i === 0 ? wakeTime : entries[i - 1].to;
        return { ...entry, from, duration: calcDuration(from, entry.to) };
    });

const AddRecord = () => {
    const { user } = useAuth();
    const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [wakeTime, setWakeTime] = useState("");
    const [sleepTime, setSleepTime] = useState<string | undefined>(undefined);
    const [entries, setEntries] = useState<RecordEntry[]>([]);

    const [addingEntry, setAddingEntry] = useState(false);
    const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [untilTime, setUntilTime] = useState("");
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [wrapMode, setWrapMode] = useState(false);
    const [sleepInput, setSleepInput] = useState("");

    useEffect(() => {
        const loadTasks = async () => {
            if (!user) return;
            try {
                const snapshot = await getDocs(collection(db, "users", user.uid, "tasks"));
                const fetched: TaskItem[] = snapshot.docs.map(d => d.data() as TaskItem);
                setTasks(fetched.sort((a, b) => a.taskName.localeCompare(b.taskName)));
            } catch {
                toaster.error({ title: "Failed to load tasks." });
            }
        };
        loadTasks();
    }, [user]);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            const snap = await getDoc(doc(db, "users", user.uid, "records", date));
            if (snap.exists()) {
                const data = snap.data() as DayRecord;
                setWakeTime(data.wakeTime ?? "");
                setSleepTime(data.sleepTime);
                setEntries(data.entries ?? []);
            } else {
                setWakeTime("");
                setSleepTime(undefined);
                setEntries([]);
            }
            setAddingEntry(false);
            setEditingIndex(null);
            setWrapMode(false);
        };
        load();
    }, [date, user]);

    const buildRecord = (updatedEntries: RecordEntry[], wake: string, sleep?: string): DayRecord => ({
        userId: user!.uid,
        date,
        wakeTime: wake,
        ...(sleep ? { sleepTime: sleep } : {}),
        entries: updatedEntries
    });

    const saveRecord = async (record: DayRecord) => {
        await setDoc(doc(db, "users", user!.uid, "records", date), record);
    };

    const handleWakeChange = async (newWake: string) => {
        setWakeTime(newWake);
        if (!newWake) return;
        const rechained = rechainEntries(entries, newWake);
        setEntries(rechained);
        await saveRecord(buildRecord(rechained, newWake, sleepTime));
    };

    const cancelEntry = () => {
        setAddingEntry(false);
        setInsertAfterIndex(null);
        setEditingIndex(null);
        setUntilTime("");
        setSelectedTaskIds([]);
        setDescription("");
    };

    const startAdding = (afterIndex?: number) => {
        const idx = afterIndex ?? null;
        const from = idx !== null ? entries[idx].to : (entries.at(-1)?.to ?? "");
        setInsertAfterIndex(idx);
        setUntilTime(from);
        setSelectedTaskIds([]);
        setDescription("");
        setEditingIndex(null);
        setAddingEntry(true);
    };

    const startEditing = (index: number) => {
        const entry = entries[index];
        setUntilTime(entry.to);
        setSelectedTaskIds([entry.task._id]);
        setDescription(entry.description ?? "");
        setEditingIndex(index);
        setAddingEntry(false);
    };

    const fromForNewEntry = insertAfterIndex !== null ? entries[insertAfterIndex].to : (entries.at(-1)?.to ?? wakeTime);
    const fromForEdit = editingIndex !== null ? (editingIndex === 0 ? wakeTime : entries[editingIndex - 1].to) : "";

    const handleAddEntry = async () => {
        if (!wakeTime) {
            toaster.error({ title: "Please enter your wake time first." });
            return;
        }
        if (!selectedTaskIds.length) {
            toaster.error({ title: "Please select a task." });
            return;
        }
        if (!untilTime) {
            toaster.error({ title: "Please enter the end time." });
            return;
        }
        const from = fromForNewEntry;
        if (untilTime <= from) {
            toaster.error({ title: "End time must be after start time." });
            return;
        }

        const task = tasks.find(t => t._id === selectedTaskIds[0])!;
        const newEntry: RecordEntry = { task, from, to: untilTime, duration: calcDuration(from, untilTime), description };
        const insertAt = insertAfterIndex !== null ? insertAfterIndex + 1 : entries.length;
        const spliced = [...entries.slice(0, insertAt), newEntry, ...entries.slice(insertAt)];
        const rechained = rechainEntries(spliced, wakeTime);
        setEntries(rechained);
        await saveRecord(buildRecord(rechained, wakeTime, sleepTime));
        cancelEntry();
    };

    const handleSaveEdit = async () => {
        if (editingIndex === null || !selectedTaskIds.length || !untilTime) {
            toaster.error({ title: "Please fill all required fields." });
            return;
        }
        const from = fromForEdit;
        if (untilTime <= from) {
            toaster.error({ title: "End time must be after start time." });
            return;
        }

        const task = tasks.find(t => t._id === selectedTaskIds[0])!;
        const updatedEntry: RecordEntry = { task, from, to: untilTime, duration: calcDuration(from, untilTime), description };
        const updated = entries.map((e, i) => (i === editingIndex ? updatedEntry : e));
        const rechained = rechainEntries(updated, wakeTime);
        setEntries(rechained);
        await saveRecord(buildRecord(rechained, wakeTime, sleepTime));
        cancelEntry();
    };

    const handleDelete = async (index: number) => {
        const rechained = rechainEntries(
            entries.filter((_, i) => i !== index),
            wakeTime
        );
        setEntries(rechained);
        await saveRecord(buildRecord(rechained, wakeTime, sleepTime));
        cancelEntry();
    };

    const handleWrapUp = async () => {
        const lastTo = entries.at(-1)?.to ?? wakeTime;
        if (!sleepInput) {
            toaster.error({ title: "Please enter your sleep time." });
            return;
        }
        if (sleepInput <= lastTo) {
            toaster.error({ title: "Sleep time must be after last entry's end time." });
            return;
        }
        setSleepTime(sleepInput);
        setWrapMode(false);
        await saveRecord(buildRecord(entries, wakeTime, sleepInput));
        toaster.success({ title: "Day wrapped up!" });
    };

    const taskCollection = createListCollection({
        items: tasks.map(t => ({ value: t._id, label: t.taskName }))
    });

    const showForm = addingEntry || editingIndex !== null;
    const currentFrom = addingEntry ? fromForNewEntry : fromForEdit;

    return (
        <Layout>
            <VStack align="stretch" w="full" gap={6}>
                <Flex justify="space-between" align="center">
                    <Heading size="lg">Record Tasks</Heading>
                    <Input type="date" max={dayjs().format("YYYY-MM-DD")} value={date} onChange={e => setDate(e.target.value)} width="180px" />
                </Flex>

                <Field.Root>
                    <Field.Label>Woke up at</Field.Label>
                    <Input type="time" value={wakeTime} onChange={e => handleWakeChange(e.target.value)} width="160px" />
                </Field.Root>

                {wakeTime ? (
                    <>
                        <TimelineView
                            wakeTime={wakeTime}
                            sleepTime={sleepTime}
                            items={entries}
                            onDelete={handleDelete}
                            onEdit={startEditing}
                            onInsertAfter={idx => startAdding(idx)}
                        />

                        {showForm && (
                            <Box p={4} borderWidth="1px" borderColor="border.muted" rounded="md">
                                {currentFrom && (
                                    <Text fontSize="sm" color="fg.muted" mb={3}>
                                        From {minutesToTimeLabel(timeToMinutes(currentFrom))} → Until
                                    </Text>
                                )}
                                <Flex flexWrap="wrap" gap={3} align="flex-end">
                                    <Field.Root width={["100%", "220px"]}>
                                        <Field.Label>Task</Field.Label>
                                        <Select.Root
                                            collection={taskCollection}
                                            value={selectedTaskIds}
                                            onValueChange={({ value }) => setSelectedTaskIds(value)}
                                        >
                                            <Select.HiddenSelect />
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Select task" />
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator />
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Portal>
                                                <Select.Positioner>
                                                    <Select.Content>
                                                        {taskCollection.items.map(task => (
                                                            <Select.Item item={task} key={task.value}>
                                                                {task.label}
                                                                <Select.ItemIndicator />
                                                            </Select.Item>
                                                        ))}
                                                    </Select.Content>
                                                </Select.Positioner>
                                            </Portal>
                                        </Select.Root>
                                    </Field.Root>

                                    <Field.Root width="150px">
                                        <Field.Label>Until</Field.Label>
                                        <Input type="time" value={untilTime} onChange={e => setUntilTime(e.target.value)} />
                                    </Field.Root>

                                    <Field.Root flex="1" minW="160px">
                                        <Field.Label>Note (optional)</Field.Label>
                                        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional note" />
                                    </Field.Root>

                                    <Flex gap={2} pb="1px">
                                        <Button onClick={addingEntry ? handleAddEntry : handleSaveEdit}>{addingEntry ? "Add" : "Save"}</Button>
                                        <Button variant="outline" onClick={cancelEntry}>
                                            Cancel
                                        </Button>
                                    </Flex>
                                </Flex>
                            </Box>
                        )}

                        {!showForm && !wrapMode && (
                            <Flex gap={3} align="center">
                                {!sleepTime && (
                                    <Button variant="outline" onClick={() => startAdding()}>
                                        + Add next entry
                                    </Button>
                                )}
                                {entries.length > 0 && !sleepTime && (
                                    <Button
                                        variant="outline"
                                        colorPalette="gray"
                                        onClick={() => {
                                            setSleepInput("");
                                            setWrapMode(true);
                                        }}
                                    >
                                        Wrap up day
                                    </Button>
                                )}
                                {sleepTime && (
                                    <Text color="fg.muted" fontSize="sm">
                                        Day wrapped up · Slept at {minutesToTimeLabel(timeToMinutes(sleepTime!))}
                                    </Text>
                                )}
                            </Flex>
                        )}

                        {wrapMode && (
                            <Box p={4} borderWidth="1px" borderColor="border.muted" rounded="md">
                                <Flex gap={3} align="flex-end">
                                    <Field.Root width="180px">
                                        <Field.Label>Went to sleep at</Field.Label>
                                        <Input type="time" value={sleepInput} onChange={e => setSleepInput(e.target.value)} />
                                    </Field.Root>
                                    <Button onClick={handleWrapUp}>Save</Button>
                                    <Button variant="outline" onClick={() => setWrapMode(false)}>
                                        Cancel
                                    </Button>
                                </Flex>
                            </Box>
                        )}
                    </>
                ) : (
                    <Text color="fg.muted" fontSize="sm">
                        Enter your wake time to start recording.
                    </Text>
                )}
            </VStack>
        </Layout>
    );
};

export default AddRecord;
