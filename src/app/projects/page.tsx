'use client';
import { getProjects, getTasks } from "@/lib/data-firestore";
import { ProjectClientPage } from "./client-page";
import { useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
    const { user, loading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [projects, setProjects] = React.useState<any[]>([]);
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [dataLoading, setDataLoading] = React.useState(true);


    React.useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);
    
    React.useEffect(() => {
        if (user && firestore) {
            Promise.all([getProjects(firestore, user.uid), getTasks(firestore, user.uid)]).then(([proj, task]) => {
                setProjects(proj);
                setTasks(task);
                setDataLoading(false);
            });
        }
    }, [user, firestore]);

    if (loading || dataLoading || !user) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-32 w-full" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <ProjectClientPage projects={projects} tasks={tasks} userId={user.uid} />
        </div>
    )
}
