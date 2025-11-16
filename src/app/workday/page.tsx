import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkdayClientPage } from './client-page';

export default function WorkdayPage() {
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
            <WorkdayClientPage />
        </React.Suspense>
    );
}
