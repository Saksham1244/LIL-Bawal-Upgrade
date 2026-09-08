import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../partials/dashboardLayout/DashboardLayout";
import UnifiedFilterBar from "../../partials/filters/UnifiedFilterBar";
import PlantOEETrendChart from "../../partials/charts/performance/PlantOEETrendChart";
import AvailabilityTrendChart from "../../partials/charts/performance/AvailabilityTrendChart";
import PerformanceTrendChart from "../../partials/charts/performance/PerformanceTrendChart";
import QualityTrendChart from "../../partials/charts/performance/QualityTrendChart";
import { machinePerformanceAPI } from "../../services/operations/machinePerformanceAPI";
import { fetchPlantData } from "../../services/operations/homePlantDataAPI";
import { fetchPerformancePlantData } from "../../services/operations/performancePlantDataAPI";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MdSpeed,
  MdCheckCircle,
  MdTimer,
  MdWarningAmber,
  MdOutlinePrecisionManufacturing,
  MdArrowForward,
} from "react-icons/md";

import { getShiftLetter } from "../../utils/shiftUtils";

const BASE_URL = getBackendBaseUrl();

const getLocalShift = () => getShiftLetter();

export default function Performance() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [filterMode, setFilterMode] = useState("SHIFT");
  const [activeShift, setActiveShift] = useState(getLocalShift());

  // Redux store data
  const plantData = useSelector((state) => state.plant.plantData || []);
  const planActualData = useSelector((state) => state.plant.planActualData || []);
  const okTotalData = useSelector((state) => state.plant.okTotalData || []);
  const oeeData = useSelector((state) => state.plant.oeeData || []);
  const totalDowntimeData = useSelector((state) => state.performance.totalDowntimeData || []);
  const goodRejectedData = useSelector((state) => state.performance.goodRejectedData || []);

  useEffect(() => {
    dispatch(fetchPlantData({ mode: "SHIFT" }));
    dispatch(fetchPerformancePlantData({ mode: "SHIFT" }));
  }, [dispatch]);

  const handleFilterChange = ({ mode, shift, startDate, endDate }) => {
    setFilterMode(mode);
    if (shift) setActiveShift(shift);
    dispatch(fetchPlantData({ mode, shift, startDate, endDate }));
    dispatch(fetchPerformancePlantData({ mode, startDate, endDate }));
  };

  // Metrics
  const oeeValue = Number(oeeData[0]?.OEE) || (plantData.length > 0
    ? Math.round(plantData.reduce((acc, m) => acc + (Number(m.OEEPercent) || 0), 0) / plantData.length)
    : 37);

  const availabilityPct = Number(oeeData[0]?.Availability) || (plantData.length > 0
    ? Math.round(plantData.reduce((acc, m) => acc + (Number(m.AvailabilityPercent) || 0), 0) / plantData.length)
    : 70);

  const performancePct = Number(oeeData[0]?.Performance) || (planActualData[0]?.TotalExpectedQty > 0
    ? Math.round((planActualData[0]?.TotalActualQty / planActualData[0]?.TotalExpectedQty) * 100)
    : 100);

  const expectedQty = Number(planActualData[0]?.TotalExpectedQty) || 0;
  const actualQty = Number(planActualData[0]?.TotalActualQty) || 0;
  const goodQty = okTotalData[0]?.TotalGoodQty !== undefined && okTotalData[0]?.TotalGoodQty !== null
    ? Number(okTotalData[0].TotalGoodQty)
    : actualQty;
  const rejectedQty = actualQty ? Math.max(0, actualQty - goodQty) : 0;

  const qualityPct = actualQty > 0
    ? Number(((goodQty / actualQty) * 100).toFixed(2))
    : (oeeData[0]?.Quality !== undefined && oeeData[0]?.Quality !== null ? Number(oeeData[0].Quality) : 100);

  // Pie chart data for OEE
  const oeePieData = [
    { name: "OEE", value: oeeValue, color: "#10B981" },
    { name: "Remaining", value: Math.max(0, 100 - oeeValue), color: "#222632" },
  ];

  // Pie chart data for Quality
  const qualityPieData = [
    { name: "Good Parts", value: goodQty, color: "#06B6D4" },
    { name: "Bad Parts", value: rejectedQty, color: "#F43F5E" },
  ];

  // Bar chart data for Expected vs Actual
  const perfBarData = [
    { name: "Expected Qty", quantity: expectedQty, fill: "#6366F1" },
    { name: "Actual Output", quantity: actualQty, fill: "#10B981" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-[#222630]">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              <MdSpeed className="text-emerald-500" size={24} />
              <span>Plant Performance Intelligence</span>
            </h1>
          </div>
        </div>

        {/* Global Filter Bar */}
        <UnifiedFilterBar
          selectedMode={filterMode}
          onFilterChange={handleFilterChange}
        />

        {/* 4 Revamped KPI Intelligence Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Plant Overall OEE */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Plant Overall OEE
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                  {oeeValue}%
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${oeeValue >= 65 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {oeeValue >= 65 ? "Optimal" : "Requires Attention"}
              </span>
            </div>

            <div className="h-40 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={oeePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {oeePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-black text-gray-900 dark:text-white font-mono">{oeeValue}%</span>
                <span className="text-[10px] text-gray-400 font-semibold">OEE SCORE</span>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-gray-100 dark:border-[#222632] text-xs text-gray-400">
              Target: <span className="font-bold text-gray-300">70%</span> | Shift {activeShift}
            </div>
          </div>

          {/* Card 2: Availability (Running vs Downtime) */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Plant Availability
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                  {availabilityPct}%
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400">
                Uptime Ratio
              </span>
            </div>

            <div className="space-y-3 my-auto py-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Operating Time
                  </span>
                  <span className="font-mono font-bold text-gray-200">{availabilityPct}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-[#222632] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${availabilityPct}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span> Downtime Loss
                  </span>
                  <span className="font-mono font-bold text-gray-200">{Math.max(0, 100 - availabilityPct)}%</span>
                </div>
                <div className="h-2.5 bg-gray-200 dark:bg-[#222632] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - availabilityPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-gray-100 dark:border-[#222632] text-xs text-gray-400">
              Operating Efficiency: <span className="font-bold text-emerald-400">{availabilityPct}%</span>
            </div>
          </div>

          {/* Card 3: Performance Expected vs Actual */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Performance (Output)
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                  {performancePct}%
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400">
                Units Produced
              </span>
            </div>

            <div className="h-40 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perfBarData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(val) =>
                      val >= 1000000
                        ? `${(val / 1000000).toFixed(1)}M`
                        : val >= 1000
                        ? `${(val / 1000).toFixed(0)}k`
                        : val
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: "4px" }}
                    itemStyle={{ color: "#0F172A", fontWeight: 600 }}
                    formatter={(value) => [`${Number(value).toLocaleString()} units`, "Quantity"]}
                  />
                  <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                    {perfBarData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222632] text-xs text-gray-400">
              <span>Exp: <strong className="text-gray-700 dark:text-gray-300 font-mono">{expectedQty.toLocaleString()}</strong></span>
              <span>Act: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{actualQty.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Card 4: Quality Good vs Bad Parts */}
          <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Quality Yield Rate
                </span>
                <div className="text-2xl font-black text-gray-900 dark:text-white font-mono mt-1">
                  {qualityPct}%
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                Grade A Parts
              </span>
            </div>

            <div className="h-40 w-full flex items-center justify-center relative mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={qualityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    dataKey="value"
                    stroke="none"
                  >
                    {qualityPieData.map((entry, index) => (
                      <Cell key={`q-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "8px",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ color: "#0F172A", fontWeight: 700, marginBottom: "4px" }}
                    itemStyle={{ color: "#0F172A", fontWeight: 600 }}
                    formatter={(value) => [`${Number(value).toLocaleString()} parts`, "Quantity"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-emerald-400 font-mono">{qualityPct}%</span>
                <span className="text-[9px] text-gray-400 font-semibold">OK RATE</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#222632] text-xs text-gray-400">
              <span>Good: <strong className="text-cyan-400 font-mono">{goodQty.toLocaleString()}</strong></span>
              <span>Rej: <strong className="text-rose-400 font-mono">{rejectedQty.toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Detailed Trend Curves */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <PlantOEETrendChart />
          <AvailabilityTrendChart />
          <PerformanceTrendChart />
          <QualityTrendChart />
        </div>

        {/* Machine Wise Production & OEE Deck */}
        <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                <MdOutlinePrecisionManufacturing size={18} className="text-emerald-500" />
                <span>Connected Machines Status & Performance</span>
              </h2>
              
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {plantData.map((machine, idx) => {
              const mOEE = Number(machine.OEEPercent) || 0;
              const isRunning = Number(machine.ActualQuantity) > 0 || mOEE > 0;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(`/performance/machine/${machine.EquipmentName}`, { state: machine });
                    dispatch(machinePerformanceAPI({ mode: filterMode, equipmentName: machine.EquipmentName }));
                  }}
                  className="bg-gray-50 dark:bg-[#121419] border border-gray-200 dark:border-[#222632] rounded-xl p-4 cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-md group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-xs text-gray-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                        {machine.EquipmentName}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate max-w-[150px] mt-0.5">
                        {machine.MouldName || "Standard Mould"}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isRunning
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-rose-500/15 text-rose-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`}></span>
                      {isRunning ? "RUNNING" : "STOPPED"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-[#20242e] text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Actual</span>
                      <span className="font-bold font-mono text-gray-200">{machine.ActualQuantity ?? 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Downtime</span>
                      <span className="font-medium font-mono text-amber-400">{machine.Downtime ? `${machine.Downtime}m` : "0m"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Availability</span>
                      <span className="font-semibold font-mono text-cyan-400">{machine.AvailabilityPercent ?? 0}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">OEE</span>
                      <span className={`font-bold font-mono ${mOEE >= 70 ? "text-emerald-400" : mOEE > 0 ? "text-yellow-400" : "text-gray-400"}`}>
                        {mOEE}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
