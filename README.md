# PulseBoard — Next.js

A standalone full-stack Next.js/React recreation of the PulseBoard dashboard, written in JavaScript.

## Structure

- `frontend/` contains the React dashboard, UI behavior, and browser local-storage state.
- `backend/` contains server-only services such as host telemetry.
- `app/api/` exposes backend services as Next.js API routes.
- `app/` is the Next.js App Router entry layer.

## Run locally

Install Node.js 20.9 or newer, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Tasks, the selected user, current tab, and metric counter are persisted in local storage and synchronized across browser tabs. No database is required. Live machine telemetry is provided by the backend through the Next.js route at `/api/metrics`.
