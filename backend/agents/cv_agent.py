# Agent: CV Analysis
# Purpose: Provide CV improvement recommendations

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

class CvAnalysisResponse(BaseModel):
    skills_advice: List[str]
    experience_advice: List[str]
    projects_advice: List[str]
    next_step_tip: str

def analyze_cv_fallback(user_profile):
    skills = user_profile["skills"]
    experience = user_profile["experience"]

    if experience == "No experience":
        experience_advice = """
- Add academic projects
- Add personal AI projects
- Highlight skills and certifications
"""
    else:
        experience_advice = """
- Add work achievements
- Describe previous responsibilities
- Highlight measurable results
"""

    return f"""
Nexa AI CV Analysis

Current Skills:
{skills}

Experience:
{experience}


CV Recommendations:

Skills Section:
- Include technical skills
- Add tools and technologies you know

Experience Section:
{experience_advice}

Projects Section:
- Add 2-3 relevant projects
- Explain your role and technologies used

Next Step:
Improve your CV by showing skills, projects, and practical experience.
"""

def analyze_cv(user_profile):
    if not has_gemini:
        return analyze_cv_fallback(user_profile)

    skills = user_profile.get("skills", [])
    experience = user_profile.get("experience", "No experience")
    field = user_profile.get("field", "Technology")

    prompt = f"""
Perform a CV layout and content analysis for a user aiming to work in "{field}".
Give actionable advice for:
1. Skills section (Tailor to their domain)
2. Experience section (Base on their experience level: {experience})
3. Projects section (Tailor to their domain)
4. A single-sentence next step tip at the end.

User Profile:
Field: {field}
Skills: {skills}
Experience: {experience}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': CvAnalysisResponse,
            }
        )
        data = json.loads(response.text)
        
        skills_adv = data.get("skills_advice", [])
        exp_adv = data.get("experience_advice", [])
        proj_adv = data.get("projects_advice", [])
        tip = data.get("next_step_tip", "Improve your CV by showing skills, projects, and practical experience.")

        # Build output structure matching old format
        return f"""
Nexa AI CV Analysis

Current Skills:
{skills}

Experience:
{experience}


CV Recommendations:

Skills Section:
{'\n'.join('- ' + x for x in skills_adv) if skills_adv else '- Update technical skills for your field.'}

Experience Section:
{'\n'.join('- ' + x for x in exp_adv) if exp_adv else '- Detail your professional experience.'}

Projects Section:
{'\n'.join('- ' + x for x in proj_adv) if proj_adv else '- Add 2-3 relevant portfolio projects.'}

Next Step:
{tip}
"""

    except Exception as e:
        print(f"Error in cv_agent using Gemini API: {e}. Falling back to legacy CV advice.")
        return analyze_cv_fallback(user_profile)