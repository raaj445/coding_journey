# Ticketly — Ticket Listing Marketplace

A React + Vite starter for a ticket listing website. The first implemented screen is the login page.

## Tech stack

- React
- Vite
- Supabase Auth
- Vercel hosting

## Run locally

1. Install Node.js (LTS).
2. Clone this repository.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env` and add your Supabase project URL and publishable key.
5. Start the development server:

   ```bash
   npm run dev
   ```

## Supabase setup

In Vercel, add these environment variables:

- `VITE_SUPABASE_URL`: your Supabase Project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: your Supabase publishable key (starts with `sb_publishable_`)

Vite exposes browser variables only when they start with `VITE_`. The older `NEXT_PUBLIC_...` variables do not get read by this React + Vite app.

Use the publishable key only in browser code. Never add a Supabase secret/service-role key to a `VITE_...` variable.

## Current status

- Login UI implemented.
- Email/password sign-in uses Supabase Auth when environment variables are configured.
- Sign-up and profile table are intentionally the next step.
