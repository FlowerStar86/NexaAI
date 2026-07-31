def analyze_user_profile(education, interests, skills, experience, goals):
    profile = {
        "education": education,
        "interests": interests,
        "skills": skills,
        "experience": experience,
        "goals": goals
    }

    return profile


user_profile = analyze_user_profile(
    education="High school graduate",
    interests="Technology and AI",
    skills=["Python", "Problem solving"],
    experience="No experience",
    goals="Find a career path"
)

print(user_profile)