# PREIshare dashboard — responsive QA checklist

**Tester:** Ashton Phillips (with AI-assisted checks in a browser pane)
**Date:** 2026-10-01
**App URL tested:** http://localhost:3000/dashboard (plus /dashboard/portfolio, /deals, /profile)
**Build / branch:** `main` at `bc5706c` + the QA fix below, running `npm run dev` (Vite 8.1.5)

## Breakpoints used

| Name    | Width  | How to set                                   |
|---------|--------|----------------------------------------------|
| Mobile  | 375px  | Browser viewport emulation (375×812)         |
| Tablet  | 768px  | Browser viewport emulation (768×1024)        |
| Desktop | 1280px | Browser viewport emulation (1280×800)        |

## How to use this sheet

1. Load the dashboard route with the dev server running.
2. For each row, set the width, perform the check, mark **Pass** or **Fail**.
3. On Fail, write a short **Symptom** and which **file** you will ask the agent to touch.
4. After a targeted fix, re-test and update **Status** and **Fix notes**.
5. Critical rows must Pass (or be listed under Known limitations with stakeholder-safe wording).

Measurements below came from the live page: page scroll width vs. viewport width, element
positions/widths, and clicking the real controls.

---

## Mobile (~375px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| M1 | No horizontal page scroll | Pass | Page scroll width 375 = viewport on Home, Portfolio, Deals, Profile | — |
| M2 | Header remains visible and usable | Pass | PREIshare mark, "Home overview" title, and investor placeholder all visible | — |
| M3 | Desktop sidebar is hidden or off-canvas | Pass | `.dash-sidebar` is `display: none` below 768px | — |
| M4 | MobileNav or menu control is visible | Pass | "☰ Open menu" button shown under the header, 44px tall | — |
| M5 | Menu opens and closes navigation links | Pass | Click → "✕ Close menu", `aria-expanded="true"`, 4 links (Home, Portfolio, Deals, Profile, each 44px). Tapping Deals went to /dashboard/deals, header became "Open deals", menu closed | — |
| M6 | Main content readable without pinched text | Pass | 16px side padding; welcome heading and demo note wrap normally | — |
| M7 | Metric cards stack in a single column | Pass | 3 cards, each 343px wide, stacked vertically | — |
| M8 | PortfolioSummary does not overflow or clip | Pass | 343px wide, no internal overflow; Portfolio table wrapper scrolls inside its card if needed (309px, no page scroll) | — |
| M9 | RecentActivity list wraps; no cut-off timestamps/labels | Pass | No row overflow; dates are `shrink-0` so they never get cut | — |
| M10 | Empty-state messaging (if shown) is fully visible | Pass | Sample data shown by default; empty messages are plain wrapping paragraphs in the same card width | — |

## Tablet (~768px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| T1 | No horizontal page scroll | Pass | Scroll width 753 (768 minus 15px scrollbar) | — |
| T2 | Navigation pattern matches plan | Pass | Sidebar visible (224px), MobileNav hidden; never both at once | — |
| T3 | Header + content spacing not cramped | Pass | Main region 529px wide with 24px padding | — |
| T4 | Metric cards use a sensible 2-column layout | Fail → Pass | First test: 2 columns, but the third card sat alone at half width with an empty gap beside it | Cycle 1: in `src/routes/dashboard/index.tsx` only, make a lone last card span both columns between 640–1023px. Re-test: cards 233/233, then third card 481px full width |
| T5 | PortfolioSummary and RecentActivity share space without overlap | Pass | Stacked, each 481px wide, no overlap | — |
| T6 | Touch/click targets large enough | Pass | Sidebar links 44px tall | — |

## Desktop (~1280px)

| ID | Check | Status (Pass/Fail) | Symptom / notes | Fix notes (prompt + files) |
|----|--------|--------------------|-----------------|----------------------------|
| D1 | Sidebar visible and usable per architecture | Pass | Sidebar 224px on the left with brand and 4 links; active link highlighted | — |
| D2 | MobileNav hidden | Pass | `.dash-mobile-nav` is `display: none` at 768px+ | — |
| D3 | Main region has comfortable padding/margins | Pass | 24px padding, main 1041px wide | — |
| D4 | Metric cards align in a multi-column row | Pass | 3 cards × 320px in one row; T4 fix does not apply at this width | — |
| D5 | PortfolioSummary + RecentActivity sit in intended regions | Pass | Side by side, 489px each | — |
| D6 | Long labels/numbers do not break header or sidebar width | Pass | Header title and "$300,000" fit; sidebar stays 224px | — |

## Cross-cutting issues

| ID | Check | Status | Notes |
|----|--------|--------|-------|
| X1 | Focus order / keyboard: menu and links reachable | Pass | Pressing Tab from the sidebar brand focused "Home" with a visible 2px teal `:focus-visible` outline |
| X2 | No layout jump when opening/closing mobile menu | Pass | Menu panel opens below the button and pushes content down; page width unchanged (375) |
| X3 | Important metrics appear before lists on small screens | Pass | Order on mobile: welcome → 3 metric cards → Portfolio summary → Recent activity |

## Targeted fix log (one row per prompt cycle)

| Cycle | Breakpoint | File(s) touched | Prompt summary (one sentence) | Result after re-test |
|-------|------------|-----------------|-------------------------------|----------------------|
| 1 | Tablet 768px | `src/routes/dashboard/index.tsx` | "In index.tsx only, between 640–1023px make a lone last MetricCard span both grid columns; don't change mobile or desktop." | Pass at 768 (third card full width); re-checked 375 (still stacked) and 1280 (still 3 across) |

`src/routeTree.gen.ts` was also regenerated by the dev server (TanStack Router codegen), not hand-edited.

## Known limitations (optional)

- The starter site header (TanStack Start, Home/About/Docs) still sits above the dashboard at every width. It's from the original template in `__root.tsx`; removing it is a separate cleanup task.
- The TanStack devtools badge shows in the corner in dev mode only; it does not appear in production builds.

## Sign-off

- [x] Critical mobile checks M1–M7 pass
- [x] Critical tablet checks T1–T5 pass
- [x] Critical desktop checks D1–D5 pass
- [x] Fix log filled for every change made during QA
- [x] Touched components still match the architecture (no accidental full rewrite)

**Ready for stakeholder handoff draft:** Yes
