import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdMenu,
  MdKeyboardArrowDown,
  MdLogout,
  MdPerson,
  MdSensors,
  MdBrightness4,
} from "react-icons/md";
import { getShiftCode } from "../../utils/shiftUtils";

export default function Header({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [liveShift, setLiveShift] = useState(getShiftCode());
  const dropdownRef = useRef(null);

  const BASE_URL = (import.meta.env.VITE_BACKEND_BASE_URL || "").replace(/\/+$/, "");

  useEffect(() => {
    const fetchLiveShift = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/PerformanceHome/GetProdDate`);
        if (res.data?.success && res.data?.data?.ShiftName) {
          setLiveShift(`Shift ${res.data.data.ShiftName}`);
        }
      } catch (err) {
        setLiveShift(getShiftCode());
      }
    };
    fetchLiveShift();
    const interval = setInterval(fetchLiveShift, 60000);
    return () => clearInterval(interval);
  }, [BASE_URL]);

  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userName = storedUser.Username || storedUser.userName || "Vishal";

  // Real-time clock update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Breadcrumb mapping matching user screenshot
  const getBreadcrumb = () => {
    if (pathname === "/home" || pathname === "/") {
      return { parent: "Production Management", current: "Production Overview" };
    }
    if (pathname.includes("performance")) {
      return { parent: "OEE & Machine Performance", current: "Plant Performance" };
    }
    if (pathname.includes("downtime")) {
      return { parent: "Performance Management", current: "Loss & Downtime Analysis" };
    }
    if (pathname.includes("mould-summary")) {
      return { parent: "Track & Trace", current: "Mould 360" };
    }
    if (pathname.includes("mould-history")) {
      return { parent: "Maintenance Module", current: "Mould Maintenance History" };
    }
    if (pathname.includes("pm-status")) {
      return { parent: "Maintenance Module", current: "Preventive Maintenance Schedule" };
    }
    if (pathname.includes("plant-head")) {
      return { parent: "Executive Cockpit", current: "Plant Head Fleet Overview" };
    }
    return { parent: "Manufacturing Operations", current: "Operational Intelligence" };
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs font-sans">
      <div className="px-4 lg:px-6 h-13 flex items-center justify-between gap-4">
        {/* ================================================================= */}
        {/* LEFT: HAMBURGER TOGGLE + CLEAN BREADCRUMB (Matching Reference UI) */}
        {/* ================================================================= */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setSidebarOpen(!sidebarOpen);
              } else if (setCollapsed) {
                setCollapsed(!collapsed);
              }
            }}
            title="Toggle Sidebar"
          >
            <MdMenu size={20} />
          </button>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-slate-400 font-medium hidden sm:inline truncate">
              {breadcrumb.parent}
            </span>
            <span className="text-slate-300 hidden sm:inline font-bold">›</span>
            <span className="font-bold text-slate-800 tracking-tight truncate">
              {breadcrumb.current}
            </span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* RIGHT: LIVE TELEMETRY BADGE + ROTATION + PROFILE (Corporate Clean)*/}
        {/* ================================================================= */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Real-time Telemetry Pill */}
          <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 rounded-full text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900">
              Current Shift
            </span>
            <span className="text-emerald-300 text-[10px]">•</span>
            <span className="font-mono text-[11px] font-bold text-emerald-700">
              {liveShift}
            </span>
          </div>

          {/* Live Digital Clock */}
          <div className="hidden md:block font-mono text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
            {currentTime || "12:00 PM"}
          </div>

          {/* Plant Brand Watermark */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] font-black tracking-widest text-[#00529B] font-sans">
              LIL BAWAL
            </span>
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {userName}
              </span>
              <MdKeyboardArrowDown
                size={16}
                className={`text-slate-400 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {userName}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Plant Administrator (ID: #1)
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-sky-50 text-[9px] font-bold text-[#0284c7]">
                    PPMS LIL Bawal • 192.168.12.6
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <MdLogout size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
