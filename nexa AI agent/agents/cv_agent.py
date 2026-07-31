# Agent: CV Analysis
# Purpose: Provide CV improvement recommendations


def analyze_cv(user_profile):

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