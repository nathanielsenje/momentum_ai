'use client';
import * as React from 'react';
import { Suspense } from 'react';
import {
  getTasks,
  getTodayEnergy,
  getLatestMomentum,
  getCategories,
  getProjects,
  getTodaysReport,
} from '@/lib/data-firestore';
import { MomentumCard } from '@/components/dashboard/momentum-card';
import { TaskList } from '@/components/dashboard/task-list';
import { Pomodoro } from '@/components/dashboard/pomodoro';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import { DailyReportCard } from '@/components/dashboard/daily-report-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useFirestore } from '@/firebase';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  React.useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || !user || !firestore) {
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

  const tasksData = getTasks(firestore, user.uid);
  const todayEnergyData = getTodayEnergy(firestore, user.uid);
  const latestMomentumData = getLatestMomentum(firestore, user.uid);
  const categoriesData = getCategories();
  const projectsData = getProjects(firestore, user.uid);
  const reportData = getTodaysReport(firestore, user.uid);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <PomodoroWrapper />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <TaskListWrapper
            tasksPromise={tasksData}
            categoriesPromise={categoriesData}
            projectsPromise={projectsData}
            todayEnergyPromise={todayEnergyData}
            userId={user.uid}
          />
        </Suspense>
      </div>
      
      <Suspense fallback={<Skeleton className="h-48" />}>
        <ProjectOverviewWrapper userId={user.uid} tasksPromise={tasksData} projectsPromise={projectsData} />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-48" />}>
        <DailyReportCardWrapper userId={user.uid} reportPromise={reportData} />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-64" />}>
        <MomentumCardWrapper
          userId={user.uid}
          latestMomentumPromise={latestMomentumData}
          todayEnergyPromise={todayEnergyData}
          tasksPromise={tasksData}
          projectsPromise={projectsData}
        />
      </Suspense>
    </div>
  );
}

async function PomodoroWrapper() {
  return <Pomodoro />;
}

async function TaskListWrapper({
  tasksPromise,
  categoriesPromise,
  projectsPromise,
  todayEnergyPromise,
  userId,
}: {
  tasksPromise: ReturnType<typeof getTasks>;
  categoriesPromise: ReturnType<typeof getCategories>;
  projectsPromise: ReturnType<typeof getProjects>;
  todayEnergyPromise: ReturnType<typeof getTodayEnergy>;
  userId: string;
}) {
  const [tasks, categories, projects, todayEnergy] = await Promise.all([
    tasksPromise,
    categoriesPromise,
    projectsPromise,
    todayEnergyPromise,
  ]);
  return (
    <TaskList
      initialTasks={tasks}
      categories={categories}
      projects={projects}
      todayEnergy={todayEnergy}
      userId={userId}
    />
  );
}

async function ProjectOverviewWrapper({
  tasksPromise,
  projectsPromise,
  userId,
}: {
  tasksPromise: ReturnType<typeof getTasks>;
  projectsPromise: ReturnType<typeof getProjects>;
  userId: string;
}) {
  const [tasks, projects] = await Promise.all([tasksPromise, projectsPromise]);
  return <ProjectOverview projects={projects} tasks={tasks} userId={userId} />;
}

async function DailyReportCardWrapper({
  reportPromise,
  userId,
}: {
  reportPromise: ReturnType<typeof getTodaysReport>;
  userId: string;
}) {
  const report = await reportPromise;
  return <DailyReportCard initialReport={report} userId={userId} />;
}

async function MomentumCardWrapper({
  latestMomentumPromise,
  todayEnergyPromise,
  tasksPromise,
  projectsPromise,
  userId,
}: {
  latestMomentumPromise: ReturnType<typeof getLatestMomentum>;
  todayEnergyPromise: ReturnType<typeof getTodayEnergy>;
  tasksPromise: ReturnType<typeof getTasks>;
  projectsPromise: ReturnType<typeof getProjects>;
  userId: string;
}) {
  const [latestMomentum, todayEnergy, tasks, projects] = await Promise.all([
    latestMomentumPromise,
    todayEnergyPromise,
    tasksPromise,
    projectsPromise,
  ]);
  return (
    <MomentumCard
      initialLatestMomentum={latestMomentum}
      initialTodayEnergy={todayEnergy}
      tasks={tasks}
      projects={projects}
      userId={userId}
    />
  );
}
