
"use server";

import { generateMatchExplanation } from "@/ai/flows/mentor-mentee-match-explanations";
import { generateRecommendations, type MatchmakingRecommendation as AIMatchmakingRecommendation } from "@/ai/flows/generate-recommendations";
import { generateProfileBasedRecommendations } from "./profile-recommendations";
import { z } from "zod";
import type { TGNMember, Program, Product, Event, Sector } from '@/lib/types';
import { GenerateRecommendationsInputSchema } from "./schemas";


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
    tgnMemberId?: string;
};

export type RecommendationResult = {
    recommendations: RecommendationDetails[];
};

export async function getRecommendations(
  member: TGNMember, 
  allMembers: TGNMember[], 
  allPrograms: Program[],
  allProducts: Product[],
  allEvents: Event[],
  allSectors: Sector[],
): Promise<RecommendationResult | { error: string }> {
  
  // First, try to use AI-powered recommendations
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
        name: p.name,
        description: p.description,
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
    // Fall back to profile-based recommendations
    const profileRecs = generateProfileBasedRecommendations(
      member,
      allMembers,
      allPrograms,
      allProducts,
      allEvents,
      allSectors
    );
    return { recommendations: profileRecs };
  }

  try {
    const result = await generateRecommendations(validatedInput.data);
    
    // Enrich recommendations with details for display
    const recommendationDetails = result.recommendations.map(rec => {
        let name = 'Unknown';
        let id = rec.recommendedId;
        let tgnMemberId: string | undefined;
        
        if (rec.recommendedType === 'Mentor') {
            const mentor = allMembers.find(m => m.id === id);
            name =
              mentor?.name ??
              mentor?.email?.split('@')[0] ??
              'Unknown Mentor';
            tgnMemberId = mentor?.tgnMemberId;
        } else if (rec.recommendedType === 'Program') {
            const program = allPrograms.find(p => p.id === id);
            name = program?.title ?? 'Unknown Program';
        } else if (rec.recommendedType === 'Product') {
            const product = allProducts.find(p => p.id === id);
            name = product?.name ?? 'Unknown Product';
        } else if (rec.recommendedType === 'Event') {
            const event = allEvents.find(e => e.id === id);
            name = event?.name ?? 'Unknown Event';
        } else if (rec.recommendedType === 'Sector') {
            const sector = allSectors.find(s => s.id === id);
            name = sector?.name ?? 'Unknown Sector';
        }

        return { ...rec, id, name, tgnMemberId };
    }).filter(Boolean) as RecommendationDetails[];

    return { recommendations: recommendationDetails };

  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    console.info("Falling back to profile-based recommendations...");
    
    // Fall back to profile-based recommendations when AI fails
    try {
      const profileRecs = generateProfileBasedRecommendations(
        member,
        allMembers,
        allPrograms,
        allProducts,
        allEvents,
        allSectors
      );
      return { recommendations: profileRecs };
    } catch (fallbackError) {
      console.error("Error generating profile-based recommendations:", fallbackError);
      return { error: "Unable to generate recommendations at this time. Please try again later." };
    }
  }
}
