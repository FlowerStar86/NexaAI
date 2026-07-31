import sys
import os

# Add backend folder to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agents.career_agent import career_agent


# ==========================================
# Test 1 — Law Profile (Non-tech user)
# ==========================================
law_user = {
    "education": "Law school graduate",
    "field": "Law",
    "skills": ["Legal research", "Negotiation"],
    "experience": "Beginner",
    "goals": ["Become a legal consultant"],
    "interests": "Contracts and corporate law",
    "career_style": "Full-time"
}

print("\n\n" + "=" * 50)
print("TEST 1 — LAW PROFILE")
print("=" * 50)
res_law = career_agent(law_user)

print("\nTop Career Recommended:")
print(res_law.get("career_recommendations").split("\n")[1:5])

print("\nSkill Gap Analysis Report:")
print(res_law.get("skill_gap"))

print("\nLearning Roadmap:")
print(res_law.get("learning_roadmap"))

# Assertions/Checks for Law
skills_to_improve = res_law.get("skill_gap")
assert "programming" not in skills_to_improve.lower(), "ERROR: Found programming skill recommended to Law profile!"
assert "python" not in skills_to_improve.lower(), "ERROR: Found Python recommended to Law profile!"
print("✅ Law check passed: No programming skills recommended!")


# ==========================================
# Test 2 — Business Profile (Non-tech user)
# ==========================================
business_user = {
    "education": "Bachelor of Commerce",
    "field": "Business",
    "skills": ["Strategy", "Project management"],
    "experience": "Beginner",
    "goals": ["Work in consulting"],
    "interests": "Operations and market analysis",
    "career_style": "Full-time"
}

print("\n\n" + "=" * 50)
print("TEST 2 — BUSINESS PROFILE")
print("=" * 50)
res_bus = career_agent(business_user)

print("\nTop Career Recommended:")
print(res_bus.get("career_recommendations").split("\n")[1:5])

print("\nSkill Gap Analysis Report:")
print(res_bus.get("skill_gap"))

print("\nLearning Roadmap:")
print(res_bus.get("learning_roadmap"))

# Assertions/Checks for Business
roadmap = res_bus.get("learning_roadmap")
assert any("business" in r.lower() or "strategy" in r.lower() or "project" in r.lower() or "leadership" in r.lower() for r in roadmap), "ERROR: Business roadmap does not contain business-focused items!"
print("✅ Business check passed: Business-appropriate roadmap and skills generated!")


# ==========================================
# Test 3 — Technology Profile (Tech user)
# ==========================================
tech_user = {
    "education": "Computer Science student",
    "field": "Technology",
    "skills": ["Python", "Algorithms"],
    "experience": "Beginner",
    "goals": ["Become an AI engineer"],
    "interests": "Machine learning",
    "career_style": "Remote worker"
}

print("\n\n" + "=" * 50)
print("TEST 3 — TECHNOLOGY PROFILE")
print("=" * 50)
res_tech = career_agent(tech_user)

print("\nTop Career Recommended:")
print(res_tech.get("career_recommendations").split("\n")[1:5])

print("\nSkill Gap Analysis Report:")
print(res_tech.get("skill_gap"))

print("\nLearning Roadmap:")
print(res_tech.get("learning_roadmap"))

# Assertions/Checks for Tech
tech_roadmap = res_tech.get("learning_roadmap")
assert any("programming" in r.lower() or "projects" in r.lower() or "ai" in r.lower() or "python" in r.lower() for r in tech_roadmap), "ERROR: Tech roadmap is missing programming/AI skills!"
print("✅ Technology check passed: Tech-appropriate roadmap and skills generated!")

print("\n\n" + "=" * 50)
print("ALL TESTS PASSED SUCCESSFULLY!")
print("=" * 50)