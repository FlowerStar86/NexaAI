import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/nexa/Logo";
import { ArrowRight, Sparkles, Compass, FileText, GraduationCap, MessagesSquare, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  { icon: Compass, title: "Career discovery", desc: "AI-driven role matching based on your skills, experience, and long-term goals." },
  { icon: GraduationCap, title: "Personalized roadmap", desc: "A structured, week-by-week learning plan targeting the exact skills you need next." },
  { icon: FileText, title: "CV intelligence", desc: "Deep résumé analysis with quantified feedback recruiters actually respond to." },
  { icon: MessagesSquare, title: "Interview coaching", desc: "Realistic mock interviews with instant, actionable feedback on every answer." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-bg" aria-hidden />
        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#how" className="hover:text-foreground transition">How it works</a>
            <Link to="/dashboard" className="hover:text-foreground transition">Dashboard</Link>
          </nav>
          <Link to="/setup" className="rounded-full border border-border bg-surface/60 px-4 py-2 text-sm backdrop-blur hover:bg-surface-elevated transition">
            Get started
          </Link>
        </header>

        <section className="relative mx-auto max-w-6xl px-6 pb-28 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Your AI-powered career platform
            </div>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] md:text-7xl">
              Engineer the career<br />
              <span className="text-brand-gradient">you were meant for.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              Nexa AI combines career intelligence, skill mapping, and interview coaching in one platform — so you can navigate your career with confidence and clarity.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/setup"
                className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-medium text-brand-foreground shadow-glow transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-95"
              >
                Get started free
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/cv-builder"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm backdrop-blur hover:bg-surface-elevated transition"
              >
                Build my CV
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand" /> Private by default</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-brand" /> Setup in 2 minutes</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-brand" /> No credit card required</span>
            </div>
          </div>

          {/* Preview card */}
          <div className="relative mx-auto mt-20 max-w-4xl">
            <div className="rounded-2xl border border-border bg-surface/70 p-2 shadow-card backdrop-blur">
              <div className="rounded-xl border border-border bg-background/60 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                    </span>
                    Nexa is analyzing your profile…
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live preview</span>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {[
                    { role: "Product Designer", match: 94 },
                    { role: "UX Researcher", match: 88 },
                    { role: "Design Engineer", match: 82 },
                  ].map((r) => (
                    <div key={r.role} className="rounded-lg border border-border bg-surface p-4">
                      <div className="text-xs text-muted-foreground">Match {r.match}%</div>
                      <div className="mt-1 font-medium">{r.role}</div>
                      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full bg-brand-gradient" style={{ width: `${r.match}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <div className="max-w-2xl">
          <div className="text-xs font-medium uppercase tracking-wider text-brand">Platform</div>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">One intelligent platform for your entire career.</h2>
          <p className="mt-4 text-muted-foreground">Four focused modules that work in concert — from first application to executive interview.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-surface p-6 transition hover:border-brand/40 hover:bg-surface-elevated">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-brand">Process</div>
              <h2 className="mt-2 font-display text-4xl md:text-5xl">How it works</h2>
            </div>
            <ol className="space-y-6">
              {[
                { n: "01", t: "Build your profile", d: "Share your education, skills, and career goals in under two minutes." },
                { n: "02", t: "Receive your plan", d: "Get matched roles, skill gap analysis, and a personalized learning roadmap." },
                { n: "03", t: "Prepare and land offers", d: "Refine your CV, rehearse interviews, and apply with unmatched confidence." },
              ].map((s) => (
                <li key={s.n} className="flex gap-6 border-t border-border pt-6">
                  <div className="font-display text-2xl text-brand-gradient">{s.n}</div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-16 flex justify-center">
            <Link
              to="/setup"
              className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-medium text-brand-foreground shadow-glow transition hover:brightness-110"
            >
              Start your career plan <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <Logo />
          <div>© {new Date().getFullYear()} Nexa AI — Intelligence for careers that matter.</div>
        </div>
      </footer>
    </div>
  );
}
