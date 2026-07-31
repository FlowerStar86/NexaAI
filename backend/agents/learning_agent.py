# Agent: Learning Roadmap
# Purpose: Recommend skills and learning paths

import json
from pydantic import BaseModel
from typing import List

try:
    from config import client
    has_gemini = True
except ImportError:
    try:
        from backend.config import client
        has_gemini = True
    except ImportError:
        has_gemini = False

class LearningRoadmapResponse(BaseModel):
    steps: List[str]

class LearningAgent:

    def create_roadmap_fallback(self, career):
        career_lower = str(career).lower()
        
        # Check for specific role matches first, then check broad categories
        if "law" in career_lower or "legal" in career_lower or "attorney" in career_lower or "compliance" in career_lower or "justice" in career_lower or "advisor" in career_lower:
            return [
                "Legal research methods",
                "Contract analysis",
                "Legal writing",
                "Case analysis",
                "Professional networking"
            ]
        elif "business" in career_lower or "management" in career_lower or "finance" in career_lower or "strategy" in career_lower or "marketing" in career_lower or "hr" in career_lower or "sales" in career_lower or "entrepreneur" in career_lower or "founder" in career_lower or "consultant" in career_lower or "project manager" in career_lower or "product manager" in career_lower or "operations" in career_lower:
            if "business analyst" in career_lower:
                return [
                    "Business analysis fundamentals",
                    "Requirements gathering",
                    "Excel and data reporting",
                    "Process mapping and design",
                    "Stakeholder communication"
                ]
            return [
                "Business analysis",
                "Project management",
                "Strategy",
                "Leadership",
                "Market research"
            ]
        elif "media" in career_lower or "content" in career_lower or "digital marketing" in career_lower or "communication" in career_lower or "branding" in career_lower or "video" in career_lower or "writer" in career_lower or "journalism" in career_lower:
            return [
                "Content creation",
                "Digital marketing",
                "Branding",
                "Communication",
                "Portfolio building"
            ]
        elif "design" in career_lower or "graphic" in career_lower or "ux" in career_lower or "ui" in career_lower or "illustrator" in career_lower or "artist" in career_lower or "creative" in career_lower:
            return [
                "Design foundations",
                "Mastering design tools",
                "UI/UX & Prototyping",
                "Branding & Visual identity",
                "Portfolio building"
            ]
        elif "nurse" in career_lower or "doctor" in career_lower or "physician" in career_lower or "pharmacist" in career_lower or "health" in career_lower or "medical" in career_lower or "clinical" in career_lower or "dentist" in career_lower or "therapy" in career_lower:
            return [
                "Clinical observation",
                "Healthcare systems",
                "Anatomy & Physiology",
                "Professional ethics",
                "Patient communication"
            ]
        elif "teach" in career_lower or "educat" in career_lower or "professor" in career_lower or "lecturer" in career_lower or "school" in career_lower or "academic" in career_lower or "learning" in career_lower:
            return [
                "Teaching methodologies",
                "Curriculum design",
                "Classroom management",
                "Educational technology",
                "Student assessment"
            ]
        elif "programmer" in career_lower or "programming" in career_lower or "developer" in career_lower or "engineer" in career_lower or "software" in career_lower or "tech" in career_lower or "ai" in career_lower or "machine learning" in career_lower or "ml" in career_lower or "cyber" in career_lower or "security" in career_lower or "data" in career_lower or "cloud" in career_lower or "devops" in career_lower or "network" in career_lower or "coding" in career_lower:
            if "data analyst" in career_lower:
                return [
                    "Excel & SQL basics",
                    "Data cleaning techniques",
                    "Data visualization (Tableau/PowerBI)",
                    "Python for analysis",
                    "Analytical report building"
                ]
            return [
                "Programming",
                "Projects",
                "AI/tools",
                "Portfolio",
                "Advanced skills"
            ]
        else:
            return [
                "Industry domain foundations",
                "Practical tool mastery",
                "Real-world project implementation",
                "Portfolio & professional branding",
                "Advanced industry specialization"
            ]

    def create_roadmap(self, career):
        if not has_gemini:
            return self.create_roadmap_fallback(career)

        prompt = f"""
Generate a realistic, career-specific learning roadmap for the role: "{career}".
Provide exactly 5 logical, sequential steps or milestones to master this career.
Avoid generic basic computer skills. Focus on the core domain expertise, tools, and methodologies required for this specific role.

Example:
For "AI Application Developer", steps might be:
1. Python programming foundations
2. Machine learning and data libraries (NumPy, Pandas)
3. Deep learning & LLM APIs (OpenAI, HuggingFace)
4. Prompt engineering & vector databases
5. Building & deploying end-to-end AI applications
"""
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json',
                    'response_schema': LearningRoadmapResponse,
                }
            )
            data = json.loads(response.text)
            steps = data.get("steps", [])
            if len(steps) >= 3:
                return steps
            raise ValueError("Roadmap steps too short")
        except Exception as e:
            print(f"Error in LearningAgent using Gemini API: {e}. Falling back to hardcoded roadmaps.")
            return self.create_roadmap_fallback(career)