# Mirror Shop

A shop selling different types of mirrors. Full-stack TypeScript: Express API with Prisma (SQLite), plus React + Vite frontend.

## Setup

### Prerequisites

- Node.js 18+
- npm

### 1. Install dependencies

```bash
cd api && npm install && cd ..
cd web && npm install && cd ..
```

If `web` install is blocked by a security tool (e.g. SCFW) due to esbuild advisories, try running it in a different environment or adjust your security policy.

### 2. Database (API)

```bash
cd api
# Ensure .env exists with: DATABASE_URL="file:./dev.db" (see .env.example)
npx prisma generate
npx prisma migrate dev --name init
npm run seed
cd ..
```

### 3. Run the app

**Terminal 1 – API:**
```bash
npm run dev:api
```
API runs at http://localhost:3001

**Terminal 2 – Web:**
```bash
npm run dev:web
```
Web runs at http://localhost:5173 (proxies `/api` to the backend)

### 4. Open

Visit http://localhost:5173 to see the mirror catalog.

## Project structure

- `api/` – Express backend, Prisma ORM, product repository pattern
- `web/` – React + Vite frontend

## API endpoints

- `GET /api/health` – health check
- `GET /api/products` – list all mirrors
- `GET /api/products/:id` – get a single mirror

## Environment

**API (`api/.env`):**
- `DATABASE_URL` – Prisma connection (default: `file:./dev.db` for SQLite)

**Web:**
- `VITE_API_URL` – API base URL (optional; defaults to `/api` when using Vite proxy)
