'use server';

/**
 * @fileOverview Generates personalized recommendations for a TGN member.
 *
 * - generateRecommendations - A function that generates recommendations.
 * - GenerateRecommendationsInput - The input type.
 * - GenerateRecommendationsOutput - The output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateRecommendationsInputSchema, GenerateRecommendationsOutputSchema } from '@/app/schemas';

export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;
export type MatchmakingRecommendation = z.infer<typeof GenerateRecommendationsOutputSchema.shape.recommendations.element>;


export async function generateRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: { schema: GenerateRecommendationsInputSchema },
  output: { schema: GenerateRecommendationsOutputSchema },
  prompt: `You are a sophisticated matchmaking engine for the Transcend Global Network (TGN), a platform for mentorship and professional growth. Your task is to generate a short list of highly relevant, personalized recommendations for a member.

You must provide recommendations based on the member's profile, goals, and interests, matching them with the most suitable mentors, programs, products, events, and sectors available in the network.

Matching criteria:
- **Mentors**: Match based on shared sectors, location, and alignment between the member's purpose/goals and the mentor's expertise/purpose.
- **Programs**: Match based on how well the program description aligns with the member's stated purpose, goals, and interests.
- **Products**: Match based on relevance to the member's sectors, goals, and role. For example, a book on 'Leadership' for a 'mentor-candidate'.
- **Events**: Match based on topic relevance to member's sectors and interests, and geographical location if possible.
- **Sectors**: Recommend sectors if the member has few or no preferences, based on their purpose and role.

Analyze the following information:

MEMBER PROFILE:
- Role: {{{memberProfile.role}}}
- Location: {{{memberProfile.locationCountry}}}
- Stated Purpose/Bio: {{{memberProfile.purpose}}}
- Sector Preferences: {{#if memberProfile.sectorPreferences}}{{#each memberProfile.sectorPreferences}}{{{this}}}{{/each}}{{else}}None specified{{/if}}
- Identity Profile (Goals & Interests): {{{memberProfile.identityProfile}}}

AVAILABLE MENTORS (JSON):
{{{json allMentors}}}

AVAILABLE PROGRAMS (JSON):
{{{json allPrograms}}}

AVAILABLE PRODUCTS (JSON):
{{{json allProducts}}}

AVAILABLE EVENTS (JSON):
{{{json allEvents}}}

AVAILABLE SECTORS (JSON):
{{{json allSectors}}}


Based on your analysis, generate up to 5 diverse recommendations. For each recommendation, provide the type ('Mentor', 'Program', 'Product', 'Event', or 'Sector'), the ID of the recommended item, a match score from 0-100, and a concise, 1-2 sentence explanation of WHY it's a great match for this specific member. The recommendedId must be one of the IDs from the provided lists.
`,
});

const generateRecommendationsFlow = ai.defineFlow(
  {
    name: 'generateRecommendationsFlow',
    inputSchema: GenerateRecommendationsInputSchema,
    outputSchema: GenerateRecommendationsOutputSchema,
  },
  async (input) => {
    // Make sure we don't send too much data to the model.
    const limitedInput = {
        ...input,
        allMentors: input.allMentors.slice(0, 15),
        allPrograms: input.allPrograms.slice(0, 15),
        allProducts: input.allProducts.slice(0, 10),
        allEvents: input.allEvents.slice(0, 10),
    }
    const { output } = await prompt(limitedInput);
    return output!;
  }
);
