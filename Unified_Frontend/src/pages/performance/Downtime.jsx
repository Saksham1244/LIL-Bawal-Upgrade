import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import UnifiedFilterBar from "../../partials/filters/UnifiedFilterBar";
import TopFiveDowntimeDurationChart from "../../partials/charts/downtime/TopFiveDowntimeDurationChart";
import TopFiveDowntimeOccurrenceChart from "../../partials/charts/downtime/TopFiveDowntimeOccurrenceChart";
import axios from "axios";
import {
  MdTimerOff,
  MdPauseCircle,
  MdPlayCircle,
  MdDoNotDisturbOn,
  MdTrendingDown,
  MdAccessTime,
} from "react-icons/md";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const baseURL = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

export default function Downtime() {
  const [filterMode, setFilterMode] = useState("DAY");
  const [operatingRunData, setOperatingRunData] = useState({});
  const [downtimeData, setDowntimeData] = useState({});
  const [idleTimeData, setIdleTimeData] = useState({});
  const [noProdData, setNoProdData] = useState({});
  const [top5DT, setTop5DT] = useState([]);
  const [machines, setMachines] = useState([]);

  // Fetch downtime data from SQL Server
  const fetchData = async (params = { Mode: filterMode }) => {
    try {
      const [runRes, dtRes, idleRes, noProdRes, top5Res] = await Promise.all([
        axios.get(`${baseURL}/DowntimeHome/GetOperatingRunningTime`, { params }),
        axios.get(`${baseURL}/DowntimeHome/GetTotalDowntime`, { params }),
        axios.get(`${baseURL}/DowntimeHome/GetPlantIdleTime`, { params }),
        axios.get(`${baseURL}/DowntimeHome/GetNoProductionTime`, { params }),
        axios.get(`${baseURL}/DowntimeHome/GetPlantTop5Downtimes`, { params }),
      ]);

      setOperatingRunData(runRes.data?.data?.[0] || {});
      setDowntimeData(dtRes.data?.data?.[0] || {});
      setIdleTimeData(idleRes.data?.data?.[0] || {});
      setNoProdData(noProdRes.data?.data?.[0] || {});
      setTop5DT(top5Res.data?.data || []);
    } catch (error) {
      console.error("API Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchData({ Mode: filterMode });
  }, [filterMode]);

  const handleFilterChange = ({ mode, shift, startDate, endDate }) => {
    setFilterMode(mode);
    fetchData({
      Mode: mode,
      StartDate: startDate || "",
      EndDate: endDate || "",
    });
  };

  // Metric computations:
  // Note: OperatingTime, RunningTime, and TotalDownTime from SQL telemetry are measured in SECONDS.
  const operatingTimeSec = Number(operatingRunData?.OperatingTime) || 0;
  const runningTimeSec = Number(operatingRunData?.RunningTime) || 0;
  const totalDowntimeSec = Number(downtimeData?.TotalDownTime) || 0;

  // Idle time = Operating Time - Running Time - Total Downtime
  const idleTimeSec = Math.max(
    0,
    operatingTimeSec > 0
      ? operatingTimeSec - runningTimeSec - totalDowntimeSec
      : Number(idleTimeData?.TotalIdleTime_Min || idleTimeData?.TotalIdleTime || 0) * 60
  );

  const runRatio = operatingTimeSec > 0 ? Math.round((runningTimeSec / operatingTimeSec) * 100) : 80;
  const noProdHours = Number(noProdData?.NoProductionTime) || 0;

  // Donut chart data
  const runPie = [
    { name: "Running Time", value: runningTimeSec, color: "#10B981" },
    { name: "Operating Gap", value: Math.max(0, operatingTimeSec - runningTimeSec), color: "#222632" },
  ];

  const dtPie = [
    { name: "Downtime", value: totalDowntimeSec, color: "#F43F5E" },
    { name: "Available Time", value: Math.max(0, operatingTimeSec - totalDowntimeSec), color: "#222632" },
  ];

  const idlePie = [
    { name: "Idle Time", value: idleTimeSec, color: "#F59E0B" },
    { name: "Production Time", value: Math.max(0, operatingTimeSec), color: "#222632" },
  ];

  const noProdPie = [
    { name: "No Prod Hours", value: noProdHours || 1, color: noProdHours > 0 ? "#8B5CF6" : "#222632" },
    { name: "Scheduled Hours", value: Math.max(0, 24 - noProdHours), color: "#10B981" },
  ];

  // Helper to format seconds into clean hours and minutes (e.g. 52,408s -> 14h 33m)
  const formatSeconds = (sec) => {
    if (!sec || isNaN(sec)) return "0h 0m";
    const totalSecs = Math.max(0, Math.round(Number(sec)));
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Helper to format seconds into minutes with unit label (e.g. 52,408s -> 873 m)
  const formatSecondsToMins = (sec) => {
    if (!sec || isNaN(sec)) return "0 m";
    const mins = Math.round(Number(sec) / 60);
    return `${mins.toLocaleString()} m`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdTimerOff className="text-amber-500" size={24} />
              <span>Downtime & Loss Analytics</span>
            </h1>
            
          </div>
        </div>

        {/* Global Filter Bar */}
        <UnifiedFilterBar
          selectedMode={filterMode}
          onFilterChange={handleFilterChange}
        />

        {/* 4 Revamped Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Operating vs Running Time */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Operating vs Run Time
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                  {runRatio}%
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                <MdPlayCircle size={13} />
                Active Run
              </span>
            </div>

            <div className="h-36 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={runPie} cx="50%" cy="50%" innerRadius={42} outerRadius={58} dataKey="value" stroke="none">
                    {runPie.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-emerald-400 font-mono">{runRatio}%</span>
                <span className="text-[9px] text-gray-400 font-semibold">RUN RATIO</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#222632] text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Operating:</span>
                <strong className="font-mono text-gray-200">{formatSeconds(operatingTimeSec)}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Running:</span>
                <strong className="font-mono text-emerald-400">{formatSeconds(runningTimeSec)}</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Cumulative Downtime */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Total Downtime
                </span>
                <div className="text-2xl font-black text-rose-500 font-mono mt-1">
                  {formatSeconds(totalDowntimeSec)}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 flex items-center gap-1">
                <MdPauseCircle size={13} />
                Loss Event
              </span>
            </div>

            <div className="h-36 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dtPie} cx="50%" cy="50%" innerRadius={42} outerRadius={58} dataKey="value" stroke="none">
                    {dtPie.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-rose-400 font-mono">{formatSeconds(totalDowntimeSec)}</span>
                <span className="text-[9px] text-gray-400 font-semibold">TOTAL STOP</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#222632] text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Duration Mins:</span>
                <strong className="font-mono text-rose-400">{formatSecondsToMins(totalDowntimeSec)}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Loss Impact:</span>
                <strong className="font-mono text-amber-400">Shift Impact</strong>
              </div>
            </div>
          </div>

          {/* Card 3: Idle Time */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Total Idle Time
                </span>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                  {formatSeconds(idleTimeSec)}
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 flex items-center gap-1">
                <MdAccessTime size={13} />
                Standby
              </span>
            </div>

            <div className="h-36 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={idlePie} cx="50%" cy="50%" innerRadius={42} outerRadius={58} dataKey="value" stroke="none">
                    {idlePie.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-black text-amber-400 font-mono">{formatSeconds(idleTimeSec)}</span>
                <span className="text-[9px] text-gray-400 font-semibold">STANDBY</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#222632] text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Idle Total Mins:</span>
                <strong className="font-mono text-amber-400">{formatSecondsToMins(idleTimeSec)}</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Channel:</span>
                <strong className="font-mono text-gray-300">All Lines</strong>
              </div>
            </div>
          </div>

          {/* Card 4: No Production Time */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  No Production Time
                </span>
                <div className="text-2xl font-black text-purple-400 font-mono mt-1">
                  {noProdHours} hrs
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 flex items-center gap-1">
                <MdDoNotDisturbOn size={13} />
                Planned Stop
              </span>
            </div>

            <div className="h-36 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={noProdPie} cx="50%" cy="50%" innerRadius={42} outerRadius={58} dataKey="value" stroke="none">
                    {noProdPie.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-purple-400 font-mono">{noProdHours}h</span>
                <span className="text-[9px] text-gray-400 font-semibold">NO PROD</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-[#222632] text-xs space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Unplanned Hours:</span>
                <strong className="font-mono text-purple-400">{noProdHours} hrs</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Production Window:</span>
                <strong className="font-mono text-emerald-400">{24 - noProdHours} hrs</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Downtimes Section */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-[#222632]">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <MdTrendingDown size={18} className="text-rose-500" />
                <span>Top Five Plant Downtime Causes</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Breakdown by duration and incident occurrence count
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TopFiveDowntimeDurationChart data={top5DT} mode={filterMode} />
            <TopFiveDowntimeOccurrenceChart data={top5DT} mode={filterMode} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
