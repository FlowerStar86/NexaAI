# Agent: Job Readiness Analysis
# Purpose: Help users prepare for job opportunities
def analyze_job_readiness(user_profile):

    experience = str(user_profile["experience"]).lower().strip()
    skills = user_profile["skills"]

    if "no experience" in experience or "beginner" in experience or "student" in experience:
        focus = """
Career Stage:
Beginner / First Job Seeker

Recommended Actions:
- Build beginner projects
- Create a GitHub portfolio
- Add projects to your CV
- Apply for internships and entry-level roles
"""

    elif "1" in experience or "early" in experience:
        focus = """
Career Stage:
Early Career

Recommended Actions:
- Improve CV with achievements
- Strengthen technical skills
- Build more advanced projects
- Apply for better opportunities
"""

    elif "switch" in experience or "career" in experience:
        focus = """
Career Stage:
Career Switcher

Recommended Actions:
- Identify transferable skills
- Learn skills needed for the new field
- Build projects related to the target career
- Update CV for the new direction
"""

    else:
        focus = """
Career Stage:
Early Career

Recommended Actions:
- Highlight professional achievements
- Improve personal branding
- Prepare for advanced opportunities
"""


    return f"""
Nexa AI Job Readiness Analysis

Experience Level:
{user_profile["experience"]}

Current Skills:
{skills}


{focus}


CV Recommendations:
- Highlight relevant skills
- Add projects and achievements
- Show measurable results


Portfolio Recommendations:
- Build career-related projects
- Upload work to GitHub
- Showcase practical experience


Interview Preparation:
- Practice explaining projects
- Prepare technical questions
- Improve communication skills


Next Step:
Follow the recommended actions and continue building career readiness.
"""