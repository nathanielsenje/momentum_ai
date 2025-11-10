'use server';

/**
 * @fileOverview Calculates a daily momentum score based on task-energy alignment.
 *
 * - calculateDailyMomentumScore - Calculates the daily momentum score.
 * - CalculateDailyMomentumScoreInput - The input type for calculateDailyMomentumScore.
 * - CalculateDailyMomentumScoreOutput - The return type for calculateDailyMomentumScore.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateDailyMomentumScoreInputSchema = z.object({
  energyLevel: z.enum(['Low', 'Medium', 'High']).describe('The user\'s reported energy level for the day.'),
  completedTasks: z.array(
    z.object({
      taskId: z.string().describe('The ID of the completed task.'),
      taskName: z.string().describe('The name of the completed task'),
      energyLevel: z.enum(['Low', 'Medium', 'High']).describe('The energy level associated with the task.'),
    })
  ).describe('An array of tasks completed on the given day, along with their associated energy levels.'),
  streakBonus: z.number().min(0).describe('Bonus to add for maintaining a score streak'),
});
export type CalculateDailyMomentumScoreInput = z.infer<typeof CalculateDailyMomentumScoreInputSchema>;

const CalculateDailyMomentumScoreOutputSchema = z.object({
  dailyScore: z.number().describe('The calculated daily momentum score.'),
  summary: z.string().describe('A summary of the user\'s task-energy alignment for the day.'),
});
export type CalculateDailyMomentumScoreOutput = z.infer<typeof CalculateDailyMomentumScoreOutputSchema>;

export async function calculateDailyMomentumScore(input: CalculateDailyMomentumScoreInput): Promise<CalculateDailyMomentumScoreOutput> {
  return calculateDailyMomentumScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateDailyMomentumScorePrompt',
  input: {schema: CalculateDailyMomentumScoreInputSchema},
  output: {schema: CalculateDailyMomentumScoreOutputSchema},
  prompt: `You are an AI assistant that analyzes a user's task completion data for the day and calculates a daily momentum score based on how well their completed tasks aligned with their reported energy levels. The score reflects how effectively the user is using their energy and identifies areas for improvement.

  Energy Level: {{{energyLevel}}}
  Completed Tasks: {{#each completedTasks}}- Task Id: {{taskId}}, Task Name: {{taskName}}, Energy Level: {{energyLevel}}{{/each}}

  Streak Bonus: {{{streakBonus}}}

  Consider how many tasks match the reported energy level and incorporate the streak bonus.  Provide a summary that provides encouragement and suggestions for improvement.
`,
});

const calculateDailyMomentumScoreFlow = ai.defineFlow(
  {
    name: 'calculateDailyMomentumScoreFlow',
    inputSchema: CalculateDailyMomentumScoreInputSchema,
    outputSchema: CalculateDailyMomentumScoreOutputSchema,
  },
  async input => {
    //Simple scoring logic, tasks completed at the right energy level are worth 100 points, tasks not at the right energy level are worth -50 points
    let score = 0;
    for (const task of input.completedTasks) {
      if (task.energyLevel === input.energyLevel) {
        score += 100;
      } else {
        score -= 50;
      }
    }

    score += input.streakBonus;

    const {output} = await prompt(input);
    return {
      ...output,
      dailyScore: score,
    };
  }
);
