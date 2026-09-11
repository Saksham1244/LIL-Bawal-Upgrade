import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MdFactory,
  MdFileDownload,
  MdPictureAsPdf,
  MdDateRange,
  MdSpeed,
  MdCheckCircle,
} from "react-icons/md";

const BASE = getBackendBaseUrl();

export default function PlantHeadHome() {
  const [filterType, setFilterType] = useState("Current");
  const [machines, setMachines] = useState([]);
  const [prodDate, setProdDate] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [plantSummary, setPlantSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const tableRef = useRef();

  // Fetch Machine Data
  const fetchMachines = async (type) => {
    try {
      const res = await fetch(
        `${BASE}/PerformanceHome/machine-performance?filterType=${type}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMachines(data);
      }
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  // Fetch plant summary
  const fetchPlantSummary = async (type) => {
    try {
      const res = await fetch(
        `${BASE}/PerformanceHome/Plant-performance?FilterType=${type}`
      );
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setPlantSummary(data[0]);
      } else if (data && typeof data === "object" && data.OEE !== undefined) {
        setPlantSummary(data);
      }
    } catch (err) {
      console.error("Plant Summary API Error:", err);
    }
  };

  // Fetch Production Date
  const fetchProdDate = async () => {
    try {
      const res = await fetch(`${BASE}/PerformanceHome/GetProdDate`);
      const data = await res.json();

      let rawDate = null;
      if (Array.isArray(data) && data.length > 0) {
        rawDate = data[0].ProdDate;
      } else if (data?.data?.ProdDate) {
        rawDate = data.data.ProdDate;
      } else if (data?.ProdDate) {
        rawDate = data.ProdDate;
      }

      if (rawDate) {
        const date = new Date(rawDate).toISOString().split("T")[0];
        setProdDate(date);
        setOriginalDate(date);
      }
    } catch (err) {
      console.error("ProdDate Error:", err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchMachines("Current"),
        fetchPlantSummary("Current"),
        fetchProdDate(),
      ]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const handlePrev = () => {
    setFilterType("Prev");
    fetchMachines("Prev");
    fetchPlantSummary("Prev");
    if (originalDate) {
      const prevDate = new Date(originalDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const formatted = prevDate.toISOString().split("T")[0];
      setProdDate(formatted);
    }
  };

  const handleCurrent = () => {
    setFilterType("Current");
    fetchMachines("Current");
    fetchPlantSummary("Current");
    fetchProdDate();
  };

  // Excel Download
  const downloadExcel = () => {
    const wsData = [];
    wsData.push(["LUMAX Bawal - Plant Performance Executive Report"]);
    wsData.push([`Production Date: ${prodDate}`]);
    wsData.push([]);

    if (plantSummary) {
      wsData.push(["Plant Summary"]);
      wsData.push([
        "OEE", "Availability", "Performance", "Quality",
        "Plan", "Actual", "Achievement", "Total DT (min)"
      ]);
      wsData.push([
        plantSummary.OEE,
        plantSummary.Availability,
        plantSummary.Performance,
        plantSummary.Quality,
        plantSummary.Plan,
        plantSummary.Actual,
        plantSummary.Achievement,
        plantSummary.TotalDT
      ]);
      wsData.push([]);
    }

    wsData.push([
      "Machine", "Machine Status", "Running Mould", "OEE %", "Availability %", "Performance %", "Quality %",
      "Plan Qty", "Actual Qty", "Achievement %", "Rejection Qty",
      "Man (min)", "Material (min)", "Method (min)", "Machine DT (min)", "Mould (min)", "Total DT (min)"
    ]);

    machines.forEach((m) => {
      wsData.push([
        m.Machine,
        m.MachineStatus || "IDLE",
        m.RunningMould || "-",
        m.OEE,
        m.Availability,
        m.Performance,
        m.Quality,
        m.Plan,
        m.Actual,
        m.Achievement,
        m.Rejected,
        m.Man,
        m.Material,
        m.Method,
        m.MachineDT,
        m.Mould,
        m.TotalDT
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Plant_Performance");
    XLSX.writeFile(wb, `Plant_Report_${prodDate || "Current"}.xlsx`);
  };

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.setFontSize(14);
    doc.text("LUMAX Bawal - Plant Executive Performance Report", 40, 30);
    doc.setFontSize(10);
    doc.text(`Production Date: ${prodDate || "Current"}`, 40, 48);

    let startY = 65;

    if (plantSummary) {
      autoTable(doc, {
        startY: startY,
        head: [["OEE", "Availability", "Performance", "Quality", "Plan", "Actual", "Achievement", "Total DT"]],
        body: [[
          `${plantSummary.OEE}%`,
          `${plantSummary.Availability}%`,
          `${plantSummary.Performance}%`,
          `${plantSummary.Quality}%`,
          plantSummary.Plan,
          plantSummary.Actual,
          `${plantSummary.Achievement}%`,
          plantSummary.TotalDT
        ]],
        styles: { fontSize: 8, halign: "center" },
        headStyles: { fillColor: [16, 185, 129] }
      });
      startY = doc.lastAutoTable.finalY + 15;
    }

    const head = [[
      "Machine", "Status", "Running Mould", "OEE", "Avail", "Perf", "Qual",
      "Plan", "Actual", "Achieve", "Rej", "Man (m)", "Mat (m)", "Meth (m)", "Mach (m)", "Mould (m)", "Total DT (m)"
    ]];

    const body = machines.map((m) => [
      m.Machine,
      m.MachineStatus || "IDLE",
      m.RunningMould || "-",
      `${m.OEE}%`,
      `${m.Availability}%`,
      `${m.Performance}%`,
      `${m.Quality}%`,
      m.Plan,
      m.Actual,
      `${m.Achievement}%`,
      m.Rejected,
      m.Man,
      m.Material,
      m.Method,
      m.MachineDT,
      m.Mould,
      m.TotalDT
    ]);

    autoTable(doc, {
      startY: startY,
      head,
      body,
      styles: { fontSize: 7, halign: "center" },
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [241, 245, 249] }
    });

    doc.save(`Plant_Report_${prodDate || "Current"}.pdf`);
  };

  // Badge Render Helpers
  const renderMachineStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    if (s === "RUNNING") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>RUNNING</span>
        </span>
      );
    }
    if (s === "DOWN") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          <span>DOWN</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs bg-slate-100 text-slate-600 border-slate-200 dark:bg-[#202530] dark:text-slate-300 dark:border-[#2f3544]">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>IDLE</span>
      </span>
    );
  };

  const renderRunningMouldBadge = (mouldName, status) => {
    if (!mouldName || mouldName === "-" || mouldName.toLowerCase() === "null") {
      return <span className="text-gray-400 font-sans">-</span>;
    }

    const s = String(status || "DONE").toUpperCase();

    if (s === "OVERDUE") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25 max-w-full"
          title={`${mouldName} (Overdue)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
          <span className="truncate">{mouldName}</span>
        </span>
      );
    }

    if (s === "DUE") {
      return (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25 max-w-full"
          title={`${mouldName} (Due Soon)`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
          <span className="truncate">{mouldName}</span>
        </span>
      );
    }

    // Default: DONE (green pill with green dot, mould name inside, no 'DONE' text written)
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border shadow-2xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25 max-w-full"
        title={`${mouldName} (Maintained / OK)`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        <span className="truncate">{mouldName}</span>
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdFactory className="text-amber-600 dark:text-amber-400" size={22} />
              <span>Plant Head Executive Overview</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono font-semibold">
                Plant Head
              </span>
            </h1>
            
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Indicator */}
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#1a1d24] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-[#262a34] text-xs">
              <MdDateRange className="text-gray-400" size={16} />
              <span className="text-gray-500 dark:text-gray-400">Date:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                {prodDate || "Live Today"}
              </span>
            </div>

            {/* Filter Buttons */}
            <div className="bg-gray-100 dark:bg-[#1a1d24] p-1 rounded-lg flex items-center border border-gray-200 dark:border-[#262a34]">
              <button
                type="button"
                onClick={handlePrev}
                className={
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all " +
                  (filterType === "Prev"
                    ? "bg-white dark:bg-[#282d38] text-gray-900 dark:text-white shadow-xs font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")
                }
              >
                Previous Day
              </button>
              <button
                type="button"
                onClick={handleCurrent}
                className={
                  "px-3 py-1 text-xs font-semibold rounded-md transition-all " +
                  (filterType === "Current"
                    ? "bg-white dark:bg-[#282d38] text-gray-900 dark:text-white shadow-xs font-bold"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white")
                }
              >
                Current Day
              </button>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
                title="Download Excel Report"
              >
                <MdFileDownload size={16} />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={downloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition-colors"
                title="Download PDF Report"
              >
                <MdPictureAsPdf size={16} />
                <span>PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Plant Summary KPI Grid */}
        {plantSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">OEE</span>
              <span className="text-xl font-bold text-emerald-500 font-mono mt-0.5 block">{plantSummary.OEE}%</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Availability</span>
              <span className="text-xl font-bold text-cyan-400 font-mono mt-0.5 block">{plantSummary.Availability}%</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Performance</span>
              <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">{plantSummary.Performance}%</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Quality</span>
              <span className="text-xl font-bold text-purple-400 font-mono mt-0.5 block">{plantSummary.Quality}%</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Planned Qty</span>
              <span className="text-lg font-bold text-gray-800 dark:text-gray-200 font-mono mt-0.5 block">{plantSummary.Plan}</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Actual Qty</span>
              <span className="text-lg font-bold text-emerald-400 font-mono mt-0.5 block">{plantSummary.Actual}</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Achievement</span>
              <span className="text-lg font-bold text-emerald-500 font-mono mt-0.5 block">{plantSummary.Achievement}%</span>
            </div>

            <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-xl p-3 shadow-xs text-center">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium block">Total Downtime</span>
              <span className="text-lg font-bold text-rose-500 font-mono mt-0.5 block">
                {plantSummary.TotalDT ?? 0} <span className="text-xs font-sans font-medium text-gray-500 dark:text-gray-400">min</span>
              </span>
            </div>
          </div>
        )}

        {/* Machine Table */}
        <div className="bg-white dark:bg-[#181b21] border border-gray-200 dark:border-[#262a34] rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#262a34] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MdSpeed className="text-emerald-500" size={18} />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
                Machine-Wise Production, OEE & Downtime Breakdown
              </h2>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              Total Machines: {machines.length}
            </span>
          </div>

          <div className="overflow-x-auto max-h-[65vh]">
            <table ref={tableRef} className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-[#14161b] text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px] border-b border-gray-200 dark:border-[#262a34]">
                <tr>
                  <th rowSpan="2" className="py-3 px-3 border-r border-gray-200 dark:border-[#242832]">Machine</th>
                  <th rowSpan="2" className="py-3 px-3 border-r border-gray-200 dark:border-[#242832] whitespace-nowrap">Machine Status</th>
                  <th rowSpan="2" className="py-3 px-3 border-r border-gray-200 dark:border-[#242832]">Running Mould</th>
                  <th rowSpan="2" className="py-3 px-3 text-center border-r border-gray-200 dark:border-[#242832]">OEE</th>
                  <th rowSpan="2" className="py-3 px-3 text-center border-r border-gray-200 dark:border-[#242832]">Availability</th>
                  <th rowSpan="2" className="py-3 px-3 text-center border-r border-gray-200 dark:border-[#242832]">Performance</th>
                  <th rowSpan="2" className="py-3 px-3 text-center border-r border-gray-200 dark:border-[#242832]">Quality</th>
                  <th colSpan="3" className="py-2 px-3 text-center border-b border-r border-gray-200 dark:border-[#242832] bg-emerald-500/10 text-emerald-500">
                    Production Output
                  </th>
                  <th colSpan="1" className="py-2 px-3 text-center border-b border-r border-gray-200 dark:border-[#242832] bg-rose-500/10 text-rose-500">
                    Rejection
                  </th>
                  <th colSpan="6" className="py-2 px-3 text-center border-b border-gray-200 dark:border-[#242832] bg-amber-500/10 text-amber-500">
                    Downtime Losses (Minutes)
                  </th>
                </tr>
                <tr className="bg-gray-50 dark:bg-[#16191f] text-[10px]">
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Plan</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Actual</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Achieve %</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Rej Qty</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Man</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Material</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Method</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Machine</th>
                  <th className="py-2 px-2 text-center border-r border-gray-200 dark:border-[#242832]">Mould</th>
                  <th className="py-2 px-2 text-center font-bold text-rose-400">Total DT</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-[#222630] font-mono">
                {machines.map((m, i) => {
                  const oee = Number(m.OEE) || 0;
                  const ach = Number(m.Achievement) || 0;

                  // Machine status: RUNNING, IDLE, DOWN
                  const rawMachStatus = (m.MachineStatus || "").toUpperCase();
                  const machineStatus =
                    rawMachStatus === "RUNNING" || rawMachStatus === "IDLE" || rawMachStatus === "DOWN"
                      ? rawMachStatus
                      : (Number(m.Actual) > 0 || oee > 0 ? "RUNNING" : (Number(m.TotalDT) > 60 ? "DOWN" : "IDLE"));

                  // Mould Maintenance Status: OVERDUE > DUE > DONE
                  const mouldRaw = (m.RunningMould || "").trim();
                  const hasMould = mouldRaw && mouldRaw !== "-" && mouldRaw.toLowerCase() !== "null";
                  let mouldStatus = m.MouldStatus || null;
                  if (hasMould && !mouldStatus) {
                    const norm = (s) => {
                      if (!s) return null;
                      const str = String(s).toUpperCase().trim();
                      if (str.includes("OVERDUE") || str === "3") return "OVERDUE";
                      if (str.includes("DUE") || str === "2") return "DUE";
                      if (str.includes("DONE") || str.includes("NORMAL") || str.includes("COMPLETE") || str === "1" || str === "7") return "DONE";
                      return null;
                    };
                    const p = norm(m.PMStatus);
                    const h = norm(m.HCStatus);
                    if (p === "OVERDUE" || h === "OVERDUE") mouldStatus = "OVERDUE";
                    else if (p === "DUE" || h === "DUE") mouldStatus = "DUE";
                    else if (p === "DONE" || h === "DONE") mouldStatus = "DONE";
                    else mouldStatus = "DONE";
                  }

                  return (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-[#1d2129] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#222630]">
                        {m.Machine}
                      </td>
                      <td className="py-2.5 px-3 border-r border-gray-200 dark:border-[#222630] whitespace-nowrap">
                        {renderMachineStatusBadge(machineStatus)}
                      </td>
                      <td className="py-2.5 px-3 font-sans border-r border-gray-200 dark:border-[#222630] max-w-[220px]">
                        {renderRunningMouldBadge(mouldRaw, mouldStatus)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-[#222630]">
                        <span className={`font-bold ${oee >= 70 ? "text-emerald-400" : oee > 0 ? "text-yellow-400" : "text-gray-400"}`}>
                          {m.OEE}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-[#222630] text-gray-700 dark:text-gray-300">
                        {m.Availability}%
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-[#222630] text-gray-700 dark:text-gray-300">
                        {m.Performance}%
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-gray-200 dark:border-[#222630] text-gray-700 dark:text-gray-300">
                        {m.Quality}%
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {m.Plan}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] font-bold text-gray-900 dark:text-white">
                        {m.Actual}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630]">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ach >= 90
                              ? "bg-emerald-500/15 text-emerald-400"
                              : ach >= 70
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {m.Achievement}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-rose-400 font-bold">
                        {m.Rejected || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {Number(m.Man) > 0 ? <span className="font-bold text-amber-500">{m.Man}</span> : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {Number(m.Material) > 0 ? <span className="font-bold text-amber-500">{m.Material}</span> : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {Number(m.Method) > 0 ? <span className="font-bold text-amber-500">{m.Method}</span> : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {Number(m.MachineDT) > 0 ? <span className="font-bold text-amber-500 dark:text-amber-400">{m.MachineDT}</span> : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {Number(m.Mould) > 0 ? <span className="font-bold text-amber-500 dark:text-amber-400">{m.Mould}</span> : <span className="text-gray-400">0</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold">
                        {Number(m.TotalDT) > 0 ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-500 dark:text-rose-400">
                            {m.TotalDT}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
