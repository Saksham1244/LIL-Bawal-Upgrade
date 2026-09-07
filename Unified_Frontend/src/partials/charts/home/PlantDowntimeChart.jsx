import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlantDowntimeChart = () => {
  const filters = useSelector((state) => state.filters);
  const { period } = filters;
  const plantTimes = useSelector((state) => state.plant.plantTimesData);

  // Safely extract first record
  const totalTime = plantTimes[0]?.TotalTime || 0;
  const downtime = plantTimes[0]?.Downtime || 0;
  const idleTime = plantTimes[0]?.IdleTime || 0;
  const npdTime = plantTimes[0]?.NPDTime || 0;

  const runningTime = totalTime - (downtime + idleTime + npdTime);

  const chartData = useMemo(() => {
    return {
      labels: ["Running", "Downtime", "Idle", "NPD"],
      datasets: [
        {
          label: "Time Distribution",
          data: [runningTime, downtime, idleTime, npdTime],
          backgroundColor: ["#6ff542", "red", "#f5ec42", "#6b7bd9"],
        },
      ],
    };
  }, [runningTime, downtime, idleTime, npdTime]);

  const options = useMemo(() => ({
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}`; // Shows value on hover
          },
        },
      },
    },
    maintainAspectRatio: false,
  }), []);

  return (
    <div className="w-full h-52 flex flex-col justify-center items-center">
      <div className="w-full h-full">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PlantDowntimeChart;