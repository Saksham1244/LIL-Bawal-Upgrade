import React from "react";
import { MdOutlinePrecisionManufacturing, MdCheckCircle } from "react-icons/md";

export default function MachineParametersCard({ machines, selected, onSelect }) {
  if (!machines || machines.length === 0) {
    return (
      <div className="py-4 text-center text-xs text-gray-500">
        Loading machine telemetry channels...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
      {machines.map((machine, index) => {
        const isSelected = selected === index;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(index)}
            className={`shrink-0 px-4 py-3 rounded-xl border text-left transition-all duration-200 flex items-center gap-3 ${
              isSelected
                ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border-emerald-500 text-white shadow-lg shadow-emerald-950/40"
                : "bg-gray-50 dark:bg-[#13151b] border-gray-200 dark:border-[#222632] text-gray-400 hover:text-gray-200 hover:border-gray-400 dark:hover:border-[#333a4d]"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isSelected
                  ? "bg-emerald-500 text-black font-bold"
                  : "bg-gray-200 dark:bg-[#1a1d26] text-gray-500"
              }`}
            >
              <MdOutlinePrecisionManufacturing size={18} />
            </div>

            <div className="min-w-0">
              <div className={`text-xs font-bold truncate ${isSelected ? "text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                {machine}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`}></span>
                <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                  {isSelected ? "Channel Active" : "Click to Inspect"}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
