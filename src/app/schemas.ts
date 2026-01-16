'use server';

import { z } from 'zod';

export const MemberProfileSchema = z.object({
  locationCountry: z.string().optional(),
  role: z.string(),
  purpose: z.string().optional(),
  identityProfile: z.string().optional(),
  sectorPreferences: z.array(z.string()).optional(),
});

export const MentorInfoSchema = z.object({
  id: z.string(),
  sectorPreferences: z.array(z.string()).optional(),
  role: z.string(),
  purpose: z.string().optional(),
});

export const ProgramInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

export const ProductInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  type: z.string(),
});

export const EventInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const SectorInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const GenerateRecommendationsInputSchema = z.object({
  memberProfile: MemberProfileSchema,
  allMentors: z.array(MentorInfoSchema),
  allPrograms: z.array(ProgramInfoSchema),
  allProducts: z.array(ProductInfoSchema),
  allEvents: z.array(EventInfoSchema),
  allSectors: z.array(SectorInfoSchema),
});

export const MatchmakingRecommendationSchema = z.object({
  recommendedType: z.enum(['Mentor', 'Program', 'Product', 'Event', 'Sector']),
  recommendedId: z.string().describe('The ID of the recommended item.'),
  explanation: z
    .string()
    .describe(
      'A concise, personalized explanation for why this is a good match for the member.'
    ),
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe('A percentage score representing the quality of the match.'),
});

export const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(MatchmakingRecommendationSchema)
    .max(5, { message: 'Generate no more than 5 recommendations.' }),
});
