import React from 'react';

/**
 * Concentric 3-ring circular gauge inspired by reference OEE dashboard
 * Ring 1 (outer): Availability (Green)
 * Ring 2 (middle): Performance (Yellow/Gold)
 * Ring 3 (inner): Quality (Cyan/Teal)
 */
export default function ConcentricGauge({
  oee = 50,
  availability = 55,
  performance = 93,
  quality = 99,
  oeeDelta = '+2%',
  oeeDeltaPositive = true,
  size = 190,
}) {
  const center = size / 2;
  const strokeWidth = Math.max(7, Math.round(size * 0.045));

  // Radii for 3 rings
  const rAvail = center - strokeWidth - 2;
  const rPerf = rAvail - strokeWidth - 5;
  const rQual = rPerf - strokeWidth - 5;

  const circAvail = 2 * Math.PI * rAvail;
  const circPerf = 2 * Math.PI * rPerf;
  const circQual = 2 * Math.PI * rQual;

  const clamp = (val) => Math.min(100, Math.max(0, Number(val) || 0));

  const offsetAvail = circAvail - (clamp(availability) / 100) * circAvail;
  const offsetPerf = circPerf - (clamp(performance) / 100) * circPerf;
  const offsetQual = circQual - (clamp(quality) / 100) * circQual;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background tracks */}
        <circle
          cx={center}
          cy={center}
          r={rAvail}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-[#252a34]"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={rPerf}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-[#252a34]"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={rQual}
          fill="none"
          stroke="currentColor"
          className="text-gray-200 dark:text-[#252a34]"
          strokeWidth={strokeWidth}
        />

        {/* Outer Ring: Availability (Green) */}
        <circle
          cx={center}
          cy={center}
          r={rAvail}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circAvail}
          strokeDashoffset={offsetAvail}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {/* Middle Ring: Performance (Yellow/Gold) */}
        <circle
          cx={center}
          cy={center}
          r={rPerf}
          fill="none"
          stroke="#eab308"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circPerf}
          strokeDashoffset={offsetPerf}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />

        {/* Inner Ring: Quality (Cyan) */}
        <circle
          cx={center}
          cy={center}
          r={rQual}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circQual}
          strokeDashoffset={offsetQual}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {Math.round(oee)}%
        </span>
        {oeeDelta && (
          <span
            className={
              oeeDeltaPositive
                ? "text-xs font-semibold mt-0.5 flex items-center gap-0.5 text-emerald-500"
                : "text-xs font-semibold mt-0.5 flex items-center gap-0.5 text-rose-500"
            }
          >
            {oeeDelta} {oeeDeltaPositive ? '▲' : '▼'}
          </span>
        )}
      </div>
    </div>
  );
}
