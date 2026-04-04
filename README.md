# ThreadCraft AI

AI-powered Twitter/X thread generator built with Next.js 14, Tailwind CSS, and the Claude API. Generate engaging, viral-worthy threads from any topic in seconds.

## Features

- **AI Thread Generation** — Claude API generates structured threads with hooks, value tweets, and CTAs
- **Multi-Tone Support** — Professional, casual, viral, or educational writing styles
- **Editable Tweets** — Edit generated tweets with live character counter and progress ring (280 char limit)
- **Copy & Save** — Copy individual tweets or the full thread; save to history
- **Thread History** — Browse, view, and delete past threads with pagination
- **Free Tier Tracking** — 3 threads/day limit shown in sidebar
- **Google OAuth** — Secure authentication via NextAuth.js
- **Dark Theme** — Full dark UI with indigo/violet accents
- **Framer Motion** — Smooth animations on tweet card appearance

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Database:** Prisma + SQLite
- **Auth:** NextAuth.js with Google OAuth
- **AI:** Anthropic Claude API
- **Animations:** Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Google Cloud Console project with OAuth credentials
- Anthropic API key

### Setup

1. **Clone and install:**

   ```bash
   git clone <repo-url>
   cd threadcraft-ai
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Fill in your values in `.env`:

   - `NEXTAUTH_SECRET` — Generate with `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Cloud Console
   - `ANTHROPIC_API_KEY` — From Anthropic Console

3. **Set up the database:**

   ```bash
   npx prisma migrate dev
   ```

4. **Run the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx                    # Landing page
    dashboard/                  # Dashboard with stats
    generate/                   # Thread generation form + results
    history/                    # Thread history with modals
    api/
      auth/[...nextauth]/       # NextAuth.js handler
      generate/                 # POST - Claude AI thread generation
      threads/                  # GET (paginated), POST (save)
      threads/[id]/             # DELETE thread
      usage/                    # GET - free tier usage tracking
  components/
    sidebar.tsx                 # Navigation sidebar with usage indicator
    session-provider.tsx        # NextAuth session wrapper
    ui/                         # shadcn/ui components
  lib/
    auth.ts                     # NextAuth config
    prisma.ts                   # Prisma client singleton
    utils.ts                    # cn() utility
  types/
    next-auth.d.ts              # Session type augmentation
prisma/
  schema.prisma                 # User, Account, Session, Thread models
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | GET/POST | NextAuth.js authentication |
| `/api/generate` | POST | Generate thread via Claude API |
| `/api/threads` | GET | List threads (paginated) |
| `/api/threads` | POST | Save thread to database |
| `/api/threads/[id]` | DELETE | Delete a thread |
| `/api/usage` | GET | Get daily usage stats |

## License

MIT
