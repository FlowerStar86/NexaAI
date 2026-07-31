# Agent: Career Recommendation Engine
# Purpose: Generate career matches, roadmaps, and project suggestions

import json
from pydantic import BaseModel, Field
from typing import List

try:
    from config import client
    has_gemini = True
except ImportError:
    try:
        from backend.config import client
        has_gemini = True
    except ImportError:
        has_gemini = False

# Define structured schemas for Gemini
class CareerRoadmapStep(BaseModel):
    step: str = Field(description="Step title, e.g. Step 1: Learn Legal Document Drafting")
    detail: str = Field(description="Details on what to learn and focus on.")
    duration: str = Field(description="Duration estimate, e.g. Weeks 1-2")

class CareerOption(BaseModel):
    role: str = Field(description="Name of the career/role")
    match: int = Field(description="Match percentage (0 to 100)")
    category: str = Field(description="Career category")
    why: str = Field(description="Detailed reason why this fits the user")
    currentStrengths: List[str] = Field(description="List of user's current strengths relevant to this career")
    skillsToLearn: List[str] = Field(description="List of skills the user needs to learn")
    roadmap: List[CareerRoadmapStep] = Field(description="A step-by-step learning roadmap (exactly 3 to 5 steps)")
    firstProject: str = Field(description="First project to start now")

class CareerPlanResponse(BaseModel):
    summary: str = Field(description="Overall profile summary")
    advice: str = Field(description="Personalized advice")
    careers: List[CareerOption] = Field(description="List of exactly 3 recommended careers")

def generate_career_plan_fallback(profile):
    profile_lower = str(profile).lower()
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
            "keywords": ["design", "creative", "user experience", "art", "figma"],
            "reason": "Your interests match creating better user experiences.",
            "skills": ["Design tools", "User research", "Prototyping"]
        },
        {
            "name": "General Technology Professional",
            "keywords": ["technology", "programming", "communication", "problem solving"],
            "reason": "A technology career can help you build practical skills and opportunities.",
            "skills": ["Programming", "Communication", "Problem solving"]
        },
        {
            "name": "Legal Consultant",
            "keywords": ["law", "legal", "communication", "leadership", "contracts", "analysis"],
            "reason": "A legal consulting career matches your law background, communication skills, and ability to analyze problems.",
            "skills": ["Legal Research", "Contract Analysis", "Communication", "Negotiation"]
        },
        {
            "name": "Compliance Specialist",
            "keywords": ["law", "compliance", "regulations", "risk", "business", "analysis"],
            "reason": "Compliance roles use legal knowledge to help organizations follow regulations and manage risks.",
            "skills": ["Regulatory Knowledge", "Risk Analysis", "Documentation", "Communication"]
        },
        {
            "name": "Legal Technology Specialist",
            "keywords": ["law", "legal tech", "technology", "digital tools", "innovation"],
            "reason": "Legal technology combines law knowledge with modern tools to improve legal processes.",
            "skills": ["Legal Technology", "Digital Tools", "Problem Solving", "Research"]
        },
        {
            "name": "Corporate Lawyer",
            "keywords": ["law", "legal", "contracts", "corporate", "lawyer", "attorney"],
            "reason": "Corporate law matches your interest in corporate legal structures, negotiation, and contract drafts.",
            "skills": ["Corporate Law", "Contract Drafting", "Negotiation", "Legal Writing"]
        },
        {
            "name": "Marketing Specialist",
            "keywords": ["marketing", "business", "communication", "creative", "social media", "content"],
            "reason": "Marketing matches users who enjoy communication, creativity, and building business strategies.",
            "skills": ["Marketing Strategy", "Communication", "Content Creation", "Analytics"]
        },
        {
            "name": "Human Resources Specialist",
            "keywords": ["hr", "human resources", "people", "communication", "management", "leadership"],
            "reason": "HR fits users who enjoy working with people, communication, and organizational development.",
            "skills": ["Recruitment", "Communication", "Employee Management"]
        },
        {
            "name": "Digital Media Specialist",
            "keywords": ["media", "content", "digital", "communication", "creative", "social media"],
            "reason": "Digital media specialists create and manage content across online platforms.",
            "skills": ["Content Creation", "Social Media", "Communication", "Digital Tools"]
        },
        {
            "name": "Content Creator",
            "keywords": ["media", "writing", "video", "creative", "communication"],
            "reason": "Content creation fits users interested in storytelling and digital communication.",
            "skills": ["Writing", "Video Editing", "Communication", "Creativity"]
        },
        {
            "name": "Public Relations Specialist",
            "keywords": ["media", "communication", "pr", "public relations", "branding"],
            "reason": "Public relations fits users who want to manage public communications and media presence.",
            "skills": ["Media Relations", "Press Releases", "Public Speaking", "Branding"]
        },
        {
            "name": "Entrepreneur",
            "keywords": ["business", "startup", "leadership", "innovation", "management"],
            "reason": "Entrepreneurship matches users interested in creating businesses and leading ideas.",
            "skills": ["Leadership", "Business Planning", "Innovation"]
        },
        {
            "name": "Financial Analyst",
            "keywords": ["finance", "business", "excel", "accounting", "economics"],
            "reason": "Financial analysis matches your quantitative skills and interest in business operations.",
            "skills": ["Excel", "Financial Modeling", "Reporting", "Accounting"]
        },
        {
            "name": "Graphic Designer",
            "keywords": ["design", "creative", "art", "graphic", "adobe", "visual"],
            "reason": "Graphic design matches your interest in visual communication and design tools.",
            "skills": ["Graphic Design", "Adobe Illustrator", "Photoshop", "Branding"]
        },
        {
            "name": "Nurse",
            "keywords": ["healthcare", "nurse", "medical", "clinical", "nursing", "patient"],
            "reason": "Nursing matches your clinical interests, patient care skills, and biology background.",
            "skills": ["Patient Care", "Clinical Skills", "Empathy", "Documentation"]
        },
        {
            "name": "Healthcare Administrator",
            "keywords": ["healthcare", "admin", "hospital", "management", "operations"],
            "reason": "Healthcare administration matches your interest in health sector operations and management.",
            "skills": ["Healthcare Operations", "Compliance", "Budgeting", "Communication"]
        },
        {
            "name": "Teacher",
            "keywords": ["education", "teaching", "school", "teach", "classroom"],
            "reason": "Teaching matches your passion for education, pedagogy, and student mentorship.",
            "skills": ["Curriculum Design", "Classroom Management", "Communication", "Assessment"]
        },
        {
            "name": "Instructional Designer",
            "keywords": ["education", "instructional design", "curriculum", "elearning"],
            "reason": "Instructional design matches your interest in developing educational systems and e-learning resources.",
            "skills": ["Curriculum Design", "E-learning Tools", "Content Development", "Communication"]
        },
        {
            "name": "Technology Specialist",
            "keywords": ["technology", "digital tools", "problem solving"],  
            "reason": "Technology specialists help organizations use digital tools and technical solutions to improve processes and solve problems.",
            "skills": ["Digital Tools", "Technical Support", "Problem Solving", "Technology Knowledge"]
        }
    ]

    field = profile.get("field", "") if isinstance(profile, dict) else ""
    field_lower = field.lower()

    for career in career_database:
        score = 0
        for keyword in career["keywords"]:
            if keyword in profile_lower:
                score += 15

        if ("artificial intelligence" in profile_lower 
            or "machine learning" in profile_lower
            or "ai applications" in profile_lower):
            if career["name"] == "AI Application Developer":
                score += 20

        if "data science" in profile_lower or "data analysis" in profile_lower:
            if career["name"] == "Data Analyst":
                score += 20

        if "business" in profile_lower:
            if career["name"] == "Business Analyst":
                score += 20

        # Field-based matching boost
        career_name_lower = career["name"].lower()
        is_law_career = career_name_lower in ["legal consultant", "compliance specialist", "legal technology specialist", "corporate lawyer"]
        is_business_career = career_name_lower in ["business analyst", "project manager", "human resources specialist", "marketing specialist", "entrepreneur", "financial analyst", "product manager"]
        is_media_career = career_name_lower in ["digital media specialist", "content creator", "public relations specialist"]
        is_design_career = career_name_lower in ["ux/ui designer", "graphic designer"]
        is_healthcare_career = career_name_lower in ["nurse", "healthcare administrator"]
        is_education_career = career_name_lower in ["teacher", "instructional designer"]
        is_tech_career = career_name_lower in ["software developer", "cybersecurity analyst", "ai application developer", "data analyst", "general technology professional", "technology specialist"]

        if "law" in field_lower or "legal" in field_lower:
            if is_law_career:
                score += 50
        elif "business" in field_lower or "management" in field_lower or "finance" in field_lower:
            if is_business_career:
                score += 50
        elif "media" in field_lower or "communication" in field_lower or "journalism" in field_lower:
            if is_media_career:
                score += 50
        elif "design" in field_lower or "creative" in field_lower or "art" in field_lower:
            if is_design_career:
                score += 50
        elif "health" in field_lower or "medical" in field_lower or "nurse" in field_lower:
            if is_healthcare_career:
                score += 50
        elif "education" in field_lower or "teach" in field_lower or "instruction" in field_lower:
            if is_education_career:
                score += 50
        elif "technology" in field_lower or "ai" in field_lower or "computer" in field_lower or "software" in field_lower:
            if is_tech_career:
                score += 50

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

    if career_switch:
        if "technology" in field_lower or "ai" in field_lower or "computer" in field_lower:
            careers.append({
                "name": "AI Career Transition Guide",
                "match": "85%",
                "reason": "This path helps you transfer your existing skills into a new AI-focused career.",
                "match_reason": [
                    "AI skills are in demand",
                    "Your experience can be leveraged",
                    "This path offers career growth opportunities"
                ],
                "skills": ["AI fundamentals", "Projects", "Portfolio building"]
            })
        elif "law" in field_lower or "legal" in field_lower:
            careers.append({
                "name": "Legal Operations Specialist",
                "match": "85%",
                "reason": "This path helps you transfer your general skills into legal operations and administrative consulting.",
                "match_reason": [
                    "Operational skills are in demand",
                    "Your experience can be leveraged",
                    "Offers legal field growth"
                ],
                "skills": ["Legal operations", "Case management", "Process improvement"]
            })
        elif "business" in field_lower:
            careers.append({
                "name": "Business Strategy Consultant",
                "match": "85%",
                "reason": "This path helps you transfer your existing experience into strategic business consulting.",
                "match_reason": [
                    "Consulting is in high demand",
                    "Transferable business skills",
                    "High growth potential"
                ],
                "skills": ["Business strategy", "Client advisory", "Market analysis"]
            })

    if freelance:
        if "technology" in field_lower or "ai" in field_lower or "computer" in field_lower:
            careers.append({
                "name": "AI Freelancer",
                "match": "85%",
                "reason": "Freelancing matches your goal of working independently.",
                "match_reason": [
                    "Technical skills can be used for projects",
                    "Freelancing builds experience",
                    "Portfolio projects help attract clients"
                ],
                "skills": ["AI tools", "Building applications", "Communication"]
            })

    if len(careers) == 0:
        if "law" in field_lower or "legal" in field_lower:
            careers.append({
                "name": "Legal Consultant",
                "match": "75%",
                "reason": "A legal consulting career matches your law background.",
                "match_reason": [
                    "Relevant to law field",
                    "Uses analytical skills",
                    "High demand role"
                ],
                "skills": ["Legal Research", "Contract Analysis", "Negotiation"]
            })
        elif "business" in field_lower:
            careers.append({
                "name": "Business Analyst",
                "match": "75%",
                "reason": "A business analyst role leverages your business training.",
                "match_reason": [
                    "Matches business field",
                    "Problem solving",
                    "Career growth"
                ],
                "skills": ["Business Analysis", "Communication", "Strategy"]
            })
        elif "media" in field_lower:
            careers.append({
                "name": "Content Creator",
                "match": "75%",
                "reason": "Content creation matches your media and communication interests.",
                "match_reason": [
                    "Leverages communication skills",
                    "Creative freedom",
                    "Growing digital industry"
                ],
                "skills": ["Content Creation", "Digital Marketing", "Communication"]
            })
        elif "design" in field_lower:
            careers.append({
                "name": "Graphic Designer",
                "match": "75%",
                "reason": "Graphic design matches your design and visual interests.",
                "match_reason": [
                    "Matches creative field",
                    "Visual communication focus",
                    "Freelance opportunities"
                ],
                "skills": ["Graphic Design", "Visual Identity", "Typography"]
            })
        elif "health" in field_lower or "medical" in field_lower:
            careers.append({
                "name": "Healthcare Administrator",
                "match": "75%",
                "reason": "Healthcare administration matches your interests in the medical operations field.",
                "match_reason": [
                    "Relevant to healthcare",
                    "Operational focus",
                    "Stable sector growth"
                ],
                "skills": ["Healthcare Operations", "Compliance", "Communication"]
            })
        elif "education" in field_lower:
            careers.append({
                "name": "Instructional Designer",
                "match": "75%",
                "reason": "Instructional design matches your interest in developing educational systems.",
                "match_reason": [
                    "Matches education sector",
                    "Curriculum design focus",
                    "E-learning demand"
                ],
                "skills": ["Instructional Design", "E-learning Tools", "Communication"]
            })
        else:
            careers.append({
                "name": "General Technology Professional",
                "match": "70%",
                "reason": "A technology career can help you build useful skills.",
                "match_reason": [
                    "Technology skills are valuable",
                    "Projects build experience",
                    "Learning creates opportunities"
                ],
                "skills": ["Programming", "Communication", "Problem solving"]
            })

    careers = sorted(
        careers,
        key=lambda x: int(x["match"].replace("%","")),
        reverse=True
    )
    careers = careers[:3]
    top_career = careers[0]["name"]

    project_suggestions = {
        "AI Application Developer": "Build an AI-powered application using Python and an AI API.",
        "Data Analyst": "Analyse a real dataset and create an interactive dashboard.",
        "Business Analyst": "Create a business case study with process improvement recommendations.",
        "Software Developer": "Build a full-stack or desktop application.",
        "General Technology Professional": "Build a career recommendation AI assistant.",
        "AI Career Transition Guide": "Build a career recommendation AI assistant."
    }
    project = project_suggestions.get(top_career, "Build a project related to your chosen career.")

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

    result += f"\n\nFirst Project:\n\n{project}\n"
    
    # Map raw_careers into option dictionary
    formatted_careers = []
    for c in careers:
        match_int = int(c["match"].replace("%", ""))
        c_role = c["name"]
        
        category = (
            "Law & Legal" if any(kw in c_role.lower() or kw in field_lower for kw in ["law", "legal", "compliance", "attorney"])
            else "Business & Management" if any(kw in c_role.lower() or kw in field_lower for kw in ["business", "finance", "management", "consulting", "hr", "marketing", "sales"])
            else "Media & Communication" if any(kw in c_role.lower() or kw in field_lower for kw in ["media", "content", "journal", "communication"])
            else "Design & Creative" if any(kw in c_role.lower() or kw in field_lower for kw in ["design", "art", "graphic", "ux", "ui", "animat"])
            else "Healthcare & Medical" if any(kw in c_role.lower() or kw in field_lower for kw in ["health", "medical", "nurse", "doctor", "clinical"])
            else "Education & Training" if any(kw in c_role.lower() or kw in field_lower for kw in ["education", "teach", "academic", "lecturer"])
            else "Technology & Engineering"
        )
        
        try:
            from agents.learning_agent import LearningAgent
        except ImportError:
            try:
                from .learning_agent import LearningAgent
            except ImportError:
                from backend.agents.learning_agent import LearningAgent
                
        roadmap_agent = LearningAgent()
        raw_steps = roadmap_agent.create_roadmap_fallback(c_role)
        formatted_steps = []
        for idx, step in enumerate(raw_steps):
            formatted_steps.append({
                "step": f"Step {idx + 1}: {step}",
                "detail": f"Focus on mastering {step} to build your career foundations.",
                "duration": f"Weeks {idx*2 + 1}-{idx*2 + 2}"
            })
            
        c_project = project_suggestions.get(c_role, f"Build a practical {c_role} portfolio project showcasing your skills.")
            
        formatted_careers.append({
            "role": c_role,
            "match": match_int,
            "category": category,
            "why": c["reason"],
            "currentStrengths": ["Domain interest", "Problem solving", "Fast learner"],
            "skillsToLearn": c["skills"],
            "roadmap": formatted_steps,
            "firstProject": c_project
        })

    return {
        "career_recommendations": result,
        "top_career": top_career,
        "roadmap": roadmap,
        "careers": formatted_careers
    }

def generate_career_plan(profile):
    if not has_gemini:
        return generate_career_plan_fallback(profile)

    # Serialize profile details
    if isinstance(profile, dict):
        profile_str = json.dumps(profile, indent=2)
    else:
        profile_str = str(profile)

    prompt = f"""
Analyze the following user profile and recommend exactly 3 tailored, field-specific career paths.
Crucially, match their specific interest field:
- Law/legal users must get legal, compliance, or legal-tech careers.
- Business/finance users must get business, finance, management, consulting or business analysis careers.
- AI/tech users must get AI, data science, machine learning, software developer, etc.
- If it is healthcare, education, or other fields, return roles relevant to that specific field.

Do NOT recommend software engineering or programming to non-tech fields unless it is specifically relevant to their cross-disciplinary goals (e.g. Legal Tech).

Consider the user's:
- Education
- Field
- Current skills
- Experience
- Goals
- Strengths
- Weaknesses

User Profile Details:
{profile_str}
"""

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config={
                'response_mime_type': 'application/json',
                'response_schema': CareerPlanResponse,
            }
        )
        raw_json = json.loads(response.text)
        
        careers = raw_json.get("careers", [])
        if not careers:
            raise ValueError("Empty careers list returned from Gemini API")

        # Map to legacy result format
        rec_text = ""
        top_career = careers[0].get("role", "General Technology Professional")
        
        for c in careers:
            match_pct = f"{c.get('match', 90)}%"
            why_fit = c.get("why", "")
            strengths = c.get("currentStrengths", [])
            if len(strengths) < 3:
                strengths = (strengths + ["Domain knowledge", "Analytical skills", "Effective communication"])[:3]
            skills = c.get("skillsToLearn", [])
            if len(skills) < 3:
                skills = (skills + ["Practical project", "Industry tools", "Best practices"])[:3]

            rec_text += f"""
{c.get('role')}
Match: {match_pct}

Why it fits:
{why_fit}

Why this match:
- {strengths[0]}
- {strengths[1]}
- {strengths[2]}

Skills to learn:
- {skills[0]}
- {skills[1]}
- {skills[2]}

--------------------
"""

        first_project = careers[0].get("firstProject", "Build a domain-specific portfolio project.")
        rec_text += f"\n\nFirst Project:\n\n{first_project}\n"

        # Format roadmap string
        top_roadmap = careers[0].get("roadmap", [])
        roadmap_str = ""
        for idx, step in enumerate(top_roadmap):
            roadmap_str += f"Step {idx + 1}: {step.get('step')}\n- Detail: {step.get('detail')}\n- Duration: {step.get('duration')}\n\n"

        return {
            "career_recommendations": rec_text,
            "top_career": top_career,
            "roadmap": roadmap_str if roadmap_str else "Month 1:\n- Complete foundations",
            "careers": careers,
            "summary": raw_json.get("summary", ""),
            "advice": raw_json.get("advice", "")
        }

    except Exception as e:
        print(f"Error in generate_career_plan using Gemini API: {e}. Falling back to keyword model.")
        return generate_career_plan_fallback(profile)