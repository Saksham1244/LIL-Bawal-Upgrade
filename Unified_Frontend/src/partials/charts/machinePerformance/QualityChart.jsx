import React from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function QualityChart() {
  const { labels, totalQty, rejectedQty, rejectionRate } = useSelector(
    (state) => state.machine.qualityTrend
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Total Quantity",
        data: totalQty,
        backgroundColor: "#4caf50",
      },
      {
        label: "Rejected Quantity",
        data: rejectedQty,
        backgroundColor: "#f44336",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true } },
  };

  const overallRejectionRate =
    rejectionRate.length > 0
      ? (
          rejectionRate.reduce((sum, val) => sum + Number(val), 0) /
          rejectionRate.length
        ).toFixed(2)
      : 0;

  return (
    <div className="rounded-2xl h-80 mt-4 shadow-lg bg-white dark:bg-gray-800 p-4 flex flex-col">
      <div className="text-md font-medium text-black dark:text-white mb-3 text-center">
        Rejection Rate: <span className="font-bold">{overallRejectionRate}%</span>
      </div>
      <div className="flex-1 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
