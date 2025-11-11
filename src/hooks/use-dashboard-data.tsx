
'use client';

import * as React from 'react';
import {
  getTasks,
  getTodayEnergy,
  getLatestMomentum,
  getCategories,
  getProjects,
  getTodaysReport,
} from '@/lib/data-firestore';
import { useUser, useFirestore } from '@/firebase';
import type { Task, Category, Project, DailyReport, EnergyLog, MomentumScore } from '@/lib/types';

interface DashboardDataContextType {
  tasks: Task[];
  projects: Project[];
  categories: Category[];
  todayEnergy?: EnergyLog;
  latestMomentum?: MomentumScore;
  todaysReport: DailyReport | null;
  loading: boolean;
  error: Error | null;
}

const DashboardDataContext = React.createContext<DashboardDataContextType | undefined>(undefined);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [todayEnergy, setTodayEnergy] = React.useState<EnergyLog | undefined>(undefined);
  const [latestMomentum, setLatestMomentum] = React.useState<MomentumScore | undefined>(undefined);
  const [todaysReport, setTodaysReport] = React.useState<DailyReport | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      Promise.all([
        getTasks(firestore, user.uid),
        getProjects(firestore, user.uid),
        getCategories(),
        getTodayEnergy(firestore, user.uid),
        getLatestMomentum(firestore, user.uid),
        getTodaysReport(firestore, user.uid),
      ]).then(([tasks, projects, categories, todayEnergy, latestMomentum, report]) => {
        setTasks(tasks);
        setProjects(projects);
        setCategories(categories);
        setTodayEnergy(todayEnergy);
        setLatestMomentum(latestMomentum);
        setTodaysReport(report);
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching dashboard data:", error);
        setError(error);
        setLoading(false);
      });
    }
  }, [user, firestore]);

  const value = {
    tasks,
    projects,
    categories,
    todayEnergy,
    latestMomentum,
    todaysReport,
    loading,
    error,
  };

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = React.useContext(DashboardDataContext);
  if (context === undefined) {
    throw new Error('useDashboardData must be used within a DashboardDataProvider');
  }
  return context;
}
