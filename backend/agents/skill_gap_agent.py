# Agent: Skill Gap Analyzer
# Purpose: Find missing skills based on career goals

import json
from pydantic import BaseModel, Field
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

class SkillGapResponse(BaseModel):
    current_relevant_skills: List[str] = Field(description="User's existing skills relevant to this career")
    skills_to_improve: List[str] = Field(description="Missing skills that the user needs to learn. DO NOT include programming/coding/software development unless this career explicitly requires it.")
    recommended_actions: List[str] = Field(description="Logical next action steps to close the gap")

def analyze_skill_gap_fallback(user_profile, top_career):
    profile_text = str(user_profile).lower()
    field = user_profile.get("field", "").lower() if isinstance(user_profile, dict) else ""
    career = str(top_career).lower()

    # Classify domain
    if "law" in field or "legal" in field or "law" in career or "legal" in career or "compliance" in career:
        required_skills = ["Legal Research", "Contract Analysis", "Negotiation", "Documentation"]
    elif "business" in field or "finance" in field or "business" in career or "finance" in career or "management" in career or "consultant" in career:
        required_skills = ["Business Analysis", "Strategy", "Communication", "Leadership"]
    elif "media" in field or "communication" in field or "media" in career or "content" in career or "marketing" in career:
        required_skills = ["Content Creation", "Digital Marketing", "Communication"]
    elif "design" in field or "graphic" in field or "ux" in field or "ui" in field or "design" in career or "graphic" in career or "ux" in career or "ui" in career:
        required_skills = ["Design Foundations", "Figma / Design Tools", "Visual Identity", "Prototyping"]
    elif "health" in field or "medical" in field or "health" in career or "medical" in career or "nurse" in career or "doctor" in career:
        required_skills = ["Patient Care", "Clinical Skills", "Empathy", "Documentation"]
    elif "educat" in field or "teach" in field or "educat" in career or "teach" in career or "lecturer" in career or "professor" in career:
        required_skills = ["Curriculum Design", "Classroom Management", "Communication", "Assessment"]
    else:
        if any(kw in field or kw in career for kw in ["tech", "computer", "ai", "programmer", "coding", "software", "data", "developer"]):
            required_skills = ["Programming", "AI", "Data", "Technical Skills"]
        else:
            required_skills = ["Problem Solving", "Communication", "Industry Knowledge", "Adaptability"]

    # Retrieve current skills list
    user_skills = user_profile.get("skills", []) if isinstance(user_profile, dict) else []
    if isinstance(user_skills, str):
        user_skills = [user_skills]
    user_skills_lower = [str(s).lower() for s in user_skills]

    current_skills = []
    missing_skills = []

    for skill in required_skills:
        skill_lower = skill.lower()
        if any(skill_lower in s or s in skill_lower for s in user_skills_lower) or skill_lower in profile_text:
            current_skills.append(skill)
        else:
            missing_skills.append(skill)

    result = f"Skill Gap Analysis\n\nTarget Career:\n{top_career}\n\n\nCurrent Skills:\n"
    if current_skills:
        for skill in current_skills:
            result += f"✓ {skill}\n"
    else:
        result += "No matching skills found yet.\n"

    result += "\nSkills To Improve:\n"
    for skill in missing_skills:
        result += f"○ {skill}\n"

    result += "\nRecommended Actions:\n"
    if missing_skills:
        result += "- Learn the missing skills through courses\n- Build projects to practice these skills\n- Add projects to your portfolio\n"
    else:
        result += "- Continue improving advanced skills\n- Build more projects\n"

    return result

def analyze_skill_gap(user_profile, top_career):
    if not has_gemini:
        return analyze_skill_gap_fallback(user_profile, top_career)

    if isinstance(user_profile, dict):
        profile_str = f"Field: {user_profile.get('field')}\nSkills: {user_profile.get('skills', [])}\nEducation: {user_profile.get('education')}\nGoals: {user_profile.get('goals')}\nStrengths: {user_profile.get('strengths', [])}\nWeaknesses: {user_profile.get('weaknesses', [])}"
    else:
        profile_str = str(user_profile)

    prompt = f"""
Perform a skill gap analysis for the target career: "{top_career}".
Compare the user's current background and skills against what is required for this career.
Identify:
1. Current relevant skills: Skills the user already has that are directly useful for this career.
2. Skills to improve: Missing skills that they need to learn.
   CRITICAL: DO NOT recommend programming, coding, or software engineering skills (like Python, SQL, Java, Git, HTML) to non-technical fields (e.g. Law, Teaching, standard Business) unless this career explicitly requires it (e.g. Legal Tech, Data Analyst). Keep suggestions aligned with their target career domain.
3. Recommended actions: Action steps they should take.

User Profile Details:
{profile_str}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': SkillGapResponse,
            }
        )
        data = json.loads(response.text)
        current = data.get("current_relevant_skills", [])
        improve = data.get("skills_to_improve", [])
        actions = data.get("recommended_actions", [])

        # Format exactly like the old string format
        result = f"Skill Gap Analysis\n\nTarget Career:\n{top_career}\n\n\nCurrent Skills:\n"
        if current:
            for s in current:
                result += f"✓ {s}\n"
        else:
            result += "No matching skills found yet.\n"

        result += "\nSkills To Improve:\n"
        for s in improve:
            result += f"○ {s}\n"

        result += "\nRecommended Actions:\n"
        if actions:
            for a in actions:
                prefix = "" if a.strip().startswith("-") else "- "
                result += f"{prefix}{a}\n"
        else:
            result += "- Learn the missing skills through courses\n- Build projects to practice these skills\n"

        return result

    except Exception as e:
        print(f"Error in skill_gap_agent using Gemini API: {e}. Falling back to keyword model.")
        return analyze_skill_gap_fallback(user_profile, top_career)