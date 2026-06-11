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

export type View = "home" | "dispatch" | "auth";

export type Locale = "en" | "fr";

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
  id?: string;
  name: string;
  rating: number;
  jobs: number;
  eta: string;
}

export interface Quote {
  id?: string;
  merchant: Merchant;
  price: number;
  message?: string | null;
  status?: string;
}

export interface PendingRequest {
  text: string;
  location: string;
  classification: JobClassification;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  preferred_language: Locale;
  default_location: string;
}
