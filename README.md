# PulseBoard — Next.js

A standalone Next.js/React recreation of the PulseBoard dashboard.

## Run locally

Install Node.js 20.9 or newer, then run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Tasks, the selected user, current tab, and metric counter are persisted in local storage and synchronized across browser tabs. Live machine telemetry is provided by the Next.js route at `/api/metrics`.
