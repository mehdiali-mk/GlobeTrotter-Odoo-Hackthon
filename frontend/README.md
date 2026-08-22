# GlobeTrotter

A multi-city travel planning app: create trips, build day-by-day itineraries,
track budgets, discover cities and activities, collaborate with trip members,
share plans with the community, and manage users from an admin panel.

Built with **React 19 + JavaScript + Tailwind CSS 4 + TanStack Router**.
There is no TypeScript source in the project.

## Run locally

```bash
npm install
npm run dev
```

Then open the printed URL (http://localhost:8080 by default).

```bash
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # eslint
```

## Structure

```
public/                 static files (favicon, robots.txt)
src/
  assets/               images used by the UI
  components/           reusable UI (ui/, layout/, domain components)
  pages/                one component per screen
  routes/               file-based routes (TanStack Router)
  context/              app data + toast providers
  data/                 the project dataset
  services/             data access helpers (backend-ready)
  utils/                formatting, validation, permissions, images
  styles.css            Tailwind theme + design tokens
```

## Submission layout

`frontend/` contains the exact same runnable application, produced with:

```bash
bash scripts/export-frontend.sh
```

The copy at the root exists because the online editor/preview requires it;
`frontend/` is the folder to open in VS Code (`cd frontend && npm install && npm run dev`).
