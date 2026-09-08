import { getBackendBaseUrl } from "../../utils/apiConfig";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdOutlinePrecisionManufacturing, MdArrowForward } from "react-icons/md";

const BASE = getBackendBaseUrl();

export default function CompactCockpitWidget({ maxItems = 6, showHeader = true }) {
  const navigate = useNavigate();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/performance/machine-cockpit/summary`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setMachines(res.data.data);
        }
      } catch (e) {
        console.warn("CompactCockpitWidget fetch notice:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const displayList = machines.slice(0, maxItems);

  const isMouldLoaded = (mould, currentJob) => {
    const name = mould?.description || mould?.name || currentJob || "";
    if (!name || name === "Standard Production Mould" || name.toLowerCase().includes("no mould")) {
      return false;
    }
    return true;
  };

  const getMouldDisplayName = (mould, currentJob) => {
    if (!isMouldLoaded(mould, currentJob)) {
      return "No mould loaded";
    }
    return mould?.description || mould?.name || currentJob;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      {showHeader && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
              <MdOutlinePrecisionManufacturing className="text-[#0284c7]" size={16} />
              <span>Machine Cockpit — live status</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={() => navigate("/machine-cockpit")}
            className="text-xs font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Open full cockpit</span>
            <MdArrowForward size={13} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-6 text-center text-xs text-slate-400">
          Loading live machine cockpit...
        </div>
      ) : displayList.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          No live machines available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayList.map((machine) => {
            const isRunning = machine.status.toLowerCase() === "running";

            return (
              <div
                key={machine.id}
                onClick={() => navigate(`/machine-cockpit/${encodeURIComponent(machine.id)}`)}
                className="bg-slate-50/70 hover:bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs cursor-pointer transition-all hover:border-[#0284c7] hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* TOP ROW */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-black text-slate-800 tracking-tight">
                        {machine.name}
                      </h3>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isRunning
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          isRunning ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                        }`}
                      ></span>
                      <span>{isRunning ? "Running" : "Down"}</span>
                    </span>
                  </div>

                  {/* BIG OEE CALLOUT */}
                  <div className="mt-2.5">
                    <span className="text-xl font-black text-slate-800 font-mono tracking-tight">
                      {machine.performance?.oee ?? 0}%
                    </span>
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase ml-1">
                      OEE
                    </span>
                  </div>

                  {/* MINI STATS ROW */}
                  <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-slate-200/60 text-[10px]">
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">PROD</span>
                      <span className="font-mono font-bold text-slate-700 truncate block">
                        {machine.production?.actual ?? 0}/{machine.production?.expected ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">DOWNTIME</span>
                      <span className="font-mono font-bold text-slate-700 truncate block">
                        {machine.currentState?.downtime || "0m"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[8px] text-slate-400 font-bold uppercase block">REJ.</span>
                      <span className="font-mono font-bold text-slate-700 truncate block">
                        {machine.production?.rejected ?? 0} pcs
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-semibold border truncate max-w-[120px] ${
                      isMouldLoaded(machine.mould, machine.currentJob)
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    <span>{getMouldDisplayName(machine.mould, machine.currentJob)}</span>
                  </span>

                  <span className="text-[10px] font-bold text-[#0284c7] flex items-center gap-0.5">
                    <span>Open</span>
                    <MdArrowForward size={11} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
