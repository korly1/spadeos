# SPADE OS — Web App

Next.js 14 + Supabase + Vercel rebuild of the Framer landing site.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + custom CSS |
| Backend / DB | Supabase (Postgres) |
| Deployment | Vercel |
| IDE | Cursor |

---

## Local Setup

### 1. Clone & install

```bash
git clone <your-repo>
cd spadeos
npm install
```

### 2. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Copy your **Project URL** and **anon key** from: Settings → API

### 3. Create the database table

In Supabase → SQL Editor, run:

```sql
create table assessment_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  role text not null,
  company_size text not null,
  pain_points text[] not null,
  urgency text not null,
  tried_so_far text,
  email text
);

-- Optional: enable Row Level Security
alter table assessment_submissions enable row level security;

-- Allow inserts from anon (public form submissions)
create policy "Allow public inserts" on assessment_submissions
  for insert to anon with check (true);

-- Allow only authenticated users to read (you + team)
create policy "Allow authenticated reads" on assessment_submissions
  for select to authenticated using (true);
```

### 4. Set environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # optional, for server-side bypassing RLS
```

### 5. Run locally

```bash
npm run dev
# → http://localhost:3000
```

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add the three keys from step 4.

### Option B — GitHub → Vercel dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add env variables in the Vercel dashboard under **Settings → Environment Variables**
4. Deploy

---

## Project Structure

```
spadeos/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── globals.css             # Global styles, design tokens
│   ├── page.tsx                # Landing page (hero)
│   ├── assessment/
│   │   └── page.tsx            # Assessment form
│   └── api/
│       └── submit-assessment/
│           └── route.ts        # POST → Supabase
├── components/
│   ├── Navbar.tsx              # Top navigation
│   └── NeuralCanvas.tsx        # Animated background
├── lib/
│   └── supabase.ts             # Supabase client + types
├── .env.local.example          # Env vars template
├── vercel.json                 # Vercel config
└── README.md
```

---

## Viewing Submissions

In Supabase dashboard → Table Editor → `assessment_submissions`

Or query directly:

```sql
select * from assessment_submissions order by created_at desc;
```

---

## Customization Notes

- **Colors**: edit CSS variables in `app/globals.css` (`:root` block)
- **Copy**: edit `app/page.tsx` for hero text, `app/assessment/page.tsx` for form options
- **Add pages**: create folders under `app/` — Next.js App Router handles routing automatically
- **Fonts**: swap `DM_Sans` / `Playfair_Display` in `app/layout.tsx` for any Google Font
