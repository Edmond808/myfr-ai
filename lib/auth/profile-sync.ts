import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Locale } from "@/lib/types";

export function displayNameFromUser(
  user: User,
  profile?: { full_name?: string | null } | null,
): string {
  if (profile?.full_name?.trim()) return profile.full_name.trim();
  const meta = user.user_metadata ?? {};
  const fromMeta =
    meta.full_name ||
    meta.name ||
    [meta.given_name, meta.family_name].filter(Boolean).join(" ");
  if (fromMeta) return fromMeta;
  return user.email?.split("@")[0] ?? "User";
}

export function initialFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return trimmed.charAt(0).toUpperCase();
}

export async function syncProfileFromAuth(
  supabase: SupabaseClient,
  user: User,
): Promise<Locale | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, preferred_language")
    .eq("id", user.id)
    .single();

  const meta = user.user_metadata ?? {};
  const updates: Record<string, string> = {};

  if (!profile?.full_name?.trim()) {
    const name =
      meta.full_name ||
      meta.name ||
      [meta.given_name, meta.family_name].filter(Boolean).join(" ");
    if (name) updates.full_name = name;
  }

  if (!profile?.preferred_language) {
    const raw = meta.preferred_language ?? meta.locale;
    const lang =
      typeof raw === "string" ? raw.slice(0, 2).toLowerCase() : null;
    if (lang === "fr" || lang === "en") {
      updates.preferred_language = lang;
    }
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("profiles").update(updates).eq("id", user.id);
  }

  const preferred = (updates.preferred_language ??
    profile?.preferred_language) as Locale | undefined;
  return preferred === "fr" || preferred === "en" ? preferred : null;
}
