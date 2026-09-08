import { getBackendBaseUrl } from "../../utils/apiConfig";
// src/pages/performance/Parameters.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import MachineSelector from "../../partials/parameters/MachineParametersCard";
import ParameterChart from "../../partials/charts/parameters/ParameterChart";
import CustomToggle from "../../partials/parameters/CustomToggle";
import axios from "axios";
import {
  MdTune,
  MdInfo,
  MdChecklist,
  MdRefresh,
  MdAccessTime,
  MdCalendarToday,
  MdShowChart,
  MdLayers,
  MdFilterAlt,
} from "react-icons/md";
import { getShiftLetter } from "../../utils/shiftUtils";

const defaultData = [
  {
    group: "Pressure",
    icon: "⚡",
    subParameters: [
      {
        name: "Injection Pressure",
        unit: "bar",
        steps: [
          { label: "Injection Pressure Step 1", active: true },
          { label: "Injection Pressure Step 2", active: true },
          { label: "Injection Pressure Step 3", active: false },
          { label: "Injection Pressure Step 4", active: false },
        ],
      },
      {
        name: "Holding Pressure",
        unit: "bar",
        steps: [
          { label: "Holding Pressure Step 1", active: false },
          { label: "Holding Pressure Step 2", active: false },
          { label: "Holding Pressure Step 3", active: false },
          { label: "Holding Pressure Step 4", active: false },
        ],
      },
      {
        name: "Dosing Back Pressure",
        unit: "bar",
        steps: [
          { label: "Dosing Back Pressure Step 1", active: false },
          { label: "Dosing Back Pressure Step 2", active: false },
          { label: "Dosing Back Pressure Step 3", active: false },
        ],
      },
    ],
  },
  {
    group: "Speed",
    icon: "🚀",
    subParameters: [
      {
        name: "Injection Speed",
        unit: "mm/s",
        steps: [
          { label: "Injection Speed Step 1", active: false },
          { label: "Injection Speed Step 2", active: false },
          { label: "Injection Speed Step 3", active: false },
          { label: "Injection Speed Step 4", active: false },
        ],
      },
      {
        name: "Dosing Speed",
        unit: "mm/s",
        steps: [
          { label: "Dosing Speed Step 1", active: false },
          { label: "Dosing Speed Step 2", active: false },
          { label: "Dosing Speed Step 3", active: false },
          { label: "Dosing Speed Actual", active: false },
        ],
      },
    ],
  },
  {
    group: "Temperature",
    icon: "🌡️",
    subParameters: [
      {
        name: "Barrel Temperature",
        unit: "°C",
        steps: [
          { label: "Barrel Temperature Actual Nozzle", active: false },
          { label: "Barrel Temperature Actual Zone 1", active: false },
          { label: "Barrel Temperature Actual Zone 2", active: false },
          { label: "Barrel Temperature Actual Zone 3", active: false },
          { label: "Barrel Temperature Actual Zone 4", active: false },
          { label: "Barrel Temperature Actual Zone 5", active: false },
        ],
      },
      {
        name: "Oil Temperature",
        unit: "°C",
        steps: [{ label: "Oil Temperature Actual", active: false }],
      },
      {
        name: "Hot Runner Temperature",
        unit: "°C",
        steps: [
          { label: "Hot Runner Zone 1", active: false },
          { label: "Hot Runner Zone 2", active: false },
          { label: "Hot Runner Zone 3", active: false },
          { label: "Hot Runner Zone 4", active: false },
          { label: "Hot Runner Zone 5", active: false },
          { label: "Hot Runner Zone 6", active: false },
          { label: "Hot Runner Zone 7", active: false },
          { label: "Hot Runner Zone 8", active: false },
          { label: "Hot Runner Zone 9", active: false },
          { label: "Hot Runner Zone 10", active: false },
        ],
      },
    ],
  },
  {
    group: "Time",
    icon: "⏱️",
    subParameters: [
      {
        name: "Injection & Cycle Time",
        unit: "sec",
        steps: [
          { label: "Injection Time", active: false },
          { label: "Cycle Time", active: false },
          { label: "Dosing Time", active: false },
        ],
      },
      {
        name: "Cascade Delay Time",
        unit: "sec",
        steps: [
          { label: "Cascade Injection Delay Time 1", active: false },
          { label: "Cascade Injection Delay Time 2", active: false },
          { label: "Cascade Injection Delay Time 3", active: false },
          { label: "Cascade Injection Delay Time 4", active: false },
          { label: "Cascade Injection Delay Time 5", active: false },
          { label: "Cascade Injection Delay Time 6", active: false },
          { label: "Cascade Injection Delay Time 7", active: false },
          { label: "Cascade Injection Delay Time 8", active: false },
        ],
      },
    ],
  },
  {
    group: "Position",
    icon: "📏",
    subParameters: [
      {
        name: "Injection Position",
        unit: "mm",
        steps: [
          { label: "Injection Position for Speed 1", active: false },
          { label: "Injection Position for Speed 2", active: false },
          { label: "Injection Position for Speed 3", active: false },
          { label: "Injection Position for Speed 4", active: false },
          { label: "Switch Over Position", active: false },
          { label: "Melt Cushion", active: false },
        ],
      },
    ],
  },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

export default function Parameters() {
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(0);
  const [parameters, setParameters] = useState(defaultData);
  const [activeCategory, setActiveCategory] = useState("Pressure");

  // Filtering state - default dynamically to live shift and current date
  const [filters, setFilters] = useState(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      date: today,
      shift: getShiftLetter(),
      startTime: "",
      endTime: "",
    };
  });

  const [apiData, setApiData] = useState({});
  const [loadingChart, setLoadingChart] = useState(false);
  const [hasDataPoints, setHasDataPoints] = useState(null);

const BASE_URL = getBackendBaseUrl();

  // Active steps across all groups
  const activeSteps = useMemo(() => {
    const list = [];
    parameters.forEach((group) => {
      group.subParameters.forEach((sub) => {
        sub.steps.forEach((step) => {
          if (step.active) {
            list.push({
              ...step,
              unit: sub.unit || "",
              group: group.group,
            });
          }
        });
      });
    });
    return list;
  }, [parameters]);

  const activeLabels = useMemo(() => activeSteps.map((s) => s.label), [activeSteps]);

  // 1. Fetch live production date & shift from backend
  useEffect(() => {
    const fetchLiveDate = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/PerformanceHome/GetProdDate`);
        const item = res.data?.data || (Array.isArray(res.data) ? res.data[0] : null);
        if (item) {
          const rawDate = item.ProdDate
            ? new Date(item.ProdDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];
          const shiftName = item.ShiftName || getShiftLetter();
          setFilters((f) => ({
            ...f,
            date: rawDate,
            shift: shiftName,
          }));
        }
      } catch (err) {
        console.warn("Could not fetch live prod date, falling back to current local shift:", err);
        setFilters((f) => ({
          ...f,
          shift: getShiftLetter(),
        }));
      }
    };
    fetchLiveDate();
  }, [BASE_URL]);

  // 2. Fetch machine list
  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/MachineParameter/GetShibauraMachine`);
        if (response.data?.success && Array.isArray(response.data.data)) {
          const machineNames = response.data.data.map((m) => ({
            id: m.EquipmentID,
            name: m.EquipmentName,
          }));
          setMachines(machineNames);
        }
      } catch (error) {
        console.error("Error fetching machines:", error);
      }
    };
    fetchMachines();
  }, [BASE_URL]);

  const formatLiteralTime = (rawTs) => {
    if (!rawTs) return "";
    if (typeof rawTs === "string") {
      if (rawTs.includes("T")) {
        return rawTs.split("T")[1].slice(0, 8);
      }
      if (rawTs.includes(" ")) {
        return rawTs.split(" ")[1].slice(0, 8);
      }
      return rawTs.slice(0, 8);
    }
    const d = new Date(rawTs);
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    const s = String(d.getUTCSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  // Transform rows to fast lookup series
  const buildApiSeries = (rows = []) => {
    const out = {};
    rows.forEach((r) => {
      const pName = r.ParamName;
      if (!out[pName]) {
        out[pName] = { labels: [], values: [], unit: r.Unit || "" };
      }
      const timeStr = formatLiteralTime(r.Timestamp);
      out[pName].labels.push(timeStr);
      out[pName].values.push(Number(r.ParameterValue));
    });
    return out;
  };

  // Fetch telemetry
  const fetchTelemetry = useCallback(
    async (labels = activeLabels) => {
      if (!filters.date || !machines[selectedMachine] || labels.length === 0) {
        setApiData({});
        setHasDataPoints(null);
        return;
      }

      setLoadingChart(true);
      try {
        const params = {
          MachineID: machines[selectedMachine].id,
          ProdDate: filters.date,
          ParameterList: labels.join(","),
        };

        if (!filters.startTime && !filters.endTime && filters.shift) {
          params.ShiftName = filters.shift;
        }
        if (filters.startTime) params.StartTime = filters.startTime;
        if (filters.endTime) params.EndTime = filters.endTime;

        const query = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/MachineParameter/GetMachineParameterTrendByTime?${query}`;

        const response = await axios.get(url);
        if (response.data?.success && Array.isArray(response.data.data) && response.data.data.length > 0) {
          const series = buildApiSeries(response.data.data);
          setApiData(series);
          setHasDataPoints(true);
        } else {
          setApiData({});
          setHasDataPoints(false);
        }
      } catch (err) {
        console.error("Error querying machine telemetry:", err);
        setApiData({});
        setHasDataPoints(false);
      } finally {
        setLoadingChart(false);
      }
    },
    [filters, machines, selectedMachine, activeLabels, BASE_URL]
  );

  // Auto re-query on filter / machine change
  useEffect(() => {
    if (machines.length > 0 && filters.date && activeLabels.length > 0) {
      fetchTelemetry(activeLabels);
    }
  }, [selectedMachine, filters.date, filters.shift, filters.startTime, filters.endTime, machines, activeLabels]);

  // Toggle step handler
  const handleToggle = (stepLabel) => {
    setParameters((prev) =>
      prev.map((g) => ({
        ...g,
        subParameters: g.subParameters.map((sub) => ({
          ...sub,
          steps: sub.steps.map((s) =>
            s.label === stepLabel ? { ...s, active: !s.active } : s
          ),
        })),
      }))
    );
  };

  // Select all in subcategory
  const handleSelectAllSub = (subName) => {
    setParameters((prev) =>
      prev.map((g) => ({
        ...g,
        subParameters: g.subParameters.map((sub) => {
          if (sub.name !== subName) return sub;
          const allActive = sub.steps.every((s) => s.active);
          return {
            ...sub,
            steps: sub.steps.map((s) => ({ ...s, active: !allActive })),
          };
        }),
      }))
    );
  };

  // Quick Preset Handlers
  const handleSetPreset = (presetType) => {
    setParameters((prev) =>
      prev.map((g) => ({
        ...g,
        subParameters: g.subParameters.map((sub) => ({
          ...sub,
          steps: sub.steps.map((s) => {
            if (presetType === "injection") {
              return { ...s, active: s.label.includes("Injection Pressure") || s.label.includes("Injection Speed") };
            }
            if (presetType === "temperature") {
              return { ...s, active: s.label.includes("Barrel Temperature") || s.label.includes("Oil Temperature") };
            }
            if (presetType === "clear") {
              return { ...s, active: false };
            }
            return s;
          }),
        })),
      }))
    );
  };

  const currentMachine = machines[selectedMachine] || { name: "Loading machine...", id: "" };

  // Calculate live stats from apiData
  const stats = useMemo(() => {
    let totalPoints = 0;
    let minVal = Infinity;
    let maxVal = -Infinity;
    let sumVal = 0;

    Object.values(apiData).forEach((entry) => {
      if (Array.isArray(entry.values)) {
        entry.values.forEach((v) => {
          if (typeof v === "number" && !isNaN(v)) {
            totalPoints++;
            sumVal += v;
            if (v < minVal) minVal = v;
            if (v > maxVal) maxVal = v;
          }
        });
      }
    });

    return {
      totalPoints,
      min: minVal === Infinity ? 0 : minVal.toFixed(1),
      max: maxVal === -Infinity ? 0 : maxVal.toFixed(1),
      avg: totalPoints > 0 ? (sumVal / totalPoints).toFixed(1) : 0,
    };
  }, [apiData]);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdTune className="text-purple-400" size={24} />
              <span>Machine Telemetry & Parameter Curves</span>
            </h1>
            
          </div>

          <div className="flex items-center gap-2">
            {loadingChart ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <span className="animate-spin text-sm">⚡</span>
                <span>Streaming PLC Telemetry...</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Feed Synchronized</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Filter Bar */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Date & Shift Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Input */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#101216] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#262c3a]">
                <MdCalendarToday size={14} className="text-purple-400" />
                <span className="text-xs text-gray-400 font-medium">Date:</span>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                  className="bg-transparent text-xs text-gray-900 dark:text-white font-mono focus:outline-none cursor-pointer"
                />
              </div>

              {/* Shift Quick Buttons */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#101216] p-1 rounded-xl border border-gray-200 dark:border-[#262c3a]">
                <span className="text-[11px] text-gray-400 px-2 font-medium">Shift:</span>
                {[
                  { id: "A", label: "Shift A (07:00-15:30)" },
                  { id: "B", label: "Shift B (15:30-00:00)" },
                  { id: "C", label: "Shift C (00:00-07:00)" },
                  { id: "", label: "Full Day" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, shift: s.id, startTime: "", endTime: "" }))}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      filters.shift === s.id && !filters.startTime && !filters.endTime
                        ? "bg-purple-600 text-white shadow-xs"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {s.id ? `Shift ${s.id}` : "Full Day"}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Time Range Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#101216] px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#262c3a] text-xs">
                <MdAccessTime size={15} className="text-cyan-500 shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 font-medium">From:</span>
                <select
                  value={filters.startTime}
                  onChange={(e) => setFilters((f) => ({ ...f, startTime: e.target.value, shift: "" }))}
                  className="bg-white dark:bg-[#1c202a] text-slate-800 dark:text-slate-100 font-mono text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 dark:border-[#333a4a] focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="">--:--</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={`from-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <span className="text-gray-500 dark:text-gray-400 font-medium ml-1">To:</span>
                <select
                  value={filters.endTime}
                  onChange={(e) => setFilters((f) => ({ ...f, endTime: e.target.value, shift: "" }))}
                  className="bg-white dark:bg-[#1c202a] text-slate-800 dark:text-slate-100 font-mono text-xs font-semibold px-2 py-1 rounded-lg border border-gray-300 dark:border-[#333a4a] focus:ring-1 focus:ring-purple-500 focus:outline-none cursor-pointer"
                >
                  <option value="">--:--</option>
                  {TIME_OPTIONS.map((t) => (
                    <option key={`to-${t}`} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {(filters.startTime || filters.endTime) && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, startTime: "", endTime: "", shift: getShiftLetter() }))}
                  className="px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                >
                  ✕ Reset Time
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Machine Selector Ribbon */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-4 shadow-xs">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
            <span>Select Machine Telemetry Channel</span>
            <span className="text-emerald-400 font-mono normal-case">
              Active Channel: {currentMachine.name} ({currentMachine.id})
            </span>
          </div>
          <MachineSelector
            machines={machines.map((m) => m.name)}
            selected={selectedMachine}
            onSelect={setSelectedMachine}
          />
        </div>

        {/* Notice banner if 0 points recorded */}
        {hasDataPoints === false && (
          <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
            <MdInfo size={20} className="shrink-0 text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block mb-1">
                No telemetry recorded for {currentMachine.name} on {filters.date} (Shift {filters.shift || "All"}).
              </span>
              <p className="text-amber-300/80">
                Machines with live sensor data logged on this date include:
                <span className="font-semibold text-white ml-1">
                  L&T 180T (Shibaura), Shibaura 1000T-1, Shibaura 1000T-2, Shibaura 150T, Shibaura 350T-1.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MASTER TELEMETRY CHART STAGE (Full-Width, 60 FPS, Lag-Free)        */}
        {/* =================================================================== */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-gray-200 dark:border-[#222632]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Live Parameter Curve Waveform
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-bold">
                {activeSteps.length} Active Signal{activeSteps.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400">Presets:</span>
              <button
                type="button"
                onClick={() => handleSetPreset("injection")}
                className="px-2.5 py-1 bg-gray-100 dark:bg-[#20242e] hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold text-gray-300 transition-colors"
              >
                Injection Phase
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("temperature")}
                className="px-2.5 py-1 bg-gray-100 dark:bg-[#20242e] hover:bg-purple-600 hover:text-white rounded-lg text-xs font-semibold text-gray-300 transition-colors"
              >
                Temperatures
              </button>
              <button
                type="button"
                onClick={() => handleSetPreset("clear")}
                className="px-2.5 py-1 text-gray-400 hover:text-rose-400 rounded-lg text-xs transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* The High-Speed Parameter Line Chart */}
          <ParameterChart
            parameterData={activeSteps}
            apiData={apiData}
            height={380}
          />

          {/* Waveform Statistics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-[#222632] text-xs">
            <div className="bg-gray-50 dark:bg-[#121419] p-2.5 rounded-xl border border-gray-200 dark:border-[#20242e]">
              <span className="text-[10px] text-gray-400 block">Telemetry Readings</span>
              <span className="font-mono font-bold text-gray-200 text-sm">{stats.totalPoints.toLocaleString()}</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#121419] p-2.5 rounded-xl border border-gray-200 dark:border-[#20242e]">
              <span className="text-[10px] text-gray-400 block">Peak Recorded</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{stats.max}</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#121419] p-2.5 rounded-xl border border-gray-200 dark:border-[#20242e]">
              <span className="text-[10px] text-gray-400 block">Minimum Value</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{stats.min}</span>
            </div>
            <div className="bg-gray-50 dark:bg-[#121419] p-2.5 rounded-xl border border-gray-200 dark:border-[#20242e]">
              <span className="text-[10px] text-gray-400 block">Mean Average</span>
              <span className="font-mono font-bold text-purple-400 text-sm">{stats.avg}</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* PARAMETER SELECTION STUDIO DOCK                                     */}
        {/* =================================================================== */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-gray-200 dark:border-[#222632]">
            {parameters.map((cat) => (
              <button
                key={cat.group}
                type="button"
                onClick={() => setActiveCategory(cat.group)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeCategory === cat.group
                    ? "bg-purple-600 text-white shadow-md shadow-purple-950/40"
                    : "bg-gray-100 dark:bg-[#121419] text-gray-400 hover:text-white hover:bg-white/5 border border-gray-200 dark:border-[#222632]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.group}</span>
              </button>
            ))}
          </div>

          {/* Sub-parameters for Active Category */}
          {parameters
            .filter((cat) => cat.group === activeCategory)
            .map((cat) => (
              <div key={cat.group} className="space-y-4">
                {cat.subParameters.map((sub) => {
                  const activeCount = sub.steps.filter((s) => s.active).length;
                  const allActive = sub.steps.every((s) => s.active);

                  return (
                    <div
                      key={sub.name}
                      className="bg-gray-50 dark:bg-[#121419] border border-gray-200 dark:border-[#20242e] rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {sub.name}
                          </span>
                          {activeCount > 0 && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-semibold">
                              {activeCount} plotting
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectAllSub(sub.name)}
                          className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <MdChecklist size={14} />
                          <span>{allActive ? "Clear Subgroup" : "Select Subgroup"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                        {sub.steps.map((step) => (
                          <CustomToggle
                            key={step.label}
                            label={step.label}
                            unit={sub.unit}
                            active={step.active}
                            onClick={() => handleToggle(step.label)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
