'use client';
import { getTasks, getProjects, getCategories } from "@/lib/data-firestore";
import { WeeklyPlannerClientPage } from "./client-page";
import { useUser, useFirestore } from "@/firebase";
import React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function WeeklyPlannerPage() {
    const { user, loading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [tasks, setTasks] = React.useState<any[]>([]);
    const [projects, setProjects] = React.useState<any[]>([]);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [dataLoading, setDataLoading] = React.useState(true);


    React.useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);
    
    React.useEffect(() => {
        if (user && firestore) {
            Promise.all([
                getTasks(firestore, user.uid), 
                getProjects(firestore, user.uid),
                getCategories()
            ]).then(([task, proj, cat]) => {
                setTasks(task);
                setProjects(proj);
                setCategories(cat);
                setDataLoading(false);
            });
        }
    }, [user, firestore]);

    if (loading || dataLoading || !user) {
        return <Skeleton className="h-[500px] w-full" />
    }

    return (
        <WeeklyPlannerClientPage tasks={tasks} projects={projects} categories={categories} userId={user.uid} />
    );
}
