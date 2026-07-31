class UserProfile:
    def __init__(self, education, interests, skills, experience, goals):
        self.education = education
        self.interests = interests
        self.skills = skills
        self.experience = experience
        self.goals = goals


    def show_profile(self):
        return {
            "Education": self.education,
            "Interests": self.interests,
            "Skills": self.skills,
            "Experience": self.experience,
            "Goals": self.goals
        }


user = UserProfile(
    "High school graduate",
    "Artificial Intelligence",
    ["Python", "Problem solving"],
    "No experience",
    "Get my first AI career"
)


print(user.show_profile())