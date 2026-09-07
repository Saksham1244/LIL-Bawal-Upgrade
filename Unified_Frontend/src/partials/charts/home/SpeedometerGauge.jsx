import React from "react";

/**
 * Geckoboard-inspired Semicircular Speedometer Needle Gauge
 * Matches the exact CSAT / Activation Rate / Satisfaction gauges in the uploaded images.
 * Light theme styled with crisp white surface, soft gray tracks, colored zones, and precision needle.
 */
export default function SpeedometerGauge({
  value = 0,
  min = 0,
  max = 100,
  label = "Overall OEE",
  subtext = "",
  availability = null,
  performance = null,
  quality = null,
  size = 240,
}) {
  const clampValue = Math.min(max, Math.max(min, Number(value) || 0));
  const percentage = (clampValue - min) / (max - min); // 0 to 1

  // Needle angle: -90 deg (0%) to +90 deg (100%)
  const needleAngle = -90 + percentage * 180;

  const width = size;
  const height = size * 0.65;
  const cx = width / 2;
  const cy = height - 16;
  const radius = width * 0.42;
  const strokeWidth = width * 0.085;

  // Arc path generator
  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, r, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Background track (-90 deg to 90 deg)
  const trackPath = describeArc(cx, cy, radius, -90, 90);
  // Red zone (-90 to -30)
  const redZonePath = describeArc(cx, cy, radius, -90, -30);
  // Yellow/Amber zone (-30 to 30)
  const yellowZonePath = describeArc(cx, cy, radius, -30, 30);
  // Green zone (30 to 90)
  const greenZonePath = describeArc(cx, cy, radius, 30, 90);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height} className="overflow-visible">
          {/* Base Gray Arc Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Subdued Colored Threshold Zones */}
          <path
            d={redZonePath}
            fill="none"
            stroke="#FCA5A5"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={yellowZonePath}
            fill="none"
            stroke="#FDE047"
            strokeWidth={strokeWidth}
          />
          <path
            d={greenZonePath}
            fill="none"
            stroke="#4ADE80"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Target tick line around 70% OEE (at 36 deg) */}
          {(() => {
            const tickP1 = polarToCartesian(cx, cy, radius - strokeWidth / 2 - 2, -90 + 0.7 * 180);
            const tickP2 = polarToCartesian(cx, cy, radius + strokeWidth / 2 + 3, -90 + 0.7 * 180);
            return (
              <line
                x1={tickP1.x}
                y1={tickP1.y}
                x2={tickP2.x}
                y2={tickP2.y}
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            );
          })()}

          {/* Needle Indicator */}
          <g transform={`rotate(${needleAngle} ${cx} ${cy})`} className="transition-transform duration-700 ease-out">
            {/* Needle shaft */}
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius * 0.92}
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Pointer tip */}
            <circle cx={cx} cy={cy - radius * 0.92} r="3" fill="#0F172A" />
          </g>

          {/* Center Hub */}
          <circle cx={cx} cy={cy} r="8" fill="#1E293B" />
          <circle cx={cx} cy={cy} r="4" fill="#FFFFFF" />

          {/* Min / Max Labels */}
          <text
            x={cx - radius - strokeWidth * 0.4}
            y={cy + 14}
            fontSize="11"
            fontWeight="600"
            fill="#64748B"
            textAnchor="middle"
          >
            {min}%
          </text>
          <text
            x={cx + radius + strokeWidth * 0.4}
            y={cy + 14}
            fontSize="11"
            fontWeight="600"
            fill="#64748B"
            textAnchor="middle"
          >
            {max}%
          </text>
        </svg>
      </div>

      {/* Huge Bold Value Display (Exactly matching Geckoboard 98.2% / 65.2% / 95%) */}
      <div className="text-center mt-1">
        <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-mono">
          {clampValue.toFixed(1)}%
        </div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
          {label}
        </div>
        {subtext && <div className="text-[11px] text-slate-400 mt-0.5">{subtext}</div>}
      </div>

      {/* Breakdown Chips (Availability, Performance, Quality) if provided */}
      {(availability !== null || performance !== null || quality !== null) && (
        <div className="grid grid-cols-3 gap-2 w-full mt-3 pt-3 border-t border-slate-100 text-center">
          {availability !== null && (
            <div className="bg-slate-50 rounded-lg py-1.5 px-1 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avail</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{Number(availability).toFixed(1)}%</span>
            </div>
          )}
          {performance !== null && (
            <div className="bg-slate-50 rounded-lg py-1.5 px-1 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Perf</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{Number(performance).toFixed(1)}%</span>
            </div>
          )}
          {quality !== null && (
            <div className="bg-slate-50 rounded-lg py-1.5 px-1 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Qual</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{Number(quality).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
