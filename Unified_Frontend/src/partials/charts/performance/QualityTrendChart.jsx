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

const QualityTrendChart = () => {
  const { qualityTrendData } = useSelector((state) => state.performance);
  const [showGood, setShowGood] = useState(true);
  const [showRejected, setShowRejected] = useState(true);

  const { labels, goodParts, rejectedParts } = useMemo(() => {
    if (!qualityTrendData || qualityTrendData.length === 0) {
      return { labels: [], goodParts: [], rejectedParts: [] };
    }

    if (qualityTrendData[0]?.HourStart && qualityTrendData[0]?.HourEnd) {
      const labels = qualityTrendData.map(
        (item) => `${item.HourStart} - ${item.HourEnd}`
      );
      const goodParts = qualityTrendData.map((item) => item.GoodQuantity || 0);
      const rejectedParts = qualityTrendData.map((item) => item.RejectedCount || 0);
      return { labels, goodParts, rejectedParts };
    }

    if (qualityTrendData[0]?.TrendGroup) {
      const labels = qualityTrendData.map((item) => item.TrendGroup);
      const goodParts = qualityTrendData.map((item) => item.GoodQuantity || 0);
      const rejectedParts = qualityTrendData.map((item) => item.RejectedCount || 0);
      return { labels, goodParts, rejectedParts };
    }

    return { labels: [], goodParts: [], rejectedParts: [] };
  }, [qualityTrendData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Good Parts",
        data: goodParts,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showGood,
      },
      {
        label: "Rejected Parts",
        data: rejectedParts,
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showRejected,
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
        title: { display: true, text: "Quantity", color: "#475569", font: { size: 12, weight: "bold" } },
        ticks: { color: "#475569" },
        grid: { color: "rgba(200,200,200,0.2)" },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="text-black bg-white dark:bg-gray-800 dark:text-white rounded-xl p-4 my-2 border border-slate-200 dark:border-[#222632] shadow-xs w-full">
      <h2 className="text-center font-bold text-sm text-slate-800 dark:text-white mb-2">Quality Trend</h2>
      <div className="flex items-center justify-center gap-6 mb-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showGood}
            onChange={(e) => setShowGood(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            Good Parts
          </span>
        </label>
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showRejected}
            onChange={(e) => setShowRejected(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            Rejected Parts
          </span>
        </label>
      </div>
      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default QualityTrendChart;
