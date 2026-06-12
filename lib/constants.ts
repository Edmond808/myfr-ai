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

/** Demo merchants — 6–8 per category; with Supabase, dispatch returns all verified pros */
export const DEMO_MERCHANTS: Record<Category, Merchant[]> = {
  groceries: [
    { name: "Côte Courses", rating: 4.9, jobs: 312, eta: "Replies in ~10 min", isPromoted: true, promotionRank: 10, responseMinutes: 10 },
    { name: "Riviera Runners", rating: 4.8, jobs: 256, eta: "Replies in ~15 min", isPromoted: true, promotionRank: 5, responseMinutes: 15 },
    { name: "Marché Express Cannes", rating: 4.7, jobs: 198, eta: "Replies in ~25 min", responseMinutes: 25 },
    { name: "Panier Azur", rating: 4.6, jobs: 142, eta: "Replies in ~30 min", responseMinutes: 30 },
    { name: "Courses Croisette", rating: 4.8, jobs: 221, eta: "Replies in ~18 min", responseMinutes: 18 },
    { name: "Nice Market Run", rating: 4.5, jobs: 167, eta: "Replies in ~35 min", responseMinutes: 35 },
    { name: "Villa Stock Nice", rating: 4.7, jobs: 189, eta: "Replies in ~22 min", responseMinutes: 22 },
  ],
  housekeeping: [
    { name: "Maison Propre", rating: 4.9, jobs: 540, eta: "Replies in ~20 min", isPromoted: true, promotionRank: 10, responseMinutes: 20 },
    { name: "Villa Care Côte d'Azur", rating: 4.8, jobs: 389, eta: "Replies in ~15 min", isPromoted: true, promotionRank: 5, responseMinutes: 15 },
    { name: "Azur Clean Services", rating: 4.6, jobs: 173, eta: "Replies in ~40 min", responseMinutes: 40 },
    { name: "Sparkle Riviera", rating: 4.7, jobs: 298, eta: "Replies in ~25 min", responseMinutes: 25 },
    { name: "Clean & Co 06", rating: 4.5, jobs: 156, eta: "Replies in ~45 min", responseMinutes: 45 },
    { name: "Prestige Housekeeping", rating: 4.9, jobs: 412, eta: "Replies in ~12 min", responseMinutes: 12 },
    { name: "Monaco Maid Service", rating: 4.6, jobs: 201, eta: "Replies in ~30 min", responseMinutes: 30 },
  ],
  rentals: [
    { name: "Riviera Living", rating: 4.9, jobs: 88, eta: "Replies in ~30 min", isPromoted: true, promotionRank: 10, responseMinutes: 30 },
    { name: "Croisette Stays", rating: 4.8, jobs: 122, eta: "Replies in ~1 h", isPromoted: true, promotionRank: 5, responseMinutes: 60 },
    { name: "Azur Properties", rating: 4.7, jobs: 240, eta: "Replies in ~45 min", responseMinutes: 45 },
    { name: "Cap d'Antibes Rentals", rating: 4.6, jobs: 95, eta: "Replies in ~50 min", responseMinutes: 50 },
    { name: "Monaco Luxury Lets", rating: 4.8, jobs: 134, eta: "Replies in ~35 min", responseMinutes: 35 },
    { name: "Villa Keys 06", rating: 4.5, jobs: 76, eta: "Replies in ~1 h", responseMinutes: 60 },
    { name: "Seaside Stays", rating: 4.7, jobs: 112, eta: "Replies in ~40 min", responseMinutes: 40 },
  ],
  transport: [
    { name: "Riviera Drivers Club", rating: 4.9, jobs: 670, eta: "Replies in ~5 min", isPromoted: true, promotionRank: 10, responseMinutes: 5 },
    { name: "Azur Transfers", rating: 4.8, jobs: 415, eta: "Replies in ~10 min", isPromoted: true, promotionRank: 5, responseMinutes: 10 },
    { name: "Côte VTC", rating: 4.6, jobs: 233, eta: "Replies in ~20 min", responseMinutes: 20 },
    { name: "Nice Airport Express", rating: 4.7, jobs: 389, eta: "Replies in ~8 min", responseMinutes: 8 },
    { name: "Monaco Chauffeurs", rating: 4.9, jobs: 512, eta: "Replies in ~6 min", responseMinutes: 6 },
    { name: "Cannes Cabs Pro", rating: 4.5, jobs: 198, eta: "Replies in ~15 min", responseMinutes: 15 },
    { name: "Prestige Transfers", rating: 4.8, jobs: 276, eta: "Replies in ~12 min", responseMinutes: 12 },
  ],
  boats: [
    { name: "Cap Marine Charters", rating: 4.9, jobs: 145, eta: "Replies in ~30 min", isPromoted: true, promotionRank: 10, responseMinutes: 30 },
    { name: "Esterel Yachting", rating: 4.8, jobs: 121, eta: "Replies in ~45 min", isPromoted: true, promotionRank: 5, responseMinutes: 45 },
    { name: "Baie des Anges Boats", rating: 4.7, jobs: 97, eta: "Replies in ~1 h", responseMinutes: 60 },
    { name: "Monaco Yacht Club", rating: 4.9, jobs: 178, eta: "Replies in ~25 min", responseMinutes: 25 },
    { name: "Cannes Day Sail", rating: 4.6, jobs: 84, eta: "Replies in ~50 min", responseMinutes: 50 },
    { name: "Azur Catamaran Co", rating: 4.7, jobs: 103, eta: "Replies in ~40 min", responseMinutes: 40 },
    { name: "Riviera Skipper Pro", rating: 4.8, jobs: 132, eta: "Replies in ~35 min", responseMinutes: 35 },
  ],
  handyman: [
    { name: "Atelier Riviera", rating: 4.8, jobs: 310, eta: "Replies in ~30 min", isPromoted: true, promotionRank: 10, responseMinutes: 30 },
    { name: "Pro Travaux 06", rating: 4.7, jobs: 264, eta: "Replies in ~40 min", isPromoted: true, promotionRank: 5, responseMinutes: 40 },
    { name: "FixAzur", rating: 4.6, jobs: 188, eta: "Replies in ~50 min", responseMinutes: 50 },
    { name: "Villa Maintenance Co", rating: 4.9, jobs: 342, eta: "Replies in ~25 min", responseMinutes: 25 },
    { name: "Plombier Express 06", rating: 4.5, jobs: 156, eta: "Replies in ~45 min", responseMinutes: 45 },
    { name: "Electric Azur", rating: 4.7, jobs: 221, eta: "Replies in ~35 min", responseMinutes: 35 },
    { name: "Handy Monaco", rating: 4.6, jobs: 174, eta: "Replies in ~42 min", responseMinutes: 42 },
  ],
  events: [
    { name: "Chef à Domicile Riviera", rating: 4.9, jobs: 201, eta: "Replies in ~25 min", isPromoted: true, promotionRank: 10, responseMinutes: 25 },
    { name: "Soirées d'Azur", rating: 4.8, jobs: 134, eta: "Replies in ~35 min", isPromoted: true, promotionRank: 5, responseMinutes: 35 },
    { name: "Table Privée", rating: 4.7, jobs: 156, eta: "Replies in ~30 min", responseMinutes: 30 },
    { name: "Riviera Events Co", rating: 4.6, jobs: 98, eta: "Replies in ~45 min", responseMinutes: 45 },
    { name: "Monaco Catering Pro", rating: 4.8, jobs: 167, eta: "Replies in ~28 min", responseMinutes: 28 },
    { name: "Villa Party Planners", rating: 4.5, jobs: 112, eta: "Replies in ~50 min", responseMinutes: 50 },
    { name: "Azur Private Dining", rating: 4.9, jobs: 189, eta: "Replies in ~20 min", responseMinutes: 20 },
  ],
  concierge: [
    { name: "Clé d'Or Concierge", rating: 4.9, jobs: 420, eta: "Replies in ~15 min", isPromoted: true, promotionRank: 10, responseMinutes: 15 },
    { name: "Riviera Assist", rating: 4.7, jobs: 298, eta: "Replies in ~25 min", isPromoted: true, promotionRank: 5, responseMinutes: 25 },
    { name: "Maison & Co", rating: 4.8, jobs: 187, eta: "Replies in ~20 min", responseMinutes: 20 },
    { name: "Monaco Lifestyle", rating: 4.6, jobs: 156, eta: "Replies in ~30 min", responseMinutes: 30 },
    { name: "Cannes VIP Desk", rating: 4.9, jobs: 234, eta: "Replies in ~12 min", responseMinutes: 12 },
    { name: "Azur Errands", rating: 4.5, jobs: 143, eta: "Replies in ~35 min", responseMinutes: 35 },
    { name: "Prestige Concierge 06", rating: 4.8, jobs: 201, eta: "Replies in ~18 min", responseMinutes: 18 },
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
