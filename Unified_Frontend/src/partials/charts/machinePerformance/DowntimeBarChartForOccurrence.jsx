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

export default function DowntimeBarChartForOccurrence({ labels = [], datasets = [] }) {
  const data = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" }, title: { display: false } },
    scales: { x: { stacked: true },
         y: {
      stacked: true,
      beginAtZero: true,
      title: { display: true, text: "Occurrences" },
      ticks: {
        // Make Y-axis show integers starting from 0
        stepSize: 1,
        callback: function(value) {
          return Number(value); // ensures integer display
        }
      }
    },
     },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}
