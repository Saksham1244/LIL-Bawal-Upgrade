import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import {
  MdArrowBack,
  MdWarning,
  MdInfoOutline,
  MdSpeed,
  MdTimer,
  MdCheckCircle,
  MdOutlinePrecisionManufacturing,
  MdOpenInNew,
  MdRefresh,
} from "react-icons/md";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

export default function MachineDrillDown() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [drillData, setDrillData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDrillDown = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/performance/machine-cockpit/${encodeURIComponent(machineId || "MC-1000T")}/drilldown`);
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
  }, [machineId]);

  if (loading) {
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

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-8">
        {/* SECTION 1: HEADER & BACK ACTION */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/machine-cockpit")}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-colors cursor-pointer"
              title="Back to Machine Cockpit"
            >
              <MdArrowBack size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/alarms")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <MdWarning size={15} className="text-amber-500" />
              <span>Alarm Center</span>
            </button>
            <button
              type="button"
              onClick={fetchDrillDown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <MdRefresh size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: ACTIVE ALERT BANNER (IF ACTIVE ALARM / DOWN) */}
        {d.activeAlert?.isActive && (
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
          {/* LEFT: PRODUCTION & CYCLE */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-800">
                  Production & Cycle
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Current shift
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">EXPECTED</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.expected ?? 0} pcs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">ACTUAL</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.actual ?? 0} pcs
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">GOOD</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.good ?? 0} pcs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">REJECTED</span>
                  <span className="text-xs font-black text-rose-600 font-mono">
                    {d.productionCycle?.rejected ?? 0} pcs ({d.productionCycle?.rejectionRate || "0%"})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">STANDARD CYCLE</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.stdCycle || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">AVERAGE CYCLE</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.avgCycle || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">ENERGY</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.energy || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">SPEED</span>
                  <span className="text-xs font-black text-slate-800 font-mono">
                    {d.productionCycle?.speed || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TODAY'S DOWNTIME BLOCKS */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold text-slate-800">
                  Today's Downtime Blocks
                </h2>
                <span className="text-[11px] text-slate-400 block">
                  {d.downtimeBlocks?.summary}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate("/downtime")}
                className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-0.5 cursor-pointer"
              >
                <span>Open analysis</span>
                <MdArrowBack className="rotate-180" size={13} />
              </button>
            </div>

            {/* TIMELINE VISUAL BAR */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold text-slate-500 font-mono w-16 truncate shrink-0">
                  {d.name || "Machine"}
                </span>

                {/* VISUAL STRIP */}
                <div className="flex-1 h-5 bg-slate-200/80 rounded flex overflow-hidden relative">
                  {/* Event Blocks */}
                  <div className="w-[15%] h-full bg-emerald-500/20"></div>
                  <div className="w-[12%] h-full bg-rose-600" title="Machine Failure (55m)"></div>
                  <div className="w-[20%] h-full bg-emerald-500/20"></div>
                  <div className="w-[10%] h-full bg-indigo-600" title="Electrical / Sensor (47m)"></div>
                  <div className="w-[10%] h-full bg-emerald-500/20"></div>
                  <div className="w-[25%] h-full bg-rose-600 relative" title="Machine Failure (2h 15m ongoing)">
                    <span className="text-[9px] font-bold text-white px-1 leading-none absolute left-1 top-1">
                      Machine
                    </span>
                  </div>
                  <div className="w-[8%] h-full bg-slate-100"></div>

                  {/* Red 'NOW' needle marker */}
                  <div className="absolute right-[8%] top-0 bottom-0 w-0.5 bg-rose-600 flex flex-col items-center">
                    <span className="text-[8px] font-bold text-rose-600 absolute -bottom-3">now</span>
                  </div>
                </div>
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
                        No downtime events recorded today
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* LEFT: ALARMS LOG */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-slate-800">
                Alarms
              </h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Most recent first
              </span>
            </div>

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
                        No active or recorded alarms for this machine
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

          {/* RIGHT: 4M LOSSES */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>4M Losses</span>
                  <MdInfoOutline className="text-slate-400" size={13} />
                </h2>
                <span className="text-[10px] font-bold text-slate-400">
                  Today · minutes lost per category
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {d.losses4M?.map((cat, idx) => (
                  <div key={idx}>
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
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>Total Loss: <strong className="text-slate-800 font-mono">189m (3h 09m)</strong></span>
              <span>Dominant Category: <strong className="text-rose-600 font-mono">Machine (75%)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
