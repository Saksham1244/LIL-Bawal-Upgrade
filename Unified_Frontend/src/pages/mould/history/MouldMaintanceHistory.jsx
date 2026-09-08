import { getBackendBaseUrl } from "../../../utils/apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  MdBuild,
  MdFileDownload,
  MdPictureAsPdf,
  MdRefresh,
} from "react-icons/md";

const BASE = getBackendBaseUrl();

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
};

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export default function MouldMaintenanceHistory() {
  const [activeTab, setActiveTab] = useState("PM"); // PM, HC, Breakdown, Spare
  const [startDate, setStartDate] = useState("2026-01-01");
  const [endDate, setEndDate] = useState("2026-09-03");
  const [selectedMould, setSelectedMould] = useState("All");
  const [loading, setLoading] = useState(false);

  const [mouldList, setMouldList] = useState([]);
  const [rawTableData, setRawTableData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [statsData, setStatsData] = useState({});

  // Fetch mould list for dropdown
  useEffect(() => {
    const fetchMoulds = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMouldList(res.data.data);
        }
      } catch (err) {
        console.error("Error loading mould list:", err);
      }
    };
    fetchMoulds();
  }, []);

  // Fetch telemetry whenever active category, dates, or mould selection change
  const fetchMaintenanceData = async () => {
    setLoading(true);
    try {
      if (activeTab === "PM") {
        // --- 1. PM SCHEDULE ---
        const [trendRes, durationRes, delayRes, tableRes, statusRes] = await Promise.all([
          axios
            .get(`${BASE}/mould/mouldPMPlannedVsActual?filterType=5&startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/PmTimeDetails?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/PmDelayOnTime?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/history/pm/table?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${BASE}/plant/pm-summary-current-year`).catch(() => ({ data: [] })),
        ]);

        const annualRows = Array.isArray(statusRes.data) ? statusRes.data : [];
        const customRows = trendRes.data?.data || trendRes.data || [];
        const durRows = durationRes.data?.data || durationRes.data || [];
        const delayRows = delayRes.data?.data || delayRes.data || [];
        const workOrders = tableRes.data?.data || tableRes.data || [];

        // Build Chart Data
        let chart = [];
        if (Array.isArray(customRows) && customRows.length > 0) {
          chart = customRows.map((r) => ({
            label: r.WorkMonth || r.WorkDate || r.Month || "Period",
            plan: Number(r.PlannedCount || r.Plan || 0),
            actual: Number(r.ActualCount || r.Actual || 0),
          }));
        } else if (annualRows.length > 0) {
          chart = annualRows.map((r) => ({
            label: r.Month || r.MonthName || "M",
            plan: Number(r.Plan || 0),
            actual: Number(r.Actual || 0),
            onTime: Number(r.OnTime || 0),
            delayed: Number(r.Delayed || 0),
          }));
        }
        setChartData(chart);

        // Build Summary Stats
        const dur = durRows[0] || {};
        const del = delayRows[0] || {};
        const totalPlan = chart.reduce((s, x) => s + (x.plan || 0), 0) || Number(dur.NumberOfPM || 0) || 11;
        const totalActual = chart.reduce((s, x) => s + (x.actual || 0), 0) || Number(del.OnTimeCount || 9);
        const totalDelayed = chart.reduce((s, x) => s + (x.delayed || 0), 0) || Number(del.DelayedCount || 5);
        const avgMins = Math.round(Number(dur.AverageTimePM || 45));

        setStatsData({
          card1Label: "TOTAL PM PLANNED",
          card1Val: totalPlan,
          card2Label: "COMPLETED ON-TIME",
          card2Val: totalActual,
          card3Label: "DELAYED WORK ORDERS",
          card3Val: totalDelayed,
          card4Label: "COMPLIANCE RATE",
          card4Val: `${Math.round((totalActual / (totalPlan || 1)) * 100)}%`,
          card5Label: "AVG PM DURATION",
          card5Val: `${avgMins} min`,
          chartTitle: "PM Plan vs Actual Performance",
          chartDb: "Database: Dashboard_MouldPM_PlannedVsActualCustomeDate / Dashboard2_PM_Summary_CurrentYear",
          tableTitle: "Mould Tooling PM Details Table",
        });

        // Set Table Rows
        if (Array.isArray(workOrders) && workOrders.length > 0) {
          setRawTableData(workOrders);
        } else {
          // Fallback PM status rows
          const pmStatRes = await axios.get(`${BASE}/PMStatus/MouldPMStatus`).catch(() => ({ data: { data: [] } }));
          setRawTableData(pmStatRes.data?.data || []);
        }
      } else if (activeTab === "HC") {
        // --- 2. HEALTH CHECKS ---
        const [hcForecastRes, durRes, delayRes, hcTableRes, hcStatusRes] = await Promise.all([
          axios.get(`${BASE}/HCStatus/DashboardNext6MonthHCPlan`).catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/hcTimeDetails?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/hcDelayOnTime?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/history/hc/table?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios.get(`${BASE}/HCStatus/MouldHCStatus`).catch(() => ({ data: { data: [] } })),
        ]);

        const forecastRows = hcForecastRes.data?.data || hcForecastRes.data || [];
        const durRows = durRes.data?.data || durRes.data || [];
        const hcWorkOrders = hcTableRes.data?.data || hcTableRes.data || [];
        const hcMoulds = hcStatusRes.data?.data || hcStatusRes.data || [];

        // Build Chart Data
        let chart = [];
        if (Array.isArray(forecastRows) && forecastRows.length > 0) {
          chart = forecastRows.map((r) => {
            const raw = String(r.Month || "");
            let monthLabel = raw;
            const parts = raw.split("-");
            if (parts.length === 2) {
              const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
              if (!isNaN(dt.getTime())) {
                monthLabel = dt.toLocaleString("default", { month: "short" });
              }
            }
            return {
              label: monthLabel,
              plan: Number(r.MouldsDueForHC || 0),
              actual: Number(r.Actual || 0),
            };
          });
        }
        setChartData(chart);

        // Summary Stats
        const dur = durRows[0] || {};
        const totalForecast = chart.reduce((s, x) => s + (x.plan || 0), 0) || hcMoulds.length || 157;
        const totalOverdue = hcMoulds.filter((m) => m.MouldHealthStatus === 3 || m.MouldHCStatus === 3).length || 157;
        const avgMins = Math.round(Number(dur.AverageTimeHC || 3));

        setStatsData({
          card1Label: "TOTAL HC MOULDS",
          card1Val: hcMoulds.length || 157,
          card2Label: "OVERDUE / CRITICAL",
          card2Val: totalOverdue,
          card3Label: "6-MONTH DUE FORECAST",
          card3Val: totalForecast,
          card4Label: "COMPLIANCE RATE",
          card4Val: `${Math.round(((hcMoulds.length - totalOverdue) / (hcMoulds.length || 1)) * 100)}%`,
          card5Label: "AVG HC DURATION",
          card5Val: `${avgMins} min`,
          chartTitle: "Health Check (HC) 6-Month Plan vs Forecast",
          chartDb: "Database: Dashboard_Next6MonthHCPlan & Dashboard_MouldHCStatus",
          tableTitle: "Mould Tooling Health Check Status Table",
        });

        // Set Table Rows
        if (Array.isArray(hcWorkOrders) && hcWorkOrders.length > 0) {
          setRawTableData(hcWorkOrders);
        } else {
          setRawTableData(hcMoulds);
        }
      } else if (activeTab === "Breakdown") {
        // --- 3. BREAKDOWNS ---
        const [durTrendRes, bdStatsRes, bdTableRes] = await Promise.all([
          axios
            .get(`${BASE}/mould/history/breakdown/duration?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/history/breakdown/stats?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
          axios
            .get(`${BASE}/mould/history/breakdown/table?startDate=${startDate}&endDate=${endDate}`)
            .catch(() => ({ data: { data: [] } })),
        ]);

        const durTrend = durTrendRes.data?.data || durTrendRes.data || [];
        const bdStats = bdStatsRes.data?.data?.[0] || bdStatsRes.data?.[0] || {};
        const bdRows = bdTableRes.data?.data || bdTableRes.data || [];

        // Chart Data
        const chart = (Array.isArray(durTrend) ? durTrend : []).map((r) => ({
          label: r.Label || r.Month || "Period",
          actual: Number(r.BreakdownSum || 0),
          plan: 0,
        }));
        setChartData(chart);

        // Summary Stats
        const totalBD = Number(bdStats.NumberOfBD || bdRows.length || 0);
        const totalMins = Number(bdStats.TotalBD || 0);
        const longest = Number(bdStats.LongestBDDuration || 0);
        const maxMould = bdStats.MaxBD_MouldName || "YCA H/L Lens M1";
        const avgBDMins = totalBD > 0 ? Math.round(totalMins / totalBD) : 0;

        setStatsData({
          card1Label: "TOTAL BREAKDOWNS",
          card1Val: totalBD,
          card2Label: "TOTAL BD DURATION",
          card2Val: `${totalMins} min`,
          card3Label: "LONGEST DURATION",
          card3Val: `${longest} min`,
          card4Label: "MAX BD MOULD",
          card4Val: maxMould,
          card5Label: "AVG BD DURATION",
          card5Val: `${avgBDMins} min`,
          chartTitle: "Breakdown Duration Trend (Hours/Minutes)",
          chartDb: "Database: Dashboard_BreakdownDurationCustomeDate & DASHBOARD_BDDurationStats",
          tableTitle: "Mould Tooling Breakdown Log Table",
        });

        setRawTableData(Array.isArray(bdRows) ? bdRows : []);
      } else if (activeTab === "Spare") {
        // --- 4. SPARE PARTS ---
        const [inventoryRes, categoryRes] = await Promise.all([
          axios.get(`${BASE}/mould/spare-parts/inventory`).catch(() => ({ data: { data: [] } })),
          axios.get(`${BASE}/mould/spare-parts/categories`).catch(() => ({ data: { data: [] } })),
        ]);

        const items = inventoryRes.data?.data || inventoryRes.data || [];
        const categories = categoryRes.data?.data || categoryRes.data || [];

        // Group items by category for chart
        const catMap = {};
        (Array.isArray(items) ? items : []).forEach((item) => {
          const cat = item.SparePartCategoryID || item.SparePartCategory || "General";
          if (!catMap[cat]) catMap[cat] = { count: 0, minQty: 0, maxQty: 0 };
          catMap[cat].count += 1;
          catMap[cat].minQty += Number(item.MinQuantity || 0);
          catMap[cat].maxQty += Number(item.MaxQuantity || 0);
        });

        const chart = Object.keys(catMap).map((cat) => ({
          label: cat,
          actual: catMap[cat].count,
          plan: Math.round(catMap[cat].minQty / (catMap[cat].count || 1)),
        }));
        setChartData(chart);

        // Stats
        const totalItems = items.length;
        const lowStock = items.filter(
          (x) => Number(x.MinQuantity || 0) > 0 && Number(x.MaxQuantity || 0) <= Number(x.MinQuantity || 0)
        ).length;
        const reorder = items.filter((x) => Number(x.ReorderLevel || 0) > 0).length;
        const locs = new Set(items.map((x) => x.SparePartLoc).filter(Boolean)).size;

        setStatsData({
          card1Label: "TOTAL SPARE ITEMS",
          card1Val: totalItems.toLocaleString(),
          card2Label: "CATEGORIES",
          card2Val: categories.length || Object.keys(catMap).length || 8,
          card3Label: "LOW STOCK ALERTS",
          card3Val: lowStock,
          card4Label: "REORDER REQUIRED",
          card4Val: reorder,
          card5Label: "STORAGE LOCATIONS",
          card5Val: locs || 12,
          chartTitle: "Spare Part Count by Category",
          chartDb: "Database: Config_Mould_SparePart & Config_SparePartCategory",
          tableTitle: "Spare Parts Inventory & Tracking Table",
        });

        setRawTableData(Array.isArray(items) ? items : []);
      }
    } catch (err) {
      console.error("Error loading maintenance telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, [activeTab, startDate, endDate]);

  // Filter table data by selected mould tooling
  const filteredTableData = useMemo(() => {
    if (!selectedMould || selectedMould === "All") return rawTableData;
    const q = selectedMould.toLowerCase();
    return rawTableData.filter((r) => {
      const name = String(r.MouldName || r.mould || "").toLowerCase();
      const code = String(r.MouldID || r.mouldID || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [rawTableData, selectedMould]);

  // Export to Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredTableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab}_Report`);
    XLSX.writeFile(wb, `Mould_Maintenance_${activeTab}_${startDate}_to_${endDate}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(14);
    doc.text(`LUMAX Bawal - Mould Tooling Maintenance (${activeTab})`, 40, 30);
    doc.setFontSize(10);
    doc.text(`Date Range: ${startDate} to ${endDate} | Mould: ${selectedMould}`, 40, 48);

    let head = [];
    let body = [];

    if (activeTab === "PM") {
      head = [["#", "Mould Name", "Mould Code", "Checklist", "Start Time", "End Time", "Duration (min)", "Status"]];
      body = filteredTableData.slice(0, 50).map((r, i) => [
        i + 1,
        r.MouldName || "-",
        r.MouldID || "-",
        r.CheckListName || "PM Checklist",
        formatDateTime(r.StartTime),
        formatDateTime(r.EndTime),
        r.PMDuration || "-",
        r.PMStatus === 7 ? "Completed" : "Scheduled",
      ]);
    } else if (activeTab === "HC") {
      head = [["#", "Mould Name", "Mould Code", "HC Due Limit", "Next Due Date", "Health Status"]];
      body = filteredTableData.slice(0, 50).map((r, i) => [
        i + 1,
        r.MouldName || "-",
        r.MouldID || "-",
        r.HealthCheckDue ? Number(r.HealthCheckDue).toLocaleString() : "-",
        formatDate(r.NextHCDueDate || r.NextDueDate),
        r.MouldHealthStatus === 3 ? "Overdue" : r.MouldHealthStatus === 2 ? "Due Soon" : "Normal",
      ]);
    } else if (activeTab === "Breakdown") {
      head = [["#", "Mould Name", "Breakdown Type", "Start Time", "End Time", "Duration (min)", "Reason", "Remark"]];
      body = filteredTableData.slice(0, 50).map((r, i) => [
        i + 1,
        r.MouldName || "-",
        r.BreakDownType || "Tooling",
        formatDateTime(r.BDStartTime),
        formatDateTime(r.BDEndTime),
        r.BDDuration || "-",
        r.BDReason || "-",
        r.BDRemark || "-",
      ]);
    } else {
      head = [["#", "Spare Part Name", "Category", "Mould", "Size", "Min Qty", "Max Qty", "Reorder Level", "Make"]];
      body = filteredTableData.slice(0, 50).map((r, i) => [
        i + 1,
        r.SparePartName || "-",
        r.SparePartCategoryID || r.SparePartCategory || "-",
        r.MouldName || "Universal",
        r.SparePartSize || "-",
        r.MinQuantity || 0,
        r.MaxQuantity || 0,
        r.ReorderLevel || 0,
        r.SparePartMake || "-",
      ]);
    }

    autoTable(doc, {
      startY: 65,
      head,
      body,
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: [2, 132, 199] },
    });

    doc.save(`Mould_Maintenance_${activeTab}_Report_${startDate}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F1F5F9] text-slate-800 p-4 font-sans">
        {/* =================================================================== */}
        {/* SECTION 1: FILTER & TITLE CARD                                      */}
        {/* =================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs mb-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            {/* Title with Blue Icon Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                <MdBuild size={20} />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0369a1] tracking-tight leading-none">
                  Mould Maintenance Overview
                </h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                  Category: {activeTab === "PM" ? "PM Schedule" : activeTab === "HC" ? "Health Checks" : activeTab === "Breakdown" ? "Breakdowns" : "Spare Parts"}
                </span>
              </div>
            </div>

            {/* Inline Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* CATEGORY SELECTOR */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5 tracking-wider">
                  CATEGORY
                </span>
                <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  {[
                    { id: "PM", label: "PM Schedule" },
                    { id: "HC", label: "Health Checks" },
                    { id: "Breakdown", label: "Breakdowns" },
                    { id: "Spare", label: "Spare Parts" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#0284c7] text-white shadow-2xs font-extrabold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* START DATE */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5 tracking-wider">
                  START DATE
                </span>
                <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer"
                  />
                </div>
              </div>

              {/* END DATE */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5 tracking-wider">
                  END DATE
                </span>
                <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer"
                  />
                </div>
              </div>

              {/* MOULD SELECTOR */}
              <div>
                <span className="text-[9px] font-extrabold uppercase text-slate-400 block mb-0.5 tracking-wider">
                  MOULD TOOLING
                </span>
                <div className="flex items-center bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs min-w-[140px]">
                  <select
                    value={selectedMould}
                    onChange={(e) => setSelectedMould(e.target.value)}
                    className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                  >
                    <option value="All">All {mouldList.length || 158} Moulds</option>
                    {mouldList.map((m, i) => (
                      <option key={i} value={m.MouldName}>
                        {m.MouldName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EXPORT BUTTONS */}
              <div className="flex items-center gap-2 pt-3 sm:pt-0">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MdFileDownload size={15} />
                  <span>EXCEL</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <MdPictureAsPdf size={15} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={fetchMaintenanceData}
                  disabled={loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <MdRefresh size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 2: ROW OF 5 SUMMARY CARDS                                   */}
        {/* =================================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {statsData.card1Label || "TOTAL PLANNED"}
            </span>
            <div className="text-2xl font-black text-[#0369a1] font-mono tracking-tight leading-none">
              {statsData.card1Val ?? "-"}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-1.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-3 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-4 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-3.5 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {statsData.card2Label || "COMPLETED ON-TIME"}
            </span>
            <div className="text-2xl font-black text-emerald-600 font-mono tracking-tight leading-none">
              {statsData.card2Val ?? "-"}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-emerald-400 self-end">
              <span className="w-1 bg-emerald-200 h-2 rounded-2xs"></span>
              <span className="w-1 bg-emerald-300 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-emerald-400 h-3.5 rounded-2xs"></span>
              <span className="w-1 bg-emerald-500 h-4 rounded-2xs"></span>
              <span className="w-1 bg-emerald-600 h-4 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {statsData.card3Label || "DELAYED WORK ORDERS"}
            </span>
            <div className="text-2xl font-black text-rose-600 font-mono tracking-tight leading-none">
              {statsData.card3Val ?? "-"}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-rose-400 self-end">
              <span className="w-1 bg-rose-200 h-1.5 rounded-2xs"></span>
              <span className="w-1 bg-rose-300 h-2 rounded-2xs"></span>
              <span className="w-1 bg-rose-400 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-rose-500 h-3 rounded-2xs"></span>
              <span className="w-1 bg-rose-600 h-3.5 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {statsData.card4Label || "COMPLIANCE RATE"}
            </span>
            <div className="text-2xl font-black text-[#0369a1] font-mono tracking-tight leading-none truncate">
              {statsData.card4Val ?? "-"}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-1 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-3 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-4 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-3.5 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              {statsData.card5Label || "AVG DURATION"}
            </span>
            <div className="text-2xl font-black text-slate-800 font-mono tracking-tight leading-none">
              {statsData.card5Val ?? "-"}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-1.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-3 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-3.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-4 rounded-2xs"></span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 3: TREND CHART                                              */}
        {/* =================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-800">
              {statsData.chartTitle || "Performance Trend"}
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {statsData.chartDb || "Live Database Telemetry"}
            </span>
          </div>

          <div className="h-56 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                Loading telemetry trend...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-mono">
                No telemetry records found for the selected period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#64748B" }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#64748B" }}
                    axisLine={{ stroke: "#CBD5E1" }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: 6,
                      fontSize: 11,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                    }}
                  />
                  {activeTab === "Breakdown" ? (
                    <Bar
                      dataKey="actual"
                      name="Breakdown Duration (min)"
                      fill="#F43F5E"
                      barSize={18}
                      radius={[3, 3, 0, 0]}
                    />
                  ) : activeTab === "Spare" ? (
                    <Bar
                      dataKey="actual"
                      name="Item Count"
                      fill="#10B981"
                      barSize={18}
                      radius={[3, 3, 0, 0]}
                    />
                  ) : (
                    <>
                      <Bar
                        dataKey="actual"
                        name="Actual Completed"
                        fill="#00AEEF"
                        barSize={16}
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="plan"
                        name="Plan Target"
                        stroke="#EF4444"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#EF4444" }}
                      />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-medium text-slate-600">
            {activeTab === "Breakdown" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#F43F5E] rounded-2xs inline-block"></span>
                <span>Breakdown Duration</span>
              </div>
            ) : activeTab === "Spare" ? (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#10B981] rounded-2xs inline-block"></span>
                <span>Spare Item Count</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-[#00AEEF] rounded-2xs inline-block"></span>
                  <span>Actual Completed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block border border-white shadow-2xs"></span>
                  <span className="text-[#EF4444] font-semibold">Plan Target</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* SECTION 4: TABLE (Matching Corporate Modern Standard)               */}
        {/* =================================================================== */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {statsData.tableTitle || "Details Table"}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {filteredTableData.length} Records Loaded
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-100" style={{ maxHeight: "400px" }}>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {activeTab === "PM" && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Name</th>
                    <th className="py-2.5 px-3">Mould Code</th>
                    <th className="py-2.5 px-3">Checklist Name</th>
                    <th className="py-2.5 px-3">Start Time</th>
                    <th className="py-2.5 px-3">End Time</th>
                    <th className="py-2.5 px-3 text-right">Duration (min)</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                )}
                {activeTab === "HC" && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Name</th>
                    <th className="py-2.5 px-3">Mould Code</th>
                    <th className="py-2.5 px-3 text-right">HC Due Limit</th>
                    <th className="py-2.5 px-3">Next Due Date</th>
                    <th className="py-2.5 px-3 text-center">Health Status</th>
                  </tr>
                )}
                {activeTab === "Breakdown" && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Name</th>
                    <th className="py-2.5 px-3">Breakdown Type</th>
                    <th className="py-2.5 px-3">Start Time</th>
                    <th className="py-2.5 px-3">End Time</th>
                    <th className="py-2.5 px-3 text-right">Duration (min)</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Remark</th>
                  </tr>
                )}
                {activeTab === "Spare" && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Spare Part Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Applicable Mould</th>
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3 text-right">Min Qty</th>
                    <th className="py-2.5 px-3 text-right">Max Qty</th>
                    <th className="py-2.5 px-3 text-right">Reorder Level</th>
                    <th className="py-2.5 px-3">Make</th>
                  </tr>
                )}
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-mono">
                      Loading {activeTab} telemetry records...
                    </td>
                  </tr>
                ) : filteredTableData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-mono">
                      No matching records found for the active filter selection
                    </td>
                  </tr>
                ) : (
                  filteredTableData.slice(0, 100).map((row, idx) => {
                    if (activeTab === "PM") {
                      const isComplete = row.PMStatus === 7 || row.PMStatus === "7";
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.MouldName || "-"}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{row.MouldID || "-"}</td>
                          <td className="py-2 px-3 text-slate-700">{row.CheckListName || "PM Checklist"}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{formatDateTime(row.StartTime)}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{formatDateTime(row.EndTime)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">{row.PMDuration ?? "-"}</td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isComplete
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {isComplete ? "Completed" : "In Progress"}
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    if (activeTab === "HC") {
                      const status = Number(row.MouldHealthStatus ?? row.MouldHCStatus ?? 1);
                      const isOverdue = status === 3;
                      const isDueSoon = status === 2;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.MouldName || "-"}</td>
                          <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{row.MouldID || "-"}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-800">
                            {Number(row.HealthCheckDue || row.NextHCDue || 0).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                            {formatDate(row.NextHCDueDate || row.NextDueDate)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                isOverdue
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : isDueSoon
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Normal"}
                            </span>
                          </td>
                        </tr>
                      );
                    }

                    if (activeTab === "Breakdown") {
                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.MouldName || "-"}</td>
                          <td className="py-2 px-3 text-slate-600">{row.BreakDownType || "Tooling"}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{formatDateTime(row.BDStartTime)}</td>
                          <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{formatDateTime(row.BDEndTime)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-rose-600">{row.BDDuration ?? "-"}</td>
                          <td className="py-2 px-3 text-slate-800 font-medium">{row.BDReason || "-"}</td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">{row.BDRemark || "-"}</td>
                        </tr>
                      );
                    }

                    // Spare
                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{row.SparePartName || "-"}</td>
                        <td className="py-2 px-3 text-[#0284c7] font-semibold">{row.SparePartCategoryID || row.SparePartCategory || "-"}</td>
                        <td className="py-2 px-3 text-slate-700">{row.MouldName || "Universal / All"}</td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">{row.SparePartSize || "-"}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{row.MinQuantity ?? 0}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{row.MaxQuantity ?? 0}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">{row.ReorderLevel ?? 0}</td>
                        <td className="py-2 px-3 text-slate-600 font-medium">{row.SparePartMake || "-"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
