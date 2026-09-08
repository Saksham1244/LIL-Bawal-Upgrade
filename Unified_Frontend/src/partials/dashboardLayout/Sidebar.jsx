import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  MdSearch,
  MdGridView,
  MdShowChart,
  MdForkRight,
  MdHub,
  MdCheckCircle,
  MdBuild,
  MdPeople,
  MdInventory2,
  MdChevronRight,
  MdExpandMore,
  MdExpandLess,
  MdExitToApp,
  MdFactory,
  MdNotificationsActive,
  MdTune,
  MdChecklistRtl,
  MdHistory,
  MdPhotoLibrary,
  MdAssessment,
} from "react-icons/md";

const getActiveModule = (path) => {
  const p = (path || "").toLowerCase();
  if (p.includes("/performance") || p.includes("cockpit") || p.includes("/downtime")) return "perf";
  if (p.includes("/parameters") || p.includes("/alarms")) return "process";
  if (p.includes("/mould-summary") || p.includes("/mouldsummary") || p.includes("/mould-history") || p.includes("history")) return "track";
  if (p.includes("/pm-status") || p.includes("/hc-status") || p.includes("spare-part") || p.includes("mould-param") || p.includes("checkpoint")) return "maint";
  if (p.includes("plant-head") || p.includes("planthead")) return "plant";
  if (p.includes("/home")) return "prod";
  return null;
};

export default function Sidebar({ sidebarOpen, setSidebarOpen, collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Track accordion state for menu modules with persistent memory across page changes
  const [openSections, setOpenSections] = useState(() => {
    const activeMod = getActiveModule(location.pathname);
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem("sidebar_open_sections") || "{}");
    } catch (e) {
      saved = {};
    }
    return {
      prod: true,
      perf: true,
      process: false,
      track: false,
      maint: false,
      plant: false,
      ...saved,
      ...(activeMod ? { [activeMod]: true } : {}),
    };
  });

  // Whenever the active route changes, keep its parent module section expanded
  useEffect(() => {
    const activeMod = getActiveModule(location.pathname);
    if (activeMod) {
      setOpenSections((prev) => {
        if (prev[activeMod]) return prev;
        const updated = { ...prev, [activeMod]: true };
        try {
          localStorage.setItem("sidebar_open_sections", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [location.pathname]);

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("sidebar_open_sections", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Logged-in user from localStorage or default to "Vishal"
  const storedUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userName = storedUser.Username || storedUser.userName || "Vishal";

  const getSubLinkClass = (isActive) =>
    "block py-1.5 px-3 rounded-md text-xs transition-colors " +
    (isActive
      ? "text-sky-400 font-semibold bg-white/10"
      : "text-slate-400 hover:text-white hover:bg-white/5");

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container - Dark Navy (#0B132B / #0F172A) strictly matching screenshot */}
      <aside
        className={
          "fixed top-0 left-0 z-40 h-screen flex flex-col bg-[#0b1329] border-r border-[#1e293b] text-slate-300 transition-all duration-300 ease-in-out lg:static " +
          (collapsed ? "w-16" : "w-64") +
          " " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        {/* Top Brand Logo Banner */}
        <div className="px-3.5 py-3.5 border-b border-[#1e293b] flex items-center gap-3 bg-[#080e1e]">
          <div className="bg-white px-2.5 py-1.5 rounded-lg shrink-0 shadow-sm flex items-center justify-center">
            <img
              src="/lumax-logo.png"
              alt="LUMAX"
              className={collapsed ? "h-6 w-auto object-contain" : "h-7 w-auto object-contain max-w-[95px]"}
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black tracking-wider text-white truncate">
                LUMAX
              </span>
              <span className="text-[10px] text-slate-400 font-medium truncate">
                Bawal Plant
              </span>
            </div>
          )}
        </div>

        {/* Search Bar (Matching Image 2 top) */}
        {!collapsed && (
          <div className="p-3 border-b border-[#1e293b]/70">
            <div className="flex items-center gap-2 bg-[#17233f] px-2.5 py-1.5 rounded-lg border border-[#27385e] text-xs text-slate-300">
              <MdSearch size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-400 w-full p-0 focus:ring-0"
              />
            </div>
          </div>
        )}

        {/* Navigation List - Module Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* MODULE 1: PRODUCTION MANAGEMENT */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("prod")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdGridView size={17} className="text-sky-400 shrink-0" />
                {!collapsed && <span>Production Management</span>}
              </div>
              {!collapsed && (openSections.prod ? <MdExpandLess size={16} /> : <MdExpandMore size={16} />)}
            </button>

            {(!collapsed && openSections.prod) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/home" end className={({ isActive }) => getSubLinkClass(isActive)}>
                  Production Report
                </NavLink>
                <NavLink to="/performance" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Plant OEE
                </NavLink>
              </div>
            )}
          </div>

          {/* MODULE 2: PERFORMANCE MANAGEMENT */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("perf")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdShowChart size={17} className="text-emerald-400 shrink-0" />
                {!collapsed && <span>Performance Management</span>}
              </div>
              {!collapsed && (openSections.perf ? <MdExpandLess size={16} /> : <MdChevronRight size={16} />)}
            </button>

            {(!collapsed && openSections.perf) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/performance" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Plant & Machine OEE
                </NavLink>
                <NavLink to="/machine-cockpit" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Machine Cockpit
                </NavLink>
                <NavLink to="/downtime" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Downtime & Loss Analysis
                </NavLink>
              </div>
            )}
          </div>

          {/* MODULE 3: PROCESS MONITORING */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("process")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdForkRight size={17} className="text-amber-400 shrink-0" />
                {!collapsed && <span>Process Monitoring</span>}
              </div>
              {!collapsed && (openSections.process ? <MdExpandLess size={16} /> : <MdChevronRight size={16} />)}
            </button>

            {(!collapsed && openSections.process) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/parameters" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Telemetry Parameters
                </NavLink>
                <NavLink to="/alarms" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Alarm Notifications
                </NavLink>
              </div>
            )}
          </div>

          {/* MODULE 4: TRACK & TRACE (MOULD SUITE) */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("track")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdHub size={17} className="text-purple-400 shrink-0" />
                {!collapsed && <span>Track & Trace</span>}
              </div>
              {!collapsed && (openSections.track ? <MdExpandLess size={16} /> : <MdChevronRight size={16} />)}
            </button>

            {(!collapsed && openSections.track) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/mould-summary" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Mould 360
                </NavLink>
                <NavLink to="/mould-history" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Maintenance History
                </NavLink>
              </div>
            )}
          </div>



          {/* MODULE 6: MAINTENANCE MODULE */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("maint")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdBuild size={17} className="text-sky-400 shrink-0" />
                {!collapsed && <span>Maintenance Module</span>}
              </div>
              {!collapsed && (openSections.maint ? <MdExpandLess size={16} /> : <MdChevronRight size={16} />)}
            </button>

            {(!collapsed && openSections.maint) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/pm-status" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Preventive Maintenance (PM)
                </NavLink>
                <NavLink to="/hc-status" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Health Checks (HC)
                </NavLink>
                <NavLink to="/spare-parts" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Spare Parts Inventory
                </NavLink>
                <NavLink to="/PMCheckPointReport" className={({ isActive }) => getSubLinkClass(isActive)}>
                  PM Checkpoint Report
                </NavLink>
                <NavLink to="/HCCheckPointReport" className={({ isActive }) => getSubLinkClass(isActive)}>
                  HC Checkpoint Report
                </NavLink>
              </div>
            )}
          </div>

          {/* MODULE 7: EXECUTIVE / PLANT HEAD */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection("plant")}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MdFactory size={17} className="text-amber-400 shrink-0" />
                {!collapsed && <span>Executive Cockpit</span>}
              </div>
              {!collapsed && (openSections.plant ? <MdExpandLess size={16} /> : <MdChevronRight size={16} />)}
            </button>

            {(!collapsed && openSections.plant) && (
              <div className="pl-8 pr-1 py-1 space-y-0.5">
                <NavLink to="/plant-head" className={({ isActive }) => getSubLinkClass(isActive)}>
                  Executive Comparison
                </NavLink>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Card at Bottom (Direct Match to Image 2 bottom-left) */}
        <div className="p-3 border-t border-[#1e293b] bg-[#080e1e]">
          {!collapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-white leading-tight truncate">
                    {userName.toLowerCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>ID: #1 • Administrator</span>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign Out"
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <MdExitToApp size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign Out"
              className="mx-auto text-slate-400 hover:text-white flex items-center justify-center"
            >
              <MdExitToApp size={18} />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
