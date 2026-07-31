import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Logo } from "@/components/nexa/Logo";
import {
  ArrowUpRight, Sparkles, Target, GraduationCap, Rocket, Star,
  TrendingUp, CheckCircle2, MessagesSquare, RefreshCw, FileText,
  Save, LogIn, LogOut, Check,
} from "lucide-react";
import { loadProfile, experienceLabel, type Profile, saveProfile } from "@/lib/nexa-engine";
import { supabase } from "@/integrations/supabase/client";
import {
  saveAiResultLocal, loadAiResultLocal, saveToCloud, markPendingSave,
} from "@/lib/nexa-cloud";

const skillLevelLabel: Record<string, string> = {
  "": "Not specified",
  none: "No skills yet",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
import { recommendWithAi, type AiRecommendResult } from "@/lib/ai-recommend.functions";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your AI career recommendations — Nexa AI" },
      { name: "description", content: "AI-generated career recommendations, skill gaps, and a personalized learning roadmap based on your profile." },
    ],
  }),
  component: Results,
});


function Results() {
  const navigate = useNavigate();
  const runRecommend = useServerFn(recommendWithAi);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [result, setResult] = useState<AiRecommendResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const run = async (p: Profile) => {
    setLoading(true);
    setError(null);
    try {
      const r = await runRecommend({
        data: {
          education: p.education,
          field: p.field,
          skillLevel: p.skillLevel ?? "",
          skills: p.skills,
          experience: p.experience,
          goals: p.goals,
          strengths: p.strengths,
          weaknesses: p.weaknesses,
        },
      });
      setResult(r);
      saveAiResultLocal(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const p = loadProfile();
    if (!p || !p.field) {
      navigate({ to: "/setup" });
      return;
    }
    setProfile(p);
    const cached = loadAiResultLocal();
    if (cached) {
      setResult(cached);
      setLoading(false);
    } else {
      void run(p);
    }
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const regenerate = async (p: Profile) => {
    await run(p);
  };

  const onSave = async () => {
    if (!profile) return;
    if (!userEmail) {
      // Not signed in — remember intent and go to auth
      saveProfile(profile);
      if (result) saveAiResultLocal(result);
      markPendingSave();
      navigate({ to: "/auth", search: { next: "/results" } });
      return;
    }
    setSaveState("saving");
    try {
      await saveToCloud(profile, result);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2500);
    } catch (e) {
      console.error(e);
      setSaveState("error");
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center animate-in fade-in duration-500">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft text-brand animate-pulse">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl">Nexa AI is thinking about your career…</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Analyzing your background, skills, goals, and strengths against dozens of career paths.
          </p>
          <div className="mt-8 mx-auto h-1 w-64 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 bg-brand-gradient animate-[nexa-slide_1.4s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile || !result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl">Nexa hit a snag</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error ?? "Missing profile."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => profile && run(profile)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition"
            >
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
            <Link to="/setup" className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-elevated transition">
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={saveState === "saving"}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-2 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition disabled:opacity-60"
            >
              {saveState === "saved" ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : userEmail ? "Save my results" : "Save my results"}
            </button>
            <button
              onClick={() => profile && regenerate(profile)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-elevated transition"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Regenerate
            </button>
            <Link to="/setup" className="rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-elevated transition">
              Edit profile
            </Link>
            {userEmail ? (
              <button
                onClick={onSignOut}
                title={userEmail}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted-foreground hover:bg-surface-elevated transition"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : (
              <Link to="/auth" search={{ next: "/results" }} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted-foreground hover:bg-surface-elevated transition">
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
            )}
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Profile summary */}
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-brand" /> AI-generated for your profile
          </div>
          <h1 className="mt-4 font-display text-4xl md:text-5xl">
            Your career recommendations, <span className="text-brand-gradient">personalized by AI</span>
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{result.summary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Education" value={profile.education || "—"} />
            <SummaryCard label="Field" value={profile.field || "—"} />
            <SummaryCard label="Experience" value={experienceLabel[profile.experience]} />
            <SummaryCard label="Skill level" value={skillLevelLabel[profile.skillLevel ?? ""]} />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <TagCard label="Skills" items={profile.skills} />
            <TagCard label="Goals" items={profile.goals} />
            <TagCard label="Strengths" items={profile.strengths} />
          </div>
        </section>

        {/* Personalized advice */}
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <MessagesSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Nexa's personalized advice</h2>
              <p className="text-xs text-muted-foreground">Written for your specific answers</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{result.advice}</p>
        </section>

        {/* Recommended careers */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Recommended careers</h2>
              <p className="text-xs text-muted-foreground">3 paths ranked by fit to your profile</p>
            </div>
          </div>

          {result.careers.map((c, i) => (
            <article key={c.role + i} className="rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.category}</div>
                  <h3 className="mt-1 font-display text-2xl md:text-3xl">{c.role}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Match</div>
                  <div className="font-display text-3xl text-brand-gradient">{c.match}%</div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-border bg-surface-elevated p-4">
                <div className="text-xs uppercase tracking-wider text-brand">Why this fits you</div>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.why}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <SubHeader icon={Star} title="Your current strengths" />
                  <ul className="mt-2 space-y-1.5">
                    {c.currentStrengths.map((s) => (
                      <li key={s} className="flex gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" /> <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <SubHeader icon={TrendingUp} title="Skills to learn" />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {c.skillsToLearn.map((s) => (
                      <span key={s} className="rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <SubHeader icon={GraduationCap} title="Learning roadmap" />
                <ol className="mt-3 relative space-y-4 border-l border-border pl-6">
                  {c.roadmap.map((r, ri) => (
                    <li key={r.step + ri} className="relative">
                      <span className="absolute -left-[30px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-brand text-[10px] font-semibold">
                        {ri + 1}
                      </span>
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-sm">{r.step}</div>
                        <div className="text-xs text-muted-foreground">{r.duration}</div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{r.detail}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-surface-elevated p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand">
                  <Rocket className="h-3.5 w-3.5" /> First project to start now
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{c.firstProject}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Next steps */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div>
            <div className="font-display text-xl">Ready to apply?</div>
            <div className="text-sm text-muted-foreground">
              Build an ATS-friendly CV tailored to <span className="text-foreground">{result.careers[0]?.role}</span>.
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm hover:bg-surface-elevated transition">
              Full dashboard <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/cv-builder"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition"
            >
              <FileText className="h-4 w-4" /> Build my CV
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function TagCard({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-xs text-muted-foreground">None listed</span>
        ) : (
          items.map((t) => (
            <span key={t} className="rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-xs text-muted-foreground">
              {t}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

function SubHeader({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-brand" /> {title}
    </div>
  );
}
