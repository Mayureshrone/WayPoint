# WayPoint QR Checkpoint Guide

## Payload format
Each QR code contains a checkpoint ID in the form `WAYPOINT:<location-id>`, for example `WAYPOINT:entrance`.

## Available QR PNGs
- Main Entrance: `WAYPOINT:entrance`
- Class 1–7: `WAYPOINT:class-1` through `WAYPOINT:class-7`
- Waiting Area: `WAYPOINT:waiting-area`
- Staff Room: `WAYPOINT:staff-room`
- Cabin 1–3: `WAYPOINT:cabin-1` through `WAYPOINT:cabin-3`
- Counter: `WAYPOINT:counter`
- Corridor junctions: `WAYPOINT:junction-west`, `WAYPOINT:junction-midwest`, `WAYPOINT:junction-center`, `WAYPOINT:junction-east`, `WAYPOINT:junction-right`, `WAYPOINT:junction-class-1`, `WAYPOINT:junction-class-3`, `WAYPOINT:junction-class-4`, `WAYPOINT:junction-waiting`, `WAYPOINT:junction-staff`, `WAYPOINT:junction-counter`, `WAYPOINT:junction-cabin-1`, `WAYPOINT:junction-cabin-2`

PNG files are generated and stored in `public/qr/`. Print each code and place it at the matching real checkpoint. Never place a code at a different location than its ID represents.

Scanning a code updates the last confirmed position; it does not continuously track movement. Camera access requires browser permission and typically HTTPS or localhost.
