'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting tasks based on the user's self-reported energy level.
 *
 * It exports:
 * - `suggestTasksBasedOnEnergy`: An async function to generate task suggestions based on energy level.
 * - `SuggestTasksBasedOnEnergyInput`: The TypeScript type for the input schema.
 * - `SuggestTasksBasedOnEnergyOutput`: The TypeScript type for the output schema.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksBasedOnEnergyInputSchema = z.object({
  energyLevel: z
    .enum(['low', 'medium', 'high'])
    .describe('The user selected energy level (low, medium or high).'),
  taskCategories: z
    .string()
    .describe("A comma separated list of task categories that the user can filter on. Example: 'Work, Personal, Errands'"),
  taskList: z
    .string()
    .describe("A comma separated list of tasks that can be performed. Example: 'Write report, Do laundry, Go shopping'"),
});
export type SuggestTasksBasedOnEnergyInput = z.infer<typeof SuggestTasksBasedOnEnergyInputSchema>;

const SuggestTasksBasedOnEnergyOutputSchema = z.object({
  suggestedTasks: z
    .string()
    .describe(
      'A comma-separated list of tasks that are most appropriate for the given energy level, task categories and task list.'
    ),
});
export type SuggestTasksBasedOnEnergyOutput = z.infer<typeof SuggestTasksBasedOnEnergyOutputSchema>;

export async function suggestTasksBasedOnEnergy(
  input: SuggestTasksBasedOnEnergyInput
): Promise<SuggestTasksBasedOnEnergyOutput> {
  return suggestTasksBasedOnEnergyFlow(input);
}

const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksBasedOnEnergyInputSchema},
  output: {schema: SuggestTasksBasedOnEnergyOutputSchema},
  prompt: `You are an AI assistant designed to suggest tasks based on the user's energy level.

You will receive an energy level (low, medium, or high), a list of task categories, and a list of tasks.

Based on the user's energy level, select the tasks that are most appropriate for them.

Consider these guidelines:

- **Low Energy:** Suggest tasks that require minimal effort and concentration, such as simple chores, administrative tasks, or relaxing activities.
- **Medium Energy:** Suggest tasks that require a moderate amount of effort and concentration, such as focused work, creative projects, or social activities.
- **High Energy:** Suggest tasks that require significant effort and concentration, such as challenging projects, physical activities, or complex problem-solving.

Energy Level: {{{energyLevel}}}
Task Categories: {{{taskCategories}}}
Task List: {{{taskList}}}

Suggested Tasks:`,
});

const suggestTasksBasedOnEnergyFlow = ai.defineFlow(
  {
    name: 'suggestTasksBasedOnEnergyFlow',
    inputSchema: SuggestTasksBasedOnEnergyInputSchema,
    outputSchema: SuggestTasksBasedOnEnergyOutputSchema,
  },
  async input => {
    const {output} = await suggestTasksPrompt(input);
    return output!;
  }
);
