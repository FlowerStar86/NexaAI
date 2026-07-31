import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Logo } from "@/components/nexa/Logo";
import {
  ArrowUpRight,
  Briefcase,
  TrendingUp,
  BookOpen,
  FileText,
  MessagesSquare,
  Sparkles,
  CheckCircle2,
  Circle,
  Play,
  Upload,
  X,
  Star,
  Rocket,
  GraduationCap,
  Target,
} from "lucide-react";
import {
  loadProfile,
  emptyProfile,
  recommendCareers,
  skillGaps,
  buildRoadmap,
  cvReport,
  interviewPrep,
  readiness,
  currentStrengths,
  recommendedProjects,
  recommendedCourses,
  actionPlan,
  type Profile,
} from "@/lib/nexa-engine";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your career dashboard — Nexa AI" },
      { name: "description", content: "Personalized career recommendations, skill gap analysis, learning roadmap, CV coaching, and interview prep." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(loadProfile() ?? emptyProfile);
    setHydrated(true);
  }, []);

  const plan = useMemo(() => {
    const p = profile ?? emptyProfile;
    const recs = recommendCareers(p);
    const top = recs[0];
    const gaps = skillGaps(p, top);
    const roadmap = buildRoadmap(p, top, gaps);
    const cv = cvReport(p, top);
    const interviews = interviewPrep(p, top);
    const readinessPct = readiness(p, top, gaps);
    const strengths = currentStrengths(p, top);
    const projects = recommendedProjects(p, top);
    const courses = recommendedCourses(p, top);
    const actions = actionPlan(p, top, gaps, projects);
    return { recs, top, gaps, roadmap, cv, interviews, readinessPct, strengths, projects, courses, actions };
  }, [profile]);

  const notify = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const hasProfile = hydrated && profile && profile.field && profile.skills.length > 0;
  const firstName = (profile?.field || "you").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#recs" className="hover:text-foreground transition">Recommendations</a>
            <a href="#skills" className="hover:text-foreground transition">Skills</a>
            <a href="#roadmap" className="hover:text-foreground transition">Roadmap</a>
            <a href="#cv" className="hover:text-foreground transition">CV</a>
            <a href="#interview" className="hover:text-foreground transition">Interview</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/setup" className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-elevated transition">
              Edit profile
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Greeting */}
        <section className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            {hasProfile ? `Personalized for your profile in ${profile!.field}` : "Personalized intelligence"}
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            {hasProfile ? "Your plan is ready." : "Welcome to Nexa."}{" "}
            <span className="text-brand-gradient">
              {hasProfile ? `Built around ${plan.top.role}.` : "Complete setup to unlock your plan."}
            </span>
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {hasProfile
              ? `Nexa cross-referenced your ${profile!.skills.length} skill${profile!.skills.length === 1 ? "" : "s"}, ${profile!.experience || "unspecified"}-level experience, and ${profile!.goals.length} goal${profile!.goals.length === 1 ? "" : "s"} to build the recommendations below.`
              : "Tell Nexa about your background and we'll generate tailored recommendations, a skill plan, roadmap, and interview prep."}
          </p>
          {!hasProfile && hydrated && (
            <Link
              to="/setup"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition"
            >
              Start setup <ArrowUpRight className="h-4 w-4" />
            </Link>
          )}
        </section>

        {/* KPI strip */}
        <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Career readiness", value: `${plan.readinessPct}%`, accent: "text-brand-gradient" },
            { label: "Roles matched", value: `${plan.recs.length}` },
            { label: "Skills tracked", value: `${plan.gaps.filter(g => g.level >= g.target - 5).length} / ${plan.gaps.length}` },
            { label: "Prep sets", value: `${plan.interviews.length}` },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</div>
              <div className={`mt-2 font-display text-3xl ${k.accent ?? ""}`}>{k.value}</div>
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Career recommendations */}
          <section id="recs" className="lg:col-span-2">
            <SectionHeader icon={Briefcase} title="Career recommendations" caption="Roles aligned with your skills, goals, and strengths" />
            <div className="grid gap-4 md:grid-cols-3">
              {plan.recs.map((r) => (
                <div key={r.role} className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition hover:border-brand/40 hover:bg-surface-elevated">
                  <div className="flex items-start justify-between">
                    <div className="text-xs text-muted-foreground">Match</div>
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{r.match}%</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{r.role}</h3>
                  <div className="mt-1 text-sm text-muted-foreground">{r.salary}</div>
                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">Why: {r.why}.</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {r.tags.map((t) => (
                      <span key={t} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <button
                    onClick={() => notify(`Exploring path: ${r.role}`)}
                    className="mt-5 inline-flex items-center gap-1 text-sm text-brand hover:brightness-125"
                  >
                    Explore path <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Skills to improve */}
          <section id="skills">
            <SectionHeader icon={TrendingUp} title="Skills to improve" caption={`Close the gap toward ${plan.top.role}`} />
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
              {plan.gaps.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-muted-foreground">{s.level}% / {s.target}%</span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div className="relative h-full">
                      <div className="absolute inset-y-0 left-0 bg-brand-gradient" style={{ width: `${s.level}%` }} />
                      <div className="absolute inset-y-0 w-0.5 bg-foreground/60" style={{ left: `${s.target}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              <button
                onClick={() => notify(`Skill plan focused on ${plan.gaps[0]?.name ?? "your top gap"}`)}
                className="mt-2 w-full rounded-full border border-border py-2 text-sm hover:border-brand/40 hover:bg-surface-elevated transition"
              >
                Generate skill plan
              </button>
            </div>
          </section>

          {/* Learning roadmap */}
          <section id="roadmap" className="lg:col-span-2">
            <SectionHeader icon={BookOpen} title="Learning roadmap" caption={`A nine-week plan tuned to ${firstName} and your gaps`} />
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <ol className="relative space-y-4 border-l border-border pl-6">
                {plan.roadmap.map((r) => (
                  <li key={r.title} className="relative">
                    <span className={`absolute -left-[30px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                      r.done ? "bg-brand-gradient text-brand-foreground" : r.active ? "bg-brand-soft text-brand" : "bg-muted text-muted-foreground"
                    }`}>
                      {r.done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wider text-muted-foreground">{r.week}</div>
                        <div className={`mt-0.5 font-medium ${r.done ? "text-muted-foreground line-through" : ""}`}>{r.title}</div>
                      </div>
                      {r.active && (
                        <button
                          onClick={() => notify(`Continuing: ${r.title}`)}
                          className="inline-flex items-center gap-1 rounded-full bg-brand-gradient px-3 py-1.5 text-xs font-medium text-brand-foreground shadow-glow hover:brightness-110 transition"
                        >
                          <Play className="h-3 w-3" /> Continue
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* CV Improvement */}
          <section id="cv">
            <SectionHeader icon={FileText} title="CV coaching" caption={`Targeted for ${plan.top.role}`} />
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Overall score</div>
                  <div className="font-display text-4xl text-brand-gradient">{plan.cv.score}<span className="text-lg text-muted-foreground">/100</span></div>
                </div>
                <button
                  onClick={() => notify("CV uploader coming soon — try the quick wins below.")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:border-brand/40 hover:bg-surface-elevated transition"
                >
                  <Upload className="h-3 w-3" /> Upload CV
                </button>
              </div>
              <ul className="space-y-3">
                {plan.cv.tips.map((t) => (
                  <li key={t.title} className="rounded-xl border border-border bg-surface-elevated p-3">
                    <div className="text-sm font-medium">{t.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{t.desc}</div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Interview prep */}
          <section id="interview" className="lg:col-span-3">
            <SectionHeader icon={MessagesSquare} title="Interview preparation" caption={`Question sets tuned to ${plan.top.role}`} />
            <div className="grid gap-4 md:grid-cols-3">
              {plan.interviews.map((s) => (
                <button
                  key={s.title}
                  onClick={() => notify(`Starting session: ${s.title}`)}
                  className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 text-left shadow-card transition hover:border-brand/40 hover:bg-surface-elevated"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">{s.tag}</div>
                    <div className="mt-1 font-semibold">{s.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.count} questions</div>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient text-brand-foreground shadow-glow">
                    <Play className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Current strengths */}
          <section className="lg:col-span-1">
            <SectionHeader icon={Star} title="Your current strengths" caption={`What already works for ${plan.top.role}`} />
            <div className="space-y-3 rounded-2xl border border-border bg-surface p-5 shadow-card">
              {plan.strengths.map((s) => (
                <div key={s.name} className="rounded-xl border border-border bg-surface-elevated p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star className="h-3.5 w-3.5 text-brand" /> {s.name}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.detail}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended projects */}
          <section className="lg:col-span-2">
            <SectionHeader icon={Rocket} title="Projects to build" caption="Practical experience recruiters actually value" />
            <div className="grid gap-4 md:grid-cols-3">
              {plan.projects.map((pr) => (
                <div key={pr.title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">{pr.difficulty}</span>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{pr.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{pr.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {pr.skills.map((sk) => (
                      <span key={sk} className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">{sk}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Courses & certifications */}
          <section className="lg:col-span-3">
            <SectionHeader icon={GraduationCap} title="Recommended courses & certifications" caption={`Curated for ${plan.top.role}`} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {plan.courses.map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.kind}</div>
                  <div className="mt-2 font-semibold">{c.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.provider}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Action plan */}
          <section className="lg:col-span-3">
            <SectionHeader icon={Target} title="Your personalized action plan" caption="30 days · 90 days · 6 months" />
            <div className="grid gap-4 md:grid-cols-3">
              {plan.actions.map((a) => (
                <div key={a.horizon} className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <div className="text-xs uppercase tracking-wider text-brand">{a.horizon}</div>
                  <div className="mt-2 font-semibold">{a.title}</div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{a.detail}</p>
                </div>
              ))}
            </div>
          </section>
        </div>


        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div>
            <div className="font-display text-xl">Something changed?</div>
            <div className="text-sm text-muted-foreground">Update your profile to regenerate every recommendation instantly.</div>
          </div>
          <button
            onClick={() => navigate({ to: "/setup" })}
            className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition"
          >
            Update my profile <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-full border border-border bg-surface-elevated px-4 py-2.5 text-sm shadow-card backdrop-blur">
            <Sparkles className="h-4 w-4 text-brand" />
            <span>{toast}</span>
            <button onClick={() => setToast(null)} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, caption }: { icon: React.ComponentType<{ className?: string }>; title: string; caption: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </div>
    </div>
  );
}
