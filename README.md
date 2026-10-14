# Linkivo — Personal URL Shortener

A private single-owner URL shortener built with Next.js and Supabase.

## Features
- Private password-only dashboard (no Supabase Email/Password sign-in)
- Create short links with optional custom aliases
- Edit destinations without changing short URLs
- Archive links
- Public 302 short-link redirects
- Click analytics
- Responsive dashboard

## Setup
1. Configure these Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `LINKIVO_DASHBOARD_PASSWORD` — your private dashboard password
   - `LINKIVO_SESSION_SECRET` — a long random secret, at least 32 characters
   - `NEXT_PUBLIC_SITE_URL` — the deployed Linkivo base URL, without a trailing slash
2. Apply `supabase/schema.sql` in the Supabase SQL Editor.
3. Redeploy after setting the environment variables.
4. Open `/login` and use the dashboard password you set in Vercel. Short URLs redirect publicly without dashboard login.

The dashboard uses a signed, HTTP-only session cookie. The Supabase service key is used only server-side. Never commit passwords or service-role/secret keys to Git or expose them as `NEXT_PUBLIC_*` variables.
