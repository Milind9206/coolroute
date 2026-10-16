This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Configure persistent accounts and issue reports

CoolRoute uses Supabase Auth for account credentials and PostgreSQL for user profiles and issue reports. Passwords are handled by Supabase Auth and are never stored by CoolRoute in plain text. Session refresh tokens are kept in an HTTP-only cookie.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/migrations/20261016000000_persistent_accounts_and_issue_reports.sql`](supabase/migrations/20261016000000_persistent_accounts_and_issue_reports.sql).
3. Copy `.env.example` to `.env.local` and fill in your project's URL and anon/publishable key from the Supabase API settings. These server-side variables must also be configured in Vercel for a deployed site.
4. Restart the development server. New accounts will then be available across browsers and devices after sign-in.

Email confirmation follows the setting in Supabase Authentication. If enabled, the confirmation link returns to `/auth/callback`, establishes the session, and opens the app. The Supabase Authentication URL Configuration must allow these callback URLs:

- `http://localhost:3000/auth/callback`
- `https://coolroute-chi.vercel.app/auth/callback`
- `https://coolroute.runs-on.dev/auth/callback`

Confirmation links are single-use. If a link has expired or was already opened, return to Sign up or Sign in and use **Resend confirmation email** to request another.

The old prototype stored accounts only in one browser. Those accounts do not transfer automatically; create a new account after Supabase is configured.

### Run the app

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
