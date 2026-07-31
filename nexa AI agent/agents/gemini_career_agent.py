# Agent: Career Recommendation Engine
# Purpose: Generate career matches, roadmaps, and project suggestions

def generate_career_plan(profile):

    profile_lower = profile.lower()

    # User goals
    first_job = "first job" in profile_lower or "get first job" in profile_lower
    career_switch = "switch careers" in profile_lower or "career switch" in profile_lower
    freelance = "freelance" in profile_lower


    careers = []

    career_database = [

        {
            "name": "Software Developer",
            "keywords": ["programming", "coding", "software", "java", "c++", "python"],
            "reason": "You enjoy programming and building software solutions.",
            "skills": ["Programming", "Git", "Software Development"]
        },

        {
            "name": "Cybersecurity Analyst",
            "keywords": ["security", "cybersecurity", "network", "ethical hacking"],
            "reason": "Your interests align with protecting systems and data.",
            "skills": ["Networking", "Security", "Risk Analysis"]
        },

        {
            "name": "Project Manager",
            "keywords": ["leadership", "management", "planning", "organization"],
            "reason": "You show strengths in leading teams and organizing projects.",
            "skills": ["Leadership", "Communication", "Project Planning"]
        },

        {
            "name": "Product Manager",
            "keywords": ["product", "business", "planning", "strategy"],
            "reason": "You enjoy connecting technology with business needs.",
            "skills": ["Product Strategy", "Communication", "Leadership"]
        },

        {
            "name": "AI Application Developer",
            "keywords": ["python", "artificial intelligence", "machine learning", "llm", "coding"],
            "reason": "Your skills and interests match building AI-powered applications.",
            "skills": ["Python", "APIs", "AI tools"]
        },

        {
            "name": "Data Analyst",
            "keywords": ["data", "sql", "analysis", "excel", "statistics"],
            "reason": "Your background matches working with data and finding insights.",
            "skills": ["SQL", "Data analysis", "Visualization"]
        },

        {
            "name": "Business Analyst",
            "keywords": ["business", "management", "communication", "planning"],
            "reason": "Your skills match solving business problems and improving processes.",
            "skills": ["Business analysis", "Communication", "Problem solving"]
        },

        {
            "name": "UX/UI Designer",
            "keywords": ["design", "creative", "user experience", "art"],
            "reason": "Your interests match creating better user experiences.",
            "skills": ["Design tools", "User research", "Prototyping"]
        },

        {
            "name": "General Technology Professional",
            "keywords": ["technology", "programming", "communication", "problem solving"],
            "reason": "A technology career can help you build practical skills and opportunities.",
            "skills": ["Programming", "Communication", "Problem solving"]
        }
    ]


    # Career matching

    for career in career_database:

        score = 0

        for keyword in career["keywords"]:
            if keyword in profile_lower:
                score += 15


        # AI priority only when AI is really the field
        if ("artificial intelligence" in profile_lower 
            or "machine learning" in profile_lower
            or "ai applications" in profile_lower):

            if career["name"] == "AI Application Developer":
                score += 20


        # Data priority
        if ("data science" in profile_lower 
            or "data analysis" in profile_lower):

            if career["name"] == "Data Analyst":
                score += 20


        # Business priority
        if "business" in profile_lower:

            if career["name"] == "Business Analyst":
                score += 20


        if first_job:
            score += 5


        if score > 0:

            careers.append({
                "name": career["name"],
                "match": f"{min(score,95)}%",
                "reason": career["reason"],
                "match_reason": [
                    "Your skills match this career path",
                    "Your interests support this direction",
                    "This path can help you build experience"
                ],
                "skills": career["skills"]
            })


    # Extra recommendations

    if career_switch:

        careers.append({
            "name": "AI Career Transition Guide",
            "match": "85%",
            "reason": "This path helps you transfer your existing skills into a new AI-focused career.",
            "match_reason": [
                "AI skills are in demand",
                "Your experience can be leveraged",
                "This path offers career growth opportunities"
            ],
            "skills": [
                "AI fundamentals",
                "Projects",
                "Portfolio building"
            ]
        })


    if freelance:

        careers.append({
            "name": "AI Freelancer",
            "match": "85%",
            "reason": "Freelancing matches your goal of working independently.",
            "match_reason": [
                "Technical skills can be used for projects",
                "Freelancing builds experience",
                "Portfolio projects help attract clients"
            ],
            "skills": [
                "AI tools",
                "Building applications",
                "Communication"
            ]
        })


    if len(careers) == 0:

        careers.append({
            "name": "General Technology Professional",
            "match": "70%",
            "reason": "A technology career can help you build useful skills.",
            "match_reason": [
                "Technology skills are valuable",
                "Projects build experience",
                "Learning creates opportunities"
            ],
            "skills": [
                "Programming",
                "Communication",
                "Problem solving"
            ]
        })


    # Sort results

    careers = sorted(
        careers,
        key=lambda x: int(x["match"].replace("%","")),
        reverse=True
    )


    careers = careers[:3]


    top_career = careers[0]["name"]

    if top_career == "AI Career Transition Guide":
        project = "Build a career recommendation AI assistant project to demonstrate your skills and create a portfolio item."
    else:
        project_suggestions = {
            "AI Application Developer": "Build an AI-powered application using Python and an AI API.",
        "Data Analyst": "Analyse a real dataset and create an interactive dashboard.",
        "Business Analyst": "Create a business case study with process improvement recommendations.",
        "Software Developer": "Build a full-stack or desktop application.",
        "General Technology Professional": "Build a career recommendation AI assistant.",
        "AI Career Transition Guide": "Build a career recommendation AI assistant."
        }
        project = project_suggestions.get(
             top_career,
             "Build a project related to your chosen career."
        )


    result = ""


    for career in careers:

        result += f"""
{career['name']}
Match: {career['match']}

Why it fits:
{career['reason']}

Why this match:
- {career['match_reason'][0]}
- {career['match_reason'][1]}
- {career['match_reason'][2]}

Skills to learn:
- {career['skills'][0]}
- {career['skills'][1]}
- {career['skills'][2]}

--------------------
"""


    # Roadmap

    if "AI Application Developer" in result:

        roadmap = """
Month 1:
- Improve Python skills
- Learn AI fundamentals

Month 2:
- Learn APIs and LLM tools
- Build small AI applications

Month 3:
- Create AI projects
- Upload projects to GitHub

Month 4:
- Improve portfolio
- Apply for internships and jobs
"""


    elif "Data Analyst" in result:

        roadmap = """
Month 1:
- Learn SQL basics
- Practice data handling

Month 2:
- Learn visualization
- Create dashboards

Month 3:
- Complete projects
- Build portfolio

Month 4:
- Prepare CV
- Apply for opportunities
"""


    else:

        roadmap = """
Month 1:
- Learn foundations

Month 2:
- Build beginner projects

Month 3:
- Create portfolio

Month 4:
- Prepare for opportunities
"""


    result += f"""

First Project:

{project}
"""

    return {
    "career_recommendations": result,
    "top_career": top_career,
    "roadmap": roadmap
}