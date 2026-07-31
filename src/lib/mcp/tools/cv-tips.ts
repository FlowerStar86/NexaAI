import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { recommendCareers, cvReport, type Profile } from "@/lib/nexa-engine";

export default defineTool({
  name: "cv_tips",
  title: "CV tips",
  description:
    "Return a CV readiness score (0–100) and 3 tailored improvement tips for the user's top-matched career.",
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
    const report = cvReport(p, top);
    const result = { targetRole: top.role, ...report };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
