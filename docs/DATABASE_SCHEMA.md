# 🗄️ SayraSphere — Database Schema Reference

> **Database:** MongoDB (Mongoose ODM)  
> **Naming Convention:** camelCase fields, snake_case collection names  
> **All collections include:** `createdAt`, `updatedAt` (via Mongoose timestamps)

---

## 👤 Collection: `users`

Stores registered users with authentication info and role assignment.

```javascript
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,        // bcrypt hashed, null for OAuth users
    select: false
  },
  googleId: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [String],  // stored hashed
  notificationPrefs: {
    email: { type: Boolean, default: true },
    push:  { type: Boolean, default: true }
  }
}, { timestamps: true });
```

**Indexes:** `email` (unique)

---

## 📱 Collection: `devices`

Registry of all IoT devices belonging to a user.

```javascript
const DeviceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'temperature_sensor',
      'humidity_sensor',
      'motion_detector',
      'switch',
      'smart_plug',
      'co2_sensor',
      'custom'
    ],
    required: true
  },
  mqttClientId: {
    type: String,
    required: true,
    unique: true         // used as MQTT topic identifier
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'unknown'],
    default: 'unknown'
  },
  lastPing: {
    type: Date,
    default: null
  },
  location: {
    label: { type: String, default: '' },     // "Living Room"
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  latestTelemetry: {
    type: Map,
    of: Schema.Types.Mixed,                   // { temperature: 28.4, humidity: 65 }
    default: {}
  },
  thresholds: {
    type: Map,
    of: {
      min: Number,
      max: Number
    },
    default: {}
  },
  meta: {
    firmware:     { type: String, default: null },
    batteryLevel: { type: Number, default: null },
    ipAddress:    { type: String, default: null },
    hardwareType: { type: String, default: 'simulator' }  // 'esp32', 'raspberrypi', etc.
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

**Indexes:** `userId`, `mqttClientId` (unique), `status`

---

## 📊 Collection: `telemetry`

Time-series sensor readings from devices. High-volume collection.

```javascript
const TelemetrySchema = new Schema({
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readings: {
    type: Map,
    of: Number,         // { temperature: 28.4, humidity: 65, co2: 412 }
    required: true
  },
  recordedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: false,   // using custom recordedAt
  versionKey: false
});

// TTL Index: auto-delete documents after 90 days
TelemetrySchema.index({ recordedAt: 1 }, { expireAfterSeconds: 7776000 });
```

**Indexes:** `deviceId + recordedAt` (compound, for time-range queries), `userId`, TTL on `recordedAt`

> ⚠️ **Performance Note:** For production with >100 devices and 5s polling, consider capping the collection or migrating to InfluxDB for telemetry in V2.

---

## ⌨️ Collection: `commands`

Log of all commands dispatched to devices.

```javascript
const CommandSchema = new Schema({
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  issuedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true      // 'toggle', 'setValue', 'restart', 'requestStatus'
  },
  payload: {
    type: Schema.Types.Mixed,
    default: {}         // { value: true } or { brightness: 75 }
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'acked', 'failed', 'timeout'],
    default: 'pending'
  },
  ackedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['ui', 'automation', 'api_key', 'scheduler'],
    default: 'ui'
  }
}, { timestamps: true });
```

**Indexes:** `deviceId`, `issuedBy`, `status`, `createdAt`

---

## ⏱️ Collection: `automation_rules`

User-defined IF/THEN automation rules.

```javascript
const AutomationRuleSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  trigger: {
    type: {
      type: String,
      enum: ['telemetry', 'schedule', 'device_status'],
      required: true
    },
    // For 'telemetry' trigger
    deviceId:  { type: Schema.Types.ObjectId, ref: 'Device' },
    metric:    { type: String },                     // 'temperature'
    operator:  { type: String, enum: ['gt', 'lt', 'eq', 'gte', 'lte'] },
    threshold: { type: Number },
    // For 'schedule' trigger
    cronExpression: { type: String },                // '0 8 * * *'
    // For 'device_status' trigger
    statusChange: { type: String, enum: ['online', 'offline'] }
  },
  action: {
    type: {
      type: String,
      enum: ['device_command', 'send_alert', 'ai_summary'],
      required: true
    },
    deviceId: { type: Schema.Types.ObjectId, ref: 'Device' },
    command:  { type: Schema.Types.Mixed },          // { action: 'toggle', value: true }
    alertMessage: { type: String }
  },
  lastTriggered: {
    type: Date,
    default: null
  },
  triggerCount: {
    type: Number,
    default: 0
  },
  cooldownMinutes: {
    type: Number,
    default: 5          // prevent re-triggering within 5 min
  }
}, { timestamps: true });
```

**Indexes:** `userId`, `enabled`

---

## 🔔 Collection: `alerts`

Alert history generated by automation rules or system events.

```javascript
const AlertSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    default: null
  },
  ruleId: {
    type: Schema.Types.ObjectId,
    ref: 'AutomationRule',
    default: null
  },
  type: {
    type: String,
    enum: ['threshold_breach', 'device_offline', 'command_failed', 'rule_triggered', 'ai_insight'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });
```

**Indexes:** `userId`, `isRead`, `createdAt`

---

## 🔑 Collection: `api_keys`

User-generated API keys for external access.

```javascript
const ApiKeySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: true        // "My Home Automation App"
  },
  keyHash: {
    type: String,
    required: true,
    select: false         // Never returned in queries
  },
  keyPrefix: {
    type: String          // First 8 chars for display: "ss_live_ab..."
  },
  scope: [{
    type: String,
    enum: ['devices:read', 'devices:command', 'telemetry:read', 'rules:read']
  }],
  lastUsed: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

**Indexes:** `userId`, `keyHash` (unique)

---

## 🧪 Collection: `device_simulators` *(Dev/Testing only)*

Tracks mock device configurations for the simulator.

```javascript
const SimulatorSchema = new Schema({
  deviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  metrics: [{
    name: String,         // 'temperature'
    unit: String,         // '°C'
    min: Number,          // 15
    max: Number,          // 45
    currentValue: Number,
    changePattern: {
      type: String,
      enum: ['random', 'sine_wave', 'gradual_rise', 'static']
    }
  }],
  publishIntervalMs: {
    type: Number,
    default: 3000         // emit every 3 seconds
  },
  isRunning: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

---

## 📌 Index Summary

| Collection         | Key Indexes                                     |
|--------------------|-------------------------------------------------|
| `users`            | `email` (unique)                                |
| `devices`          | `userId`, `mqttClientId` (unique), `status`     |
| `telemetry`        | `{ deviceId, recordedAt }` compound, TTL        |
| `commands`         | `deviceId`, `status`, `createdAt`               |
| `automation_rules` | `userId`, `enabled`                             |
| `alerts`           | `userId`, `isRead`, `createdAt`                 |
| `api_keys`         | `userId`, `keyHash` (unique)                    |

---

> 📁 Related Docs: `ARCHITECTURE.md` · `API_DESIGN.md` · `BLUEPRINT.md`
