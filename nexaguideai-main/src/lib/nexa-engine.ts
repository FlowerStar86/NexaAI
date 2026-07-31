// Nexa AI — deterministic personalization engine
// Generates career recommendations, skill gaps, roadmap, CV tips, interview
// sets, projects, courses, and an action plan from a user profile. No
// network / AI calls — pure functions with per-user variation.

export type Experience = "" | "none" | "<1" | "1-3" | "3-5" | "5+";
export type SkillLevel = "" | "none" | "beginner" | "intermediate" | "advanced";

export type Profile = {
  education: string;
  field: string;
  skills: string[];
  skillLevel?: SkillLevel;
  experience: Experience;
  goals: string[];
  strengths: string[];
  weaknesses: string[];
};

export const emptyProfile: Profile = {
  education: "",
  field: "",
  skills: [],
  skillLevel: "",
  experience: "",
  goals: [],
  strengths: [],
  weaknesses: [],
};

const STORAGE_KEY = "nexa.profile.v1";

export function saveProfile(p: Profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

export function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...emptyProfile, ...parsed };
  } catch {
    return null;
  }
}

export const experienceLabel: Record<Experience, string> = {
  "": "unspecified",
  none: "no experience",
  "<1": "less than a year",
  "1-3": "1–3 years",
  "3-5": "3–5 years",
  "5+": "5+ years",
};

// ---------- Career catalog ----------
type Category =
  | "ai"
  | "engineering"
  | "data"
  | "security"
  | "cloud"
  | "mobile"
  | "design"
  | "product"
  | "marketing"
  | "finance"
  | "ops"
  | "content"
  | "healthcare"
  | "education"
  | "legal"
  | "physical-eng"
  | "creative-media"
  | "hospitality";

type Track = {
  id: string;
  role: string;
  category: Category;
  salary: string;
  requiredSkills: string[];
  keywords: string[];
  goodFor: string[];
  minExperience: 0 | 1 | 2 | 3;
  educationHint?: string[];
};

const experienceRank: Record<Experience, number> = {
  "": 0, none: 0, "<1": 0, "1-3": 1, "3-5": 2, "5+": 3,
};

const skillLevelBonus: Record<SkillLevel, number> = {
  "": 0, none: 0, beginner: 1, intermediate: 3, advanced: 6,
};

const TRACKS: Track[] = [
  // Technology
  { id: "ai-engineer", role: "AI Engineer", category: "ai", salary: "$130k–$210k",
    requiredSkills: ["python", "pytorch", "llms", "prompt engineering", "vector databases", "apis"],
    keywords: ["ai", "artificial intelligence", "llm", "generative", "machine learning", "computer science"],
    goodFor: ["Switch careers", "Level up my current role", "Build a startup"], minExperience: 1,
    educationHint: ["computer", "math", "engineering", "physics"] },
  { id: "ml-engineer", role: "Machine Learning Engineer", category: "ai", salary: "$120k–$195k",
    requiredSkills: ["python", "pytorch", "tensorflow", "statistics", "sql", "mlops"],
    keywords: ["ai", "machine learning", "ml", "data", "computer science"],
    goodFor: ["Switch careers", "Level up my current role", "Get promoted"], minExperience: 1,
    educationHint: ["computer", "math", "statistics"] },
  { id: "software-engineer", role: "Software Engineer", category: "engineering", salary: "$95k–$165k",
    requiredSkills: ["python", "javascript", "typescript", "git", "system design", "testing"],
    keywords: ["software", "engineering", "programming", "coding", "developer", "computer"],
    goodFor: ["Land my first job", "Switch careers", "Level up my current role"], minExperience: 0 },
  { id: "web-developer", role: "Web Developer", category: "engineering", salary: "$70k–$130k",
    requiredSkills: ["html", "css", "javascript", "react", "git", "responsive design"],
    keywords: ["web", "frontend", "developer", "software", "internet"],
    goodFor: ["Land my first job", "Freelance / go independent", "Switch careers"], minExperience: 0 },
  { id: "mobile-developer", role: "Mobile Developer", category: "mobile", salary: "$85k–$155k",
    requiredSkills: ["swift", "kotlin", "react native", "flutter", "apis", "ui"],
    keywords: ["mobile", "ios", "android", "app"],
    goodFor: ["Freelance / go independent", "Land my first job", "Build a startup"], minExperience: 0 },
  { id: "data-scientist", role: "Data Scientist", category: "data", salary: "$110k–$170k",
    requiredSkills: ["python", "statistics", "sql", "ml", "communication"],
    keywords: ["data", "science", "analytics", "statistics", "research"],
    goodFor: ["Level up my current role", "Switch careers"], minExperience: 1 },
  { id: "data-analyst", role: "Data Analyst", category: "data", salary: "$65k–$110k",
    requiredSkills: ["sql", "excel", "python", "tableau", "communication"],
    keywords: ["data", "analytics", "business", "reporting"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "security-analyst", role: "Cybersecurity Analyst", category: "security", salary: "$80k–$130k",
    requiredSkills: ["networking", "linux", "siem", "incident response", "risk analysis"],
    keywords: ["security", "cyber", "network", "it", "defense"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "cloud-engineer", role: "Cloud Engineer", category: "cloud", salary: "$105k–$170k",
    requiredSkills: ["aws", "terraform", "linux", "networking", "docker", "kubernetes"],
    keywords: ["cloud", "aws", "azure", "gcp", "infrastructure"],
    goodFor: ["Level up my current role", "Switch careers"], minExperience: 1 },
  { id: "devops-engineer", role: "DevOps Engineer", category: "cloud", salary: "$110k–$180k",
    requiredSkills: ["kubernetes", "terraform", "ci/cd", "linux", "aws", "monitoring"],
    keywords: ["devops", "platform", "sre", "cloud"],
    goodFor: ["Level up my current role", "Get promoted"], minExperience: 1 },
  { id: "ux-designer", role: "UI/UX Designer", category: "design", salary: "$75k–$135k",
    requiredSkills: ["figma", "user research", "prototyping", "design systems", "ux writing"],
    keywords: ["design", "ux", "ui", "product", "creative"],
    goodFor: ["Land my first job", "Switch careers", "Freelance / go independent"], minExperience: 0 },
  { id: "qa-engineer", role: "QA Engineer", category: "engineering", salary: "$65k–$115k",
    requiredSkills: ["testing", "selenium", "cypress", "attention to detail", "sql", "scripting"],
    keywords: ["qa", "testing", "quality", "software"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "game-developer", role: "Game Developer", category: "engineering", salary: "$70k–$130k",
    requiredSkills: ["c#", "unity", "unreal", "c++", "3d math", "physics"],
    keywords: ["game", "gaming", "unity", "unreal", "graphics", "creative"],
    goodFor: ["Land my first job", "Freelance / go independent", "Build a startup"], minExperience: 0 },
  { id: "network-engineer", role: "Network Engineer", category: "cloud", salary: "$75k–$130k",
    requiredSkills: ["networking", "tcp/ip", "routing", "linux", "cisco", "troubleshooting"],
    keywords: ["network", "it", "infrastructure", "telecom"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0 },

  // Business
  { id: "business-analyst", role: "Business Analyst", category: "ops", salary: "$70k–$115k",
    requiredSkills: ["excel", "sql", "requirements", "communication", "process design", "stakeholder management"],
    keywords: ["business", "analyst", "operations", "consulting", "commerce"],
    goodFor: ["Land my first job", "Switch careers", "Level up my current role"], minExperience: 0 },
  { id: "project-manager", role: "Project Manager", category: "ops", salary: "$85k–$140k",
    requiredSkills: ["project management", "communication", "planning", "risk management", "leadership", "budgeting"],
    keywords: ["project", "management", "operations", "delivery"],
    goodFor: ["Get promoted", "Switch careers"], minExperience: 1 },
  { id: "hr-specialist", role: "Human Resources Specialist", category: "ops", salary: "$55k–$100k",
    requiredSkills: ["communication", "recruiting", "empathy", "policy", "conflict resolution", "hris"],
    keywords: ["hr", "human resources", "people", "recruiting", "psychology"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "marketing-specialist", role: "Marketing Specialist", category: "marketing", salary: "$55k–$95k",
    requiredSkills: ["copywriting", "seo", "analytics", "social media", "email", "creativity"],
    keywords: ["marketing", "communications", "brand", "business"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "digital-marketer", role: "Digital Marketer", category: "marketing", salary: "$65k–$120k",
    requiredSkills: ["seo", "sem", "analytics", "ads", "copywriting", "experimentation"],
    keywords: ["digital", "marketing", "growth", "advertising", "seo"],
    goodFor: ["Freelance / go independent", "Build a startup", "Switch careers"], minExperience: 0 },
  { id: "sales-rep", role: "Sales Representative", category: "ops", salary: "$50k–$130k",
    requiredSkills: ["communication", "negotiation", "prospecting", "crm", "empathy", "resilience"],
    keywords: ["sales", "business", "commercial", "account"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "entrepreneur", role: "Entrepreneur / Founder", category: "product", salary: "Variable",
    requiredSkills: ["strategy", "communication", "sales", "resilience", "product", "leadership"],
    keywords: ["entrepreneur", "founder", "startup", "business", "innovation"],
    goodFor: ["Build a startup", "Freelance / go independent"], minExperience: 0 },

  // Finance
  { id: "accountant", role: "Accountant", category: "finance", salary: "$55k–$95k",
    requiredSkills: ["accounting", "excel", "reconciliation", "tax", "attention to detail", "gaap"],
    keywords: ["accounting", "finance", "bookkeeping", "audit"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },
  { id: "financial-analyst", role: "Financial Analyst", category: "finance", salary: "$75k–$125k",
    requiredSkills: ["excel", "modeling", "accounting", "sql", "communication", "valuation"],
    keywords: ["finance", "analyst", "business", "economics"],
    goodFor: ["Land my first job", "Get promoted"], minExperience: 0 },
  { id: "investment-analyst", role: "Investment Analyst", category: "finance", salary: "$85k–$150k",
    requiredSkills: ["valuation", "modeling", "research", "excel", "presentation", "markets"],
    keywords: ["investment", "finance", "equity", "markets", "banking"],
    goodFor: ["Get promoted", "Switch careers"], minExperience: 1 },
  { id: "auditor", role: "Auditor", category: "finance", salary: "$60k–$110k",
    requiredSkills: ["accounting", "risk analysis", "gaap", "attention to detail", "communication", "excel"],
    keywords: ["audit", "finance", "compliance", "accounting"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0 },

  // Healthcare
  { id: "nurse", role: "Nurse", category: "healthcare", salary: "$65k–$110k",
    requiredSkills: ["patient care", "empathy", "clinical skills", "communication", "critical thinking", "documentation"],
    keywords: ["nursing", "health", "medical", "patient", "clinical"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0,
    educationHint: ["nursing", "health", "biology"] },
  { id: "doctor", role: "Doctor / Physician", category: "healthcare", salary: "$180k–$350k",
    requiredSkills: ["clinical skills", "diagnosis", "empathy", "communication", "critical thinking", "medical knowledge"],
    keywords: ["medicine", "doctor", "physician", "health", "medical"],
    goodFor: ["Level up my current role", "Switch careers"], minExperience: 2,
    educationHint: ["medic", "md", "health"] },
  { id: "pharmacist", role: "Pharmacist", category: "healthcare", salary: "$110k–$150k",
    requiredSkills: ["pharmacology", "attention to detail", "communication", "chemistry", "counseling", "compliance"],
    keywords: ["pharmacy", "pharmacist", "medical", "chemistry"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 1,
    educationHint: ["pharm", "chem", "health"] },
  { id: "med-lab-tech", role: "Medical Laboratory Technician", category: "healthcare", salary: "$50k–$85k",
    requiredSkills: ["lab techniques", "attention to detail", "biology", "chemistry", "documentation", "safety"],
    keywords: ["laboratory", "lab", "medical", "biology", "chemistry"],
    goodFor: ["Land my first job"], minExperience: 0,
    educationHint: ["biology", "chem", "health", "medical"] },
  { id: "healthcare-admin", role: "Healthcare Administrator", category: "healthcare", salary: "$75k–$135k",
    requiredSkills: ["operations", "communication", "leadership", "budgeting", "compliance", "analytics"],
    keywords: ["healthcare", "administration", "hospital", "management"],
    goodFor: ["Get promoted", "Switch careers"], minExperience: 1 },

  // Education
  { id: "teacher", role: "Teacher (K–12)", category: "education", salary: "$45k–$85k",
    requiredSkills: ["communication", "curriculum", "empathy", "classroom management", "assessment", "creativity"],
    keywords: ["teach", "teacher", "education", "school", "k-12"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0,
    educationHint: ["education", "teach"] },
  { id: "lecturer", role: "Lecturer / Professor", category: "education", salary: "$65k–$130k",
    requiredSkills: ["subject expertise", "research", "writing", "public speaking", "curriculum", "mentorship"],
    keywords: ["lecturer", "professor", "academic", "university", "research"],
    goodFor: ["Get promoted", "Level up my current role"], minExperience: 2,
    educationHint: ["phd", "master", "msc"] },
  { id: "instructional-designer", role: "Instructional Designer", category: "education", salary: "$65k–$105k",
    requiredSkills: ["curriculum", "writing", "user research", "elearning", "assessment", "communication"],
    keywords: ["education", "learning", "training", "curriculum"],
    goodFor: ["Switch careers", "Freelance / go independent"], minExperience: 0 },

  // Creative
  { id: "graphic-designer", role: "Graphic Designer", category: "design", salary: "$50k–$95k",
    requiredSkills: ["adobe illustrator", "adobe photoshop", "typography", "layout", "branding", "creativity"],
    keywords: ["graphic", "design", "creative", "art", "visual"],
    goodFor: ["Land my first job", "Freelance / go independent"], minExperience: 0 },
  { id: "content-creator", role: "Content Creator", category: "content", salary: "Variable",
    requiredSkills: ["writing", "video", "storytelling", "editing", "social media", "seo"],
    keywords: ["content", "creator", "influencer", "media", "youtube", "creative"],
    goodFor: ["Freelance / go independent", "Build a startup"], minExperience: 0 },
  { id: "video-editor", role: "Video Editor", category: "creative-media", salary: "$50k–$95k",
    requiredSkills: ["premiere", "after effects", "davinci resolve", "storytelling", "color grading", "audio"],
    keywords: ["video", "editing", "film", "media", "creative"],
    goodFor: ["Freelance / go independent", "Land my first job"], minExperience: 0 },
  { id: "photographer", role: "Photographer", category: "creative-media", salary: "Variable",
    requiredSkills: ["composition", "lighting", "lightroom", "photoshop", "storytelling", "client management"],
    keywords: ["photo", "photography", "creative", "media", "art"],
    goodFor: ["Freelance / go independent"], minExperience: 0 },
  { id: "animator", role: "Animator", category: "creative-media", salary: "$55k–$110k",
    requiredSkills: ["after effects", "blender", "storyboarding", "motion", "rigging", "creativity"],
    keywords: ["animation", "motion", "3d", "creative", "art"],
    goodFor: ["Freelance / go independent", "Land my first job"], minExperience: 0 },

  // Engineering & Other
  { id: "lawyer", role: "Lawyer", category: "legal", salary: "$85k–$200k",
    requiredSkills: ["legal research", "writing", "argumentation", "attention to detail", "negotiation", "ethics"],
    keywords: ["law", "lawyer", "legal", "attorney", "justice"],
    goodFor: ["Get promoted", "Level up my current role"], minExperience: 1,
    educationHint: ["law", "jd", "legal"] },
  { id: "architect", role: "Architect", category: "physical-eng", salary: "$75k–$135k",
    requiredSkills: ["autocad", "revit", "design", "spatial reasoning", "building codes", "sketching"],
    keywords: ["architecture", "building", "design", "construction"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0,
    educationHint: ["architect"] },
  { id: "civil-engineer", role: "Civil Engineer", category: "physical-eng", salary: "$70k–$120k",
    requiredSkills: ["autocad", "structural analysis", "physics", "math", "project management", "materials"],
    keywords: ["civil", "engineering", "construction", "infrastructure"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0,
    educationHint: ["engineering", "civil"] },
  { id: "mechanical-engineer", role: "Mechanical Engineer", category: "physical-eng", salary: "$75k–$130k",
    requiredSkills: ["solidworks", "cad", "thermodynamics", "math", "physics", "materials"],
    keywords: ["mechanical", "engineering", "manufacturing", "physics"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0,
    educationHint: ["engineering", "mechanical", "physics"] },
  { id: "electrical-engineer", role: "Electrical Engineer", category: "physical-eng", salary: "$80k–$140k",
    requiredSkills: ["circuits", "signal processing", "matlab", "math", "physics", "embedded"],
    keywords: ["electrical", "engineering", "electronics", "circuits"],
    goodFor: ["Land my first job", "Level up my current role"], minExperience: 0,
    educationHint: ["engineering", "electrical", "physics"] },
  { id: "hospitality-manager", role: "Hospitality Manager", category: "hospitality", salary: "$55k–$100k",
    requiredSkills: ["communication", "leadership", "customer service", "operations", "budgeting", "empathy"],
    keywords: ["hospitality", "hotel", "restaurant", "tourism", "service"],
    goodFor: ["Get promoted", "Switch careers"], minExperience: 1 },
  { id: "logistics-coordinator", role: "Logistics Coordinator", category: "ops", salary: "$50k–$85k",
    requiredSkills: ["operations", "excel", "supply chain", "attention to detail", "communication", "problem solving"],
    keywords: ["logistics", "supply", "operations", "shipping", "warehouse"],
    goodFor: ["Land my first job", "Switch careers"], minExperience: 0 },

  // Product / Advanced
  { id: "product-manager", role: "Product Manager", category: "product", salary: "$105k–$170k",
    requiredSkills: ["strategy", "communication", "user research", "roadmapping", "analytics"],
    keywords: ["product", "business", "strategy", "management"],
    goodFor: ["Get promoted", "Switch careers", "Build a startup"], minExperience: 1 },
];

// ---------- Utilities ----------
const norm = (s: string) => s.toLowerCase().trim();
const overlap = (a: string[], b: string[]) => {
  const setB = new Set(b.map(norm));
  return a.filter((x) => setB.has(norm(x)));
};

function fieldMatch(field: string, keywords: string[]) {
  const f = norm(field);
  if (!f) return 0;
  let score = 0;
  for (const k of keywords) if (f.includes(k) || k.includes(f)) score++;
  return score;
}

function educationMatch(edu: string, hints?: string[]) {
  if (!hints) return 0;
  const e = norm(edu);
  if (!e) return 0;
  let score = 0;
  for (const h of hints) if (e.includes(h)) score++;
  return score;
}

function profileHash(p: Profile): number {
  const key = [p.education, p.field, p.experience, p.skillLevel ?? "", ...p.skills, ...p.goals, ...p.strengths, ...p.weaknesses]
    .join("|").toLowerCase();
  let h = 2166136261 >>> 0;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function pick<T>(arr: T[], seed: number, n: number): T[] {
  if (arr.length <= n) return arr.slice();
  const out: T[] = [];
  const used = new Set<number>();
  let s = seed || 1;
  while (out.length < n) {
    s = (Math.imul(s, 48271) + 1) >>> 0;
    const idx = s % arr.length;
    if (!used.has(idx)) { used.add(idx); out.push(arr[idx]); }
  }
  return out;
}

// ---------- Recommendations ----------
export type Recommendation = {
  role: string;
  match: number;
  salary: string;
  tags: string[];
  why: string;
  track: Track;
};

export function recommendCareers(p: Profile): Recommendation[] {
  const userSkills = p.skills.map(norm);
  const expRank = experienceRank[p.experience];
  const levelBonus = skillLevelBonus[p.skillLevel ?? ""];
  const seed = profileHash(p);
  const hasAnySignal =
    !!p.field || !!p.education || p.skills.length > 0 || p.goals.length > 0 ||
    p.strengths.length > 0 || !!p.experience;

  const scored = TRACKS.map((t) => {
    const fm = fieldMatch(p.field, t.keywords);
    const em = educationMatch(p.education, t.educationHint);
    const skillHits = overlap(userSkills, t.requiredSkills);
    const goalHits = overlap(p.goals, t.goodFor);
    const weaknessHits = overlap(p.weaknesses.map(norm), t.requiredSkills);
    const strengthHits = overlap(p.strengths.map(norm), t.requiredSkills);
    const expFit = Math.max(0, 3 - Math.abs(expRank - t.minExperience));

    let raw =
      fm * 14 +
      em * 8 +
      skillHits.length * 9 +
      goalHits.length * 7 +
      strengthHits.length * 6 +
      expFit * 4 +
      levelBonus -
      weaknessHits.length * 3;

    // Per-user variation (larger when signals are sparse so results diverge)
    const variationWeight = hasAnySignal && (fm + skillHits.length + goalHits.length) > 0 ? 0.4 : 2.2;
    raw += (((seed ^ t.id.charCodeAt(0) ^ (t.id.charCodeAt(1) || 0)) % 11) - 5) * variationWeight;

    const match = Math.max(48, Math.min(96, Math.round(58 + raw * 1.6)));

    const reasons: string[] = [];
    if (fm > 0) reasons.push(`aligns with your background in ${p.field}`);
    if (em > 0) reasons.push(`your education in ${p.education} supports this path`);
    if (skillHits.length) reasons.push(`uses ${skillHits.slice(0, 3).join(", ")}`);
    if (goalHits.length) reasons.push(`matches your goal to ${goalHits[0].toLowerCase()}`);
    if (strengthHits.length) reasons.push(`plays to your strength in ${strengthHits[0]}`);
    if (!reasons.length) {
      reasons.push(
        p.skills.length === 0
          ? "an accessible entry point given your profile — no prior skills required"
          : "an adjacent path we surfaced from your profile signals"
      );
    }

    const tags = skillHits.length ? skillHits : t.requiredSkills;
    return {
      track: t,
      role: t.role,
      match,
      salary: t.salary,
      tags: tags.slice(0, 3).map(cap),
      why: reasons.slice(0, 2).join(" · "),
    };
  });

  scored.sort((a, b) => b.match - a.match);
  const picked: Recommendation[] = [];
  const usedCat = new Set<string>();
  for (const r of scored) {
    if (picked.length >= 3) break;
    if (!usedCat.has(r.track.category) || picked.length >= 2) {
      picked.push(r);
      usedCat.add(r.track.category);
    }
  }
  while (picked.length < 3) picked.push(scored[picked.length]);
  return picked;
}

function cap(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---------- Current strengths ----------
export type StrengthItem = { name: string; detail: string };

export function currentStrengths(p: Profile, top: Recommendation): StrengthItem[] {
  const items: StrengthItem[] = [];
  const seen = new Set<string>();
  const req = new Set(top.track.requiredSkills.map(norm));

  for (const s of p.strengths) {
    const n = norm(s);
    if (seen.has(n)) continue;
    seen.add(n);
    items.push({
      name: cap(s),
      detail: req.has(n)
        ? `Core requirement for ${top.role} — lead with this.`
        : `Transferable strength that differentiates you as ${top.role}.`,
    });
  }
  for (const s of p.skills) {
    if (items.length >= 5) break;
    const n = norm(s);
    if (seen.has(n)) continue;
    if (req.has(n)) {
      seen.add(n);
      items.push({ name: cap(s), detail: `Directly used on the job in ${top.role} roles.` });
    }
  }
  if (!items.length) {
    items.push({
      name: cap(p.field || "Willingness to learn"),
      detail: p.field
        ? `Your background in ${p.field} is the raw material — layer role-specific skills on top.`
        : `Starting from zero is common — Nexa's roadmap below assumes no prior skills.`,
    });
  }
  return items.slice(0, 5);
}

// ---------- Skills to improve ----------
export type SkillGap = { name: string; level: number; target: number };

export function skillGaps(p: Profile, top: Recommendation): SkillGap[] {
  const userSkills = new Set(p.skills.map(norm));
  const weakness = new Set(p.weaknesses.map(norm));
  const strength = new Set(p.strengths.map(norm));
  const expRank = experienceRank[p.experience];
  const level = skillLevelBonus[p.skillLevel ?? ""];
  const seed = profileHash(p);

  const gaps: SkillGap[] = top.track.requiredSkills.map((s, i) => {
    const has = userSkills.has(s);
    const isWeak = weakness.has(s);
    const isStrong = strength.has(s);

    let val = 10 + expRank * 8 + level * 2 + ((seed >> (i % 20)) % 8);
    if (has) val += 30;
    if (isStrong) val += 20;
    if (isWeak) val -= 10;
    val = Math.max(5, Math.min(90, val));

    let target = 78 + expRank * 4;
    if (isWeak) target += 5;
    target = Math.min(95, target);

    return { name: cap(s), level: val, target };
  });

  for (const w of p.weaknesses) {
    if (gaps.length >= 7) break;
    const n = norm(w);
    if (!top.track.requiredSkills.includes(n)) {
      gaps.push({ name: cap(w), level: 15 + expRank * 5, target: 80 });
    }
  }

  gaps.sort((a, b) => b.target - b.level - (a.target - a.level));
  return gaps.slice(0, 5);
}

// ---------- Roadmap ----------
export type RoadmapItem = { week: string; title: string; done: boolean; active?: boolean };

export function buildRoadmap(p: Profile, top: Recommendation, gaps: SkillGap[]): RoadmapItem[] {
  const expRank = experienceRank[p.experience];
  const focus = gaps.slice(0, 3).map((g) => g.name);
  const rolePath = top.role;
  const noSkills = p.skills.length === 0 || p.skillLevel === "none";

  const items: Omit<RoadmapItem, "done" | "active">[] = noSkills
    ? [
        { week: "Week 1–2", title: `Beginner primer for ${rolePath}` },
        { week: "Week 3–4", title: `Learn the basics of ${focus[0] ?? top.track.requiredSkills[0]}` },
        { week: "Week 5–6", title: `Hands-on: guided tutorial covering ${focus[1] ?? "core tools"}` },
        { week: "Week 7–8", title: `Build your first small project` },
        { week: "Week 9+",  title: `Publish it publicly and get feedback` },
      ]
    : [
        { week: "Week 1–2", title: `Audit fundamentals for ${rolePath}` },
        { week: "Week 3–4", title: focus[0] ? `Deep-dive: ${focus[0]}` : `Core toolkit for ${top.track.category}` },
        { week: "Week 5–6", title: focus[1] ? `Build a project using ${focus[1]}` : `Ship a portfolio-worthy project` },
        { week: "Week 7–8", title: focus[2] ? `Advance ${focus[2]} with real feedback` : `Case study & portfolio polish` },
        { week: "Week 9+",  title: p.goals.includes("Land my first job") || p.goals.includes("Switch careers")
            ? "Mock interviews & targeted applications"
            : "Stakeholder showcase & promotion pitch" },
      ];

  const doneCount = Math.min(items.length - 1, expRank);
  return items.map((it, i) => ({ ...it, done: i < doneCount, active: i === doneCount }));
}

// ---------- Projects ----------
export type ProjectIdea = { title: string; desc: string; skills: string[]; difficulty: "Starter" | "Intermediate" | "Advanced" };

const genericStarters: ProjectIdea[] = [
  { title: "30-day learning log", desc: "Publish daily notes as you learn — proves consistency to future employers.", skills: ["writing", "consistency"], difficulty: "Starter" },
  { title: "Reverse-engineer a favorite", desc: "Pick something you admire in the field and produce a public teardown.", skills: ["research", "writing"], difficulty: "Starter" },
];

const PROJECTS_BY_CATEGORY: Record<Category, ProjectIdea[]> = {
  ai: [
    { title: "RAG assistant over your notes", desc: "Retrieval-augmented chatbot over your own docs.", skills: ["python", "llms"], difficulty: "Intermediate" },
    { title: "Fine-tuned classifier", desc: "Fine-tune a small model on a domain dataset.", skills: ["pytorch"], difficulty: "Advanced" },
    { title: "Prompt evaluation harness", desc: "Score prompt variants on a labeled dataset.", skills: ["prompt engineering"], difficulty: "Starter" },
  ],
  engineering: [
    { title: "Production-grade REST API", desc: "Design, document, and deploy a small API with auth, tests, and CI.", skills: ["apis", "testing"], difficulty: "Intermediate" },
    { title: "Full-stack side project", desc: "Ship a real product end-to-end.", skills: ["react", "typescript"], difficulty: "Intermediate" },
    { title: "Open-source contribution", desc: "Land 3 merged PRs to a mid-size project.", skills: ["git"], difficulty: "Starter" },
  ],
  data: [
    { title: "End-to-end analytics case", desc: "Public dataset → cleaned → dashboard → written insight.", skills: ["sql", "python"], difficulty: "Starter" },
    { title: "A/B test simulation", desc: "Simulate an experiment and write a decision memo.", skills: ["statistics"], difficulty: "Intermediate" },
    { title: "ML model with a story", desc: "Focus the writeup on business impact, not accuracy.", skills: ["ml"], difficulty: "Intermediate" },
  ],
  security: [
    { title: "Home SOC lab", desc: "Set up SIEM + detections on a small lab network.", skills: ["siem", "linux"], difficulty: "Intermediate" },
    { title: "CTF writeups", desc: "Solve and write up 5 CTFs across web, crypto, and forensics.", skills: ["scripting"], difficulty: "Starter" },
    { title: "Threat model a real app", desc: "STRIDE model + top-5 mitigations for an OSS app.", skills: ["threat modeling"], difficulty: "Advanced" },
  ],
  cloud: [
    { title: "IaC-only production stack", desc: "Deploy an app with Terraform — no click-ops.", skills: ["terraform", "aws"], difficulty: "Intermediate" },
    { title: "Kubernetes from scratch", desc: "Multi-service app on k8s with autoscaling.", skills: ["kubernetes"], difficulty: "Advanced" },
    { title: "Cost teardown", desc: "Analyze a real cloud bill and propose a savings plan.", skills: ["aws"], difficulty: "Starter" },
  ],
  mobile: [
    { title: "Cross-platform MVP", desc: "Ship a small app to both stores with offline mode.", skills: ["react native"], difficulty: "Intermediate" },
    { title: "Native performance study", desc: "Rewrite one screen natively and benchmark.", skills: ["swift"], difficulty: "Advanced" },
  ],
  design: [
    { title: "End-to-end product redesign", desc: "Pick a flawed real app, redesign one flow with research.", skills: ["figma"], difficulty: "Intermediate" },
    { title: "Design system starter", desc: "Build tokens + 10 core components.", skills: ["design systems"], difficulty: "Starter" },
    { title: "Design-engineered prototype", desc: "Ship a working React prototype of your best concept.", skills: ["react"], difficulty: "Advanced" },
  ],
  product: [
    { title: "Product teardown deck", desc: "Analyze a product, propose 3 experiments with metrics.", skills: ["strategy"], difficulty: "Starter" },
    { title: "0→1 spec", desc: "Full PRD for a new feature with tradeoffs and risks.", skills: ["roadmapping"], difficulty: "Intermediate" },
    { title: "Discovery interviews", desc: "Run 5 real user interviews and produce an insight report.", skills: ["user research"], difficulty: "Intermediate" },
  ],
  marketing: [
    { title: "Growth experiment log", desc: "Run 3 marketing experiments end-to-end.", skills: ["experimentation"], difficulty: "Intermediate" },
    { title: "SEO content plan", desc: "Keyword-mapped content calendar with 5 published pieces.", skills: ["seo"], difficulty: "Starter" },
    { title: "Ad creative teardown", desc: "Study 20 top ads in a niche and produce your own.", skills: ["copywriting"], difficulty: "Starter" },
  ],
  finance: [
    { title: "3-statement model", desc: "Model a public company from scratch with sensitivities.", skills: ["excel"], difficulty: "Intermediate" },
    { title: "Investment memo", desc: "Buy/sell memo defended with the model above.", skills: ["valuation"], difficulty: "Advanced" },
    { title: "Personal budget model", desc: "Turn 12 months of your own data into a forecast.", skills: ["excel"], difficulty: "Starter" },
  ],
  ops: [
    { title: "Process redesign", desc: "Map a broken process, redesign it, measure improvement.", skills: ["process design"], difficulty: "Starter" },
    { title: "Ops dashboard", desc: "Build a metrics dashboard the team actually uses.", skills: ["excel"], difficulty: "Intermediate" },
    { title: "Requirements teardown", desc: "Pick a real product and write its BRD in reverse.", skills: ["requirements"], difficulty: "Starter" },
  ],
  content: [
    { title: "Editorial portfolio", desc: "Publish 5 pieces with a consistent voice on one topic.", skills: ["writing"], difficulty: "Starter" },
    { title: "Newsletter with metrics", desc: "Run a niche newsletter for 8 weeks and analyze data.", skills: ["seo"], difficulty: "Intermediate" },
  ],
  healthcare: [
    { title: "Clinical workflow analysis", desc: "Map a real hospital workflow and propose an improvement.", skills: ["analytics"], difficulty: "Intermediate" },
    { title: "Public health dashboard", desc: "Visualize a public health dataset with clinical framing.", skills: ["sql"], difficulty: "Starter" },
    { title: "Case study review", desc: "Deep-read 10 patient case studies and summarize patterns.", skills: ["clinical skills"], difficulty: "Starter" },
  ],
  education: [
    { title: "Learning experience redesign", desc: "Redesign one course module using instructional design principles.", skills: ["curriculum"], difficulty: "Intermediate" },
    { title: "EdTech feature spec", desc: "Write a PRD for a learning feature backed by pedagogy research.", skills: ["strategy"], difficulty: "Advanced" },
    { title: "Micro-lesson series", desc: "Teach a topic in 5 short lessons and gather learner feedback.", skills: ["communication"], difficulty: "Starter" },
  ],
  legal: [
    { title: "Case brief library", desc: "Write 10 case briefs in your target practice area.", skills: ["legal research"], difficulty: "Starter" },
    { title: "Mock contract drafting", desc: "Draft 3 contracts from scratch and get peer review.", skills: ["writing"], difficulty: "Intermediate" },
  ],
  "physical-eng": [
    { title: "CAD portfolio piece", desc: "Fully-modeled component or building with drawings.", skills: ["cad"], difficulty: "Intermediate" },
    { title: "Structural analysis writeup", desc: "Take a real structure and analyze load paths.", skills: ["structural analysis"], difficulty: "Advanced" },
    { title: "Materials selection study", desc: "Pick a product and defend a materials choice.", skills: ["materials"], difficulty: "Starter" },
  ],
  "creative-media": [
    { title: "Short film / edit reel", desc: "Ship a 60–90s piece with color and audio finished.", skills: ["editing"], difficulty: "Intermediate" },
    { title: "Client mock brief", desc: "Deliver a full campaign for a fictional client.", skills: ["storytelling"], difficulty: "Starter" },
  ],
  hospitality: [
    { title: "Guest journey redesign", desc: "Map a hotel/restaurant experience and improve one moment.", skills: ["customer service"], difficulty: "Intermediate" },
    { title: "Ops handbook draft", desc: "Write an SOP a new hire could actually use.", skills: ["operations"], difficulty: "Starter" },
  ],
};

export function recommendedProjects(p: Profile, top: Recommendation): ProjectIdea[] {
  const pool = PROJECTS_BY_CATEGORY[top.track.category] ?? [];
  const seed = profileHash(p);
  const expRank = experienceRank[p.experience];
  const noSkills = p.skills.length === 0 || p.skillLevel === "none" || p.skillLevel === "beginner";
  const preferred = pool.filter((pr) =>
    noSkills ? pr.difficulty === "Starter"
    : expRank === 0 ? pr.difficulty !== "Advanced"
    : expRank >= 2 ? pr.difficulty !== "Starter"
    : true
  );
  const source = preferred.length >= 3 ? preferred : (pool.length ? pool : genericStarters);
  return pick(source, seed, Math.min(3, source.length));
}

// ---------- Courses ----------
export type CourseRec = { title: string; provider: string; kind: "Course" | "Certification" | "Book"; url?: string };

const COURSES_BY_CATEGORY: Record<Category, CourseRec[]> = {
  ai: [
    { title: "Deep Learning Specialization", provider: "DeepLearning.AI (Coursera)", kind: "Course" },
    { title: "Hugging Face NLP Course", provider: "Hugging Face", kind: "Course" },
    { title: "AWS Certified Machine Learning", provider: "AWS", kind: "Certification" },
    { title: "Designing Machine Learning Systems", provider: "Chip Huyen", kind: "Book" },
  ],
  engineering: [
    { title: "The Odin Project", provider: "Odin Project", kind: "Course" },
    { title: "Full Stack Open", provider: "University of Helsinki", kind: "Course" },
    { title: "AWS Certified Developer – Associate", provider: "AWS", kind: "Certification" },
    { title: "Designing Data-Intensive Applications", provider: "Martin Kleppmann", kind: "Book" },
  ],
  data: [
    { title: "Google Data Analytics Certificate", provider: "Google (Coursera)", kind: "Certification" },
    { title: "SQL for Data Science", provider: "UC Davis (Coursera)", kind: "Course" },
    { title: "Storytelling with Data", provider: "Cole Nussbaumer Knaflic", kind: "Book" },
  ],
  security: [
    { title: "CompTIA Security+", provider: "CompTIA", kind: "Certification" },
    { title: "TryHackMe SOC Level 1", provider: "TryHackMe", kind: "Course" },
    { title: "OSCP", provider: "Offensive Security", kind: "Certification" },
  ],
  cloud: [
    { title: "AWS Solutions Architect – Associate", provider: "AWS", kind: "Certification" },
    { title: "Certified Kubernetes Administrator", provider: "CNCF", kind: "Certification" },
    { title: "Terraform Associate", provider: "HashiCorp", kind: "Certification" },
  ],
  mobile: [
    { title: "iOS App Development with Swift", provider: "Stanford CS193p", kind: "Course" },
    { title: "Android Developer Fundamentals", provider: "Google", kind: "Course" },
    { title: "React Native — The Practical Guide", provider: "Academind (Udemy)", kind: "Course" },
  ],
  design: [
    { title: "Google UX Design Certificate", provider: "Google (Coursera)", kind: "Certification" },
    { title: "Refactoring UI", provider: "Adam Wathan & Steve Schoger", kind: "Book" },
    { title: "Design of Everyday Things", provider: "Don Norman", kind: "Book" },
  ],
  product: [
    { title: "Reforge Product Strategy", provider: "Reforge", kind: "Course" },
    { title: "Inspired", provider: "Marty Cagan", kind: "Book" },
    { title: "Google Digital Product Manager", provider: "Google (Coursera)", kind: "Certification" },
  ],
  marketing: [
    { title: "Google Analytics Certification", provider: "Google", kind: "Certification" },
    { title: "Google Ads Certification", provider: "Google", kind: "Certification" },
    { title: "HubSpot Inbound Marketing", provider: "HubSpot Academy", kind: "Certification" },
    { title: "Traction", provider: "Weinberg & Mares", kind: "Book" },
  ],
  finance: [
    { title: "CFA Level I", provider: "CFA Institute", kind: "Certification" },
    { title: "CPA", provider: "AICPA", kind: "Certification" },
    { title: "Wall Street Prep Financial Modeling", provider: "Wall Street Prep", kind: "Course" },
    { title: "Investment Valuation", provider: "Aswath Damodaran", kind: "Book" },
  ],
  ops: [
    { title: "PMP Certification", provider: "PMI", kind: "Certification" },
    { title: "Lean Six Sigma Green Belt", provider: "ASQ", kind: "Certification" },
    { title: "CBAP (Business Analysis)", provider: "IIBA", kind: "Certification" },
    { title: "The Goal", provider: "Eliyahu Goldratt", kind: "Book" },
  ],
  content: [
    { title: "Ahrefs SEO Course", provider: "Ahrefs", kind: "Course" },
    { title: "On Writing Well", provider: "William Zinsser", kind: "Book" },
    { title: "The Copywriter's Handbook", provider: "Robert Bly", kind: "Book" },
  ],
  healthcare: [
    { title: "NCLEX-RN Prep", provider: "Kaplan / UWorld", kind: "Course" },
    { title: "Health Informatics Specialization", provider: "Johns Hopkins (Coursera)", kind: "Course" },
    { title: "Epic Certification", provider: "Epic Systems", kind: "Certification" },
    { title: "CPHQ (Healthcare Quality)", provider: "NAHQ", kind: "Certification" },
  ],
  education: [
    { title: "Learning How to Learn", provider: "McMaster / UC San Diego", kind: "Course" },
    { title: "Teach for America Prep", provider: "TFA", kind: "Course" },
    { title: "Design for How People Learn", provider: "Julie Dirksen", kind: "Book" },
  ],
  legal: [
    { title: "LSAT Prep", provider: "Khan Academy", kind: "Course" },
    { title: "Legal Writing in Plain English", provider: "Bryan A. Garner", kind: "Book" },
    { title: "Bar Prep — Themis", provider: "Themis Bar Review", kind: "Course" },
  ],
  "physical-eng": [
    { title: "AutoCAD Fundamentals", provider: "Autodesk", kind: "Course" },
    { title: "PE Exam Prep", provider: "School of PE", kind: "Certification" },
    { title: "Structures: Or Why Things Don't Fall Down", provider: "J.E. Gordon", kind: "Book" },
  ],
  "creative-media": [
    { title: "Adobe Certified Professional", provider: "Adobe", kind: "Certification" },
    { title: "Storytelling for Filmmakers", provider: "Various (Skillshare)", kind: "Course" },
    { title: "In the Blink of an Eye", provider: "Walter Murch", kind: "Book" },
  ],
  hospitality: [
    { title: "Certified Hospitality Supervisor", provider: "AHLEI", kind: "Certification" },
    { title: "Setting the Table", provider: "Danny Meyer", kind: "Book" },
  ],
};

export function recommendedCourses(p: Profile, top: Recommendation): CourseRec[] {
  const pool = COURSES_BY_CATEGORY[top.track.category] ?? [];
  const seed = profileHash(p);
  return pick(pool, seed ^ 0x9e3779b9, Math.min(4, pool.length));
}

// ---------- CV coaching ----------
export type CvReport = { score: number; tips: { title: string; desc: string }[] };

export function cvReport(p: Profile, top: Recommendation): CvReport {
  const expRank = experienceRank[p.experience];
  let score = 45;
  score += Math.min(20, p.skills.length * 3);
  score += expRank * 6;
  score += skillLevelBonus[p.skillLevel ?? ""] * 1.5;
  if (p.goals.length) score += 4;
  if (p.strengths.length) score += 4;
  score = Math.max(35, Math.min(94, Math.round(score)));

  const tips: { title: string; desc: string }[] = [];
  const noExp = p.experience === "" || p.experience === "none" || p.experience === "<1";

  if (p.skills.length < 5) {
    tips.push({
      title: "Broaden your skills section",
      desc: `You listed ${p.skills.length} skill${p.skills.length === 1 ? "" : "s"}. Add tools and methods relevant to ${top.role} — recruiters scan for keywords first.`,
    });
  } else {
    tips.push({
      title: "Reorder skills for the target role",
      desc: `Lead with ${top.track.requiredSkills.slice(0, 3).map(cap).join(", ")} to signal fit for ${top.role} in six seconds.`,
    });
  }

  if (noExp) {
    tips.push({
      title: "Turn projects into experience",
      desc: "With no formal experience, put a Projects section directly under your summary. Each bullet: what you built, what you learned, what result it produced.",
    });
  } else if (expRank <= 1) {
    tips.push({
      title: "Turn tasks into outcomes",
      desc: "Rewrite three bullets to open with a measurable result (users reached, time saved, revenue moved) rather than tasks performed.",
    });
  } else {
    tips.push({
      title: "Quantify leadership impact",
      desc: `As a ${experienceLabel[p.experience]} candidate, feature scope: team size, budget, or business metric moved on your top project.`,
    });
  }

  if (p.weaknesses[0]) {
    tips.push({
      title: `Preempt the ${cap(p.weaknesses[0])} question`,
      desc: `Add a line showing recent progress in ${p.weaknesses[0]} — a course, project, or contribution reframes it as growth, not a gap.`,
    });
  } else {
    tips.push({
      title: "Tighten your summary",
      desc: `Two lines: specialty + unique value. Anchor it to ${top.track.category} so the rest of the CV reads as evidence.`,
    });
  }

  return { score, tips };
}

// ---------- Interview prep ----------
export type InterviewSet = { title: string; count: number; tag: string };

const CATEGORY_SETS: Record<Category, InterviewSet[]> = {
  ai: [{ title: "ML fundamentals & math", count: 14, tag: "Concepts" }, { title: "LLM systems design", count: 10, tag: "Architecture" }, { title: "ML behavioral & tradeoffs", count: 10, tag: "Behavioral" }],
  engineering: [{ title: "Data structures & algorithms", count: 20, tag: "Coding" }, { title: "System design fundamentals", count: 12, tag: "Architecture" }, { title: "Behavioral with STAR", count: 10, tag: "Behavioral" }],
  data: [{ title: "SQL & analytical case", count: 14, tag: "Coding" }, { title: "Statistics & experimentation", count: 12, tag: "Concepts" }, { title: "Product sense with data", count: 10, tag: "Behavioral" }],
  security: [{ title: "Network & OS fundamentals", count: 14, tag: "Concepts" }, { title: "Incident response walkthroughs", count: 10, tag: "Case" }, { title: "Security behavioral", count: 8, tag: "Behavioral" }],
  cloud: [{ title: "Cloud architecture cases", count: 12, tag: "Architecture" }, { title: "Linux & networking drills", count: 10, tag: "Technical" }, { title: "SRE behavioral & incidents", count: 10, tag: "Behavioral" }],
  mobile: [{ title: "Mobile fundamentals", count: 12, tag: "Coding" }, { title: "Client architecture", count: 8, tag: "Architecture" }, { title: "Product & polish", count: 8, tag: "Behavioral" }],
  design: [{ title: "Portfolio walkthrough", count: 8, tag: "Storytelling" }, { title: "App critique & redesign", count: 10, tag: "Craft" }, { title: "Stakeholder scenarios", count: 12, tag: "Behavioral" }],
  product: [{ title: "Product sense & strategy", count: 12, tag: "Case" }, { title: "Execution & prioritization", count: 10, tag: "Case" }, { title: "Leadership scenarios", count: 12, tag: "Behavioral" }],
  marketing: [{ title: "Growth loops & funnels", count: 10, tag: "Case" }, { title: "Campaign teardown", count: 8, tag: "Craft" }, { title: "Cross-functional stories", count: 10, tag: "Behavioral" }],
  finance: [{ title: "Financial modeling drills", count: 12, tag: "Technical" }, { title: "Accounting & valuation", count: 10, tag: "Concepts" }, { title: "Client-ready presentation", count: 8, tag: "Behavioral" }],
  ops: [{ title: "Process design cases", count: 10, tag: "Case" }, { title: "Cross-team leadership", count: 10, tag: "Behavioral" }, { title: "Operational metrics", count: 8, tag: "Concepts" }],
  content: [{ title: "Editorial exercise", count: 6, tag: "Craft" }, { title: "SEO & distribution", count: 8, tag: "Concepts" }, { title: "Voice & stakeholder review", count: 8, tag: "Behavioral" }],
  healthcare: [{ title: "Clinical scenarios", count: 10, tag: "Case" }, { title: "Ethics & communication", count: 8, tag: "Behavioral" }, { title: "Compliance & documentation", count: 8, tag: "Concepts" }],
  education: [{ title: "Sample lesson design", count: 8, tag: "Craft" }, { title: "Classroom scenarios", count: 10, tag: "Behavioral" }, { title: "Curriculum critique", count: 8, tag: "Case" }],
  legal: [{ title: "Case law reasoning", count: 12, tag: "Concepts" }, { title: "Client counseling scenarios", count: 10, tag: "Case" }, { title: "Legal writing sample", count: 6, tag: "Craft" }],
  "physical-eng": [{ title: "Fundamentals drill", count: 14, tag: "Concepts" }, { title: "Design case study", count: 10, tag: "Case" }, { title: "Cross-team scenarios", count: 8, tag: "Behavioral" }],
  "creative-media": [{ title: "Reel walkthrough", count: 6, tag: "Storytelling" }, { title: "Live editing exercise", count: 6, tag: "Craft" }, { title: "Client scenarios", count: 8, tag: "Behavioral" }],
  hospitality: [{ title: "Service recovery scenarios", count: 10, tag: "Case" }, { title: "Team leadership stories", count: 10, tag: "Behavioral" }, { title: "Operational metrics", count: 6, tag: "Concepts" }],
};

export function interviewPrep(p: Profile, top: Recommendation): InterviewSet[] {
  const sets = (CATEGORY_SETS[top.track.category] ?? CATEGORY_SETS.ops).map((s) => ({ ...s }));
  const expRank = experienceRank[p.experience];
  return sets.map((s) => ({ ...s, count: s.count + expRank * 2 }));
}

// ---------- Action plan ----------
export type ActionStep = { horizon: "30 days" | "90 days" | "6 months"; title: string; detail: string };

export function actionPlan(p: Profile, top: Recommendation, gaps: SkillGap[], projects: ProjectIdea[]): ActionStep[] {
  const expRank = experienceRank[p.experience];
  const primaryGap = gaps[0]?.name ?? top.track.requiredSkills[0];
  const secondaryGap = gaps[1]?.name ?? top.track.requiredSkills[1];
  const project = projects[0]?.title ?? "a public portfolio project";
  const wantsJob = p.goals.includes("Land my first job") || p.goals.includes("Switch careers");

  return [
    { horizon: "30 days",
      title: `Establish a ${top.role} baseline`,
      detail: `Finish one foundational course, publish notes on ${primaryGap}, and start a public log so recruiters can see momentum.` },
    { horizon: "90 days",
      title: `Ship "${project}"`,
      detail: `Complete a project that exercises ${primaryGap} and ${secondaryGap}. Write a case study focused on decisions and outcomes.` },
    { horizon: "6 months",
      title: wantsJob ? `Interview loop targeting ${top.role}` : expRank >= 2 ? `Scope-expanding initiative at work` : `Second project + niche specialization`,
      detail: wantsJob
        ? `Apply to 30 aligned roles, run 15 mock interviews, and negotiate at least one offer using the CV improvements above.`
        : expRank >= 2
        ? `Own an initiative visible to leadership — the story that anchors your promotion or next role.`
        : `Pick a niche within ${top.track.category}, ship a second project in that niche, and publish weekly.` },
  ];
}

// ---------- Readiness / KPIs ----------
export function readiness(p: Profile, top: Recommendation, gaps: SkillGap[]) {
  const expRank = experienceRank[p.experience];
  const skillCoverage = gaps.length
    ? gaps.reduce((sum, g) => sum + g.level / g.target, 0) / gaps.length
    : 0;
  const base = 20 + expRank * 12 + skillLevelBonus[p.skillLevel ?? ""] * 2 + Math.round(skillCoverage * 45);
  return Math.max(15, Math.min(95, base));
}
