import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ProfileSchema = z.object({
  education: z.string(),
  field: z.string(),
  skillLevel: z.string(),
  skills: z.array(z.string()),
  experience: z.string(),
  goals: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export type AiCareerRecommendation = {
  role: string;
  match: number;
  category: string;
  why: string;
  currentStrengths: string[];
  skillsToLearn: string[];
  roadmap: {
    step: string;
    detail: string;
    duration: string;
  }[];
  firstProject: string;
};

export type AiRecommendResult = {
  summary: string;
  advice: string;
  careers: AiCareerRecommendation[];
};

export const recommendWithAi = createServerFn({ method: "POST" })
  .validator((input: unknown) => ProfileSchema.parse(input))
  .handler(async ({ data }): Promise<AiRecommendResult> => {
    const response = await fetch("http://127.0.0.1:5000/career", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Agent API failed: ${response.status}`);
    }

    const result = await response.json();

    return result as AiRecommendResult;
  });