# Agent: Profile Analysis
# Purpose: Analyze user background, skills, and career goals
def analyze_profile(user_profile):

    education = user_profile["education"]
    field = user_profile["field"]
    skills = user_profile["skills"]
    experience = user_profile["experience"]
    goals = user_profile["goals"]

    interests = user_profile.get("interests", "Not specified")
    career_style = user_profile.get("career_style", "Not specified")

    if experience.lower() == "no experience":
        level = "Beginner / Entry-level"
    else:
        level = "Early career professional"

    return f"""
Nexa AI Profile Analysis

Education:
{education}

Field:
{field}

Current Skills:
{skills}

Experience:
{experience}

Career Goals:
{goals}

Interests:
{interests}

Preferred Career Style:
{career_style}


Analysis:

Current Level:
{level}

Strengths:
- Has interest in {field}
- Has existing skills: {skills}
- Has a clear goal: {goals}

Career Preferences:
- Interested in: {interests}
- Preferred work style: {career_style}

Areas to Improve:
- Build practical experience
- Create projects
- Develop job-ready skills

Recommended Focus:
Help this user move toward their career goal with a realistic learning and job roadmap.
"""