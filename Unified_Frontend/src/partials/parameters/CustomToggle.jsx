// src/partials/parameters/CustomToggle.jsx
import React from "react";
import { MdCheck } from "react-icons/md";

export default function CustomToggle({ active, onClick, label, unit }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group ${
        active
          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-xs"
          : "bg-gray-50 dark:bg-[#12141a] border-gray-200 dark:border-[#222632] text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-[#2f3545]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 transition-colors border ${
            active
              ? "bg-emerald-500 border-emerald-400 text-black font-bold"
              : "border-gray-400/40 bg-transparent group-hover:border-gray-300"
          }`}
        >
          {active && <MdCheck size={13} className="stroke-2" />}
        </div>
        <span className="text-xs font-semibold truncate">{label}</span>
      </div>

      {unit && (
        <span
          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ml-2 shrink-0 ${
            active
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-gray-200 dark:bg-[#1c202a] text-gray-500 dark:text-gray-400"
          }`}
        >
          {unit}
        </span>
      )}
    </button>
  );
}
