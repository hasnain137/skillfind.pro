# SkillFind.pro Frontend

SkillFind.pro connects clients with vetted professionals across tutoring, coaching, wellness, tech, and home services.  
This repository contains the marketing site plus the in-app dashboards for both clients and professionals built with the Next.js App Router.

## 🔎 Highlights

- **Marketing landing page** with hero search, category sections, trust signals, and featured professionals.
- **Client experience** including dashboard, request list, and “create request” form scaffolding styled with a shared design system.
- **Professional area** with its own layout, dashboard, matching request list, offer form, and profile editor UI.
- **Reusable UI kit** (cards, stats, pills, badges, action cards, dashboard hero, etc.) to keep the design language consistent across roles.
- **Docs** inside `docs/` summarizing requirements, workflows, and agent usage guidelines.

## 🛠 Tech Stack

- [Next.js 16 (App Router)](https://nextjs.org/) & React 19
- TypeScript + strict module boundaries
- Tailwind CSS v4 (utility classes embedded via PostCSS)
- Turbopack for dev/build

## 📁 Project Structure

```
src/
├─ app/
│  ├─ page.tsx                # Landing page entry
│  ├─ client/…                # Client dashboard routes and layout
│  └─ pro/…                   # Professional dashboard routes and layout
├─ components/
│  ├─ landing/…               # Marketing-specific sections
│  ├─ layout/…                # Navbar & footer
│  └─ ui/…                    # Shared UI primitives (Card, Button, SectionHeading, etc.)
├─ public/                    # Static assets
└─ docs/                      # Requirements, workflows, agent guide
```

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Visit **http://localhost:3000** to see the site.  
The App Router hot-reloads automatically when you edit files inside `src/`.

## 📦 Scripts

| Command          | Description                                   |
| ---------------- | --------------------------------------------- |
| `npm run dev`    | Start the development server (Turbopack)      |
| `npm run build`  | Production build + type-check                 |
| `npm run start`  | Start the Next.js production server           |
| `npm run lint`   | Run lint checks via `next lint`               |

## 🧭 Development Notes

- Keep UI additions consistent with the color palette and rounded shapes defined in the existing components.
- Shared atoms live in `src/components/ui/`; prefer extending those before creating page-specific styles.
- Client and pro dashboards mirror each other’s layout (sidebar + hero + cards) for cohesion—follow those patterns when adding new sections.
- Requirements evolve fast: check `docs/requirements_summary.md` and `docs/project_workflow.md` before larger changes.

Ready to build? Start by wiring the dashboards to real data models (requests, offers, wallets) and follow the docs for the upcoming admin panel work.

