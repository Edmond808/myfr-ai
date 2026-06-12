import type { Category, JobClassification, Urgency } from "./types";
import { BRAND } from "./constants";

const CATEGORIES: Category[] = [
  "groceries",
  "housekeeping",
  "rentals",
  "transport",
  "boats",
  "handyman",
  "events",
  "concierge",
];

const BASE_PRICE: Record<Category, number> = {
  groceries: 35,
  housekeeping: 90,
  rentals: 1800,
  transport: 110,
  boats: 950,
  handyman: 220,
  events: 480,
  concierge: 75,
};

const KEYWORDS: Record<Category, string[]> = {
  groceries: ["grocery", "groceries", "shopping", "errand", "market", "courses", "courses"],
  housekeeping: ["housekeep", "clean", "cleaning", "maid", "villa care", "ménage"],
  rentals: ["rent", "rental", "apartment", "stay", "accommodation", "month", "location"],
  transport: ["transfer", "airport", "driver", "vtc", "taxi", "car", "transfert"],
  boats: ["boat", "yacht", "charter", "skipper", "marine", "bateau"],
  handyman: ["handyman", "fix", "repair", "works", "plumb", "electric", "bricolage"],
  events: ["chef", "dinner", "catering", "event", "party", "soirée", "repas"],
  concierge: ["concierge", "assist", "help", "other", "aide"],
};

const LOCATIONS = [
  "Cannes",
  "Nice",
  "Antibes",
  "Monaco",
  "Saint-Tropez",
  "Menton",
];

function detectCategory(text: string): Category {
  const lower = text.toLowerCase();
  let best: Category = "concierge";
  let bestScore = 0;

  for (const [category, words] of Object.entries(KEYWORDS) as [
    Category,
    string[],
  ][]) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = category;
    }
  }
  return best;
}

function detectLocation(text: string, fallback: string): string {
  const lower = text.toLowerCase();
  for (const loc of LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) return loc;
  }
  return fallback;
}

function detectUrgency(text: string): Urgency {
  const lower = text.toLowerCase();
  if (/today|tonight|asap|urgent|this morning|this afternoon|aujourd'hui|ce soir/.test(lower)) {
    return "today";
  }
  if (/this week|tomorrow|weekend|friday|saturday|sunday|demain|cette semaine/.test(lower)) {
    return "this_week";
  }
  return "flexible";
}

function demoClassify(text: string, location: string): JobClassification {
  const category = detectCategory(text);
  const jobLocation = detectLocation(text, location);
  const urgency = detectUrgency(text);
  const words = text.trim().split(/\s+/).slice(0, 8).join(" ");

  return {
    category,
    title: words.length > 40 ? words.slice(0, 40) + "…" : words,
    summary: text.trim(),
    location: jobLocation,
    urgency,
    budget_estimate_eur: BASE_PRICE[category],
    clarifying_question:
      category === "groceries"
        ? "Do you have a preferred supermarket or delivery window?"
        : category === "transport"
          ? "How many passengers and pieces of luggage?"
          : null,
    source: "demo",
  };
}

async function aiClassify(
  text: string,
  location: string,
): Promise<JobClassification> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return demoClassify(text, location);

  const prompt = `You are the dispatch engine of ${BRAND}, a services marketplace on the French Riviera.
Classify the customer request below and extract structured data.

Customer location: ${location}
Customer request: """${text}"""

Respond with ONLY a JSON object, no markdown fences, no preamble:
{
  "category": one of ["groceries","housekeeping","rentals","transport","boats","handyman","events","concierge"],
  "title": short job title max 8 words,
  "summary": one clear sentence restating the need for merchants,
  "location": the city if mentioned otherwise "${location}",
  "urgency": one of ["today","this_week","flexible"],
  "budget_estimate_eur": integer estimate of fair market price for this job on the French Riviera, or null,
  "clarifying_question": one short question that would help merchants quote accurately, or null
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text?: string }[];
  };
  const raw = data.content
    .map((i) => (i.type === "text" ? i.text : ""))
    .join("");
  const clean = raw.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as Omit<JobClassification, "source">;

  if (!CATEGORIES.includes(parsed.category)) {
    parsed.category = "concierge";
  }

  return { ...parsed, source: "ai" };
}

export async function classifyRequest(
  text: string,
  location: string,
): Promise<JobClassification> {
  try {
    return await aiClassify(text, location);
  } catch {
    return demoClassify(text, location);
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
