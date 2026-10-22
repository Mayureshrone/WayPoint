import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin, Navigation, Search, Wifi, WifiOff, RotateCcw, Camera, Square,
  LocateFixed, Compass, Map as MapIcon, ShieldCheck, Mountain, Route as RouteIcon,
  QrCode, ArrowRight, DoorOpen
} from "lucide-react";
import "./App.css";

const MAP_WIDTH = 1774;
const MAP_HEIGHT = 887;

// Coordinates are based on the supplied floor-plan illustration.
// Room x/y values are label/selection anchors; nodeX/nodeY are doorway route anchors.
const locations = [
  { id: "entrance", name: "Main Entrance", type: "Entrance", x: 1175, y: 700, nodeX: 1175, nodeY: 650 },
  { id: "class-1", name: "Class 1", type: "Classroom", x: 385, y: 190, nodeX: 405, nodeY: 310, bounds: [250, 75, 260, 225] },
  { id: "class-2", name: "Class 2", type: "Classroom", x: 650, y: 190, nodeX: 660, nodeY: 310, bounds: [510, 75, 270, 225] },
  { id: "class-3", name: "Class 3", type: "Classroom", x: 400, y: 560, nodeX: 425, nodeY: 430, bounds: [250, 430, 260, 205] },
  { id: "class-4", name: "Class 4", type: "Classroom", x: 660, y: 560, nodeX: 675, nodeY: 430, bounds: [510, 430, 270, 205] },
  { id: "class-5", name: "Class 5", type: "Classroom", x: 140, y: 220, nodeX: 225, nodeY: 310, bounds: [35, 75, 210, 265] },
  { id: "class-6", name: "Class 6", type: "Classroom", x: 140, y: 520, nodeX: 225, nodeY: 430, bounds: [35, 350, 210, 285] },
  { id: "class-7", name: "Class 7", type: "Classroom", x: 1620, y: 350, nodeX: 1515, nodeY: 375, bounds: [1515, 75, 185, 560] },
  { id: "waiting-area", name: "Waiting Area", type: "Common Area", x: 925, y: 170, nodeX: 925, nodeY: 310, bounds: [790, 75, 220, 225] },
  { id: "staff-room", name: "Staff Room", type: "Staff", x: 1225, y: 190, nodeX: 1215, nodeY: 310, bounds: [1015, 75, 410, 225] },
  { id: "cabin-1", name: "Cabin 1", type: "Cabin", x: 1300, y: 570, nodeX: 1300, nodeY: 465, bounds: [1190, 465, 165, 170] },
  { id: "cabin-2", name: "Cabin 2", type: "Cabin", x: 1450, y: 570, nodeX: 1430, nodeY: 465, bounds: [1355, 465, 165, 170] },
  { id: "cabin-3", name: "Cabin 3", type: "Cabin", x: 870, y: 570, nodeX: 900, nodeY: 465, bounds: [800, 465, 165, 170] },
  { id: "counter", name: "Counter", type: "Administrative", x: 1030, y: 570, nodeX: 1030, nodeY: 465, bounds: [965, 465, 130, 170] },
  { id: "junction-west", name: "West Corridor Junction", type: "Junction", x: 225, y: 370, nodeX: 225, nodeY: 370 },
  { id: "junction-midwest", name: "West-Center Junction", type: "Junction", x: 660, y: 370, nodeX: 660, nodeY: 370 },
  { id: "junction-center", name: "Center Corridor Junction", type: "Junction", x: 900, y: 370, nodeX: 900, nodeY: 370 },
  { id: "junction-east", name: "East Corridor Junction", type: "Junction", x: 1175, y: 370, nodeX: 1175, nodeY: 370 },
  { id: "junction-right", name: "Right Corridor Junction", type: "Junction", x: 1515, y: 370, nodeX: 1515, nodeY: 370 },
  { id: "junction-class-1", name: "Class 1 Door Junction", type: "Junction", x: 405, y: 370, nodeX: 405, nodeY: 370 },
  { id: "junction-class-3", name: "Class 3 Door Junction", type: "Junction", x: 425, y: 370, nodeX: 425, nodeY: 370 },
  { id: "junction-class-4", name: "Class 4 Door Junction", type: "Junction", x: 675, y: 370, nodeX: 675, nodeY: 370 },
  { id: "junction-waiting", name: "Waiting Area Door Junction", type: "Junction", x: 925, y: 370, nodeX: 925, nodeY: 370 },
  { id: "junction-staff", name: "Staff Room Door Junction", type: "Junction", x: 1215, y: 370, nodeX: 1215, nodeY: 370 },
  { id: "junction-counter", name: "Counter Door Junction", type: "Junction", x: 1030, y: 370, nodeX: 1030, nodeY: 370 },
  { id: "junction-cabin-1", name: "Cabin 1 Door Junction", type: "Junction", x: 1300, y: 370, nodeX: 1300, nodeY: 370 },
  { id: "junction-cabin-2", name: "Cabin 2 Door Junction", type: "Junction", x: 1430, y: 370, nodeX: 1430, nodeY: 370 },
];

const destinationIds = new Set([
  "entrance", "class-1", "class-2", "class-3", "class-4", "class-5", "class-6",
  "class-7", "waiting-area", "staff-room", "cabin-1", "cabin-2", "cabin-3", "counter"
]);
const destinations = locations.filter((item) => destinationIds.has(item.id));
const byId = Object.fromEntries(locations.map((item) => [item.id, item]));
const edges = [
  ["entrance", "junction-east", 4],
  ["junction-east", "junction-center", 5],
  ["junction-center", "junction-midwest", 6],
  ["junction-midwest", "junction-west", 7],
  ["junction-east", "junction-right", 6],
  ["junction-center", "junction-waiting", 1],
  ["junction-waiting", "waiting-area", 4],
  ["junction-east", "junction-staff", 1],
  ["junction-staff", "staff-room", 4],
  ["junction-west", "class-5", 3],
  ["junction-west", "class-6", 3],
  ["junction-midwest", "junction-class-1", 4],
  ["junction-class-1", "class-1", 3],
  ["junction-midwest", "junction-class-3", 4],
  ["junction-class-3", "class-3", 3],
  ["junction-midwest", "class-2", 3],
  ["junction-midwest", "junction-class-4", 1],
  ["junction-class-4", "class-4", 3],
  ["junction-center", "cabin-3", 3],
  ["junction-center", "junction-counter", 3],
  ["junction-counter", "counter", 3],
  ["junction-east", "junction-cabin-1", 3],
  ["junction-cabin-1", "cabin-1", 3],
  ["junction-east", "junction-cabin-2", 5],
  ["junction-cabin-2", "cabin-2", 3],
  ["junction-right", "class-7", 3],
];
const graph = Object.fromEntries(locations.map((item) => [item.id, []]));
for (const [a, b, distance] of edges) {
  graph[a].push({ to: b, distance });
  graph[b].push({ to: a, distance });
}

function findRoute(start, end) {
  if (!graph[start] || !graph[end]) return null;
  const distances = Object.fromEntries(Object.keys(graph).map((id) => [id, Infinity]));
  const previous = {};
  const remaining = new Set(Object.keys(graph));
  distances[start] = 0;
  while (remaining.size) {
    let current = null;
    for (const id of remaining) {
      if (current === null || distances[id] < distances[current]) current = id;
    }
    if (current === null || distances[current] === Infinity) break;
    if (current === end) break;
    remaining.delete(current);
    for (const edge of graph[current]) {
      if (!remaining.has(edge.to)) continue;
      const next = distances[current] + edge.distance;
      if (next < distances[edge.to]) {
        distances[edge.to] = next;
        previous[edge.to] = current;
      }
    }
  }
  if (distances[end] === Infinity) return null;
  const route = [];
  let current = end;
  while (current !== undefined) {
    route.unshift(current);
    if (current === start) break;
    current = previous[current];
  }
  if (route[0] !== start) return null;
  return { route, distance: distances[end] };
}

function App() {
  const [start, setStart] = useState("entrance");
  const [destination, setDestination] = useState("class-1");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(() => {
    try {
      return localStorage.getItem("waypoint-current-checkpoint") || "";
    } catch { return ""; }
  });
  const [scanActive, setScanActive] = useState(false);
  const [scanError, setScanError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [qrCheckpoint, setQrCheckpoint] = useState("entrance");
  const videoRef = useRef(null);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (!scanActive) return undefined;
    let stream;
    let scanTimer;
    let stopped = false;
    async function startScanner() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScanError("Camera access is unavailable. Use the manual checkpoint selector.");
        setScanActive(false); return;
      }
      if (!("BarcodeDetector" in window)) {
        setScanError("QR scanning is not supported in this browser. Use the manual checkpoint selector.");
        setScanActive(false); return;
      }
      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (stopped) { stream.getTracks().forEach((track) => track.stop()); return; }
        if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
        setScanError("");
        setScanMessage("Point the camera at a WayPoint checkpoint QR code.");
        scanTimer = window.setInterval(async () => {
          const video = videoRef.current;
          if (!video || video.readyState < 2 || stopped) return;
          try {
            const raw = (await detector.detect(video))[0]?.rawValue?.trim();
            if (!raw) return;
            const match = raw.match(/^WAYPOINT:([a-zA-Z0-9_-]+)$/);
            const location = match && byId[match[1]];
            if (location) {
              setCurrentCheckpoint(location.id);
              setStart(location.id);
              setResult(null);
              setScanMessage(`Checkpoint found: ${location.name}. Your known position is updated.`);
              setScanActive(false);
            } else if (raw.startsWith("WAYPOINT:")) {
              setScanError("This QR code contains an unknown checkpoint ID.");
            }
          } catch { /* Ignore intermittent camera-frame decode failures. */ }
        }, 350);
      } catch (error) {
        setScanError(error?.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access or use manual selection."
          : "Could not start the camera. Use manual checkpoint selection.");
        setScanActive(false);
      }
    }
    startScanner();
    return () => {
      stopped = true;
      if (scanTimer) window.clearInterval(scanTimer);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [scanActive]);

  useEffect(() => {
    try {
      if (currentCheckpoint) localStorage.setItem("waypoint-current-checkpoint", currentCheckpoint);
      else localStorage.removeItem("waypoint-current-checkpoint");
    } catch { /* Storage is optional. */ }
  }, [currentCheckpoint]);

  const filteredLocations = useMemo(() => destinations.filter((location) =>
    location.name.toLowerCase().includes(search.toLowerCase())
  ), [search]);
  const routeIds = result?.route ?? [];
  const routeNodes = routeIds.map((id) => byId[id]).filter(Boolean);
  const routePoints = routeNodes.map((node) => `${node.nodeX},${node.nodeY}`).join(" ");
  const routeStart = currentCheckpoint || start;

  function calculateRoute() {
    const computed = findRoute(routeStart, destination);
    setResult(computed);
    if (!computed) setScanMessage("No connected corridor route was found for this selection.");
  }
  function resetRoute() { setResult(null); setSearch(""); }
  function selectDestination(id) { setDestination(id); setSearch(""); setResult(null); }

  const routeInstructions = routeNodes.map((item) => item.name);
  const qrPayload = `WAYPOINT:${qrCheckpoint}`;
  const qrImageUrl = `/qr/${qrCheckpoint}.png`;

  return (
    <main className="app waypoint-app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon"><Navigation size={23} /></span>
          <span><strong>WayPoint</strong><small>Offline indoor navigation</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a><a href="#explore">Explore Map</a><a href="#how-it-works">How It Works</a><a href="#future-scope">Future Scope</a>
        </nav>
        <div className="top-actions">
          <div className={`connection ${online ? "connected" : "disconnected"}`}>
            {online ? <Wifi size={15} /> : <WifiOff size={15} />}{online ? "Online" : "Offline"}
          </div>
          <button className="top-cta" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}>Start Navigating <ArrowRight size={14} /></button>
        </div>
      </header>

      <section className="intro" id="home">
        <div className="intro-copy">
          <span className="eyebrow">OFFLINE-FIRST NAVIGATION</span>
          <h1>Find your way.<br /><span>Even offline.</span></h1>
          <p>WayPoint helps people navigate an indoor layout using a locally stored floor plan, corridor-based routes, and QR checkpoints. This prototype demonstrates room-to-room navigation without depending on an online map service.</p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" })}><Compass size={17} /> Explore Indoor Map</button>
            <button className="secondary-button" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How It Works <ArrowRight size={15} /></button>
          </div>
          <div className="hero-footnote"><span><ShieldCheck size={15}/> QR checkpoint concept</span><span><MapIcon size={15}/> Local route calculation</span></div>
        </div>
        <div className="hero-visual" aria-label="Preview of the WayPoint floor plan">
          <div className="visual-top"><div><strong>Indoor route preview</strong><small>WayPoint floor plan</small></div><span className="map-tag">OFFLINE MAP</span></div>
          <div className="mini-map image-mini-map"><img src="/maps/waypoint-floor-plan.png" alt="WayPoint indoor floor plan preview" /></div>
          <div className="visual-status"><span><i className="status-dot"/> Local map asset</span><strong>QR checkpoint based</strong></div>
        </div>
      </section>

      <section className="workspace" id="explore">
        <aside className="sidebar">
          <h2>Find a place</h2>
          <p className="muted">Choose a room or facility to calculate a corridor route.</p>
          <section className="indoor-card" aria-labelledby="indoor-heading">
            <div className="indoor-card-title">
              <span className="indoor-icon"><LocateFixed size={19} /></span>
              <div><h3 id="indoor-heading">Indoor position</h3><p className="muted">QR checkpoints identify your last confirmed position.</p></div>
            </div>
            <div className="checkpoint-status"><strong>Current checkpoint:</strong> {byId[currentCheckpoint]?.name || "Not set"}</div>
            {scanActive && <video ref={videoRef} className="qr-video" muted playsInline aria-label="QR scanner camera" />}
            {scanMessage && <p className="scan-message" role="status">{scanMessage}</p>}
            {scanError && <p className="scan-error" role="alert">{scanError}</p>}
            <div className="indoor-actions">
              <button className="primary-button" onClick={() => { setScanError(""); setScanMessage(""); setScanActive((active) => !active); }}>
                {scanActive ? <Square size={17} /> : <Camera size={17} />}{scanActive ? "Stop QR Scanner" : "Scan Checkpoint QR"}
              </button>
              <label className="field-label" htmlFor="checkpoint">Or set position manually</label>
              <select id="checkpoint" value={currentCheckpoint} onChange={(event) => {
                const id = event.target.value;
                setCurrentCheckpoint(id);
                if (id) setStart(id);
                setResult(null);
              }}>
                <option value="">Choose current checkpoint…</option>
                {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
              {currentCheckpoint && <button className="secondary-button" onClick={() => { setCurrentCheckpoint(""); setStart("entrance"); setResult(null); }}><RotateCcw size={15} /> Clear current position</button>}
              <div className="qr-generator">
                <label className="field-label" htmlFor="qr-checkpoint">Print a checkpoint QR</label>
                <select id="qr-checkpoint" value={qrCheckpoint} onChange={(event) => setQrCheckpoint(event.target.value)}>
                  {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
                <div className="qr-preview">
                  <img src={qrImageUrl} alt={`WayPoint QR code for ${byId[qrCheckpoint]?.name || qrCheckpoint}`} />
                  <div><strong>{byId[qrCheckpoint]?.name}</strong><small>Checkpoint payload</small><code>{qrPayload}</code><a className="qr-download" href={qrImageUrl} download={`waypoint-${qrCheckpoint}-qr.png`}>Download QR PNG</a></div>
                </div>
              </div>
            </div>
            <small className="indoor-help">Print each QR at its matching physical checkpoint. Scanning updates the known position; it is not continuous tracking. Camera scanning requires permission and browser support.</small>
          </section>

          <label className="field-label" htmlFor="search">Search destinations</label>
          <div className="searchbox"><Search size={18} /><input id="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Class 3, Staff Room" /></div>
          <div className="location-list">
            {filteredLocations.map((location) => (
              <button key={location.id} className={`location-item ${destination === location.id ? "selected" : ""}`} onClick={() => selectDestination(location.id)}>
                <MapPin size={15} /><span><strong>{location.name}</strong><small>{location.type}</small></span>
              </button>
            ))}
            {!filteredLocations.length && <p className="muted">No matching destinations.</p>}
          </div>

        </aside>

        <section className="map-panel">
          <div className="map-heading"><div><h2>WayPoint indoor map</h2><p>Tap a room to select it, then calculate a route.</p></div><span className="map-tag">LOCAL FLOOR PLAN</span></div>
          <div className="map-canvas waypoint-map-canvas">
            <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label="Interactive WayPoint indoor floor plan">
              <image href="/maps/waypoint-floor-plan.png" x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} preserveAspectRatio="none" />
              <defs>
                <marker id="route-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#00a6a6" /></marker>
              </defs>
              {result?.route && result.route.length > 1 && <polyline points={routePoints} className="waypoint-route-line" markerMid="url(#route-arrow)" markerEnd="url(#route-arrow)" />}
              {locations.filter((item) => item.bounds).map((location) => (
                <rect key={location.id} x={location.bounds[0]} y={location.bounds[1]} width={location.bounds[2]} height={location.bounds[3]}
                  className={`room-hit-area ${destination === location.id ? "room-hit-selected" : ""}`} role="button" tabIndex="0"
                  aria-label={`Select ${location.name}`} onClick={() => selectDestination(location.id)}
                  onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectDestination(location.id); } }} />
              ))}
              {result?.route && result.route.map((id, index) => {
                const point = byId[id];
                if (!point) return null;
                const isStart = index === 0;
                const isEnd = index === result.route.length - 1;
                return <g key={`${id}-${index}`} className="route-stop">
                  <circle cx={point.nodeX} cy={point.nodeY} r={isStart || isEnd ? 20 : 12} fill={isStart ? "#16a34a" : isEnd ? "#2563eb" : "#00a6a6"} stroke="#fff" strokeWidth="5" />
                  {(isStart || isEnd) && <text x={point.nodeX} y={point.nodeY - 28} className="route-stop-label" textAnchor="middle">{isStart ? "START" : "DESTINATION"}</text>}
                </g>;
              })}
              {currentCheckpoint && byId[currentCheckpoint] && <g>
                <circle cx={byId[currentCheckpoint].nodeX} cy={byId[currentCheckpoint].nodeY} r="31" className="waypoint-current-pulse" />
                <circle cx={byId[currentCheckpoint].nodeX} cy={byId[currentCheckpoint].nodeY} r="13" fill="#0f9f79" stroke="white" strokeWidth="4" />
                <text x={byId[currentCheckpoint].nodeX} y={byId[currentCheckpoint].nodeY + 48} className="route-stop-label" textAnchor="middle">YOU ARE HERE</text>
              </g>}
            </svg>
          </div>
          <div className="map-legend">
            <span><i className="legend-dot start-dot" /> Start / current checkpoint</span>
            <span><i className="legend-dot destination-dot" /> Destination</span>
            <span><i className="legend-line waypoint-legend-line" /> Calculated route</span>
            <span><DoorOpen size={13} /> Room access is approximate</span>
          </div>
          <p className="map-note">The supplied illustration contains decorative route arrows. WayPoint calculates its own route from the configured corridor graph. This prototype uses estimated connections; verify the real layout and accessibility before relying on it for wayfinding.</p>
          <section className="route-planner" aria-labelledby="route-planner-heading">
            <div className="route-planner-heading">
              <div>
                <h3 id="route-planner-heading">Plan your route</h3>
                <p>Choose your starting point and destination, then calculate the route on the map.</p>
              </div>
              <RouteIcon size={20} aria-hidden="true" />
            </div>
            <div className="route-form map-route-form">
              <div className="route-field">
                <label className="field-label" htmlFor="start">Starting checkpoint</label>
                <select id="start" value={currentCheckpoint || start} onChange={(event) => { setStart(event.target.value); setCurrentCheckpoint(""); setResult(null); }}>
                  {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </div>
              <div className="route-field">
                <label className="field-label" htmlFor="destination">Destination</label>
                <select id="destination" value={destination} onChange={(event) => selectDestination(event.target.value)}>
                  {destinations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                </select>
              </div>
              <button className="primary-button" onClick={calculateRoute}><RouteIcon size={16} /> Calculate Route</button>
              <button className="secondary-button" onClick={resetRoute}><RotateCcw size={15} /> Reset Route</button>
            </div>
            {result && <div className="result-card">
              {result.route ? <>
                <span className="result-label">ROUTE FOUND</span>
                <h3>{result.distance} <span style={{ fontSize: 11, fontWeight: 600, color: "#6b8298" }}>estimated route units</span></h3>
                <p>Follow the highlighted corridor path. Distances are illustrative because the floor plan has no verified measurements.</p>
                <ol>{routeInstructions.map((name, index) => <li key={`${name}-${index}`}>{name}</li>)}</ol>
                <small>Confirm door access and corridor connections on site before real-world use.</small>
              </> : <p>No route found. Check the corridor connections in the route graph.</p>}
            </div>}
          </section>
        </section>
      </section>

      <section className="section-wrap" id="how-it-works">
        <div className="section-heading"><span className="section-kicker">HOW IT WORKS</span><h2>From a checkpoint to your destination</h2><p>WayPoint uses local route data and QR checkpoints to guide people through a known indoor layout.</p></div>
        <div className="steps-grid">
          <article className="step"><span className="step-number">STEP 01</span><h3>Scan a location QR</h3><p>A QR code identifies the last confirmed checkpoint. Manual selection is available if camera scanning is unsupported.</p></article>
          <article className="step"><span className="step-number">STEP 02</span><h3>Choose where to go</h3><p>Select a classroom or facility. WayPoint calculates a path through the configured corridor graph.</p></article>
          <article className="step"><span className="step-number">STEP 03</span><h3>Follow the route</h3><p>Follow the highlighted route and scan another QR checkpoint to refresh your known position.</p></article>
        </div>
      </section>
      <section className="section-wrap" style={{ background: "#f0f6fa" }}>
        <div className="section-heading"><span className="section-kicker">PROTOTYPE FEATURES</span><h2>Designed for limited-connectivity places</h2><p>The floor plan, location data, and route calculation are stored locally after the app is cached.</p></div>
        <div className="feature-grid">
          <article className="feature-card"><span className="feature-icon"><MapIcon size={21} /></span><h3>Interactive indoor map</h3><p>Explore the new floor plan, choose rooms, and view the calculated route overlay.</p></article>
          <article className="feature-card"><span className="feature-icon"><QrCode size={21} /></span><h3>QR checkpoints</h3><p>Scan a WayPoint checkpoint QR or set the last confirmed location manually.</p></article>
          <article className="feature-card"><span className="feature-icon"><RouteIcon size={21} /></span><h3>Local route calculation</h3><p>The shortest-path algorithm runs locally and does not call an online routing API.</p></article>
        </div>
      </section>
      <section className="section-wrap future-section" id="future-scope">
        <div className="future-inner">
          <div><span className="section-kicker">FUTURE SCOPE</span><h2>Navigation for places beyond reliable connectivity.</h2><p>WayPoint's longer-term goal is to explore offline guidance for campuses, trekking areas, forests, and other locations where internet access is unreliable.</p><p className="scope-note">QR scans confirm a known checkpoint; they do not continuously track movement. Wider-area maps and automatic positioning require separate route data and field validation.</p></div>
          <div className="future-list"><div className="future-item"><Mountain size={20} /><div><strong>Trekking routes and forests</strong><span>Preloaded routes and checkpoints for trail guidance.</span></div></div><div className="future-item"><MapIcon size={20} /><div><strong>Remote and rural areas</strong><span>Locally stored maps that do not rely on live map tiles.</span></div></div><div className="future-item"><LocateFixed size={20} /><div><strong>Advanced positioning</strong><span>Explore beacons or sensors where continuous location updates are required.</span></div></div></div>
        </div>
      </section>
      <footer className="footer"><span><strong>WayPoint</strong> · Find your way, even offline.</span><span>Tech Mela prototype · Confirm map geometry on site</span></footer>
    </main>
  );
}

export default App;
