<div align="center">
  <img src="public/coolroute-logo.svg" alt="CoolRoute logo" width="96" />
  <h1>CoolRoute</h1>
  <p><strong>Choose a more comfortable way to walk.</strong></p>
  <p>Compare pedestrian routes by travel time and estimated direct-sun exposure.</p>
  <p>
    <a href="https://coolroute-chi.vercel.app">Open the live app</a>
  </p>
  <p>
    <img alt="Quality checks" src="https://github.com/Milind9206/coolroute/actions/workflows/quality.yml/badge.svg" />
    <img alt="Next.js" src="https://img.shields.io/badge/Next.js-App_Router-111111?logo=nextdotjs" />
    <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" />
    <img alt="MapLibre" src="https://img.shields.io/badge/Maps-MapLibre-396CB2" />
    <img alt="Supabase" src="https://img.shields.io/badge/Auth%20%26%20database-Supabase-3FCF8E?logo=supabase&logoColor=white" />
  </p>
</div>

## Contents

- [Why CoolRoute](#why-coolroute)
- [Features](#features)
- [How it works](#how-it-works)
- [Quick start](#quick-start)
- [Supabase setup](#supabase-setup)
- [Project structure](#project-structure)
- [Data sources and limitations](#data-sources-and-limitations)
- [Security](#security)
- [Contributing](#contributing)
- [FAQ](#faq)

## Why CoolRoute

Most walking directions optimize for time or distance. CoolRoute lets you compare a fast route with an alternative that aims to reduce modeled direct-sun exposure, so you can make the trade-off that suits your walk.

## Features

- **Route comparison:** view the fastest walking route alongside a shade-aware alternative.
- **Time-aware estimates:** change departure time and see solar position and forecast UV and temperature update.
- **Exposure budget:** set a preferred direct-sun budget; when available routes exceed it, the app shows the lowest modeled exposure among its candidates.
- **Interactive map:** search for places, choose endpoints on the map, and view street or satellite tiles.
- **Account and issue reporting:** Supabase Auth keeps an account available across sessions; issue reports are stored in Supabase Postgres.
- **User preferences:** responsive layouts, light/dark themes, and English/Hindi UI.
- **Automated checks:** GitHub Actions runs lint and production-build checks on pushes and pull requests; Dependabot checks for dependency updates.

## How it works

1. Search for a start and destination, or select points on the map.
2. CoolRoute requests pedestrian route candidates and weather data for the start location.
3. For each returned route, the app estimates walking time and direct-sun exposure using the selected time, route geometry, solar position, and simplified shade assumptions.
4. It displays the fastest option and the candidate with the lowest estimated exposure that fits the configured distance and exposure constraints.

The [formula page](/formulas) in the app describes the current calculations and assumptions.

## Quick start

### Requirements

- Node.js 20 or newer
- npm
- A Supabase project for persistent sign-in and issue reports

### Install and run

```bash
git clone https://github.com/Milind9206/coolroute.git
cd coolroute
npm ci
```

Copy `.env.example` to `.env.local`, fill in the Supabase values below, and start Next.js:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local` instead. Open [http://localhost:3000](http://localhost:3000).

Available checks and commands:

```bash
npm run lint
npm run build
npm run start
```

## Supabase setup

1. Create a Supabase project.
2. Run [`supabase/migrations/20261016000000_persistent_accounts_and_issue_reports.sql`](supabase/migrations/20261016000000_persistent_accounts_and_issue_reports.sql) in the Supabase SQL Editor.
3. Set these variables in `.env.local` and in your deployment environment:

   | Variable | Purpose |
   | --- | --- |
   | `SUPABASE_URL` | Supabase project URL |
   | `SUPABASE_ANON_KEY` | Supabase anon/publishable key used by server routes |
   | `SITE_URL` | Optional canonical URL for metadata; defaults to the production URL |

4. In Supabase Authentication URL Configuration, allow local and deployed callback URLs that end in `/auth/callback`.

Supabase Auth handles passwords. The app stores the session in an HTTP-only cookie. The included migration enables row-level security for profiles and issue reports. Keep those policies enabled.

## Project structure

```text
.github/                CI, dependency updates, and contribution templates
app/                    App Router pages and API handlers
components/             Shared UI, authentication, planner, and marketing UI
components/marketing/   Landing-page sections and animation components
lib/                    Authentication, routing, and shared content
public/                 Logos, icons, and local fonts
supabase/migrations/    Postgres schema and row-level security policies
docs/                   Architecture and contributor documentation
```

## Data sources and limitations

- **Walking routes:** Valhalla pedestrian routing using OpenStreetMap data.
- **Place search:** OpenStreetMap geocoding.
- **Weather:** Open-Meteo hourly temperature and UV forecasts.
- **Sun position:** calculated from the route coordinates, chosen time, and time zone.
- **Shade:** an estimate based on solar angle and simplified building/canopy assumptions. The route service does not provide measured tree cover or actual building heights.

CoolRoute does not measure shade on the street, guarantee a route is shaded, or assess personal medical risk. Forecasts and exposure values are estimates and may differ from real conditions. The route alternatives and public map/weather services can also have availability or rate limits.

## Security

- Never commit `.env.local`, credentials, session tokens, private keys, or production user data. `.env.example` contains placeholders.
- Never put a service-role key, database password, or other private credential in browser code or a `NEXT_PUBLIC_*` variable.
- If a real credential was exposed, revoke or rotate it with its provider immediately. Deleting it in a later commit does not remove it from Git history.
- See [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## Contributing

Bug reports, documentation improvements, and focused code changes are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please do not include real user data or credentials in issues, screenshots, or commits.

## FAQ

### Is the CoolRoute path guaranteed to be the shadiest?

No. It is the lowest estimated exposure among the route alternatives returned by the routing service, using simplified shade assumptions. It does not have live, measured tree or building shade data.

### What happens if no candidate fits my exposure budget?

CoolRoute shows the lowest-exposure candidate it has and explains that the selected budget was not met.

### Are passwords stored in the CoolRoute database?

Passwords are managed by Supabase Auth. CoolRoute stores profile data and issue reports under the included row-level security policies.

### Where do I report a security issue?

Use GitHub's private vulnerability reporting option for this repository. See [SECURITY.md](SECURITY.md).

## License

No open-source license is currently specified. All rights are reserved unless the repository owner adds a license.
