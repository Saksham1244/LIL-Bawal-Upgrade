import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function OEEBarChartWithTarget({
  data = [],
  target = 70,
  height = 180,
}) {
  const chartData = data && data.length > 0 ? data : [
    { label: '01', value: 68 },
    { label: '03', value: 72 },
    { label: '05', value: 70 },
    { label: '07', value: 65 },
    { label: '09', value: 74 },
    { label: '11', value: 78 },
    { label: '13', value: 71 },
    { label: '15', value: 69 },
    { label: '17', value: 75 },
    { label: '19', value: 77 },
    { label: '21', value: 64 },
    { label: '23', value: 73 },
    { label: '25', value: 76 },
  ];

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155', opacity: 0.5 }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#334155', opacity: 0.5 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e222b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f8fafc',
            }}
            formatter={(val) => [`${val}%`, 'OEE']}
          />
          <ReferenceLine
            y={target}
            stroke="#cbd5e1"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `Target: ${target}%`,
              fill: '#94a3b8',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
          <Bar dataKey="value" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= target ? '#10b981' : '#64748b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
