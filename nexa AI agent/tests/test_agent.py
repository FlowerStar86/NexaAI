from agents.career_agent import career_agent


# ==========================
# Test 1 — AI Student
# ==========================

user = {
    "education": "Bachelor student",
    "field": "Artificial Intelligence",
    "skills": "Python, Machine Learning",
    "experience": "Beginner",
    "goals": "Get first job",
    "interests": "AI applications",
    "career_style": "Remote worker"
}

print("\n\nTEST 1 — AI Student")
print(career_agent(user))



# ==========================
# Test 2 — Data Student
# ==========================

user = {
    "education": "Bachelor student",
    "field": "Data Science",
    "skills": "Python, SQL, Data Analysis",
    "experience": "Beginner",
    "goals": "Career development",
    "interests": "Data analysis",
    "career_style": "Office work"
}

print("\n\nTEST 2 — Data Student")
print(career_agent(user))



# ==========================
# Test 3 — Career Switcher
# ==========================

user = {
    "education": "Bachelor degree",
    "field": "Business",
    "skills": "Communication, Management, Problem Solving",
    "experience": "Career switch",
    "goals": "Switch careers",
    "interests": "Technology",
    "career_style": "Flexible"
}

print("\n\nTEST 3 — Career Switcher")
print(career_agent(user))