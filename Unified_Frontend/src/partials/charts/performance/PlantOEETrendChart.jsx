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

const PlantOEETrendChart = () => {
  const oeeTrendData = useSelector((state) => state.performance.oeeTrendData);
  const [showOEE, setShowOEE] = useState(true);

  const chartData = useMemo(() => {
    if (!oeeTrendData || oeeTrendData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const xLabels = oeeTrendData.map((item) =>
      item.TrendGroup
        ? item.TrendGroup
        : `${item.HourStart}-${item.HourEnd}`
    );

    const oeeValues = oeeTrendData.map((item) => item.OEE);

    return {
      labels: xLabels,
      datasets: [
        {
          label: "OEE (%)",
          data: oeeValues,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          hidden: !showOEE,
        },
      ],
    };
  }, [oeeTrendData, showOEE]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: { display: false },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time / Group",
          color: "#475569",
          font: { size: 12, weight: "bold" },
        },
        ticks: {
          color: "#475569",
          maxRotation: 0,
          autoSkip: true,
        },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
      y: {
        title: {
          display: true,
          text: "Percentage (%)",
          color: "#475569",
          font: { size: 12, weight: "bold" },
        },
        ticks: { color: "#475569" },
        grid: { color: "rgba(200,200,200,0.2)" },
        beginAtZero: true,
        suggestedMax: 100,
      },
    },
    layout: {
      padding: { top: 10, bottom: 10, left: 10, right: 20 },
    },
  };

  return (
    <div className="text-black bg-white dark:bg-gray-800 dark:text-white rounded-xl p-4 my-2 border border-slate-200 dark:border-[#222632] shadow-xs w-full">
      <h2 className="text-center font-bold text-sm text-slate-800 dark:text-white mb-2">Plant OEE Trend</h2>
      <div className="flex items-center justify-center gap-4 mb-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showOEE}
            onChange={(e) => setShowOEE(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
            OEE (%)
          </span>
        </label>
      </div>
      <div className="h-60 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PlantOEETrendChart;
