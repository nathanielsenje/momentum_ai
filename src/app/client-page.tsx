
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
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Pomodoro />
        <TaskList />
      </div>
      
      <ProjectOverview />
      
      <DailyReportCard />
      
      <React.Suspense fallback={<Skeleton className="h-64" />}>
        <MomentumCard />
      </React.Suspense>
    </div>
  );
}
