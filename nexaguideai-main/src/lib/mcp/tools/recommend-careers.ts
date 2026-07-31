import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { recommendCareers, type Profile } from "@/lib/nexa-engine";

export default defineTool({
  name: "recommend_careers",
  title: "Recommend careers",
  description:
    "Return the top 3 career recommendations for a user profile, each with a match percentage, salary range, matching skill tags, and a short explanation of why it fits.",
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
    const recs = recommendCareers(profile as Profile).map((r) => ({
      role: r.role,
      match: r.match,
      salary: r.salary,
      tags: r.tags,
      why: r.why,
      category: r.track.category,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(recs, null, 2) }],
      structuredContent: { recommendations: recs },
    };
  },
});
