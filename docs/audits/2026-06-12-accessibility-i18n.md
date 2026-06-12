# Accessibility & i18n Audit — myfr.ai

**Date:** 2026-06-12  
**Scope:** UI accessibility (labels, focus, contrast, ARIA), EN/FR message parity (`lib/i18n/messages/`), brand consistency (`myfr.ai`), responsive layout at mobile breakpoints  
**Method:** `.cursor/AUDIT_PLAYBOOK.md` §3.7 + `accessibility-auditing`, `writing-copy`, `responsive-testing` skills; browser aria snapshots on `localhost:3000`; static review of components and i18n files  
**Build:** `npm run build` — **pass** (Next.js 15.5.19)  
**Note:** `lib/classify.ts` not modified (review-only).

---

## Executive summary

Message **key parity is complete** (179 keys in EN and FR). Brand name `myfr.ai` is consistent in constants, i18n, wordmark, and page metadata. The largest gaps are **accessibility**: form fields across auth, home, and pro flows use visual labels without `htmlFor`/`id` association, so screen readers expose unnamed textboxes. Several **runtime strings bypass i18n** (demo merchant ETAs, loyalty tier labels, global error page, splash tagline). **`document.lang` stays `en`** on first paint and is not updated when locale is restored from `localStorage` on load.

| Severity | Count |
|----------|-------|
| High | 4 |
| Medium | 8 |
| Low | 6 |

---

## Top findings (prioritized)

### 1. High — Form inputs lack programmatic labels

**Files:** `components/auth/LoginForm.tsx`, `components/auth/RegisterForm.tsx`, `components/HomeView.tsx`, `components/pro/MerchantSignupForm.tsx`, `components/pro/MerchantDashboard.tsx`

**Issue:** Labels are sibling elements above inputs, not associated via `htmlFor` + `id` or `aria-label`. Browser accessibility tree shows **empty textboxes** on login/register (verified via aria snapshot).

**Impact:** Screen reader users cannot identify email, password, request textarea, or quote fields without guessing from context.

**Recommended fix:**

```tsx
<label htmlFor="login-email" className="...">{t.auth.email}</label>
<input id="login-email" type="email" ... />
```

Apply the same pattern to home request `textarea` (visible label or `aria-label` using `t.home.sendRequest` / dedicated `requestLabel` key).

---

### 2. High — English-only strings shown in French UI

**Files:** `lib/constants.ts` (`DEMO_MERCHANTS[].eta`), `lib/loyalty.ts` (`LOYALTY_TIERS`, `tierBadgeLabel`), `app/error.tsx`, `components/LoadingSplash.tsx`, `components/LoyaltyBadge.tsx` (`showClub` path)

| String | Example | FR user sees |
|--------|-----------|--------------|
| Merchant ETA | `"Replies in ~10 min"` | English in quote cards |
| Tier badge | `"Azur I"`, `"Côte II"` | English (names in `loyalty.ts`, not `t.loyalty.tierAzur`) |
| Error page | `"Something went wrong"` | English on any route error |
| Splash tagline | `BRAND_TAGLINE` constant | Always `"My French Riviera · Côte d'Azur"` |
| Club badge | `Riviera Club · ${label}` | English prefix hardcoded |

**Recommended fix:** Add `dispatch.repliesIn` (or format from `responseMinutes`), use `t.loyalty.tierAzur` etc. in `tierBadgeLabel` / `LoyaltyBadge`, add `errors.*` keys to both message files, use `t.tagline` in splash.

---

### 3. High — `html lang` not aligned with active locale

**Files:** `app/layout.tsx` (hardcoded `lang="en"`), `lib/i18n/LocaleProvider.tsx`

**Issue:** Root layout sets `<html lang="en">`. `setLocale()` updates `document.documentElement.lang`, but the **initial `useEffect` that reads `localStorage` only calls `setLocaleState`** — not `document.documentElement.lang`. SSR and first client paint always declare English to assistive tech and search engines.

**Impact:** French users get wrong language hints to screen readers / translation tools even when UI strings are French.

**Recommended fix:**

```tsx
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === "en" || stored === "fr") {
    setLocaleState(stored);
    document.documentElement.lang = stored;
  }
}, []);
```

Consider cookie-based locale for SSR `lang` in a follow-up.

---

## EN/FR message parity

**Structural parity:** ✅ 179 keys in `en.ts` and `fr.ts` — no missing keys (verified via key walk).

### Copy / tone issues (side-by-side)

| Key | EN | FR | Issue | Suggested FR rewrite |
|-----|----|----|-------|---------------------|
| `categories.groceries` | Groceries & errands | Courses & errands | Mixed EN `"errands"` | `Courses & petits services` |
| `home.tip` | …press ⌘+Enter… | …⌘+Entrée… | Mac-only shortcut; no Ctrl+Enter | Add `Ctrl+Entrée` for Windows/Linux |
| `dispatch.demoMode` | …set ANTHROPIC_API_KEY… | …définissez ANTHROPIC_API_KEY… | Dev jargon in user-facing UI | `Mode démo — classification locale` |
| `pro.notificationsTodo` | Email notifications… (Resend) | …bientôt (Resend) | Internal vendor name | Drop `(Resend)` or use `notifications e-mail` |
| `requests.quotesCount` | `{count} quote(s)` | `{count} devis` | EN pluralization helper unused in FR | OK if count always shown; or `devis` / `devis` plural rules |
| `tagline` | My French Riviera · Côte d'Azur | Ma French Riviera · Côte d'Azur | Awkward *Ma French* | `Ma Riviera française · Côte d'Azur` |

### VoiceInput (outside message files)

`components/VoiceInput.tsx` defines EN/FR `LABELS` inline — functional, but breaks single-source i18n convention. Move to `messages` under `voice.start`, `voice.stop`, `voice.denied`.

---

## Brand consistency

| Check | Status | Notes |
|-------|--------|-------|
| `BRAND` constant | ✅ | `myfr.ai` in `lib/constants.ts` |
| `messages.brand` | ✅ | Both locales |
| `BrandWordmark` | ✅ | `aria-label={BRAND}` |
| Header reset button | ✅ | `aria-label={t.brand}` |
| Auth titles | ✅ | `Join myfr.ai`, `Rejoindre myfr.ai` |
| Page `<title>` | ✅ | `myfr.ai — My French Riviera · Côte d'Azur` |
| Legacy CSS classes | ⚠️ | `glass-rivly`, `rivly-shell` — internal only, not user-facing |
| Loyalty program name | ⚠️ | **Riviera Club** (not myfr.ai) — intentional product name per `LOYALTY.md` |
| Metadata description | ⚠️ | English only; no FR variant |

---

## Accessibility audit (browser + static)

### Critical / high

| # | Finding | Location |
|---|---------|----------|
| 1 | Unnamed form textboxes (no label association) | Auth, home textarea, pro quote form |
| 2 | `outline-none` on all inputs/buttons without custom `:focus-visible` ring | Global pattern in forms + `HomeView` |
| 3 | User menu trigger: on mobile, display name hidden (`hidden sm:inline`) — button may read as single letter | `UserMenu.tsx` |
| 4 | No skip-to-content link | App shell |

### Medium

| # | Finding | Location |
|---|---------|----------|
| 5 | `Stars` rating: no `aria-label` (e.g. "4.9 out of 5") | `Stars.tsx` |
| 6 | Filter chip remove buttons: icon-only `X` without `aria-label` | `QuoteFilterBar.tsx` |
| 7 | `LoadingSplash` blocks interaction ~2s; not announced to AT | `LoadingSplash.tsx` |
| 8 | Error messages use color only (red box) — add `role="alert"` | Forms, `HomeView` |
| 9 | `BadgeCheck` beside merchant names — decorative; OK if name conveys verified status |
| 10 | `LanguageSwitcher`: `sr-only` span present but EN/FR buttons lack `aria-pressed` for current locale | `LanguageSwitcher.tsx` |

### Passed

- Main landmark present on home and dispatch (`<main>` in `HomeView`, `DispatchView`)
- Header landmark (`<header>`)
- Category buttons have visible text names
- Voice mic button has `aria-label` when Web Speech API available
- OAuth SVG icons marked `aria-hidden`
- Decorative backgrounds `aria-hidden`
- Quote filter `<select>`s wrapped in `<label>` text (associated visually; selects get name from first option in some cases)
- Merchant signup checkboxes use proper `<label>` wrapping inputs

### Keyboard / focus (limited automation)

- Tab order appears logical on home (header → textarea → locations → actions → categories)
- Escape does not close `UserMenu` dropdown (click-outside only)
- Modals: none audited beyond splash overlay

### Contrast (visual review)

| Element | Colors | Assessment |
|---------|--------|------------|
| Tip / secondary text | `#8AA8B8` on light blue shell | ⚠️ May fail WCAG AA for small text |
| Placeholder / disabled CTA | `#9DBED1` on white | ⚠️ Disabled button contrast borderline |
| Primary CTA | Azure `#2B86BC` / white | ✅ Generally OK |
| Error text | `#8C3A2B` on `#FBE9E7` | ✅ OK |

---

## Responsive testing

| Viewport | Page | Result | Notes |
|----------|------|--------|-------|
| 375px | Home | **PASS** | Hero, textarea, category grid stack; location chips wrap |
| 375px | Register | **WARN** | Header nav links (`For pros`, `Sign in`, `Create account`) crowd language toggle — readable but tight |
| 375px | Dispatch (static) | **PASS** | Quote cards use `flex-wrap`; filter bar stacks |
| 768px | Home | **PASS** | Tagline visible (`sm:inline`) |
| 1280px | Home | **PASS** | Max-width containers center content |

No horizontal scroll observed at 375px. Touch targets on location chips (~28px height) slightly below 44px guideline — **low** priority.

---

## Pages audited

| Route | A11y snapshot | i18n |
|-------|---------------|------|
| `/` | Yes | EN default; FR strings in `fr.ts` verified statically |
| `/auth/login` | Yes — unnamed inputs | Uses `t.auth.*` |
| `/auth/register` | Yes — unnamed inputs | Uses `t.auth.*` |
| `/pro` | Static review | Uses `t.pro.*` |
| `/account/requests` | Static review | Uses `t.requests.*` |
| Dispatch view | Static review | Uses `t.dispatch.*` |

---

## Recommended fix order

1. **P1 — Label association** on all forms + home textarea (`htmlFor`/`id` or `aria-label`).
2. **P1 — Locale `lang`** sync on load; add `:focus-visible` styles (remove blind `outline-none`).
3. **P2 — i18n runtime strings** — merchant ETA, loyalty tiers, `error.tsx`, splash tagline.
4. **P2 — Copy polish** — FR `categories.groceries`, `tagline`, keyboard hint for non-Mac.
5. **P3 — Skip link, menu Escape, `aria-pressed` on language toggle, alert roles on errors.

---

## Appendix: i18n files not wired to UI

| Source | Strings |
|--------|---------|
| `lib/constants.ts` | All `DEMO_MERCHANTS[].eta` |
| `lib/loyalty.ts` | `LOYALTY_TIERS[].name`, `tierBadgeLabel()` |
| `app/error.tsx` | Full page |
| `components/VoiceInput.tsx` | `LABELS.en` / `LABELS.fr` |
| `lib/constants.ts` | `BRAND_TAGLINE` in splash |

---

*Audit version: 2026-06-12 · Playbook §3.7 · No code changes in this pass.*
