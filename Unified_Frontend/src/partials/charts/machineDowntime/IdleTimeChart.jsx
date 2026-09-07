import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

Chart.register(ArcElement, Tooltip, Legend);

const IdleTimeChart = ({data}) => {
  const idle = data?.TotalIdleTime_Min || 0;
  const total = data?.TotalTime || 100;
  const remaining = total - idle;

  const chartData = {
    datasets: [
      {
        data: [idle, remaining],
        backgroundColor: ["#FFCD56", "#E0E0E0"],
        cutout: "70%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Idle Time (Total Cumulative)",
      },
    },
  };

  return (
     <div className="bg-white rounded-2xl shadow p-4 h-72 flex flex-col items-center justify-center w-full">
       {/* <h3 className="font-semibold text-gray-700 mb-2">{mode} View</h3> */}
       <Doughnut data={chartData} options={{ plugins: { legend: { display: false }, title: { display: true, text: "Idle Time (Total Cumulative)" } } }} />
        <p className="mt-2 text-gray-600 text-sm">Total IdleTime : <strong>{idle}</strong></p>
     </div>
   );
};

export default IdleTimeChart;
