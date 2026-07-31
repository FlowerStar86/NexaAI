def career_agent(profile):
    skills = profile["skills"]
    interests = profile["interests"]
    experience = profile["experience"]

    recommendations = []

    if "Python" in skills or "AI" in interests:
        recommendations.append({
            "career": "AI Engineer",
            "reason": "Your interest in AI and Python matches this career path.",
            "learn": [
                "Python programming",
                "Machine Learning basics",
                "Generative AI",
                "Build AI projects"
            ]
        })

    if experience == "No experience":
        recommendations.append({
            "career": "Data Analyst",
            "reason": "This is beginner-friendly and helps you build technical skills.",
            "learn": [
                "Excel",
                "SQL",
                "Data visualization",
                "Python for data analysis"
            ]
        })

    return recommendations


user_profile = {
    "education": "High school graduate",
    "interests": "AI",
    "skills": ["Python"],
    "experience": "No experience",
    "goals": "Start a technology career"
}


result = career_agent(user_profile)

for career in result:
    print("\nCareer:", career["career"])
    print("Why:", career["reason"])
    print("Learn:", career["learn"])