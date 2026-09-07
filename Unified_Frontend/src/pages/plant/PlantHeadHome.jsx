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

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

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
      setMachines(Array.isArray(data) ? data : []);
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
      setPlantSummary(data[0] || data);
    } catch (err) {
      console.error("Plant Summary API Error:", err);
    }
  };

  // Fetch Production Date
  const fetchProdDate = async () => {
    try {
      const res = await fetch(`${BASE}/PerformanceHome/GetProdDate`);
      const data = await res.json();

      if (data && data.length > 0) {
        const date = new Date(data[0].ProdDate).toISOString().split("T")[0];
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
        "Plan", "Actual", "Achievement", "Total DT"
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
      "Machine", "Running Mould", "OEE %", "Availability %", "Performance %", "Quality %",
      "Plan Qty", "Actual Qty", "Achievement %", "Rejection Qty",
      "Man DT", "Material DT", "Method DT", "Machine DT", "Mould DT", "Total DT"
    ]);

    machines.forEach((m) => {
      wsData.push([
        m.Machine,
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
      "Machine", "Running Mould", "OEE", "Avail", "Perf", "Qual",
      "Plan", "Actual", "Achieve", "Rej", "Man", "Mat", "Meth", "Mach", "Mould", "Total DT"
    ]];

    const body = machines.map((m) => [
      m.Machine,
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

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdFactory className="text-amber-400" size={22} />
              <span>Plant Head Executive Overview</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono font-normal">
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
              <span className="text-lg font-bold text-rose-500 font-mono mt-0.5 block">{plantSummary.TotalDT}</span>
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

                  return (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-[#1d2129] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-sans font-bold text-gray-900 dark:text-white border-r border-gray-200 dark:border-[#222630]">
                        {m.Machine}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-[#222630] truncate max-w-[160px]">
                        {m.RunningMould || "-"}
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
                        {m.Man || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {m.Material || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {m.Method || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {m.MachineDT || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center border-r border-gray-200 dark:border-[#222630] text-gray-600 dark:text-gray-400">
                        {m.Mould || 0}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-rose-500">
                        {m.TotalDT || 0}
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
