# 🏗️ SayraSphere — System Architecture

> **Version:** 1.0  
> **Type:** Full-Stack IoT Web Platform  
> **Pattern:** Microservice-ready Monolith → Scalable Modular Architecture

---

## 📐 High-Level Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│          React + Redux + Tailwind + ShadCN (PWA)                │
└────────────────────┬──────────────────────┬─────────────────────┘
                     │ REST API              │ WebSocket (Socket.IO)
┌────────────────────▼──────────────────────▼─────────────────────┐
│                      SERVER LAYER                               │
│              Node.js + Express.js (REST + WS)                   │
│  ┌──────────┐ ┌────────────┐ ┌──────────┐ ┌─────────────────┐  │
│  │  Routes  │ │Controllers │ │Middleware│ │  Services Layer  │  │
│  │ /devices │ │ deviceCtrl │ │  Auth    │ │ AI · Alert · Job │  │
│  │ /rules   │ │ ruleCtrl   │ │  RBAC    │ │ AutomationEngine │  │
│  │ /users   │ │ userCtrl   │ │  Logger  │ └─────────────────┘  │
│  └──────────┘ └────────────┘ └──────────┘                      │
└──────┬─────────────────────────────────────┬────────────────────┘
       │ Mongoose ODM                         │ MQTT.js Client
┌──────▼──────────┐                 ┌─────────▼──────────────────┐
│    MongoDB       │                 │   Mosquitto MQTT Broker     │
│  (Primary DB)    │                 │   (pub/sub IoT protocol)    │
└──────────────────┘                 └────────────┬───────────────┘
                                                  │ MQTT Topics
                                     ┌────────────▼───────────────┐
                                     │   IoT Devices / Simulator   │
                                     │  ESP32 · Arduino · RasPi    │
                                     │  OR: Node.js Simulator      │
                                     └────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. Real-Time Device Data Flow (MQTT → UI)

```
[IoT Device / Simulator]
       │
       │ PUBLISH: sayrasphere/devices/{deviceId}/telemetry
       ▼
[Mosquitto MQTT Broker]
       │
       │ SUBSCRIBE (server-side MQTT client)
       ▼
[Node.js Server — MQTT Handler]
       │
       ├──► Save to MongoDB (time-series data)
       │
       └──► Emit via Socket.IO → "device:update" event
                    │
                    ▼
           [React Frontend]
           Redux store updated
                    │
                    ▼
           Dashboard UI re-renders (live)
```

---

### 2. Device Command Flow (UI → Device)

```
[User clicks "Turn ON" in React UI]
       │
       │ POST /api/devices/:id/command  { action: "toggle", value: true }
       ▼
[Express.js Controller]
       │
       ├──► Validate JWT + RBAC
       ├──► Log command to MongoDB
       └──► PUBLISH: sayrasphere/devices/{deviceId}/command
                    │
                    ▼
           [Mosquitto MQTT Broker]
                    │
                    ▼
           [IoT Device / Simulator]
           Executes command → publishes ACK
```

---

### 3. Automation Rule Trigger Flow

```
[MongoDB — Automation Rules Collection]
       │
       │ Polled / Event-driven
       ▼
[AutomationEngine Service]  ← runs on Node.js server
       │
       │ Evaluates: IF sensor_value MEETS condition
       │            THEN dispatch action
       ▼
[Action Dispatcher]
       ├──► MQTT command to device
       ├──► Email/SMS alert (Nodemailer / Twilio)
       └──► AI Summary trigger (Groq API)
```

---

### 4. Authentication Flow

```
[User: Login / Google OAuth]
       │
       ▼
[Express Auth Controller]
       │
       ├──► Validate credentials / OAuth token
       ├──► Generate JWT (Access Token + Refresh Token)
       └──► Return tokens to client
                    │
                    ▼
           [React: Store in memory / httpOnly cookie]
                    │
                    ▼
           [Subsequent API calls → Bearer JWT in header]
                    │
                    ▼
           [AuthMiddleware validates → attaches user to req]
```

---

## 🧱 Layer-by-Layer Breakdown

### Frontend Layer (`/client`)

| Concern              | Solution                                  |
|----------------------|-------------------------------------------|
| Component Library    | ShadCN UI (Radix primitives + Tailwind)   |
| State (server data)  | Redux Toolkit Query (RTK Query)           |
| State (local/UI)     | useState, Context API                     |
| Real-time updates    | Socket.IO client (custom `useSocket` hook)|
| Charts               | Recharts (responsive, composable)         |
| Forms                | React Hook Form + Zod validation          |
| Auth Guard           | ProtectedRoute HOC                        |
| Error Boundaries     | React Error Boundary + toast notifications|

---

### Backend Layer (`/server`)

| Concern              | Solution                                  |
|----------------------|-------------------------------------------|
| HTTP Framework       | Express.js                                |
| MQTT Integration     | mqtt.js (connects to Mosquitto broker)    |
| WebSockets           | Socket.IO (attached to HTTP server)       |
| Auth                 | passport.js + jsonwebtoken                |
| Validation           | Joi / Zod                                 |
| Scheduling / Jobs    | node-cron (automation schedules)          |
| AI Calls             | Groq SDK (async service calls)            |
| Email Alerts         | Nodemailer                                |
| Logging              | Winston + Morgan                          |

---

### Database Layer

| Collection           | Purpose                                   |
|----------------------|-------------------------------------------|
| `users`              | Auth, profile, role                       |
| `devices`            | Device registry, metadata, status         |
| `telemetry`          | Time-series sensor readings               |
| `commands`           | Command history + ACK status              |
| `automation_rules`   | Rule definitions (conditions + actions)   |
| `alerts`             | Alert history                             |
| `api_keys`           | User-generated external API keys          |

> 📌 **Note:** For high-frequency telemetry, consider **TimescaleDB** or **InfluxDB** in V2. For MVP, MongoDB with TTL indexes is sufficient.

---

### MQTT Topic Schema

```
sayrasphere/
├── devices/
│   ├── {deviceId}/
│   │   ├── telemetry       ← device PUBLISHES sensor data
│   │   ├── command         ← server PUBLISHES commands
│   │   ├── status          ← device PUBLISHES online/offline
│   │   └── ack             ← device PUBLISHES command acknowledgement
├── alerts/
│   └── {userId}            ← server PUBLISHES user-specific alerts
```

---

## 🔐 Security Architecture

| Concern               | Implementation                                        |
|-----------------------|-------------------------------------------------------|
| API Auth              | JWT Bearer token (15min expiry) + Refresh token       |
| MQTT Auth             | Username/password per device (Mosquitto ACL)          |
| RBAC                  | Admin > User > Guest (middleware-enforced)            |
| Input Sanitization    | Joi/Zod schema validation on all routes               |
| Rate Limiting         | express-rate-limit on auth + command endpoints        |
| CORS                  | Whitelist origin policy                               |
| Env Secrets           | dotenv + never committed (`.env.example` provided)    |

---

## ⚡ Scalability Considerations (V2 Roadmap)

```
Current (MVP Monolith)          →   Future (Microservices)
──────────────────────────────────────────────────────────
Single Node.js server           →   Auth Service (separate)
MQTT in same process            →   MQTT Bridge Service
Automation in same process      →   Rule Engine Service (worker)
MongoDB only                    →   MongoDB + InfluxDB (telemetry)
Single Docker container         →   Docker Compose → Kubernetes
```

---

> 📁 Related Docs: `BLUEPRINT.md` · `API_DESIGN.md` · `DATABASE_SCHEMA.md` · `COMPONENT_STRUCTURE.md`
