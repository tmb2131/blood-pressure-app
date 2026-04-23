# Blood Pressure Readings

Mobile-first web app to record SYS / DIA / Pulse readings, replacing the old Google Sheet. Daily averages on a chart with 135/85 and 140/90 threshold lines. Data is stored as a single JSON file: `data/readings.json` in **this** repo, updated via the GitHub Contents API when deployed to Vercel.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind
- Recharts for the chart
- Octokit to read/write `data/readings.json` in the same GitHub repo as the app
- Installable PWA

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no `GH_TOKEN`, the app reads/writes `data/readings.json` on disk (the file in the repo, or empty state if missing).

To test GitHub writes locally, set `GH_TOKEN` and `GH_REPO` (e.g. `owner/blood-pressure-readings`) in `.env.local`.

## Production setup (one-time)

1. Push this repo to GitHub (include committed `data/readings.json`).

2. Create a **fine-grained** personal access token:

   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens → **Generate new token**
   - Resource owner: your user
   - Repository access: **Only select repositories** → this app repo
   - Permissions → Repository permissions → **Contents: Read and write**
   - Copy the token

3. Deploy to Vercel (`vercel` or connect the repo in the dashboard).

4. In the Vercel project → Environment variables (Preview + Production), set:

   | Name       | Value                |
   | ---------- | -------------------- |
   | `GH_TOKEN` | the token            |

   Redeploy. Vercel provides `VERCEL_GIT_REPO_OWNER` and `VERCEL_GIT_REPO_SLUG` at build/runtime so you do **not** need `GH_REPO` in production. Optional: `GH_PATH` (default `data/readings.json`), `GH_BRANCH` (default `main` or the deployment ref).

5. On your phone: open the Vercel URL in mobile Safari → Share → **Add to Home Screen** (or Android “Install app”).

## How the data flows

```text
phone → app → /api/readings → Octokit → GitHub Contents API → data/readings.json (this repo)
```

Each write commits to `main` (or your `GH_BRANCH`), which can trigger a new Vercel deploy.

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run start` — run the built app
- `node scripts/make-icons.mjs` — regenerate PNG icons (solid navy squares; iOS masks them on the home screen)
