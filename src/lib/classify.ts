import type { JobClassification } from "./types";

export async function classifyRequest(
  text: string,
  location: string,
): Promise<JobClassification> {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, location }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? "Classification failed");
  }

  return response.json() as Promise<JobClassification>;
}
