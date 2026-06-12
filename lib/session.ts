export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";

  let id = sessionStorage.getItem("myfr-session-id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("myfr-session-id", id);
  }
  return id;
}
