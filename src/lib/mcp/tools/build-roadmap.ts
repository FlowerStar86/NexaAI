import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  recommendCareers,
  skillGaps,
  buildRoadmap,
  type Profile,
} from "@/lib/nexa-engine";

export default defineTool({
  name: "build_learning_roadmap",
  title: "Build learning roadmap",
  description:
    "Generate a personalized week-by-week learning roadmap for the top-matched career based on the user's profile, including skill gaps to close along the way.",
  inputSchema: {
    profile: z
      .object({
        education: z.string(),
        field: z.string(),
        skills: z.array(z.string()),
        skillLevel: z.enum(["", "none", "beginner", "intermediate", "advanced"]).optional(),
        experience: z.enum(["", "none", "<1", "1-3", "3-5", "5+"]),
        goals: z.array(z.string()),
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
      })
      .describe("The user's career profile."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ profile }) => {
    const p = profile as Profile;
    const top = recommendCareers(p)[0];
    const gaps = skillGaps(p, top);
    const roadmap = buildRoadmap(p, top, gaps);
    const result = { targetRole: top.role, skillGaps: gaps, roadmap };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
