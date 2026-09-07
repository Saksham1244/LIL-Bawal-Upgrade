import React from "react";
import { useSelector } from "react-redux";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CycleTimeHeatMap = () => {
  const machineTimes = useSelector((state) => state.machine.machineTimes);
  const times = machineTimes?.[0] || {};

  // 🔹 Actual values
  const totalTime = times.TotalTime || 0;
  const downtime = times.Downtime || 0;
  const idleTime = times.IdleTime || 0;
  const npdTime = times.NPDTime || 0;

  // 🔹 Percentages
  const runningPct = times.RunningTimePct || 0;
  const downtimePct = times.DowntimePct || 0;
  const idlePct = times.IdlePct || 0;
  const npdPct = times.NPDPct || 0;
  const totalPct = times.TotalTimePct || 100;

  // 🔹 Bar chart data (percentage values)
  const data = {
    labels: ["Machine Time Breakdown (%)"],
    datasets: [
      {
        label: "Running",
        data: [runningPct],
        backgroundColor: "#22c55e", // green
      },
      {
        label: "Downtime",
        data: [downtimePct],
        backgroundColor: "#ef4444", // red
      },
      {
        label: "Idle",
        data: [idlePct],
        backgroundColor: "#facc15", // yellow
      },
      {
        label: "NPD",
        data: [npdPct],
        backgroundColor: "#9ca3af", // gray
      },
    ],
  };

  // 🔹 Chart config
  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#374151", boxWidth: 15 },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.x.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        beginAtZero: true,
        max: totalPct,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
      y: { stacked: true, display: false },
    },
  };

  return (
    <>
      <h2 className="bg-[#3c51d2] p-3 rounded-lg text-white text-center shadow-sm font-bold text-lg mb-4">
        Cycle Time Heat Map
      </h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 w-full">
        {/* 🔹 Display Actual Values Above */}
        <div className="flex justify-around text-sm font-semibold py-2">
          <span>Total Time: {totalTime}</span>
          <span>Running: {totalTime - (downtime + idleTime + npdTime)}</span>
          <span>Downtime: {downtime}</span>
          <span>Idle: {idleTime}</span>
          <span>NPD: {npdTime}</span>
        </div>

        {/* 🔹 Percentage Bar */}
        <div className="w-full h-20">
          <Bar data={data} options={options} />
        </div>
      </div>
    </>
  );
};

export default CycleTimeHeatMap;
