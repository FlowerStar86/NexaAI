import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/nexa/Logo";
import { ArrowLeft, ArrowRight, Download, Plus, Sparkles, Trash2, Eye, Pencil } from "lucide-react";
import {
  emptyCv, loadCv, saveCv, prefillCvFromProfile,
  type CvData, type CvEducation, type CvExperience, type CvProject, type CvCertification,
} from "@/lib/cv-storage";
import { loadProfile, recommendCareers } from "@/lib/nexa-engine";

export const Route = createFileRoute("/cv-builder")({
  head: () => ({
    meta: [
      { title: "AI CV Builder — Nexa AI" },
      { name: "description", content: "Nexa AI guides you step-by-step to build a professional, ATS-friendly CV — with no-experience mode." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ from: typeof s.from === "string" ? s.from : "" }),
  component: CvBuilder,
});

const steps = ["Contact", "Summary", "Education", "Experience", "Skills", "Projects", "Certifications", "Languages", "Interests", "Preview"] as const;

function CvBuilder() {
  const { from } = Route.useSearch();
  const [cv, setCv] = useState<CvData>(emptyCv);
  const [step, setStep] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const existing = loadCv();
    if (existing) {
      setCv(existing);
    } else {
      // Prefill from career profile
      const profile = loadProfile();
      const topRole = profile ? recommendCareers(profile)[0]?.role : undefined;
      setCv(prefillCvFromProfile(topRole));
      if (profile && from === "dashboard") {
        setLoading(true);
        window.setTimeout(() => setLoading(false), 1200);
      }
    }
    setHydrated(true);
  }, [from]);

  useEffect(() => { if (hydrated) saveCv(cv); }, [cv, hydrated]);

  const update = <K extends keyof CvData>(k: K, v: CvData[K]) => setCv((c) => ({ ...c, [k]: v }));

  const progress = ((step + 1) / steps.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand animate-pulse">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl">Tailoring your CV…</h1>
          <p className="mt-3 text-sm text-muted-foreground">Pre-filling with your career profile.</p>
          <div className="mt-8 mx-auto h-1 w-64 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 bg-brand-gradient animate-[nexa-slide_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 print:hidden">
        <Logo />
        <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">Back to dashboard</Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24">
        <div className="mb-8 print:hidden">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step {step + 1} of {steps.length}</span>
            <span>{steps[step]}</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-brand-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {step < steps.length - 1 ? (
          <div key={step} className="rounded-2xl border border-border bg-surface p-8 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300 print:hidden">
            {step === 0 && <ContactStep cv={cv} update={update} />}
            {step === 1 && <SummaryStep cv={cv} update={update} />}
            {step === 2 && <EducationStep cv={cv} update={update} />}
            {step === 3 && <ExperienceStep cv={cv} update={update} />}
            {step === 4 && <SkillsStep cv={cv} update={update} />}
            {step === 5 && <ProjectsStep cv={cv} update={update} />}
            {step === 6 && <CertsStep cv={cv} update={update} />}
            {step === 7 && <LanguagesStep cv={cv} update={update} />}
            {step === 8 && <InterestsStep cv={cv} update={update} />}
          </div>
        ) : (
          <CvPreview cv={cv} />
        )}

        <div className="mt-8 flex items-center justify-between print:hidden">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground disabled:opacity-40 transition hover:bg-surface-elevated">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-2">
            {step === steps.length - 1 && (
              <>
                <button onClick={() => setStep(0)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-surface-elevated transition">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition-all duration-200 hover:scale-[1.02] active:scale-95">
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </>
            )}
            {step < steps.length - 1 && (
              <button onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-medium text-brand-foreground shadow-glow transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-95">
                {step === steps.length - 2 ? (<><Eye className="h-4 w-4" /> Preview CV</>) : (<>Continue <ArrowRight className="h-4 w-4" /></>)}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------- Step components ----------

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-brand transition" />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder, rows = 4 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-brand transition resize-y" />
    </label>
  );
}

function ContactStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Your contact information</h1>
      <p className="mt-2 text-sm text-muted-foreground">Kept at the top of your CV — recruiters scan this first.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Field label="Full name" value={cv.name} onChange={(v) => update("name", v)} placeholder="Jane Doe" />
        <Field label="Target role" value={cv.targetRole} onChange={(v) => update("targetRole", v)} placeholder="e.g. Data Analyst" />
        <Field label="Email" value={cv.email} onChange={(v) => update("email", v)} placeholder="jane@example.com" />
        <Field label="Phone" value={cv.phone} onChange={(v) => update("phone", v)} placeholder="+1 555 123 4567" />
        <Field label="Location" value={cv.location} onChange={(v) => update("location", v)} placeholder="City, Country" />
        <Field label="Links (LinkedIn, portfolio)" value={cv.links} onChange={(v) => update("links", v)} placeholder="linkedin.com/in/…" />
      </div>
    </div>
  );
}

function SummaryStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Professional summary</h1>
      <p className="mt-2 text-sm text-muted-foreground">2–3 lines. Nexa pre-filled one from your career profile — edit anything.</p>
      <div className="mt-6">
        <Textarea label="Summary" value={cv.summary} onChange={(v) => update("summary", v)} rows={4}
          placeholder="Detail-oriented candidate with a background in…" />
      </div>
    </div>
  );
}

function EducationStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  const set = (i: number, patch: Partial<CvEducation>) =>
    update("education", cv.education.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Education</h1>
      <div className="mt-6 space-y-4">
        {cv.education.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-elevated p-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Field label="School" value={e.school} onChange={(v) => set(i, { school: v })} />
              <Field label="Degree" value={e.degree} onChange={(v) => set(i, { degree: v })} />
              <Field label="Year" value={e.year} onChange={(v) => set(i, { year: v })} />
            </div>
            {cv.education.length > 1 && (
              <button onClick={() => update("education", cv.education.filter((_, idx) => idx !== i))}
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={() => update("education", [...cv.education, { school: "", degree: "", year: "" }])}
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand transition">
          <Plus className="h-4 w-4" /> Add education
        </button>
      </div>
    </div>
  );
}

function ExperienceStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  const set = (i: number, patch: Partial<CvExperience>) =>
    update("experience", cv.experience.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Work experience</h1>
      <div className="mt-4 flex items-center gap-2">
        <button onClick={() => update("hasExperience", !cv.hasExperience)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
            !cv.hasExperience ? "border-brand bg-brand-soft text-brand" : "border-border hover:border-brand/40"
          }`}>
          {!cv.hasExperience ? "✓ " : ""}I have no work experience
        </button>
      </div>
      {!cv.hasExperience ? (
        <p className="mt-6 rounded-xl border border-border bg-surface-elevated p-4 text-sm text-muted-foreground">
          No problem — Nexa will build a beginner-friendly CV that leads with your education, projects, certifications, and transferable skills.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {cv.experience.map((e, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface-elevated p-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Company" value={e.company} onChange={(v) => set(i, { company: v })} />
                <Field label="Role" value={e.role} onChange={(v) => set(i, { role: v })} />
                <Field label="Period" value={e.period} onChange={(v) => set(i, { period: v })} placeholder="Jan 2023 – Present" />
              </div>
              <div className="mt-3">
                <Textarea label="Bullets (one per line)" rows={3}
                  value={e.bullets.join("\n")}
                  onChange={(v) => set(i, { bullets: v.split("\n") })} />
              </div>
              {cv.experience.length > 1 && (
                <button onClick={() => update("experience", cv.experience.filter((_, idx) => idx !== i))}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              )}
            </div>
          ))}
          <button onClick={() => update("experience", [...cv.experience, { company: "", role: "", period: "", bullets: [""] }])}
            className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand transition">
            <Plus className="h-4 w-4" /> Add role
          </button>
        </div>
      )}
    </div>
  );
}

function ChipList({ label, list, update, placeholder }: { label: string; list: string[]; update: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || list.map((x) => x.toLowerCase()).includes(v.toLowerCase())) return;
    update([...list, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="mb-1.5 text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="flex gap-2">
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-brand transition" />
        <button onClick={add} className="rounded-xl bg-brand px-4 text-sm font-medium text-brand-foreground hover:brightness-110 transition">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {list.map((s) => (
          <span key={s} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs animate-in fade-in zoom-in-95 duration-200">
            {s}
            <button onClick={() => update(list.filter((x) => x !== s))} aria-label={`Remove ${s}`}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}

function SkillsStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Skills</h1>
      <p className="mt-2 text-sm text-muted-foreground">Nexa pre-filled these from your career profile.</p>
      <div className="mt-6">
        <ChipList label="Skills" list={cv.skills} update={(v) => update("skills", v)} placeholder="e.g. Python" />
      </div>
    </div>
  );
}

function ProjectsStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  const set = (i: number, patch: Partial<CvProject>) =>
    update("projects", cv.projects.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Projects</h1>
      <p className="mt-2 text-sm text-muted-foreground">Essential if you have no formal experience — proves you can ship.</p>
      <div className="mt-6 space-y-4">
        {cv.projects.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-elevated p-4 space-y-3">
            <Field label="Project name" value={e.name} onChange={(v) => set(i, { name: v })} />
            <Textarea label="Description" rows={2} value={e.desc} onChange={(v) => set(i, { desc: v })} />
            <Field label="Skills used" value={e.skills} onChange={(v) => set(i, { skills: v })} placeholder="React, Node, Postgres" />
            {cv.projects.length > 1 && (
              <button onClick={() => update("projects", cv.projects.filter((_, idx) => idx !== i))}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
        ))}
        <button onClick={() => update("projects", [...cv.projects, { name: "", desc: "", skills: "" }])}
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand transition">
          <Plus className="h-4 w-4" /> Add project
        </button>
      </div>
    </div>
  );
}

function CertsStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  const set = (i: number, patch: Partial<CvCertification>) =>
    update("certifications", cv.certifications.map((e, idx) => idx === i ? { ...e, ...patch } : e));
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Certifications</h1>
      <div className="mt-6 space-y-4">
        {cv.certifications.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface-elevated p-4 grid gap-3 md:grid-cols-3">
            <Field label="Name" value={e.name} onChange={(v) => set(i, { name: v })} />
            <Field label="Issuer" value={e.issuer} onChange={(v) => set(i, { issuer: v })} />
            <Field label="Year" value={e.year} onChange={(v) => set(i, { year: v })} />
          </div>
        ))}
        <button onClick={() => update("certifications", [...cv.certifications, { name: "", issuer: "", year: "" }])}
          className="inline-flex items-center gap-1 rounded-full border border-border px-4 py-2 text-sm hover:border-brand hover:text-brand transition">
          <Plus className="h-4 w-4" /> Add certification
        </button>
        {cv.certifications.length === 0 && (
          <p className="text-sm text-muted-foreground">None yet — feel free to skip.</p>
        )}
      </div>
    </div>
  );
}

function LanguagesStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Languages</h1>
      <div className="mt-6">
        <ChipList label="Languages" list={cv.languages} update={(v) => update("languages", v)} placeholder="e.g. English (native)" />
      </div>
    </div>
  );
}

function InterestsStep({ cv, update }: { cv: CvData; update: <K extends keyof CvData>(k: K, v: CvData[K]) => void }) {
  return (
    <div>
      <h1 className="font-display text-3xl md:text-4xl">Interests <span className="text-sm text-muted-foreground">(optional)</span></h1>
      <div className="mt-6">
        <ChipList label="Interests" list={cv.interests} update={(v) => update("interests", v)} placeholder="e.g. Open source" />
      </div>
    </div>
  );
}

// ---------- Preview (also print target) ----------
function CvPreview({ cv }: { cv: CvData }) {
  const showExp = cv.hasExperience && cv.experience.some((e) => e.company || e.role);
  return (
    <div className="rounded-2xl bg-white text-slate-900 shadow-card print:shadow-none print:rounded-none">
      <div className="mx-auto max-w-3xl p-10 print:p-8">
        <header className="border-b border-slate-300 pb-4">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{cv.name || "Your Name"}</h1>
          {cv.targetRole && <div className="mt-1 text-sm font-medium text-slate-600">{cv.targetRole}</div>}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
            {cv.email && <span>{cv.email}</span>}
            {cv.phone && <span>{cv.phone}</span>}
            {cv.location && <span>{cv.location}</span>}
            {cv.links && <span>{cv.links}</span>}
          </div>
        </header>

        {cv.summary && (
          <Section title="Summary"><p className="text-sm leading-relaxed text-slate-700">{cv.summary}</p></Section>
        )}

        {cv.skills.length > 0 && (
          <Section title="Skills">
            <div className="text-sm text-slate-700">{cv.skills.join(" · ")}</div>
          </Section>
        )}

        {showExp && (
          <Section title="Experience">
            <div className="space-y-3">
              {cv.experience.filter((e) => e.company || e.role).map((e, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="font-semibold text-slate-900">{e.role || "Role"} <span className="font-normal text-slate-600">· {e.company}</span></div>
                    <div className="text-xs text-slate-500">{e.period}</div>
                  </div>
                  <ul className="mt-1 list-disc pl-5 text-sm text-slate-700 space-y-0.5">
                    {e.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.projects.some((p) => p.name) && (
          <Section title="Projects">
            <div className="space-y-2">
              {cv.projects.filter((p) => p.name).map((p, i) => (
                <div key={i}>
                  <div className="font-semibold text-slate-900">{p.name}{p.skills && <span className="ml-2 text-xs font-normal text-slate-500">({p.skills})</span>}</div>
                  {p.desc && <div className="text-sm text-slate-700">{p.desc}</div>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.education.some((e) => e.school || e.degree) && (
          <Section title="Education">
            <div className="space-y-1">
              {cv.education.filter((e) => e.school || e.degree).map((e, i) => (
                <div key={i} className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="text-sm text-slate-800"><span className="font-semibold">{e.degree}</span>{e.school && ` — ${e.school}`}</div>
                  <div className="text-xs text-slate-500">{e.year}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {cv.certifications.length > 0 && (
          <Section title="Certifications">
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-0.5">
              {cv.certifications.map((c, i) => <li key={i}>{c.name}{c.issuer && ` — ${c.issuer}`}{c.year && ` (${c.year})`}</li>)}
            </ul>
          </Section>
        )}

        {cv.languages.length > 0 && (
          <Section title="Languages"><div className="text-sm text-slate-700">{cv.languages.join(" · ")}</div></Section>
        )}

        {cv.interests.length > 0 && (
          <Section title="Interests"><div className="text-sm text-slate-700">{cv.interests.join(" · ")}</div></Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}
