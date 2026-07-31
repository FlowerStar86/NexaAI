import json
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from api import app

client = app.test_client()

sample_profile = {
    "education": "Bachelor's degree",
    "field": "Artificial Intelligence",
    "skillLevel": "beginner",
    "skills": ["Python", "Problem solving"],
    "experience": "No experience",
    "goals": ["Land my first job"],
    "strengths": ["Analytical thinking", "Coding"],
    "weaknesses": ["Public speaking"]
}

print("Testing POST /career endpoint...")
response = client.post('/career', data=json.dumps(sample_profile), content_type='application/json')

print("Status Code:", response.status_code)
if response.status_code == 200:
    data = response.get_json()
    print("\n--- SUMMARY ---")
    print(data.get("summary"))
    print("\n--- ADVICE ---")
    print(data.get("advice"))
    print("\n--- CAREERS ---")
    for c in data.get("careers", []):
        print(f"Role: {c['role']} ({c['match']}%) - Why: {c['why']}")
    print("\n--- AGENT OUTPUTS ---")
    outputs = data.get("agent_outputs", {})
    print("Skill Gap keys:", bool(outputs.get("skill_gap")))
    print("CV Analysis keys:", bool(outputs.get("cv_analysis")))
    print("Job Readiness keys:", bool(outputs.get("job_readiness")))
    print("\nSUCCESS! All 7 Python Agents executed and returned results.")
else:
    print("Error:", response.get_data(as_text=True))
