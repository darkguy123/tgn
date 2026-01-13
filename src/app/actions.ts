"use server";

import { generateMatchExplanation } from "@/ai/flows/mentor-mentee-match-explanations";
import { z } from "zod";

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
