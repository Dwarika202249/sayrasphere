# 🗺️ SayraSphere — Development Blueprint

> **Strategy:** Ship fast, iterate smart. Start with a functional MVP, layer in complexity.  
> **Approach:** Feature-driven phases with clear deliverables and skill-showcase milestones.

---

## 🧭 Development Philosophy

- **Simulator-First:** No physical hardware needed. Build a Node.js Device Simulator from Day 1. Focus 100% on software architecture.
- **Vertical Slicing:** Each phase delivers a working, demonstrable feature — not isolated half-built modules.
- **Portfolio-Driven:** Every phase produces something you can demo to a hiring manager.

---

## 📅 Phase Overview

| Phase | Name                       | Duration (est.) | Deliverable                              |
| ----- | -------------------------- | --------------- | ---------------------------------------- |
| 0     | Foundation & Setup         | 3–4 days        | Monorepo + Auth + DB running             |
| 1     | Core Dashboard (MVP)       | 1–1.5 weeks     | Live device dashboard + simulator        |
| 2     | Device Control             | 4–5 days        | Remote command dispatch via MQTT         |
| 3     | Automation Engine          | 1 week          | Rule builder + cron-based schedules      |
| 4     | Analytics & Reporting      | 4–5 days        | Historical charts + data export          |
| 5     | AI Integration             | 4–5 days        | Groq-powered assistant + alerts          |
| 6     | Polish & Advanced Features | 1 week          | PWA, geo-map, public API, health monitor |
| 7     | DevOps & Deployment        | 3–4 days        | Dockerized, deployed, CI/CD pipeline     |

**Total Estimated Timeline: 6–8 weeks (focused dev)**

---

## 🏗️ Phase 0 — Foundation & Project Setup

### Goals

- Initialize monorepo structure
- Configure tooling, linting, environment
- Basic auth flow working end-to-end

### Tasks

- [ ] Init `client/` with Vite + React + TypeScript
- [ ] Install and configure Tailwind CSS + ShadCN UI
- [ ] Init `server/` with Node.js + Express + TypeScript
- [ ] Setup MongoDB connection via Mongoose
- [ ] Implement User model + JWT Auth (register/login endpoints)
- [ ] Build Login & Register pages in React (oAuth2 implementation - frontend and backend both)
- [ ] Setup Redux Toolkit store (authSlice)
- [ ] Implement ProtectedRoute component
- [ ] Setup `docker-compose.yml` for MongoDB + Mosquitto
- [ ] Configure `.env` with all required secrets

### Milestone Demo

> ✅ User can register, login, and see a protected dashboard shell.

---

## 📊 Phase 1 — Core Dashboard (MVP)

### Goals

- Display real-time device list with live status
- Device Simulator publishing MQTT data
- Socket.IO bridging MQTT data to React UI

### Tasks

- [ ] Create `Device` Mongoose model (name, type, status, lastPing, metadata)
- [ ] Seed database with 5–6 mock devices
- [ ] Build `/api/devices` REST endpoint (GET all, GET by ID)
- [ ] Build MQTT handler in server (`mqtt/mqttClient.js`)
  - Subscribe to `sayrasphere/devices/+/telemetry`
  - Subscribe to `sayrasphere/devices/+/status`
- [ ] Build Socket.IO server (`socket/socketServer.js`)
  - Emit `device:update` on new telemetry
  - Emit `device:status` on connect/disconnect
- [ ] Build **Device Simulator** (`simulator/index.js`)
  - Publishes random temperature/humidity every 3 seconds
  - Randomly toggles device online/offline
- [ ] Build React Dashboard page
  - `DeviceGrid` component (cards for each device)
  - `DeviceCard` component (name, type, status badge, last value)
  - `useSocket` custom hook for real-time updates
  - Update Redux `devicesSlice` on socket events
- [ ] Live status indicator (green dot = online, red = offline)

### Milestone Demo

> ✅ Dashboard shows 5+ devices. Values update live without page refresh. Simulator driving the data.

---

## ⚙️ Phase 2 — Device Control Panel

### Goals

- Users can send commands to devices (toggle, set value)
- Command is dispatched via MQTT and acknowledged

### Tasks

- [ ] Create `Command` Mongoose model (deviceId, action, value, status, timestamp)
- [ ] Build `POST /api/devices/:id/command` endpoint
  - Validate auth + RBAC
  - Log command to DB
  - Publish to `sayrasphere/devices/{id}/command` via MQTT
- [ ] Simulator listens to `/command` topic → simulates ACK publish
- [ ] Server listens to `/ack` → updates command status in DB
- [ ] Build React Control Panel page
  - `DeviceControlCard` — toggle switch for on/off devices
  - `SliderControl` — brightness/temperature/speed slider
  - Optimistic UI update on command send
  - `CommandHistory` table component
- [ ] Toast notification on command success/failure

### Milestone Demo

> ✅ Click toggle → UI updates instantly → MQTT command fired → Simulator acknowledges → Status confirmed.

---

## ⏱️ Phase 3 — Automation Engine

### Goals

- Users can define IF/THEN rules
- Time-based automation schedules
- Rules evaluated server-side, actions dispatched

### Tasks

- [ ] Create `AutomationRule` Mongoose model
  ```
  { name, trigger: { deviceId, metric, operator, value },
    action: { type, deviceId, command }, schedule, enabled }
  ```
- [ ] Build Rule CRUD endpoints (`/api/rules`)
- [ ] Build `AutomationEngine` service
  - Polls telemetry on each MQTT message
  - Evaluates active rules against incoming data
  - Dispatches actions on condition match
- [ ] Integrate `node-cron` for schedule-based rules
- [ ] Build React Automation Builder page
  - `RuleForm` — condition builder UI (dropdown selectors)
  - `RuleList` — enable/disable/delete rules
  - `SchedulePicker` component (visual cron builder)

### Milestone Demo

> ✅ Create rule: "If temp > 30°C, turn ON Fan-01". Simulator pushes 32°C → Fan toggles automatically.

---

## 📈 Phase 4 — Analytics & Reporting

### Goals

- Historical sensor data visualization
- Exportable CSV/JSON logs

### Tasks

- [ ] Create `Telemetry` Mongoose model with TTL index (90 days)
- [ ] Server saves all MQTT telemetry to DB on receive
- [ ] Build `GET /api/telemetry/:deviceId` endpoint (with date range filters)
- [ ] Build React Analytics page
  - `TimeSeriesChart` (Recharts `LineChart`) — last 24h/7d/30d toggle
  - `MultiDeviceChart` — overlay multiple sensors
  - `StatCard` components — min/max/avg summary
  - `ExportButton` — download as CSV
- [ ] Date range picker component

### Milestone Demo

> ✅ Select device → view 7-day temperature trend chart → export as CSV.

---

## 🧠 Phase 5 — AI Integration (Groq API)

### Goals

- AI-generated device activity summaries
- Predictive maintenance suggestions
- Conversational AI assistant for device queries

### Tasks

- [ ] Setup Groq SDK in server (`services/aiService.js`)
- [ ] Build `POST /api/ai/summary` endpoint
  - Fetches last N telemetry readings for a device
  - Sends structured data to Groq (LLaMA 3)
  - Returns natural-language summary
- [ ] Build `POST /api/ai/maintenance` endpoint
  - Analyzes patterns: abnormal spikes, downtime frequency
  - Returns maintenance recommendation
- [ ] Build React AI Panel
  - `AISummaryCard` — "Here's what Device-01 did today"
  - `MaintenanceAlert` card with AI recommendation
  - `AIChat` component — ask questions about your devices
- [ ] Integrate AI alert into the Automation Engine
  - On rule trigger → generate AI summary of the event

### Milestone Demo

> ✅ Click "AI Summary" → Groq returns: "Sensor-03 ran above normal temp for 40 mins between 2–3pm. Consider checking ventilation."

---

## 🌟 Phase 6 — Polish & Advanced Features

### Goals

- PWA support
- Device health dashboard
- Public API key generation
- Geo/floorplan map view

### Tasks

- [ ] Configure `vite-plugin-pwa` — manifest + service worker
- [ ] Push notifications for critical alerts
- [ ] Build Device Health Dashboard
  - Uptime tracker, latency indicator, battery level
  - Health alert flags with threshold config
- [ ] Build Public API Generator
  - `POST /api/keys/generate` → return scoped API key
  - Minimal API docs UI in React
- [ ] Integrate `react-leaflet` for geo-map view
  - Place device markers on a map/floorplan
- [ ] Light/Dark mode toggle (Tailwind `dark:` classes)
- [ ] Mobile-responsive audit + fixes

### Milestone Demo

> ✅ App is installable on phone. Device locations visible on map. External API key works via Postman.

---

## 🐳 Phase 7 — DevOps & Deployment

### Goals

- Dockerized full stack
- Deployed and accessible online
- CI/CD pipeline

### Tasks

- [ ] Write `Dockerfile` for client (Nginx) and server (Node)
- [ ] Finalize `docker-compose.yml` (client + server + mongo + mosquitto)
- [ ] Deploy server to **Railway** or **Render**
- [ ] Deploy client to **Vercel**
- [ ] Setup GitHub Actions CI (lint + build on PR)
- [ ] Configure environment variables in production
- [ ] Write final `README.md` with live demo link + screenshots

### Milestone Demo

> ✅ Shareable live URL. GitHub repo public. CI passing. Portfolio-ready.

---

## 🏆 Portfolio Showcase Checklist

- [ ] Live deployed demo URL
- [ ] GitHub repo with clean commit history
- [ ] README with screenshots/GIFs
- [ ] Architecture diagram (from ARCHITECTURE.md)
- [ ] Tech stack badge section
- [ ] "Key Challenges Solved" section in README

---

> 📁 Related Docs: `README.md` · `ARCHITECTURE.md` · `API_DESIGN.md` · `DATABASE_SCHEMA.md`
