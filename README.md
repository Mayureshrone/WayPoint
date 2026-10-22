# WayPoint — Offline Indoor Navigation

WayPoint is a React + Vite indoor-navigation prototype using a locally stored floor-plan image, a local corridor graph, Dijkstra route calculation, and QR checkpoint IDs.

## Run locally
```bash
npm install
npm run dev
```

## Build and lint
```bash
npm run build
npm run lint
```

## Map and routing
- Floor plan: `public/maps/waypoint-floor-plan.png`
- Route/location configuration: `src/App.jsx`
- QR PNGs: `public/qr/`
- Service worker: `public/sw.js`

The supplied floor plan is an illustration, not a surveyed drawing. Route weights are prototype estimates, and room-door connections must be checked against the actual building before real-world use.

## QR checkpoints
QR payloads use `WAYPOINT:<location-id>`. Scan a printed code to update the last known checkpoint. This is checkpoint-based positioning, not continuous tracking.

## Offline note
The service worker caches the app shell and map after the application is served from a supported origin. While online, page loads fetch the latest deployed app; offline, the last cached app shell is used. A newly installed service-worker version refreshes the page automatically. Camera access typically requires HTTPS or localhost. Verify offline behavior after the first successful load.
