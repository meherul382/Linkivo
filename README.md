# Linkivo — Personal URL Shortener

A private single-owner URL shortener built with Next.js and Supabase.

## Features
- Private sign-in (Supabase Auth; no public registration)
- Create short links with optional custom aliases
- Edit destinations without changing short URLs
- Delete/archive links
- Instant 302 redirects
- Click analytics
- Responsive dashboard

## Setup
1. Configure the Supabase project credentials as Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
2. Apply `supabase/schema.sql` in the Supabase SQL Editor.
3. Create your own user in Supabase Authentication. Public signups should remain disabled.
4. Configure `NEXT_PUBLIC_SITE_URL` to your deployed URL. Custom domains can be configured in Vercel.
5. Redeploy the app.

Do not commit service-role/secret keys to Git.
