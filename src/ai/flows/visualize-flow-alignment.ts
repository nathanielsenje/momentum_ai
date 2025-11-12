'use server';

/**
 * @fileOverview Visualizes task-energy alignment over time.
 *
 * - visualizeFlowAlignment - Generates a chart visualization and summary.
 * - VisualizeFlowAlignmentInput - Input type.
 * - VisualizeFlowAlignmentOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Task, EnergyLog } from '@/lib/types';


const VisualizeFlowAlignmentInputSchema = z.object({
  tasks: z.array(z.custom<Task>()).describe('An array of all tasks completed by the user.'),
  energyLog: z.array(z.custom<EnergyLog>()).describe('A log of the user\'s self-reported energy levels over time.'),
});
export type VisualizeFlowAlignmentInput = z.infer<typeof VisualizeFlowAlignmentInputSchema>;


const VisualizeFlowAlignmentOutputSchema = z.object({
  report: z.string().describe('A textual summary and interpretation of the user\'s flow alignment.'),
});
export type VisualizeFlowAlignmentOutput = z.infer<typeof VisualizeFlowAlignmentOutputSchema>;


export async function visualizeFlowAlignment(input: VisualizeFlowAlignmentInput): Promise<VisualizeFlowAlignmentOutput> {
  return visualizeFlowAlignmentFlow(input);
}

const prompt = ai.definePrompt({
    name: 'visualizeFlowAlignmentPrompt',
    input: { schema: VisualizeFlowAlignmentInputSchema },
    output: { schema: z.object({ report: VisualizeFlowAlignmentOutputSchema.shape.report }) },
    prompt: `You are a productivity coach AI. Your goal is to help users understand their 'flow state' by analyzing how well their completed tasks align with their self-reported energy levels over time.
    
    Analyze the provided data which includes completed tasks (with their required energy level) and a daily log of the user's energy.
    
    Generate a concise report with the following sections:
    1.  **Overall Alignment**: Give a percentage or a qualitative score (e.g., "Good," "Needs Improvement").
    2.  **Positive Patterns**: Identify days or periods where the user successfully matched high-energy tasks with high-energy days (or low with low) and praise them for it.
    3.  **Areas for Improvement**: Point out instances of mismatch (e.g., tackling a high-energy task on a low-energy day) and gently suggest how they could optimize their task selection in the future.
    4.  **Actionable Tip**: Provide one simple, actionable tip to help them improve their task-energy alignment.
    
    Keep the tone encouraging and supportive.
    
    Here is the data:
    - User's Energy Log: {{#each energyLog}}Date: {{date}}, Level: {{level}}; {{/each}}
    - Completed Tasks: {{#each tasks}}Task: {{name}}, Required Energy: {{energyLevel}}, Completed At: {{completedAt}}; {{/each}}
    `,
});

const visualizeFlowAlignmentFlow = ai.defineFlow(
  {
    name: 'visualizeFlowAlignmentFlow',
    inputSchema: VisualizeFlowAlignmentInputSchema,
    outputSchema: VisualizeFlowAlignmentOutputSchema,
  },
  async (input) => {
    // Generate textual report based on the data
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate report.");
    }

    return {
      report: output.report,
    };
  }
);
