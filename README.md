# 🌐 SayraSphere

> **Smart IoT Device & Sensor Management Platform**  
> Real-time monitoring · Remote control · AI-powered analytics · Automation

---

## 📌 Project Summary

SayraSphere is a full-stack, production-grade IoT management platform that enables users to monitor real-time sensor data, control remote devices, configure automation rules, and receive AI-driven insights — all from a single responsive dashboard.

Think of it as a self-hosted, developer-owned alternative to **Blynk**, **Home Assistant**, or **Tuya Smart** — built with a modern React + Node.js stack and augmented with AI via the **Groq API**.

---

## 🎯 Vision Statement

> _"Empowering developers and businesses to take full ownership of their connected device ecosystem — with intelligence baked in."_

---

## 🛠️ Core Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| Frontend           | React.js (Hooks), TypeScript                    |
| Styling            | Tailwind CSS, ShadCN UI                         |
| Routing            | React Router v6                                 |
| State Management   | Redux Toolkit + Context API                     |
| Backend            | Node.js, Express.js                             |
| Realtime Comms     | MQTT.js (Mosquitto Broker), Socket.IO           |
| Database           | MongoDB (primary), Firebase Realtime DB (cache) |
| Authentication     | JWT + Google OAuth 2.0                          |
| Data Visualization | Recharts, Chart.js                              |
| AI Integration     | Groq API (LLaMA 3)                              |
| Deployment         | Docker, Railway / Render / Vercel               |

---

## ✅ Feature Modules

- 📊 **Device Dashboard** — Live device status, real-time stream
- ⚙️ **Device Control Panel** — Remote toggle, sliders, command dispatch
- ⏱️ **Automation Engine** — Rule-based & schedule-based automations
- 📈 **Analytics & Reporting** — Historical charts, export logs
- 🔐 **Auth & RBAC** — Login/signup, role-based access control
- 🌍 **Geo-Map View** — Floorplan or geolocation device mapping
- 🧠 **AI Assistant** — Predictive maintenance, activity summaries
- 🔔 **Alert System** — Motion/threshold alerts via email/SMS
- 🧪 **Device Simulator** — Mock IoT devices for dev/testing
- 📱 **PWA Support** — Installable on Android/iOS

---

## 📁 Repository Structure

```
sayrasphere/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/           # Redux slices
│   │   ├── hooks/
│   │   ├── services/        # API calls
│   │   └── utils/
├── server/                  # Node.js + Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/              # Mongoose schemas
│   ├── middleware/
│   ├── mqtt/                # MQTT broker handlers
│   ├── socket/              # Socket.IO handlers
│   └── services/            # AI, alert, automation
├── simulator/               # Device simulator scripts
├── docs/                    # Reference documentation (this folder)
└── docker-compose.yml
```

---

## 🚀 Getting Started (Dev Setup)

```bash
# Clone repository
git clone https://github.com/yourhandle/sayrasphere.git

# Install dependencies
cd client && npm install --legacy-peer-deps
cd ../server && npm install

# Start dev environment
docker-compose up        # Starts MongoDB + Mosquitto
npm run dev              # Runs both client & server concurrently
```

---

## 🌎 Production Deployment

For step-by-step production setup (HiveMQ, Atlas, Render, Vercel), see:
👉 **[Production Deployment Guide](./docs/DEPLOYMENT.md)** (Refer to `deployment_checklist.md` in artifacts for now)

---

## 📄 Reference Documentation Index

| File                     | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `ARCHITECTURE.md`        | System design, data flow, layer breakdown |
| `BLUEPRINT.md`           | Phased development roadmap                |
| `COMPONENT_STRUCTURE.md` | React component tree & responsibilities   |
| `API_DESIGN.md`          | REST + WebSocket + MQTT API contracts     |
| `DATABASE_SCHEMA.md`     | MongoDB collection schemas                |

---

## 👤 Author

**Built by:** [Dwarika Kumar]  
**Role Target:** Senior Frontend / Full-Stack Engineer (Remote)  
**Portfolio Project:** Yes — Production-ready showcase

---

> _SayraSphere — Where every device speaks, and the cloud listens._
