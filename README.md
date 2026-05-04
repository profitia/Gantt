# Gantt Dashboard

Full-stack project planning dashboard with Gantt chart visualization.

## Stack
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express 5 + TypeScript
- **Database**: Prisma 7 + SQLite (local) / PostgreSQL (production)

## Local Development

### Prerequisites
- Node.js 18+

### 1. Start the server

```bash
cd server
cp .env.example .env        # already set for SQLite
npm run db:dev              # run migrations
npm run dev                 # starts on http://localhost:3000
```

### 2. Start the client (new terminal)

```bash
cd client
npm run dev                 # starts on http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy on Render

### Backend (Web Service)
| Setting | Value |
|---|---|
| Root Directory | `server` |
| Build Command | `npm install && npx prisma generate && npm run build` |
| Start Command | `npm run start` |
| Environment Variables | see below |

### Frontend (Static Site)
| Setting | Value |
|---|---|
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| Environment Variables | `VITE_API_URL=https://gantt-gj69.onrender.com` |

---

## Environment Variables

### Server
| Variable | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | SQLite local. Use PostgreSQL URL on Render |
| `FRONTEND_URL` | `https://your-app.onrender.com` | CORS allowed origin |
| `PORT` | `3000` | Optional, Render sets this automatically |

### Client
| Variable | Example | Notes |
|---|---|---|
| `VITE_API_URL` | `https://gantt-gj69.onrender.com` | Backend URL for production |

---

## Switching to PostgreSQL (production)

1. In `server/prisma/schema.prisma`, change:
   ```
   provider = "sqlite"
   ```
   to:
   ```
   provider = "postgresql"
   ```

2. Set `DATABASE_URL` to your PostgreSQL connection string on Render:
   ```
   postgresql://user:password@host:5432/gantt_db?schema=public
   ```

3. Run `npm run db:migrate` (Render build command already includes this).

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List all tasks |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/health` | Health check |

---

## Project Structure

```
/Gantt badania
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── api/tasks.ts    # Axios API calls
│   │   ├── components/
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── GanttChart.tsx
│   │   │   ├── BudgetSummary.tsx
│   │   │   └── StatusBadge.tsx
│   │   └── types/task.ts
│   └── .env.example
└── server/                 # Express backend
    ├── src/
    │   ├── index.ts        # Entry point
    │   ├── prisma.ts       # Prisma client singleton
    │   └── tasks/
    │       ├── tasks.service.ts
    │       ├── tasks.controller.ts
    │       └── tasks.router.ts
    ├── prisma/
    │   └── schema.prisma   # Database schema
    └── .env.example
```
