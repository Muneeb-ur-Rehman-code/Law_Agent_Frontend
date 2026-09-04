# Marjiya Law — Attorney Dashboard Frontend

Next.js 14 frontend dashboard for Marjiya Law PC's AI Multi-Agent Operating System.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Real-Time**: WebSockets

---

## Quick Start

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Environment Configuration

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Contains:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

App will start at `http://localhost:3000`.

---

## Pages & Routing

- `/login` — Login portal for attorneys, paralegals, and staff
- `/dashboard` — Main dashboard with live KPIs, priority approvals, and agent feed
- `/approvals` — Attorney approval queue (Approve/Reject actions)
- `/cases` — Active cases directory with search and status filters
- `/cases/[id]` — Detailed case overview (clients, notes, docs, tasks)
- `/agents` — 12 AI agents monitor & status registry
- `/audit-log` — Full audit trail of agent operations

---

## Design Tokens

- **Navy**: `#0A2342` (Primary headers, sidebar, key buttons)
- **Gold**: `#C9A84C` (Accent, badges, active states)
- **Light Gray**: `#F4F6F9` (Page background)
