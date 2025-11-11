'use client';
import { getReports } from "@/lib/data-firestore";
import { ReportsClientPage } from "./client-page";
import { useUser, useFirestore } from "@/firebase";
import React from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
    const { user, loading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const [reports, setReports] = React.useState<any[]>([]);
    const [dataLoading, setDataLoading] = React.useState(true);

    React.useEffect(() => {
        if (!loading && !user) {
        router.push('/login');
        }
    }, [user, loading, router]);
    
    React.useEffect(() => {
        if (user && firestore) {
            getReports(firestore, user.uid).then(reportsData => {
                const reportsArray = Object.values(reportsData).sort((a, b) => b.date.localeCompare(a.date));
                setReports(reportsArray);
                setDataLoading(false);
            });
        }
    }, [user, firestore]);

    if (loading || dataLoading || !user) {
        return (
             <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Skeleton className="h-96 w-full" />
                </div>
                <div className="md:col-span-2">
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        )
    }
    
    return <ReportsClientPage reports={reports} />;
}
