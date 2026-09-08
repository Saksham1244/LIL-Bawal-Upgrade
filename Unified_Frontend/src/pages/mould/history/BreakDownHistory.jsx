import { getBackendBaseUrl } from "../../../utils/apiConfig";
// src/pages/BreakDownHistory.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../../partials/DashboardLayout";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";

// ---------------- MAIN COMPONENT ----------------
const BreakDownHistory = () => {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // chart data comes from API now
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState(null);

  // Top reasons (now API-driven)
  const [top10Reasons, setTop10Reasons] = useState([]);
  const [loadingTop10, setLoadingTop10] = useState(false);
  const [top10Error, setTop10Error] = useState(null);

  // calculated stats from backend
  const [stats, setStats] = useState([
    { label: "Total Breakdown Duration", value: "-" },
    { label: "Longest Duration", value: "-" },
    { label: "Mould Max BreakDown", mould: "-", duration: "-" },
    { label: "Mould Min BreakDown", mould: "-", duration: "-" },
  ]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // table data now dynamic from API
  const [tableData, setTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);

  // use the uploaded file path you provided — tooling will transform into a served URL
  const SAMPLE_IMAGE_URL = "/mnt/data/ff1c851d-0558-42c3-b3f3-e42ab1834d18.png";

  // ---------------- HELPERS ----------------
  const toISODate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    try {
      const dt = new Date(iso);
      // return readable local date/time
      return dt.toLocaleString();
    } catch (e) {
      return iso;
    }
  };

  // ---------------- API Endpoints ----------------
const BASE = getBackendBaseUrl();
  const BREAKDOWN_DURATION_ENDPOINT = `${BASE}/MouldMaintenanceHistoryBreakdownCalDetails/BreakdownDuration`;
  const BREAKDOWN_COUNT_ENDPOINT = `${BASE}/MouldMaintenanceHistoryBreakdownCalDetails/BreakdownCount`;
  const BREAKDOWN_CALC_ENDPOINT = `${BASE}/MouldMaintenanceHistoryBreakdownCalDetails/BreakdownCalculatedDetails`;
  const TOP10_DURATION_ENDPOINT = `${BASE}/MouldMaintenanceHistoryBreakdownCalDetails/Top10BreakdownByDuration`;
  const BREAKDOWN_DETAILS_ENDPOINT = `${BASE}/MouldMaintenanceHistoryBreakdownCalDetails/BreakdownDetailsTable`;

  // ---------------- Fetch & Merge Metrics ----------------
  const fetchBreakdownMetrics = async (start, end) => {
    setLoadingChart(true);
    setChartError(null);

    try {
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      const qStr = qs.length ? `?${qs.join("&")}` : "";

      const [durRes, cntRes] = await Promise.all([
        axios.get(`${BREAKDOWN_DURATION_ENDPOINT}${qStr}`),
        axios.get(`${BREAKDOWN_COUNT_ENDPOINT}${qStr}`),
      ]);

      const durRows = durRes?.data?.data ?? [];
      const cntRows = cntRes?.data?.data ?? [];

      const map = new Map();

      durRows.forEach((r) => {
        const key = String(r.Label);
        map.set(key, {
          date: key,
          Duration: Number(r.BreakdownSum ?? 0),
          Occurence: 0,
        });
      });

      cntRows.forEach((r) => {
        const key = String(r.Label);
        const existing = map.get(key);
        if (existing) {
          existing.Occurence = Number(r.BreakdownCount ?? 0);
        } else {
          map.set(key, {
            date: key,
            Duration: 0,
            Occurence: Number(r.BreakdownCount ?? 0),
          });
        }
      });

      const merged = Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
      setChartData(merged);
    } catch (err) {
      console.error("Failed to load breakdown metrics:", err);
      setChartError("Failed to load breakdown charts. Check backend or network.");
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  // ---------------- Fetch Top10 Reasons ----------------
  const fetchTop10Reasons = async (start, end) => {
    setLoadingTop10(true);
    setTop10Error(null);

    try {
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      const qStr = qs.length ? `?${qs.join("&")}` : "";

      const res = await axios.get(`${TOP10_DURATION_ENDPOINT}${qStr}`);
      const rows = res?.data?.data ?? [];

      // Map API -> { reason, Duration }
      const mapped = (rows || []).map((r) => ({
        reason: r.Reason ?? "-",
        Duration: Number(r.TotalDuration ?? 0),
      }));

      setTop10Reasons(mapped);
    } catch (err) {
      console.error("Failed to load Top10BreakdownByDuration:", err);
      setTop10Error("Failed to load top reasons chart.");
      setTop10Reasons([]);
    } finally {
      setLoadingTop10(false);
    }
  };

  // ---------------- Fetch Calculated Summary ----------------
  const fetchCalculatedStats = async (start, end) => {
    setLoadingStats(true);
    setStatsError(null);

    try {
      let url = BREAKDOWN_CALC_ENDPOINT;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const first = rows && rows.length ? rows[0] : null;

      const totalBD = first?.TotalBD ?? null;
      const numberOfBD = first?.NumberOfBD ?? null;
      const longest = first?.LongestBDDuration ?? null;
      const maxMould = first?.MaxBD_MouldName ?? null;
      const minMould = first?.MinBD_MouldName ?? null;

      const newStats = [
        { label: "Total Breakdown Duration", value: totalBD != null ? totalBD : "-" },
        { label: "Number of Breakdowns", value: numberOfBD != null ? numberOfBD : "-" },
        { label: "Mould Max BreakDown", mould: maxMould || "-", duration: longest != null ? longest : "-" },
        { label: "Mould Min BreakDown", mould: minMould || "-", duration: "-" },
      ];

      setStats(newStats);
    } catch (err) {
      console.error("Failed to load BreakdownCalculatedDetails:", err);
      setStatsError("Failed to load summary stats");
      setStats([
        { label: "Total Breakdown Duration", value: "-" },
        { label: "Number of Breakdowns", value: "-" },
        { label: "Mould Max BreakDown", mould: "-", duration: "-" },
        { label: "Mould Min BreakDown", mould: "-", duration: "-" },
      ]);
    } finally {
      setLoadingStats(false);
    }
  };

  // ---------------- Fetch Breakdown Details (for table) ----------------
  const fetchBreakdownDetails = async (start, end) => {
    setLoadingTable(true);
    setTableError(null);

    try {
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      const qStr = qs.length ? `?${qs.join("&")}` : "";

      const res = await axios.get(`${BREAKDOWN_DETAILS_ENDPOINT}${qStr}`);
      const rows = res?.data?.data ?? [];

      // Map API output to table rows expected by your UI
      const mapped = (rows || []).map((r, idx) => ({
        BreakDownID: idx + 1,
        Reason: r.BDReason ?? "-",
        Remark: r.BDRemark ?? "-",
        MouldName: r.MouldName ?? "-",
        StartTime: formatDateTime(r.BDStartTime),
        EndTime: formatDateTime(r.BDEndTime),
        Duration: r.BDDuration != null ? `${r.BDDuration} min` : "-",
      }));

      setTableData(mapped);
    } catch (err) {
      console.error("Failed to load BreakdownDetailsTable:", err);
      setTableError("Failed to load breakdown details table.");
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // ---------------- FILTER & APPLY ----------------
  const getGroupingMode = (start, end) => {
    if (!start || !end) return "day";
    const s = new Date(start);
    const e = new Date(end);
    if (s.toDateString() === e.toDateString()) return "shift";
    const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) return "day";
    return "month";
  };

  const applyFilter = async () => {
    if (!rangeStart || !rangeEnd) {
      alert("Please select both start & end date.");
      return;
    }

    const start = toISODate(rangeStart);
    const end = toISODate(rangeEnd);

    // fetch charts + top10 + stats + table in parallel
    await Promise.all([
      fetchBreakdownMetrics(start, end),
      fetchTop10Reasons(start, end),
      fetchCalculatedStats(start, end),
      fetchBreakdownDetails(start, end),
    ]);
  };

  // Dynamic X Axis Key (keeps existing behaviour)
  const grouping = getGroupingMode(rangeStart, rangeEnd);

  return (
    <DashboardLayout>
      <div className="p-4 w-full">
        {/* ---------------------- FILTER BAR ---------------------- */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/MouldMaintenanceHistory")}>PM</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/HCHistory")}>HC</button>
            <button className="px-6 py-2 rounded-lg bg-red-600 text-white" onClick={() => navigate("/MouldBreakdownHistory")}>Breakdown</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white" onClick={() => navigate("/SparePartHistory")}>Spare Part</button>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-semibold">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg w-40"
                value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold">End Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg w-40"
                value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>

            <button className="bg-gray-900 text-white px-4 mt-5 py-2 rounded-lg" onClick={applyFilter}>
              Apply
            </button>
          </div>
        </div>

        {/* ---------------------- CHART ---------------------- */}
        <div className="grid grid-cols-1 gap-5 mt-10">
          {/* Duration Chart */}
          <div className="h-80 bg-white rounded-xl shadow-md p-10 ml-10 mb-10">
             <h3 className="font-semibold text-center mb-2 text-black">Breakdown Duration</h3>
            {loadingChart ? (
              <div className="flex items-center justify-center h-full">Loading chart...</div>
            ) : chartError ? (
              <div className="text-red-600">{chartError}</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                    width={80}
                    tickMargin={10}
                  />
                  <Tooltip />
                  <Bar dataKey="Duration" fill="#4b81abff" barSize={35} radius={[5, 5, 5, 5]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Occurrence Chart */}
          <div className="h-90 bg-white rounded-xl shadow-md p-8 ml-10 mb-10">
            <h3 className="font-semibold text-center mb-2 text-black">Breakdown Occurrence</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }}
                  width={80}
                  tickMargin={10}
                />
                <Tooltip />
                <Bar dataKey="Occurence" fill="#f97316" barSize={35} radius={[5, 5, 5, 5]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ---------------------- SUMMARY CARDS ---------------------- */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {loadingStats ? (
            <div className="col-span-4 bg-white shadow rounded-xl p-5 flex items-center justify-center">Loading summary...</div>
          ) : statsError ? (
            <div className="col-span-4 text-red-600">{statsError}</div>
          ) : (
            stats.map((item, index) => (
              <div key={index} className="bg-white shadow rounded-xl p-3 text-center">
                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>

                {item.mould ? (
                  <div className="mt-2">
                    <p className="text-2xl font-bold text-black">{item.mould}</p>
                    <p className="text-xl font-semibold text-blue-700">{item.duration}</p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold mt-2 text-black">{item.value}</p>
                )}
              </div>
            ))
          )}
        </div>

        {/* ---------------------- TOP 10 BAR (Now API-driven) ---------------------- */}
        <div className="bg-white shadow-md rounded-md p-2 mb-4">
          <h3 className="font-semibold mb-2 text-center text-black">Top 10 Breakdown By Duration</h3>

          {loadingTop10 ? (
            <div className="p-6 text-center">Loading top reasons...</div>
          ) : top10Error ? (
            <div className="p-4 text-red-600">{top10Error}</div>
          ) : (
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={top10Reasons}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#000000ff", fontWeight: "bold" }} />
                <YAxis dataKey="reason" type="category" tick={{ fontSize: 13, fill: "#000000ff", fontWeight: "bold" }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Duration" fill="#2f72bd" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ---------------------- TABLE ---------------------- */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-10">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 text-center">Breakdown Details Table</h3>

          {loadingTable ? (
            <div className="p-6 flex items-center justify-center">Loading table...</div>
          ) : tableError ? (
            <div className="p-4 text-red-600">{tableError}</div>
          ) : (
            <div style={{ maxHeight: 420, overflow: "auto" }}>   {/* <-- SCROLL ADDED */}
              <div style={{ minWidth: 1200 }}>
                <table className="w-full border-collapse">   {/* <-- FIXED WIDTH TABLE */}
                  <thead className="bg-blue-900 text-white text-xs">
                    <tr>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">BreakDownID</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">BreakDown Reason</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">BreakDown Remark</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Mould Name</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Start Time</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">End Time</th>
                      <th className="p-2 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((r, index) => (
                      <tr key={index} className="hover:bg-gray-100">
                        <td className="p-2 border text-center font-medium text-black">{r.BreakDownID}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.Reason}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.Remark}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.MouldName}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.StartTime}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.EndTime}</td>
                        <td className="p-2 border text-center font-medium text-black">{r.Duration}</td>
                      </tr>
                    ))}
                    {tableData.length === 0 && (
                      <tr>
                        <td colSpan="7" className="p-4 text-center text-gray-600">
                          No breakdown details for selected range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>


      </div>
    </DashboardLayout>
  );
};

export default BreakDownHistory;
