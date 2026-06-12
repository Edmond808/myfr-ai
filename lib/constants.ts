import {
  Anchor,
  CalendarHeart,
  Car,
  ConciergeBell,
  Hammer,
  Home,
  ShoppingBasket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { Category, Merchant } from "./types";

export const BRAND = "myfr.ai";
export const BRAND_TAGLINE = "My French Riviera · Côte d'Azur";
export const COMMISSION = 0.15;

export const PALETTE = {
  bg: "#F1F7FA",
  navy: "#10324A",
  azure: "#2B86BC",
  azureSoft: "#DCEDF6",
  amber: "#E2992F",
  amberSoft: "#FBF0DC",
  white: "#FFFFFF",
  line: "#D4E4ED",
} as const;

export const LOCATIONS = [
  "Cannes",
  "Nice",
  "Antibes",
  "Monaco",
  "Saint-Tropez",
  "Menton",
] as const;

export const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  groceries: ShoppingBasket,
  housekeeping: Sparkles,
  rentals: Home,
  transport: Car,
  boats: Anchor,
  handyman: Hammer,
  events: CalendarHeart,
  concierge: ConciergeBell,
};

/** Demo merchants — used when Supabase has no verified merchants yet */
export const DEMO_MERCHANTS: Record<Category, Merchant[]> = {
  groceries: [
    { name: "Côte Courses", rating: 4.9, jobs: 312, eta: "Replies in ~10 min" },
    { name: "Marché Express Cannes", rating: 4.7, jobs: 198, eta: "Replies in ~25 min" },
    { name: "Riviera Runners", rating: 4.8, jobs: 256, eta: "Replies in ~15 min" },
  ],
  housekeeping: [
    { name: "Maison Propre", rating: 4.9, jobs: 540, eta: "Replies in ~20 min" },
    { name: "Azur Clean Services", rating: 4.6, jobs: 173, eta: "Replies in ~40 min" },
    { name: "Villa Care Côte d'Azur", rating: 4.8, jobs: 389, eta: "Replies in ~15 min" },
  ],
  rentals: [
    { name: "Croisette Stays", rating: 4.8, jobs: 122, eta: "Replies in ~1 h" },
    { name: "Azur Properties", rating: 4.7, jobs: 240, eta: "Replies in ~45 min" },
    { name: "Riviera Living", rating: 4.9, jobs: 88, eta: "Replies in ~30 min" },
  ],
  transport: [
    { name: "Riviera Drivers Club", rating: 4.9, jobs: 670, eta: "Replies in ~5 min" },
    { name: "Azur Transfers", rating: 4.8, jobs: 415, eta: "Replies in ~10 min" },
    { name: "Côte VTC", rating: 4.6, jobs: 233, eta: "Replies in ~20 min" },
  ],
  boats: [
    { name: "Cap Marine Charters", rating: 4.9, jobs: 145, eta: "Replies in ~30 min" },
    { name: "Baie des Anges Boats", rating: 4.7, jobs: 97, eta: "Replies in ~1 h" },
    { name: "Esterel Yachting", rating: 4.8, jobs: 121, eta: "Replies in ~45 min" },
  ],
  handyman: [
    { name: "Atelier Riviera", rating: 4.8, jobs: 310, eta: "Replies in ~30 min" },
    { name: "FixAzur", rating: 4.6, jobs: 188, eta: "Replies in ~50 min" },
    { name: "Pro Travaux 06", rating: 4.7, jobs: 264, eta: "Replies in ~40 min" },
  ],
  events: [
    { name: "Chef à Domicile Riviera", rating: 4.9, jobs: 201, eta: "Replies in ~25 min" },
    { name: "Soirées d'Azur", rating: 4.8, jobs: 134, eta: "Replies in ~35 min" },
    { name: "Table Privée", rating: 4.7, jobs: 156, eta: "Replies in ~30 min" },
  ],
  concierge: [
    { name: "Clé d'Or Concierge", rating: 4.9, jobs: 420, eta: "Replies in ~15 min" },
    { name: "Riviera Assist", rating: 4.7, jobs: 298, eta: "Replies in ~25 min" },
    { name: "Maison & Co", rating: 4.8, jobs: 187, eta: "Replies in ~20 min" },
  ],
};

export const BASE_PRICE: Record<Category, number> = {
  groceries: 35,
  housekeeping: 90,
  rentals: 1800,
  transport: 110,
  boats: 950,
  handyman: 220,
  events: 480,
  concierge: 75,
};
