// Nexa AI — CV Builder storage & profile mapping.
import { loadProfile, type Profile } from "./nexa-engine";

export type CvEducation = { school: string; degree: string; year: string };
export type CvExperience = { company: string; role: string; period: string; bullets: string[] };
export type CvProject = { name: string; desc: string; skills: string };
export type CvCertification = { name: string; issuer: string; year: string };

export type CvData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string; // linkedin / portfolio, comma separated
  targetRole: string;
  summary: string;
  education: CvEducation[];
  hasExperience: boolean;
  experience: CvExperience[];
  skills: string[];
  projects: CvProject[];
  certifications: CvCertification[];
  languages: string[];
  interests: string[];
};

export const emptyCv: CvData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  links: "",
  targetRole: "",
  summary: "",
  education: [{ school: "", degree: "", year: "" }],
  hasExperience: true,
  experience: [{ company: "", role: "", period: "", bullets: [""] }],
  skills: [],
  projects: [{ name: "", desc: "", skills: "" }],
  certifications: [],
  languages: [],
  interests: [],
};

const KEY = "nexa.cv.v1";

export function saveCv(cv: CvData) {
  try { localStorage.setItem(KEY, JSON.stringify(cv)); } catch {}
}
export function loadCv(): CvData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return { ...emptyCv, ...JSON.parse(raw) };
  } catch { return null; }
}

// Prefill CV from the Nexa profile + a target role suggestion.
export function prefillCvFromProfile(targetRole?: string): CvData {
  const p: Profile | null = loadProfile();
  if (!p) return { ...emptyCv, targetRole: targetRole ?? "" };

  const noExp = p.experience === "" || p.experience === "none" || p.experience === "<1";
  const summaryBits: string[] = [];
  if (p.field) summaryBits.push(`${p.field} candidate`);
  if (targetRole) summaryBits.push(`focused on ${targetRole}`);
  if (p.strengths[0]) summaryBits.push(`strong in ${p.strengths.slice(0, 2).join(" & ")}`);
  const summary = summaryBits.length
    ? summaryBits.join(", ") + "."
    : "Motivated professional building the skills to move into a target career path.";

  return {
    ...emptyCv,
    targetRole: targetRole ?? "",
    summary,
    education: p.education ? [{ school: "", degree: p.education, year: "" }] : emptyCv.education,
    hasExperience: !noExp,
    experience: noExp ? [] : emptyCv.experience,
    skills: p.skills.slice(),
    interests: p.goals.slice(),
  };
}
