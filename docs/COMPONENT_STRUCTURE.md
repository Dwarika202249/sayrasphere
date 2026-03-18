# ⚛️ SayraSphere — React Component Structure

> **Pattern:** Feature-based folder structure (not type-based)  
> **State:** Redux Toolkit (server state) + useState/Context (UI state)  
> **Styling:** Tailwind CSS + ShadCN UI components  
> **Forms:** React Hook Form + Zod

---

## 📁 Full Client Directory Structure

```
client/src/
│
├── 📁 app/
│   ├── store.ts               # Redux store config
│   ├── rootReducer.ts
│   └── App.tsx                # Root component, route setup
│
├── 📁 pages/                  # Route-level page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── DeviceDetailPage.tsx
│   ├── ControlPanelPage.tsx
│   ├── AutomationPage.tsx
│   ├── AnalyticsPage.tsx
│   ├── AIAssistantPage.tsx
│   ├── AlertsPage.tsx
│   ├── MapViewPage.tsx
│   ├── ApiKeysPage.tsx
│   └── SettingsPage.tsx
│
├── 📁 features/               # Feature-scoped components + Redux slices
│   ├── 📁 auth/
│   │   ├── authSlice.ts
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleLoginButton.tsx
│   │
│   ├── 📁 devices/
│   │   ├── devicesSlice.ts
│   │   ├── DeviceGrid.tsx
│   │   ├── DeviceCard.tsx
│   │   ├── DeviceStatusBadge.tsx
│   │   ├── DeviceDetailDrawer.tsx
│   │   ├── AddDeviceModal.tsx
│   │   └── DeviceHealthIndicator.tsx
│   │
│   ├── 📁 control/
│   │   ├── controlSlice.ts
│   │   ├── DeviceControlCard.tsx
│   │   ├── ToggleSwitch.tsx
│   │   ├── SliderControl.tsx
│   │   └── CommandHistoryTable.tsx
│   │
│   ├── 📁 telemetry/
│   │   ├── telemetrySlice.ts
│   │   ├── TimeSeriesChart.tsx
│   │   ├── MultiDeviceChart.tsx
│   │   ├── StatSummaryCards.tsx
│   │   ├── DateRangePicker.tsx
│   │   └── ExportButton.tsx
│   │
│   ├── 📁 automation/
│   │   ├── rulesSlice.ts
│   │   ├── RuleList.tsx
│   │   ├── RuleCard.tsx
│   │   ├── RuleFormModal.tsx
│   │   ├── ConditionBuilder.tsx
│   │   ├── ActionBuilder.tsx
│   │   └── SchedulePicker.tsx
│   │
│   ├── 📁 alerts/
│   │   ├── alertsSlice.ts
│   │   ├── AlertList.tsx
│   │   ├── AlertItem.tsx
│   │   └── AlertBadge.tsx         # Notification bell counter
│   │
│   └── 📁 ai/
│       ├── AISummaryCard.tsx
│       ├── MaintenanceAlert.tsx
│       ├── AIChat.tsx
│       └── AIInsightPanel.tsx
│
├── 📁 components/             # Shared/reusable UI components
│   ├── 📁 layout/
│   │   ├── AppLayout.tsx          # Sidebar + TopNav shell
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── MobileNav.tsx
│   ├── 📁 ui/                     # ShadCN wrappers + custom primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Spinner.tsx
│   │   ├── Badge.tsx
│   │   └── ThemeToggle.tsx
│   └── 📁 common/
│       ├── ProtectedRoute.tsx
│       ├── ErrorBoundary.tsx
│       ├── EmptyState.tsx
│       └── PageHeader.tsx
│
├── 📁 hooks/                  # Custom React hooks
│   ├── useSocket.ts           # Socket.IO connection + event handlers
│   ├── useAuth.ts             # Auth state + actions
│   ├── useDevices.ts          # Device data + status helpers
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── 📁 services/               # API call functions (RTK Query or axios)
│   ├── api.ts                 # Axios instance + interceptors
│   ├── authService.ts
│   ├── deviceService.ts
│   ├── telemetryService.ts
│   ├── ruleService.ts
│   ├── alertService.ts
│   └── aiService.ts
│
├── 📁 store/                  # Redux slices (if not colocated in features)
│   └── index.ts
│
├── 📁 utils/
│   ├── formatDate.ts
│   ├── formatTelemetry.ts
│   ├── deviceHelpers.ts
│   └── constants.ts
│
├── 📁 types/
│   ├── device.types.ts
│   ├── telemetry.types.ts
│   ├── rule.types.ts
│   ├── alert.types.ts
│   └── auth.types.ts
│
└── main.tsx
```

---

## 🧩 Key Component Breakdown

### `AppLayout.tsx`
The persistent shell wrapping all authenticated pages.

```
AppLayout
├── Sidebar (collapsible on mobile)
│   ├── Logo
│   ├── NavLinks (Dashboard, Devices, Automation, Analytics, AI, Map, Settings)
│   └── UserProfileMini
├── TopNav
│   ├── PageTitle
│   ├── AlertBadge (bell icon + count)
│   ├── ThemeToggle
│   └── UserMenu
└── <Outlet /> (page content)
```

---

### `DeviceCard.tsx`
The primary card displayed in the device grid.

```
DeviceCard
├── DeviceIcon (type-based icon)
├── DeviceName + DeviceType label
├── DeviceStatusBadge (online / offline / unknown)
├── LatestTelemetryRow (e.g., "28.4°C | 65% RH")
├── LastPing timestamp
└── QuickActionButton (toggle / navigate to detail)
```

**Props:**
```typescript
interface DeviceCardProps {
  device: Device;
  onCommand?: (deviceId: string, action: CommandAction) => void;
  isLoading?: boolean;
}
```

---

### `TimeSeriesChart.tsx`
Recharts-based time-series chart with configurable granularity.

```
TimeSeriesChart
├── ChartHeader (device name + metric label)
├── GranularityToggle (Raw | Hourly | Daily)
├── ResponsiveContainer
│   └── LineChart (Recharts)
│       ├── XAxis (formatted timestamp)
│       ├── YAxis (unit label)
│       ├── Tooltip (custom formatted)
│       ├── Legend
│       └── Line (strokeColor per metric)
└── LoadingOverlay (skeleton while fetching)
```

---

### `RuleFormModal.tsx`
Multi-step form for creating automation rules.

```
RuleFormModal (React Hook Form + Zod)
├── Step 1: Rule Name + Enable toggle
├── Step 2: Trigger Builder
│   ├── TriggerTypeSelect (Telemetry / Schedule / Status)
│   ├── [Telemetry]: DeviceSelect → MetricSelect → OperatorSelect → ThresholdInput
│   ├── [Schedule]: SchedulePicker (cron visual builder)
│   └── [Status]: DeviceSelect → StatusSelect
├── Step 3: Action Builder
│   ├── ActionTypeSelect (Device Command / Send Alert / AI Summary)
│   ├── [Device Command]: DeviceSelect → CommandBuilder
│   └── [Alert]: MessageInput
└── Step 4: Review + Submit
```

---

### `AIChat.tsx`
Conversational interface for AI device assistant.

```
AIChat
├── MessageList (scrollable)
│   ├── UserMessage bubble
│   └── AIMessage bubble (with typing indicator)
├── ContextBanner (currently selected device context, if any)
└── ChatInput
    ├── TextArea (multi-line)
    └── SendButton (disabled while loading)
```

**State:** Local `useState` for messages array (no Redux — ephemeral chat state)

---

### `useSocket.ts` Hook

```typescript
// Usage example
const { isConnected, lastEvent } = useSocket({
  events: {
    'device:update': (data) => dispatch(updateDeviceTelemetry(data)),
    'device:status': (data) => dispatch(updateDeviceStatus(data)),
    'alert:new':     (data) => dispatch(addAlert(data)),
  }
});
```

Manages Socket.IO connection lifecycle: connect on mount, cleanup on unmount, re-connects on auth.

---

## 🔀 React Router Structure

```typescript
<BrowserRouter>
  <Routes>
    {/* Public routes */}
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* Protected routes */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/"               element={<DashboardPage />} />
        <Route path="/devices/:id"    element={<DeviceDetailPage />} />
        <Route path="/control"        element={<ControlPanelPage />} />
        <Route path="/automation"     element={<AutomationPage />} />
        <Route path="/analytics"      element={<AnalyticsPage />} />
        <Route path="/ai"             element={<AIAssistantPage />} />
        <Route path="/alerts"         element={<AlertsPage />} />
        <Route path="/map"            element={<MapViewPage />} />
        <Route path="/api-keys"       element={<ApiKeysPage />} />
        <Route path="/settings"       element={<SettingsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</BrowserRouter>
```

---

## 🗃️ Redux Store Slices

| Slice            | State Shape                                          |
|------------------|------------------------------------------------------|
| `authSlice`      | `{ user, accessToken, isAuthenticated, loading }`    |
| `devicesSlice`   | `{ devices[], selectedDevice, loading, error }`      |
| `controlSlice`   | `{ commandHistory[], pendingCommands{} }`            |
| `telemetrySlice` | `{ dataByDevice{}, dateRange, granularity }`         |
| `rulesSlice`     | `{ rules[], loading, error }`                        |
| `alertsSlice`    | `{ alerts[], unreadCount, loading }`                 |

---

> 📁 Related Docs: `ARCHITECTURE.md` · `BLUEPRINT.md` · `API_DESIGN.md`
