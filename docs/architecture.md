# CoolRoute architecture

## Request flow

1. The Next.js App Router renders the landing page, planner, formulas, and account pages.
2. The planner sends place searches to `/api/geocode`, pedestrian route requests to `/api/route`, and forecast requests to `/api/environment`.
3. Those server routes call OpenStreetMap/Nominatim, Valhalla, and Open-Meteo respectively. The browser does not need provider credentials for these public data requests.
4. The planner evaluates returned route geometry using walking time, SunCalc solar position, and simplified shade assumptions. The result is a comparison estimate, not measured street shade.
5. Authentication API routes communicate with Supabase Auth. A successful session is stored in an HTTP-only cookie.
6. The issue-report API requires a session and writes the report to Supabase Postgres. Row-level security policies in the migration limit profile and report access by user.

## Main areas

| Area | Responsibility |
| --- | --- |
| `app/` | Pages, layouts, and server route handlers |
| `components/` | Planner, authentication, navigation, and reusable UI |
| `components/marketing/` | Landing-page sections and motion/visual components |
| `lib/` | Authentication helpers, route and sun calculations, shared content |
| `supabase/migrations/` | Profile/report tables, trigger, grants, and row-level security |

## Trust boundaries

- Supabase project URL and anon/publishable key are configuration, not authorization. Database access must remain protected by row-level security.
- Never add a Supabase service-role key to this application or expose secrets through `NEXT_PUBLIC_*`.
- The browser submits route endpoints and issue-report content; API routes validate those inputs before using upstream services or saving data.
- External geocoding, routing, and forecast services can rate-limit or become unavailable. UI estimates should make their source and limitations clear.
