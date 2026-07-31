import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import {
  recommendCareers, skillGaps, buildRoadmap, cvReport, interviewPrep, readiness,
  currentStrengths, recommendedProjects, recommendedCourses, actionPlan, type Profile,
} from "@/lib/nexa-engine";

const experienceEnum = z.enum(["", "none", "<1", "1-3", "3-5", "5+"]);
const skillLevelEnum = z.enum(["", "none", "beginner", "intermediate", "advanced"]).optional();

const profileSchema = z.object({
  education: z.string(),
  field: z.string(),
  skills: z.array(z.string()),
  skillLevel: skillLevelEnum,
  experience: experienceEnum,
  goals: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});

export default defineTool({
  name: "analyze_profile",
  title: "Analyze career profile",
  description:
    "Run the full Nexa AI career analysis on a user profile. Returns top career recommendations with match scores, skill gaps, learning roadmap, CV score with tips, interview prep sets, projects, courses, and an action plan.",
  inputSchema: { profile: profileSchema.describe("The user's career profile to analyze.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ profile }) => {
    const p = profile as Profile;
    const recs = recommendCareers(p);
    const top = recs[0];
    const gaps = skillGaps(p, top);
    const roadmap = buildRoadmap(p, top, gaps);
    const cv = cvReport(p, top);
    const interviews = interviewPrep(p, top);
    const ready = readiness(p, top, gaps);
    const strengths = currentStrengths(p, top);
    const projects = recommendedProjects(p, top);
    const courses = recommendedCourses(p, top);
    const actions = actionPlan(p, top, gaps, projects);

    const result = {
      readiness: ready,
      recommendations: recs.map((r) => ({
        role: r.role, match: r.match, salary: r.salary, tags: r.tags, why: r.why, category: r.track.category,
      })),
      currentStrengths: strengths, skillGaps: gaps, roadmap,
      recommendedProjects: projects, recommendedCourses: courses,
      cv, interviewPrep: interviews, actionPlan: actions,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
