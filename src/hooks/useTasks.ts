import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import type { TaskItem } from "@/types/types";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";

const useTasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<TaskItem[]>([]);

    useEffect(() => {
        const loadTasks = async () => {
            if (!user) return;

            try {
                const taskSnapshot = await getDocs(collection(db, "users", user.uid, "tasks"));
                const fetchedTasks: TaskItem[] = taskSnapshot.docs.map((doc) => ({ ...(doc.data() as TaskItem) }));
                setTasks(fetchedTasks.sort((a, b) => a.taskName.localeCompare(b.taskName)));
            } catch (e) {
                console.error("Error loading tasks:", e);
                toaster.error({ title: "Failed to load tasks." });
            }
        };
        loadTasks();
    }, [user]);

    return { tasks };
}

export default useTasks