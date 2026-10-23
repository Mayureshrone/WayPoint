import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin, Navigation, Search, Wifi, WifiOff, RotateCcw, Camera, Square,
  LocateFixed, Compass, Map as MapIcon, ShieldCheck, Mountain, Route as RouteIcon,
  QrCode, ArrowRight, DoorOpen, Download, Filter, X, CheckCircle2, Menu, FileArchive, Printer, SearchCheck
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


function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Dependency-free ZIP writer for the locally cached checkpoint PNGs.
function createZip(files) {
  const encoder = new TextEncoder();
  const localParts = [], centralParts = [];
  let offset = 0;
  const u16 = (view, at, value) => view.setUint16(at, value, true);
  const u32 = (view, at, value) => view.setUint32(at, value >>> 0, true);
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
    u32(lv,0,0x04034b50); u16(lv,4,20); u16(lv,6,0); u16(lv,8,0); u16(lv,10,0); u16(lv,12,33);
    u32(lv,14,crc); u32(lv,18,data.length); u32(lv,22,data.length); u16(lv,26,name.length); u16(lv,28,0); local.set(name,30);
    localParts.push(local,data);
    const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
    u32(cv,0,0x02014b50); u16(cv,4,20); u16(cv,6,20); u16(cv,8,0); u16(cv,10,0); u16(cv,12,0); u16(cv,14,33);
    u32(cv,16,crc); u32(cv,20,data.length); u32(cv,24,data.length); u16(cv,28,name.length); u16(cv,30,0); u16(cv,32,0);
    u16(cv,34,0); u16(cv,36,0); u32(cv,38,0); u32(cv,42,offset); central.set(name,46); centralParts.push(central);
    offset += local.length + data.length;
  }
  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22), ev = new DataView(end.buffer);
  u32(ev,0,0x06054b50); u16(ev,4,0); u16(ev,6,0); u16(ev,8,files.length); u16(ev,10,files.length); u32(ev,12,centralSize); u32(ev,16,offset); u16(ev,20,0);
  return new Blob([...localParts,...centralParts,end], {type:'application/zip'});
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  const [qrSearch, setQrSearch] = useState("");
  const [qrCategory, setQrCategory] = useState("All");
  const [qrPreview, setQrPreview] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
              setResult(findRoute(location.id, destination));
              setScanMessage(`Checkpoint found: ${location.name}. Your known position and route have been updated.`);
              setScanActive(false);
            } else {
              setScanError(raw.startsWith("WAYPOINT:")
                ? "This QR code contains an unknown checkpoint ID."
                : "This is not a valid WayPoint checkpoint QR code.");
              setScanMessage("");
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
  const qrCategories = ["All", ...new Set(locations.map((item) => item.type))];
  const filteredQrLocations = locations.filter((location) => {
    const matchesSearch = `${location.name} ${location.id}`.toLowerCase().includes(qrSearch.toLowerCase().trim());
    return matchesSearch && (qrCategory === "All" || location.type === qrCategory);
  });

  async function downloadAllQrs() {
    setQrBusy(true);
    try {
      const files = await Promise.all(locations.map(async (location) => {
        const response = await fetch(`/qr/${location.id}.png`);
        if (!response.ok) throw new Error(`Missing QR image for ${location.name}`);
        return { name: `${location.id}.png`, data: new Uint8Array(await response.arrayBuffer()) };
      }));
      files.push({ name: "README.txt", data: new TextEncoder().encode("WayPoint QR Checkpoints\n\nEach code contains a WAYPOINT:<checkpoint-id> payload. Print and place each code at its matching physical checkpoint. QR scans update the last confirmed position; they are not continuous tracking.\n") });
      downloadBlob(createZip(files), "waypoint-qr-checkpoints.zip");
      setScanMessage(`Prepared ${locations.length} checkpoint QR codes for download.`);
    } catch (error) {
      setScanError(`Could not prepare QR archive: ${error.message}`);
    } finally { setQrBusy(false); }
  }
  function downloadSingleQr(location) {
    if (!location) return;
    const anchor = document.createElement("a"); anchor.href = `/qr/${location.id}.png`;
    anchor.download = `waypoint-${location.id}-qr.png`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  }

  return (
    <main className="app waypoint-app">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon"><Navigation size={23} /></span>
          <span><strong>WayPoint</strong><small>Offline indoor navigation</small></span>
        </a>
        <button className="mobile-menu-toggle" aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <nav className={`nav-links ${mobileMenuOpen ? "nav-links-open" : ""}`} aria-label="Main navigation">
          <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a><a href="#explore" onClick={() => setMobileMenuOpen(false)}>Indoor Map</a><a href="#qr-checkpoints" onClick={() => setMobileMenuOpen(false)}>QR Checkpoints</a><a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a><a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
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
        <div className="workspace-main">
          <section className="map-panel">
            <div className="map-heading"><div><h2>WayPoint indoor map</h2><p>Tap a room to select it, then calculate a route.</p></div><span className="map-tag">INTERACTIVE</span></div>
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
            <p className="map-note">Tap any room on the map to select it as your destination. Use the controls below to calculate routes between checkpoints.</p>
          </section>

          <section className="controls-panel">
            <div className="route-controls">
              <h3><RouteIcon size={18} /> Route Controls</h3>
              <div className="control-row">
                <div className="control-group">
                  <label className="field-label" htmlFor="start">From</label>
                  <select id="start" value={currentCheckpoint || start} onChange={(event) => { setStart(event.target.value); setCurrentCheckpoint(""); setResult(null); }}>
                    {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                  </select>
                </div>
                <div className="control-group">
                  <label className="field-label" htmlFor="destination">To</label>
                  <select id="destination" value={destination} onChange={(event) => selectDestination(event.target.value)}>
                    {destinations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="control-actions">
                <button className="primary-button primary-large" onClick={calculateRoute}><RouteIcon size={18} /> Calculate Route</button>
                <button className="secondary-button" onClick={resetRoute}><RotateCcw size={15} /> Reset</button>
              </div>
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
        </div>

        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>Tools & Settings</h2>
            <p className="muted">Quick access to QR scanning and destination search.</p>
          </div>

          <section className="indoor-card" aria-labelledby="indoor-heading">
            <div className="indoor-card-title">
              <span className="indoor-icon"><LocateFixed size={19} /></span>
              <div><h3 id="indoor-heading">Current Position</h3><p className="muted">Your last confirmed checkpoint.</p></div>
            </div>
            <div className="checkpoint-status"><strong>Current checkpoint:</strong> {byId[currentCheckpoint]?.name || "Not set"}</div>
            {scanActive && <video ref={videoRef} className="qr-video" muted playsInline aria-label="QR scanner camera" />}
            {scanMessage && <p className="scan-message" role="status">{scanMessage}</p>}
            {scanError && <p className="scan-error" role="alert">{scanError}</p>}
            <div className="indoor-actions">
              <button className="primary-button" onClick={() => { setScanError(""); setScanMessage(""); setScanActive((active) => !active); }}>
                {scanActive ? <Square size={17} /> : <Camera size={17} />}{scanActive ? "Stop Scanner" : "Scan QR Code"}
              </button>
              <label className="field-label" htmlFor="checkpoint">Or set manually</label>
              <select id="checkpoint" value={currentCheckpoint} onChange={(event) => {
                const id = event.target.value;
                setCurrentCheckpoint(id);
                if (id) setStart(id);
                setResult(null);
              }}>
                <option value="">Choose checkpoint…</option>
                {locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
              {currentCheckpoint && <button className="secondary-button" onClick={() => { setCurrentCheckpoint(""); setStart("entrance"); setResult(null); }}><RotateCcw size={15} /> Clear position</button>}
            </div>
          </section>

          <div className="sidebar-section">
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
          </div>

          <div className="sidebar-section">
            <h3>Quick QR Preview</h3>
            <p className="muted">Generate QR codes for checkpoints.</p>
            <label className="field-label" htmlFor="qr-checkpoint">Select checkpoint</label>
            <select id="qr-checkpoint" value={qrCheckpoint} onChange={(event) => setQrCheckpoint(event.target.value)}>{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select>
            <div className="qr-preview"><img src={qrImageUrl} alt={`WayPoint QR code for ${byId[qrCheckpoint]?.name || qrCheckpoint}`} /><div><strong>{byId[qrCheckpoint]?.name}</strong><small>WAYPOINT:{qrCheckpoint}</small><button className="qr-download" type="button" onClick={() => downloadSingleQr(byId[qrCheckpoint])}><Download size={13} /> Download</button></div></div>
          </div>
        </aside>
      </section>

      <section className="qr-library-section" id="qr-checkpoints">
        <div className="qr-library-inner">
          <div className="qr-library-heading"><div><span className="section-kicker">CHECKPOINT MANAGEMENT</span><h2>QR Checkpoints</h2><p>Preview, download, and print checkpoint codes for the locations in this floor plan. Scanning confirms a checkpoint; it does not continuously track movement.</p></div><button className="primary-button qr-download-all" type="button" onClick={downloadAllQrs} disabled={qrBusy}><FileArchive size={17} /> {qrBusy ? "Preparing archive…" : "Download all QR codes"}</button></div>
          <div className="qr-toolbox"><div className="qr-search-control"><Search size={18} /><input value={qrSearch} onChange={(event) => setQrSearch(event.target.value)} aria-label="Search QR checkpoints" placeholder="Search by room name or checkpoint ID" /></div><div className="qr-filter-control"><Filter size={17} /><select aria-label="Filter QR checkpoints by category" value={qrCategory} onChange={(event) => setQrCategory(event.target.value)}>{qrCategories.map((category) => <option key={category} value={category}>{category === "All" ? "All categories" : category}</option>)}</select></div><span className="qr-result-count">{filteredQrLocations.length} of {locations.length} checkpoints</span></div>
          <div className="qr-current-status"><span className="qr-status-icon"><LocateFixed size={19} /></span><div><small>LAST CONFIRMED POSITION</small><strong>{byId[currentCheckpoint]?.name || "No checkpoint selected"}</strong><span>{currentCheckpoint ? `WAYPOINT:${currentCheckpoint}` : "Scan a code or select a checkpoint manually."}</span></div>{currentCheckpoint && <CheckCircle2 className="qr-status-check" size={20} />}</div>
          <div className="qr-card-grid">{filteredQrLocations.map((location) => <article className="qr-location-card" key={location.id}><button className="qr-card-preview" type="button" onClick={() => setQrPreview(location.id)} aria-label={`Preview QR code for ${location.name}`}><img src={`/qr/${location.id}.png`} loading="lazy" alt={`QR code for ${location.name}`} /><span>View larger</span></button><div className="qr-card-content"><span className={`qr-category-pill ${location.type.toLowerCase().replace(/[^a-z]+/g, "-")}`}>{location.type}</span><h3>{location.name}</h3><code>WAYPOINT:{location.id}</code><div className="qr-card-actions"><button type="button" onClick={() => downloadSingleQr(location)}><Download size={14} /> PNG</button><button type="button" onClick={() => { setQrCheckpoint(location.id); setQrPreview(location.id); }}><SearchCheck size={14} /> Preview</button></div></div></article>)}{!filteredQrLocations.length && <div className="qr-empty-state"><QrCode size={28} /><strong>No checkpoints found</strong><span>Try another search term or category.</span></div>}</div>
          <div className="qr-print-note"><Printer size={18} /><p><strong>Printing and placement:</strong> Print each QR code clearly, label it with the room name, and place it at the matching doorway or junction. Scan-test every printed code before deployment.</p></div>
        </div>
      </section>
      {qrPreview && <div className="qr-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setQrPreview(""); }}><section className="qr-preview-modal" role="dialog" aria-modal="true" aria-labelledby="qr-modal-title"><button className="qr-modal-close" type="button" onClick={() => setQrPreview("")} aria-label="Close QR preview"><X size={20} /></button><span className="section-kicker">WAYPOINT CHECKPOINT</span><h2 id="qr-modal-title">{byId[qrPreview]?.name}</h2><img src={`/qr/${qrPreview}.png`} alt={`Large QR code for ${byId[qrPreview]?.name}`} /><code>WAYPOINT:{qrPreview}</code><button className="primary-button" type="button" onClick={() => downloadSingleQr(byId[qrPreview])}><Download size={16} /> Download PNG</button></section></div>}

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
      <section className="section-wrap future-section" id="about">
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
