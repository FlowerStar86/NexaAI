import os
import sys
import json
from flask import Flask, request, jsonify

# Add backend and backend/agents to Python path so agent imports work
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from flask_cors import CORS
    has_cors = True
except ImportError:
    has_cors = False

try:
    from agents.career_agent import career_agent
    from agents.learning_agent import LearningAgent
    from agents.gemini_career_agent import generate_career_plan
    from agents.skill_gap_agent import analyze_skill_gap
    from agents.cv_agent import analyze_cv
    from agents.job_agent import analyze_job_readiness
    from agents.profile_agent import analyze_profile
except ImportError:
    from backend.agents.career_agent import career_agent
    from backend.agents.learning_agent import LearningAgent
    from backend.agents.gemini_career_agent import generate_career_plan
    from backend.agents.skill_gap_agent import analyze_skill_gap
    from backend.agents.cv_agent import analyze_cv
    from backend.agents.job_agent import analyze_job_readiness
    from backend.agents.profile_agent import analyze_profile

app = Flask(__name__)
@app.route("/healthz")
def healthz():
    return {"status": "ok"}
if has_cors:
    CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Nexa AI Python Flask API is running"})

@app.route('/career', methods=['POST', 'OPTIONS'])
@app.route('/api/career', methods=['POST', 'OPTIONS'])
def career_endpoint():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.get_json(force=True, silent=True) or {}
        
        # Build user profile dict expected by python agents
        user_profile = {
            "education": data.get("education", "High school graduate"),
            "field": data.get("field", "Technology"),
            "skillLevel": data.get("skillLevel", "beginner"),
            "skills": data.get("skills", []),
            "experience": data.get("experience", "No experience"),
            "goals": data.get("goals", ["Get my first job"]),
            "strengths": data.get("strengths", ["Problem solving"]),
            "weaknesses": data.get("weaknesses", []),
            "interests": data.get("field", "Technology"),
            "career_style": "Full-time"
        }

        # 1. Run main orchestrator agent (which executes all 7 agents)
        agent_results = career_agent(user_profile)

        # 2. Extract detailed outputs from individual agents
        primary_field = user_profile.get("field", "Technology")
        top_career = primary_field + " Professional"
        
        # Call profile_agent
        prof_analysis = analyze_profile(user_profile)
        
        # Call gemini_career_agent
        c_plan = generate_career_plan(user_profile)
        if isinstance(c_plan, dict) and "top_career" in c_plan:
            top_career = c_plan["top_career"]

        # Call learning_agent
        learner = LearningAgent()
        field_lower = primary_field.lower()
        career_lower = top_career.lower()

        if "law" in field_lower or "legal" in career_lower:
            raw_roadmap = [
                "Learn legal research methods",
                "Improve contract analysis skills",
                "Practice legal writing and case analysis",
                "Build a legal portfolio",
                "Develop negotiation skills"
            ]
        elif "business" in field_lower or "management" in career_lower:
            raw_roadmap = [
                "Learn business analysis fundamentals",
                "Improve project management skills",
                "Practice market research",
                "Build business case studies",
                "Develop leadership skills"
            ]
        elif "media" in field_lower or "communication" in career_lower:
            raw_roadmap = [
                "Learn content creation tools",
                "Improve communication skills",
                "Build a personal portfolio",
                "Practice digital media projects",
                "Develop branding skills"
            ]
        elif "design" in field_lower or "creative" in field_lower or "art" in career_lower:
            raw_roadmap = [
                "Learn design foundations",
                "Master design tools (Figma, Photoshop)",
                "Study UI/UX & Prototyping",
                "Develop branding & Visual identity",
                "Build a creative portfolio"
            ]
        elif "health" in field_lower or "medical" in field_lower or "nurse" in career_lower or "doctor" in career_lower:
            raw_roadmap = [
                "Understand clinical observation",
                "Learn healthcare systems and workflows",
                "Study Anatomy & Physiology basics",
                "Understand professional ethics & regulations",
                "Develop patient communication skills"
            ]
        elif "education" in field_lower or "teach" in field_lower or "learning" in career_lower:
            raw_roadmap = [
                "Learn teaching methodologies",
                "Develop curriculum design skills",
                "Study classroom management techniques",
                "Explore educational technology tools",
                "Practice student assessment methods"
            ]
        elif "technology" in field_lower or "computer" in field_lower or "ai" in field_lower:
            raw_roadmap = [
                "Learn technical foundations",
                "Build beginner projects",
                "Practice problem solving",
                "Create a portfolio",
                "Explore advanced technologies"
            ]
        else:
            raw_roadmap = [
                "Understand core domain foundations",
                "Master key industry tools and techniques",
                "Implement real-world projects",
                "Build portfolio and professional branding",
                "Explore advanced specialization pathways"
            ]

        # Call skill_gap_agent
        sg_analysis = analyze_skill_gap(user_profile, top_career)

        # Call cv_agent
        cv_res = analyze_cv(user_profile)

        # Call job_agent
        job_res = analyze_job_readiness(user_profile)

        # Convert learning roadmap items to structured steps for the frontend
        formatted_roadmap = []
        if isinstance(raw_roadmap, list):
            for idx, item in enumerate(raw_roadmap):
                formatted_roadmap.append({
                    "step": f"Step {idx + 1}: {item}",
                    "detail": f"Focus on mastering {item} to build your career foundations.",
                    "duration": f"Weeks {idx*2 + 1}-{idx*2 + 2}"
                })
        else:
            formatted_roadmap = [
                {"step": "Phase 1", "detail": str(raw_roadmap), "duration": "1 month"}
            ]

        # Extract skills to learn
        skills_to_learn = []

        if "Skills To Improve:" in sg_analysis:
            lines = sg_analysis.split("Skills To Improve:")[1].split("\n")
            for line in lines:
                if line.strip().startswith("○"):
                    skills_to_learn.append(line.strip().replace("○", "").strip())

        # Field-based fallback skills
        if not skills_to_learn:
            field_lower = user_profile["field"].lower()

            if "law" in field_lower:
                skills_to_learn = ["Legal Research", "Contract Analysis", "Negotiation", "Documentation"]
            elif "business" in field_lower:
                skills_to_learn = ["Business Analysis", "Strategy", "Communication", "Leadership"]
            elif "media" in field_lower:
                skills_to_learn = ["Content Creation", "Digital Marketing", "Communication"]
            elif "design" in field_lower:
                skills_to_learn = ["Design Foundations", "Figma / Design Tools", "Visual Identity", "Prototyping"]
            elif "health" in field_lower:
                skills_to_learn = ["Patient Care", "Clinical Skills", "Empathy", "Documentation"]
            elif "education" in field_lower:
                skills_to_learn = ["Curriculum Design", "Classroom Management", "Communication", "Assessment"]
            elif "technology" in field_lower or "ai" in field_lower:
                skills_to_learn = ["Programming", "AI", "Data", "Technical Skills"]
            else:
                skills_to_learn = ["Problem Solving", "Industry Skills", "Portfolio Projects"]

        strengths_list = user_profile["strengths"] if user_profile["strengths"] else ["Problem solving", "Fast learner"]
        
        # Check if we got structured careers from Gemini/fallback dict
        if isinstance(c_plan, dict) and "careers" in c_plan and isinstance(c_plan["careers"], list) and len(c_plan["careers"]) >= 3:
            careers_structured = []
            for c in c_plan["careers"][:3]:
                if hasattr(c, "dict"):
                    c_dict = c.dict()
                elif isinstance(c, dict):
                    c_dict = c
                else:
                    c_dict = {}

                raw_steps = c_dict.get("roadmap", [])
                formatted_steps = []
                for idx, step in enumerate(raw_steps):
                    if isinstance(step, dict):
                        formatted_steps.append({
                            "step": step.get("step", f"Step {idx + 1}"),
                            "detail": step.get("detail", ""),
                            "duration": step.get("duration", f"Weeks {idx*2 + 1}-{idx*2 + 2}")
                        })
                    elif hasattr(step, "dict"):
                        step_dict = step.dict()
                        formatted_steps.append({
                            "step": step_dict.get("step", f"Step {idx + 1}"),
                            "detail": step_dict.get("detail", ""),
                            "duration": step_dict.get("duration", f"Weeks {idx*2 + 1}-{idx*2 + 2}")
                        })
                    else:
                        formatted_steps.append({
                            "step": f"Step {idx + 1}: {str(step)}",
                            "detail": f"Focus on mastering {str(step)} to build your career foundations.",
                            "duration": f"Weeks {idx*2 + 1}-{idx*2 + 2}"
                        })

                c_strengths = c_dict.get("currentStrengths", [])
                if not isinstance(c_strengths, list) or not c_strengths:
                    c_strengths = strengths_list
                c_skills = c_dict.get("skillsToLearn", [])
                if not isinstance(c_skills, list) or not c_skills:
                    c_skills = skills_to_learn

                careers_structured.append({
                    "role": c_dict.get("role") or c_dict.get("name") or top_career,
                    "match": c_dict.get("match", 90),
                    "category": c_dict.get("category") or "General",
                    "why": c_dict.get("why") or c_dict.get("reason", ""),
                    "currentStrengths": c_strengths,
                    "skillsToLearn": c_skills[:5],
                    "roadmap": formatted_steps,
                    "firstProject": c_dict.get("firstProject", "Build a domain-specific portfolio project.")
                })
        else:
            # Fallback inline manual construction
            skills_to_learn_c2 = (
                ["Legal Research", "Contract Analysis", "Negotiation", "Documentation"] if "law" in primary_field.lower()
                else ["Business Analysis", "Strategy", "Communication", "Leadership"] if "business" in primary_field.lower()
                else ["Content Creation", "Digital Marketing", "Communication"] if "media" in primary_field.lower()
                else ["Design Foundations", "Figma / Design Tools", "Visual Identity"] if "design" in primary_field.lower()
                else ["Patient Care", "Clinical Skills", "Empathy", "Documentation"] if "health" in primary_field.lower()
                else ["Curriculum Design", "Classroom Management", "Communication"] if "educat" in primary_field.lower()
                else ["Programming", "AI", "Data", "Technical Skills"]
            )
            skills_to_learn_c3 = (
                ["Strategy", "Case Analysis", "Client Communication"] if "law" in primary_field.lower()
                else ["Strategy", "Project Management", "Problem Solving"] if "business" in primary_field.lower()
                else ["Branding", "Audience Engagement", "Communication"] if "media" in primary_field.lower()
                else ["Prototyping", "User Research", "Portfolio Projects"] if "design" in primary_field.lower()
                else ["Healthcare Systems", "Compliance", "Ethics"] if "health" in primary_field.lower()
                else ["Teaching Methods", "Educational Tech", "Mentorship"] if "educat" in primary_field.lower()
                else ["Strategy", "Client Communication", "Problem Solving"]
            )
            careers_structured = [
                {
                    "role": top_career,
                    "match": 95,
                    "category": (
                        "Law & Legal" if "law" in primary_field.lower() or "legal" in top_career.lower()
                        else "Business & Management" if "business" in primary_field.lower()
                        else "Media & Communication" if "media" in primary_field.lower()
                        else "Design & Creative" if "design" in primary_field.lower()
                        else "Healthcare & Medical" if "health" in primary_field.lower()
                        else "Education & Training" if "educat" in primary_field.lower()
                        else "Technology & Engineering"
                    ),
                    "why": f"Your interest in {primary_field} and background match this role. {prof_analysis.splitlines()[0] if prof_analysis else ''}",
                    "currentStrengths": strengths_list,
                    "skillsToLearn": skills_to_learn[:5],
                    "roadmap": formatted_roadmap,
                    "firstProject": f"Build a practical {top_career} portfolio project showcasing your skills."
                },
                {
                    "role": f"{primary_field} Specialist",
                    "match": 88,
                    "category": "Domain Specialization",
                    "why": f"Directly leverages your goal to excel in {primary_field}.",
                    "currentStrengths": strengths_list,
                    "skillsToLearn": skills_to_learn_c2[:5],
                    "roadmap": formatted_roadmap[:3],
                    "firstProject": f"Create a project focused on {primary_field}."
                },
                {
                    "role": "Business Consultant" if "law" not in primary_field.lower() else "Legal Advisor",
                    "match": 82,
                    "category": "Consulting & Strategy",
                    "why": "Combines your skills with strategic thinking, communication, and problem solving.",
                    "currentStrengths": strengths_list,
                    "skillsToLearn": skills_to_learn_c3[:5],
                    "roadmap": formatted_roadmap[:3],
                    "firstProject": f"Develop a case study related to {primary_field}."
                }
            ]

        summary_text = ""
        if isinstance(c_plan, dict) and c_plan.get("summary"):
            summary_text = c_plan["summary"]
        if not summary_text:
            summary_text = (
                f"Based on your profile in {user_profile['field']}, you have a clear foundation with education in {user_profile['education']} "
                f"and experience level '{user_profile['experience']}'. Nexa's multi-agent system has generated a personalized plan to reach your goals."
            )

        advice_text = ""
        if isinstance(c_plan, dict) and c_plan.get("advice"):
            advice_text = c_plan["advice"]
        if not advice_text:
            advice_text = (
                f"Job Readiness: {job_res.strip().splitlines()[0] if job_res else 'Ready for next step'}.\n"
                f"CV Tip: {cv_res.strip().splitlines()[-1] if cv_res else 'Keep updating achievements'}.\n"
                f"Skill Gap: Focus on closing identified gaps in {', '.join(skills_to_learn[:3])}."
            )

        response_payload = {
            "summary": summary_text,
            "advice": advice_text,
            "careers": careers_structured,
            "agent_outputs": {
                "career_recommendations": agent_results.get("career_recommendations"),
                "skill_gap": sg_analysis,
                "cv_analysis": cv_res,
                "job_readiness": job_res,
                "learning_roadmap": raw_roadmap,
                "next_steps": agent_results.get("next_steps", [])
            }
        }

        return jsonify(response_payload), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting Nexa AI Python Flask API Server on http://127.0.0.1:5000...")
    app.run(host='0.0.0.0', port=5000, debug=False)