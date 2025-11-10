import * as React from 'react';
import { Suspense } from 'react';
import {
  getTasks,
  getTodayEnergy,
  getLatestMomentum,
  getCategories,
  getProjects,
  getTodaysReport,
} from '@/lib/data';
import { MomentumCard } from '@/components/dashboard/momentum-card';
import { TaskList } from '@/components/dashboard/task-list';
import { Pomodoro } from '@/components/dashboard/pomodoro';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import { DailyReportCard } from '@/components/dashboard/daily-report-card';
import { Skeleton } from '@/components/ui/skeleton';

export default async function DashboardPage() {
  const tasksData = getTasks();
  const todayEnergyData = getTodayEnergy();
  const latestMomentumData = getLatestMomentum();
  const categoriesData = getCategories();
  const projectsData = getProjects();
  const reportData = getTodaysReport();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Suspense fallback={<Skeleton className="h-64" />}>
          <PomodoroWrapper />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-96" />}>
          <TaskListWrapper tasksPromise={tasksData} categoriesPromise={categoriesData} projectsPromise={projectsData} todayEnergyPromise={todayEnergyData} />
        </Suspense>
      </div>
      
      <Suspense fallback={<Skeleton className="h-48" />}>
        <ProjectOverviewWrapper tasksPromise={tasksData} projectsPromise={projectsData} />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-48" />}>
        <DailyReportCardWrapper reportPromise={reportData} />
      </Suspense>
      
      <Suspense fallback={<Skeleton className="h-64" />}>
        <MomentumCardWrapper latestMomentumPromise={latestMomentumData} todayEnergyPromise={todayEnergyData} tasksPromise={tasksData} projectsPromise={projectsData} />
      </Suspense>
    </div>
  );
}

async function PomodoroWrapper() {
  return <Pomodoro />;
}

async function TaskListWrapper({ tasksPromise, categoriesPromise, projectsPromise, todayEnergyPromise }: {
  tasksPromise: ReturnType<typeof getTasks>,
  categoriesPromise: ReturnType<typeof getCategories>,
  projectsPromise: ReturnType<typeof getProjects>,
  todayEnergyPromise: ReturnType<typeof getTodayEnergy>,
}) {
  const [tasks, categories, projects, todayEnergy] = await Promise.all([tasksPromise, categoriesPromise, projectsPromise, todayEnergyPromise]);
  return <TaskList initialTasks={tasks} categories={categories} projects={projects} todayEnergy={todayEnergy} />;
}

async function ProjectOverviewWrapper({ tasksPromise, projectsPromise }: {
  tasksPromise: ReturnType<typeof getTasks>,
  projectsPromise: ReturnType<typeof getProjects>,
}) {
  const [tasks, projects] = await Promise.all([tasksPromise, projectsPromise]);
  return <ProjectOverview projects={projects} tasks={tasks} />;
}

async function DailyReportCardWrapper({ reportPromise }: { reportPromise: ReturnType<typeof getTodaysReport> }) {
  const report = await reportPromise;
  return <DailyReportCard initialReport={report} />;
}

async function MomentumCardWrapper({ latestMomentumPromise, todayEnergyPromise, tasksPromise, projectsPromise }: {
  latestMomentumPromise: ReturnType<typeof getLatestMomentum>,
  todayEnergyPromise: ReturnType<typeof getTodayEnergy>,
  tasksPromise: ReturnType<typeof getTasks>,
  projectsPromise: ReturnType<typeof getProjects>,
}) {
  const [latestMomentum, todayEnergy, tasks, projects] = await Promise.all([latestMomentumPromise, todayEnergyPromise, tasksPromise, projectsPromise]);
  return <MomentumCard initialLatestMomentum={latestMomentum} initialTodayEnergy={todayEnergy} tasks={tasks} projects={projects} />;
}
