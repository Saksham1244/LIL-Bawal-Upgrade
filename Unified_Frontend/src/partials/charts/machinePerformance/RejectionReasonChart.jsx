import React from "react";
import { useSelector } from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function RejectionReasonChart() {
  const { rejectionReasons } = useSelector((state) => state.machine);
  const labels = rejectionReasons.labels || [];
  const values = rejectionReasons.counts || [];

  const data = {
    labels,
    datasets: [
      {
        label: "Rejection Count",
        data: values,
        backgroundColor: "#f87171",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `Count: ${ctx.raw}`,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  const total = values.reduce((a, b) => a + b, 0);
  const topReasonPercent =
    total > 0 ? ((Math.max(...values) / total) * 100).toFixed(1) : 0;

  return (
    <div className="h-72 border rounded-lg p-3 shadow-md bg-white dark:bg-gray-800">
      <div className="h-56">
        {/* <Bar data={data} options={options} /> */}
        <Bar key={labels.join('-')} data={data} options={options} />

      </div>
      <div className="text-center mt-2 text-md text-gray-600 dark:text-gray-300">
        Top Reason Contribution
        {/* :{" "} */}
        {/* <span className="font-bold">{topReasonPercent}%</span> */}
      </div>
    </div>
  );
}
