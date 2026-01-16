
"use server";

import { generateMatchExplanation } from "@/ai/flows/mentor-mentee-match-explanations";
import { generateRecommendations, type GenerateRecommendationsOutput, type MatchmakingRecommendation as AIMatchmakingRecommendation } from "@/ai/flows/generate-recommendations";
import { z } from "zod";
import { TGNMember, Program } from '@/lib/types';


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
    type: "Mentor" | "Program" | "Community";
};

export type RecommendationResult = {
    recommendations: RecommendationDetails[];
};

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


export async function getRecommendations(
  member: TGNMember, 
  allMembers: TGNMember[], 
  allPrograms: Program[]
): Promise<RecommendationResult | { error: string }> {
  
  const input = {
    memberProfile: {
      role: member.role,
      purpose: member.purpose,
      sectorPreferences: member.sectorPreferences,
      identityProfile: member.identityProfile,
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
        if (rec.recommendedType === 'Mentor') {
            const mentor = allMembers.find(m => m.id === rec.recommendedId);
            return {
                id: rec.recommendedId,
                name: mentor?.email ?? 'Unknown Mentor', // Using email as name
                type: rec.recommendedType,
                ...rec
            };
        }
        if (rec.recommendedType === 'Program') {
            const program = allPrograms.find(p => p.id === rec.recommendedId);
            return {
                id: rec.recommendedId,
                name: program?.title ?? 'Unknown Program',
                type: rec.recommendedType,
                ...rec
            };
        }
        return null;
    }).filter(Boolean) as RecommendationDetails[];


    return { recommendations: recommendationDetails };

  } catch (error) {
    console.error("Error generating recommendations:", error);
    return { error: "Failed to generate recommendations." };
  }
}
