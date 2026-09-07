import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TopFiveDowntimeOccurrenceChart = ({ data = [], mode }) => {
  const labels = data.map((item) => item["4MLossName"] || item.LossName || item.LossDesc || "General Stoppage");
const occurrences = data.map((item) => item.OccurrenceCount ?? 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Occurrences",
        data: occurrences,
        backgroundColor: "#FF6384",
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: `Top Five Downtimes by Occurrence`,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Occurrences: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default TopFiveDowntimeOccurrenceChart;
