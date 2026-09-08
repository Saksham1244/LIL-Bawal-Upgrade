import { getBackendBaseUrl } from "../../../utils/apiConfig";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../partials/DashboardLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
const HCHistory = () => {
  const navigate = useNavigate();

  // date range state
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  // chart state + loading/error
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [chartError, setChartError] = useState(null);

  // stats state + loading/error
  const [stats, setStats] = useState([
    { label: "Average Time of HC", value: "-" },
    { label: "Max Time of HC", value: "-" },
    { label: "Min Time of HC", value: "-" },
    { label: "Total No of HC", value: "-" },
    { label: "On Time HC", value: "-" },
    { label: "Delayed HC", value: "-" },
  ]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  // HC table state
  const [hcTableData, setHcTableData] = useState([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableError, setTableError] = useState(null);
  // ---- MOULD DROPDOWN STATES ----
  const [mouldList, setMouldList] = useState([]);
  const [selectedMould, setSelectedMould] = useState("");
  const [loadingMould, setLoadingMould] = useState(false);

  // BASE for API — uses Vite env or fallback to the host you shared
const BASE = getBackendBaseUrl();
  const HC_CHART_ENDPOINT = `${BASE}/MouldMaintenanceHistoryhc/hcPlannedVsActualCustom`;
  const HC_TIME_ENDPOINT = `${BASE}/MouldMaintenanceHistoryhc/hcTimeDetails`;
  const HC_DELAY_ENDPOINT = `${BASE}/MouldMaintenanceHistoryhc/hcDelayOnTime`;
  const HC_HISTORY_DETAIL_ENDPOINT = `${BASE}/MouldMaintenanceHistoryhc/hcistoryDetailTable`;
  const MOULD_LIST_ENDPOINT = `${BASE}/MouldSummary/MouldName`;

  // helper: normalize date to yyyy-mm-dd for query
  const toISODate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const formatFriendlyDate = (isoString) => {
    if (!isoString) return "";
    try {
      const dt = new Date(isoString);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const d = String(dt.getDate()).padStart(2, "0");
      const hh = String(dt.getHours()).padStart(2, "0");
      const mm = String(dt.getMinutes()).padStart(2, "0");
      return `${y}-${m}-${d} ${hh}:${mm}`;
    } catch {
      return isoString;
    }
  };

  // -----------------------
  // Fetch chart data from API
  // -----------------------
  const fetchHcChart = async (start, end) => {
    setLoadingChart(true);
    setChartError(null);
    try {
      let url = HC_CHART_ENDPOINT;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];

      const mapped = (rows || []).map((r) => ({
        date: r.WorkDate,
        plan: Number(r.PlannedCount ?? 0),
        actual: Number(r.ActualCount ?? 0),
      }));

      setChartData(mapped);
    } catch (err) {
      console.error("Failed to load HC Planned vs Actual:", err);
      setChartError("Failed to load chart data. Check backend or network.");
      setChartData([]);
    } finally {
      setLoadingChart(false);
    }
  };

  // -----------------------
  // Fetch HC time stats (hcTimeDetails)
  // -----------------------
  const fetchTimeStats = async (start, end) => {
    try {
      let url = HC_TIME_ENDPOINT;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const first = rows && rows.length ? rows[0] : null;

      const averageTime = first?.AverageTimeHC ?? 0;
      const maxTime = first?.MaxHCDuration ?? 0;
      const minTime = first?.MinHCDuration ?? 0;
      const total = first?.NumberOfHC ?? 0;

      return {
        averageTime: Number.isFinite(Number(averageTime)) ? Number(averageTime) : 0,
        maxTime: Number.isFinite(Number(maxTime)) ? Number(maxTime) : 0,
        minTime: Number.isFinite(Number(minTime)) ? Number(minTime) : 0,
        totalHC: Number.isFinite(Number(total)) ? Number(total) : 0,
      };
    } catch (err) {
      console.error("Failed to load HC time details:", err);
      throw err;
    }
  };

  // -----------------------
  // Fetch HC delay stats (hcDelayOnTime)
  // -----------------------
  const fetchDelayStats = async (start, end) => {
    try {
      let url = HC_DELAY_ENDPOINT;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];
      const first = rows && rows.length ? rows[0] : null;

      const onTime = first?.OnTimeCount ?? 0;
      const delayed = first?.DelayedCount ?? 0;

      return {
        onTime: Number.isFinite(Number(onTime)) ? Number(onTime) : 0,
        delayed: Number.isFinite(Number(delayed)) ? Number(delayed) : 0,
      };
    } catch (err) {
      console.error("Failed to load HC delay details:", err);
      return { onTime: 0, delayed: 0 };
    }
  };
  //mould dropdown
  useEffect(() => {
    fetchMouldList();
  }, []);

  const fetchMouldList = async () => {
    setLoadingMould(true);
    try {
      const res = await axios.get(MOULD_LIST_ENDPOINT);
      const rows = res?.data?.data ?? [];
      setMouldList(rows);
    } catch (err) {
      console.error("Failed to load mould list:", err);
      setMouldList([]);
    } finally {
      setLoadingMould(false);
    }
  };
  // -----------------------
  // Fetch HC detail table (hcistoryDetailTable)
  // -----------------------
  const fetchHcDetails = async (start, end, mouldID = "") => {
    setLoadingTable(true);
    setTableError(null);
    try {
      let url = HC_HISTORY_DETAIL_ENDPOINT;
      const qs = [];
      if (start) qs.push(`startDate=${encodeURIComponent(start)}`);
      if (end) qs.push(`endDate=${encodeURIComponent(end)}`);
      if (mouldID) qs.push(`mouldID=${encodeURIComponent(mouldID)}`);
      if (qs.length) url += `?${qs.join("&")}`;

      const res = await axios.get(url);
      const rows = res?.data?.data ?? [];

      const mapped = (rows || []).map((r, idx) => ({
        key: idx,
        checkListID: r.CheckListID ?? "",
        checkListName: r.CheckListName ?? "",
        mouldID: r.MouldID,
        mouldName: r.MouldName ?? "",
        materialName: r.MaterialName ?? "",
        userId: r.UserID ?? "",
        userName: r.userName ?? "",
        hcStatus: r.HCStatus ?? "",
        instance: r.Instance ?? "",
        remark: r.Remark ?? "",
        startTime: r.StartTime ?? "",
        endTime: r.EndTime ?? "",
        hcDuration: r.HCDuration ?? 0,
        atMouldLife: r.AtMouldLife ?? "",
      }));

      setHcTableData(mapped);
    } catch (err) {
      console.error("Failed to load HC history detail table:", err);
      setTableError("Failed to load HC details");
      setHcTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  // -----------------------
  // When user clicks Apply -> fetch chart + time stats + delay stats + details table
  // -----------------------
  const applyFilter = async () => {
    if (!rangeStart) {
      alert("Please select a start date.");
      return;
    }
    const start = toISODate(rangeStart);
    const end = rangeEnd ? toISODate(rangeEnd) : "";

    setLoadingStats(true);
    setStatsError(null);
    setLoadingChart(true);
    setChartError(null);

    try {
      // fetch chart, timeStats and delayStats in parallel
      const [, timeStats, delayStats] = await Promise.all([
        fetchHcChart(start, end),
        fetchTimeStats(start, end),
        fetchDelayStats(start, end),
      ]);

      // fetch details table (parallel but separate)
      fetchHcDetails(start, end, selectedMould);

      // update stats UI
      const newStats = [
        { label: "Average Time of HC", value: timeStats.averageTime ?? 0 },
        { label: "Max Time of HC", value: timeStats.maxTime ?? 0 },
        { label: "Min Time of HC", value: timeStats.minTime ?? 0 },
        { label: "Total No of HC", value: timeStats.totalHC ?? 0 },
        { label: "On Time HC", value: delayStats.onTime ?? 0 },
        { label: "Delayed HC", value: delayStats.delayed ?? 0 },
      ];
      setStats(newStats);
    } catch (err) {
      console.error("Error fetching combined HC data:", err);
      setStatsError("Failed to load stats");
    } finally {
      setLoadingStats(false);
      setLoadingChart(false);
    }
  };
  useEffect(() => {
    if (rangeStart) {
      const start = toISODate(rangeStart);
      const end = rangeEnd ? toISODate(rangeEnd) : "";
      fetchHcDetails(start, end, selectedMould);
    }
  }, [selectedMould]);
  return (
    <DashboardLayout>
      <div className="p-6 w-full text-gray-800">
        {/* TOP SECTION */}
        <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl shadow mb-6">
          {/* BUTTONS */}
          <div className="flex gap-3 flex-wrap">
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldMaintenanceHistory")}>PM</button>
            <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow" onClick={() => navigate("/HCHistory")}>HC</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/MouldBreakdownHistory")}>Breakdown</button>
            <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow" onClick={() => navigate("/SparePartHistory")}>Spare Part</button>
          </div>

          {/* DATE FILTER */}
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <div>
              <label className="block text-sm font-semibold">Start Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg shadow-sm w-40" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold">End Date</label>
              <input type="date" className="border px-3 py-2 rounded-lg shadow-sm w-40" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>

            <button className="bg-gray-900 text-white px-4 mt-5 py-2 rounded-lg shadow hover:bg-gray-700" onClick={applyFilter}>Apply</button>
          </div>
        </div>

        {/* CHART */}
        <div className="w-full h-80 bg-white rounded-xl shadow-md p-8 mb-10">
          <h3 className="font-semibold text-center mb-2 text-black">PM Plan Vs Actual</h3>
          {loadingChart ? (
            <div className="flex items-center justify-center h-full">Loading chart...</div>
          ) : chartError ? (
            <div className="text-red-600">{chartError}</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="plan" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Planned" />
                <Bar dataKey="actual" fill="#F97316" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {loadingStats ? (
            <div className="col-span-3 bg-white shadow rounded-xl p-5 flex items-center justify-center">Loading stats...</div>
          ) : statsError ? (
            <div className="col-span-3 text-red-600">{statsError}</div>
          ) : (
            stats.map((item, index) => (
              <div key={index} className="bg-white shadow rounded-xl p-5 flex flex-col items-center justify-center">
                <h3 className="text-lg font-semibold text-gray-700">{item.label}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{item.value}</p>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">

          {/* Header + Dropdown Row */}
          <div className="flex justify-between items-center mb-6">

            {/* Left Title */}
            <h3 className="text-2xl font-semibold text-black">
              Mould PM Details
            </h3>

            {/* Right Dropdown */}
            <div className="flex items-center gap-3">
              <label className="text-lg font-semibold whitespace-nowrap text-black">
                Select Mould Name
              </label>

              <div className="min-w-[300px]">
                <Select
                  options={mouldList.map((m) => ({
                    value: m.MouldID,
                    label: m.MouldName,
                  }))}

                  value={
                    selectedMould
                      ? {
                        value: selectedMould,
                        label:
                          mouldList.find((m) => m.MouldID === selectedMould)
                            ?.MouldName || "",
                      }
                      : null
                  }

                  onChange={(selectedOption) =>
                    setSelectedMould(selectedOption ? selectedOption.value : "")
                  }

                  isLoading={loadingMould}
                  isClearable
                  placeholder="Type to search mould..."

                  menuPortalTarget={document.body}   // 🔥 important
                  menuPosition="fixed"               // 🔥 important

                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>
          </div>
          {loadingTable ? (
            <div className="p-6 flex items-center justify-center">Loading HC details...</div>
          ) : tableError ? (
            <div className="text-red-600 p-4">{tableError}</div>
          ) : (
            // fixed-height scrollable wrapper with horizontal and vertical scrollbars
            <div style={{ maxHeight: 420, overflow: "auto" }}>
              <div style={{ minWidth: 1200 }}>
                <table className="w-full border-collapse">
                  <thead className="bg-gray-900 text-white text-xs">
                    <tr>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Checklist</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Instance</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Mould Name</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Material Name</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">User</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">HC Status</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Duration (min)</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">At Mould Life</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Start Time</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 z-10">Remark</th>
                      <th className="p-3 border whitespace-nowrap sticky top-0 bg-blue-700 text-white z-10">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {hcTableData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-4 text-center text-gray-600">No HC history found for selected range.</td>
                      </tr>
                    ) : (
                      hcTableData.map((row, index) => (
                        <tr key={row.key ?? index} className="text-center border">
                          <td className="p-3 border text-left whitespace-nowrap text-center font-medium text-black">{row.checkListName}</td>
                          <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{row.instance}</td>
                          <td className="p-3 border whitespace-nowrap text-center font-medium text-black">{row.mouldName}</td>
                          <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{row.materialName}</td>
                          <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{row.userName || "-"}</td>
                          <td className="p-3 border whitespace-nowrap text-center  font-medium text-black">{row.hcStatus}</td>
                          <td className="p-3 border whitespace-nowrap text-center font-medium text-black">{row.hcDuration}</td>
                          <td className="p-3 border whitespace-nowrap text-center font-medium text-black">{row.atMouldLife ?? "-"}</td>
                          <td className="p-3 border whitespace-nowrap text-center font-medium text-black">{formatFriendlyDate(row.startTime)}</td>
                          <td className="p-3 border text-left whitespace-nowrap text-center font-medium text-black">{row.remark || "-"}</td>
                          <td className="p-3 border whitespace-nowrap text-center font-medium text-black">
                            {/* Action button - navigates to PMCheckPointReport with parameters */}
                            <button
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              //   onClick={() => navigate(`/HCCheckPointReport?checkListName=${encodeURIComponent(row.checkListName)}&mouldName=${encodeURIComponent(row.mouldName)}&instance=${encodeURIComponent(row.instance)}`)}
                              onClick={() =>
                                navigate(
                                  `/HCCheckPointReport?checkListID=${row.checkListID}
&instance=${row.instance}
&mouldID=${row.mouldID}
&checkListName=${encodeURIComponent(row.checkListName)}
&mouldName=${encodeURIComponent(row.mouldName)}
&materialName=${encodeURIComponent(row.materialName)}
&atMouldLife=${row.atMouldLife}
&userName=${encodeURIComponent(row.userName)}`
                                )
                              }
                            >

                              View Report
                            </button>
                          </td>
                        </tr>
                      ))
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

export default HCHistory;
