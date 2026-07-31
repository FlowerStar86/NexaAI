# Agent: Career Orchestrator
# Purpose: Connect different agents and generate the final career plan

from agents.gemini_career_agent import generate_career_plan
from agents.profile_agent import analyze_profile
from agents.skill_gap_agent import analyze_skill_gap
from agents.job_agent import analyze_job_readiness
from agents.cv_agent import analyze_cv
from agents.learning_agent import LearningAgent


def career_agent(user_profile):

    learning_agent = LearningAgent()

    career = user_profile.get("field", "General")
    goal = user_profile.get("goals", "career development")

    profile = analyze_profile(user_profile)


    career_plan = generate_career_plan(
        f"""
User Information:

Field:
{career}

Goal:
{goal}

Profile Analysis:
{profile}


        """
    )


    top_career = career_plan["top_career"]

    roadmap = learning_agent.create_roadmap(top_career)

    skill_gap = analyze_skill_gap(user_profile, top_career)

    cv_analysis = analyze_cv(user_profile)

    job_readiness = analyze_job_readiness(user_profile)


    title = "Nexa AI Career Report"
    next_title = "Next Steps"
    width = 60


    final_report = f"""
{'=' * width}
{title.center(width)}
{'=' * width}


Career Recommendations
----------------------

{career_plan}


Skill Gap Summary
-----------------

{skill_gap}


CV Improvement Tips
-------------------

{cv_analysis}


Job Readiness
-------------

{job_readiness}


Learning Roadmap
----------------

{"\n".join(f"- {item}" for item in roadmap) if isinstance(roadmap, list) else roadmap}


{'=' * width}
{next_title.center(width)}
{'=' * width}

- Improve missing skills
- Build portfolio projects
- Update CV
- Apply for opportunities


{'=' * width}
"""

    return {
    "title": title,
    "career_recommendations": career_plan["career_recommendations"],
    "skill_gap": skill_gap,
    "cv_analysis": cv_analysis,
    "job_readiness": job_readiness,
    "learning_roadmap": roadmap,
    "next_steps": [
        "Improve missing skills",
        "Build portfolio projects",
        "Update CV",
        "Apply for opportunities"
    ]
}