import { defineMcp } from "@lovable.dev/mcp-js";
import analyzeProfile from "./tools/analyze-profile";
import recommendCareersTool from "./tools/recommend-careers";
import buildRoadmapTool from "./tools/build-roadmap";
import cvTipsTool from "./tools/cv-tips";
import interviewPrepTool from "./tools/interview-prep";

export default defineMcp({
  name: "nexa-ai-mcp",
  title: "Nexa AI",
  version: "0.1.0",
  instructions:
    "Nexa AI is an AI career assistant. Pass a user profile (education, field, skills, experience, goals, strengths, weaknesses) to any tool to get personalized career recommendations, skill-gap analysis, week-by-week learning roadmaps, CV coaching, and interview prep. Start with `analyze_profile` for the full report.",
  tools: [
    analyzeProfile,
    recommendCareersTool,
    buildRoadmapTool,
    cvTipsTool,
    interviewPrepTool,
  ],
});
