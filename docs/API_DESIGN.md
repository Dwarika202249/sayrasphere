# 📡 SayraSphere — API Design Reference

> **Base URL (Dev):** `http://localhost:5000/api`  
> **Base URL (Prod):** `https://api.sayrasphere.app/api`  
> **Auth:** Bearer JWT Token in `Authorization` header  
> **Format:** JSON (all requests and responses)

---

## 🔐 Authentication Endpoints

### `POST /auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "Aryan Singh",
  "email": "aryan@email.com",
  "password": "SecurePass@123"
}
```
**Response `201`:**
```json
{
  "user": { "id": "...", "name": "Aryan Singh", "role": "user" },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

### `POST /auth/login`
Login with email/password.

**Request Body:**
```json
{ "email": "aryan@email.com", "password": "SecurePass@123" }
```
**Response `200`:**
```json
{
  "user": { "id": "...", "name": "Aryan Singh", "role": "user" },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

### `POST /auth/google`
Login/Register via Google OAuth.

**Request Body:** `{ "idToken": "<google_id_token>" }`

---

### `POST /auth/refresh`
Refresh access token using refresh token.

**Request Body:** `{ "refreshToken": "<jwt>" }`

---

### `POST /auth/logout`
Invalidate refresh token.

---

## 📱 Device Endpoints

### `GET /devices`
Get all devices for the authenticated user.

**Query Params:** `?status=online|offline` `?type=sensor|switch`

**Response `200`:**
```json
[
  {
    "id": "dev_001",
    "name": "Living Room Sensor",
    "type": "temperature_sensor",
    "status": "online",
    "lastPing": "2025-06-01T12:00:00Z",
    "location": { "lat": 28.6139, "lng": 77.2090, "label": "Living Room" },
    "latestTelemetry": { "temperature": 28.4, "humidity": 65 },
    "meta": { "firmware": "v1.2", "batteryLevel": 87 }
  }
]
```

---

### `GET /devices/:id`
Get single device details.

---

### `POST /devices`
Register a new device. *(Admin only)*

**Request Body:**
```json
{
  "name": "Bedroom Fan",
  "type": "switch",
  "mqttClientId": "esp32_bedroom_fan",
  "location": { "label": "Bedroom" }
}
```

---

### `PATCH /devices/:id`
Update device metadata (name, location, thresholds).

---

### `DELETE /devices/:id`
Deregister a device. *(Admin only)*

---

### `POST /devices/:id/command`
Send a control command to a device via MQTT.

**Request Body:**
```json
{
  "action": "toggle",
  "value": true
}
```
*Possible actions: `toggle`, `setValue`, `restart`, `requestStatus`*

**Response `202`:**
```json
{
  "commandId": "cmd_abc123",
  "status": "dispatched",
  "message": "Command published to MQTT topic"
}
```

---

### `GET /devices/:id/commands`
Get command history for a device.

**Query Params:** `?limit=20&status=acked|pending|failed`

---

## 📊 Telemetry Endpoints

### `GET /telemetry/:deviceId`
Get historical sensor data for a device.

**Query Params:**
- `?from=2025-05-25T00:00:00Z`
- `?to=2025-06-01T00:00:00Z`
- `?metric=temperature,humidity`
- `?granularity=raw|hourly|daily`

**Response `200`:**
```json
{
  "deviceId": "dev_001",
  "metric": "temperature",
  "data": [
    { "timestamp": "2025-05-25T10:00:00Z", "value": 27.3 },
    { "timestamp": "2025-05-25T10:05:00Z", "value": 28.1 }
  ]
}
```

---

### `GET /telemetry/:deviceId/stats`
Get aggregated stats (min, max, avg) for a time range.

**Response `200`:**
```json
{
  "temperature": { "min": 22.1, "max": 34.7, "avg": 27.5 },
  "humidity": { "min": 45, "max": 80, "avg": 62 }
}
```

---

### `GET /telemetry/:deviceId/export`
Export telemetry as CSV.

**Query Params:** `?from=...&to=...&format=csv|json`

---

## ⏱️ Automation Rules Endpoints

### `GET /rules`
Get all automation rules for the user.

---

### `POST /rules`
Create a new automation rule.

**Request Body:**
```json
{
  "name": "High Temp Alert",
  "enabled": true,
  "trigger": {
    "type": "telemetry",
    "deviceId": "dev_001",
    "metric": "temperature",
    "operator": "gt",
    "threshold": 30
  },
  "action": {
    "type": "device_command",
    "deviceId": "dev_002",
    "command": { "action": "toggle", "value": true }
  },
  "schedule": null
}
```

*Trigger types: `telemetry`, `schedule`, `device_status`*  
*Action types: `device_command`, `send_alert`, `ai_summary`*  
*Operators: `gt`, `lt`, `eq`, `gte`, `lte`*

---

### `PATCH /rules/:id`
Update a rule (enable/disable, modify conditions).

---

### `DELETE /rules/:id`
Delete an automation rule.

---

## 🔔 Alerts Endpoints

### `GET /alerts`
Get alert history for the user.

**Query Params:** `?read=true|false&limit=50`

---

### `PATCH /alerts/:id/read`
Mark an alert as read.

---

### `DELETE /alerts/clear`
Clear all read alerts.

---

## 🧠 AI Endpoints

### `POST /ai/summary`
Get an AI-generated natural language summary of device activity.

**Request Body:**
```json
{
  "deviceId": "dev_001",
  "timeRange": "last_24h"
}
```
**Response `200`:**
```json
{
  "summary": "Sensor-01 maintained an average temperature of 27.5°C over the last 24 hours with a peak of 34°C at 2:30 PM. Humidity levels were stable. No anomalies detected.",
  "generatedAt": "2025-06-01T15:00:00Z"
}
```

---

### `POST /ai/maintenance`
Get AI-powered maintenance recommendations.

**Request Body:** `{ "deviceId": "dev_001" }`

**Response `200`:**
```json
{
  "deviceId": "dev_001",
  "recommendation": "Sensor readings show increasing temperature spikes over the past 7 days, suggesting possible ventilation obstruction. Recommend physical inspection within 48 hours.",
  "urgency": "medium"
}
```

---

### `POST /ai/chat`
Chat with AI assistant about your devices.

**Request Body:**
```json
{
  "message": "Which device used the most energy this week?",
  "context": { "userId": "user_123" }
}
```
**Response `200`:** `{ "reply": "Based on your data, Smart Plug 2 had the highest activity this week..." }`

---

## 🔑 API Key Management

### `POST /keys/generate`
Generate a public API key for external access.

**Request Body:** `{ "label": "My Home App", "scope": ["devices:read", "devices:command"] }`

**Response `201`:**
```json
{
  "keyId": "key_xyz",
  "label": "My Home App",
  "apiKey": "ss_live_abc123...",
  "scope": ["devices:read", "devices:command"]
}
```

---

### `GET /keys`
List all generated API keys.

---

### `DELETE /keys/:keyId`
Revoke an API key.

---

## 🌐 WebSocket Events (Socket.IO)

### Client → Server (Emit)

| Event              | Payload                        | Description                    |
|--------------------|--------------------------------|--------------------------------|
| `subscribe:device` | `{ deviceId }`                 | Subscribe to a device's updates|
| `unsubscribe`      | `{ deviceId }`                 | Unsubscribe from a device      |

### Server → Client (Listen)

| Event              | Payload                                    | Description                       |
|--------------------|--------------------------------------------|-----------------------------------|
| `device:update`    | `{ deviceId, metric, value, timestamp }`   | New telemetry data received       |
| `device:status`    | `{ deviceId, status: 'online'/'offline' }` | Device connectivity change        |
| `device:ack`       | `{ commandId, deviceId, status }`          | Command acknowledged by device    |
| `rule:triggered`   | `{ ruleId, ruleName, actionTaken }`        | Automation rule fired             |
| `alert:new`        | `{ alertId, message, severity }`           | New alert generated               |

---

## 🔴 Error Response Format

All errors follow this standard format:

```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "No device found with the given ID.",
    "status": 404
  }
}
```

| Status Code | Meaning                               |
|-------------|---------------------------------------|
| 400         | Bad Request (validation failed)       |
| 401         | Unauthorized (invalid/missing token)  |
| 403         | Forbidden (insufficient permissions)  |
| 404         | Resource not found                    |
| 409         | Conflict (duplicate resource)         |
| 429         | Too Many Requests (rate limited)      |
| 500         | Internal Server Error                 |

---

> 📁 Related Docs: `ARCHITECTURE.md` · `DATABASE_SCHEMA.md` · `BLUEPRINT.md`
