import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const AvailabilityTrendChart = () => {
  const { availabilityTrendData } = useSelector((state) => state.performance);
  const [showTotalTime, setShowTotalTime] = useState(true);
  const [showTotalDownTime, setShowTotalDownTime] = useState(true);

  const { labels, totalTimeValues, totalDownTimeValues } = useMemo(() => {
    if (!availabilityTrendData || availabilityTrendData.length === 0) {
      return { labels: [], totalTimeValues: [], totalDownTimeValues: [] };
    }

    if (availabilityTrendData[0]?.HourStart && availabilityTrendData[0]?.HourEnd) {
      const labels = availabilityTrendData.map(
        (item) => `${item.HourStart} - ${item.HourEnd}`
      );
      const totalTimeValues = availabilityTrendData.map((item) => item.TotalTime || 0);
      const totalDownTimeValues = availabilityTrendData.map((item) => item.TotalDownTime || 0);
      return { labels, totalTimeValues, totalDownTimeValues };
    }

    if (availabilityTrendData[0]?.TrendGroup) {
      const labels = availabilityTrendData.map((item) => item.TrendGroup);
      const totalTimeValues = availabilityTrendData.map((item) => item.TotalTime || 0);
      const totalDownTimeValues = availabilityTrendData.map((item) => item.TotalDownTime || 0);
      return { labels, totalTimeValues, totalDownTimeValues };
    }

    return { labels: [], totalTimeValues: [], totalDownTimeValues: [] };
  }, [availabilityTrendData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Time",
        data: totalTimeValues,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showTotalTime,
      },
      {
        label: "Total Down Time",
        data: totalDownTimeValues,
        borderColor: "#a855f7",
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showTotalDownTime,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Time / Group", color: "#475569", font: { size: 12, weight: "bold" } },
        ticks: { color: "#475569", maxRotation: 0 },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
      y: {
        title: { display: true, text: "Duration", color: "#475569", font: { size: 12, weight: "bold" } },
        ticks: { color: "#475569" },
        grid: { color: "rgba(200,200,200,0.2)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="text-black bg-white dark:bg-gray-800 dark:text-white rounded-xl p-4 my-2 border border-slate-200 dark:border-[#222632] shadow-xs w-full">
      <h2 className="text-center font-bold text-sm text-slate-800 dark:text-white mb-2">Availability Trend</h2>
      <div className="flex items-center justify-center gap-6 mb-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showTotalTime}
            onChange={(e) => setShowTotalTime(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            Total Time
          </span>
        </label>
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showTotalDownTime}
            onChange={(e) => setShowTotalDownTime(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            Total Down Time
          </span>
        </label>
      </div>
      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default AvailabilityTrendChart;
