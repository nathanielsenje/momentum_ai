
'use client';

import * as React from 'react';
import { MomentumCard } from '@/components/dashboard/momentum-card';
import { TaskList } from '@/components/dashboard/task-list';
import { Pomodoro } from '@/components/dashboard/pomodoro';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import { DailyReportCard } from '@/components/dashboard/daily-report-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function DashboardClientPage() {
  const { user, loading: userLoading } = useUser();
  const { loading: dataLoading } = useDashboardData();

  if (userLoading || dataLoading || !user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-96" />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <React.Suspense fallback={<Skeleton className="h-64" />}>
                <MomentumCard />
            </React.Suspense>
            <TaskList />
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            <Pomodoro />
            <ProjectOverview />
            <DailyReportCard />
        </div>
    </div>
  );
}
