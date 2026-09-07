// src/pages/MouldSummary.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import Select from "react-select";
// normalize BASE (remove trailing slash)
const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

const MouldSummary = () => {
  // ---------------- DROPDOWN + API STATE ----------------
  const [mouldList, setMouldList] = useState([]);
  const [selectedMould, setSelectedMould] = useState(""); // stores MouldName
  const [mouldInfo, setMouldInfo] = useState({ MouldID: "", MouldDesc: "" });

  // KPI data
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  // Breakdown charts data
  const [breakdownDuration, setBreakdownDuration] = useState([]); // {reason, duration}
  const [breakdownOccurrence, setBreakdownOccurrence] = useState([]); // {reason, count}
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Spare parts state (fetched from API)
  const [spareParts, setSpareParts] = useState([]); // { name, qty }
  const [loadingSpare, setLoadingSpare] = useState(false);
  const [spareError, setSpareError] = useState(null);

  // PM/HC OnTime vs Delayed data
  const [pmOnTimeData, setPmOnTimeData] = useState([]); // [{ month, OnTime, Delayed }]
  const [hcOnTimeData, setHcOnTimeData] = useState([]); // [{ month, OnTime, Delayed }]
  const [loadingOnTime, setLoadingOnTime] = useState(false);


  // Production History (Machine Wise Shot Count)
  const [productionData, setProductionData] = useState([]);
  const [loadingProduction, setLoadingProduction] = useState(false);

  // Machine dropdown + table states
  const [machineList, setMachineList] = useState([]);
  const [machineTableData, setMachineTableData] = useState([]);
  const [loadingMachineTable, setLoadingMachineTable] = useState(false);

  // ---------------- Machine Dropdown + Table ----------------
  const [selectedMachine, setSelectedMachine] = useState("");



  // ---------------- Fetch mould list on load ----------------
  useEffect(() => {
    const fetchMouldNames = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMouldList(res.data.data);
        } else {
          console.error("Invalid MouldName response", res.data);
        }
      } catch (err) {
        console.error("Error fetching MouldName list:", err);
      }
    };
    fetchMouldNames();
  }, []);

  // Helper date formatter
  const formatDate = (value) => {
    if (!value) return "--";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value; // return raw if not parseable
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper: group API rows into {month, OnTime, Delayed} array
  const groupOnTimeRows = (rows) => {
    // rows: expected objects containing MonthName or YearMonth and Remark ("OnTime"|"Delayed")
    const map = new Map();
    (Array.isArray(rows) ? rows : []).forEach((r) => {
      const monthKey = r.MonthName || r.YearMonth || r.month || "Unknown";
      const remark = (r.Remark || r.remark || "")
        .toString()
        .trim()
        .toLowerCase();
      if (!map.has(monthKey))
        map.set(monthKey, { month: monthKey, OnTime: 0, Delayed: 0 });
      const entry = map.get(monthKey);
      if (remark === "ontime" || remark === "on time") entry.OnTime += 1;
      else entry.Delayed += 1;
    });

    // Convert to array and sort by YearMonth if available (format 'YYYY/MM')
    const arr = Array.from(map.values());
    arr.sort((a, b) => {
      // try parse YearMonth
      const ay = (a.month || "").split("/").map(Number);
      const by = (b.month || "").split("/").map(Number);
      if (
        ay.length === 2 &&
        by.length === 2 &&
        !isNaN(ay[0]) &&
        !isNaN(by[0])
      ) {
        if (ay[0] !== by[0]) return ay[0] - by[0];
        return ay[1] - by[1];
      }
      // fallback alphabetical
      return (a.month || "").localeCompare(b.month || "");
    });
    return arr;
  };

  // ---------------- Handle mould change ----------------
  const handleMouldChange = async (e) => {
    const mouldName = e.target.value;
    setSelectedMould(mouldName);
    setMouldInfo({ MouldID: "", MouldDesc: "" });
    setOverview(null);
    setBreakdownDuration([]);
    setBreakdownOccurrence([]);
    setSpareParts([]);
    setSpareError(null);
    setPmOnTimeData([]);
    setHcOnTimeData([]);

    if (!mouldName) return;

    try {
      // 1) Get MouldID & MouldDesc
      const idDescRes = await axios.get(`${BASE}/MouldSummary/MouldIDDesc`, {
        params: { mouldName },
      });

      if (idDescRes.data?.success && Array.isArray(idDescRes.data.data)) {
        const info = idDescRes.data.data[0] || {};
        const mouldId = info.MouldID || info.MouldId || info.ID || "";

        setMouldInfo({
          MouldID: mouldId,
          MouldDesc:
            info.MouldDesc || info.MouldDescription || info.Description || "",
        });

        // If we have a mouldId, fetch overview, breakdowns, on-time APIs and spare parts in parallel
        if (mouldId) {
          // overview fetch
          const overviewPromise = (async () => {
            try {
              setLoadingOverview(true);
              const ovRes = await axios.get(
                `${BASE}/MouldSummary/mouldPMHCOverview`,
                { params: { mouldId } },
              );
              if (ovRes.data?.success) {
                setOverview(
                  Array.isArray(ovRes.data.data)
                    ? ovRes.data.data[0]
                    : ovRes.data.data,
                );
              } else {
                console.error("Invalid overview response", ovRes.data);
                setOverview(null);
              }
            } catch (err) {
              console.error("Error fetching mouldPMHCOverview:", err);
              setOverview(null);
            } finally {
              setLoadingOverview(false);
            }
          })();

          // breakdowns, spare parts, on-time PM & HC in parallel
          const otherPromise = (async () => {
            try {
              setLoadingBreakdown(true);
              setLoadingSpare(true);
              setLoadingOnTime(true);
              setSpareError(null);
              setLoadingProduction(true);
              const [durRes, occRes, spareRes, pmOnRes, hcOnRes, prodRes, machineRes] =
                await Promise.all([
                  axios.get(
                    `${BASE}/MouldSummary/DashboardGetTop5BreakDownsByDuration`,
                    {
                      params: { mouldId },
                    },
                  ),
                  axios.get(
                    `${BASE}/MouldSummary/DashboardGetTop5BreakDownsByOccurrences`,
                    { params: { mouldId } },
                  ),
                  axios.get(
                    `${BASE}/MouldSummary/Dashboard_GetTop10SpareParts_ByMould`,
                    { params: { mouldId } },
                  ),
                  axios.get(
                    `${BASE}/MouldSummary/Dashboard_PM_OnTimeVsDelayed`,
                    {
                      params: { mouldId },
                    },
                  ),
                  axios.get(
                    `${BASE}/MouldSummary/Dashboard_HC_OnTimeVsDelayed`,
                    {
                      params: { mouldId },
                    },
                  ),
                  axios.get(
                    `${BASE}/MouldSummary/Dashboard_GET_MachineWiseShotCount_ByMould`,
                    {
                      params: { mouldName },
                    }
                  ),
                  axios.get(`${BASE}/MouldSummary/Dashboard_GET_Machines_ByMouldName`, { params: { mouldName } })
                ]);

              // Parse Duration API
              let durRows = durRes.data?.data ?? [];
              const parsedDur = (Array.isArray(durRows) ? durRows : []).map(
                (r) => {
                  const reason = r.BDReason || r.Reason || r.Label || "Unknown";
                  const numericKey = Object.keys(r).find(
                    (k) =>
                      k !== "BDReason" && r[k] != null && !isNaN(Number(r[k])),
                  );
                  const duration = numericKey
                    ? Number(r[numericKey])
                    : Number(r.Duration ?? 0);
                  return { reason, duration };
                },
              );
              setBreakdownDuration(parsedDur);

              // Parse Occurrence API
              let occRows = occRes.data?.data ?? [];
              const parsedOcc = (Array.isArray(occRows) ? occRows : []).map(
                (r) => {
                  const reason = r.BDReason || r.Reason || r.Label || "Unknown";
                  const count = Number(
                    r.OccurrenceCount ??
                    r.TotalOccurrences ??
                    r.Count ??
                    Object.values(r).find(
                      (v) => Number.isFinite(Number(v)) && Number(v) >= 0,
                    ) ??
                    0,
                  );
                  return { reason, count };
                },
              );
              setBreakdownOccurrence(parsedOcc);

              // Parse SpareParts API
              // let spareRows = spareRes.data?.data ?? [];
              // const parsedSpare = (Array.isArray(spareRows) ? spareRows : []).map((s) => ({
              //   name: s.SparePartName || s.PartName || `Part-${s.SparePartID ?? "?"}`,
              //   qty: Number(s.TotalQuantityUsed ?? s.Quantity ?? s.TotalUsed ?? 0),
              // }));
              // setSpareParts(parsedSpare);
              let spareRows = spareRes.data?.data ?? [];
              const parsedSpare = (
                Array.isArray(spareRows) ? spareRows : []
              ).map((s) => ({
                id: s.SparePartID ?? null,
                name: s.SparePartName ?? `Part-${s.SparePartID ?? "?"}`,
                qty: Number(s.TotalQuantityUsed ?? 0),
              }));
              setSpareParts(parsedSpare);
              // Parse PM OnTime API
              const pmRows = pmOnRes.data?.data ?? [];
              const groupedPm = groupOnTimeRows(pmRows);
              setPmOnTimeData(groupedPm);

              // Parse HC OnTime API
              const hcRows = hcOnRes.data?.data ?? [];
              const groupedHc = groupOnTimeRows(hcRows);
              setHcOnTimeData(groupedHc);

              // Parse Production History API
              let prodRows = prodRes.data?.data ?? [];

              const parsedProduction = (Array.isArray(prodRows) ? prodRows : []).map(p => ({
                machine: p.EquipmentName,
                shotCount: Number(p.ShotCount || 0),   // 🔥 Convert string → number
              }));

              setProductionData(parsedProduction);

              // Parse Machine List API
              let machineRows = machineRes.data?.data ?? [];

              const parsedMachines = (Array.isArray(machineRows) ? machineRows : []).map(m => ({
                id: m.EquipmentID,
                name: m.EquipmentName
              }));

              setMachineList(parsedMachines);
              setSelectedMachine("");   // reset selection

              // handleMachineChange({
              //   target: { value: "All" }
              // });
              setMachineTableData([]);  // clear table

            } catch (err) {
              console.error(
                "Error fetching breakdown/spare/on-time APIs:",
                err,
              );
              setBreakdownDuration([]);
              setBreakdownOccurrence([]);
              setSpareParts([]);
              setPmOnTimeData([]);
              setHcOnTimeData([]);
              setSpareError("Failed to load some data");
            } finally {
              setLoadingBreakdown(false);
              setLoadingSpare(false);
              setLoadingOnTime(false);
              setLoadingProduction(false);
            }
          })();

          await Promise.all([overviewPromise, otherPromise]);
        } // end if mouldId
      } else {
        console.error("Invalid MouldIDDesc response", idDescRes.data);
      }
    } catch (err) {
      console.error("Error fetching MouldIDDesc:", err);
    }
  };

  // Build KPI cards using overview data (keeps old mapping)
  const kpis = [
    { title: "Mould Start Date", value: formatDate(overview?.MouldStartDate) },
    { title: "Mould Current Life", value: overview?.MouldCurrentLife ?? "--" },
    {
      title: "Mould Current Life in Days",
      value: overview
        ? (overview["Mould Current Life in Days"] ??
          overview.MouldCurrentLifeInDays ??
          "--")
        : "--",
    },
    { title: "Number of PM Done", value: overview?.NumberOfPMDone ?? "--" },
    { title: "Last PM Shot Count", value: overview?.LastPMShotcount ?? "--" },
    { title: "Shot Count After Last PM", value: overview?.ShotsAfterLastPM ?? "--" },
    { title: "Last PM Date", value: formatDate(overview?.LastPMDate) },
    { title: "Next PM By Date", value: formatDate(overview?.NextPMDueDate) },
    {
      title: "Next PM By Shot Count",
      value: overview?.NextPMByShotCount ?? "--",
    },
    { title: "HC Start Date", value: formatDate(overview?.HCStartDate) },
    { title: "HC Start Count", value: overview?.HCStartCount ?? "--" },
    { title: "Number HC Done", value: overview?.NumberOfHCDone ?? "--" },
    { title: "Last HC Shot Count", value: overview?.LastHCShotcount ?? "--" },
     { title: "Shot Count After Last HC", value: overview?.ShotsAfterLastHC ?? "--" },
    { title: "Last HC Date", value: formatDate(overview?.LastHCDate) },
    { title: "Next HC By Date", value: formatDate(overview?.NextHCDueDate) },
    {
      title: "Next HC By Shot Count",
      value: overview?.NextHCByShotCount ?? "--",
    },
  ];
  const handleMachineChange = async (e) => {
    const machineName = e.target.value;

    setSelectedMachine(machineName);

    if (!machineName || !mouldInfo.MouldID) {
      setMachineTableData([]);
      return;
    }

    try {
      setLoadingMachineTable(true);

      const res = await axios.get(
        `${BASE}/MouldSummary/Dashboard_GET_MachineMouldProductionDetails`,
        {
          params: {
            mouldID: mouldInfo.MouldID,
            equipmentName: machineName
          },
        }
      );

      let rows = res.data?.data ?? [];

      const parsedTable = (Array.isArray(rows) ? rows : []).map(r => ({
        mouldId: r.MouldID,
        loadingTime: formatDate(r.LoadingTime),
        unloadingTime: formatDate(r.UnloadingTime),
        loadingShot: Number(r.LoadingShotCount || 0),
        unloadingShot: Number(r.UnLoadingShotCount || 0),
        totalShot: Number(r.TotalShotCount || 0),
      }));

      setMachineTableData(parsedTable);

    } catch (err) {
      console.error("Error fetching machine production details:", err);
      setMachineTableData([]);
    } finally {
      setLoadingMachineTable(false);
    }
  };

  // ---------------- UI START ----------------
  return (
    <DashboardLayout>
      <div className="w-full p-4">
        {/* ---------------- MOULD INFO ROW ---------------- */}
        <div className="mb-6 bg-white dark:bg-[#181b21] p-5 rounded-2xl shadow-xs border border-gray-200 dark:border-[#262a34] w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* --- Mould Name Dropdown --- */}
            <div>
              <label className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                Select Mould
              </label>
              <Select
                options={mouldList.map((m) => ({
                  value: m.MouldName,
                  label: `${m.MouldName} (${m.MouldID})`,
                  mouldID: m.MouldID,
                  mouldDesc: m.MouldDesc,
                }))}

                value={
                  selectedMould
                    ? mouldList
                      .map((m) => ({
                        value: m.MouldName,
                        label: `${m.MouldName} (${m.MouldID})`,
                        mouldID: m.MouldID,
                        mouldDesc: m.MouldDesc,
                      }))
                      .find((opt) => opt.value === selectedMould) || null
                    : null
                }

                onChange={(selectedOption) => {
                  if (!selectedOption) {
                    handleMouldChange({ target: { value: "" } });
                    return;
                  }

                  handleMouldChange({
                    target: { value: selectedOption.value },
                  });
                }}

                isSearchable
                isClearable
                placeholder="Type to search mould..."

                menuPortalTarget={document.body}
                menuPosition="fixed"

                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  control: (base, state) => ({
                    ...base,
                    backgroundColor: '#ffffff',
                    borderColor: state.isFocused ? '#0284c7' : '#cbd5e1',
                    boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
                    '&:hover': { borderColor: '#94a3b8' },
                    borderRadius: '0.5rem',
                    fontSize: '13px',
                  }),
                  input: (base) => ({
                    ...base,
                    color: '#0f172a',
                    fontWeight: '500',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#0f172a',
                    fontWeight: '600',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: '#94a3b8',
                  }),
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    borderRadius: '0.5rem',
                    zIndex: 9999,
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? '#0284c7'
                      : state.isFocused
                      ? '#f1f5f9'
                      : '#ffffff',
                    color: state.isSelected ? '#ffffff' : '#1e293b',
                    fontSize: '13px',
                    fontWeight: state.isSelected ? '600' : '500',
                    cursor: 'pointer',
                  }),
                }}
              />
            </div>

            {/* --- Mould ID --- */}
            <div>
              <label className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                Mould ID
              </label>
              <div className="bg-gray-100 dark:bg-[#131519] border border-gray-200 dark:border-[#262a34] px-4 py-2.5 rounded-lg shadow-xs font-semibold text-gray-800 dark:text-gray-200 text-sm">
                {mouldInfo.MouldID || "--"}
              </div>
            </div>

            {/* --- Mould Description --- */}
            <div>
              <label className="font-semibold text-xs text-gray-700 dark:text-gray-300 mb-1.5 block">
                Mould Description
              </label>
              <div className="bg-gray-100 dark:bg-[#131519] border border-gray-200 dark:border-[#262a34] px-4 py-2.5 rounded-lg shadow-xs font-semibold text-gray-800 dark:text-gray-200 text-sm truncate">
                {mouldInfo.MouldDesc || "--"}
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- KPI CARDS ---------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
          {loadingOverview && (
            <div className="col-span-full text-center text-xs text-gray-400 py-2">
              Loading KPIs...
            </div>
          )}

          {kpis.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] p-4 rounded-xl shadow-xs text-center transition-all hover:border-cyan-500/40"
            >
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{item.title}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white font-mono mt-1">
                {item.value ?? "--"}
              </p>
            </div>
          ))}
        </div>

        {/* ---------------- PRODUCTION HISTORY TITLE STRIP ---------------- */}
        <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-2.5 px-4 rounded-xl shadow-xs mb-4">
          <h2 className="text-sm font-bold tracking-wide uppercase text-center">
            Production History & Shot Count
          </h2>
        </div>

        {/* ---------------- PRODUCTION HORIZONTAL BAR CHART ---------------- */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-black text-center">
            Machine Wise Shot Count
          </h3>

          <div className="h-[320px]">
            {loadingProduction ? (
              <div className="flex items-center justify-center h-full">
                Loading production data...
              </div>
            ) : productionData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-600">
                No production data for selected mould.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productionData}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="machine"
                    type="category"
                    width={120}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="shotCount"
                    fill="#222156"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ---------------- MACHINE DROPDOWN ---------------- */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold text-black">
              Machine Production Details
            </h3>

            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Select Machine Name
              </label>

              <select
                value={selectedMachine}
                onChange={handleMachineChange}
                 disabled={!selectedMould}
                className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-gray-50 min-w-[200px]"
              >
              <option value="">Select Machine</option>
                <option value="All">All</option>

                {machineList.map((machine) => (
                  <option key={machine.id} value={machine.name}>
                    {machine.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ---------------- MACHINE TABLE ---------------- */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {selectedMachine === "" ? (
            <div className="p-6 text-center text-gray-500">
              Please select a machine to view production details.
            </div>
          ) : loadingMachineTable ? (
            <div className="p-6 text-center text-gray-500">
              Loading machine data...
            </div>
          ) : machineTableData.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No data available for selected machine.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-blue-900 text-white">
                  <tr>
                    <th className="px-6 py-3">Mould ID</th>
                    <th className="px-6 py-3">Loading Time</th>
                    <th className="px-6 py-3">Unloading Time</th>
                    <th className="px-6 py-3">Loading Shot Count</th>
                    <th className="px-6 py-3">Unloading Shot Count</th>
                    <th className="px-6 py-3">Total Shot Count</th>
                  </tr>
                </thead>
                <tbody>
                  {machineTableData.map((row, index) => (
                    <tr key={index} className="border-b hover:bg-indigo-50 transition">
                      <td className="px-6 py-4 font-semibold">{row.mouldId}</td>
                      <td className="px-6 py-4">{row.loadingTime}</td>
                      <td className="px-6 py-4">{row.unloadingTime}</td>
                      <td className="px-6 py-4">{row.loadingShot}</td>
                      <td className="px-6 py-4">{row.unloadingShot}</td>
                      <td className="px-6 py-4 font-bold text-indigo-600">
                        {row.totalShot}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ---------------- PM & HC OnTime vs Delayed Charts ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* PM OnTime vs Delayed */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">
              PM OnTime vs Delayed
            </h2>
            <div className="h-[320px]">
              {loadingOnTime ? (
                <div className="flex items-center justify-center h-full">
                  Loading...
                </div>
              ) : pmOnTimeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-600">
                  No PM on-time data for selected mould.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pmOnTimeData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fontWeight: "bold" }}
                      angle={-20}
                      textAnchor="end"
                      height={64}
                    />
                    <YAxis tick={{ fontSize: 12, fontWeight: "bold" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OnTime" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Delayed" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* HC OnTime vs Delayed */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-black text-center">
              HC OnTime vs Delayed
            </h2>
            <div className="h-[320px]">
              {loadingOnTime ? (
                <div className="flex items-center justify-center h-full">
                  Loading...
                </div>
              ) : hcOnTimeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-600">
                  No HC on-time data for selected mould.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hcOnTimeData} margin={{ bottom: 20 }}>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12, fontWeight: "bold" }}
                      angle={-20}
                      textAnchor="end"
                      height={64}
                    />
                    <YAxis tick={{ fontSize: 12, fontWeight: "bold" }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="OnTime" stackId="a" fill="#16a34a" />
                    <Bar dataKey="Delayed" stackId="a" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- Breakdown & Spare Part Charts ---------------- */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {/* Breakdown by Duration */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">
              Top 5 Breakdown by Duration
            </h2>

            {loadingBreakdown ? (
              <div className="p-6 text-center">Loading breakdown...</div>
            ) : breakdownDuration.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">
                No breakdown duration data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={breakdownDuration} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="reason"
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    tick={{
                      fontSize: 12,
                      fill: "#181818ff",
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "#181818ff",
                      fontWeight: "bold",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="duration" fill="#5885E0" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Breakdown by Count */}
          <div className="bg-white shadow-lg rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-lg text-black text-center">
              Top 5 Breakdown by Occurrence
            </h2>

            {loadingBreakdown ? (
              <div className="p-6 text-center">Loading breakdown...</div>
            ) : breakdownOccurrence.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-600">
                No breakdown occurrence data.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={breakdownOccurrence} margin={{ bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="reason"
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                    height={60}
                    tick={{
                      fontSize: 12,
                      fill: "#181818ff",
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "#181818ff",
                      fontWeight: "bold",
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#FF8C42" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Spare Part Consumption */}
        <div className="bg-white rounded-2xl p-5 mt-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-black text-center">
            Top 10 Spare Part Consumption
          </h2>

          {loadingSpare ? (
            <div className="p-6 text-center">Loading spare-part data...</div>
          ) : spareError ? (
            <div className="p-6 text-center text-red-600">{spareError}</div>
          ) : spareParts.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-600">
              No spare part data for selected mould.
            </div>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spareParts}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fill: "#181818ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                    angle={-8}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{
                      fill: "#181818ff",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                  <Bar dataKey="qty" fill="#22A699" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MouldSummary;
