# Surfelt

AI-powered product safety scanner. Scan a barcode, photograph an ingredient label, or search by name — Surfelt reads every ingredient and grades each one A–D, cross-referenced against your personal health profile.

## Features

- **Barcode scan** — looks up ingredients from Open Food Facts, UPC Item DB, and OpenFDA
- **Photo scan** — AI reads the ingredient list directly from a product photo; falls back to a database lookup if the ingredient list isn't visible but the product name is
- **Ingredient safety analysis** — grades each ingredient A to D (Very Safe → Potentially Harmful)
- **Health profile matching** — flags ingredients that conflict with your allergies, dietary preferences, or health conditions
- **Scan history** — every result saved to your dashboard
- **Per-user daily scan limits** — configurable per account via the `daily_scan_limit` column in the `profiles` table

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth / Database / Storage | Supabase |
| AI — vision extraction | Groq · `meta-llama/llama-4-scout-17b-16e-instruct` |
| AI — ingredient analysis | Groq · `llama-3.3-70b-versatile` |
| Barcode reading | `@zxing/browser` + native `BarcodeDetector` |
| Styling | Tailwind CSS + inline styles |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

Run the following in your Supabase SQL editor:

```sql
-- User profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  first_name text,
  last_name text,
  username text,
  date_of_birth date,
  phone text,
  allergies text[],
  dietary_preferences text[],
  health_conditions text[],
  age integer,
  daily_scan_limit integer not null default 20,
  created_at timestamptz default now()
);

-- Scan results
create table scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  product_name text,
  raw_ingredients text,
  analysis jsonb,
  overall_grade text,
  image_url text,
  created_at timestamptz default now()
);

-- Daily usage tracking
create table scan_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now()
);
```

Enable Row-Level Security on all three tables and add policies so users can only read and write their own rows.

### Storage Bucket

Create a public bucket named `scan-images` in your Supabase project for storing product photos.

## Scan Limits

Each user defaults to **20 scans per day**. To change the limit for a specific user, update their `daily_scan_limit` column directly in the Supabase dashboard — no code change or redeployment needed.

## Deployment

Deploy to Vercel and set the same three environment variables in your project settings. Google OAuth requires your production domain to be added to the Supabase Auth allowed redirect URLs and to the Google Cloud Console OAuth consent screen.

## Legal Notice

Surfelt uses AI to analyze ingredients. Results are for **informational purposes only** and do not constitute medical, dietary, or professional advice. The app collects health profile data (allergies, dietary preferences, health conditions), scan history, and uploaded product images. See the disclaimer on the landing page for full details.
