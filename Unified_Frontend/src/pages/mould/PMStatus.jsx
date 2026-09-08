import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../../partials/DashboardLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import * as XLSX from 'xlsx';
import {
  MdEngineering,
  MdWarning,
  MdCalendarMonth,
  MdSpeed,
  MdRefresh,
  MdFileDownload,
  MdSearch,
  MdCheckCircle,
  MdAccessTime,
  MdTrendingUp,
} from 'react-icons/md';

// API endpoints
const BASE = getBackendBaseUrl();
const PM_STATUS_ENDPOINT = BASE + "/PMStatus/MouldPMStatus";
const PM_WEEKWISE_ENDPOINT = BASE + "/PMStatus/MouldPMWeekWisePlan";
const PM_MOULDWISE_PLAN_ENDPOINT = BASE + "/PMStatus/MouldWisePMPlan";
const PM_NEXT_DUE_ENDPOINT = BASE + "/PMStatus/MouldWiseNextPMDuedate";
const PM_NEXT_DUE_BY_SHOT_ENDPOINT = BASE + "/PMStatus/MouldWiseNextPMDueByShot";
const PM_NEXT6_ENDPOINT = BASE + "/PMStatus/DashboardNext6MonthPMPlan";

const formatDate = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? iso : d.toISOString().slice(0, 10);
  } catch {
    return iso;
  }
};

export default function PMStatus() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [pmStatusRows, setPmStatusRows] = useState([]);
  const [loadingPM, setLoadingPM] = useState(false);
  const [pmError, setPmError] = useState(null);

  const [weekWisePMPlan, setWeekWisePMPlan] = useState([]);
  const [loadingWeekPlan, setLoadingWeekPlan] = useState(false);

  const [pmPlanRows, setPmPlanRows] = useState([]);
  const [loadingPmPlan, setLoadingPmPlan] = useState(false);

  const [nextPmRows, setNextPmRows] = useState([]);
  const [loadingNextPm, setLoadingNextPm] = useState(false);

  const [pmShotRows, setPmShotRows] = useState([]);
  const [loadingPmShot, setLoadingPmShot] = useState(false);

  const [next6MonthsPlan, setNext6MonthsPlan] = useState([]);
  const [loadingNext6, setLoadingNext6] = useState(false);

  const fetchAll = async () => {
    setLoadingPM(true);
    setLoadingWeekPlan(true);
    setLoadingPmPlan(true);
    setLoadingNextPm(true);
    setLoadingPmShot(true);
    setLoadingNext6(true);
    setPmError(null);

    try {
      const [
        pmRes,
        weekRes,
        mouldPlanRes,
        nextPmRes,
        nextShotRes,
        next6Res,
      ] = await Promise.all([
        axios.get(PM_STATUS_ENDPOINT).catch(() => ({ data: { data: [] } })),
        axios.get(PM_WEEKWISE_ENDPOINT).catch(() => ({ data: { data: [] } })),
        axios.get(PM_MOULDWISE_PLAN_ENDPOINT).catch(() => ({ data: { data: [] } })),
        axios.get(PM_NEXT_DUE_ENDPOINT).catch(() => ({ data: { data: [] } })),
        axios.get(PM_NEXT_DUE_BY_SHOT_ENDPOINT).catch(() => ({ data: { data: [] } })),
        axios.get(PM_NEXT6_ENDPOINT).catch(() => ({ data: { data: [] } })),
      ]);

      // 1. PM Status rows
      const pmData = pmRes?.data?.data ?? [];
      setPmStatusRows(
        pmData.map((r) => {
          let statusStr = 'Normal';
          if (r.MouldPMStatus === 3 || r.MouldPMStatus === '3') statusStr = 'Overdue';
          else if (r.MouldPMStatus === 2 || r.MouldPMStatus === '2') statusStr = 'Due Soon';
          else if (typeof r.MouldPMStatus === 'string' && r.MouldPMStatus) statusStr = r.MouldPMStatus;

          return {
            mould: String(r.MouldName || r.MouldID || '-'),
            mouldID: String(r.MouldID || '-'),
            status: statusStr,
            statusCode: r.MouldPMStatus,
            nextPMDueDate: formatDate(r.NextPMDueDate),
            shotCount: Number(r.NextPMDue || 0),
          };
        })
      );

      // 2. Week wise plan
      const weekData = weekRes?.data?.data ?? [];
      setWeekWisePMPlan(
        weekData.map((r) => ({
          week: String(r.WeekName || '-'),
          plan: Number(r.PMPlanCount || 0),
        }))
      );

      // 3. Mould wise plan
      const planData = mouldPlanRes?.data?.data ?? [];
      setPmPlanRows(
        planData.map((r) => ({
          mould: String(r.MouldName || r.MouldID || '-'),
          mouldID: String(r.MouldID || '-'),
          planDate: formatDate(r.PlanDate),
        }))
      );

      // 4. Next PM by Date
      const nextData = nextPmRes?.data?.data ?? [];
      setNextPmRows(
        nextData.map((r) => ({
          mould: String(r.MouldName || r.MouldID || '-'),
          mouldID: String(r.MouldID || '-'),
          nextPMDate: formatDate(r.NextPMDueDate),
        }))
      );

      // 5. Next PM by Shot Count
      const shotData = nextShotRes?.data?.data ?? [];
      setPmShotRows(
        shotData.map((r) => ({
          mould: String(r.MouldName || r.MouldID || '-'),
          mouldID: String(r.MouldID || '-'),
          shotCount: Number(r.NextPMDue || 0),
        }))
      );

      // 6. Next 6 months plan
      const next6Data = next6Res?.data?.data ?? [];
      setNext6MonthsPlan(
        next6Data.map((r) => {
          const raw = String(r.Month || '');
          let monthLabel = raw;
          const parts = raw.split('-');
          if (parts.length === 2) {
            const y = Number(parts[0]);
            const m = Number(parts[1]);
            const dt = new Date(y, m - 1, 1);
            if (!isNaN(dt.getTime())) {
              monthLabel = dt.toLocaleString('default', { month: 'short' });
            }
          }
          return {
            month: monthLabel,
            count: Number(r.MouldsDueForPM || 0),
          };
        })
      );
    } catch (err) {
      console.error('Error loading PM status data:', err);
      setPmError('Unable to connect to PM Status telemetry.');
    } finally {
      setLoadingPM(false);
      setLoadingWeekPlan(false);
      setLoadingPmPlan(false);
      setLoadingNextPm(false);
      setLoadingPmShot(false);
      setLoadingNext6(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filtered rows based on search and active tab
  const filteredAlerts = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    return pmStatusRows.filter(
      (r) =>
        String(r.mould || '').toLowerCase().includes(q) ||
        String(r.status || '').toLowerCase().includes(q) ||
        String(r.nextPMDueDate || '').toLowerCase().includes(q)
    );
  }, [pmStatusRows, searchTerm]);

  const filteredPlan = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    return pmPlanRows.filter(
      (r) =>
        String(r.mould || '').toLowerCase().includes(q) ||
        String(r.planDate || '').toLowerCase().includes(q)
    );
  }, [pmPlanRows, searchTerm]);

  const filteredNextDate = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    return nextPmRows
      .filter(
        (r) =>
          String(r.mould || '').toLowerCase().includes(q) ||
          String(r.nextPMDate || '').toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(a.nextPMDate) - new Date(b.nextPMDate));
  }, [nextPmRows, searchTerm]);

  const filteredShotCount = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    return pmShotRows
      .filter((r) => String(r.mould || '').toLowerCase().includes(q))
      .sort((a, b) => a.shotCount - b.shotCount);
  }, [pmShotRows, searchTerm]);

  // KPI Calculations
  const totalMoulds = pmStatusRows.length || pmPlanRows.length || 0;
  const criticalAlerts = pmStatusRows.filter(
    (r) =>
      String(r.status || '').toLowerCase().includes('alert') ||
      String(r.status || '').toLowerCase().includes('warn') ||
      String(r.status || '').toLowerCase().includes('overdue') ||
      String(r.status || '').toLowerCase().includes('due') ||
      r.statusCode === 3 ||
      r.statusCode === 2
  ).length;
  const inPlanCount = pmPlanRows.length;
  const totalForecastShots = next6MonthsPlan.reduce((sum, item) => sum + item.count, 0);

  // Excel Export
  const handleExportExcel = () => {
    let exportData = [];
    let fileName = 'PM_Status_Report';

    if (activeTab === 'alerts') {
      exportData = filteredAlerts;
      fileName = 'PM_Alerts_Status';
    } else if (activeTab === 'plan') {
      exportData = filteredPlan;
      fileName = 'PM_In_Plan_Report';
    } else if (activeTab === 'dueDate') {
      exportData = filteredNextDate;
      fileName = 'PM_Due_By_Date';
    } else {
      exportData = filteredShotCount;
      fileName = 'PM_Due_By_Shot_Count';
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PM_Report');
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s.includes('alert') || s.includes('overdue') || s.includes('delay') || s.includes('critical')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
          {status}
        </span>
      );
    }
    if (s.includes('warn') || s.includes('due')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        {status || 'Normal'}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4 pb-8">
        {/* SECTION 1: CORPORATE HEADER BAR */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center shadow-xs shrink-0">
              <MdEngineering size={22} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-tight">
                Preventive Maintenance (PM)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <MdFileDownload size={16} />
              <span>Excel</span>
            </button>
            <button
              type="button"
              onClick={fetchAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
            >
              <MdRefresh size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: 4 KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284c7] flex items-center justify-center shrink-0">
              <MdEngineering size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Total PM Moulds
              </span>
              <span className="text-xl font-black text-slate-800 font-mono">
                {totalMoulds}
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <MdWarning size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Critical / Overdue
              </span>
              <span className="text-xl font-black text-rose-600 font-mono">
                {criticalAlerts}
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MdCalendarMonth size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Moulds in Plan
              </span>
              <span className="text-xl font-black text-emerald-600 font-mono">
                {inPlanCount}
              </span>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <MdTrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                6-Month Due Moulds
              </span>
              <span className="text-xl font-black text-amber-600 font-mono">
                {totalForecastShots}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: DUAL RECHARTS HISTOGRAMS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* CHART 1: WEEK-WISE PM PLAN HISTOGRAM */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MdCalendarMonth className="text-[#0284c7]" size={16} />
                <span>Week-Wise PM Plan Histogram</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {weekWisePMPlan.length} Weeks
              </span>
            </div>
            <div className="h-56 w-full">
              {loadingWeekPlan ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading histogram...
                </div>
              ) : weekWisePMPlan.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No week-wise plan records
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekWisePMPlan} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="week"
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
                        borderColor: "#CBD5E1",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="plan" name="Planned Moulds" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* CHART 2: NEXT 6 MONTHS PM FORECAST */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MdTrendingUp className="text-emerald-500" size={16} />
                <span>Next 6 Months PM Forecast</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                {next6MonthsPlan.length} Months
              </span>
            </div>
            <div className="h-56 w-full">
              {loadingNext6 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Loading forecast...
                </div>
              ) : next6MonthsPlan.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No forecast records available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={next6MonthsPlan} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="month"
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
                        borderColor: "#CBD5E1",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Bar dataKey="count" name="Moulds Due for PM" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 4: INTERACTIVE TABBED DATA WORKSPACE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          {/* TAB BAR & SEARCH ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            {/* TABS */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("alerts")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "alerts" ? "bg-[#0284c7] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span>PM Alerts & Status</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "alerts" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {pmStatusRows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("plan")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "plan" ? "bg-[#0284c7] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span>Mould-Wise PM Plan</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "plan" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {pmPlanRows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("dueDate")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "dueDate" ? "bg-[#0284c7] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span>Next Due by Date</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "dueDate" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {nextPmRows.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("shotCount")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer ${activeTab === "shotCount" ? "bg-[#0284c7] text-white shadow-2xs" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                <span>Due by Shot Count</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "shotCount" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {pmShotRows.length}
                </span>
              </button>
            </div>

            {/* INSTANT SEARCH INPUT */}
            <div className="relative w-full md:w-64">
              <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search moulds or dates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0284c7] focus:bg-white"
              />
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="overflow-x-auto mt-3 rounded-lg border border-slate-200" style={{ maxHeight: '380px' }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 sticky top-0 z-10 border-b border-slate-200">
                {activeTab === 'alerts' && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Description</th>
                    <th className="py-2.5 px-3">PM Status</th>
                    <th className="py-2.5 px-3">Next PM Due Date</th>
                    <th className="py-2.5 px-3 text-right">Remaining Shots</th>
                  </tr>
                )}
                {activeTab === 'plan' && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Description</th>
                    <th className="py-2.5 px-3">Planned Execution Date</th>
                  </tr>
                )}
                {activeTab === 'dueDate' && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Description</th>
                    <th className="py-2.5 px-3">Next PM Due Date</th>
                  </tr>
                )}
                {activeTab === 'shotCount' && (
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Mould Description</th>
                    <th className="py-2.5 px-3 text-right">Due Shot Threshold</th>
                  </tr>
                )}
              </thead>

              <tbody className="text-xs divide-y divide-slate-100">
                {/* 1. Alerts & Status */}
                {activeTab === 'alerts' && (
                  loadingPM ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">Loading PM alerts...</td>
                    </tr>
                  ) : filteredAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No matching PM status records</td>
                    </tr>
                  ) : (
                    filteredAlerts.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.mould}</td>
                        <td className="py-2.5 px-3">{getStatusBadge(row.status)}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{row.nextPMDueDate}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700">
                          {Number(row.shotCount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )
                )}

                {/* 2. Mould-Wise Plan */}
                {activeTab === 'plan' && (
                  loadingPmPlan ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">Loading mould plan...</td>
                    </tr>
                  ) : filteredPlan.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">No matching plan records</td>
                    </tr>
                  ) : (
                    filteredPlan.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.mould}</td>
                        <td className="py-2.5 px-3 font-mono text-[#0284c7] font-semibold">{row.planDate}</td>
                      </tr>
                    ))
                  )
                )}

                {/* 3. Next PM Due Date */}
                {activeTab === 'dueDate' && (
                  loadingNextPm ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">Loading next due dates...</td>
                    </tr>
                  ) : filteredNextDate.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">No records found</td>
                    </tr>
                  ) : (
                    filteredNextDate.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.mould}</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-600 font-bold">{row.nextPMDate}</td>
                      </tr>
                    ))
                  )
                )}

                {/* 4. Due by Shot Count */}
                {activeTab === 'shotCount' && (
                  loadingPmShot ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">Loading shot count thresholds...</td>
                    </tr>
                  ) : filteredShotCount.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-slate-400">No records found</td>
                    </tr>
                  ) : (
                    filteredShotCount.map((row, idx) => (
                      <tr key={idx} className="hover:bg-sky-50/40 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{row.mould}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600">
                          {Number(row.shotCount).toLocaleString()} shots
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
