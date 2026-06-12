import type { Messages } from "@/lib/i18n/messages/en";

function interpolate(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replace(`{${key}}`, String(val)),
    template,
  );
}

export function formatMerchantEta(
  responseMinutes: number | undefined,
  eta: string | undefined,
  t: Messages,
): string | null {
  if (responseMinutes != null) {
    if (responseMinutes >= 60) {
      return t.dispatch.repliesInHour;
    }
    return interpolate(t.dispatch.repliesInMinutes, { minutes: responseMinutes });
  }
  return eta || null;
}
