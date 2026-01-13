'use server';

/**
 * @fileOverview Generates explanations for mentor-mentee matches made by the matchmaking engine.
 *
 * - generateMatchExplanation - A function that generates the explanation for a given match.
 * - MatchExplanationInput - The input type for the generateMatchExplanation function.
 * - MatchExplanationOutput - The return type for the generateMatchExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchExplanationInputSchema = z.object({
  memberProfile: z.string().describe('The profile information of the member.'),
  mentorProfile: z.string().describe('The profile information of the mentor.'),
  matchingCriteria: z.string().describe('The criteria used by the matchmaking engine.'),
});
export type MatchExplanationInput = z.infer<typeof MatchExplanationInputSchema>;

const MatchExplanationOutputSchema = z.object({
  explanation: z.string().describe('The explanation for why the member and mentor were matched.'),
});
export type MatchExplanationOutput = z.infer<typeof MatchExplanationOutputSchema>;

export async function generateMatchExplanation(input: MatchExplanationInput): Promise<MatchExplanationOutput> {
  return matchExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'matchExplanationPrompt',
  input: {schema: MatchExplanationInputSchema},
  output: {schema: MatchExplanationOutputSchema},
  prompt: `You are an expert matchmaker, skilled at explaining why two people are a good fit.

  Given the following information about a member and a potential mentor, explain why they were matched based on the matching criteria.

  Member Profile: {{{memberProfile}}}
  Mentor Profile: {{{mentorProfile}}}
  Matching Criteria: {{{matchingCriteria}}}

  Provide a clear and concise explanation of the match.
  `,
});

const matchExplanationFlow = ai.defineFlow(
  {
    name: 'matchExplanationFlow',
    inputSchema: MatchExplanationInputSchema,
    outputSchema: MatchExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
