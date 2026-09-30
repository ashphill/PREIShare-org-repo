# PREIshare Investor Dashboard Shell

This is the starter project for the PREIshare investor dashboard (Sprint 3).
It uses TanStack Start, React, and TypeScript. For now it only shows mock data.

## What you need
- Node.js LTS (version 20 or newer). Download it from https://nodejs.org if `node -v` does not work.

## Setup
1. Open a terminal in the project folder (the one that contains `package.json`).
2. Install the packages:
   ```
   npm install
   ```
3. Start the dev server:
   ```
   npm run dev
   ```
4. Open the link printed in the terminal (usually http://localhost:3000). You should see the PREIshare home page.
5. To stop the server, press `Ctrl + C` in the terminal.

## Where things live
- `docs/` holds the planning docs: `dashboard-ia.md` (pages and URLs) and `component-plan.md` (UI pieces).
- `src/routes/` holds the pages. Each file is a route (file-based routing).
  - `__root.tsx` is the root layout that wraps every page.
  - `index.tsx` is the home page at `/`.
- `vite.config.ts` holds the build settings. `app.config.ts` points to it.
- `tsconfig.json` turns on TypeScript checking.

## Coming later
The dashboard pages (`/dashboard`, `/dashboard/portfolio`, `/dashboard/deals`, `/dashboard/profile`) and the AppShell components will be added in later steps. They are not part of this scaffold.
