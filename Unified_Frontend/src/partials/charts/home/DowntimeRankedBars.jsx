import React from 'react';

const PALETTE = [
  { bg: 'bg-rose-500/90 hover:bg-rose-500', text: 'text-white' },
  { bg: 'bg-amber-500/90 hover:bg-amber-500', text: 'text-white' },
  { bg: 'bg-teal-500/90 hover:bg-teal-500', text: 'text-white' },
  { bg: 'bg-cyan-600/90 hover:bg-cyan-600', text: 'text-white' },
  { bg: 'bg-blue-600/90 hover:bg-blue-600', text: 'text-white' },
  { bg: 'bg-indigo-600/90 hover:bg-indigo-600', text: 'text-white' },
  { bg: 'bg-emerald-600/90 hover:bg-emerald-600', text: 'text-white' },
  { bg: 'bg-orange-600/90 hover:bg-orange-600', text: 'text-white' },
];

function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  if (m <= 0) return '0m';
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  const remMin = Math.round(m % 60);

  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${remMin}m`;
  return `${remMin}m`;
}

export default function DowntimeRankedBars({ items = [], maxDisplay = 7 }) {
  const displayItems = items && items.length > 0 ? items.slice(0, maxDisplay) : [
    { name: 'BREAK / TEA TIME', duration: 180, trend: 'up' },
    { name: 'NO PLANNED PRODUCTION', duration: 120, trend: 'down' },
    { name: 'SET UP / CHANGEOVER', duration: 75, trend: 'up' },
    { name: 'MATERIAL SHORTAGE', duration: 45, trend: 'down' },
    { name: 'UNPLANNED CLEANING', duration: 35, trend: 'down' },
    { name: 'MACHINE RESET / FAULT', duration: 25, trend: 'down' },
  ];

  const maxVal = Math.max(...displayItems.map((i) => Number(i.duration || i.TotalDuration || i.Duration || 1)), 1);

  return (
    <div className="space-y-2.5 py-1">
      {displayItems.map((item, idx) => {
        const val = Number(item.duration || item.TotalDuration || item.Duration || 0);
        const name = (item.name || item.LossName || item.lossName || `Loss #${idx + 1}`).toUpperCase();
        const pct = Math.max(18, Math.min(100, Math.round((val / maxVal) * 100)));
        const color = PALETTE[idx % PALETTE.length];
        const isUp = item.trend !== 'down';

        return (
          <div key={idx} className="flex items-center gap-2 text-xs font-mono">
            <span className="w-14 shrink-0 text-right text-gray-500 dark:text-gray-400 font-medium">
              {formatDuration(val)}
            </span>

            <div className="flex-1 bg-gray-100 dark:bg-[#20242c] rounded h-6 flex items-center p-0.5 overflow-hidden">
              <div
                className={`h-full ${color.bg} ${color.text} rounded flex items-center justify-between px-2.5 transition-all duration-500 shadow-xs`}
                style={{ width: `${pct}%` }}
              >
                <span className="truncate font-sans font-bold text-[11px] tracking-wide">
                  {name}
                </span>
                <span className={`text-[10px] ml-1 shrink-0 ${isUp ? 'text-white' : 'text-white/80'}`}>
                  {isUp ? '▲' : '▼'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
