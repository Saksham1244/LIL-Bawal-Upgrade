import React from "react";
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

export default function HorizontalBarChart({ title, labels, values, color }) {
  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: color || "#3498db",
      },
    ],
  };

  const options = {
    indexAxis: "y", // horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };

  return (
    <div className="h-72 border rounded-md p-2 shadow-sm bg-white dark:bg-gray-800">
      <h3 className="font-semibold text-center">{title}</h3>
      <div className="h-[90%]">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
