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
  eta?: string;
  isPromoted?: boolean;
  promotionRank?: number;
  responseMinutes?: number;
}

export type LoyaltyTier = 0 | 1 | 2 | 3;

export interface Quote {
  id?: string;
  merchant: Merchant;
  price: number;
  memberPrice?: number;
  message?: string | null;
  status?: string;
}

export interface PendingRequest {
  text: string;
  location: string;
  classification: JobClassification;
}

export interface PendingSession {
  request: PendingRequest;
  quote?: Quote;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  preferred_language: Locale;
  default_location: string;
  loyalty_tier?: LoyaltyTier;
}

export type MerchantStatus = "applied" | "under_review" | "verified" | "suspended";

export type JobStatus =
  | "submitted"
  | "classified"
  | "dispatched"
  | "quoted"
  | "accepted"
  | "in_progress"
  | "completed"
  | "disputed"
  | "cancelled";

export interface CustomerJobListItem {
  id: string;
  title: string;
  location: string;
  category: Category;
  status: JobStatus;
  created_at: string;
  quotes_total: number;
  quotes_submitted: number;
}

export const URGENCIES: Urgency[] = ["today", "this_week", "flexible"];

export const CATEGORIES: Category[] = [
  "groceries",
  "housekeeping",
  "rentals",
  "transport",
  "boats",
  "handyman",
  "events",
  "concierge",
];

export interface MerchantRecord {
  id: string;
  owner_id: string;
  business_name: string;
  siret: string | null;
  categories: Category[];
  service_areas: string[];
  status: MerchantStatus;
  whatsapp_phone: string | null;
  email: string | null;
  rating: number;
  jobs_completed: number;
  is_promoted?: boolean;
  promotion_rank?: number;
  promotion_expires_at?: string | null;
  created_at: string;
}

export interface MerchantJobFeedItem {
  quote_id: string;
  quote_status: string;
  expires_at: string | null;
  job_id: string;
  category: Category;
  title: string;
  summary: string;
  location: string;
  urgency: Urgency;
  budget_estimate_eur: number | null;
  created_at: string;
  merchant_id: string;
}
