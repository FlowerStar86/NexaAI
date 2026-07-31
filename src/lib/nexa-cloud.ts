import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/nexa-engine";
import type { AiRecommendResult } from "@/lib/ai-recommend.functions";
import { saveProfile } from "@/lib/nexa-engine";

const AI_RESULT_KEY = "nexa.aiResult.v1";
const PENDING_SAVE_KEY = "nexa.pendingSave.v1";

export function saveAiResultLocal(r: AiRecommendResult) {
  try { localStorage.setItem(AI_RESULT_KEY, JSON.stringify(r)); } catch {}
}
export function loadAiResultLocal(): AiRecommendResult | null {
  try {
    const raw = localStorage.getItem(AI_RESULT_KEY);
    return raw ? (JSON.parse(raw) as AiRecommendResult) : null;
  } catch { return null; }
}
export function clearAiResultLocal() {
  try { localStorage.removeItem(AI_RESULT_KEY); } catch {}
}

export function markPendingSave() {
  try { sessionStorage.setItem(PENDING_SAVE_KEY, "1"); } catch {}
}
export function consumePendingSave(): boolean {
  try {
    const v = sessionStorage.getItem(PENDING_SAVE_KEY);
    if (v) sessionStorage.removeItem(PENDING_SAVE_KEY);
    return !!v;
  } catch { return false; }
}

export async function saveToCloud(profile: Profile, aiResult: AiRecommendResult | null) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) throw new Error("Not signed in");
  const { error } = await supabase
    .from("nexa_saves")
    .upsert(
      {
        user_id: user.id,
        profile: profile as never,
        ai_result: (aiResult as never) ?? null,
      },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}

export async function loadFromCloud(): Promise<{ profile: Profile | null; aiResult: AiRecommendResult | null }> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { profile: null, aiResult: null };
  const { data, error } = await supabase
    .from("nexa_saves")
    .select("profile, ai_result")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return { profile: null, aiResult: null };
  return {
    profile: (data.profile as Profile) ?? null,
    aiResult: (data.ai_result as AiRecommendResult) ?? null,
  };
}

export async function hydrateFromCloudIntoLocal(): Promise<{ profile: Profile | null; aiResult: AiRecommendResult | null }> {
  const cloud = await loadFromCloud();
  if (cloud.profile) saveProfile(cloud.profile);
  if (cloud.aiResult) saveAiResultLocal(cloud.aiResult);
  return cloud;
}
