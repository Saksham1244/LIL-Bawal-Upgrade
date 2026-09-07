import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const DowntimeChart = ({ data, mode }) => {
  const totalDowntime = data?.TotalDownTime || 0;
  const availableTime = data?.AvailableTime || 100;
  const remaining = availableTime - totalDowntime;

  const chartData = {
    datasets: [
      {
        data: [totalDowntime, remaining],
        backgroundColor: ["#FF6384", "#E0E0E0"],
        circumference: 180,
        rotation: 270,
        cutout: "70%",
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 h-72 flex flex-col items-center justify-center w-full">
      {/* <h3 className="font-semibold text-gray-700 mb-2">{mode} View</h3> */}
      <Doughnut data={chartData} options={{ plugins: { legend: { display: false }, title: { display: true, text: "Downtime (Total Cumulative)" } } }} />
      <p className="mt-2 text-gray-600 text-sm">Total DownTime : <strong>{totalDowntime}</strong></p>
    </div>
  );
};

export default DowntimeChart;
