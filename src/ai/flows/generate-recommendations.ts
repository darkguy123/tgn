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

const MemberProfileSchema = z.object({
  sectorPreferences: z.array(z.string()).optional(),
  role: z.string(),
  purpose: z.string().optional(),
  identityProfile: z.string().optional(), // JSON string with goals and interests
});

const MentorInfoSchema = z.object({
  id: z.string(),
  // Name is not available, using ID as identifier
  sectorPreferences: z.array(z.string()).optional(),
  role: z.string(),
  purpose: z.string().optional(),
});

const ProgramInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const GenerateRecommendationsInputSchema = z.object({
  memberProfile: MemberProfileSchema,
  allMentors: z.array(MentorInfoSchema),
  allPrograms: z.array(ProgramInfoSchema),
});
export type GenerateRecommendationsInput = z.infer<typeof GenerateRecommendationsInputSchema>;

const MatchmakingRecommendationSchema = z.object({
  recommendedType: z.enum(["Mentor", "Program"]),
  recommendedId: z.string().describe("The ID of the recommended item."),
  explanation: z.string().describe("A concise, personalized explanation for why this is a good match for the member."),
  matchScore: z.number().min(0).max(100).describe("A percentage score representing the quality of the match."),
});
export type MatchmakingRecommendation = z.infer<typeof MatchmakingRecommendationSchema>;


const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z.array(MatchmakingRecommendationSchema).max(3, { message: "Generate no more than 3 recommendations."}),
});
export type GenerateRecommendationsOutput = z.infer<typeof GenerateRecommendationsOutputSchema>;

export async function generateRecommendations(input: GenerateRecommendationsInput): Promise<GenerateRecommendationsOutput> {
  return generateRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecommendationsPrompt',
  input: { schema: GenerateRecommendationsInputSchema },
  output: { schema: GenerateRecommendationsOutputSchema },
  prompt: `You are a sophisticated matchmaking engine for the Transcend Global Network (TGN), a platform for mentorship and professional growth. Your task is to generate a short list of highly relevant, personalized recommendations for a member.

You must provide recommendations based on the member's profile, goals, and interests, matching them with the most suitable mentors and programs available in the network.

Matching criteria:
- **Mentors**: Match based on shared sectors, and alignment between the member's purpose/goals and the mentor's expertise/purpose.
- **Programs**: Match based on how well the program description aligns with the member's stated purpose, goals, and interests.

Analyze the following information:

MEMBER PROFILE:
- Role: {{{memberProfile.role}}}
- Stated Purpose/Bio: {{{memberProfile.purpose}}}
- Sector Preferences: {{#if memberProfile.sectorPreferences}}{{#each memberProfile.sectorPreferences}}{{{this}}}{{/each}}{{else}}None specified{{/if}}
- Identity Profile (Goals & Interests): {{{memberProfile.identityProfile}}}

AVAILABLE MENTORS (JSON array of objects with id, role, purpose, sectorPreferences):
{{{json allMentors}}}

AVAILABLE PROGRAMS (JSON array of objects with id, title, description):
{{{json allPrograms}}}


Based on your analysis, generate exactly 3 diverse recommendations. For each recommendation, provide the type ('Mentor' or 'Program'), the ID of the recommended item, a match score from 0-100, and a concise, 1-2 sentence explanation of WHY it's a great match for this specific member. The recommendedId must be one of the IDs from the provided mentor or program lists.
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
        allMentors: input.allMentors.slice(0, 20), // Limit to 20 mentors
        allPrograms: input.allPrograms.slice(0, 20), // Limit to 20 programs
    }
    const { output } = await prompt(limitedInput);
    return output!;
  }
);
