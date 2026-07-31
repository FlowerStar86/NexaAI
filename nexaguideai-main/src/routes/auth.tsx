import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/nexa/Logo";
import { Sparkles, ArrowLeft } from "lucide-react";
import { consumePendingSave, hydrateFromCloudIntoLocal, saveToCloud, loadAiResultLocal } from "@/lib/nexa-cloud";
import { loadProfile } from "@/lib/nexa-engine";

const searchSchema = z.object({
  next: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Nexa AI" },
      { name: "description", content: "Sign in or create your Nexa AI account to save your career profile and AI recommendations." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // If already logged in, run any pending save + hydration then bounce to next.
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        await handlePostAuth();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePostAuth = async () => {
    try {
      const pending = consumePendingSave();
      if (pending) {
        const profile = loadProfile();
        const aiResult = loadAiResultLocal();
        if (profile) await saveToCloud(profile, aiResult);
      } else {
        await hydrateFromCloudIntoLocal();
      }
    } catch (e) {
      console.error(e);
    }
    navigate({ to: (search.next as "/results") ?? "/results" });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await handlePostAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Logo />
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-card">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-center font-display text-2xl">
            {mode === "signup" ? "Create your Nexa account" : "Welcome back to Nexa"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signup"
              ? "Save your questionnaire, AI recommendations and roadmap."
              : "Sign in to load your saved career profile."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-brand"
                placeholder="At least 8 characters"
              />
            </div>
            {error && <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
            {notice && <div className="rounded-lg border border-border bg-surface-elevated p-3 text-xs text-muted-foreground">{notice}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-brand-foreground shadow-glow hover:brightness-110 transition disabled:opacity-60"
            >
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New to Nexa AI?"}{" "}
            <button
              onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
              className="text-brand hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Create an account"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
