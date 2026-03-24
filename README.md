<div align="center">
  <img src="dashboard/public/favicon.ico" alt="LeadSniper Logo" width="100" />
  <h1>LeadSniper</h1>
  <p><strong>Smart Automated Lead Generation & Outreach Engine</strong></p>
  
  <p>
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#deployment">Deployment</a>
  </p>
</div>

---

## 🎯 What is LeadSniper?

LeadSniper is a powerful B2B prospecting tool designed for freelancers and digital agencies. It automates the process of finding businesses via Google Places, deep-crawling their websites for contact information, analyzing their digital presence (speed, SEO, mobile-friendliness), and generating hyper-personalized outreach messages using AI.

You run the heavy-lifting scraper **locally** on your machine, while the sleek Next.js dashboard lives in the cloud (e.g., Vercel) so you can manage your pipeline from anywhere.

## ✨ Features

- 🔍 **Google Places Integration**: Find thousands of local businesses across any niche and city.
- 🕷️ **Playwright Deep Crawl**: Automatically visits websites to extract emails, social links, and tech stacks (React, WP, etc.).
- ⚡ **Opportunity Scoring (20+ Factors)**: Analyzes PageSpeed, Core Web Vitals, SEO, and reviews to give each lead an "Opportunity Score" from 0-100.
- 🤖 **Gemini 2.5 AI Drafter**: Automatically drafts personalized Emails, WhatsApp messages, and LinkedIn connection requests tailored to the business's specific weaknesses.
- 📊 **Next.js App Router Dashboard**: A blazing-fast, responsive UI tailored for managing your pipeline with real-time Supabase subscriptions.
- 🚀 **Watch Mode**: The scraper idles locally and automatically kicks off when you request a new search from your cloud dashboard.

## 🏗️ Architecture

LeadSniper is split into two connected parts:

1. **Dashboard (`/dashboard`)**: A Next.js 14 web application meant to be deployed to Vercel or your hosting provider of choice. 
2. **Scraper (`/scraper`)**: A Node.js CLI tool powered by Playwright. This **must be run locally** to avoid expensive serverless execution limits and IP blocking.

---

## 🚀 Quick Start

### 1. Database Setup (Supabase)
Create a new free project on [Supabase](https://supabase.com/). You need your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Create the `.env` file in the root of the project:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
```

Make sure the dashboard also has a `.env.local` file inside the `dashboard/` directory with the identical variables.

### 2. Dashboard Deployment
The dashboard is designed to be hosted on Vercel.

1. Fork or push this repository to your own GitHub account.
2. Go to Vercel and import the repository.
3. Set the **Root Directory** to `dashboard`.
4. Add your Supabase Environment Variables.
5. Deploy!

### 3. Running the Scraper Locally
To keep costs at zero, the heavy-duty scraper runs exclusively on your local machine using the `LeadSniper.command` file (Mac/Linux).

1. Ensure you have Node.js v18+ installed.
2. In your terminal, run `npm install` inside the `scraper/` directory.
3. Double-click `LeadSniper.command` on Mac to launch the scraper in Watch Mode (or run `node src/index.js watch` inside the scraper folder).
4. The scraper will idle and wait for instructions from your dashboard!

### 4. API Keys Setup
Once your dashboard is deployed, go to the **Settings** page in the UI to securely add your API keys:
- **Google Places API Key**: Get this from Google Cloud Console (Enable Places API New).
- **Gemini API Key**: Get a free tier key from Google AI Studio.

*(Note: API keys are securely saved in your personal Supabase database, not in the codebase)*

---

## 🔒 Security & Usage Warning

LeadSniper is designed to be a **personal internal tool**. 
- Do **not** expose your dashboard to the public without adding authentication (e.g., Supabase Auth or NextAuth), as anyone could trigger searches and incur API usage.
- Never commit your `.env` files to GitHub.
- Deploy your own instance to keep your pipeline private.

---

## 🛠️ Built With

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), TailwindCSS, Framer Motion, Recharts
- **Backend/DB**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Scraper**: [Playwright](https://playwright.dev/), Commander, Chalk
- **AI**: Google Gemini API
- **Analytics**: Google PageSpeed Insights API

<div align="center">
  <sub>Built for massive action. Happy hunting. 🎯</sub>
</div>
