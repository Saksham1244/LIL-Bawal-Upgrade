import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopFiveDowntimeDurationChart = ({ data = [], mode }) => {
  const labels = data.map((item) => item["4MLossName"] || "Unknown");
const durations = data.map((item) => item.TotalDuration ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Duration (min)",
        data: durations,
        backgroundColor: "#36A2EB",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      title: { display: true, text: `Top 5 Downtimes by Duration ` },
      tooltip: {
        callbacks: {
          label: (context) => `Duration: ${context.raw} min`,
        },
      },
    },
    scales: { x: { beginAtZero: true } },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopFiveDowntimeDurationChart;
