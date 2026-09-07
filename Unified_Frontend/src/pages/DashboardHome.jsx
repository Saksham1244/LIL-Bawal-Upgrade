import CompactCockpitWidget from "../partials/cockpit/CompactCockpitWidget";
import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../partials/dashboardLayout/DashboardLayout';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  MdGridView,
  MdFileDownload,
  MdPictureAsPdf,
  MdRefresh,
} from 'react-icons/md';
import { getActiveShift, getShiftName } from '../utils/shiftUtils';

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || '').replace(/\/+$/, '');

export default function DashboardHome() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [period, setPeriod] = useState('Shift');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [shift, setShift] = useState('All');
  const [selectedLine, setSelectedLine] = useState('All');
  const [loading, setLoading] = useState(false);

  const showShift = period !== 'Shift';

  const [kpiMetrics, setKpiMetrics] = useState({
    totalPlanQty: 0,
    totalActualQty: 0,
    shortfall: 0,
    wipStatus: '0.0%',
    rollover: 0,
  });

  const [hourlyTrend, setHourlyTrend] = useState([]);
  const [lossPareto, setLossPareto] = useState([]);
  const [machineTable, setMachineTable] = useState([]);
  const [availableMoulds, setAvailableMoulds] = useState([]);

  // Fetch today's live production date on mount
  useEffect(() => {
    const fetchLiveDate = async () => {
      try {
        const res = await axios.get(`${BASE}/PerformanceHome/GetProdDate`);
        if (res.data?.success && res.data?.data) {
          const liveDate = res.data.data.ProdDate
            ? new Date(res.data.data.ProdDate).toISOString().split('T')[0]
            : todayStr;
          setStartDate(liveDate);
          setEndDate(liveDate);
        }
      } catch (err) {
        console.warn('Could not fetch live prod date:', err);
      }
    };
    fetchLiveDate();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const modeParam =
        period === 'Shift'
          ? 'SHIFT'
          : period === 'Day'
          ? 'DAY'
          : period === 'Week'
          ? 'WEEK'
          : period === 'Month'
          ? 'MONTH'
          : 'DATE';

      const shiftParam =
        showShift
          ? shift === 'All'
            ? null
            : shift === 'Shift 1'
            ? 'A'
            : shift === 'Shift 2'
            ? 'B'
            : shift === 'Shift 3'
            ? 'C'
            : shift
          : null;

      // 1. Fetch OEE
      const oeeRes = await axios.get(`${BASE}/Home/plantOEE`, {
        params: { mode: modeParam, startDate, endDate, shift: shiftParam },
      });
      const rawOee = oeeRes.data?.success && oeeRes.data.data?.[0]?.OEE;
      const oeeVal =
        rawOee !== null && rawOee !== undefined
          ? `${Number(rawOee).toFixed(1)}%`
          : '0.0%';

      // 2. Fetch Plan & Actual Qty
      const qtyRes = await axios.get(`${BASE}/Home/GetPlanActualQty`, {
        params: { mode: modeParam, startDate, endDate, shift: shiftParam },
      });
      let plan = 0;
      let actual = 0;
      if (qtyRes.data?.success && qtyRes.data.data?.[0]) {
        const row = qtyRes.data.data[0];
        actual = Number(row.TotalActualQty) || 0;
        plan = Number(row.TotalExpectedQty) || 0;
      }

      // 3. Fetch OK / Good Qty
      const okRes = await axios.get(`${BASE}/Home/GetOKTotalQty`, {
        params: { mode: modeParam, startDate, endDate, shift: shiftParam },
      });
      let rollover = 0;
      if (okRes.data?.success && okRes.data.data?.[0]) {
        const okRow = okRes.data.data[0];
        const good = Number(okRow.TotalGoodQty) || actual;
        rollover = Math.max(0, actual - good);
      }

      const shortfall = Math.max(0, plan - actual);

      setKpiMetrics({
        totalPlanQty: plan,
        totalActualQty: actual,
        shortfall,
        wipStatus: oeeVal,
        rollover,
      });

      // 4. Fetch Hourly / Period Trend
      const hourlyRes = await axios.get(`${BASE}/PerfMachine/GetHourlyExpActualQtyTrend`, {
        params: { Mode: modeParam, StartDate: startDate, EndDate: endDate, Shift: shiftParam },
      });
      if (hourlyRes.data?.success && Array.isArray(hourlyRes.data.data) && hourlyRes.data.data.length > 0) {
        const mapped = hourlyRes.data.data.map((item) => {
          let label = item.HourStart ? `${item.HourStart}` : item.TrendGroup || item.Day || item.TimeGroup || '';
          if (label === 'A') label = 'Shift 1';
          else if (label === 'B') label = 'Shift 2';
          else if (label === 'C') label = 'Shift 3';
          return {
            time: label,
            actual: Number(item.ActualQuantity || 0),
            target: Number(item.ExpectedQuantity || 0),
          };
        });
        setHourlyTrend(mapped);
      } else {
        setHourlyTrend([]);
      }

      // 5. Fetch Downtime Pareto
      const paretoRes = await axios.get(`${BASE}/DowntimeHome/GetPlantTop5Downtimes`, {
        params: { mode: modeParam, startDate, endDate, shift: shiftParam },
      });
      if (paretoRes.data?.success && Array.isArray(paretoRes.data.data) && paretoRes.data.data.length > 0) {
        const raw = paretoRes.data.data;
        const totalLoss = raw.reduce((sum, r) => sum + (Number(r.TotalDuration) || 0), 0) || 1;
        let cumulative = 0;
        const paretoMapped = raw.map((r) => {
          const count = Number(r.TotalDuration || r.OccurrenceCount || 0);
          cumulative += count;
          return {
            reason: r.LossName || r.LossDesc || 'General Loss',
            lossCount: count,
            cumulativePct: Math.round((cumulative / totalLoss) * 100),
          };
        });
        setLossPareto(paretoMapped);
      } else {
        setLossPareto([]);
      }

      // 6. Fetch Machine Table
      const machineRes = await axios.get(`${BASE}/PerformanceHome/machinewise`, {
        params: { mode: modeParam, startDate, endDate, shift: shiftParam },
      });
      if (machineRes.data?.success && Array.isArray(machineRes.data.data)) {
        setMachineTable(machineRes.data.data);
      } else {
        setMachineTable([]);
      }

      // 7. Fetch Moulds
      const mouldsRes = await axios.get(`${BASE}/MouldSummary/MouldName`);
      if (mouldsRes.data?.data && Array.isArray(mouldsRes.data.data)) {
        setAvailableMoulds(mouldsRes.data.data.slice(0, 30));
      }
    } catch (err) {
      console.error('Dashboard telemetry error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period, startDate, endDate, shift]);

  const filteredMachines = useMemo(() => {
    return machineTable.filter((m) => {
      return selectedLine === 'All' || m.EquipmentName === selectedLine;
    });
  }, [machineTable, selectedLine]);

  // Display metrics tailored for selected machine or plant
  const displayedMetrics = useMemo(() => {
    if (selectedLine !== 'All' && filteredMachines.length > 0) {
      const m = filteredMachines[0];
      const plan = Number(m.ExpectedQuantity) || 0;
      const actual = Number(m.ActualQuantity) || 0;
      const shortfall = Math.max(0, plan - actual);
      const oee = m.OEEPercent !== undefined && m.OEEPercent !== null ? `${m.OEEPercent}%` : '0.0%';
      return {
        totalPlanQty: plan,
        totalActualQty: actual,
        shortfall,
        wipStatus: oee,
      };
    }
    return kpiMetrics;
  }, [selectedLine, filteredMachines, kpiMetrics]);

  const handleExportExcel = () => {
    const data = filteredMachines.map((m) => ({
      'Machine Name': m.EquipmentName,
      'Running Mould': m.MouldName || 'Mould Not Loaded',
      'Expected Qty': m.ExpectedQuantity || 0,
      'Actual Qty': m.ActualQuantity || 0,
      'Gap': Math.max(0, (m.ExpectedQuantity || 0) - (m.ActualQuantity || 0)),
      'OEE %': `${m.OEEPercent || 0}%`,
      'Downtime (min)': m.Downtime || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Production_Status');
    XLSX.writeFile(wb, `Production_Report_${startDate}_${endDate}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');
    doc.setFontSize(14);
    doc.text('LIL Bawal - Production Overview Report', 40, 30);
    doc.setFontSize(10);
    doc.text(`Date: ${startDate} to ${endDate} | Period: ${period} ${period === 'Custom' ? `| Shift: ${shift}` : ''}`, 40, 48);

    const head = [['Machine Name', 'Running Mould', 'Expected Qty', 'Actual Qty', 'Gap', 'OEE %', 'Downtime (min)']];
    const body = filteredMachines.map((m) => [
      m.EquipmentName,
      m.MouldName || 'Mould Not Loaded',
      m.ExpectedQuantity || 0,
      m.ActualQuantity || 0,
      Math.max(0, (m.ExpectedQuantity || 0) - (m.ActualQuantity || 0)),
      `${m.OEEPercent || 0}%`,
      m.Downtime || 0,
    ]);

    autoTable(doc, {
      startY: 65,
      head,
      body,
      styles: { fontSize: 8, halign: 'center' },
      headStyles: { fillColor: [2, 132, 199] },
    });

    doc.save(`Production_Report_${startDate}_${endDate}.pdf`);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F1F5F9] text-slate-800 p-4 font-sans">
        {/* SECTION 1: FILTER & TITLE CARD (Clean 2-Row Executive Layout) */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs mb-4">
          {/* ROW 1: Title + Period Tabs + Export Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
            {/* Left: Icon Badge & Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs">
                <MdGridView size={22} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                  Production Overview
                </h2>
              </div>
            </div>

            {/* Right: Period Tabs + Export Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Period Toggle Pills */}
              <div className="flex items-center bg-slate-100/90 p-1 rounded-lg border border-slate-200/80 text-xs font-bold shadow-2xs">
                {['Shift', 'Day', 'Week', 'Month', 'Custom'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPeriod(p);
                      setShift('All');
                    }}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      period === p
                        ? 'bg-[#0284c7] text-white shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="bg-[#15803d] hover:bg-[#166534] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MdFileDownload size={15} />
                  <span>EXCEL</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <MdPictureAsPdf size={15} />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={fetchDashboardData}
                  disabled={loading}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <MdRefresh size={16} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* ROW 2: Balanced Responsive Filter Inputs */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${showShift ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 pt-3.5`}>
            {/* 1. START DATE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                START DATE
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs focus-within:border-sky-500">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriod('Custom');
                  }}
                  className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                />
              </div>
            </div>

            {/* 2. END DATE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                END DATE
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-slate-700 shadow-2xs focus-within:border-sky-500">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriod('Custom');
                  }}
                  className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                />
              </div>
            </div>

            {/* 3. SHIFT - Shown for Day, Week, Month, and Custom modes */}
            {showShift && (
              <div>
                <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                  SHIFT
                </label>
                <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs focus-within:border-sky-500">
                  <select
                    value={shift}
                    onChange={(e) => setShift(e.target.value)}
                    className="bg-transparent border-none outline-none p-0 text-xs font-bold cursor-pointer w-full pr-1"
                  >
                    <option value="All">All Shifts</option>
                    <option value="Shift 1">Shift 1</option>
                    <option value="Shift 2">Shift 2</option>
                    <option value="Shift 3">Shift 3</option>
                  </select>
                </div>
              </div>
            )}

            {/* 4. MACHINE */}
            <div>
              <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1 tracking-wider">
                MACHINE
              </label>
              <div className="flex items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-2xs focus-within:border-sky-500">
                <select
                  value={selectedLine}
                  onChange={(e) => setSelectedLine(e.target.value)}
                  className="bg-transparent border-none outline-none p-0 text-xs font-semibold cursor-pointer w-full"
                >
                  <option value="All">All Machines</option>
                  {machineTable.map((m, i) => (
                    <option key={i} value={m.EquipmentName}>
                      {m.EquipmentName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ROW OF 4 KPI METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              EXPECTED QTY
            </span>
            <div className="text-3xl font-black text-[#0369a1] font-mono tracking-tight leading-none">
              {displayedMetrics.totalPlanQty.toLocaleString()}
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
              ACTUAL QTY
            </span>
            <div className="text-3xl font-black text-[#0369a1] font-mono tracking-tight leading-none">
              {displayedMetrics.totalActualQty.toLocaleString()}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-2 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-3.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-4 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-4 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              GAP
            </span>
            <div className="text-3xl font-black text-[#0369a1] font-mono tracking-tight leading-none">
              {displayedMetrics.shortfall.toLocaleString()}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-1.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-2.5 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-3 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-3.5 rounded-2xs"></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              OEE %
            </span>
            <div className="text-3xl font-black text-[#0369a1] font-mono tracking-tight leading-none">
              {displayedMetrics.wipStatus}
            </div>
            <div className="flex items-end justify-end gap-0.5 mt-2 h-4 text-sky-400 self-end">
              <span className="w-1 bg-sky-200 h-1 rounded-2xs"></span>
              <span className="w-1 bg-sky-300 h-2 rounded-2xs"></span>
              <span className="w-1 bg-sky-400 h-3 rounded-2xs"></span>
              <span className="w-1 bg-sky-500 h-4 rounded-2xs"></span>
              <span className="w-1 bg-sky-600 h-3.5 rounded-2xs"></span>
            </div>
          </div>
        </div>

        {/* SECTION 3: DUAL CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
          {/* CHART 1: PLAN VS ACTUAL BY PERIOD */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-800">
                Plan vs Actual by Period
              </h3>
            </div>

            <div className="h-56 w-full">
              {hourlyTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={hourlyTrend}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: period === 'Day' ? 8 : 10, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                      interval={period === 'Day' ? 1 : 0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: '#0F172A', fontWeight: 700, marginBottom: 4 }}
                      itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                      formatter={(val, name) => [Number(val).toLocaleString(), name]}
                    />
                    <Bar
                      dataKey="actual"
                      name="Actual Prod."
                      fill="#00AEEF"
                      barSize={period === 'Week' ? 24 : period === 'Day' ? 10 : 16}
                      radius={[2, 2, 0, 0]}
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#EF4444' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No hourly production trend records found for this period
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#00AEEF] rounded-2xs inline-block"></span>
                <span>Actual Prod.</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block border border-white shadow-2xs"></span>
                <span className="text-[#EF4444] font-semibold">Target</span>
              </div>
            </div>
          </div>

          {/* CHART 2: SHORTFALL PARETO (LOSS ANALYSIS) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-800">
                Shortfall Pareto (Loss Analysis)
              </h3>
            </div>

            <div className="h-56 w-full">
              {lossPareto.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={lossPareto}
                    margin={{ top: 10, right: 15, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="reason"
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 9, fill: '#64748B' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tick={{ fontSize: 9, fill: '#EF4444' }}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        fontSize: 12,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      labelStyle={{ color: '#0F172A', fontWeight: 700, marginBottom: 4 }}
                      itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                      formatter={(val, name) => [
                        name === 'Cumulative %' ? `${val}%` : Number(val).toLocaleString(),
                        name,
                      ]}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="lossCount"
                      name="Loss Count"
                      fill="#F59E0B"
                      barSize={18}
                      radius={[2, 2, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulativePct"
                      name="Cumulative %"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#EF4444' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  No downtime losses recorded for this period
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 pt-2 text-[11px] font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EF4444] inline-block border border-white"></span>
                <span className="text-[#EF4444] font-semibold">Cumulative %</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#F59E0B] rounded-2xs inline-block"></span>
                <span>Loss Count</span>
              </div>
            </div>
          </div>
        </div>

        {/* MACHINE COCKPIT LIVE STATUS (IMAGE 2) */}
        <div className="mb-4">
          <CompactCockpitWidget maxItems={6} showHeader={true} />
        </div>

        {/* SECTION 4: BOTTOM STATUS TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Machine & Mould Wise Production Status
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {filteredMachines.length} Connected Injection Machines
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left text-xs text-slate-700">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[24%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Machine Name</th>
                  <th className="py-2.5 px-3">Running Mould</th>
                  <th className="py-2.5 px-3 text-right">Expected Qty</th>
                  <th className="py-2.5 px-3 text-right">Actual Qty</th>
                  <th className="py-2.5 px-3 text-right">Gap</th>
                  <th className="py-2.5 px-3 text-right">OEE %</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMachines.length > 0 ? (
                  filteredMachines.map((m, idx) => {
                    const actualVal = Number(m.ActualQuantity || 0);
                    const expectedVal = Number(m.ExpectedQuantity || 0);
                    const gap = Math.max(0, expectedVal - actualVal);
                    const oee = Number(m.OEEPercent || 0);
                    const isRunning = actualVal > 0 || oee > 0;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900 truncate" title={m.EquipmentName}>
                          {m.EquipmentName}
                        </td>
                        <td
                          className={`py-2.5 px-3 font-mono text-[11px] truncate ${
                            m.MouldName ? 'text-slate-700 font-semibold' : 'text-slate-400 italic'
                          }`}
                          title={m.MouldName || 'Mould Not Loaded'}
                        >
                          {m.MouldName || 'Mould Not Loaded'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                          {expectedVal.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {actualVal.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">
                          {gap > 0 ? (
                            <span className="text-rose-600 font-semibold">-{gap}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          {oee}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              isRunning
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1 ${
                                isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              }`}
                            ></span>
                            {isRunning ? 'Running' : 'Idle'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400 text-xs">
                      No matching production line records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

