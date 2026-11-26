# ApexReplay F1 — Web Dashboard

A responsive React + TypeScript website for Formula 1 season analytics and race/circuit exploration.

## Features

- Season selector for 2023–2026
- Driver championship standings and points comparison
- Constructor championship standings
- Race calendar and searchable race/circuit explorer
- Race detail panel with circuit and location information
- Jolpica-compatible Ergast API integration
- Clearly labelled sample data fallback when the API is unavailable
- Responsive dark motorsport-inspired interface

## Run locally

Requirements: Node.js 18 or newer.

```bash
cd web
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Data source and accuracy

The app requests public season data from the Jolpica F1 API at `https://api.jolpi.ca/ergast/f1`. If the service is unavailable or a season has no published standings yet, the UI falls back to sample data and displays a DEMO DATA indicator. Sample standings are illustrative and must not be treated as official results.

The circuit route graphic in the detail panel is explicitly schematic, not a geographically accurate circuit map.

## Next integration step

Connect the existing Python/FastF1 modules through a dedicated API service to expose session-specific lap timing, telemetry, tyre stints, pit stops and circuit coordinates. Those detailed analytics are not represented as live data by this first web release.
