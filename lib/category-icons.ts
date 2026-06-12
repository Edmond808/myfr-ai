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
import type { Category } from "./types";

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
