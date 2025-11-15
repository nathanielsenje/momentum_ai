
'use server';

import { revalidatePath } from 'next/cache';
import type { ScoreAndSuggestTasksInput } from '@/lib/types';
import { scoreAndSuggestTasks as scoreAndSuggestTasksFlow } from '@/ai/flows/suggest-tasks-based-on-energy';
import { updateUserProfile } from '@/lib/data-firestore';

// This function is called from a client-side data mutation, so it needs to revalidate paths
// and perform any server-side logic after a task is completed.
export async function onTaskCompleted(userId: string) {
    // Momentum score is now calculated on the client side.
    // This server action is now only responsible for revalidating paths.
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/reports');
    revalidatePath('/weekly-planner');
    revalidatePath('/profile');
}

export async function onClientWrite() {
    revalidatePath('/');
    revalidatePath('/projects');
    revalidatePath('/recurring');
    revalidatePath('/reports');
    revalidatePath('/weekly-planner');
    revalidatePath('/profile');
}

export async function updateUserProfileAction(userId: string, updates: { displayName: string }) {
  await updateUserProfile(userId, updates);
  revalidatePath('/profile');
  revalidatePath('/'); // To update name in sidebar etc.
}

export async function getSuggestedTasks(input: ScoreAndSuggestTasksInput) {
    return await scoreAndSuggestTasksFlow(input);
}
