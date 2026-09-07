import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../../partials/dashboardLayout/DashboardLayout";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Select from "react-select";
import {
  MdSearch,
  MdPrint,
  MdFileDownload,
  MdPictureAsPdf,
  MdPhotoLibrary,
  MdCheckCircle,
  MdCancel,
  MdArrowBack,
  MdTune,
  MdAssignment,
} from "react-icons/md";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

export default function PMCheckPointReport() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const printRef = useRef();

  // Mould List for Searcher
  const [mouldList, setMouldList] = useState([]);
  const [selectedMouldOption, setSelectedMouldOption] = useState(null);

  // Available Instances for selected mould
  const [instanceList, setInstanceList] = useState([]);
  const [selectedInstanceOption, setSelectedInstanceOption] = useState(null);
  const [loadingInstances, setLoadingInstances] = useState(false);

  // Active Report Parameters
  const [activeMouldID, setActiveMouldID] = useState(searchParams.get("mouldID") || "");
  const [activeMouldName, setActiveMouldName] = useState(searchParams.get("mouldName") || "");
  const [activeInstance, setActiveInstance] = useState(searchParams.get("instance") || "");
  const [activeCheckListID, setActiveCheckListID] = useState(searchParams.get("checkListID") || "");

  // Report Data
  const [headerData, setHeaderData] = useState({});
  const [reportData, setReportData] = useState([]);
  const [loadingHeader, setLoadingHeader] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);

  // 1. Fetch all available moulds on mount
  useEffect(() => {
    const fetchMoulds = async () => {
      try {
        const res = await axios.get(`${BASE}/MouldSummary/MouldName`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const options = res.data.data.map((m) => ({
            value: m.MouldID,
            label: `${m.MouldName} (${m.MouldID})`,
            mouldID: m.MouldID,
            mouldName: m.MouldName,
          }));
          setMouldList(options);

          // If query param exists, auto-select it
          const qMouldID = searchParams.get("mouldID");
          if (qMouldID) {
            const found = options.find((o) => o.mouldID === qMouldID);
            if (found) {
              setSelectedMouldOption(found);
              setActiveMouldID(found.mouldID);
              setActiveMouldName(found.mouldName);
            }
          }
        }
      } catch (err) {
        console.error("Error loading mould list:", err);
      }
    };
    fetchMoulds();
  }, [searchParams]);

  // 2. When Mould is chosen, fetch its PM instances from history
  useEffect(() => {
    if (!activeMouldID) return;

    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const res = await axios.get(`${BASE}/MouldMaintenanceHistoryPM/PmHistoryDetailTable`, {
          params: { mouldID: activeMouldID },
        });

        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const instances = res.data.data.map((item, idx) => ({
            value: item.Instance,
            label: `Instance ${item.Instance} (Life: ${item.AtMouldLife || "-"})`,
            instance: item.Instance,
            checkListID: item.CheckListID,
            mouldID: item.MouldID,
            mouldName: item.MouldName,
            atMouldLife: item.AtMouldLife,
            partName: item.PartName,
            userName: item.UserName,
          }));

          setInstanceList(instances);

          // Auto-select instance from query param or default to latest instance
          const qInstance = searchParams.get("instance");
          const target = qInstance
            ? instances.find((i) => String(i.instance) === String(qInstance)) || instances[0]
            : instances[0];

          if (target) {
            setSelectedInstanceOption(target);
            setActiveInstance(target.instance);
            setActiveCheckListID(target.checkListID || activeCheckListID || 1);
          }
        } else {
          setInstanceList([]);
          setSelectedInstanceOption(null);
        }
      } catch (err) {
        console.error("Error fetching instances:", err);
        setInstanceList([]);
      } finally {
        setLoadingInstances(false);
      }
    };

    fetchInstances();
  }, [activeMouldID]);

  // 3. Fetch Header & Checkpoint details when active parameters change
  useEffect(() => {
    if (!activeInstance) return;

    const fetchDetails = async () => {
      setLoadingHeader(true);
      setLoadingTable(true);

      try {
        // Header
        const hRes = await axios.get(
          `${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/PmHeaderDetails`,
          {
            params: {
              checkListID: activeCheckListID || 1,
              instance: activeInstance,
              mouldID: activeMouldID,
            },
          }
        );
        if (hRes.data?.success && hRes.data.data) {
          setHeaderData(hRes.data.data[0] || {});
        }
      } catch (err) {
        console.error("Error loading header details:", err);
      } finally {
        setLoadingHeader(false);
      }

      try {
        // Checkpoint Table
        const cRes = await axios.get(
          `${BASE}/MouldMaintenanceHistoryPM/PMCheckpointDetails/PmCheckpointDetails`,
          {
            params: {
              checkListID: activeCheckListID || 1,
              instance: activeInstance,
            },
          }
        );
        if (cRes.data?.success && Array.isArray(cRes.data.data)) {
          const mapped = cRes.data.data.map((item) => ({
            instance: item.Instance,
            mouldName: item.MouldName,
            checklistName: item.CheckListName,
            checkpointName: item.CheckPointName,
            checkArea: item.CheckArea,
            checkpointItem: item.CheckPointItems,
            checkPointArea: item.CheckPointArea,
            checkingMethod: item.CheckingMethod,
            judgementCriteria: item.JudgementCriteria,
            checkListType: item["Check List Type"],
            upperLimit: item.UpperLimit,
            lowerLimit: item.LowerLimit,
            standard: item.Standard,
            value: item.CheckPointValue,
            status: item.OKNOK,
            remark: item.Observation,
            timeStamp: item.Timestamp,
          }));
          setReportData(mapped);
        } else {
          setReportData([]);
        }
      } catch (err) {
        console.error("Error loading checkpoints:", err);
        setReportData([]);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchDetails();
  }, [activeMouldID, activeInstance, activeCheckListID]);

  // Handlers
  const handleMouldSelect = (option) => {
    setSelectedMouldOption(option);
    if (option) {
      setActiveMouldID(option.mouldID);
      setActiveMouldName(option.mouldName);
      if (setSearchParams) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("mouldID", option.mouldID);
          next.delete("instance");
          return next;
        });
      }
    } else {
      setActiveMouldID("");
      setActiveMouldName("");
      setSelectedInstanceOption(null);
      setActiveInstance(null);
      setInstanceList([]);
      if (setHeaderData) setHeaderData({});
      if (setReportData) setReportData([]);
      if (setImages) setImages([]);
      if (setSearchParams) setSearchParams({});
    }
  };

  const handleInstanceSelect = (option) => {
    setSelectedInstanceOption(option);
    if (option) {
      setActiveInstance(option.instance);
      if (option.checkListID) setActiveCheckListID(option.checkListID);
      if (setSearchParams) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          next.set("instance", option.instance);
          return next;
        });
      }
    } else {
      setActiveInstance(null);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Export Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PM_Report");
    XLSX.writeFile(workbook, `PM_Report_${activeMouldName || "Mould"}_Inst_${activeInstance}.xlsx`);
  };

  // Export PDF
  const exportToPDF = () => {
    const doc = new jsPDF("l", "mm", "a4");
    doc.setFontSize(14);
    doc.text("Preventive Maintenance Checkpoint Report", 14, 15);
    doc.setFontSize(9);
    doc.text(`Mould: ${activeMouldName} | Instance: ${activeInstance} | Date: ${new Date().toLocaleDateString()}`, 14, 22);

    const head = [["Timestamp", "Checkpoint Name", "Check Area", "Item", "Method", "Criteria", "Std", "Value", "Status", "Observation"]];
    const body = reportData.map((r) => [
      r.timeStamp ? new Date(r.timeStamp).toLocaleString() : "-",
      r.checkpointName || "-",
      r.checkArea || "-",
      r.checkpointItem || "-",
      r.checkingMethod || "-",
      r.judgementCriteria || "-",
      r.standard || "-",
      r.value || "-",
      r.status || "-",
      r.remark || "-",
    ]);

    autoTable(doc, {
      startY: 26,
      head,
      body,
      styles: { fontSize: 7, halign: "center" },
      headStyles: { fillColor: [16, 185, 129] },
      theme: "grid",
    });

    doc.save(`PM_Report_${activeMouldName}_Inst_${activeInstance}.pdf`);
  };

    const selectDarkStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#ffffff',
      borderColor: state.isFocused ? '#0284c7' : '#cbd5e1',
      boxShadow: state.isFocused ? '0 0 0 1px #0284c7' : 'none',
      '&:hover': { borderColor: '#94a3b8' },
      borderRadius: '0.5rem',
      fontSize: '12px',
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
      fontSize: '12px',
      fontWeight: state.isSelected ? '600' : '500',
      cursor: 'pointer',
    }),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8" ref={printRef}>
        {/* Top Header & Searcher Bar */}
        <div className="bg-white  border border-slate-200  rounded-xl p-5 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800  flex items-center gap-2">
                <MdAssignment className="text-emerald-500" size={24} />
                <span>Preventive Maintenance Checkpoint Report</span>
              </h1>
              
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate("/mould-history")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100  hover:bg-gray-200  text-slate-700  transition-colors"
              >
                <MdArrowBack size={15} />
                <span>History</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/PMCheckpointImages?mouldName=${encodeURIComponent(activeMouldName)}&instance=${activeInstance}`
                  )
                }
                disabled={!activeMouldName || !activeInstance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-2xs transition-colors"
                title="View Inspection Images"
              >
                <MdPhotoLibrary size={15} />
                <span>Images</span>
              </button>
              <button
                type="button"
                onClick={exportToExcel}
                disabled={reportData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-2xs transition-colors"
              >
                <MdFileDownload size={15} />
                <span>Excel</span>
              </button>
              <button
                type="button"
                onClick={exportToPDF}
                disabled={reportData.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-2xs transition-colors"
              >
                <MdPictureAsPdf size={15} />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white shadow-2xs transition-colors"
              >
                <MdPrint size={15} />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* MOULD SEARCHER & INSTANCE SELECTOR CONTROLS */}
          <div className="mt-5 pt-4 border-t border-slate-200  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
            {/* Searchable Mould Dropdown */}
            <div>
              <label className="text-xs font-semibold text-slate-700  mb-1.5 block flex items-center gap-1.5">
                <MdSearch className="text-emerald-500" size={16} />
                <span>Select / Search Mould ({mouldList.length} Moulds)</span>
              </label>
              <Select
                options={mouldList}
                value={selectedMouldOption}
                onChange={handleMouldSelect}
                isSearchable
                isClearable
                placeholder="Search by Mould Name or ID..."
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={selectDarkStyles}
              />
            </div>

            {/* PM Instance Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-700  mb-1.5 block flex items-center gap-1.5">
                <MdTune className="text-cyan-400" size={16} />
                <span>Select PM Instance</span>
              </label>
              <Select
                options={instanceList}
                value={instanceList.find((i) => String(i.instance) === String(activeInstance)) || selectedInstanceOption || null}
                onChange={handleInstanceSelect}
                isDisabled={!activeMouldID || loadingInstances}
                placeholder={
                  loadingInstances
                    ? "Loading instances..."
                    : instanceList.length === 0
                    ? "No PM records found for mould"
                    : "Select Instance..."
                }
                menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                menuPosition="fixed"
                styles={selectDarkStyles}
              />
            </div>

            {/* Quick Status Pill */}
            <div className="flex flex-col justify-end">
              <span className="text-[11px] text-slate-400 block mb-1">Active Selection</span>
              <div className="bg-gray-100  border border-slate-200  px-3.5 py-2 rounded-lg text-xs flex items-center justify-between">
                <span className="truncate font-medium text-slate-800 ">
                  {activeMouldName ? `${activeMouldName}` : "No mould selected"}
                </span>
                <span className="font-mono font-bold text-emerald-400 shrink-0 ml-2">
                  {activeInstance ? `Instance #${activeInstance}` : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SPECIFICATION & EXECUTION OVERVIEW PANEL */}
        <div className="bg-white  border border-slate-200  rounded-xl p-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Mould Specification & Sign-Off Details
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Checklist</span>
              <span className="font-bold text-slate-800  truncate block mt-0.5">
                {headerData.CheckListName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Part Name</span>
              <span className="font-bold text-slate-800  truncate block mt-0.5">
                {headerData.PartName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Material</span>
              <span className="font-bold text-slate-800  truncate block mt-0.5">
                {headerData.MaterialName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Model Code</span>
              <span className="font-bold text-slate-800  truncate block mt-0.5">
                {headerData.ModelCode || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Machine Tonnage</span>
              <span className="font-bold text-slate-800  truncate block mt-0.5">
                {headerData.MCTonnage || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Mould Life</span>
              <span className="font-bold text-emerald-400 font-mono block mt-0.5">
                {headerData.AtMouldLife || headerData.MouldLife || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">PM Frequency</span>
              <span className="font-bold text-cyan-400 font-mono block mt-0.5">
                {headerData.PMFreqCount || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">PM Due Shots</span>
              <span className="font-bold text-amber-400 font-mono block mt-0.5">
                {headerData.PMDueShots || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">User Name</span>
              <span className="font-semibold text-slate-800  truncate block mt-0.5">
                {headerData.UserName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Approval Name</span>
              <span className="font-semibold text-slate-800  truncate block mt-0.5">
                {headerData.ApproverName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Customer</span>
              <span className="font-semibold text-slate-800  truncate block mt-0.5">
                {headerData.CustomerName || "--"}
              </span>
            </div>

            <div className="bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Gate Type</span>
              <span className="font-semibold text-slate-800  truncate block mt-0.5">
                {headerData.GateType || "--"}
              </span>
            </div>

            <div className="col-span-2 bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">Start Time</span>
              <span className="font-mono text-slate-700  text-[11px] block mt-0.5 truncate">
                {headerData.StartTime || "--"}
              </span>
            </div>

            <div className="col-span-2 bg-slate-50  border border-slate-200  p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 block">End Time</span>
              <span className="font-mono text-slate-700  text-[11px] block mt-0.5 truncate">
                {headerData.EndTime || "--"}
              </span>
            </div>
          </div>
        </div>

        {/* CHECKPOINT DATA TABLE */}
        <div className="bg-white  border border-slate-200  rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200  flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800  tracking-wide">
              Inspection Checkpoint Items ({reportData.length} checkpoints)
            </h2>
            {loadingTable && <span className="text-xs text-slate-400">Refreshing table...</span>}
          </div>

          <div className="overflow-x-auto max-h-[60vh]">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 z-10 bg-gray-100  text-slate-700  font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 ">
                <tr>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Checkpoint Name</th>
                  <th className="py-3 px-3">Check Area</th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Judgement Criteria</th>
                  <th className="py-3 px-3 text-center">Std</th>
                  <th className="py-3 px-3 text-center">Value</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Observation</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-[#222630]">
                {reportData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400 text-xs">
                      {activeMouldID
                        ? "No checkpoint records found for this instance."
                        : "Please select a Mould and PM Instance above to load inspection report."}
                    </td>
                  </tr>
                ) : (
                  reportData.map((item, idx) => {
                    const isOk = String(item.status).toUpperCase() === "OK";

                    return (
                      <tr key={idx} className="hover:bg-slate-50  transition-colors">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {item.timeStamp ? new Date(item.timeStamp).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-800 ">
                          {item.checkpointName || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 ">
                          {item.checkArea || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 ">
                          {item.checkpointItem || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 ">
                          {item.checkingMethod || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600  max-w-[180px] truncate">
                          {item.judgementCriteria || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-slate-700 ">
                          {item.standard || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800 ">
                          {item.value || "-"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isOk
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {isOk ? <MdCheckCircle size={12} /> : <MdCancel size={12} />}
                            {item.status || "-"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500  truncate max-w-[160px]">
                          {item.remark || "-"}
                        </td>
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
