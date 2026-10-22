# WayPoint indoor checkpoint tracking

## What this prototype implements
- QR checkpoint scanning with the browser's `BarcodeDetector` API where available.
- Manual checkpoint selection as a fallback.
- Last known checkpoint persistence in `localStorage`.
- Local route calculation through a configured corridor graph.
- Local floor-plan asset caching through a service worker.

## Accuracy limits
This is checkpoint-based positioning, not continuous indoor tracking. The known position is the last QR marker scanned or manually selected. The supplied image is illustrative, and route connections/distances must be verified on site.

## QR payload
Use `WAYPOINT:<location-id>`. See `QR_CHECKPOINT_GUIDE.md` and the generated PNG files in `public/qr/`.

## Offline testing
1. Run `npm install` and `npm run dev`.
2. Open the local Vite URL and let the application load.
3. After the service worker is active and assets are cached, disconnect the network and reload.
4. Confirm local route calculation and map rendering.
5. QR camera scanning depends on browser support, permission, and a secure context.
