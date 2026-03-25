<div align="center">
  <h1>LeadSniper</h1>
  <p><strong>AI-Powered Lead Generation & Outreach Engine for Freelancers</strong></p>
  <p>Find businesses, analyze their digital weaknesses, score opportunities, and generate hyper-personalized outreach — all automated.</p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
    <img src="https://img.shields.io/badge/Playwright-Headless-2EAD33?style=flat-square&logo=playwright" alt="Playwright" />
    <img src="https://img.shields.io/badge/Gemini_2.5-AI_Drafts-4285F4?style=flat-square&logo=google" alt="Gemini" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
  </p>

  <p>
    <a href="#-features">Features</a> &bull;
    <a href="#-architecture">Architecture</a> &bull;
    <a href="#-quick-start">Quick Start</a> &bull;
    <a href="#-deployment">Deployment</a> &bull;
    <a href="#-project-structure">Project Structure</a>
  </p>
</div>

---

## What is LeadSniper?

LeadSniper is a full-stack B2B prospecting tool built for freelance developers and digital agencies. It automates the entire lead generation pipeline:

1. **Discover** businesses via Google Places API across any niche and city
2. **Crawl** their websites with Playwright to extract emails, social links, tech stacks, and app store presence
3. **Analyze** their digital presence using Google PageSpeed Insights (Core Web Vitals, SEO, accessibility)
4. **Score** each lead across 23 factors to surface the best opportunities (0-100)
5. **Draft** personalized cold emails, WhatsApp messages, and LinkedIn DMs using Gemini 2.5 AI
6. **Manage** your entire sales pipeline through a premium real-time dashboard

The scraper runs **locally on your machine** (free, no serverless costs), while the dashboard deploys to **Vercel** (free tier) with **Supabase** (free tier) as the database. Total cost: **$0**.

---

## Features

### Scraper Engine

- **Google Places Search** — Discover businesses by niche + city, with automatic pagination for large result sets
- **Playwright Deep Crawl** — Headless browser visits homepages + contact/about pages to extract emails, social links, tech stack indicators, and mobile app links
- **PageSpeed Insights Analysis** — Extracts 17+ metrics per site: FCP, LCP, CLS, TTI, viewport, meta tags, structured data, image optimization, PWA support
- **23-Factor Opportunity Scoring** — Niche-aware scoring system (0-100) that considers website quality, speed, mobile-friendliness, SEO, social presence, business health, and more
- **AI Message Drafting** — Generates channel-appropriate outreach (Email, WhatsApp, LinkedIn) with tone modifiers and service-type targeting
- **Watch Mode** — Idles locally with minimal RAM, auto-processes search requests queued from the dashboard
- **Duplicate Detection** — Skips businesses already in your database via `google_place_id` matching
- **macOS Launcher** — Double-click `LeadSniper.command` to start watch mode instantly

### Dashboard

- **Premium UI** — Dark-themed, glass-morphism design with Framer Motion animations throughout
- **8 Themes** — Midnight, Obsidian, Sapphire, Jade, Ember, Cream (light), Aurora, Rose — all with live preview
- **Collapsible Sidebar** — Responsive layout for split-screen and smaller displays
- **Real-time Updates** — Supabase Realtime subscriptions keep every page in sync
- **Kanban Pipeline** — Drag-and-drop board with 7 status columns including Follow Up
- **Lead Detail Panel** — Score diagnostic (all 23 factors visualized), AI message regeneration with custom prompts/tones/service targeting, contact history log
- **Bulk Actions** — Select multiple leads and change status in one click
- **Snipe Page** — Search from the dashboard UI, save search presets, track request status in real-time
- **Insights Page** — Stats cards (today/week/month/all-time), trend charts, score distribution, niche performance, speed breakdown
- **Follow-up System** — Auto-moves contacted leads to "Follow Up" after configurable days, with snooze buttons (3d/7d/14d)
- **Hover Preview** — Animated card appears on lead hover showing key metrics at a glance
- **Contact Tracking** — Log which channel you used (email/WhatsApp/LinkedIn/phone) and the outcome per lead
- **Settings UI** — Configure all API keys and personal info directly in the browser, stored securely in your Supabase instance

### Opportunity Scoring (23 Factors)

| Category | Factors | Max Points |
|----------|---------|------------|
| Website Quality | Existence, Desktop Speed, Mobile Speed, SSL, Responsive | 28 |
| Core Web Vitals | FCP, LCP, CLS, TTI | 15 |
| SEO & Content | Meta tags, OG tags, Structured Data, Image Optimization, Content Freshness | 16 |
| Digital Gaps | No Mobile App, No Web App/Portal, No Online Booking, No PWA | 13 |
| Business Signals | Rating + Reviews, Social Media Gaps, Contact Reachability, Tech Stack Age | 22 |
| **Total** | **23 factors** | **~97** |

Higher score = bigger opportunity. A lead with a 4.8-star rating, 200 reviews, and a broken WordPress site from 2019? That's a **jackpot**.

---

## Architecture

```
┌────────────────────────────────┐         ┌──────────────────────┐
│       Dashboard (Vercel)       │         │   Scraper (Local)    │
│                                │         │                      │
│  Next.js 14 App Router        │◄───────►│  Playwright Crawler  │
│  Framer Motion UI             │   Real  │  PageSpeed Analyzer  │
│  Recharts Analytics           │   time  │  Gemini AI Drafter   │
│  @hello-pangea/dnd Kanban     │  Supa-  │  Opportunity Scorer  │
│                                │  base   │  Commander CLI       │
└────────────┬───────────────────┘         └──────────┬───────────┘
             │                                        │
             │         ┌──────────────────┐           │
             └────────►│    Supabase      │◄──────────┘
                       │                  │
                       │  PostgreSQL DB   │
                       │  Realtime Subs   │
                       │  Row Level Sec   │
                       └──────────────────┘
```

The dashboard queues search requests in `ms_search_requests`. The scraper polls this table in **watch mode**, processes the request, and writes results back. The dashboard picks up changes instantly via Supabase Realtime.

---

## Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **Supabase** account (free tier — [supabase.com](https://supabase.com/))
- **Google Cloud** account for Places API key (free $200/month credit)
- **Google AI Studio** account for Gemini API key (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/hatimhtm/LeadSniper.git
cd LeadSniper

# Install dashboard dependencies
cd dashboard && npm install && cd ..

# Install scraper dependencies + Playwright browsers
cd scraper && npm install && npx playwright install chromium && cd ..
```

### 2. Database Setup

1. Create a new project on [Supabase](https://supabase.com/dashboard/projects)
2. Go to **SQL Editor** → **New Query**
3. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**
4. Go to **Project Settings** → **API** and copy your Project URL and `anon` public key

### 3. Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Important:** Never commit this file. It's already in `.gitignore`.

### 4. Run Locally

```bash
# Terminal 1: Dashboard
cd dashboard && npm run dev
# → Open http://localhost:3000

# Terminal 2: Scraper (direct search)
cd scraper && node src/index.js "Dental Clinic" "Paris"

# Or: Scraper (watch mode — waits for dashboard requests)
cd scraper && node src/index.js watch
```

### 5. Configure API Keys

Open the dashboard → **Settings** page and add:

| Key | Where to Get It | Cost |
|-----|----------------|------|
| Google Places API Key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → Enable "Places API (New)" | Free $200/month credit |
| Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) | Free tier: 1000+ req/day |

Fill in your name, title, and email to personalize AI drafts.

---

## Deployment

### Dashboard → Vercel (Free)

1. Push this repo to your GitHub account
2. Go to [vercel.com](https://vercel.com/) → **Add New Project** → Import your repo
3. Set **Root Directory** to `dashboard`
4. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy — your dashboard is live!

### Scraper → Your Machine

The scraper uses Playwright (headless browser), which **must run locally**. This keeps costs at zero and avoids IP blocking issues with cloud functions.

**macOS:** Double-click `LeadSniper.command` to launch watch mode.

**Manual:**
```bash
cd scraper && node src/index.js watch --interval 30
```

The scraper idles with minimal RAM usage when no requests are pending.

---

## Supabase Realtime Setup

For live dashboard updates, enable Realtime on your tables:

1. Go to **Supabase Dashboard** → **Database** → **Replication**
2. Enable replication for: `ms_leads`, `ms_searches`, `ms_search_requests`

> This is already included in the schema.sql, but verify it's active in your dashboard.

---

## Project Structure

```
LeadSniper/
├── dashboard/                    # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx          # Overview (KPIs + charts)
│   │   │   │   ├── layout.tsx        # Sidebar + theme + follow-ups
│   │   │   │   ├── leads/page.tsx    # Lead table (bulk actions, hover preview)
│   │   │   │   ├── pipeline/page.tsx # Kanban board (drag & drop)
│   │   │   │   ├── snipe/page.tsx    # Search from dashboard + presets
│   │   │   │   ├── insights/page.tsx # Analytics & stats
│   │   │   │   ├── analytics/page.tsx# Event analytics
│   │   │   │   ├── search/page.tsx   # Search history
│   │   │   │   └── settings/page.tsx # API keys + theme picker
│   │   │   └── api/
│   │   │       └── regenerate/route.ts  # AI message regeneration endpoint
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── LeadDetail.tsx    # Score diagnostic + AI regen + contact log
│   │   │   │   ├── LeadCard.tsx      # Kanban card
│   │   │   │   └── KPICard.tsx       # Animated stat card
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx       # Collapsible nav
│   │   │   │   └── Navbar.tsx        # Top bar
│   │   │   └── ui/
│   │   │       ├── LeadHoverCard.tsx  # Animated hover preview
│   │   │       ├── ScoreGauge.tsx     # Circular score visualization
│   │   │       ├── StatusBadge.tsx    # Status pill
│   │   │       ├── SlideDrawer.tsx    # Side panel
│   │   │       └── EmptyState.tsx     # Empty state illustration
│   │   ├── lib/
│   │   │   ├── hooks.ts              # Data hooks + real-time + actions
│   │   │   ├── themes.ts             # 8 themes with CSS variables
│   │   │   ├── supabase.ts           # Supabase client
│   │   │   ├── settings.ts           # Settings CRUD
│   │   │   └── utils.ts              # Helpers
│   │   └── types/
│   │       └── index.ts              # All TypeScript types + scoring labels
│   └── package.json
│
├── scraper/                      # Node.js CLI Engine
│   └── src/
│       ├── index.js              # CLI entry + watch mode + pipeline
│       ├── places.js             # Google Places API integration
│       ├── crawler.js            # Playwright deep crawl
│       ├── analyzer.js           # PageSpeed analysis + pitch angles
│       ├── scorer.js             # 23-factor opportunity scoring
│       ├── ai-drafter.js         # Gemini AI message generation
│       └── config.js             # Config from .env + Supabase
│
├── supabase/
│   └── schema.sql                # Complete database schema (run this first)
│
├── LeadSniper.command            # macOS double-click launcher
├── .env.example                  # Template for environment variables
└── .gitignore
```

---

## Security & Privacy

- **No hardcoded secrets** — All API keys are configured via the Settings UI or `.env` (which is gitignored)
- **Your own Supabase** — Each user deploys their own Supabase instance. No shared database.
- **Your own Vercel** — Each user deploys their own dashboard. No shared hosting.
- **RLS enabled** — Row Level Security is on for all tables. The default "allow all" policy is suitable for a personal tool. Add authentication (Supabase Auth, NextAuth) before exposing publicly.
- **No telemetry** — LeadSniper sends no data anywhere except your own Supabase and the Google APIs you configure.

> **This is a personal tool.** Do not expose your dashboard publicly without authentication, as anyone could trigger searches and consume your API quota.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Animations | Framer Motion, CSS transitions |
| Charts | Recharts (Area, Bar, Pie, Radar) |
| Drag & Drop | @hello-pangea/dnd |
| Database | Supabase (PostgreSQL + Realtime) |
| Scraper | Playwright (Chromium), Commander.js |
| AI | Google Gemini 2.5 Flash API |
| Analysis | Google PageSpeed Insights API (free) |
| CLI | Commander, Chalk, Ora, cli-table3 |

---

## Usage Examples

### Direct CLI Search
```bash
cd scraper

# Full pipeline: search → crawl → analyze → score → AI draft
node src/index.js "Avocat" "Paris"

# Skip heavy steps for a quick scan
node src/index.js "Restaurant" "Dubai" --skip-analysis --skip-ai

# Limit results
node src/index.js "Dental Clinic" "Casablanca" --max 20
```

### Watch Mode (Dashboard-Driven)
```bash
# Start watching for dashboard requests
node src/index.js watch --interval 30

# Or on macOS, just double-click LeadSniper.command
```

### AI Regeneration (from Dashboard)
In the Lead Detail panel, expand any channel (Email/WhatsApp/LinkedIn) and:
- Write a custom prompt: *"pitch them a booking system for their dental practice"*
- Toggle tone modifiers: shorter, longer, professional, casual, urgent, friendly
- Select a service focus: Website, Web App, Mobile App, Booking System, CRM, Automation, E-Commerce

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <sub>Built for freelancers who hustle smart.</sub>
</div>
