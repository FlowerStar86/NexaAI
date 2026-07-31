# Agent: Learning Roadmap
# Purpose: Recommend skills and learning paths

class LearningAgent:

    def create_roadmap(self, career):

        roadmaps = {
            "AI Application Developer": [
                "Learn Python basics",
                "Study Machine Learning fundamentals",
                "Learn Generative AI",
                "Build AI projects",
                "Create a portfolio"
            ],

            "Data Analyst": [
                "Learn Excel",
                "Learn SQL",
                "Learn Python for data analysis",
                "Practice data visualization",
                "Build analysis projects"
            ],
            "Business": [
                "Learn AI and technology fundamentals",
                "Identify transferable skills",
                "Build career-related projects",
                "Improve your CV and portfolio",
                "Apply for opportunities"
            ],
            "AI Career Transition Guide": [
                "Learn AI and technology fundamentals",
                "Identify transferable skills",
                "Build career-related projects",
                "Improve your CV and portfolio",
                "Apply for opportunities"
            ],
            "Business Analyst": [
                "Learn business analysis",
                "Improve communication skills",
                "Learn Excel and reporting",
                "Build business case studies",
                "Prepare CV and portfolio"
            ]
        }

        return roadmaps.get(
            career,
            [
                "Learn basic computer skills",
                "Build beginner projects",
                "Explore career resources"
            ]
        )