'use server';
/**
 * @fileOverview This file defines a function for suggesting tasks based on the user's self-reported energy level.
 *
 * It exports:
 * - `scoreAndSuggestTasks`: An async function to generate task suggestions based on energy level and other factors.
 */

import { Project, Task, ScoreAndSuggestTasksInput } from '@/lib/types';
import { getDay } from 'date-fns';

export async function scoreAndSuggestTasks(
  {tasks, projects, energyLevel, completedTasks}: ScoreAndSuggestTasksInput
) {
    const relevantCompletedTasks = completedTasks.filter(task => task.energyLevel === energyLevel);
    

    const scoredTasks = tasks
        .filter(task => !task.completed)
        .map(task => {
            const energyMatch = task.energyLevel === energyLevel ? 1 : 0;

            let urgency = 0;
            if (task.deadline) {
                const deadline = new Date(task.deadline);
                const today = new Date();
                const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays <= 1) urgency = 1;
                else if (diffDays <= 3) urgency = 0.7;
                else if (diffDays <= 7) urgency = 0.4;
                else urgency = 0.1;
            }

            const project = projects.find(p => p.id === task.projectId);
            const projectPriority = project?.priority === 'High' ? 1 : (project?.priority === 'Medium' ? 0.5 : 0.1);
            
            const adaptiveBonus = 0; // Placeholder for future adaptive logic

            const score = (energyMatch * 0.5) + (urgency * 0.3) + (projectPriority * 0.2) + adaptiveBonus;

            return {...task, score};
        });

    const sortedTasks = scoredTasks.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Check for routine patterns
    let routineSuggestion: string | undefined = undefined;
    const today = new Date();
    const dayOfWeek = getDay(today); // Sunday = 0, Monday = 1, etc.
    if (dayOfWeek === 1) { // It's Monday
        const planningTasks = tasks.filter(t => t.name.toLowerCase().includes('plan') && t.name.toLowerCase().includes('week'));
        if (planningTasks.length === 0) {
            routineSuggestion = "It's the start of the week. How about adding a 'Weekly Planning' task to set your goals?";
        }
    }


    return {
        suggestedTasks: sortedTasks.slice(0, 3), // Return top 3 suggestions
        routineSuggestion
    }
}
