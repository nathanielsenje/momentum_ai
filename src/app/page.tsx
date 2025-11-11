
'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardClientPage } from './client-page';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    React.useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-96" />
                </div>
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-64" />
            </div>
        );
    }

    return (
        <React.Suspense fallback={
            <div className="flex flex-col gap-4">
                <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-64" />
                <Skeleton className="h-96" />
                </div>
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-64" />
            </div>
        }>
            <DashboardClientPage />
        </React.Suspense>
    );
}
