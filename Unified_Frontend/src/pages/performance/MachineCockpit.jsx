import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import {
  MdOutlinePrecisionManufacturing,
  MdViewModule,
  MdViewList,
  MdRefresh,
  MdSearch,
  MdArrowForward,
  MdCheckCircle,
  MdWarning,
  MdInfoOutline,
} from "react-icons/md";

const BASE = getBackendBaseUrl();

export default function MachineCockpit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("view") === "compact" ? "compact" : "detailed";

  const [viewMode, setViewMode] = useState(initialMode); // "detailed" or "compact"
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL", "RUNNING", "DOWN"
  const [searchQuery, setSearchQuery] = useState("");
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCockpitData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/performance/machine-cockpit/summary`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMachines(res.data.data);
      }
    } catch (err) {
      console.warn("Error fetching machine cockpit data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCockpitData();
  }, []);

  const filteredMachines = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return machines.filter((m) => {
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "RUNNING" && m.status.toLowerCase() === "running") ||
        (statusFilter === "DOWN" && m.status.toLowerCase() === "down");

      const matchQuery =
        !q ||
        m.name?.toLowerCase().includes(q) ||
        m.subtitle?.toLowerCase().includes(q) ||
        m.currentJob?.toLowerCase().includes(q) ||
        m.mould?.name?.toLowerCase().includes(q) ||
        m.mould?.description?.toLowerCase().includes(q);

      return matchStatus && matchQuery;
    });
  }, [machines, statusFilter, searchQuery]);

  const runningCount = machines.filter((m) => m.status.toLowerCase() === "running").length;
  const downCount = machines.filter((m) => m.status.toLowerCase() === "down").length;

  const getMetricBadgeClass = (val) => {
    const num = Number(val) || 0;
    if (num >= 85) return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (num >= 70) return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-rose-50 text-rose-700 border border-rose-200";
  };

  const isMouldLoaded = (mould, currentJob) => {
    const name = mould?.description || mould?.name || currentJob || "";
    if (!name || name === "Standard Production Mould" || name.toLowerCase().includes("no mould")) {
      return false;
    }
    return true;
  };

  const getMouldDisplayName = (mould, currentJob) => {
    if (!isMouldLoaded(mould, currentJob)) {
      return "No mould loaded";
    }
    return mould?.description || mould?.name || currentJob;
  };

  const getLeftBorderColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "running") return "border-l-4 border-l-emerald-500";
    if (s === "down") return "border-l-4 border-l-rose-500";
    return "border-l-4 border-l-amber-500";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-8">
        {/* SECTION 1: CORPORATE HEADER & CONTROLS */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs shrink-0">
              <MdOutlinePrecisionManufacturing size={22} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                Machine Cockpit — Live Telemetry
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode("detailed")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "detailed"
                    ? "bg-white text-[#0284c7] shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MdViewModule size={15} />
                <span>Detailed Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "compact"
                    ? "bg-white text-[#0284c7] shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <MdViewList size={15} />
                <span>Compact Live</span>
              </button>
            </div>

            {/* STATUS FILTER PILLS */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-[#0284c7] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                All ({machines.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("RUNNING")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === "RUNNING"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Running ({runningCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DOWN")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  statusFilter === "DOWN"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                <span>Down ({downCount})</span>
              </button>
            </div>

            {/* SEARCH BOX */}
            <div className="relative w-full sm:w-56">
              <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search machines or moulds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={fetchCockpitData}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <MdRefresh size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: MACHINE CARDS GRID */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400 shadow-2xs">
            Loading machine cockpit telemetry...
          </div>
        ) : filteredMachines.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400 shadow-2xs">
            No machines match the selected filter.
          </div>
        ) : viewMode === "detailed" ? (
          /* ======================================================================= */
          /* TIER 2: DETAILED COCKPIT CARDS (IMAGE 1 & 3)                           */
          /* ======================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMachines.map((machine) => {
              const isRunning = machine.status.toLowerCase() === "running";

              return (
                <div
                  key={machine.id}
                  className={`bg-white rounded-xl border border-slate-200 p-4 shadow-2xs transition-all hover:shadow-md ${getLeftBorderColor(
                    machine.status
                  )}`}
                >
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                        {machine.name}
                      </h2>
                      
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isRunning
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isRunning ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        ></span>
                        <span>{isRunning ? "Running" : "Down"}</span>
                      </span>

                      {machine.activeAlarmsCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                          {machine.activeAlarmsCount} active alarm
                        </span>
                      )}
                    </div>
                  </div>

                  {/* MOULD LOADED ROW */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mt-3 text-xs flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0">
                      MOULD LOADED
                    </span>
                    <span
                      className={`font-mono text-xs truncate ${
                        isMouldLoaded(machine.mould, machine.currentJob)
                          ? "font-bold text-slate-700"
                          : "font-medium text-slate-400 italic"
                      }`}
                      title={getMouldDisplayName(machine.mould, machine.currentJob)}
                    >
                      {getMouldDisplayName(machine.mould, machine.currentJob)}
                    </span>
                  </div>

                  {/* PRODUCTION SECTION */}
                  <div className="mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                      PRODUCTION
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">EXPECTED</span>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {machine.production?.expected ?? 0} pcs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">ACTUAL</span>
                        <span className="text-xs font-black text-slate-800 font-mono">
                          {machine.production?.actual ?? 0} pcs
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">REJECTED</span>
                        <span
                          className={`text-xs font-black font-mono ${
                            Number(machine.production?.rejected) > 0 ? "text-rose-600" : "text-slate-400"
                          }`}
                        >
                          {machine.production?.rejected ?? 0} pcs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PERFORMANCE SECTION (4 MINI CARDS) */}
                  <div className="mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                      PERFORMANCE
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <div
                        className={`p-1.5 rounded-lg text-center ${getMetricBadgeClass(
                          machine.performance?.oee
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold opacity-80">
                          <span>OEE</span>
                          <MdInfoOutline size={10} />
                        </div>
                        <span className="text-xs font-black font-mono block mt-0.5">
                          {machine.performance?.oee ?? 0}%
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg text-center ${getMetricBadgeClass(
                          machine.performance?.availability
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold opacity-80">
                          <span>AVAIL.</span>
                          <MdInfoOutline size={10} />
                        </div>
                        <span className="text-xs font-black font-mono block mt-0.5">
                          {machine.performance?.availability ?? 0}%
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg text-center ${getMetricBadgeClass(
                          machine.performance?.performance
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold opacity-80">
                          <span>PERF.</span>
                          <MdInfoOutline size={10} />
                        </div>
                        <span className="text-xs font-black font-mono block mt-0.5">
                          {machine.performance?.performance ?? 0}%
                        </span>
                      </div>

                      <div
                        className={`p-1.5 rounded-lg text-center ${getMetricBadgeClass(
                          machine.performance?.quality
                        )}`}
                      >
                        <div className="flex items-center justify-center gap-0.5 text-[9px] font-bold opacity-80">
                          <span>QUAL.</span>
                          <MdInfoOutline size={10} />
                        </div>
                        <span className="text-xs font-black font-mono block mt-0.5">
                          {machine.performance?.quality ?? 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CURRENT STATE SECTION */}
                  <div className="mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                      CURRENT STATE
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">RUNNING SINCE</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {machine.currentState?.runningSince || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">OPERATING TIME</span>
                        <span className="text-xs font-bold text-slate-700 font-mono">
                          {machine.currentState?.operatingTime || "0h 00m"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block">DOWNTIME</span>
                        <span
                          className={`text-xs font-bold font-mono ${
                            machine.currentState?.downtime && machine.currentState.downtime !== "0m"
                              ? "text-rose-600"
                              : "text-slate-400"
                          }`}
                        >
                          {machine.currentState?.downtime || "0m"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ADDITIONAL SECTION */}
                  <div className="mt-3">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                      ADDITIONAL
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">ENERGY</span>
                        <span className="text-[11px] font-bold text-slate-700 font-mono">
                          {machine.additional?.energy ?? 0} kWh/kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">STD CYCLE</span>
                        <span className="text-[11px] font-bold text-slate-700 font-mono">
                          {machine.additional?.stdCycle ?? 0}s
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">AVG CYCLE</span>
                        <span className="text-[11px] font-bold text-slate-700 font-mono">
                          {machine.additional?.avgCycle ?? 0}s
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-semibold block">SPEED</span>
                        <span className="text-[11px] font-bold text-slate-700 font-mono">
                          {machine.additional?.speed ?? 0} CPH
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER ACTION */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        isMouldLoaded(machine.mould, machine.currentJob)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isMouldLoaded(machine.mould, machine.currentJob)
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      ></span>
                      <span>{getMouldDisplayName(machine.mould, machine.currentJob)}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(`/machine-cockpit/${encodeURIComponent(machine.id)}`)}
                      className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Drill down</span>
                      <MdArrowForward size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ======================================================================= */
          /* TIER 1: COMPACT LIVE STATUS CARDS (IMAGE 2)                            */
          /* ======================================================================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredMachines.map((machine) => {
              const isRunning = machine.status.toLowerCase() === "running";

              return (
                <div
                  key={machine.id}
                  onClick={() => navigate(`/machine-cockpit/${encodeURIComponent(machine.id)}`)}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs cursor-pointer transition-all hover:border-[#0284c7] hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* TOP ROW */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xs font-black text-slate-800 tracking-tight">
                          {machine.name}
                        </h2>
                        
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isRunning
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isRunning ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                          }`}
                        ></span>
                        <span>{isRunning ? "Running" : "Down"}</span>
                      </span>
                    </div>

                    {/* BIG OEE CALLOUT */}
                    <div className="mt-3">
                      <span className="text-2xl font-black text-slate-800 font-mono tracking-tight">
                        {machine.performance?.oee ?? 0}%
                      </span>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase ml-1">
                        OEE
                      </span>
                    </div>

                    {/* MINI STATS ROW */}
                    <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">PROD</span>
                        <span className="font-mono font-bold text-slate-700">
                          {machine.production?.actual ?? 0} / {machine.production?.expected ?? 0} pcs
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">DOWNTIME</span>
                        <span className="font-mono font-bold text-slate-700">
                          {machine.currentState?.downtime || "0m"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">REJ.</span>
                        <span className="font-mono font-bold text-slate-700">
                          {machine.production?.rejected ?? 0} pcs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border truncate max-w-[140px] ${
                        isMouldLoaded(machine.mould, machine.currentJob)
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-500 border-slate-200"
                      }`}
                    >
                      <span>{getMouldDisplayName(machine.mould, machine.currentJob)}</span>
                    </span>

                    <span className="text-[11px] font-bold text-[#0284c7] flex items-center gap-0.5">
                      <span>Open cockpit</span>
                      <MdArrowForward size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
