import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
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
import { fetchPerformancePlantData } from "../../../services/operations/performancePlantDataAPI";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Title);

const PerformanceTrendChart = () => {
  const dispatch = useDispatch();
  const { performanceTrendData } = useSelector((state) => state.performance);
  const { filters } = useSelector((state) => state);

  const [showExpected, setShowExpected] = useState(true);
  const [showActual, setShowActual] = useState(true);

  useEffect(() => {
    dispatch(fetchPerformancePlantData({ mode: filters.mode || "Shift" }));
  }, [dispatch, filters.mode]);

  const { labels, expectedQty, actualQty } = useMemo(() => {
    if (!performanceTrendData || performanceTrendData.length === 0) {
      return { labels: [], expectedQty: [], actualQty: [] };
    }

    if (performanceTrendData[0]?.HourStart && performanceTrendData[0]?.HourEnd) {
      const labels = performanceTrendData.map(
        (item) => `${item.HourStart} - ${item.HourEnd}`
      );
      const expectedQty = performanceTrendData.map((item) => item.ExpectedQuantity || 0);
      const actualQty = performanceTrendData.map((item) => item.ActualQuantity || 0);
      return { labels, expectedQty, actualQty };
    }

    if (performanceTrendData[0]?.TrendGroup) {
      const labels = performanceTrendData.map((item) => item.TrendGroup);
      const expectedQty = performanceTrendData.map((item) => item.ExpectedQuantity || 0);
      const actualQty = performanceTrendData.map((item) => item.ActualQuantity || 0);
      return { labels, expectedQty, actualQty };
    }

    return { labels: [], expectedQty: [], actualQty: [] };
  }, [performanceTrendData]);

  const data = {
    labels,
    datasets: [
      {
        label: "Expected Quantity",
        data: expectedQty,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56,189,248,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showExpected,
      },
      {
        label: "Actual Quantity",
        data: actualQty,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.2)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        hidden: !showActual,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time / Group",
          color: "#475569",
          font: { size: 12, weight: "bold" },
        },
        ticks: { color: "#475569", maxRotation: 0 },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
      y: {
        title: {
          display: true,
          text: "Quantity",
          color: "#475569",
          font: { size: 12, weight: "bold" },
        },
        beginAtZero: true,
        ticks: { color: "#475569" },
        grid: { color: "rgba(200,200,200,0.2)" },
      },
    },
  };

  return (
    <div className="text-black bg-white dark:bg-gray-800 dark:text-white rounded-xl p-4 my-2 border border-slate-200 dark:border-[#222632] shadow-xs w-full">
      <h2 className="text-center font-bold text-sm text-slate-800 dark:text-white mb-2">Performance Trend</h2>
      <div className="flex items-center justify-center gap-6 mb-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showExpected}
            onChange={(e) => setShowExpected(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-sky-500 focus:ring-sky-500 cursor-pointer accent-sky-500"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
            Expected Quantity
          </span>
        </label>
        <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={showActual}
            onChange={(e) => setShowActual(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
          />
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            Actual Quantity
          </span>
        </label>
      </div>
      <div className="h-60 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PerformanceTrendChart;
