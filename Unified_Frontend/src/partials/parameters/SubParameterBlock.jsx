// src/partials/parameters/SubParameterBlock.jsx
import React from "react";
import CustomToggle from "./CustomToggle";
import ParameterChart from "../charts/parameters/ParameterChart";
import { MdChecklist, MdShowChart } from "react-icons/md";

// Infer unit from label
const getUnit = (label = "") => {
  if (label.includes("Pressure")) return "bar";
  if (label.includes("Speed")) return "mm/s";
  if (label.includes("Temperature")) return "°C";
  if (label.includes("Time")) return "sec";
  if (label.includes("Position")) return "mm";
  return "";
};

export default function SubParameterBlock({
  subParam,
  groupIdx,
  subIdx,
  onToggle,
  onSelectAll,
  timeLabels,
  apiData,
}) {
  const activeSteps = subParam.steps.filter((step) => step.active);
  const allActive = subParam.steps.every((step) => step.active);
  const unit = getUnit(subParam.name);

  return (
    <div className="bg-gray-50/50 dark:bg-[#121419] border border-gray-200 dark:border-[#20242e] rounded-xl p-4 transition-all">
      {/* Sub Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
            {subParam.name}
          </span>
          {activeSteps.length > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold flex items-center gap-1">
              <MdShowChart size={12} />
              {activeSteps.length} Active
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectAll(groupIdx, subIdx)}
          className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-500 flex items-center gap-1 transition-colors"
        >
          <MdChecklist size={14} />
          <span>{allActive ? "Deselect All" : "Select All"}</span>
        </button>
      </div>

      {/* Grid of Toggle Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        {subParam.steps.map((step, stepIdx) => (
          <CustomToggle
            key={step.label}
            label={step.label}
            unit={unit}
            active={step.active}
            onClick={() => onToggle(groupIdx, subIdx, stepIdx)}
          />
        ))}
      </div>

      {/* Embedded Chart if any step is active */}
      {activeSteps.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#20242e]">
          <ParameterChart
            parameterData={activeSteps}
            timeLabels={timeLabels}
            apiData={apiData}
            height={280}
          />
        </div>
      )}
    </div>
  );
}
