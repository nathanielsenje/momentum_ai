'use client';
import { getRecurringTasks } from "@/lib/data-firestore";
import { RecurringTasksClientPage } from "./client-page";
import { useUser, useFirestore } from "@/firebase";
import React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function RecurringTasksPage() {
    const { user, loading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [tasks, setTasks] = React.useState<any[]>([]);
    const [dataLoading, setDataLoading] = React.useState(true);

    React.useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);
    
    React.useEffect(() => {
        if (user && firestore) {
            getRecurringTasks(firestore, user.uid).then(task => {
                setTasks(task);
                setDataLoading(false);
            });
        }
    }, [user, firestore]);

    if (loading || dataLoading || !user) {
        return (
             <div className="flex flex-col gap-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        )
    }

    return <RecurringTasksClientPage tasks={tasks} userId={user.uid} />;
}
