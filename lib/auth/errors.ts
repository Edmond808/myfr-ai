import type { AuthError } from "@supabase/supabase-js";

export type AuthMessages = {
  loginError: string;
  registerError: string;
  registerBrokenAccount?: string;
  registerRateLimit?: string;
  registerAlreadyExists?: string;
};

/** Map Supabase auth errors to user-facing copy; include raw message in dev. */
export function formatAuthError(
  error: AuthError,
  messages: AuthMessages,
  action: "login" | "register",
): string {
  const msg = error.message ?? "";
  const code = error.code ?? "";

  if (/database error (finding user|querying schema)/i.test(msg)) {
    return (
      messages.registerBrokenAccount ??
      "This email has a broken account. Contact support."
    );
  }
  if (code === "over_email_send_rate_limit") {
    return messages.registerRateLimit ?? "Too many sign-up emails. Wait and try again.";
  }
  if (code === "user_already_registered" || /already registered/i.test(msg)) {
    return messages.registerAlreadyExists ?? "An account with this email already exists.";
  }
  if (action === "login" && code === "invalid_credentials") {
    return messages.loginError;
  }

  const fallback = action === "login" ? messages.loginError : messages.registerError;
  if (process.env.NODE_ENV === "development") {
    return `${fallback} [${code || "error"}: ${msg}]`;
  }
  return fallback;
}
