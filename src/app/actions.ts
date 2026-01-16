
"use server";

import { generateMatchExplanation } from "@/ai/flows/mentor-mentee-match-explanations";
import { generateRecommendations, type MatchmakingRecommendation as AIMatchmakingRecommendation } from "@/ai/flows/generate-recommendations";
import { z } from "zod";
import type { TGNMember, Program, Product, Event, Sector } from '@/lib/types';


const explanationState = z.object({
  explanation: z.string().optional(),
  error: z.string().optional(),
});

type ExplanationState = z.infer<typeof explanationState>;

const explanationSchema = z.object({
  memberProfile: z.string(),
  mentorProfile: z.string(),
});

export async function getMatchExplanation(
  prevState: ExplanationState,
  formData: FormData
): Promise<ExplanationState> {
  const validatedFields = explanationSchema.safeParse({
    memberProfile: formData.get("memberProfile"),
    mentorProfile: formData.get("mentorProfile"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid input.",
    };
  }

  try {
    const result = await generateMatchExplanation({
      memberProfile: validatedFields.data.memberProfile,
      mentorProfile: validatedFields.data.mentorProfile,
      matchingCriteria:
        "Shared industry (Technology), complementary skill sets (Mentee: AI/ML, Mentor: Product Management), and alignment in goals (Mentee seeking career path guidance, Mentor passionate about helping early-stage professionals).",
    });

    if (result.explanation) {
      return { explanation: result.explanation };
    } else {
      return { error: "Failed to generate an explanation." };
    }
  } catch (error) {
    console.error(error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

export type RecommendationDetails = AIMatchmakingRecommendation & {
    id: string;
    name: string;
};

export type RecommendationResult = {
    recommendations: RecommendationDetails[];
};

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


const MatchmakingRecommendationSchema = z.object({
  recommendedType: z.enum(["Mentor", "Program", "Product", "Event", "Sector"]),
  recommendedId: z.string().describe("The ID of the recommended item."),
  explanation: z.string().describe("A concise, personalized explanation for why this is a good match for the member."),
  matchScore: z.number().min(0).max(100).describe("A percentage score representing the quality of the match."),
});

export const GenerateRecommendationsOutputSchema = z.object({
  recommendations: z.array(MatchmakingRecommendationSchema).max(5, { message: "Generate no more than 5 recommendations."}),
});


export async function getRecommendations(
  member: TGNMember, 
  allMembers: TGNMember[], 
  allPrograms: Program[],
  allProducts: Product[],
  allEvents: Event[],
  allSectors: Sector[],
): Promise<RecommendationResult | { error: string }> {
  
  const input = {
    memberProfile: {
      role: member.role,
      purpose: member.purpose,
      sectorPreferences: member.sectorPreferences,
      identityProfile: member.identityProfile,
      locationCountry: member.locationCountry,
    },
    allMentors: allMembers.filter(m => m.role.includes('mentor')).map(m => ({
        id: m.id,
        role: m.role,
        purpose: m.purpose,
        sectorPreferences: m.sectorPreferences,
    })),
    allPrograms: allPrograms.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
    })),
    allProducts: allProducts.map(p => ({
        id: p.id,
        title: p.title,
        author: p.author,
        type: p.type,
    })),
    allEvents: allEvents.map(e => ({
        id: e.id,
        name: e.name,
        description: e.description,
    })),
    allSectors: allSectors.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
    })),
  };

  const validatedInput = GenerateRecommendationsInputSchema.safeParse(input);

  if (!validatedInput.success) {
    console.error("Invalid input for generateRecommendations:", validatedInput.error.format());
    return { error: "Invalid input for recommendations." };
  }

  try {
    const result = await generateRecommendations(validatedInput.data);
    
    // Enrich recommendations with details for display
    const recommendationDetails = result.recommendations.map(rec => {
        let name = 'Unknown';
        let id = rec.recommendedId;
        
        if (rec.recommendedType === 'Mentor') {
            const mentor = allMembers.find(m => m.id === id);
            name = mentor?.email ?? 'Unknown Mentor';
        } else if (rec.recommendedType === 'Program') {
            const program = allPrograms.find(p => p.id === id);
            name = program?.title ?? 'Unknown Program';
        } else if (rec.recommendedType === 'Product') {
            const product = allProducts.find(p => p.id === id);
            name = product?.title ?? 'Unknown Product';
        } else if (rec.recommendedType === 'Event') {
            const event = allEvents.find(e => e.id === id);
            name = event?.name ?? 'Unknown Event';
        } else if (rec.recommendedType === 'Sector') {
            const sector = allSectors.find(s => s.id === id);
            name = sector?.name ?? 'Unknown Sector';
        }

        return { ...rec, id, name };
    }).filter(Boolean) as RecommendationDetails[];


    return { recommendations: recommendationDetails };

  } catch (error) {
    console.error("Error generating recommendations:", error);
    return { error: "Failed to generate recommendations." };
  }
}
