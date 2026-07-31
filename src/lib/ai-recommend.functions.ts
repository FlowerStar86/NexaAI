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
  roadmap: { step: string; detail: string; duration: string }[];
  firstProject: string;
};

export type AiRecommendResult = {
  summary: string;
  advice: string;
  careers: AiCareerRecommendation[];
  agent_outputs?: {
    career_recommendations?: string;
    skill_gap?: string;
    cv_analysis?: string;
    job_readiness?: string;
    learning_roadmap?: string[];
    next_steps?: string[];
  };
};

export async function fetchCareerFromAgents(data: unknown): Promise<AiRecommendResult> {
  const parsed = ProfileSchema.parse(data);
  const response = await fetch("http://127.0.0.1:5000/career", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed),
  });

  if (!response.ok) {
    throw new Error(`Python Backend Agent API failed with status ${response.status}`);
  }

  return (await response.json()) as AiRecommendResult;
}

export const recommendWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ProfileSchema.parse(input))
  .handler(async ({ data }): Promise<AiRecommendResult> => {
    return await fetchCareerFromAgents(data);
  });
