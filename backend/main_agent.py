from agents.profile_agent import ProfileAgent
from agents.career_agent import CareerAgent
from agents.learning_agent import LearningAgent


profile_agent = ProfileAgent()
career_agent = CareerAgent()
learning_agent = LearningAgent()


profile = profile_agent.collect_profile(
    "High school graduate",
    "AI and technology",
    ["Python"],
    "No experience",
    "Start an AI career"
)


careers = career_agent.recommend_careers(profile)

print("Recommended Careers:")

for career in careers:
    print("-", career)

    roadmap = learning_agent.create_roadmap(career)

    print("Roadmap:")
    for step in roadmap:
        print("  ✓", step)