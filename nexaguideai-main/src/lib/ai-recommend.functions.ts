import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

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
};

const RecSchema = z.object({
  summary: z.string().describe("2-3 sentence recap of who this user is, in second person."),
  advice: z.string().describe("Personalized encouraging paragraph of practical advice tailored to the user's strengths, weaknesses and goals."),
  careers: z.array(
    z.object({
      role: z.string(),
      match: z.number().describe("Match percentage 0-100."),
      category: z.string().describe("Industry / category like Technology, Healthcare, Finance, Creative, Business, Education."),
      why: z.string().describe("2-3 sentences explaining why this specific user fits this role."),
      currentStrengths: z.array(z.string()).describe("3-5 things the user already has going for this role."),
      skillsToLearn: z.array(z.string()).describe("4-7 specific skills or tools they still need."),
      roadmap: z.array(
        z.object({
          step: z.string().describe("Short step title."),
          detail: z.string().describe("What to do in this step, beginner-friendly."),
          duration: z.string().describe("Estimated time, e.g. '2 weeks', '1 month'."),
        }),
      ).describe("5-7 step beginner-friendly learning roadmap."),
      firstProject: z.string().describe("One concrete first project or practical experience they can start now."),
    }),
  ).describe("Exactly 3 career recommendations, ordered best fit first."),
});

export const recommendWithAi = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ProfileSchema.parse(input))
  .handler(async ({ data }): Promise<AiRecommendResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });
    const model = gateway("openai/gpt-5.5");

    const profileText = [
      `Education: ${data.education || "not specified"}`,
      `Field of interest: ${data.field || "not specified"}`,
      `Current skill level: ${data.skillLevel || "not specified"}`,
      `Skills: ${data.skills.length ? data.skills.join(", ") : "none listed"}`,
      `Experience: ${data.experience || "not specified"}`,
      `Career goals: ${data.goals.length ? data.goals.join(", ") : "none listed"}`,
      `Strengths: ${data.strengths.length ? data.strengths.join(", ") : "none listed"}`,
      `Areas they struggle with: ${data.weaknesses.length ? data.weaknesses.join(", ") : "none listed"}`,
    ].join("\n");

    const system =
      "You are Nexa AI, a warm and practical career mentor. You produce genuinely personalized career guidance. " +
      "Every recommendation must clearly reference the user's own answers (their skills, goals, strengths, weaknesses). " +
      "Suggest a mix across industries (technology, business, finance, healthcare, education, creative, engineering) — " +
      "prioritize whatever actually fits the user, not a fixed list. If the user has no skills or no experience, " +
      "recommend beginner-accessible paths and roadmaps that start from zero.";

    const prompt =
      `Analyze this user profile and produce three highly personalized career recommendations.\n\n${profileText}\n\n` +
      `Rules:\n` +
      `- Match percentages should differ (e.g. 92 / 84 / 76) and reflect real fit.\n` +
      `- Roadmap steps must be beginner-friendly and concrete.\n` +
      `- Never repeat the same generic advice — tailor every field to THIS user.`;

    try {
      const { output } = await generateText({
        model,
        system,
        prompt,
        output: Output.object({ schema: RecSchema }),
      });
      return output as AiRecommendResult;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        try {
          return JSON.parse(error.text ?? "") as AiRecommendResult;
        } catch {
          throw new Error("The AI response could not be parsed. Please try again.");
        }
      }
      throw error;
    }
  });
