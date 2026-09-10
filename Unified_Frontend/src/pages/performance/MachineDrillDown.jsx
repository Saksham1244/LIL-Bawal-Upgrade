import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import {
  MdArrowBack,
  MdInfoOutline,
  MdRefresh,
  MdWarningAmber,
} from "react-icons/md";

const BASE = getBackendBaseUrl();

// Machines specified to NEVER raise alarms as per plant configuration
const NO_ALARM_MACHINES = [
  "JSW 1300T-1",
  "JSW 1300T-2",
  "CLF 190T",
  "BMC 550T",
  "BMC 650T",
  "CLF 400T",
  "FCS 350 T3",
];

const isNoAlarmMachine = (nameOrId) => {
  if (!nameOrId) return false;
  const clean = String(nameOrId).toUpperCase().replace(/[\s\-_]+/g, "");
  return NO_ALARM_MACHINES.some((m) => {
    const mClean = m.toUpperCase().replace(/[\s\-_]+/g, "");
    return clean === mClean || clean.includes(mClean) || mClean.includes(clean);
  });
};

export default function MachineDrillDown() {
  const { machineId } = useParams();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split("T")[0];
  const [period, setPeriod] = useState("Shift");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [shift, setShift] = useState("All");

  const [drillData, setDrillData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch live production date on mount to align with factory telemetry
  useEffect(() => {
    const fetchLiveDate = async () => {
      try {
        const res = await axios.get(`${BASE}/PerformanceHome/GetProdDate`);
        if (res.data?.success && res.data?.data) {
          const liveDate = res.data.data.ProdDate
            ? new Date(res.data.data.ProdDate).toISOString().split("T")[0]
            : todayStr;
          setStartDate(liveDate);
          setEndDate(liveDate);
        }
      } catch (err) {
        console.warn("Could not fetch live prod date in drill down:", err);
      }
    };
    fetchLiveDate();
  }, []);

  const fetchDrillDown = async () => {
    setLoading(true);
    try {
      const modeParam =
        period === "Shift"
          ? "SHIFT"
          : period === "Day"
          ? "DAY"
          : period === "Week"
          ? "WEEK"
          : period === "Month"
          ? "MONTH"
          : "DATE";

      const shiftParam =
        shift === "All"
          ? null
          : shift === "Shift 1"
          ? "A"
          : shift === "Shift 2"
          ? "B"
          : shift === "Shift 3"
          ? "C"
          : shift;

      const res = await axios.get(
        `${BASE}/performance/machine-cockpit/${encodeURIComponent(machineId || "MC-1000T")}/drilldown`,
        {
          params: {
            mode: modeParam,
            startDate,
            endDate,
            shift: shiftParam,
          },
        }
      );
      if (res.data?.success && res.data?.data) {
        setDrillData(res.data.data);
      }
    } catch (err) {
      console.warn("Error loading machine drill down:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrillDown();
  }, [machineId, period, startDate, endDate, shift]);

  const handlePeriodChange = (p) => {
    setPeriod(p);
    const now = new Date();
    const endStr = now.toISOString().split("T")[0];
    if (p === "Shift" || p === "Day") {
      setStartDate(endStr);
      setEndDate(endStr);
      if (p === "Day") setShift("All");
    } else if (p === "Week") {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(endStr);
    } else if (p === "Month") {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      setStartDate(past.toISOString().split("T")[0]);
      setEndDate(endStr);
    }
  };

  // Check if date difference exceeds 31 days (1 month)
  const isDateRangeExceedsMonth = () => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 31;
  };

  if (loading && !drillData) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl shadow-2xs">
          Loading detailed machine telemetry for {machineId}...
        </div>
      </DashboardLayout>
    );
  }

  const d = drillData || {};
  const isDown = d.status?.toLowerCase() === "down";

  // Check if this machine is specified to never raise alarms
  const machineName = d.name || machineId || "";
  const isNoAlarm = isNoAlarmMachine(machineName) || isNoAlarmMachine(d.equipmentID) || d.supportsAlarms === false;
  const supportsAlarms = !isNoAlarm;

  // 1-month alarm data retention notice condition
  const showRetentionWarning = supportsAlarms && (d.alarmRetentionExceeded || isDateRangeExceedsMonth());

  const totalLossMinutes = d.losses4M?.reduce((acc, c) => acc + (Number(c.minutes) || 0), 0) || d.totalLossMins || 0;
  const lossHours = Math.floor(totalLossMinutes / 60);
  const lossMinsRemainder = totalLossMinutes % 60;
  const dominantLossCat = d.dominantCategory || ([...(d.losses4M || [])].sort((a, b) => b.minutes - a.minutes)[0] || { category: "Machine", percentage: 0 });

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-8">
        {/* SECTION 1: HEADER & BACK ACTION */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/machine-cockpit")}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer shrink-0"
              title="Back to Machine Cockpit"
            >
              <MdArrowBack size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                  {d.name || machineId}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isDown
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isDown ? "bg-rose-500" : "bg-emerald-500 animate-pulse"
                    }`}
                  ></span>
                  <span>{d.status || "Running"}</span>
                </span>
                {!supportsAlarms && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                    No-Alarm Machine
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {d.subtitle || "Machine Deep Dive Telemetry"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDrillDown}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <MdRefresh size={15} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Updating..." : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* SECTION 1.5: FILTER BAR (Production Report Style: Start Date, End Date, Shift Selection) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs">
          {/* ROW 1: Period Tabs + Refresh */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                Telemetry Filter
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                — Select date range and shift for machine telemetry
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Period Toggle Pills */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 text-xs font-bold shadow-2xs">
                {["Shift", "Day", "Week", "Month", "Custom"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      period === p
                        ? "bg-[#0284c7] text-white shadow-xs font-black"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 2: Filter Inputs (Start Date, End Date, Shift) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            {/* 1. START DATE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                START DATE
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs focus-within:border-sky-500">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriod("Custom");
                  }}
                  className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                />
              </div>
            </div>

            {/* 2. END DATE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                END DATE
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs focus-within:border-sky-500">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriod("Custom");
                  }}
                  className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                />
              </div>
            </div>

            {/* 3. SHIFT */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                SHIFT
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs focus-within:border-sky-500">
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-xs font-bold cursor-pointer w-full pr-1"
                >
                  <option value="All">All Shifts</option>
                  <option value="Shift 1">Shift 1 (A)</option>
                  <option value="Shift 2">Shift 2 (B)</option>
                  <option value="Shift 3">Shift 3 (C)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACTIVE ALERT BANNER (ONLY FOR MACHINES THAT SUPPORT ALARMS AND HAVE AN ACTIVE ALARM) */}
        {supportsAlarms && d.activeAlert?.isActive && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-rose-600 text-white tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>Down</span>
              </span>
              <span className="text-xs font-bold text-slate-800">
                {d.activeAlert.message}
                <span className="text-slate-500 font-normal ml-1.5">
                  — since {d.activeAlert.since}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate(d.activeAlert.actionCenterLink || "/alarms")}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              View in Action Center
            </button>
          </div>
        )}

        {/* SECTION 3: 4 TOP BENCHMARK KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. OEE CARD */}
          <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-rose-500 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              <span>OEE</span>
              <MdInfoOutline size={14} />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black text-slate-800 font-mono">
                {d.kpis?.oee?.value ?? 0}%
              </span>
              <span className="text-xs font-bold text-rose-600 block mt-0.5">
                {d.kpis?.oee?.note}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {d.kpis?.oee?.label || "Overall Equipment Effectiveness"}
              </span>
            </div>
          </div>

          {/* 2. AVAILABILITY CARD */}
          <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-rose-500 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              <span>AVAILABILITY</span>
              <MdInfoOutline size={14} />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black text-slate-800 font-mono">
                {d.kpis?.availability?.value ?? 0}%
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {d.kpis?.availability?.downtime}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {d.kpis?.availability?.operating}
              </span>
            </div>
          </div>

          {/* 3. PERFORMANCE CARD */}
          <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-amber-500 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              <span>PERFORMANCE</span>
              <MdInfoOutline size={14} />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black text-slate-800 font-mono">
                {d.kpis?.performance?.value ?? 0}%
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {d.kpis?.performance?.cycleComparison}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {d.kpis?.performance?.speed}
              </span>
            </div>
          </div>

          {/* 4. QUALITY CARD */}
          <div className="bg-white rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
              <span>QUALITY</span>
              <MdInfoOutline size={14} />
            </div>
            <div className="mt-1">
              <span className="text-2xl font-black text-slate-800 font-mono">
                {d.kpis?.quality?.value ?? 0}%
              </span>
              <span className="text-xs font-bold text-slate-700 block mt-0.5">
                {d.kpis?.quality?.rejectionShare}
              </span>
              <span className="text-[11px] text-slate-400 font-medium block mt-1">
                {d.kpis?.quality?.label || "Good share of produced parts"}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 4: MIDDLE ROW (PRODUCTION & CYCLE + DOWNTIME BLOCKS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: PRODUCTION */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-800">
                  Production
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {period === "Shift" ? "Selected shift" : `${period} period`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    EXPECTED
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                      {(d.productionCycle?.expected ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">pcs</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/70">
                  <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    ACTUAL
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                      {(d.productionCycle?.actual ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-400">pcs</span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 rounded-xl p-3.5 border border-emerald-200/60">
                  <span className="text-[11px] font-extrabold uppercase text-emerald-600 tracking-wider block mb-1">
                    GOOD
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">
                      {(d.productionCycle?.good ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-600/70">pcs</span>
                  </div>
                </div>

                <div className="bg-rose-50/50 rounded-xl p-3.5 border border-rose-200/60">
                  <span className="text-[11px] font-extrabold uppercase text-rose-500 tracking-wider block mb-1">
                    REJECTED
                  </span>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                      {(d.productionCycle?.rejected ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-rose-500">pcs</span>
                    <span className="text-[11px] font-extrabold text-rose-600 bg-rose-100/80 px-1.5 py-0.5 rounded ml-auto">
                      {d.productionCycle?.rejectionRate || "0.0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DOWNTIME BLOCKS */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-800">
                  Downtime Blocks & Timeline
                </h2>
                <span className="text-[11px] text-slate-400 block">
                  {d.downtimeBlocks?.summary}
                </span>
              </div>
            </div>

            {/* TIMELINE VISUAL BAR */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 font-mono w-16 truncate shrink-0">
                  {d.name || "Machine"}
                </span>

                {/* DYNAMIC VISUAL STRIP (GANTT CHART) */}
                <div className="flex-1 h-6 bg-slate-200/80 rounded flex overflow-hidden relative shadow-inner">
                  {(!d.downtimeBlocks?.timelineEvents || d.downtimeBlocks.timelineEvents.length === 0) ? (
                    <div className="w-full h-full bg-emerald-500/25 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                      Continuous Running (No Downtime)
                    </div>
                  ) : (
                    d.downtimeBlocks.timelineEvents.map((block, idx) => (
                      <div
                        key={idx}
                        style={{ width: `${block.widthPct}%` }}
                        className={`h-full ${
                          block.type === "downtime"
                            ? "bg-rose-600 relative cursor-pointer hover:brightness-110"
                            : block.type === "running"
                            ? "bg-emerald-500/30 hover:bg-emerald-500/40"
                            : "bg-slate-100"
                        } transition-all`}
                        title={`${block.label} (${block.duration})`}
                      >
                        {block.type === "downtime" && block.widthPct > 8 && (
                          <span className="text-[9px] font-bold text-white px-1 leading-none absolute left-1 top-1.5 truncate max-w-full">
                            {block.label}
                          </span>
                        )}
                      </div>
                    ))
                  )}

                  {/* Red 'NOW' needle marker */}
                  <div
                    style={{
                      left: `${Math.min(96, Math.max(4, (((new Date().getHours() + new Date().getMinutes() / 60) - 6) / 8) * 100))}%`
                    }}
                    className="absolute top-0 bottom-0 w-0.5 bg-rose-600 flex flex-col items-center z-10 pointer-events-none"
                  >
                    <span className="text-[8px] font-bold text-rose-600 absolute -bottom-3.5 whitespace-nowrap">
                      now
                    </span>
                  </div>
                </div>
              </div>

              {/* TIMELINE TIME AXIS */}
              <div className="flex justify-between text-[9px] font-mono font-medium text-slate-400 pl-18 pr-1 pt-1">
                <span>06:00</span>
                <span>08:00</span>
                <span>10:00</span>
                <span>12:00</span>
                <span>14:00</span>
              </div>
            </div>

            {/* DOWNTIME EVENTS TABLE */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">TIME</th>
                    <th className="py-2 px-3">REASON</th>
                    <th className="py-2 px-3">DURATION</th>
                    <th className="py-2 px-3 text-right">LOSS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!d.downtimeBlocks?.events || d.downtimeBlocks.events.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-xs text-slate-400 font-medium">
                        No downtime events recorded for selected period
                      </td>
                    </tr>
                  ) : (
                    d.downtimeBlocks.events.map((ev, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-mono text-slate-600">{ev.time}</td>
                        <td className="py-2 px-3 font-medium text-slate-800 flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              ev.reasonType === "electrical" ? "bg-indigo-600" : "bg-rose-600"
                            }`}
                          ></span>
                          <span>{ev.reason}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-700">{ev.duration}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">{ev.loss}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 5: BOTTOM ROW (ALARMS + 4M LOSSES) */}
        {/* If machine NEVER raises alarm, Alarms card is REMOVED and 4M Losses expands to full width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {supportsAlarms && (
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xs font-bold text-slate-800">
                      Alarms Log
                    </h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Most recent first
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    Max 30D Retention
                  </span>
                </div>

                {/* 1-MONTH ALARM RETENTION WARNING BANNER */}
                {showRetentionWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-3 shadow-2xs flex items-start gap-2 text-amber-900 text-xs">
                    <MdWarningAmber size={17} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Alarm Data Retention Notice:</span> Alarm data retention is limited to 1 month (30 days). The selected date range exceeds 1 month; alarm records are restricted to the 30-day retention window.
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">TIME</th>
                        <th className="py-2 px-3">SEVERITY</th>
                        <th className="py-2 px-3">MESSAGE</th>
                        <th className="py-2 px-3">STATUS</th>
                        <th className="py-2 px-3 text-right">DURATION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!d.alarms || d.alarms.length === 0) ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs text-slate-400 font-medium">
                            No alarms recorded for this machine in the selected period
                          </td>
                        </tr>
                      ) : (
                        d.alarms.map((alm, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-mono text-slate-600">{alm.time}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  alm.severity === "Critical"
                                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                                    : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    alm.severity === "Critical" ? "bg-rose-500" : "bg-amber-500"
                                  }`}
                                ></span>
                                <span>{alm.severity}</span>
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{alm.message}</td>
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  alm.status === "Active"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full ${
                                    alm.status === "Active" ? "bg-rose-600 animate-pulse" : "bg-slate-400"
                                  }`}
                                ></span>
                                <span>{alm.status}</span>
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700">{alm.duration}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total alarms in window: <strong className="text-slate-700 font-mono">{d.alarms?.length || 0}</strong></span>
                <span>Active: <strong className="text-rose-600 font-mono">{d.alarms?.filter(a => a.status === "Active").length || 0}</strong></span>
              </div>
            </div>
          )}

          {/* 4M LOSSES CARD (Takes full 12 columns if machine never raises alarms; 6 columns if alarms are displayed) */}
          <div className={`${supportsAlarms ? "lg:col-span-6" : "lg:col-span-12"} bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>4M Losses Analysis</span>
                  <MdInfoOutline className="text-slate-400" size={13} />
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                  {period === "Shift" ? "Selected Shift" : `${period} Period`} · minutes lost per category
                </span>
              </div>

              {/* Responsive layout for 4M categories */}
              <div className={`mt-4 ${!supportsAlarms ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}`}>
                {d.losses4M?.map((cat, idx) => (
                  <div key={idx} className={!supportsAlarms ? "bg-slate-50/80 p-3 rounded-xl border border-slate-100" : ""}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700">{cat.category}</span>
                      <span className="font-mono font-bold text-slate-800">{cat.minutes}m</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(cat.percentage > 0 ? cat.percentage : 2, 2)}%`,
                          backgroundColor: cat.minutes > 0 ? cat.color : "#E2E8F0",
                        }}
                      ></div>
                    </div>
                    {!supportsAlarms && (
                      <span className="text-[10px] font-bold text-slate-400 block mt-1">
                        {cat.percentage}% of total loss
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>
                Total Loss:{" "}
                <strong className="text-slate-800 font-mono">
                  {totalLossMinutes}m {lossHours > 0 ? `(${lossHours}h ${lossMinsRemainder}m)` : ""}
                </strong>
              </span>
              <span>
                Dominant Category:{" "}
                <strong className="text-rose-600 font-mono">
                  {dominantLossCat.category} ({dominantLossCat.percentage || 0}%)
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
