import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const OperatingVsRunTimeChart = ({ data, mode }) => {
  const operating = data?.OperatingTime || 0;
  const running = data?.RunningTime || 0;
  const remaining = operating - running;

  const chartData = {
    labels: ["Running", "Operating"],
    datasets: [
      {
        data: [running, operating],
        backgroundColor: ["#36A2EB", "#E0E0E0"],
        cutout: "70%",
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 w-full h-72 flex flex-col items-center justify-center">
      {/* <h3 className="font-semibold text-gray-700 mb-2">{mode} View</h3> */}
      <Doughnut data={chartData} options={{ plugins: { legend: { display: false }, title: { display: true, text: "Operating vs Run Time" } } }} />
      <p  className="mt-2 text-gray-600 text-sm">Operating Time <strong>{operating}</strong> : Running Time <strong>{running}</strong> </p>
    </div>
  );
};

export default OperatingVsRunTimeChart;
