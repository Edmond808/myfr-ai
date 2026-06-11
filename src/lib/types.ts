export type Category =
  | "groceries"
  | "housekeeping"
  | "rentals"
  | "transport"
  | "boats"
  | "handyman"
  | "events"
  | "concierge";

export type Urgency = "today" | "this_week" | "flexible";

export type View = "home" | "dispatch";

export interface JobClassification {
  category: Category;
  title: string;
  summary: string;
  location: string;
  urgency: Urgency;
  budget_estimate_eur: number | null;
  clarifying_question: string | null;
  source?: "ai" | "demo";
}

export interface Merchant {
  name: string;
  rating: number;
  jobs: number;
  eta: string;
}

export interface Quote {
  merchant: Merchant;
  price: number;
}
