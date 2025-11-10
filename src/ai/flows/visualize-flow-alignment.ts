'use server';

/**
 * @fileOverview Generates visualizations of the user's task-energy alignment over time.
 *
 * - visualizeFlowAlignment - A function that generates visualizations of the user's task-energy alignment over time.
 * - VisualizeFlowAlignmentInput - The input type for the visualizeFlowAlignment function.
 * - VisualizeFlowAlignmentOutput - The return type for the visualizeFlowAlignment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeFlowAlignmentInputSchema = z.object({
  taskData: z
    .string()
    .describe(
      'A stringified JSON array containing task data, including task name, energy level association, and completion status.'
    ),
  energyRatingData: z
    .string()
    .describe(
      'A stringified JSON array containing energy rating data, including date and energy level (Low, Medium, High).'
    ),
});
export type VisualizeFlowAlignmentInput = z.infer<typeof VisualizeFlowAlignmentInputSchema>;

const VisualizeFlowAlignmentOutputSchema = z.object({
  visualizationUri: z
    .string()
    .describe(
      'A data URI containing a visualization (chart or graph) of the user\u2019s task-energy alignment over time. The data URI must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected description
    ),
  report: z
    .string()
    .describe(
      'A textual report summarizing the user\u2019s task-energy alignment, identifying patterns and insights.'
    ),
});

export type VisualizeFlowAlignmentOutput = z.infer<typeof VisualizeFlowAlignmentOutputSchema>;

export async function visualizeFlowAlignment(
  input: VisualizeFlowAlignmentInput
): Promise<VisualizeFlowAlignmentOutput> {
  return visualizeFlowAlignmentFlow(input);
}

const visualizeFlowAlignmentPrompt = ai.definePrompt({
  name: 'visualizeFlowAlignmentPrompt',
  input: {schema: VisualizeFlowAlignmentInputSchema},
  output: {schema: VisualizeFlowAlignmentOutputSchema},
  prompt: `You are an AI assistant specialized in generating visualizations and reports for user task-energy alignment.

  Analyze the provided task data and energy rating data to create a visualization (chart or graph) showing the user's alignment over time.
  The visualization should clearly represent task completion in relation to the user's energy levels.

  Also, generate a concise report summarizing the user's alignment, highlighting any patterns or insights.

  Task Data: {{{taskData}}}
  Energy Rating Data: {{{energyRatingData}}}

  Return the visualization as a data URI and the report as a text string.
`,
});

const visualizeFlowAlignmentFlow = ai.defineFlow(
  {
    name: 'visualizeFlowAlignmentFlow',
    inputSchema: VisualizeFlowAlignmentInputSchema,
    outputSchema: VisualizeFlowAlignmentOutputSchema,
  },
  async input => {
    const {output} = await visualizeFlowAlignmentPrompt(input);
    return output!;
  }
);
