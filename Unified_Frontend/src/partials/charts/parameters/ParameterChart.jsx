// src/partials/charts/parameters/ParameterChart.jsx
import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = [
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#8B5CF6", // Violet
  "#F59E0B", // Amber
  "#EC4899", // Rose
  "#3B82F6", // Blue
  "#F97316", // Orange
  "#14B8A6", // Teal
];

// Memoized Custom Tooltip for zero-lag hovering
const CustomTooltip = React.memo(({ active, payload, label, apiData }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-[#12141a]/95 border border-[#2a303f] p-3 rounded-xl shadow-2xl text-xs backdrop-blur-md min-w-[200px]">
      <div className="font-mono text-gray-400 font-semibold mb-2 pb-1.5 border-b border-[#2a303f] flex items-center justify-between">
        <span className="flex items-center gap-1">⏱️ Timestamp</span>
        <span className="text-white font-mono">{label}</span>
      </div>

      <div className="space-y-1.5">
        {payload.map((item, idx) => {
          const unit = apiData?.[item.name]?.unit || "";
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-gray-300">
                <span
                  className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: item.stroke }}
                ></span>
                <span className="font-medium truncate max-w-[150px]">{item.name}</span>
              </span>
              <span className="font-mono font-bold text-white shrink-0">
                {item.value != null ? Number(item.value).toFixed(1) : "--"} {unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default function ParameterChart({
  parameterData = [],
  timeLabels = [],
  apiData = {},
  height = 360,
}) {
  const seriesLabels = useMemo(() => {
    return parameterData.map((p) => p.label);
  }, [parameterData]);

  const backendKeys = useMemo(() => {
    return seriesLabels.filter((label) => apiData && apiData[label]);
  }, [seriesLabels, apiData]);

  // FAST O(N) Hash-Map Indexing + Downsampling (Prevents 640k loops & lagging)
  const chartData = useMemo(() => {
    if (backendKeys.length === 0) {
      const labels =
        Array.isArray(timeLabels) && timeLabels.length > 0
          ? timeLabels.map((h) => `${String(h).padStart(2, "0")}:00:00`)
          : Array.from({ length: 12 }, (_, i) => `T${i + 1}`);

      return labels.map((lbl, idx) => {
        const row = { time: lbl };
        parameterData.forEach((p) => {
          row[p.label] = p.values?.[idx] ?? null;
        });
        return row;
      });
    }

    // 1. Fast O(N) hash map construction
    const timeMap = new Map();

    backendKeys.forEach((paramKey) => {
      const entry = apiData[paramKey];
      if (entry && Array.isArray(entry.labels)) {
        const len = entry.labels.length;
        for (let i = 0; i < len; i++) {
          const t = entry.labels[i];
          let row = timeMap.get(t);
          if (!row) {
            row = { time: t };
            timeMap.set(t, row);
          }
          row[paramKey] = entry.values[i];
        }
      }
    });

    // 2. Sort chronologically
    let sorted = Array.from(timeMap.values()).sort((a, b) =>
      a.time.localeCompare(b.time)
    );

    // 3. Smooth Downsampling if points exceed 180 (Keeps UI at smooth 60 FPS)
    if (sorted.length > 180) {
      const step = Math.ceil(sorted.length / 180);
      const sampled = [];
      for (let i = 0; i < sorted.length; i += step) {
        sampled.push(sorted[i]);
      }
      // Always include the latest real-time point
      if (sampled[sampled.length - 1] !== sorted[sorted.length - 1]) {
        sampled.push(sorted[sorted.length - 1]);
      }
      return sampled;
    }

    return sorted;
  }, [backendKeys, apiData, timeLabels, parameterData]);

  if (!Array.isArray(parameterData) || parameterData.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-50 dark:bg-[#12141a] border border-dashed border-gray-300 dark:border-[#262b35] rounded-2xl flex flex-col items-center justify-center p-6 text-center">
        <span className="text-3xl mb-2">⚡</span>
        <h4 className="text-sm font-bold text-gray-300 mb-1">No Active Signals</h4>
        <p className="text-gray-500 text-xs max-w-sm">
          Select one or more parameters below (e.g. Injection Pressure, Speed, or Barrel Temperature) to plot live telemetry curves.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-[#13151b] border border-gray-200 dark:border-[#20242e] rounded-2xl p-4 shadow-sm">
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.25} />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155", opacity: 0.3 }}
              minTickGap={30}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#334155", opacity: 0.3 }}
            />
            <Tooltip content={<CustomTooltip apiData={apiData} />} isAnimationActive={false} />
            <Legend
              wrapperStyle={{ paddingTop: "14px", fontSize: "12px" }}
              formatter={(value) => (
                <span className="text-slate-800 dark:text-slate-100 font-bold px-1.5">{value}</span>
              )}
            />
            {seriesLabels.map((lbl, idx) => (
              <Line
                key={lbl}
                type="monotone"
                dataKey={lbl}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                isAnimationActive={false} // Instant 0ms render
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
