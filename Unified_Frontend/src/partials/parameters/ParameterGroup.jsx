// src/partials/parameters/ParameterGroup.jsx
import React from "react";
import SubParameterBlock from "./SubParameterBlock";
import { MdLayers } from "react-icons/md";

export default function ParameterGroup({
  group,
  groupIdx,
  onToggle,
  onSelectAll,
  timeLabels,
  apiData,
}) {
  return (
    <div className="bg-white dark:bg-[#161920] border border-gray-200 dark:border-[#222632] rounded-2xl p-5 shadow-xs mb-5">
      {/* Group Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-200 dark:border-[#222632]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
            {group.group} Parameters
          </h2>
        </div>
        <span className="text-[11px] text-gray-500 font-mono">
          {group.subParameters.length} Parameter Families
        </span>
      </div>

      {/* Sub Parameter Blocks */}
      <div className="space-y-4">
        {group.subParameters.map((subParam, subIdx) => (
          <SubParameterBlock
            key={subParam.name}
            subParam={subParam}
            groupIdx={groupIdx}
            subIdx={subIdx}
            onToggle={onToggle}
            onSelectAll={onSelectAll}
            timeLabels={timeLabels}
            apiData={apiData}
          />
        ))}
      </div>
    </div>
  );
}
