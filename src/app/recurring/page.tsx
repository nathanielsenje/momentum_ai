import { getRecurringTasks } from "@/lib/data";
import { RecurringTasksClientPage } from "./client-page";

export default async function RecurringTasksPage() {
    const tasks = await getRecurringTasks();
    return <RecurringTasksClientPage tasks={tasks} />;
}
