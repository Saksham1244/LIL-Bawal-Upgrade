import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend, Title } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend, Title);

const NoProductionTimeChart = ({ data }) => {
  // ✅ match API response field names
  const mode = data?.Mode || "N/A";
  const noProd = data?.TotalNoProductionHours || 0;
  const total = 24; // assume total hours per day; adjust if needed
  const remaining = Math.max(total - noProd, 0);

  const chartData = {
    labels: ["No Production", "Remaining"],
    datasets: [
      {
        data: [noProd, remaining],
        backgroundColor: ["#4BC0C0", "#E0E0E0"],
        cutout: "70%",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: true, position: "bottom" },
      title: {
        display: true,
        text: `No Production Time`,
        font: { size: 16, weight: "bold" },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-72 flex flex-col items-center justify-center w-full">
      <Doughnut data={chartData} options={options} />
      <p className="mt-2 text-gray-600 text-sm">
        Total Hours: <strong>{total}</strong> | No Prod:{" "}
        <strong>{noProd}</strong>
      </p>
    </div>
  );
};

export default NoProductionTimeChart;
