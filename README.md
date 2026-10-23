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
The service worker caches the app shell and map after the application is served from a supported origin. Camera access typically requires HTTPS or localhost. Verify offline behavior after the first successful load.


## QR Checkpoints

The QR Checkpoints section lists every configured room and corridor checkpoint. QR payloads use the `WAYPOINT:<checkpoint-id>` format and are validated against the shared location list in `src/App.jsx`. Use the search and category filters to find a checkpoint, download an individual PNG, or download all cached QR PNGs in a ZIP archive.

QR scans update the last confirmed checkpoint and recalculate the route to the selected destination. This is checkpoint-based positioning, not continuous indoor tracking. Browser camera scanning requires camera permission and a supported browser API; manual checkpoint selection is available as a fallback.
