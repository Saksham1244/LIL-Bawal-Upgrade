# LIL Bawal - Unified Plant Performance & Mould Maintenance Suite

An enterprise manufacturing intelligence system combining Plant Head Overview, OEE & Performance Telemetry, Downtime Analytics, Machine Cockpit Monitoring, and Complete Mould Maintenance (PM, HC, Breakdown, Spares).

---

## 🏗 Architecture Overview

```
LIL-Bawal-Upgrade/
├── Unified_Frontend/         # React 18 + Vite + Tailwind CSS dashboard UI
├── Unified_Backend/          # Node.js + Express + SQL Server API (port 3010)
├── start_unified_system.bat  # Unified one-click runner for development
├── .gitignore                # Git ignore rules
└── README.md
```

---

## 🚀 Quick Start

### 1. Unified One-Click Launcher (Windows)
Double-click `start_unified_system.bat` to launch both Backend (port 3010) and Frontend (port 3000) simultaneously.

---

### 2. Manual Startup

#### Backend Setup
```bash
cd Unified_Backend
npm install
# Configure your .env from .env.example
npm run start # or node index.js
```
Runs at: `http://localhost:3010`

#### Frontend Setup
```bash
cd Unified_Frontend
npm install
# Configure your .env from .env.example
npm run dev
```
Runs at: `http://localhost:3000`

---

## 📊 Modules & Features

1. **Plant Head Executive Overview**: Plant-level OEE, Availability, Performance, Quality, Plan vs Actual, Achievement %, and Cross-Machine Matrix.
2. **Performance Telemetry**: Shift / Day / Week / Month / Custom OEE analytics, production volume vs takt time, good vs rejected trends.
3. **Downtime & Loss Analytics**: Plant machine-hours, 4M loss breakdown (Man, Machine, Material, Method), Top 5 downtime causes.
4. **Machine Cockpit & Drilldown**: Machine status, live telemetry, running moulds, active alarms, and loss analysis.
5. **Mould Maintenance Suite**:
   - **Mould 360**: Unified master register of all 158 moulds.
   - **PM Status & History**: Preventative maintenance scheduling, shot count thresholds, checkpoint audit reports with photo evidence.
   - **HC Status & History**: Health check tracking, 6-month forecast scheduler, recurring frequency tracking.
   - **Breakdown Records**: Failure logs, MTTR/MTBF analysis, root-cause tagging.
   - **Spare Parts Registry**: Real-time spares inventory, reorder level alerts, min/max thresholds, category filtering, and variable page sizes.
