# 🥘 Munch Around

A smart weekly meal planner built with Next.js 14, TypeScript, Tailwind CSS, and Prisma (SQLite).

## Features

- **Weekly Planner** — auto-generate a 7-day meal plan scored by preference, health, freshness, variety, and prep-time suitability
- **Meal Library** — browse, filter, add, edit, and delete meals with health/taste scores
- **Shopping List** — aggregated ingredient list from the current plan, grouped by category, with checkboxes
- **Meal History** — paginated log of all accepted meal plans
- **Settings** — configure which slots (lunch/dinner) are enabled per day, and tune scoring weights

## Quick Start

```bash
# Install dependencies
npm install

# Run database migration
npx prisma migrate dev

# Seed 35 starter meals + default settings
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:seed` | Seed the database with starter meals |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:reset` | Reset and re-migrate the database |
| `npm run setup` | Migrate + seed in one step |

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma v7 + `@prisma/adapter-better-sqlite3`
- **ORM**: Prisma

## Scoring Algorithm

Each meal slot is scored using a weighted sum of:
- **Preference score** — user-rated taste (0–10)
- **Health score** — nutritional quality (0–10)
- **Freshness** — penalty for meals eaten recently (within 14 days)
- **Variety** — penalty for meals already in the current week's plan
- **Prep suitability** — long-prep meals preferred on weekends

All weights are configurable in the Settings page.

