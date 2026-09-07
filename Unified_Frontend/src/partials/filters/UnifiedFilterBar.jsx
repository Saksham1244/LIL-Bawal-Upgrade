import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MdCalendarToday,
  MdAccessTime,
  MdFilterAlt,
  MdCheckCircle,
  MdRefresh,
} from "react-icons/md";

import { getShiftLetter } from "../../utils/shiftUtils";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

const getLocalShift = () => getShiftLetter();

export default function UnifiedFilterBar({
  selectedMode = "SHIFT",
  onFilterChange,
  showCustomRange = true,
  showShiftPicker = true,
  compact = false,
}) {
  const initialShift = getLocalShift();
  const todayStr = new Date().toISOString().split("T")[0];

  const [currentShiftInfo, setCurrentShiftInfo] = useState({
    date: todayStr,
    shift: initialShift,
  });

  const [mode, setMode] = useState(selectedMode);
  const [selectedShift, setSelectedShift] = useState(initialShift);
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [isCustomOpen, setIsCustomOpen] = useState(selectedMode === "CUSTOM" || selectedMode === "DATE");

  // Fetch today's actual plant production date and current active shift from SQL Server
  useEffect(() => {
    const fetchLiveProdDate = async () => {
      try {
        const res = await axios.get(`${BASE}/PerformanceHome/GetProdDate`);
        if (res.data?.success && res.data?.data) {
          const liveDate = res.data.data.ProdDate
            ? new Date(res.data.data.ProdDate).toISOString().split("T")[0]
            : todayStr;
          const liveShift = res.data.data.ShiftName || getLocalShift();
          setCurrentShiftInfo({ date: liveDate, shift: liveShift });
          setSelectedShift(liveShift);
          setStartDate(liveDate);
          setEndDate(liveDate);

          if (onFilterChange) {
            onFilterChange({
              mode: mode === "CUSTOM" ? "DATE" : mode,
              shift: liveShift,
              startDate: liveDate,
              endDate: liveDate,
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch live prod date, falling back to local date:", err);
      }
    };
    fetchLiveProdDate();
  }, []);

  const handleModeClick = (newMode) => {
    setMode(newMode);
    if (newMode === "CUSTOM") {
      setIsCustomOpen(true);
      if (onFilterChange) {
        onFilterChange({
          mode: "DATE",
          shift: selectedShift,
          startDate,
          endDate,
        });
      }
    } else {
      setIsCustomOpen(false);
      if (onFilterChange) {
        onFilterChange({
          mode: newMode,
          shift: newMode === "SHIFT" ? selectedShift : undefined,
          startDate: newMode === "DAY" ? startDate : undefined,
          endDate: newMode === "DAY" ? endDate : undefined,
        });
      }
    }
  };

  const handleShiftSelect = (s) => {
    setSelectedShift(s);
    if (onFilterChange) {
      onFilterChange({
        mode: mode === "CUSTOM" ? "DATE" : mode,
        shift: s,
        startDate,
        endDate,
      });
    }
  };

  const handleApplyCustom = () => {
    if (onFilterChange) {
      onFilterChange({
        mode: "DATE",
        shift: selectedShift,
        startDate,
        endDate,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-xl p-3 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Mode Pill Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 dark:bg-[#101216] p-1 rounded-lg border border-gray-200 dark:border-[#222632]">
          {/* CURRENT SHIFT */}
          <button
            type="button"
            onClick={() => handleModeClick("SHIFT")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              mode === "SHIFT"
                ? "bg-white dark:bg-[#1e232d] text-emerald-500 dark:text-emerald-400 shadow-xs border border-emerald-500/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Current Shift</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              {currentShiftInfo.shift}
            </span>
          </button>

          {/* DAY */}
          <button
            type="button"
            onClick={() => handleModeClick("DAY")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === "DAY"
                ? "bg-white dark:bg-[#1e232d] text-cyan-500 dark:text-cyan-400 shadow-xs border border-cyan-500/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Day
          </button>

          {/* WEEK */}
          <button
            type="button"
            onClick={() => handleModeClick("WEEK")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === "WEEK"
                ? "bg-white dark:bg-[#1e232d] text-indigo-500 dark:text-indigo-400 shadow-xs border border-indigo-500/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Week
          </button>

          {/* MONTH */}
          <button
            type="button"
            onClick={() => handleModeClick("MONTH")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              mode === "MONTH"
                ? "bg-white dark:bg-[#1e232d] text-purple-500 dark:text-purple-400 shadow-xs border border-purple-500/30"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Month
          </button>

          {/* CUSTOM RANGE */}
          {showCustomRange && (
            <button
              type="button"
              onClick={() => handleModeClick("CUSTOM")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                mode === "CUSTOM" || mode === "DATE"
                  ? "bg-white dark:bg-[#1e232d] text-amber-500 dark:text-amber-400 shadow-xs border border-amber-500/30"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <MdCalendarToday size={13} />
              <span>Custom Range</span>
            </button>
          )}
        </div>

        {/* Right Side: Shift Quick Switcher or Active Info */}
        <div className="flex items-center gap-2">
          {showShiftPicker && mode === "SHIFT" && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#101216] px-2 py-1 rounded-lg border border-gray-200 dark:border-[#222632]">
              <span className="text-[11px] text-gray-400 mr-1">Shift:</span>
              {["A", "B", "C"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleShiftSelect(s)}
                  className={`w-6 h-6 text-xs font-bold rounded flex items-center justify-center transition-all ${
                    selectedShift === s
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Plant Date Info Pill */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-400 font-mono bg-gray-50 dark:bg-[#12141a] px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-[#222632]">
            <MdAccessTime size={14} className="text-gray-400" />
            <span>{currentShiftInfo.date}</span>
            <span className="text-gray-500">•</span>
            <span className="text-emerald-400 font-bold">Shift {selectedShift}</span>
          </div>
        </div>
      </div>

      {/* Expanded Custom Date Range Inputs */}
      {isCustomOpen && showCustomRange && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-[#222632] flex flex-wrap items-center gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-gray-50 dark:bg-[#101216] border border-gray-300 dark:border-[#2b303d] rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-gray-50 dark:bg-[#101216] border border-gray-300 dark:border-[#2b303d] rounded-lg px-2.5 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <button
            type="button"
            onClick={handleApplyCustom}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg transition-colors shadow-xs flex items-center gap-1"
          >
            <MdCheckCircle size={14} />
            <span>Apply Range</span>
          </button>
        </div>
      )}
    </div>
  );
}
