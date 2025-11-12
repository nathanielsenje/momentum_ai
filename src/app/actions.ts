'use server';

import { revalidatePath } from 'next/cache';
import {
  getTasks,
  addProject,
  getProjects,
  updateProject,
  deleteProject,
  addRecurringTask,
  getRecurringTasks,
  updateTodaysReport,
  updateUserProfile,
  getTodaysReport,
  getEnergyLog,
  getLatestMomentum,
  setTodayEnergy,
  saveMomentumScore,
  deleteTask,
} from '@/lib/data-firestore-server';
import type { EnergyLevel, Project, RecurringTask, Task, ScoreAndSuggestTasksInput, DailyReport } from '@/lib/types';
import { scoreAndSuggestTasks as scoreAndSuggestTasksFlow } from '@/ai/flows/suggest-tasks-based-on-energy';
import { visualizeFlowAlignment } from '@/ai/flows/visualize-flow-alignment';
import { getDb } from '@/firebase/server-init';

// This function is called from a client-side data mutation, so it needs to revalidate paths
// and perform any server-side logic after a task is completed.
export async function onTaskCompleted(userId: string) {
    // Momentum score is now calculated on the client side.
    // This server action is now only responsible for revalidating paths.
    revalidatePath('/');
    revalidatePath('/analytics');
    revalidatePath('/projects');
    revalidatePath('/reports');
    revalidatePath('/weekly-planner');
}

export type ScoreAndSuggestTasksOutput = Awaited<ReturnType<typeof getSuggestedTasks>>;
export async function getSuggestedTasks(input: ScoreAndSuggestTasksInput) {
  const suggestions = await scoreAndSuggestTasksFlow(input);
  return suggestions;
}

export async function getFlowAlignmentReport(userId: string) {
    const db = getDb();
    const [taskData, energyRatingData] = await Promise.all([
        getTasks(db, userId),
        getEnergyLog(db, userId),
    ]);

    const result = await visualizeFlowAlignment({
        taskData: JSON.stringify(taskData),
        energyRatingData: JSON.stringify(energyRatingData),
    });

    return result;
}


export async function onClientWrite() {
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/recurring');
    revalidatePath('/reports');
    revalidatePath('/weekly-planner');
}

export async function updateReportAction(userId: string, updates: Partial<DailyReport>) {
  const updatedReport = await updateTodaysReport(getDb(), userId, updates);
  revalidatePath('/');
  revalidatePath('/reports');
  return updatedReport;
}

export async function updateUserProfileAction(userId: string, updates: { displayName: string }) {
  const db = getDb();
  await updateUserProfile(db, userId, updates);
  revalidatePath('/profile');
  revalidatePath('/'); // To update name in sidebar etc.
}
