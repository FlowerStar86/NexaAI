import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/nexa/Logo";
import { ArrowLeft, ArrowRight, Check, Plus, X, Sparkles } from "lucide-react";
import { saveProfile, type Profile, type Experience, type SkillLevel, loadProfile } from "@/lib/nexa-engine";
import { clearAiResultLocal } from "@/lib/nexa-cloud";


export const Route = createFileRoute("/setup")({
  head: () => ({
    meta: [
      { title: "Set up your profile — Nexa AI" },
      { name: "description", content: "Tell Nexa about your education, skills, strengths, and goals to get a personalized career plan." },
    ],
  }),
  component: Setup,
});

const steps = [
  "Education", "Field", "Skill level", "Skills", "Experience", "Goals", "Strengths", "Weaknesses",
] as const;

const educationOptions = [
  "No formal education",
  "High school student",
  "High school graduate",
  "Currently studying",
  "Diploma",
  "Bachelor's degree",
  "Master's degree",
  "PhD",
  "Self-taught",
];

const experienceOptions: { id: Experience; label: string; desc: string }[] = [
  { id: "none", label: "No experience", desc: "Haven't worked in this field yet" },
  { id: "<1", label: "Less than 1 year", desc: "Internships, first role, side projects" },
  { id: "1-3", label: "1–3 years", desc: "Early career professional" },
  { id: "3-5", label: "3–5 years", desc: "Mid-level professional" },
  { id: "5+", label: "5+ years", desc: "Senior, leading initiatives" },
];

const skillLevelOptions: { id: SkillLevel; label: string; desc: string }[] = [
  { id: "none", label: "No skills yet", desc: "Just starting out — Nexa will guide from zero" },
  { id: "beginner", label: "Beginner", desc: "Basic familiarity, still learning fundamentals" },
  { id: "intermediate", label: "Intermediate", desc: "Comfortable working independently" },
  { id: "advanced", label: "Advanced", desc: "Deep, professional-level ability" },
];

const goalOptions = [
  "Land my first job", "Switch careers", "Get promoted",
  "Freelance / go independent", "Build a startup", "Level up my current role",
];

const skillCategories: { name: string; items: string[] }[] = [
  { name: "Programming & Tech", items: ["Python", "JavaScript", "TypeScript", "React", "Node", "SQL", "Java", "C++", "Git", "APIs"] },
  { name: "Data & AI", items: ["Statistics", "Excel", "Tableau", "Power BI", "PyTorch", "TensorFlow", "LLMs", "Prompt engineering", "ML"] },
  { name: "Design & Creative", items: ["Figma", "Photoshop", "Illustrator", "After Effects", "UX research", "Typography", "Prototyping", "Video editing"] },
  { name: "Business & Ops", items: ["Communication", "Project management", "Leadership", "Sales", "Negotiation", "Strategy", "CRM", "Budgeting"] },
  { name: "Marketing", items: ["SEO", "Copywriting", "Analytics", "Social media", "Ads", "Email"] },
  { name: "Finance", items: ["Accounting", "Modeling", "Valuation", "Auditing", "GAAP"] },
  { name: "Healthcare", items: ["Patient care", "Clinical skills", "Pharmacology", "Lab techniques", "Documentation"] },
  { name: "Soft skills", items: ["Problem solving", "Empathy", "Attention to detail", "Adaptability", "Collaboration", "Critical thinking", "Public speaking"] },
];

const strengthSuggestions = ["Communication", "Problem solving", "Leadership", "Analytical thinking", "Creativity", "Attention to detail", "Collaboration", "Adaptability"];
const weaknessSuggestions = ["Public speaking", "Time management", "Delegating", "System design", "Statistics", "Writing", "Negotiation", "Networking"];

function Setup() {
  const navigate = useNavigate();
  const existing = typeof window !== "undefined" ? loadProfile() : null;
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [education, setEducation] = useState<string>(existing?.education ?? "");
  const [field, setField] = useState(existing?.field ?? "");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(existing?.skillLevel ?? "");
  const [skills, setSkills] = useState<string[]>(existing?.skills ?? []);
  const [skillDraft, setSkillDraft] = useState("");
  const [experience, setExperience] = useState<Experience>(existing?.experience ?? "");
  const [goals, setGoals] = useState<string[]>(existing?.goals ?? []);
  const [strengths, setStrengths] = useState<string[]>(existing?.strengths ?? []);
  const [strengthDraft, setStrengthDraft] = useState("");
  const [weaknesses, setWeaknesses] = useState<string[]>(existing?.weaknesses ?? []);
  const [weaknessDraft, setWeaknessDraft] = useState("");

  const progress = ((step + 1) / steps.length) * 100;

  const canContinue =
    (step === 0 && !!education) ||
    (step === 1 && field.trim().length > 1) ||
    (step === 2 && !!skillLevel) ||
    (step === 3 && (skillLevel === "none" || skills.length > 0)) ||
    (step === 4 && !!experience) ||
    (step === 5 && goals.length > 0) ||
    (step === 6 && strengths.length > 0) ||
    (step === 7 && weaknesses.length > 0);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      const profile: Profile = { education, field, skills, skillLevel, experience, goals, strengths, weaknesses };
      saveProfile(profile);
      clearAiResultLocal();
      setSaving(true);
      window.setTimeout(() => navigate({ to: "/results" }), 1400);

    }
  };

  const addTo = (list: string[], setList: (v: string[]) => void, draft: string, setDraft: (v: string) => void) => {
    const v = draft.trim();
    if (!v || list.map((x) => x.toLowerCase()).includes(v.toLowerCase())) return;
    setList([...list, v]);
    setDraft("");
  };
  const removeFrom = (list: string[], setList: (v: string[]) => void, item: string) =>
    setList(list.filter((x) => x !== item));

  const toggleGoal = (g: string) => setGoals(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g]);
  const toggleSkill = (s: string) => {
    const lc = s.toLowerCase();
    setSkills(skills.map((x) => x.toLowerCase()).includes(lc)
      ? skills.filter((x) => x.toLowerCase() !== lc)
      : [...skills, s]);
  };

  if (saving) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand animate-pulse">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl">Nexa is analyzing your profile…</h1>
          <p className="mt-3 text-sm text-muted-foreground">Cross-referencing skills, goals, and experience against 40+ career paths.</p>
          <div className="mt-8 mx-auto h-1 w-64 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 bg-brand-gradient animate-[nexa-slide_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">Skip</Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div key={step} className="rounded-2xl border border-border bg-surface p-8 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300">
          {step === 0 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">What's your education background?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Pick whatever describes you best — none is fine too.</p>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {educationOptions.map((opt) => (
                  <button key={opt} onClick={() => setEducation(opt)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      education === opt ? "border-brand bg-brand-soft" : "border-border bg-surface-elevated hover:border-muted-foreground/40"
                    }`}>
                    <span>{opt}</span>
                    {education === opt && <Check className="h-4 w-4 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">What field interests you?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Study, work, or something you'd like to explore.</p>
              <input autoFocus value={field} onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Software, Marketing, Nursing, Design, Finance"
                className="mt-8 w-full rounded-xl border border-border bg-surface-elevated px-4 py-3 text-base outline-none placeholder:text-muted-foreground focus:border-brand transition" />
              <div className="mt-4 flex flex-wrap gap-2">
                {["Software Engineering", "AI / Machine Learning", "Data Science", "Cybersecurity", "Design", "Marketing", "Finance", "Healthcare", "Education", "Law", "Hospitality"].map((s) => (
                  <button key={s} onClick={() => setField(s)}
                    className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs hover:border-brand hover:text-brand transition">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">How would you rate your current skills?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Roughly, across the field you picked.</p>
              <div className="mt-8 grid gap-3">
                {skillLevelOptions.map((lvl) => (
                  <button key={lvl.id} onClick={() => setSkillLevel(lvl.id)}
                    className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      skillLevel === lvl.id ? "border-brand bg-brand-soft" : "border-border bg-surface-elevated hover:border-muted-foreground/40"
                    }`}>
                    <div>
                      <div className="font-medium">{lvl.label}</div>
                      <div className="text-sm text-muted-foreground">{lvl.desc}</div>
                    </div>
                    {skillLevel === lvl.id && <Check className="h-5 w-5 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">What are your skills?</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {skillLevel === "none"
                  ? "Feel free to skip — Nexa will build a plan from zero."
                  : "Pick from any category or add your own. Multiple selections encouraged."}
              </p>
              <div className="mt-6 flex gap-2">
                <input value={skillDraft} onChange={(e) => setSkillDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTo(skills, setSkills, skillDraft, setSkillDraft))}
                  placeholder="Add a custom skill and press Enter"
                  className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 outline-none placeholder:text-muted-foreground focus:border-brand transition" />
                <button onClick={() => addTo(skills, setSkills, skillDraft, setSkillDraft)}
                  className="inline-flex items-center gap-1 rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground hover:brightness-110 transition">
                  <Plus className="h-4 w-4" /> Add
                </button>
              </div>
              <div className="mt-6 space-y-4 max-h-72 overflow-y-auto pr-2">
                {skillCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{cat.name}</div>
                    <div className="flex flex-wrap gap-2">
                      {cat.items.map((s) => {
                        const active = skills.map((x) => x.toLowerCase()).includes(s.toLowerCase());
                        return (
                          <button key={s} onClick={() => toggleSkill(s)}
                            className={`rounded-full border px-3 py-1.5 text-xs transition-all duration-150 hover:-translate-y-0.5 ${
                              active ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface-elevated text-muted-foreground hover:border-brand hover:text-brand"
                            }`}>
                            {active && <Check className="mr-1 inline h-3 w-3" />}{s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {skills.length > 0 && (
                <div className="mt-6 border-t border-border pt-4">
                  <div className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Selected · {skills.length}</div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <span key={s} className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand-soft px-3 py-1 text-xs text-brand">
                        {s}
                        <button onClick={() => removeFrom(skills, setSkills, s)} aria-label={`Remove ${s}`}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">Your experience level?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Nexa calibrates every recommendation to this.</p>
              <div className="mt-8 grid gap-3">
                {experienceOptions.map((lvl) => (
                  <button key={lvl.id} onClick={() => setExperience(lvl.id)}
                    className={`flex items-center justify-between rounded-xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      experience === lvl.id ? "border-brand bg-brand-soft" : "border-border bg-surface-elevated hover:border-muted-foreground/40"
                    }`}>
                    <div>
                      <div className="font-medium">{lvl.label}</div>
                      <div className="text-sm text-muted-foreground">{lvl.desc}</div>
                    </div>
                    {experience === lvl.id && <Check className="h-5 w-5 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h1 className="font-display text-3xl md:text-4xl">What are your career goals?</h1>
              <p className="mt-2 text-sm text-muted-foreground">Pick as many as apply.</p>
              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {goalOptions.map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${
                      goals.includes(g) ? "border-brand bg-brand-soft" : "border-border bg-surface-elevated hover:border-muted-foreground/40"
                    }`}>
                    <span>{g}</span>
                    {goals.includes(g) && <Check className="h-4 w-4 text-brand" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <TagStep title="What are your strengths?" hint="Where you consistently outperform — Nexa plays to these."
              placeholder="e.g. Communication, Problem solving"
              draft={strengthDraft} setDraft={setStrengthDraft} list={strengths}
              onAdd={() => addTo(strengths, setStrengths, strengthDraft, setStrengthDraft)}
              onRemove={(v) => removeFrom(strengths, setStrengths, v)} suggestions={strengthSuggestions} />
          )}

          {step === 7 && (
            <TagStep title="Where do you struggle?" hint="Areas you want Nexa to help you close the gap in."
              placeholder="e.g. Public speaking, System design"
              draft={weaknessDraft} setDraft={setWeaknessDraft} list={weaknesses}
              onAdd={() => addTo(weaknesses, setWeaknesses, weaknessDraft, setWeaknessDraft)}
              onRemove={(v) => removeFrom(weaknesses, setWeaknesses, v)} suggestions={weaknessSuggestions} />
          )}

          <div className="mt-10 flex items-center justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground disabled:opacity-40 transition hover:bg-surface-elevated">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button onClick={next} disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-medium text-brand-foreground shadow-glow transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
              {step === steps.length - 1 ? "Generate my plan" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function TagStep({ title, hint, placeholder, draft, setDraft, list, onAdd, onRemove, suggestions }: {
  title: string; hint: string; placeholder: string; draft: string; setDraft: (v: string) => void;
  list: string[]; onAdd: () => void; onRemove: (v: string) => void; suggestions?: string[];
}) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-8 flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onAdd())} placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-3 outline-none placeholder:text-muted-foreground focus:border-brand transition" />
        <button onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground hover:brightness-110 transition">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
      {suggestions && (
        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setDraft(s)}
              className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted-foreground hover:border-brand hover:text-brand transition">
              {s}
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-2">
        {list.map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm animate-in fade-in zoom-in-95 duration-200">
            {s}
            <button onClick={() => onRemove(s)} aria-label={`Remove ${s}`}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          </span>
        ))}
        {list.length === 0 && <span className="text-sm text-muted-foreground">Nothing added yet.</span>}
      </div>
    </div>
  );
}
