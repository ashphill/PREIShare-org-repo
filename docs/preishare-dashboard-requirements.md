# PREIshare Investor Dashboard — Requirements Brief

## 1. Product context
PREIshare is a real-estate investment platform. Investors need one clear home base where
they can see how their portfolio is doing, browse open deals, and check their profile.
This sprint builds the **dashboard shell only**: the layout, navigation, and clearly
labeled placeholder content. It does not include live portfolio data, sign-in, or payments.

## 2. Primary actor and goals
- **Actor:** Investor (a PREIshare member viewing their own dashboard)
- **Goals on first visit:**
  1. Recognize they are in the PREIshare investor area (brand name in the header/sidebar)
  2. Move between Home, Portfolio, Deals, and Profile without getting lost
  3. See high-level portfolio numbers at a glance (total value, holdings, open deals)
  4. Scan recent activity on their investments

## 3. Primary screens (this sprint)
| Screen | Route | Purpose | In this sprint? |
|--------|-------|---------|-----------------|
| Dashboard home | `/dashboard` | Shell + metric cards + recent activity placeholders | Yes |
| Portfolio | `/dashboard/portfolio` | Placeholder holdings table | Yes (minimal) |
| Deals | `/dashboard/deals` | Placeholder list of open deals | Yes (minimal) |
| Profile | `/dashboard/profile` | Read-only placeholder profile card | Yes (minimal) |
| Login / signup | — | Authentication | No (later) |
| Live portfolio detail / investing | — | Real data and transactions | No (later) |

## 4. Dashboard layout regions
1. **Header** — current page title and a simple account placeholder area
2. **Navigation** — sidebar with Home, Portfolio, Deals, Profile on desktop; a menu button opens it on small screens
3. **Metrics region** — summary number cards on Home (placeholders OK)
4. **Activity region** — list of recent investment events on Home (placeholders OK)
5. **Main content area** — where each page's own content appears inside the shell

## 5. Must-have vs later
### Must-have (demoable shell)
- File-based routes under `/dashboard` (home, portfolio, deals, profile)
- One shared app shell: header + navigation + main content
- Responsive layout that works at phone, tablet, and desktop widths
- Placeholder metric cards and a recent-activity list on Home
- Every placeholder labeled "sample" so nobody mistakes it for real data
- Friendly empty-state messages when a list has no items
- Plain nav labels an investor understands (Home, Portfolio, Deals, Profile)

### Later (out of scope now)
- Real Supabase/PostgreSQL data, live balances, or pgvector search
- Sign-in, roles, and permissions
- Investing, payments, checkout, document vault, or tax exports
- Admin or sponsor tools
- A polished brand design system
- Charts that need live time-series data

## 6. Success criteria (how we know the shell is done)
- [ ] Opening `/dashboard` in a browser shows the dashboard home
- [ ] Header, navigation, metrics, and activity regions are all visible on desktop
- [ ] Clicking Portfolio, Deals, and Profile changes the URL, the highlighted link, and the header title
- [ ] At about 375px wide, the menu button opens the navigation and every page is still reachable
- [ ] Every placeholder number or list is visibly labeled as sample data
- [ ] Nothing from the "Later" list appears in the build
- [ ] A teammate can read this brief and explain the scope in under 5 minutes

## 7. Notes for AI-assisted build
- Point every implementation prompt at this file as the scope limit.
- Build in small steps: routes → shell → navigation → widgets → home page → responsive check.
- Reject any agent output that adds sign-in, live data, payments, or other "Later" items without asking.
- Related docs: `docs/investor-dashboard-brief.md`, `docs/dashboard-ia.md`, `docs/component-plan.md`.
