# Agent: Skill Gap Analyzer
# Purpose: Find missing skills based on career goals


def analyze_skill_gap(user_profile, top_career):

    profile_text = str(user_profile).lower()

    skill_database = {
        "AI Application Developer": [
            "python",
            "apis",
            "machine learning",
            "llm tools",
            "github",
            "deployment"
        ],

        "Data Analyst": [
            "sql",
            "excel",
            "statistics",
            "data visualization",
            "python"
        ],

        "Software Developer": [
            "programming",
            "git",
            "algorithms",
            "software development"
        ],

        "Business Analyst": [
            "business analysis",
            "communication",
            "excel",
            "problem solving"
        ],

        "UX/UI Designer": [
            "design",
            "user research",
            "prototyping",
            "design tools"
        ],

        "Cybersecurity Analyst": [
            "networking",
            "security",
            "linux",
            "ethical hacking",
            "risk analysis"
        ],

        "Project Manager": [
            "leadership",
            "communication",
            "planning",
            "project management"
        ],

        "Product Manager": [
            "product strategy",
            "business",
            "communication",
            "user research"
        ],

        "Graphic Designer": [
            "design",
            "photoshop",
            "illustrator",
            "creativity"
        ],

        "Financial Analyst": [
            "excel",
            "finance",
            "statistics",
            "reporting"
        ],

        "Content Strategist": [
            "writing",
            "marketing",
            "seo",
            "communication"
        ],

        "Digital Marketing Specialist": [
            "marketing",
            "social media",
            "analytics",
            "content creation"
        ],
        "General Technology Professional": [
            "programming",
            "communication",
            "problem solving"
        ],
        "AI Career Transition Guide": [
            "ai fundamentals",
            "programming",
            "projects",
            "portfolio building"
            "communication",
            "problem solving"
        ]
        }

   # Detect career from recommendation/profile
    matched_career = None

    if "ai application developer" in profile_text:
        matched_career = "AI Application Developer"

    elif "data analyst" in profile_text:
        matched_career = "Data Analyst"

    elif "business analyst" in profile_text:
        matched_career = "Business Analyst"

    elif "software developer" in profile_text:
        matched_career = "Software Developer"

    # Default career
    if matched_career is None:

        if "business" in profile_text or "management" in profile_text:
            matched_career = "Business Analyst"

        elif "data" in profile_text or "sql" in profile_text:
            matched_career = "Data Analyst"

        elif "design" in profile_text or "creative" in profile_text:
            matched_career = "UX/UI Designer"

        elif "security" in profile_text:
            matched_career = "Cybersecurity Analyst"

        else:
            matched_career = "General Technology Professional"

    required_skills = skill_database[top_career]


    current_skills = []
    missing_skills = []


    # Compare user skills with required skills
    for skill in required_skills:

        if skill in profile_text:
            current_skills.append(skill)

        else:
            missing_skills.append(skill)



    result = f"""
Skill Gap Analysis

Target Career:
{top_career}


Current Skills:
"""


    if current_skills:

        for skill in current_skills:
            result += f"✓ {skill}\n"

    else:

        result += "No matching skills found yet.\n"



    result += """

Skills To Improve:
"""


    for skill in missing_skills:
        result += f"○ {skill}\n"



    result += """

Recommended Actions:
"""


    if missing_skills:

        result += "- Learn the missing skills through courses\n"
        result += "- Build projects to practice these skills\n"
        result += "- Add projects to your portfolio\n"

    else:

        result += "- Continue improving advanced skills\n"
        result += "- Build more projects\n"



    return result