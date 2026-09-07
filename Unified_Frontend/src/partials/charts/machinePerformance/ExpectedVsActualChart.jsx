import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector } from "react-redux";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function ExpectedVsActualChart() {
  const expectedVsActual = useSelector((s) => s.machine.expectedVsActual || { labels: [], expected: [], actual: [] });
  const labels = expectedVsActual.labels.length ? expectedVsActual.labels : ["No data"];
  const expectedData = expectedVsActual.expected.length ? expectedVsActual.expected : [0];
  const actualData = expectedVsActual.actual.length ? expectedVsActual.actual : [0];

  const data = {
    labels,
    datasets: [
      {
        label: "Expected",
        data: expectedData,
        borderColor: "#00bcd4",
        tension: 0.4,
        fill: false,
      },
      {
        label: "Actual",
        data: actualData,
        borderColor: "#ff9800",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
    scales: { y: { beginAtZero: true } },
  };

  const expectedTotal = expectedData.reduce((a, b) => a + (Number(b) || 0), 0);
  const actualTotal = actualData.reduce((a, b) => a + (Number(b) || 0), 0);
  const performance = expectedTotal === 0 ? "0.0" : ((actualTotal / expectedTotal) * 100).toFixed(1);

  return (
    <div className="rounded-2xl h-80 mt-4 shadow-lg bg-white dark:bg-gray-800 p-4 flex flex-col">
      <div className="text-md font-medium text-black dark:text-white mb-2 text-center">
        Performance: <span className="font-bold">{performance}%</span>
      </div>
      <div className="flex-1 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
